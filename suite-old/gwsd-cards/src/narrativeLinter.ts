import type { Scene } from './types';

export type LintRuleCode =
  | 'echo'
  | 'railroad'
  | 'museum'
  | 'drift-stagnation'
  | 'latent-trigger'
  | 'latent-accumulation'
  | 'solution-monotony'
  | 'permission-shift'
  | 'pressure-chain'
  | 'trap-hazard-collapse'
  | 'competing-vectors'
  | 'false-urgency'
  | 'logic-conflict'
  | 'unreachable-code'
  | 'hidden-switch'
  | 'prescriptive-emotion';

export interface NarrativeSignal {
  code: LintRuleCode;
  icon: string;
  name: string;
  diagnosis: string;
  fix: string;
  severity: 'high' | 'medium' | 'low';
  sceneTitle?: string;
  sceneOrder?: number;
  relatedSceneTitle?: string;
  confidence: 'high' | 'medium' | 'low';
  evidence: string;
}

export interface NarrativeDiagnosticsReport {
  generatedAt: string;
  sceneCount: number;
  signalCount: number;
  byRule: Record<LintRuleCode, number>;
  signals: NarrativeSignal[];
}

export interface SceneModeEvidence {
  mode: SceneMode;
  trapIntent: boolean;
  trapTrigger: boolean;
  hazardGround: boolean;
  hazardExposure: boolean;
  hpTaxPattern: boolean;
  driftChannel: 'response' | 'inevitability' | 'none';
  shiftDriftDivergence: number;
}

const STOPWORDS = new Set([
  'the', 'and', 'for', 'with', 'that', 'this', 'from', 'into', 'onto', 'over', 'under', 'about', 'through',
  'there', 'their', 'they', 'them', 'then', 'than', 'when', 'where', 'while', 'which', 'what', 'your',
  'have', 'has', 'had', 'will', 'would', 'could', 'should', 'must', 'are', 'was', 'were', 'been', 'being',
  'you', 'his', 'her', 'hers', 'him', 'its', 'our', 'ours', 'who', 'why', 'how', 'can', 'not', 'all', 'any',
  'just', 'only', 'very', 'more', 'most', 'some', 'many', 'much', 'each', 'other', 'another', 'scene',
  'ground', 'shift', 'drift', 'trigger', 'accumulation', 'players', 'party', 'room', 'area', 'hall', 'state', 'card', 'cards',
]);

