/* ── AI Extractor — Pass B: GWSD State Distillation ──
 *
 * GWSD (Ground-Will-Shift-Drift) is the Guide-side runtime compression layer
 * inside Silhouette RPG. It pre-digests a scene's spatial and narrative logic
 * so the Guide does not have to extract it from dense prose. It identifies
 * what the space is doing under pressure — how movement flows, where tension
 * accumulates, what changes if the party advances or stalls — and presents
 * that as an operational snapshot. It does not add rules; it replaces the
 * cognitive work of deriving function from description.
 *
 * This module transforms scene prose into G/W/S/D states using:
 *   1. Heuristic: sentence-level mapping from sidebar text (no AI needed)
 *   2. AI-Assisted: LLM prompt template for complex prose extraction
 *
 * Also provides:
 *   - Mechanics stripping (dice, DCs, attack bonuses, HP, AC)
 *   - Hoskbrew sidebar/GWSD block export formatting
 */

import type { ActiveGWSDBody, GWSDBody, LatentGWSDBody } from './types';
import { isLatentBody } from './types';

type ActiveStateKey = Exclude<keyof ActiveGWSDBody, 'stateType'>;
type LatentStateKey = Exclude<keyof LatentGWSDBody, 'stateType' | 'reveal'>;
type StateKey = ActiveStateKey;

function wordSimilarity(a: string, b: string): number {
  const words = (value: string) =>
    new Set(
      value
        .toLowerCase()
        .replace(/[^a-z\s]/g, ' ')
        .split(/\s+/)
        .filter((w) => w.length > 2),
    );

  const setA = words(a);
  const setB = words(b);
  if (setA.size === 0 && setB.size === 0) return 1;
  if (setA.size === 0 || setB.size === 0) return 0;

  let overlap = 0;
  for (const w of setA) if (setB.has(w)) overlap += 1;
  const union = new Set([...setA, ...setB]).size;
  return overlap / union;
}

