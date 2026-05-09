/* ── Parse GWSD from multiple sources ──
 *
 * Three extraction paths:
 *   1. Tagged:      [gwsd]...[/gwsd] blocks (original, most precise)
 *   2. Structural:  Detect scenes from headers + sidebars, heuristic GWSD (no AI)
 *   3. AI-Assisted: Scene detection + LLM distillation via prompt template
 *
 * smartParse() cascades: Tagged → Structural, returning whichever succeeds.
 */

import type {
  ActiveGWSDBody,
  ContentType,
  GWSDBody,
  GWSDScope,
  GWSDCard,
  GWSDState,
  NarrativeDepth,
  Scene,
  SceneChunk,
} from './types';
import { ACTIVE_STATE_ORDER, LATENT_STATE_ORDER, isLatentBody } from './types';
import { detectScenes } from './sceneDetector';
import { heuristicGWSD, qualifyGWSD } from './aiExtractor';
import { buildSilhouetteProjection } from './silhouetteAdapter';

let idCounter = 0;
function uid(): string {
  return `gwsd_${Date.now()}_${++idCounter}`;
}

const DIAGNOSTICS_DOC_HINTS = [
  'narrative diagnostics report',
  'signal summary',
  'total signals',
  'suggested fix:',
  'severity:',
  'confidence:',
  'diagnosis:',
  'evidence:',
  '## findings',
  '### 1.',
];

function looksLikeDiagnosticsDocument(text: string): boolean {
  const lower = text.toLowerCase();
  let hitCount = 0;
  for (const hint of DIAGNOSTICS_DOC_HINTS) {
    if (lower.includes(hint)) hitCount += 1;
  }
  return hitCount >= 4;
}

function looksLikeDiagnosticsChunk(chunk: SceneChunk): boolean {
  const block = `${chunk.title}\n${chunk.prose}\n${chunk.raw}`.toLowerCase();
  const hasFindingsTitle = /\bfindings\b/.test(block);
  const hasAuditMarkers =
    /\bseverity\s*:/.test(block) &&
    /\bconfidence\s*:/.test(block) &&
    /\bdiagnosis\s*:/.test(block);
  return hasFindingsTitle || hasAuditMarkers;
}

/* ════════════════════════════════════════════════════════
 * CONTENT-TYPE CLASSIFICATION
 *
 * Classifies each SceneChunk before GWSD extraction:
 *   SCENE_STATE: interactable situation (opposing intent, trigger,
 *                time pressure, or permission change)
 *   REFERENCE:   stat blocks, bestiary entries, item/tool descriptions,
 *                keys, mechanism explanations without scene context
 *   DIAGNOSTIC:  audit/linter output (severity, confidence, diagnosis)
 * ════════════════════════════════════════════════════════ */