const URGENCY_KEYWORDS = /\b(rush|racing|race|urgent|before\s+it'?s\s+too\s+late|time\s+is\s+running\s+out|summon|escape|breach|alarm|countdown|ritual)\b/i;
const VAGUE_TRIGGER_KEYWORDS = /\b(might|maybe|possibly|if\s+lucky|if\s+they\s+look\s+closely|perception\s+check|notice\s+something\s+odd)\b/i;
const MOOD_WORDS = /\b(oppressive|sad|eerie|ominous|tense|unsettling|haunting|melancholic|gloomy|foreboding|dreadful)\b/i;
const ACTOR_HINTS = /\b(guards?|cultists?|monster|beast|shadows?|wind|clockwork|trap|ward|sentries?|patrol|leader|npc|they|it|force|hazard)\b/i;
const PERMISSION_DELTA_KEYWORDS = /\b(unlock|open|sealed|barred|allow|permission|access|blocked|breach|override|deactivate|disable|enable|free|capture|detain|escape|can\s+now|no\s+longer|must|cannot|can't|forbidden|admit|entry|exit)\b/i;
const TRAP_INTENT_KEYWORDS = /\b(trap|snare|tripwire|pressure\s+plate|glyph|ward|alarm|trigger|countermeasure|detonat|disarm|bypass|reset|intruder|tamper|armed)\b/i;
const TRAP_AGENTIVE_WILL = /\b(attempts?|tries\s+to|seeks\s+to|targets?|punishes?|alerts?|locks\s+down|activates|responds\s+to\s+intrusion)\b/i;
const TRAP_TRIGGER_KEYWORDS = /\b(step|touch|open|cross|tamper|disturb|insert|remove|break|trigger|intrud|trip|when\s+entered?)\b/i;
const HAZARD_ENVIRONMENT_KEYWORDS = /\b(hazard|unstable|toxic|gas|fumes?|heat|cold|ice|flood|acid|slippery|filth|disease|collapse|terrain|exposure|radiation|smoke)\b/i;
const HAZARD_EXPOSURE_KEYWORDS = /\b(exposure|prolonged|for\s+each\s+round|per\s+turn|while\s+inside|endure|resist|protective\s+gear|ventilation|breathing|fatigue|accumulat)\b/i;
const HP_TAX_PATTERN = /\b(take\s+damage|suffer\s+damage|when\s+touched|on\s+contact|takes?\s+\d+d?\d*\s+damage)\b/i;
const WILL_ACTOR_PATTERN = /\b(guards?|cultists?|captain|commander|rat\s+king|beast|monster|swarm|trap|ward|shadows?|civilians?|patrol|npc|faction|ritualists?)\b/gi;
const DRIFT_RESPONSE_PATTERN = /\b(alert|alarms?|reinforce|mobiliz|locks?\s+seal|seal(?:ed|s)?|reset|respond|countermeasure|hunts?|patrols?\s+increase|retaliat)\b/i;
const DRIFT_INEVITABILITY_PATTERN = /\b(thickens?|spreads?|rises?|worsens?|collapses?|crumbles?|floods?|freezes?|burns?|decays?|exposure|entropy|degrad|deteriorat)\b/i;
const EXPLICIT_TRAP_MECHANICS = /\b(trigger\s*:|save\s*:|effect\s*:|reflex\s+dc\s*\d+|fort\s+dc\s*\d+|will\s+dc\s*\d+|dc\s*\d+|weight\s+of\s*\d+|drop\s+\d+\s*(?:ft|feet)|pit\s*:|damage\s*:|immediate\s+\w+\s+check)\b/i;
const EXPLICIT_HAZARD_EXPOSURE = /\b(per\s+round|each\s+round|onset\s+\d+d\d+|save\s+again|contact\s+or\s+inhaled|ingested|swim\s+check\s+dc\s*\d+|water\s+rises?\s+\d+\s*(?:ft|feet)\s+per\s+round)\b/i;
const HARD_STATE_CHANGE = /\b(trigger\s*:|if\s+all\s+three\s+cranks|if\s+any\s+crank|success\s*:|failure\s*:|consequence\s*:|after\s+\d+\s+rounds?|water\s+rises?\s+\d+\s*(?:ft|feet)\s+per\s+round|breach(?:es|ed)?|reverse\s+sluice|aquatic\s+combat\s+rules)\b/i;
const IRREVERSIBLE_STATE_KEYWORDS = /\b(dead|destroyed|burned|breached|ritual\s+complete|flooded|sealed\s+forever|captured|lost\s+for\s+good|no\s+return|doomed|after\s+\d+\s+rounds?|failure\s*:|consequence\s*:|reverse\s+sluice|water\s+rises?\s+\d+\s*(?:ft|feet)\s+per\s+round)\b/i;
const ESCALATION_STATE_KEYWORDS = /\b(alert|mobilize|reinforce|combat|attack|surge|spread|collapse|critical|outbreak|hunt|lockdown|save\s*:|dc\s*\d+|damage\s*:|swim\s+check\s+dc\s*\d+|trigger\s*:|effect\s*:)\b/i;

type PressureLevel = 'calm' | 'complication' | 'escalation' | 'irreversible';

const PRESSURE_META: Record<PressureLevel, { rank: number; label: string }> = {
  calm: { rank: 0, label: 'Calm' },
  complication: { rank: 1, label: 'Complication' },
  escalation: { rank: 2, label: 'Escalation' },
  irreversible: { rank: 3, label: 'Irreversible' },
};

const PRESSURE_KEYWORDS: Record<PressureLevel, RegExp> = {
  calm: /\b(quiet|stable|hold|watch|observe|survey|waiting|patrol|idle|normal|routine)\b/i,
  complication: /\b(suspicion|noticed|clue|warning|delay|complication|pressure|alarmed|friction|cost|risk)\b/i,
  escalation: /\b(alert|mobilize|reinforce|combat|attack|surge|spread|collapse|critical|outbreak|hunt|lockdown)\b/i,
  irreversible: /\b(dead|destroyed|burned|breached|ritual\s+complete|flooded|sealed\s+forever|captured|lost\s+for\s+good|no\s+return|doomed)\b/i,
};

export type SceneMode = 'conflict' | 'trap' | 'hazard' | 'social' | 'discovery' | 'puzzle';

export const SCENE_MODE_META: Record<SceneMode, { icon: string; label: string; verb: string }> = {
  conflict: { icon: '⚔️', label: 'Conflict', verb: 'Force' },
  trap: { icon: '🪤', label: 'Trap', verb: 'Inference' },
  hazard: { icon: '⚡', label: 'Hazard', verb: 'Positioning' },
  social: { icon: '💬', label: 'Social', verb: 'Persuasion' },
  discovery: { icon: '🔍', label: 'Discovery', verb: 'Attention' },
  puzzle: { icon: '🧩', label: 'Puzzle', verb: 'Inference' },
};

const SCENE_MODE_KEYWORDS: Record<SceneMode, RegExp> = {
  conflict: /\b(attack|combat|fight|ambush|battle|kill|wound|blood|weapon|strike|slay|defeat|ghoul|monster|swarm|crossbow)\b/i,
  trap: /\b(trap|tripwire|snare|pressure\s+plate|glyph|ward|alarm|trigger|disarm|bypass|countermeasure|reset)\b/i,
  hazard: /\b(hazard|collapse|fall|drop|filth|disease|poison|acid|fire|flood|slippery|sink|swim|position|terrain|web|toxic|heat|cold|fumes?)\b/i,
  social: /\b(negotiat|parley|convince|persuade|threaten|bargain|offer|audience|crowd|marshal|commander|rat king|leverage|compliance|conversation|talk|speak|ask|answer|rumor|gossip|listen|chat|warn|introduc)\b/i,
  discovery: /\b(find|notice|clue|discover|search|hidden|observe|read|track|inspect|reveal|secret|signs|map\b|manual|scan|hear|glimpse|spot)\b/i,
  puzzle: /\b(puzzle|riddle|mechanism|crank|lever|sequence|simultaneous|logic|solve|inference|setting|configuration|system|reset)\b/i,
};

function sceneBody(scene: Scene): Record<'ground' | 'will' | 'shift' | 'drift', string> {
  const textFor = (state: string) => {
    const card = scene.cards.find((entry) => entry.state === state);
    return (card?.cardText || card?.text || '').trim();
  };
  return {
    ground: textFor('ground'),
    will: textFor('will'),
    shift: textFor(scene.stateType === 'latent' ? 'trigger' : 'shift'),
    drift: textFor(scene.stateType === 'latent' ? 'accumulation' : 'drift'),
  };
}

function sceneCorpus(scene: Scene): string {
  const body = sceneBody(scene);
  return [scene.raw || '', body.ground, body.will, body.shift, body.drift].join(' ').trim();
}

function words(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2);
}

function wordSimilarity(a: string, b: string): number {
  const setA = new Set(words(a));
  const setB = new Set(words(b));
  if (setA.size === 0 && setB.size === 0) return 1;
  if (setA.size === 0 || setB.size === 0) return 0;

  let overlap = 0;
  for (const w of setA) {
    if (setB.has(w)) overlap += 1;
  }
  const union = new Set([...setA, ...setB]).size;
  return overlap / union;
}

function wordCount(text: string): number {
  return words(text).length;
}

function bodyAsString(scene: Scene): string {
  const body = sceneBody(scene);
  return [body.ground, body.will, body.shift, body.drift].join(' ').trim();
}

function isGenericDrift(drift: string): boolean {
  const trimmed = drift.trim();
  if (!trimmed) return true;
  return /\b(tension\s+escalates|things\s+worsen|pressure\s+builds|situation\s+deteriorates|stakes\s+rise)\b/i.test(trimmed);
}

function isGenericAccumulation(accumulation: string): boolean {
  const trimmed = accumulation.trim();
  if (!trimmed) return true;
  return /\b(tension\s+builds|pressure\s+builds|suspicion\s+rises|heat\s+builds|the\s+scene\s+worsens|things\s+get\s+worse)\b/i.test(trimmed);
}

function extractCandidateNouns(text: string): Set<string> {
  const tokens = words(text);
  return new Set(tokens.filter((t) => !STOPWORDS.has(t) && t.length >= 5));
}

function baseRuleCounts(): Record<LintRuleCode, number> {
  return {
    echo: 0,
    railroad: 0,
    museum: 0,
    'drift-stagnation': 0,
    'latent-trigger': 0,
    'latent-accumulation': 0,
    'solution-monotony': 0,
    'permission-shift': 0,
    'pressure-chain': 0,
    'trap-hazard-collapse': 0,
    'competing-vectors': 0,
    'false-urgency': 0,
    'logic-conflict': 0,
    'unreachable-code': 0,
    'hidden-switch': 0,
    'prescriptive-emotion': 0,
  };
}

function hasTrapIntent(scene: Scene, body: Record<'ground' | 'will' | 'shift' | 'drift', string>): boolean {
  const corpus = sceneCorpus(scene);
  const trapFrame = TRAP_INTENT_KEYWORDS.test(`${body.ground} ${body.will}`) || TRAP_INTENT_KEYWORDS.test(corpus);
  const agentive = TRAP_AGENTIVE_WILL.test(body.will) || TRAP_AGENTIVE_WILL.test(corpus);
  const explicitMechanics = EXPLICIT_TRAP_MECHANICS.test(corpus);
  const explicitTrigger = TRAP_TRIGGER_KEYWORDS.test(corpus);
  return trapFrame && (agentive || explicitMechanics || explicitTrigger);
}

function hasTrapTrigger(scene: Scene, body: Record<'ground' | 'will' | 'shift' | 'drift', string>): boolean {
  const corpus = sceneCorpus(scene);
  return TRAP_TRIGGER_KEYWORDS.test(body.shift) || TRAP_TRIGGER_KEYWORDS.test(corpus) || EXPLICIT_TRAP_MECHANICS.test(corpus);
}

function hasHazardExposure(scene: Scene, body: Record<'ground' | 'will' | 'shift' | 'drift', string>): boolean {
  const corpus = sceneCorpus(scene);
  return HAZARD_EXPOSURE_KEYWORDS.test(`${body.shift} ${body.drift}`) || HAZARD_EXPOSURE_KEYWORDS.test(corpus) || EXPLICIT_HAZARD_EXPOSURE.test(corpus);
}

function hasHazardGround(body: Record<'ground' | 'will' | 'shift' | 'drift', string>): boolean {
  return HAZARD_ENVIRONMENT_KEYWORDS.test(body.ground);
}

function detectDriftChannel(drift: string): 'response' | 'inevitability' | 'none' {
  if (!drift.trim()) return 'none';
  if (DRIFT_RESPONSE_PATTERN.test(drift)) return 'response';
  if (DRIFT_INEVITABILITY_PATTERN.test(drift)) return 'inevitability';
  return 'none';
}

function countDistinctWillActors(willText: string): number {
  const matches = willText.toLowerCase().match(WILL_ACTOR_PATTERN) || [];
  return new Set(matches).size;
}

function permissionDeltaScore(scene: Scene): number {
  const body = sceneBody(scene);
  const text = [body.will, body.shift, body.drift].join(' ');
  const matches = text.match(new RegExp(PERMISSION_DELTA_KEYWORDS.source, 'gi'));
  return matches ? matches.length : 0;
}

function detectPressureLevel(scene: Scene): PressureLevel {
  const body = sceneBody(scene);
  const driftText = body.drift;
  const structural = [body.will, body.shift, body.drift, scene.raw || ''].join(' ');

  if (PRESSURE_KEYWORDS.irreversible.test(driftText) || IRREVERSIBLE_STATE_KEYWORDS.test(structural)) return 'irreversible';
  if (PRESSURE_KEYWORDS.escalation.test(driftText) || ESCALATION_STATE_KEYWORDS.test(structural)) return 'escalation';
  if (PRESSURE_KEYWORDS.complication.test(driftText) || PRESSURE_KEYWORDS.complication.test(structural)) return 'complication';
  if (PRESSURE_KEYWORDS.calm.test(driftText)) return 'calm';

  if (URGENCY_KEYWORDS.test(structural)) return 'escalation';
  return 'complication';
}

function hasHardStateChange(scene: Scene): boolean {
  return HARD_STATE_CHANGE.test(sceneCorpus(scene));
}

function hasPressureEvidence(scene: Scene): boolean {
  const body = sceneBody(scene);
  const drift = body.drift || '';
  const driftWordLen = words(drift).length;
  const corpus = sceneCorpus(scene);
  return (
    driftWordLen >= 6 && (
      PRESSURE_KEYWORDS.complication.test(drift)
      || PRESSURE_KEYWORDS.escalation.test(drift)
      || PRESSURE_KEYWORDS.irreversible.test(drift)
      || HARD_STATE_CHANGE.test(corpus)
      || ESCALATION_STATE_KEYWORDS.test(corpus)
      || IRREVERSIBLE_STATE_KEYWORDS.test(corpus)
    )
  );
}

function shiftDriftDivergence(body: Record<'ground' | 'will' | 'shift' | 'drift', string>): number {
  if (!body.shift.trim() || !body.drift.trim()) return 0;
  return 1 - wordSimilarity(body.shift, body.drift);
}

export function detectSceneMode(scene: Scene): SceneMode {
  const text = bodyAsString(scene);
  let bestMode: SceneMode = 'discovery';
  let bestScore = 0;

  for (const mode of Object.keys(SCENE_MODE_KEYWORDS) as SceneMode[]) {
    const regex = SCENE_MODE_KEYWORDS[mode];
    const matches = text.match(new RegExp(regex.source, 'gi'));
    const score = matches ? matches.length : 0;
    if (score > bestScore) {
      bestScore = score;
      bestMode = mode;
    }
  }

  return bestMode;
}

export function explainSceneMode(scene: Scene): SceneModeEvidence {
  const body = sceneBody(scene);
  return {
    mode: detectSceneMode(scene),
    trapIntent: hasTrapIntent(scene, body),
    trapTrigger: hasTrapTrigger(scene, body),
    hazardGround: hasHazardGround(body),
    hazardExposure: hasHazardExposure(scene, body),
    hpTaxPattern: HP_TAX_PATTERN.test(`${body.shift} ${body.drift}`),
    driftChannel: detectDriftChannel(body.drift),
    shiftDriftDivergence: shiftDriftDivergence(body),
  };
}

export function runNarrativeDiagnostics(scenes: Scene[]): NarrativeDiagnosticsReport {
  const signals: NarrativeSignal[] = [];

  for (let i = 0; i < scenes.length; i++) {
    const scene = scenes[i];
    const body = sceneBody(scene);
    const isLatent = scene.stateType === 'latent';

    const shiftVsDrift = wordSimilarity(body.shift, body.drift);
    if (!isLatent && body.shift && body.drift && shiftVsDrift >= 0.75) {
      signals.push({
        code: 'railroad',
        icon: '🛤️',
        name: 'The Railroad',
        diagnosis: 'Action and inaction converge on the same outcome.',
        fix: 'Differentiate Drift from Shift so waiting and acting produce distinct world states.',
        severity: 'high',
        sceneTitle: scene.title,
        sceneOrder: scene.order,
        confidence: shiftVsDrift >= 0.85 ? 'high' : 'medium',
        evidence: `Shift/Drift similarity ${(shiftVsDrift * 100).toFixed(0)}%.`,
      });
    }

    if (
      wordCount(body.ground) > 40 &&
      !body.will.trim() &&
      !body.shift.trim() &&
      !body.drift.trim()
    ) {
      signals.push({
        code: 'museum',
        icon: '📖',
        name: 'The Museum',
        diagnosis: 'Scene describes context without active pressure or response.',
        fix: 'Add active Will, actionable Shift, or escalating Drift—or cut the scene.',
        severity: 'medium',
        sceneTitle: scene.title,
        sceneOrder: scene.order,
        confidence: 'high',
        evidence: `Ground ${wordCount(body.ground)} words; Will/Shift/Drift empty.`,
      });
    }

    if (!isLatent && URGENCY_KEYWORDS.test(body.will) && isGenericDrift(body.drift)) {
      signals.push({
        code: 'false-urgency',
        icon: '⚠️',
        name: 'False Urgency',
        diagnosis: 'Will implies urgency but Drift does not punish delay.',
        fix: 'Give Drift a concrete world change that lands if players stall.',
        severity: 'high',
        sceneTitle: scene.title,
        sceneOrder: scene.order,
        confidence: 'medium',
        evidence: 'Urgency terms found in Will with empty/generic Drift.',
      });
    }

    if (!isLatent && VAGUE_TRIGGER_KEYWORDS.test(body.shift)) {
      signals.push({
        code: 'hidden-switch',
        icon: '🕹️',
        name: 'The Hidden Switch',
        diagnosis: 'Shift trigger is ambiguous and may depend on GM fiat.',
        fix: 'State exact trigger-action pair with explicit causality.',
        severity: 'medium',
        sceneTitle: scene.title,
        sceneOrder: scene.order,
        confidence: 'high',
        evidence: 'Vague trigger language detected in Shift.',
      });
    }

    if (isLatent && VAGUE_TRIGGER_KEYWORDS.test(body.shift)) {
      signals.push({
        code: 'latent-trigger',
        icon: '⏱️',
        name: 'Latent Trigger Blur',
        diagnosis: 'Latent trigger is ambiguous, so the GM cannot tell what releases the stored pressure.',
        fix: 'Name the exact discovery, commitment, threshold, or event that trips the latent state.',
        severity: 'medium',
        sceneTitle: scene.title,
        sceneOrder: scene.order,
        confidence: 'high',
        evidence: 'Vague trigger language detected in Trigger.',
      });
    }

    if (isLatent && isGenericAccumulation(body.drift)) {
      signals.push({
        code: 'latent-accumulation',
        icon: '🫧',
        name: 'Latent Pressure Leak',
        diagnosis: 'Latent accumulation does not show how tension compounds before the trigger resolves.',
        fix: 'State what builds over time: suspicion, instability, scarcity, attention, heat, or moral pressure.',
        severity: 'medium',
        sceneTitle: scene.title,
        sceneOrder: scene.order,
        confidence: body.drift.trim() ? 'medium' : 'high',
        evidence: body.drift.trim()
          ? 'Accumulation uses generic pressure language.'
          : 'Accumulation field is empty.',
      });
    }

    if (MOOD_WORDS.test(body.will) && !ACTOR_HINTS.test(body.will)) {
      signals.push({
        code: 'prescriptive-emotion',
        icon: '🎭',
        name: 'Prescriptive Emotion',
        diagnosis: 'Will describes vibe rather than active intent.',
        fix: 'Name the actor or force and what it is doing now.',
        severity: 'low',
        sceneTitle: scene.title,
        sceneOrder: scene.order,
        confidence: 'medium',
        evidence: 'Mood adjectives in Will with no clear acting subject.',
      });
    }

    if (/\b(only\s+exit|sealed\s+exit|lethal\s+trap|deadly\s+gauntlet)\b/i.test(body.ground) && /\b(guards?\s+patrol|live\s+here|regular\s+traffic|come\s+and\s+go)\b/i.test(body.will)) {
      signals.push({
        code: 'logic-conflict',
        icon: '🧩',
        name: 'Logic Conflict',
        diagnosis: 'Environment constraints appear to conflict with NPC behavior.',
        fix: 'Add bypass logic, immunity, or change tactics to fit the environment.',
        severity: 'medium',
        sceneTitle: scene.title,
        sceneOrder: scene.order,
        confidence: 'low',
        evidence: 'Potential Ground/Will contradiction pattern detected.',
      });
    }

    const srcNouns = extractCandidateNouns(scene.raw || '');
    const gwsdNouns = extractCandidateNouns(bodyAsString(scene));
    if (srcNouns.size >= 8) {
      const missing = [...srcNouns].filter((n) => !gwsdNouns.has(n));
      const missRatio = missing.length / srcNouns.size;
      if (missRatio >= 0.55 && missing.length >= 6) {
        signals.push({
          code: 'unreachable-code',
          icon: '🧹',
          name: 'Unreachable Code',
          diagnosis: 'Source details exist but are not represented in scene logic.',
          fix: 'Functionalize missing details with explicit GWSD effects or delete fluff.',
          severity: 'low',
          sceneTitle: scene.title,
          sceneOrder: scene.order,
          confidence: 'low',
          evidence: `Missing source details: ${missing.slice(0, 6).join(', ')}${missing.length > 6 ? ', …' : ''}`,
        });
      }
    }

    const mode = detectSceneMode(scene);
    const trapIntent = hasTrapIntent(scene, body);
    const trapTrigger = hasTrapTrigger(scene, body);
    const hazardGround = hasHazardGround(body);
    const hazardExposure = hasHazardExposure(scene, body);
    const driftChannel = detectDriftChannel(body.drift);
    const hpTaxOnly = !isLatent && HP_TAX_PATTERN.test(`${body.shift} ${body.drift}`) && !trapTrigger && !hazardExposure;

    if (!isLatent && mode === 'trap' && (!trapIntent || !trapTrigger)) {
      signals.push({
        code: 'trap-hazard-collapse',
        icon: '🪫',
        name: 'Trap-Hazard Collapse',
        diagnosis: 'Trap framing is present, but intent/trigger logic is underspecified.',
        fix: 'Encode an agentive Will and explicit trigger in Shift so players can infer, bypass, disarm, or exploit.',
        severity: 'high',
        sceneTitle: scene.title,
        sceneOrder: scene.order,
        confidence: 'high',
        evidence: `Trap mode detected but trap intent=${trapIntent ? 'yes' : 'no'} and trigger=${trapTrigger ? 'yes' : 'no'}.`,
      });
    }

    if (!isLatent && mode === 'hazard' && trapIntent) {
      signals.push({
        code: 'trap-hazard-collapse',
        icon: '🪫',
        name: 'Trap-Hazard Collapse',
        diagnosis: 'Hazard appears to contain agent intent, which changes how players should engage it.',
        fix: 'If this is a trap, model decision-trigger mechanics; if true hazard, remove goal-directed agency from Will.',
        severity: 'high',
        sceneTitle: scene.title,
        sceneOrder: scene.order,
        confidence: 'medium',
        evidence: 'Hazard mode with trap-like intent cues in Ground/Will.',
      });
    }

    if (!isLatent && mode === 'hazard' && driftChannel === 'response') {
      signals.push({
        code: 'trap-hazard-collapse',
        icon: '🪫',
        name: 'Trap-Hazard Collapse',
        diagnosis: 'Hazard Drift escalates response, implying adversarial behavior rather than environmental inevitability.',
        fix: 'Recode as trap, or rewrite Drift to increase inevitability (exposure, degradation, collapse) instead of response propagation.',
        severity: 'high',
        sceneTitle: scene.title,
        sceneOrder: scene.order,
        confidence: 'high',
        evidence: 'Hazard mode with response-shaped Drift.',
      });
    }

    if (!isLatent && mode === 'trap' && driftChannel === 'inevitability') {
      signals.push({
        code: 'trap-hazard-collapse',
        icon: '🪫',
        name: 'Trap-Hazard Collapse',
        diagnosis: 'Trap Drift escalates inevitability without adversarial response, blurring trap into hazard behavior.',
        fix: 'For true trap behavior, Drift should escalate response (alerts, mobilization, reset, lockout).',
        severity: 'medium',
        sceneTitle: scene.title,
        sceneOrder: scene.order,
        confidence: 'medium',
        evidence: 'Trap mode with inevitability-shaped Drift.',
      });
    }

    if ((!isLatent && mode === 'hazard' && !hazardGround && !hazardExposure) || hpTaxOnly) {
      signals.push({
        code: 'trap-hazard-collapse',
        icon: '🪫',
        name: 'Trap-Hazard Collapse',
        diagnosis: 'Scene resolves as generic contact damage without inference or exposure gameplay.',
        fix: 'For traps: add disarmable logic and resets or alerts. For hazards: add environmental constraints and cumulative exposure.',
        severity: 'medium',
        sceneTitle: scene.title,
        sceneOrder: scene.order,
        confidence: hpTaxOnly ? 'high' : 'medium',
        evidence: hpTaxOnly
          ? 'Shift or Drift read as contact-damage only (HP tax pattern).'
          : `Hazard mode with environmental ground=${hazardGround ? 'yes' : 'no'} and exposure model=${hazardExposure ? 'yes' : 'no'}.`,
      });
    }

    const willActors = countDistinctWillActors(body.will);
    if (!isLatent && willActors >= 2 && driftChannel === 'none') {
      signals.push({
        code: 'competing-vectors',
        icon: '🧲',
        name: 'Competing Vectors',
        diagnosis: 'Multiple active Wills compete without a dominant Drift channel to stabilize prediction.',
        fix: 'Prioritize one Will or encode Drift to declare the preferred next equilibrium (inevitability or response).',
        severity: 'high',
        sceneTitle: scene.title,
        sceneOrder: scene.order,
        confidence: willActors >= 3 ? 'high' : 'medium',
        evidence: `Detected ${willActors} distinct Will actors with no clear Drift channel.`,
      });
    }
  }

  for (let i = 0; i < scenes.length - 1; i++) {
    const bodyA = bodyAsString(scenes[i]);
    const bodyB = bodyAsString(scenes[i + 1]);
    if (!bodyA || !bodyB) continue;
    const similarity = wordSimilarity(bodyA, bodyB);
    if (similarity >= 0.8) {
      signals.push({
        code: 'echo',
        icon: '🔗',
        name: 'The Echo',
        diagnosis: 'Adjacent scenes may be functionally redundant.',
        fix: 'Differentiate Will or Shift so each scene changes play behavior.',
        severity: 'medium',
        sceneTitle: scenes[i].title,
        sceneOrder: scenes[i].order,
        relatedSceneTitle: scenes[i + 1].title,
        confidence: similarity >= 0.9 ? 'high' : 'medium',
        evidence: `Adjacent body similarity ${(similarity * 100).toFixed(0)}%.`,
      });
    }

    const deltaA = permissionDeltaScore(scenes[i]);
    const deltaB = permissionDeltaScore(scenes[i + 1]);
    const modeA = detectSceneMode(scenes[i]);
    const modeB = detectSceneMode(scenes[i + 1]);
    if (similarity >= 0.62 && modeA === modeB && deltaA === 0 && deltaB === 0) {
      signals.push({
        code: 'permission-shift',
        icon: '🧭',
        name: 'Permission Shift Gap',
        diagnosis: 'Scene boundary appears without a clear change in permissions, constraints, or capabilities.',
        fix: 'Either merge the scenes or state what is newly possible/impossible after this transition.',
        severity: 'medium',
        sceneTitle: scenes[i + 1].title,
        sceneOrder: scenes[i + 1].order,
        relatedSceneTitle: scenes[i].title,
        confidence: similarity >= 0.72 ? 'high' : 'medium',
        evidence: `Adjacent similarity ${(similarity * 100).toFixed(0)}%, same mode (${SCENE_MODE_META[modeB].label}), no permission-delta cues in Will/Shift/Drift.`,
      });
    }
  }

  for (let i = 0; i < scenes.length - 2; i++) {
    const a = sceneBody(scenes[i]).drift;
    const b = sceneBody(scenes[i + 1]).drift;
    const c = sceneBody(scenes[i + 2]).drift;
    if (!a || !b || !c) continue;

    const ab = wordSimilarity(a, b);
    const bc = wordSimilarity(b, c);
    if (ab >= 0.7 && bc >= 0.7) {
      signals.push({
        code: 'drift-stagnation',
        icon: '📉',
        name: 'Drift Stagnation',
        diagnosis: 'Consecutive Drift states are equivalent, so time is not changing the world-state gradient.',
        fix: 'Increase Drift gradient so each successive state worsens consequences (alert → search → lockdown → pursuit).',
        severity: 'medium',
        sceneTitle: scenes[i + 1].title,
        sceneOrder: scenes[i + 1].order,
        confidence: ab >= 0.8 && bc >= 0.8 ? 'high' : 'medium',
        evidence: `Drift equivalence run: ${(ab * 100).toFixed(0)}% / ${(bc * 100).toFixed(0)}%.`,
      });
    }
  }

  const ordered = [...scenes].sort((a, b) => a.order - b.order);

  for (let i = 0; i < ordered.length - 3; i++) {
    const window = ordered.slice(i, i + 4);
    const levels = window.map((scene) => detectPressureLevel(scene));
    const ranks = levels.map((level) => PRESSURE_META[level].rank);
    const distinctCount = new Set(levels).size;
    const hasEscalationOrWorse = ranks.some((rank) => rank >= PRESSURE_META.escalation.rank);
    const severeBackslide = ranks.some((rank, idx) => idx > 0 && rank <= ranks[idx - 1] - 2);
    const looksFlat = distinctCount <= 2 && !hasEscalationOrWorse;
    const hardStateChangeCount = window.filter(hasHardStateChange).length;
    const pressureEvidenceCount = window.filter(hasPressureEvidence).length;
    const explicitEscalationCount = window.filter((scene) => {
      const drift = sceneBody(scene).drift;
      const corpus = sceneCorpus(scene);
      return (
        PRESSURE_KEYWORDS.escalation.test(drift)
        || PRESSURE_KEYWORDS.irreversible.test(drift)
        || IRREVERSIBLE_STATE_KEYWORDS.test(corpus)
      );
    }).length;

    if (pressureEvidenceCount < 3 || explicitEscalationCount === 0) {
      continue;
    }

    if ((looksFlat || severeBackslide) && hardStateChangeCount < 2) {
      signals.push({
        code: 'pressure-chain',
        icon: '⛓️',
        name: 'Pressure Chain Weakness',
        diagnosis: 'Drift thresholds do not clearly climb through calm → complication → escalation → irreversible.',
        fix: 'Make Drift the tick: each next state must advance degradation or cross a non-reversible threshold.',
        severity: 'medium',
        sceneTitle: window[0].title,
        sceneOrder: window[0].order,
        relatedSceneTitle: window[window.length - 1].title,
        confidence: looksFlat ? 'high' : 'medium',
        evidence: `4-scene Drift-threshold sequence: ${levels.map((level) => PRESSURE_META[level].label).join(' → ')}.`,
      });
    }
  }

  let runStart = 0;
  while (runStart < ordered.length) {
    const startMode = detectSceneMode(ordered[runStart]);
    let runEnd = runStart + 1;
    while (runEnd < ordered.length && detectSceneMode(ordered[runEnd]) === startMode) {
      runEnd += 1;
    }

    const runLength = runEnd - runStart;
    if (runLength >= 3) {
      const modeMeta = SCENE_MODE_META[startMode];
      const first = ordered[runStart];
      const last = ordered[runEnd - 1];
      signals.push({
        code: 'solution-monotony',
        icon: '💤',
        name: 'Solution Monotony',
        diagnosis: 'Consecutive scenes rely on the same primary resolution verb, reducing decision bandwidth.',
        fix: `Insert an interstitial scene that requires a different verb than ${modeMeta.verb} to restore agency variety.`,
        severity: 'medium',
        sceneTitle: first.title,
        sceneOrder: first.order,
        relatedSceneTitle: last.title,
        confidence: runLength >= 4 ? 'high' : 'medium',
        evidence: `${runLength} consecutive ${modeMeta.icon} ${modeMeta.label} scenes (${modeMeta.verb}).`,
      });
    }

    runStart = runEnd;
  }

  const byRule = baseRuleCounts();
  for (const signal of signals) byRule[signal.code] += 1;

  return {
    generatedAt: new Date().toISOString(),
    sceneCount: scenes.length,
    signalCount: signals.length,
    byRule,
    signals,
  };
}

export function narrativeDiagnosticsReportToMarkdown(
  report: NarrativeDiagnosticsReport,
  title = 'GWSD Narrative Diagnostics Report',
): string {
  const lines: string[] = [];
  lines.push(`# ${title}`);
  lines.push('');
  lines.push(`- Generated: ${report.generatedAt}`);
  lines.push(`- Scene Cards: ${report.sceneCount}`);
  lines.push(`- Total Signals: ${report.signalCount}`);
  lines.push('');
  lines.push('## Signal Summary');
  lines.push('');

  const labels: Record<LintRuleCode, string> = {
    echo: '🔗 The Echo',
    railroad: '🛤️ The Railroad',
    museum: '📖 The Museum',
    'drift-stagnation': '📉 Drift Stagnation',
    'latent-trigger': '⏱️ Latent Trigger Blur',
    'latent-accumulation': '🫧 Latent Pressure Leak',
    'solution-monotony': '💤 Solution Monotony',
    'permission-shift': '🧭 Permission Shift Gap',
    'pressure-chain': '⛓️ Pressure Chain Weakness',
    'trap-hazard-collapse': '🪫 Trap-Hazard Collapse',
    'competing-vectors': '🧲 Competing Vectors',
    'false-urgency': '⚠️ False Urgency',
    'logic-conflict': '🧩 Logic Conflict',
    'unreachable-code': '🧹 Unreachable Code',
    'hidden-switch': '🕹️ The Hidden Switch',
    'prescriptive-emotion': '🎭 Prescriptive Emotion',
  };

  for (const code of Object.keys(report.byRule) as LintRuleCode[]) {
    lines.push(`- ${labels[code]}: ${report.byRule[code]}`);
  }

  lines.push('');
  lines.push('## Findings');
  lines.push('');

  if (report.signals.length === 0) {
    lines.push('No narrative signals detected.');
    return lines.join('\n');
  }

  report.signals.forEach((signal, idx) => {
    lines.push(`### ${idx + 1}. ${signal.icon} ${signal.name}`);
    lines.push(`- Severity: ${signal.severity}`);
    lines.push(`- Confidence: ${signal.confidence}`);
    if (signal.sceneTitle) lines.push(`- Scene: ${signal.sceneTitle}`);
    if (signal.relatedSceneTitle) lines.push(`- Related Scene: ${signal.relatedSceneTitle}`);
    lines.push(`- Diagnosis: ${signal.diagnosis}`);
    lines.push(`- Evidence: ${signal.evidence}`);
    lines.push(`- Suggested Fix: ${signal.fix}`);
    lines.push('');
  });

  return lines.join('\n');
}