function normalizeNarrativeText(text: string): string {
  return text
    // ── Diagnostics-report cruft ──
    .replace(/^\s*[-*]\s*(?:severity|confidence|diagnosis|evidence|suggested\s+fix)\s*:\s*.*$/gim, '')
    .replace(/\b(?:severity|confidence|diagnosis|evidence|suggested\s+fix)\s*:\s*[^.\n]+[.\n]?/gim, ' ')
    // ── Markdown structural elements ──
    .replace(/^#{1,6}\s+/gm, '')                           // strip header markers
    .replace(/\*\*|__/g, '')                                // bold markers
    .replace(/[*_`]/g, '')                                  // italic / code markers
    .replace(/^\s*[-•]\s+/gm, '')                          // list bullets
    .replace(/^\s*>\s?/gm, '')                             // blockquote markers
    // ── Bracketed structural tags (art, map, sidebar, table, etc.) ──
    .replace(/\[(?:art|map|map reference|sidebar|sidebar start|sidebar end|table start|table end)[^\]]*\]/gi, '')
    // ── Read-aloud prefix markers ──
    .replace(/\bread[- ]?aloud\s*:/gi, '')                   // "Read Aloud:" "Read-Aloud:"
    // ── General cleanup ──
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function compactStateText(
  text: string,
  maxSentences = 2,
  maxChars = 180,
): string {
  const cleaned = normalizeNarrativeText(text);
  if (!cleaned) return '';

  const sentences = splitSentences(cleaned);
  let out = sentences.length > 0
    ? sentences.slice(0, maxSentences).join(' ')
    : cleaned;

  if (out.length > maxChars) {
    let clipped = out.slice(0, maxChars);
    const lastSpace = clipped.lastIndexOf(' ');
    if (lastSpace > 40) clipped = clipped.slice(0, lastSpace);
    out = `${clipped}…`;
  }

  return out.trim();
}

function compactBody(body: GWSDBody): GWSDBody {
  if (isLatentBody(body)) {
    return {
      stateType: 'latent',
      ground: compactStateText(body.ground),
      will: compactStateText(body.will),
      trigger: compactStateText(body.trigger),
      accumulation: compactStateText(body.accumulation),
      reveal: compactStateText(body.reveal || '', 1, 120) || undefined,
    };
  }

  return {
    stateType: 'active',
    ground: compactStateText(body.ground),
    will: compactStateText(body.will),
    shift: compactStateText(body.shift),
    drift: compactStateText(body.drift),
  };
}

function ensureDistinctBody(
  body: GWSDBody,
  fallbackSentences: string[] = [],
): GWSDBody {
  if (isLatentBody(body)) {
    const states = ['ground', 'will', 'trigger', 'accumulation'] as const;
    const out: LatentGWSDBody = { ...body };
    const used = new Set<string>();

    const nextUniqueFallback = (priorTexts: string[]): string => {
      for (const sentence of fallbackSentences) {
        const candidate = compactStateText(sentence);
        if (!candidate) continue;
        if (used.has(candidate)) continue;
        if (priorTexts.some((p) => wordSimilarity(candidate, p) >= 0.85)) continue;
        return candidate;
      }
      return '';
    };

    for (let i = 0; i < states.length; i++) {
      const key = states[i];
      const current = (out[key] || '').trim();
      if (!current) continue;

      const priorTexts = states
        .slice(0, i)
        .map((k) => out[k])
        .filter(Boolean);

      const isDuplicate = priorTexts.some(
        (prior) => prior === current || wordSimilarity(prior, current) >= 0.9,
      );

      if (isDuplicate) {
        const replacement = nextUniqueFallback(priorTexts);
        if (replacement) out[key] = replacement;
      }

      if (out[key]) used.add(out[key]);
    }

    return out;
  }

  const states = ['ground', 'will', 'shift', 'drift'] as const;
  const out: ActiveGWSDBody = { ...body };
  const used = new Set<string>();

  const nextUniqueFallback = (priorTexts: string[]): string => {
    for (const sentence of fallbackSentences) {
      const candidate = compactStateText(sentence);
      if (!candidate) continue;
      if (used.has(candidate)) continue;
      if (priorTexts.some((p) => wordSimilarity(candidate, p) >= 0.85)) continue;
      return candidate;
    }
    return '';
  };

  for (let i = 0; i < states.length; i++) {
    const key = states[i];
    const current = (out[key] || '').trim();
    if (!current) continue;

    const priorTexts = states
      .slice(0, i)
      .map((k) => out[k])
      .filter(Boolean);

    const isDuplicate = priorTexts.some(
      (prior) => prior === current || wordSimilarity(prior, current) >= 0.9,
    );

    if (isDuplicate) {
      const replacement = nextUniqueFallback(priorTexts);
      if (replacement) {
        out[key] = replacement;
      }
    }

    if (out[key]) used.add(out[key]);
  }

  return out;
}

/* ════════════════════════════════════════════════════════
 * MECHANICS STRIPPING
 * ════════════════════════════════════════════════════════ */

/** Patterns to strip game mechanics from narrative text */
const MECHANIC_PATTERNS: Array<[RegExp, string]> = [
  // Dice: 1d6, 2d8+3, 3d6-1
  [/\b\d+d\d+(?:[-+]\d+)?\b/g, ''],
  // DC checks: DC 14, Fort DC 12, Reflex DC 15
  [/\b(?:Fort(?:itude)?|Ref(?:lex)?|Will|Perception|Stealth|Climb|Swim|Disable\s+Device)\s+(?:DC\s*)?\d+\b/gi, ''],
  [/\bDC\s+\d+\b/g, ''],
  // Attack bonuses: +6 Ranged, +12 melee, +5 to hit
  [/[-+]\d+\s+(?:Ranged|Melee|to\s+hit|attack)\b/gi, ''],
  // HP/AC: HP 30, AC 15
  [/\b(?:HP|hp|Hit\s+Points?)\s*\d+\b/gi, ''],
  [/\bAC\s+\d+\b/g, ''],
  // CR/XP: CR 4, XP 1,200
  [/\bCR\s+\d+(?:\/\d+)?\b/g, ''],
  [/\bXP\s+[\d,]+\b/g, ''],
  // Damage types with amounts: 1d6 bludgeoning damage
  [/\b\d+(?:d\d+)?\s*(?:bludgeoning|slashing|piercing|fire|cold|lightning|thunder|radiant|necrotic|force|psychic|acid|poison)\s+damage\b/gi, ''],
  // Ability scores: Str 14, Dex 10
  [/\b(?:Str|Dex|Con|Int|Wis|Cha)\s+\d+\b/g, ''],
  // Ability damage: 1d4 CON damage, CON drain
  [/\b\d+\s+(?:CON|DEX|STR|INT|WIS|CHA)\s+(?:damage|drain)\b/gi, ''],
  // Monetary: 250 gp, 2,000 sp
  [/\b[\d,]+\s*(?:gp|sp|cp|pp)\b/gi, ''],
  // Onset: Onset 1d3 days
  [/\bOnset\s+\d+d?\d*\s+\w+\b/gi, ''],
  // Parenthesized stat blocks: (DC 14), (Fort DC 12)
  [/\((?:[^)]*(?:DC|AC|HP|CR|XP|Fort|Ref|Will|gp|sp)\s*\d*[^)]*)\)/gi, ''],
];

/**
 * Strip game mechanics from text, leaving clean narrative prose.
 * Cleans up artifacts (double spaces, orphaned punctuation).
 */
export function stripMechanics(text: string): string {
  let result = text;
  for (const [pattern, replacement] of MECHANIC_PATTERNS) {
    result = result.replace(pattern, replacement);
  }
  return result
    .replace(/\(\s*\)/g, '')           // empty parens
    .replace(/,\s*,/g, ',')           // double commas
    .replace(/\s{2,}/g, ' ')          // multiple spaces
    .replace(/\s+([.,;:])/g, '$1')    // space before punctuation
    .replace(/^\s*[,;:]\s*/gm, '')    // line-initial punctuation
    .trim();
}

/* ════════════════════════════════════════════════════════
 * SENTENCE SPLITTING
 * ════════════════════════════════════════════════════════ */

/**
 * Split text into sentences, respecting TRPG prose conventions.
 * Handles abbreviations like "ft." and "DC." without false splits.
 */
function splitSentences(text: string): string[] {
  const normalized = text
    .replace(/\s+[—–-]\s+(?=(?:Find|Hazard|Trigger|Effect|Save|Damage|Pit|Loot|Tactics|Special|Retreat|Attack|Event)\s*:)/gi, '. ')
    .replace(/\s+(?=(?:Find|Hazard|Trigger|Effect|Save|Damage|Pit|Loot|Tactics|Special|Retreat|Attack|Event)\s*:)/gi, '. ')
    .replace(/\n+/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();

  // Split on sentence-ending punctuation followed by space + uppercase
  // But avoid splitting on common abbreviations
  const sentences = normalized
    .split(/(?<=[.!?])\s+(?=[A-Z])/)
    .map((s) => s.trim())
    .filter((s) => s.length > 10); // filter tiny fragments

  return sentences;
}

/* ════════════════════════════════════════════════════════
 * HEURISTIC GWSD EXTRACTION
 * ════════════════════════════════════════════════════════ */

/* ── Semantic signal patterns for each GWSD state ── */

/**
 * GROUND signals: physical/spatial reality, what's visible, constraints.
 * Present-tense descriptions of conditions, geography, layout.
 */
const GROUND_SIGNALS: RegExp[] = [
  /\b(?:narrow|wide|tight|open|cramped|vast|circular|vaulted)\b/i,
  /\b(?:corridor|tunnel|chamber|room|hall|alcove|cistern|basin|staircase|stairs|catwalk|walkway)\b/i,
  /\b(?:filled with|choked with|littered with|coated in|covered in|smells? of)\b/i,
  /\b(?:sits?|stands?|lies?|rests?|hangs?|floats?|waits?)\s+(?:on|in|at|near|above|below|beside)\b/i,
  /\b(?:visible|dark(?:ness)?|dim|bright|lit|illuminat|light)\b/i,
  /\b(?:water|sludge|filth|webbing|debris|bones|remains)\b/i,
  /\b(?:area|space|passage|entrance|exit|door|gate|grate)\b/i,
  /\b(?:is located|currently|right now|at this point|present)\b/i,
  /\bfunnel/i,
  /\bmap\b.*\b(?:shows?|marks?|indicates?|accurate|lie)\b/i,
];

/**
 * WILL signals: active agent intentions, what NPCs/forces want.
 * Verbs of intention, desire, pursuit, hunting, luring.
 */
const WILL_SIGNALS: RegExp[] = [
  /\b(?:wants?|intends?|seeks?|tries?|attempts?|aims?|plans?|plots?)\b/i,
  /\b(?:lures?|baits?|draws?|entices?|tempts?|beckons?)\b/i,
  /\b(?:hunts?|stalks?|prowls?|patrols?|guards?|watches?|scouts?)\b/i,
  /\b(?:pursues?|chases?|follows?|tracks?)\b/i,
  /\b(?:demands?|insists?|commands?|orders?|threatens?|pressures?)\b/i,
  /\b(?:tests?|probes?|challenges?)\s+(?:the|their|commitment|resolve)\b/i,
  /\b(?:purpose|goal|objective|mission|agenda|motive)\b/i,
  /\bwant(?:s|ed)?\s+(?:the\s+party|them|you)\b/i,
  /\b(?:leverage|bait|trigger|variable)\b/i,
  /\b(?:to be followed|to commit|to be seen)\b/i,
];

/**
 * SHIFT signals: immediate conditional consequences of player action.
 * "If... then" constructions, player-triggered outcomes.
 */
const SHIFT_SIGNALS: RegExp[] = [
  /\bif\s+(?:the\s+)?(?:party|players?|characters?|PCs?|group|they)\b/i,
  /\b(?:approach|advance|enter|follow|grab|touch|open|pull|turn|engage)\b/i,
  /\b(?:immediately|instantly|at once|right away|on contact)\b/i,
  /\b(?:triggers?|activates?|reveals?|opens?|closes?|drops?)\b/i,
  /\b(?:leads?\s+to|results?\s+in|causes?|provokes?)\b/i,
  /\b(?:fighting|attacking|engaging|interacting)\s+(?:in|with|on)\b/i,
  /\b(?:retreating|advancing|entering|leaving)\b/i,
  /\b(?:encounter|ambush|attack|strike|lunge|swarm)\b/i,
  /→|leads?\s+(?:to|into)/i,
  /\b(?:attempt|try|decide|choose)\s+to\b/i,
];

/**
 * DRIFT signals: inaction consequences, time pressure, decay.
 * What happens if the party waits, hesitates, or does nothing.
 */
const DRIFT_SIGNALS: RegExp[] = [
  /\bif\s+(?:the\s+)?(?:party|players?|characters?|PCs?|group|they)\s+(?:delay|hesitate|wait|pause|stall|ignore|do\s+nothing|don'?t)\b/i,
  /\b(?:delay|hesitat|wait|stall|ignor)\b/i,
  /\b(?:worsen|escalat|intensif|degrad|decay|rot|spread|clos(?:e|ing)\s+in)\b/i,
  /\b(?:inevitable|inescapable|unavoidable|irreversible|too late)\b/i,
  /\b(?:pressure|tension)\s+(?:builds?|mounts?|grows?|rises?|increases?)\b/i,
  /\b(?:grows?\s+(?:quiet|louder|darker|worse|closer))\b/i,
  /\b(?:multiply|surround|encircle|close\s+(?:in|around))\b/i,
  /\b(?:time\s+(?:runs?|running)\s+out|clock\s+(?:is\s+)?ticking)\b/i,
  /\b(?:on\s+worse\s+terms|coming\s+back\s+(?:for|under))\b/i,
  /\b(?:cannot|can'?t)\s+(?:go\s+back|retreat|escape|leave)\b/i,
  /\b(?:stops?\s+feeling|stops?\s+being)\b/i,
];

/**
 * Stat-block / mechanical content that should NEVER appear in GWSD.
 * Sentences matching these are stripped entirely.
 */
const STAT_BLOCK_PATTERNS: RegExp[] = [
  // "Use worg stats", "worg stats but..."
  /\buse\s+\w+\s+stats?\b/i,
  // Explicit stat lines: "Size Small", "Telepathy 30 ft"
  /\b(?:Size)\s+(?:Tiny|Small|Medium|Large|Huge|Gargantuan|Colossal|Fine|Diminutive)\b/i,
  /\b(?:Telepathy|Darkvision|Low-light\s+vision|Tremorsense|Blindsight|Blindsense)\s+\d+\s*(?:ft\.?|feet)\b/i,
  // Swarm traits, psionic abilities
  /\bSwarm\s+traits?\b/i,
  /\bPsionic\s+(?:Blast|Surge|Bolt|Shield)\b/i,
  // Full stat-line patterns: "AC 14, HP 30"
  /\b(?:AC|HP|Init|Fort|Ref|Will|CMB|CMD|Base Atk|Speed|Melee|Ranged)\s+[-+]?\d+/i,
  // CR/XP lines
  /\b(?:CR\s+\d|XP\s+[\d,])/i,
  // Ability score blocks: "Str 18, Dex 12"
  /\b(?:Str|Dex|Con|Int|Wis|Cha)\s+\d+\s*[,;]/i,
  // Monster type lines: "NE Medium Magical Beast"
  /\b(?:NE|CE|LE|LG|NG|CG|LN|CN|N)\s+(?:Tiny|Small|Medium|Large|Huge)\s+(?:Aberration|Animal|Beast|Construct|Dragon|Elemental|Fey|Fiend|Giant|Humanoid|Monstrosity|Ooze|Plant|Undead|Vermin|Magical Beast)/i,
  // Feat/skill listing
  /\bFeats?\s+(?:Improved|Toughness|Weapon\s+Focus|Great)/i,
  /\bSkills?\s+(?:Climb|Perception|Stealth|Swim|Acrobatics)\s+[-+]?\d+/i,
];

/**
 * Score a sentence against a set of signal patterns.
 * Returns 0–1 normalized score.
 */
function scoreSignals(sentence: string, signals: RegExp[]): number {
  let hits = 0;
  for (const re of signals) {
    if (re.test(sentence)) hits++;
  }
  return signals.length > 0 ? hits / signals.length : 0;
}

/**
 * Check if a sentence is primarily mechanical/stat content.
 */
function isMechanicalSentence(sentence: string): boolean {
  for (const re of STAT_BLOCK_PATTERNS) {
    if (re.test(sentence)) return true;
  }
  return false;
}

/**
 * Semantic GWSD extraction from sidebar or prose text.
 *
 * Classifies sentences by GWSD state semantics:
 *   - GROUND: physical/social conditions, spatial layout, what's visible
 *   - WILL:   active NPC/monster/environment intentions
 *   - SHIFT:  immediate conditional consequences of player action
 *   - DRIFT:  cost of inaction, decay, time pressure
 *
 * Sentences containing stat-block or mechanical content are excluded.
 * Falls back to positional assignment when semantic signals are weak.
 */
export function heuristicGWSD(text: string): GWSDBody {
  // Pre-clean structural markup before mechanics stripping
  const prepped = normalizeNarrativeText(text);
  const clean = stripMechanics(prepped);
  const sentences = splitSentences(clean);

  const empty: ActiveGWSDBody = { stateType: 'active', ground: '', will: '', shift: '', drift: '' };
  if (sentences.length === 0) return empty;

  // Filter out mechanical/stat-block sentences
  const narrative = sentences.filter((s) => !isMechanicalSentence(s));
  if (narrative.length === 0) return empty;

  // Score each sentence against all four state signals
  type ScoredSentence = {
    text: string;
    scores: Record<StateKey, number>;
    bestState: StateKey;
    bestScore: number;
    position: number; // 0–1 normalized position in the text
  };

  const scored: ScoredSentence[] = narrative.map((s, i) => {
      const scores: Record<StateKey, number> = {
      ground: scoreSignals(s, GROUND_SIGNALS),
      will: scoreSignals(s, WILL_SIGNALS),
      shift: scoreSignals(s, SHIFT_SIGNALS),
      drift: scoreSignals(s, DRIFT_SIGNALS),
    };

    // Position bias: gently favor the natural GWSD ordering
    // (ground early, drift late) as a tie-breaker
    const position = narrative.length > 1 ? i / (narrative.length - 1) : 0;
    scores.ground += (1 - position) * 0.03;
    scores.will += (0.33 - Math.abs(position - 0.33)) * 0.03;
    scores.shift += (0.33 - Math.abs(position - 0.66)) * 0.03;
    scores.drift += position * 0.03;

    let bestState: StateKey = 'ground';
    let bestScore = scores.ground;
    for (const key of ['will', 'shift', 'drift'] as StateKey[]) {
      if (scores[key] > bestScore) {
        bestState = key;
        bestScore = scores[key];
      }
    }

    return { text: s, scores, bestState, bestScore, position };
  });

  // Assign sentences to states using a greedy best-fit approach
  const buckets: Record<StateKey, string[]> = {
    ground: [],
    will: [],
    shift: [],
    drift: [],
  };

  // First pass: assign strongly-classified sentences (score > threshold)
  const STRONG_THRESHOLD = 0.08;
  const assigned = new Set<number>();

  for (let i = 0; i < scored.length; i++) {
    const s = scored[i];
    if (s.bestScore >= STRONG_THRESHOLD) {
      buckets[s.bestState].push(s.text);
      assigned.add(i);
    }
  }

  // Second pass: distribute remaining sentences positionally
  const unassigned = scored.filter((_, i) => !assigned.has(i));
  for (const s of unassigned) {
    // Use position to assign weakly-classified sentences
    let state: StateKey;
    if (s.position < 0.25) state = 'ground';
    else if (s.position < 0.5) state = 'will';
    else if (s.position < 0.75) state = 'shift';
    else state = 'drift';

    // Only assign to empty buckets, or the best semantic match
    if (buckets[state].length === 0) {
      buckets[state].push(s.text);
    } else {
      // Find the emptiest bucket that this sentence has any affinity for
      const candidates: StateKey[] = ['ground', 'will', 'shift', 'drift'];
      const emptyBucket = candidates.find((k) => buckets[k].length === 0);
      if (emptyBucket) {
        buckets[emptyBucket].push(s.text);
      } else {
        // All buckets have something — add to best semantic match
        buckets[s.bestState].push(s.text);
      }
    }
  }

  return compactBody({
    stateType: 'active',
    ground: buckets.ground.join(' '),
    will: buckets.will.join(' '),
    shift: buckets.shift.join(' '),
    drift: buckets.drift.join(' '),
  });
}

/**
 * Ensure all four GWSD fields are populated.
 *
 * Fill strategy:
 *   1. Keep existing extracted text as-is
 *   2. Pull additional sentences from fallback text (if provided)
 *   3. Apply deterministic narrative fallback lines for any remaining gaps
 */
export function qualifyGWSD(
  body: GWSDBody,
  fallbackText = '',
): GWSDBody {
  const out: GWSDBody = isLatentBody(body)
    ? {
        stateType: 'latent',
        ground: (body.ground || '').trim(),
        will: (body.will || '').trim(),
        trigger: (body.trigger || '').trim(),
        accumulation: (body.accumulation || '').trim(),
        reveal: (body.reveal || '').trim() || undefined,
      }
    : {
        stateType: 'active',
        ground: (body.ground || '').trim(),
        will: (body.will || '').trim(),
        shift: (body.shift || '').trim(),
        drift: (body.drift || '').trim(),
      };

  const fallbackSentences = splitSentences(stripMechanics(fallbackText));
  const used = new Set(
    isLatentBody(out)
      ? [out.ground, out.will, out.trigger, out.accumulation, out.reveal || '']
      : [out.ground, out.will, out.shift, out.drift]
      .map((s) => s.trim())
      .filter(Boolean),
  );

  const nextFallbackSentence = (): string => {
    for (const sentence of fallbackSentences) {
      const trimmed = sentence.trim();
      if (trimmed && !used.has(trimmed)) {
        used.add(trimmed);
        return trimmed;
      }
    }
    return '';
  };

  if (!out.ground) out.ground = nextFallbackSentence();
  if (!out.will) out.will = nextFallbackSentence();

  if (isLatentBody(out)) {
    if (!out.trigger) out.trigger = nextFallbackSentence();
    if (!out.accumulation) out.accumulation = nextFallbackSentence();

    if (!out.ground) {
      out.ground = 'The present conditions hold steady, but pressure is already seeded in the scene.';
    }
    if (!out.will) {
      out.will = 'A hidden force or intent is shaping what this scene is building toward.';
    }
    if (!out.trigger) {
      out.trigger = 'If the party exposes the concealed pressure point, the stored state resolves into action.';
    }
    if (!out.accumulation) {
      out.accumulation = 'If the party delays, pressure accumulates toward a sharper reveal or confrontation.';
    }
  } else {
    if (!out.shift) out.shift = nextFallbackSentence();
    if (!out.drift) out.drift = nextFallbackSentence();

    if (!out.ground) {
      out.ground = 'The current conditions press on the party right now.';
    }
    if (!out.will) {
      out.will = 'Active forces in the scene are pursuing their immediate aims.';
    }
    if (!out.shift) {
      out.shift = 'If the party acts, the local balance changes immediately.';
    }
    if (!out.drift) {
      out.drift = 'If the party delays, pressure escalates and the scene worsens.';
    }
  }

  return ensureDistinctBody(compactBody(out), fallbackSentences);
 }

/* ════════════════════════════════════════════════════════
 * AI-ASSISTED EXTRACTION
 * ════════════════════════════════════════════════════════ */

/**
 * Build the system prompt for LLM-based GWSD extraction.
 * Enforces Hoskbrew GWSD framework constraints.
 *
 * Usage: copy the returned string into Claude, GPT, or the Seneschal
 * and paste the scene text after it. Or use programmatically with an API.
 */
export function buildExtractionPrompt(
  sceneText: string,
  sceneTitle?: string,
): string {
  return `You are a TTRPG narrative designer specializing in the GWSD scene-state framework. Your task is to distill the following adventure text into exactly one of two valid four-part schemas.

Choose the schema that fits the scene:
- ACTIVE card: Ground / Will / Shift / Drift
- LATENT card: Ground / Will / Trigger / Accumulation

Use ACTIVE when the scene relies on immediate physical or social consequence.
Use LATENT when the scene relies on hidden intent, delayed confrontation, or gathering pressure.

## GWSD Logic Gates

| State         | Question                                                      | Constraint                                        |
|---------------|---------------------------------------------------------------|---------------------------------------------------|
| GROUND        | What are the physical and social conditions RIGHT NOW?        | Decision-physics: where are you, what's visible, what constrains action. No backstory. Present tense only. |
| WILL          | What is the immediate or concealed intent of the active force?| Must describe an intention by an agent or force. What it is DOING or preparing to do, not what it IS. Present tense. |
| SHIFT         | What is the FIRST thing that changes if the players act?      | ACTIVE only. Must begin with an explicit player action. Immediate consequence only. |
| DRIFT         | What happens if the players do NOTHING?                       | ACTIVE only. Must describe a time/inaction consequence. |
| TRIGGER       | What event, discovery, or commitment releases the stored state?| LATENT only. Must be concrete and resolvable at the table. |
| ACCUMULATION  | How does pressure build before the trigger resolves?          | LATENT only. Must describe mounting cost, suspicion, heat, or instability. |

## Sacred Rules

1. Each state MUST be 1–2 sentences. No more.
2. NEVER include game mechanics: no dice (1d6), no DCs, no attack bonuses, no HP, no AC, no ability scores, no monetary values, no stat blocks, no creature stat references.
3. Replace mechanics with narrative descriptions (e.g., "The climb is treacherous" not "Climb DC 18").
4. Write in present tense.
5. Write for the GM — imperative, direct, urgent. No flavor text.
6. Output must declare whether the card is ACTIVE or LATENT.
7. ACTIVE cards must appear in GROUND → WILL → SHIFT → DRIFT order.
8. LATENT cards must appear in GROUND → WILL → TRIGGER → ACCUMULATION order.
9. WILL must describe an intention by an agent or force — not a location or object description.
10. SHIFT must begin with an explicit player action.
11. DRIFT must describe a time/inaction consequence.
12. TRIGGER must be concrete, not vague GM intuition.
13. ACCUMULATION must show stored pressure growing over time.
14. Mechanics, stat blocks, creature stats, and ability scores are FORBIDDEN in GWSD. They belong in a separate GM Mechanics section.

## Input Scene
${sceneTitle ? `\n**${sceneTitle}**\n` : ''}
${sceneText}

## Output Format

Respond with EXACTLY one of these formats and nothing else:

TYPE: ACTIVE
GROUND: [1–2 sentences]
WILL: [1–2 sentences]
SHIFT: [1–2 sentences]
DRIFT: [1–2 sentences]

OR

TYPE: LATENT
GROUND: [1–2 sentences]
WILL: [1–2 sentences]
TRIGGER: [1–2 sentences]
ACCUMULATION: [1–2 sentences]`;
}

/**
 * Parse an AI response in the expected GROUND/WILL/SHIFT/DRIFT format.
 * Tolerant of extra whitespace and markdown formatting.
 */
export function parseAIResponse(response: string): GWSDBody {
  const typeMatch = response.match(/TYPE:\s*(ACTIVE|LATENT)/i);
  const stateType = typeMatch?.[1]?.toLowerCase() === 'latent' ? 'latent' : 'active';

  const activePatterns: Array<[ActiveStateKey, RegExp]> = [
    ['ground', /GROUND:\s*(.+?)(?=\n\s*WILL:|$)/si],
    ['will', /WILL:\s*(.+?)(?=\n\s*(?:SHIFT|TRIGGER):|$)/si],
    ['shift', /SHIFT:\s*(.+?)(?=\n\s*DRIFT:|$)/si],
    ['drift', /DRIFT:\s*(.+?)$/si],
  ];
  const latentPatterns: Array<[Exclude<LatentStateKey, 'stateType' | 'reveal'>, RegExp]> = [
    ['ground', /GROUND:\s*(.+?)(?=\n\s*WILL:|$)/si],
    ['will', /WILL:\s*(.+?)(?=\n\s*TRIGGER:|$)/si],
    ['trigger', /TRIGGER:\s*(.+?)(?=\n\s*ACCUMULATION:|$)/si],
    ['accumulation', /ACCUMULATION:\s*(.+?)$/si],
  ];

  const clean = (value: string) => value
    .replace(/^\*\*|\*\*$/g, '')
    .replace(/\n+/g, ' ')
    .trim();

  if (stateType === 'latent') {
    const body: LatentGWSDBody = {
      stateType: 'latent',
      ground: '',
      will: '',
      trigger: '',
      accumulation: '',
    };

    for (const [key, re] of latentPatterns) {
      const m = response.match(re);
      if (m) body[key] = clean(m[1]);
    }

    return body;
  }

  const body: ActiveGWSDBody = {
    stateType: 'active',
    ground: '',
    will: '',
    shift: '',
    drift: '',
  };

  for (const [key, re] of activePatterns) {
    const m = response.match(re);
    if (m) body[key] = clean(m[1]);
  }

  return body;
}

/* ════════════════════════════════════════════════════════
 * HOSKBREW EXPORT
 * ════════════════════════════════════════════════════════ */

/**
 * Format a GWSD body as a Hoskbrew [sidebar] block.
 * Joins the four states into a single narrative paragraph.
 */
export function toHoskbrewSidebar(body: GWSDBody, title?: string): string {
  const sentences = isLatentBody(body)
    ? [body.ground, body.will, body.trigger, body.accumulation, body.reveal || '']
    : [body.ground, body.will, body.shift, body.drift];
  const joined = sentences
    .filter(Boolean)
    .join(' ');

  const lines = ['[sidebar]'];
  if (title) lines.push(title);
  lines.push(joined);
  lines.push('[/sidebar]');
  return lines.join('\n');
}

/**
 * Format a GWSD body as a [gwsd] block for manuscript insertion.
 */
export function toGWSDBlock(body: GWSDBody): string {
  if (isLatentBody(body)) {
    return `[gwsd_kernel]\nGROUND: ${body.ground}\nWILL: ${body.will}\nTRIGGER: ${body.trigger}\nACCUMULATION: ${body.accumulation}${body.reveal ? `\nREVEAL: ${body.reveal}` : ''}\n[/gwsd_kernel]`;
  }
  const sentences = [body.ground, body.will, body.shift, body.drift]
    .filter(Boolean)
    .join(' ');
  return `[gwsd]\n${sentences}\n[/gwsd]`;
}