/** Signals that a block is a reference/bestiary entry, not a runnable scene. */
const REFERENCE_SIGNALS: RegExp[] = [
  // Stat-block structural markers
  /\b(?:AC|HP|Hit Points|Init|Base Atk|CMB|CMD|Speed)\s+[+\-]?\d+/i,
  /\b(?:Str|Dex|Con|Int|Wis|Cha)\s+\d+\s*[,;]/i,
  /\b(?:CR\s+\d|XP\s+[\d,])/i,
  /\b(?:NE|CE|LE|LG|NG|CG|LN|CN|N)\s+(?:Tiny|Small|Medium|Large|Huge)\s+\w+/i,
  /\bFeats?\s+(?:Improved|Toughness|Weapon\s+Focus|Great|Power\s+Attack)/i,
  /\bSkills?\s+(?:Climb|Perception|Stealth|Swim|Acrobatics)\s+[+\-]?\d+/i,
  // Monster manual / bestiary patterns
  /\b(?:use\s+\w+\s+stats?)\b/i,
  /\b(?:Telepathy|Darkvision|Blindsight|Tremorsense)\s+\d+/i,
  /\bSwarm\s+traits?\b/i,
  /\b\((?:Ex|Su|Sp)\)\b/,
  // Item/key/tool reference patterns (long lists of properties)
  /\b(?:Special\s+Abilities|DEFENSE|OFFENSE|STATISTICS|SPECIAL\s+ABILITIES)\b/,
  /\b(?:Melee|Ranged)\s+[^.]{5,}\s+[+\-]\d+/i,
  // Pre-gen / NPC compendium entry markers
  /\b(?:See Appendix|Encountered in Area)\b/i,
  // Random-table / inventory reference markers
  /\b(?:d4|d6|d8|d10|d12|d20|d100)\b/i,
  /\b(?:roll(?:s|ed|ing)?|result|entries?|treasure|loot|gear|supplies|weapons?|ammunition|potions?|scrolls?|alchemical|inventory|contents?)\b/i,
  /\b(?:Table\s+\d+|Table\s*\(|\(d\d+\)|\bd\d+\s*table)\b/i,
];

/** Signals that a block is a runnable scene (has interactive situation). */
const SCENE_STATE_SIGNALS: RegExp[] = [
  // Opposing intent / agent action
  /\b(?:wants?|intends?|seeks?|tries?|lures?|hunts?|stalks?|guards?|demands?)\b/i,
  // Conditional trigger
  /\bif\s+(?:the\s+)?(?:party|players?|characters?|PCs?|they)\b/i,
  // Time / escalation pressure
  /\b(?:worsen|escalat|intensif|decay|spread|close[sd]?\s+in|time\s+(?:runs?|is\s+running))\b/i,
  // Permission change
  /\b(?:unlock|reveal|block|collapse|seal|open|flood|release|trigger)\b/i,
  // Read-aloud text (strong scene marker)
  /^>\s*\*/m,
  // Sidebar with narrative content (strong scene marker)
  /\[sidebar\]/i,
  /\[Sidebar\s+Start\]/i,
];

const REFERENCE_TITLE_PATTERNS: RegExp[] = [
  /\btable\b/i,
  /\((?:d4|d6|d8|d10|d12|d20|d100)\)/i,
  /\b(?:gear|supplies|weapons?|ammunition|potions?|scrolls?|alchemical|treasure|loot|stash)\b/i,
  /\((?:Magical\s+Beast|Aberration|Animal|Construct|Dragon|Elemental|Fey|Humanoid|Monstrosity|Ooze|Plant|Undead|Vermin)\)/i,
];

function shortReferenceLineCount(lines: string[]): number {
  let count = 0;
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (trimmed.length <= 72) count += 1;
  }
  return count;
}

function listLikeLineCount(lines: string[]): number {
  let count = 0;
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (/^(?:[-*]|\d+[.)]|[A-Za-z][A-Za-z '\-]+:|\*\*[^*]+\*\*:)/.test(trimmed)) count += 1;
  }
  return count;
}

function looksLikeReferenceTitle(title: string): boolean {
  return REFERENCE_TITLE_PATTERNS.some((re) => re.test(title));
}

function looksLikeReferenceBlock(chunk: SceneChunk): boolean {
  const lines = chunk.raw.split('\n').filter((line) => line.trim().length > 0);
  if (lines.length === 0) return false;

  const shortLineRatio = shortReferenceLineCount(lines) / lines.length;
  const listLikeRatio = listLikeLineCount(lines) / lines.length;
  const hasDenseDiceOrCurrency = /\b(?:d4|d6|d8|d10|d12|d20|d100|gp|sp|cp|pp)\b/i.test(chunk.raw);
  const hasCreatureTypeTitle = /\((?:Magical\s+Beast|Aberration|Animal|Construct|Dragon|Elemental|Fey|Humanoid|Monstrosity|Ooze|Plant|Undead|Vermin)\)/i.test(chunk.title);

  if (looksLikeReferenceTitle(chunk.title)) return true;
  if (hasCreatureTypeTitle) return true;
  if (hasDenseDiceOrCurrency && listLikeRatio >= 0.25) return true;
  if (shortLineRatio >= 0.6 && listLikeRatio >= 0.35) return true;
  return false;
}

/**
 * Classify a scene chunk into one of three content types.
 * Returns 'scene_state', 'reference', or 'diagnostic'.
 */
export function classifyChunk(chunk: SceneChunk): ContentType {
  // Diagnostics takes priority — already detectable
  if (looksLikeDiagnosticsChunk(chunk)) return 'diagnostic';
  if (looksLikeReferenceBlock(chunk)) return 'reference';

  const block = `${chunk.title}\n${chunk.prose}\n${chunk.sidebars.join('\n')}\n${chunk.raw}`;

  // Count reference signals vs scene signals
  let refHits = 0;
  for (const re of REFERENCE_SIGNALS) {
    if (re.test(block)) refHits++;
  }

  let sceneHits = 0;
  for (const re of SCENE_STATE_SIGNALS) {
    if (re.test(block)) sceneHits++;
  }

  // Heavy stat-block content with weak scene signals → reference
  if (refHits >= 3 && sceneHits <= 1) return 'reference';
  // Moderate stat content, zero scene signals → reference
  if (refHits >= 2 && sceneHits === 0) return 'reference';
  // Title patterns that indicate reference material
  if (/\b(?:CR\s+\d|\((?:Ex|Su|Sp)\))/.test(chunk.title)) return 'reference';
  if (looksLikeReferenceTitle(chunk.title)) return 'reference';

  return 'scene_state';
}

/* ════════════════════════════════════════════════════════
 * POST-EXTRACTION GWSD VALIDATORS
 *
 * Three hard rules that prevent "GWSD soup":
 *   1. Duplication: Ground≈Shift or Will≈Drift → needs-rewrite
 *   2. Placeholder ban: Drift can't be generic fallback
 *   3. Will agent requirement: Will must name an agent
 * ════════════════════════════════════════════════════════ */

function jaccard(a: string, b: string): number {
  const words = (t: string) =>
    new Set(t.toLowerCase().replace(/[^a-z\s]/g, ' ').split(/\s+/).filter(w => w.length > 2));
  const setA = words(a);
  const setB = words(b);
  if (setA.size === 0 && setB.size === 0) return 1;
  if (setA.size === 0 || setB.size === 0) return 0;
  let overlap = 0;
  for (const w of setA) if (setB.has(w)) overlap++;
  return overlap / new Set([...setA, ...setB]).size;
}

const GENERIC_DRIFT_PLACEHOLDERS = [
  'pressure escalates',
  'scene worsens',
  'the scene worsens',
  'pressure escalates and the scene worsens',
];

const WILL_AGENT_PATTERNS = [
  /\b(?:he|she|they|it|the\s+\w+)\s+(?:wants?|intends?|seeks?|tries?|plans?|hunts?|lures?|guards?|demands?|insists?|stalks?|prowls?)\b/i,
  /\b(?:wants?|intends?|seeks?|tries?|plans?|hunts?|lures?|guards?|demands?|insists?|stalks?)\s+(?:to|the|their|food|prey)\b/i,
  /\b(?:purpose|goal|mission|agenda|objective)\b/i,
  // Named agents or creature references
  /\b(?:grod|mullock|seneschal|architect|worm|cat|tomcat|lampriel|rats?|creature|npc|monster|swarm|beast)\b/i,
  // Agentive systems (mechanisms with will)
  /\b(?:mechanism|hinge|trap|device|system)\s+(?:dumps?|drives?|forces?|pushes?|pulls?)\b/i,
];

const VAGUE_TRIGGER_PATTERNS = [
  /\b(?:might|maybe|possibly|perhaps|if\s+lucky|something\s+feels\s+off|something\s+seems\s+wrong)\b/i,
  /\b(?:notice\s+something\s+odd|the\s+gm\s+decides|when\s+appropriate)\b/i,
];

const GENERIC_ACCUMULATION_PLACEHOLDERS = [
  'tension builds',
  'pressure builds',
  'things get worse',
  'the scene worsens',
  'suspicion rises',
];

export interface GWSDValidation {
  valid: boolean;
  warnings: string[];
}

/**
 * Validate a GWSD body against hard quality rules.
 * Returns validation result with specific warnings.
 */
export function validateGWSDBody(body: GWSDBody): GWSDValidation {
  const warnings: string[] = [];

  if (isLatentBody(body)) {
    if (body.ground && body.trigger && jaccard(body.ground, body.trigger) > 0.75) {
      warnings.push('GROUND ≈ TRIGGER duplication (>75% overlap) — trigger should release, not restate, the present state');
    }

    if (!body.accumulation.trim()) {
      warnings.push('ACCUMULATION is empty — latent pressure needs a visible build vector');
    }

    const accumulationLower = body.accumulation.toLowerCase().trim();
    for (const placeholder of GENERIC_ACCUMULATION_PLACEHOLDERS) {
      if (accumulationLower.includes(placeholder)) {
        warnings.push(`ACCUMULATION uses generic placeholder ("${placeholder}") — needs concrete mounting pressure`);
        break;
      }
    }

    for (const re of VAGUE_TRIGGER_PATTERNS) {
      if (re.test(body.trigger)) {
        warnings.push('TRIGGER is vague — state the exact discovery, commitment, or event that releases the latent pressure');
        break;
      }
    }

    return { valid: warnings.length === 0, warnings };
  }

  // Rule 1: Duplication check
  if (body.ground && body.shift && jaccard(body.ground, body.shift) > 0.75) {
    warnings.push('GROUND ≈ SHIFT duplication (>75% overlap) — needs rewrite');
  }
  if (body.will && body.drift && jaccard(body.will, body.drift) > 0.75) {
    warnings.push('WILL ≈ DRIFT duplication (>75% overlap) — needs rewrite');
  }

  // Rule 2: Placeholder ban for Drift
  const driftLower = body.drift.toLowerCase().trim();
  for (const placeholder of GENERIC_DRIFT_PLACEHOLDERS) {
    if (driftLower.includes(placeholder)) {
      warnings.push(`DRIFT uses generic placeholder ("${placeholder}") — needs concrete escalator`);
      break;
    }
  }

  // Rule 3: Will must name an agent or agentive system
  if (body.will) {
    let hasAgent = false;
    for (const re of WILL_AGENT_PATTERNS) {
      if (re.test(body.will)) { hasAgent = true; break; }
    }
    if (!hasAgent) {
      warnings.push('WILL lacks identifiable agent — consider Hazard mode (Will=environmental)');
    }
  }

  return { valid: warnings.length === 0, warnings };
}

function parseLabeledKernelBody(raw: string): GWSDBody {
  const hasLatentLabels = /\bTRIGGER\s*:|\bACCUMULATION\s*:/i.test(raw);

  const getState = (label: 'GROUND' | 'WILL' | 'SHIFT' | 'DRIFT', next?: string): string => {
    const tail = next ? `(?=\\n\\s*${next}\\s*:)` : '$';
    const re = new RegExp(`${label}\\s*:\\s*([\\s\\S]*?)${tail}`, 'i');
    const m = raw.match(re);
    return (m?.[1] || '').replace(/\s+/g, ' ').trim();
  };

  if (hasLatentLabels) {
    const getLatentState = (label: 'GROUND' | 'WILL' | 'TRIGGER' | 'ACCUMULATION' | 'REVEAL', next?: string): string => {
      const tail = next ? `(?=\\n\\s*${next}\\s*:)` : '$';
      const re = new RegExp(`${label}\\s*:\\s*([\\s\\S]*?)${tail}`, 'i');
      const m = raw.match(re);
      return (m?.[1] || '').replace(/\s+/g, ' ').trim();
    };

    return {
      stateType: 'latent',
      ground: getLatentState('GROUND', 'WILL'),
      will: getLatentState('WILL', 'TRIGGER'),
      trigger: getLatentState('TRIGGER', 'ACCUMULATION'),
      accumulation: getLatentState('ACCUMULATION', 'REVEAL'),
      reveal: getLatentState('REVEAL') || undefined,
    };
  }

  return {
    stateType: 'active',
    ground: getState('GROUND', 'WILL'),
    will: getState('WILL', 'SHIFT'),
    shift: getState('SHIFT', 'DRIFT'),
    drift: getState('DRIFT'),
  };
}

function createCardsFromBody(
  sceneId: string,
  body: GWSDBody,
  source: GWSDCard['source'],
  cardRegister?: Partial<Record<GWSDState, string>>,
): [GWSDCard, GWSDCard, GWSDCard, GWSDCard] {
  if (isLatentBody(body)) {
    return LATENT_STATE_ORDER.map((state) => ({
      id: uid(),
      sceneId,
      stateType: 'latent' as const,
      state,
      text: body[state],
      cardText: cardRegister?.[state] || undefined,
      source,
    })) as [GWSDCard, GWSDCard, GWSDCard, GWSDCard];
  }

  return ACTIVE_STATE_ORDER.map((state) => ({
    id: uid(),
    sceneId,
    stateType: 'active' as const,
    state,
    text: body[state],
    cardText: cardRegister?.[state] || undefined,
    source,
  })) as [GWSDCard, GWSDCard, GWSDCard, GWSDCard];
}

function createSceneRecord(args: {
  sceneId: string;
  title: string;
  adventure: string;
  order: number;
  body: GWSDBody;
  cards: [GWSDCard, GWSDCard, GWSDCard, GWSDCard];
  raw: string;
  scope?: GWSDScope;
  contentType?: ContentType;
  validationWarnings?: string[];
}): Scene {
  const {
    sceneId,
    title,
    adventure,
    order,
    body,
    cards,
    raw,
    scope,
    contentType,
    validationWarnings,
  } = args;

  return {
    id: sceneId,
    title,
    adventure,
    order,
    stateType: body.stateType,
    cards,
    raw,
    scope,
    contentType,
    validationWarnings,
    silhouette: buildSilhouetteProjection({
      id: sceneId,
      title,
      adventure,
      body,
      raw,
      scope,
    }),
  };
}

function bodyFromSentenceSequence(sentences: string[]): ActiveGWSDBody {
  return {
    stateType: 'active',
    ground: sentences[0] || '',
    will: sentences[1] || '',
    shift: sentences[2] || '',
    drift: sentences.length > 4 ? sentences.slice(3).join(' ') : (sentences[3] || ''),
  };
}

/**
 * Detect hierarchical scope from heading structure.
 * Hoskbrew convention: H1 → act, H2 → scene, H3 → state, H4 → skip (stat blocks).
 * Returns a scope for the heading nearest above the given line index.
 */
function detectScope(
  lines: string[],
  lineIdx: number,
): GWSDScope | undefined {
  const DEPTH_MAP: Record<number, NarrativeDepth> = { 1: 'act', 2: 'scene', 3: 'state' };
  const LABELS: Record<NarrativeDepth, string> = {
    campaign: 'CAMPAIGN',
    act: 'ACT',
    scene: 'SCENE',
    state: 'STATE',
  };

  // Build ancestor chain by walking upward through headings
  const ancestors: Array<{ depth: NarrativeDepth; title: string; level: number }> = [];
  let nearestLevel = 0;

  for (let i = lineIdx; i >= 0; i--) {
    const m = lines[i].match(/^(#{1,3})\s+(.+)/);
    if (m) {
      const level = m[1].length;
      const depth = DEPTH_MAP[level] || 'scene';
      const title = m[2].trim();

      // Only collect if this is a higher (or equal, for nearest) level than what we've seen
      if (nearestLevel === 0) {
        nearestLevel = level;
        ancestors.unshift({ depth, title, level });
      } else if (level < nearestLevel) {
        ancestors.unshift({ depth, title, level });
        nearestLevel = level;
      }
      if (level === 1) break; // reached top
    }
  }

  if (ancestors.length === 0) return undefined;

  const current = ancestors[ancestors.length - 1];
  const banner = ancestors
    .map((a) => `${LABELS[a.depth]} — ${a.title}`)
    .join(' / ');

  return {
    depth: current.depth,
    banner,
    breadcrumb: ancestors.map((a) => ({ depth: a.depth, title: a.title })),
  };
}

/**
 * Extract all [gwsd] blocks from markdown text.
 * Returns scenes with four cards each (Ground → Will → Shift → Drift).
 *
 * Supports:
 *   1. Unlabeled: four sentences in a paragraph (sentence order = GWSD order)
 *   2. Titled: "(Scene Title): four sentences..."
 *   3. Dual-register: [CARD:GROUND] fragments alongside book prose
 *
 * Detects hierarchical scope from heading structure above each block.
 */
export function parseGWSDFromMarkdown(
  text: string,
  adventureName = 'Adventure',
): Scene[] {
  const scenes: Scene[] = [];
  const GWSD_RE = /\[gwsd\]\s*([\s\S]*?)\s*\[\/gwsd\]/gi;

  // Also scan for nearby headings to assign scene titles
  const lines = text.split('\n');
  const headingMap = new Map<number, string>(); // line index → heading text
  lines.forEach((line, idx) => {
    const m = line.match(/^#{1,4}\s+(.+)/);
    if (m) headingMap.set(idx, m[1].trim());
  });

  let match: RegExpExecArray | null;
  let order = 0;

  while ((match = GWSD_RE.exec(text)) !== null) {
    const raw = match[1].trim();
    const matchPos = match.index;

    // Find the line index of this match for heading lookup
    const textBefore = text.substring(0, matchPos);
    const lineIdx = textBefore.split('\n').length - 1;

    // Look for nearest heading above this block
    let nearestHeading = '';
    for (let i = lineIdx; i >= Math.max(0, lineIdx - 20); i--) {
      if (headingMap.has(i)) {
        nearestHeading = headingMap.get(i)!;
        break;
      }
    }

    // Check for parenthesized title prefix: "(The Approach):"
    let title = nearestHeading;
    let bodyText = raw;
    const titleMatch = raw.match(/^\(([^)]+)\):?\s*/);
    if (titleMatch) {
      title = titleMatch[1];
      bodyText = raw.substring(titleMatch[0].length).trim();
    }

    // Split into sentences
    const sentences = bodyText
      .replace(/\n+/g, ' ')
      .split(/(?<=\.)\s+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const sceneId = uid();

    // Check for card-register annotations: [CARD:GROUND] ... etc.
    const cardRegister: Partial<Record<GWSDState, string>> = {};
    const cardRe = /\[CARD:(GROUND|WILL|SHIFT|DRIFT|TRIGGER|ACCUMULATION)\]\s*(.+)/gi;
    let cardMatch: RegExpExecArray | null;
    while ((cardMatch = cardRe.exec(raw)) !== null) {
      cardRegister[cardMatch[1].toLowerCase() as GWSDState] = cardMatch[2].trim();
    }

    const parsedBody = /(^|\n)\s*(?:GROUND|WILL|SHIFT|DRIFT|TRIGGER|ACCUMULATION)\s*:/i.test(bodyText)
      ? qualifyGWSD(parseLabeledKernelBody(bodyText), raw)
      : qualifyGWSD(bodyFromSentenceSequence(sentences), raw);
    const cards = createCardsFromBody(sceneId, parsedBody, 'parsed', cardRegister);

    // Detect hierarchical scope from heading structure
    const scope = detectScope(lines, lineIdx);
    const validation = validateGWSDBody(parsedBody);

    scenes.push(createSceneRecord({
      sceneId,
      title: title || `Scene ${order + 1}`,
      adventure: adventureName,
      order: order++,
      body: parsedBody,
      cards,
      raw,
      scope,
      validationWarnings: validation.warnings,
    }));
  }

  return scenes;
}

/**
 * Extract [GWSD_KERNEL] blocks (labeled runtime skeleton).
 */
export function parseGWSDKernelFromMarkdown(
  text: string,
  adventureName = 'Adventure',
): Scene[] {
  const scenes: Scene[] = [];
  const KERNEL_RE = /\[gwsd_kernel\]\s*([\s\S]*?)\s*\[\/gwsd_kernel\]/gi;

  const lines = text.split('\n');
  const headingMap = new Map<number, string>();
  lines.forEach((line, idx) => {
    const m = line.match(/^#{1,4}\s+(.+)/);
    if (m) headingMap.set(idx, m[1].trim());
  });

  let match: RegExpExecArray | null;
  let order = 0;

  while ((match = KERNEL_RE.exec(text)) !== null) {
    const raw = match[1].trim();
    const matchPos = match.index;
    const textBefore = text.substring(0, matchPos);
    const lineIdx = textBefore.split('\n').length - 1;

    let nearestHeading = '';
    for (let i = lineIdx; i >= Math.max(0, lineIdx - 20); i--) {
      if (headingMap.has(i)) {
        nearestHeading = headingMap.get(i)!;
        break;
      }
    }

    const parsed = qualifyGWSD(parseLabeledKernelBody(raw), raw);
    const sceneId = uid();
    const cards = createCardsFromBody(sceneId, parsed, 'parsed');

    const scope = detectScope(lines, lineIdx);
    const validation = validateGWSDBody(parsed);

    scenes.push(createSceneRecord({
      sceneId,
      title: nearestHeading || `Scene ${order + 1}`,
      adventure: adventureName,
      order: order++,
      body: parsed,
      cards,
      raw,
      scope,
      validationWarnings: validation.warnings,
    }));
  }

  return scenes;
}

/* ════════════════════════════════════════════════════════
 * STRUCTURAL PARSE — headers + sidebar heuristic
 * ════════════════════════════════════════════════════════ */

/**
 * Extract GWSD from structural analysis (sidebars + headers).
 * No AI needed — uses heuristic sentence mapping for sidebar content,
 * and falls back to prose heuristic for scenes without sidebars.
 */
export function parseFromStructure(
  text: string,
  adventureName = 'Adventure',
  options?: { allowDiagnosticsInput?: boolean },
): Scene[] {
  if (!options?.allowDiagnosticsInput && looksLikeDiagnosticsDocument(text)) {
    return [];
  }

  const chunks = detectScenes(text);
  const scenes: Scene[] = [];

  for (const chunk of chunks) {
    if (!options?.allowDiagnosticsInput && looksLikeDiagnosticsChunk(chunk)) {
      continue;
    }

    // Content-type routing: only SCENE_STATE blocks produce GWSD cards
    const contentType = classifyChunk(chunk);
    if (contentType !== 'scene_state') {
      continue;
    }

    // Prefer sidebar content for GWSD extraction
    if (chunk.sidebars.length > 0) {
      for (let s = 0; s < chunk.sidebars.length; s++) {
        const body = qualifyGWSD(
          heuristicGWSD(chunk.sidebars[s]),
          `${chunk.sidebars[s]}\n\n${chunk.prose}\n\n${chunk.readAlouds.join(' ')}`,
        );
        // Skip if heuristic produced nothing useful
        if (!body.ground && !body.will) continue;

        const sceneId = uid();
        const suffix = chunk.sidebars.length > 1 ? ` (${s + 1})` : '';
        const cards = createCardsFromBody(sceneId, body, 'hoskbrew');

        const scope: GWSDScope = {
          depth: chunk.depth,
          banner: [...chunk.ancestors, { depth: chunk.depth, title: chunk.title }]
            .map((a) => `${a.depth.toUpperCase()} — ${a.title}`)
            .join(' / '),
          breadcrumb: [...chunk.ancestors, { depth: chunk.depth, title: chunk.title }],
        };

        const validation = validateGWSDBody(body);

        scenes.push(createSceneRecord({
          sceneId,
          title: chunk.title + suffix,
          adventure: adventureName,
          order: scenes.length,
          body,
          cards,
          raw: chunk.sidebars[s],
          scope,
          contentType: 'scene_state',
          validationWarnings: validation.warnings,
        }));
      }
    } else {
      // No sidebar — try heuristic on prose
      const body = qualifyGWSD(
        heuristicGWSD(chunk.prose),
        `${chunk.prose}\n\n${chunk.readAlouds.join(' ')}`,
      );
      if (!body.ground && !body.will) continue;

      const sceneId = uid();
      const cards = createCardsFromBody(sceneId, body, 'parsed');

      const scope: GWSDScope = {
        depth: chunk.depth,
        banner: [...chunk.ancestors, { depth: chunk.depth, title: chunk.title }]
          .map((a) => `${a.depth.toUpperCase()} — ${a.title}`)
          .join(' / '),
        breadcrumb: [...chunk.ancestors, { depth: chunk.depth, title: chunk.title }],
      };

      const validation = validateGWSDBody(body);

      scenes.push(createSceneRecord({
        sceneId,
        title: chunk.title,
        adventure: adventureName,
        order: scenes.length,
        body,
        cards,
        raw: chunk.prose,
        scope,
        contentType: 'scene_state',
        validationWarnings: validation.warnings,
      }));
    }
  }

  return scenes;
}

/* ════════════════════════════════════════════════════════
 * SMART PARSE — cascading: tagged → structural
 * ════════════════════════════════════════════════════════ */

/**
 * Extract scenes from the Canonical Markdown export format.
 */
export function parseCanonicalMarkdown(text: string, adventureName = 'Adventure'): Scene[] {
  const scenes: Scene[] = [];
  const sceneBlocks = text.split(/(?=^# [^\n]+$)/m).filter(b => b.trim().length > 0);

  let order = 0;
  for (const block of sceneBlocks) {
    const titleMatch = block.match(/^# ([^\n]+)/m);
    if (!titleMatch) continue;
    const title = titleMatch[1].trim();

    const isLatent = block.includes('## Hidden Pressure') || block.includes('## Trigger');
    
    // Check if it has at least ## Ground to be considered a GWSD block
    if (!block.includes('## Ground')) continue;

    const extractSection = (header: RegExp) => {
      const parts = block.split(header);
      if (parts.length < 2) return '';
      let section = parts[1];
      // Splitting by the next header H2
      section = section.split(/^## /m)[0];
      return section.trim();
    };

    let parsedBody: GWSDBody;
    if (isLatent) {
      parsedBody = qualifyGWSD({
        stateType: 'latent',
        ground: extractSection(/^## Ground\s*$/m),
        will: extractSection(/^## (?:Will \| )?Hidden Pressure\s*$/m),
        trigger: extractSection(/^## Trigger\s*$/m),
        accumulation: extractSection(/^## Accumulation\s*$/m),
        reveal: extractSection(/^## Reveal Condition\s*$/m) || undefined,
      }, block);
    } else {
      parsedBody = qualifyGWSD({
        stateType: 'active',
        ground: extractSection(/^## Ground\s*$/m),
        will: extractSection(/^## Will\s*$/m),
        shift: extractSection(/^## Shift\s*$/m),
        drift: extractSection(/^## Drift\s*$/m),
      }, block);
    }

    const sceneId = uid();
    const cards = createCardsFromBody(sceneId, parsedBody, 'parsed');
    const validation = validateGWSDBody(parsedBody);

    scenes.push(createSceneRecord({
      sceneId,
      title,
      adventure: adventureName,
      order: order++,
      body: parsedBody,
      cards,
      raw: block.trim(),
      validationWarnings: validation.warnings,
    }));
  }
  return scenes;
}

export type DetectedMode = 'tagged' | 'structural';

export interface SmartParseOptions {
  forceStructural?: boolean;
}

/**
 * Auto-detect the best extraction path and return scenes + mode used.
 *
 *   1. If text contains [gwsd] blocks → use tagged extraction
 *   2. Otherwise → use structural detection (headers + sidebars / prose heuristic)
 */
export function smartParse(
  text: string,
  adventureName = 'Adventure',
  options?: SmartParseOptions,
): { scenes: Scene[]; mode: DetectedMode } {
  // First attempt: Canonical Markdown Export
  const canonical = parseCanonicalMarkdown(text, adventureName);
  if (canonical.length > 0) {
    return { scenes: canonical, mode: 'tagged' };
  }

  // Second attempt: explicit [gwsd] tags
  const tagged = parseGWSDFromMarkdown(text, adventureName);
  if (tagged.length > 0) {
    return { scenes: tagged, mode: 'tagged' };
  }

  // Second attempt: explicit [GWSD_KERNEL] blocks
  const kernel = parseGWSDKernelFromMarkdown(text, adventureName);
  if (kernel.length > 0) {
    return { scenes: kernel, mode: 'tagged' };
  }

  // Fallback: structural detection
  const structural = parseFromStructure(text, adventureName, {
    allowDiagnosticsInput: options?.forceStructural === true,
  });
  return { scenes: structural, mode: 'structural' };
}

/* ════════════════════════════════════════════════════════
 * AI RESULT → SCENES
 * ════════════════════════════════════════════════════════ */

/**
 * Convert pre-extracted AI results into Scene objects.
 * Used when the user runs AI prompts externally and pastes GWSD responses.
 */
export function scenesFromAIResults(
  chunks: SceneChunk[],
  bodies: GWSDBody[],
  adventureName = 'Adventure',
): Scene[] {
  return chunks.map((chunk, idx) => {
    const body = bodies[idx] || { stateType: 'active', ground: '', will: '', shift: '', drift: '' };
    const sceneId = uid();
    const cards = createCardsFromBody(sceneId, body, 'ai');

    const scope: GWSDScope = {
      depth: chunk.depth,
      banner: [...chunk.ancestors, { depth: chunk.depth, title: chunk.title }]
        .map((a) => `${a.depth.toUpperCase()} — ${a.title}`)
        .join(' / '),
      breadcrumb: [...chunk.ancestors, { depth: chunk.depth, title: chunk.title }],
    };

    return createSceneRecord({
      sceneId,
      title: chunk.title,
      adventure: adventureName,
      order: idx,
      body,
      cards,
      raw: chunk.raw,
      scope,
    });
  });
}
