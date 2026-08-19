import type {
  ActionStat,
  ActiveThreat,
  ActiveThreatRole,
  PressureType,
  SimulationSecret,
  WeaponVector,
} from '../coherence-engine/src/index.ts';
import type {
  GWSDBody,
  GWSDScope,
  CoherenceProjection,
} from './types';
import {
  isLatentBody,
  COHERENCE_SECTION_ORDER,
} from './types';

interface ProjectionInput {
  id: string;
  title: string;
  adventure: string;
  body: GWSDBody;
  raw: string;
  scope?: GWSDScope;
}

const PRESSURE_PATTERNS: Array<{ type: PressureType; patterns: RegExp[] }> = [
  {
    type: 'combat',
    patterns: [/\b(?:attack|ambush|hunt|strike|kill|swarm|predator|fight|blood|weapon)\b/i],
  },
  {
    type: 'social',
    patterns: [/\b(?:demand|convince|persuade|negotiate|command|threaten|witness|crowd|trust|deceive)\b/i],
  },
  {
    type: 'environmental',
    patterns: [/\b(?:flood|fire|smoke|collapse|cold|heat|rot|poison|pit|storm|gas|filth|hazard)\b/i],
  },
  {
    type: 'temporal',
    patterns: [/\b(?:delay|clock|countdown|before|after|until|time|dawn|sunset|running out|too late)\b/i],
  },
  {
    type: 'occult',
    patterns: [/\b(?:ritual|curse|ghost|omen|anomaly|glitch|fracture|dream|impossible|machine|system)\b/i],
  },
];

function normalizeText(text: string, fallback: string): string {
  const cleaned = text.replace(/\s+/g, ' ').trim();
  return cleaned || fallback;
}

function toSentence(text: string): string {
  const cleaned = text.replace(/\s+/g, ' ').trim();
  if (!cleaned) return '';
  return /[.!?]$/.test(cleaned) ? cleaned : `${cleaned}.`;
}

function titleCase(value: string): string {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function projectAgencyText(body: GWSDBody): string {
  const ground = normalizeText(
    body.ground,
    'The present conditions create a narrow but usable opening for action.',
  );
  if (/\b(?:the party can|players can|characters can)\b/i.test(ground)) {
    return toSentence(ground);
  }
  return toSentence(`Work through the present conditions: ${ground}`);
}

function projectPressureText(body: GWSDBody): string {
  return toSentence(
    normalizeText(body.will, 'An active force is already pushing the scene toward a worse state.'),
  );
}

function projectContingencyText(body: GWSDBody): string {
  const source = isLatentBody(body)
    ? body.trigger
    : body.shift;
  const fallback = isLatentBody(body)
    ? 'If the party exposes the hidden pressure, the scene resolves into action.'
    : 'If the party commits, the local balance changes immediately.';
  return toSentence(normalizeText(source, fallback));
}

function projectConsequenceText(body: GWSDBody): string {
  const source = isLatentBody(body)
    ? body.accumulation
    : body.drift;
  const fallback = isLatentBody(body)
    ? 'If the party lets the pressure build, the scene hardens before the reveal lands.'
    : 'If the party delays, pressure escalates and the scene worsens.';
  return toSentence(normalizeText(source, fallback));
}

function inferPressureType(text: string, stateType: GWSDBody['stateType']): PressureType {
  const scores = new Map<PressureType, number>();
  for (const entry of PRESSURE_PATTERNS) {
    const hits = entry.patterns.reduce((count, pattern) => count + Number(pattern.test(text)), 0);
    scores.set(entry.type, hits);
  }

  let bestType: PressureType = stateType === 'latent' ? 'occult' : 'environmental';
  let bestScore = -1;
  for (const [type, score] of scores) {
    if (score > bestScore) {
      bestType = type;
      bestScore = score;
    }
  }

  return bestType;
}

function extractPressureSource(text: string, pressureType: PressureType): string {
  const match = text.match(/^(?:the\s+)?(.+?)\s+(?:wants?|intends?|seeks?|tries?|attempts?|plans?|plots?|hunts?|stalks?|guards?|demands?|pressures?|lures?|baits?|draws?|entices?|beckons?)\b/i);
  if (match?.[1]) {
    return titleCase(match[1].trim());
  }

  switch (pressureType) {
    case 'combat':
      return 'Opposition Force';
    case 'social':
      return 'Social Pressure';
    case 'temporal':
      return 'Scene Clock';
    case 'occult':
      return 'Hidden Fault';
    default:
      return 'Scene Hazard';
  }
}

function inferThreatRole(pressureType: PressureType): ActiveThreatRole {
  switch (pressureType) {
    case 'combat':
      return 'predator';
    case 'social':
      return 'authority';
    case 'temporal':
      return 'holder';
    case 'occult':
      return 'rival';
    default:
      return 'hazard';
  }
}

function inferThreatAction(pressureType: PressureType): ActionStat {
  switch (pressureType) {
    case 'social':
    case 'occult':
      return 'willpower';
    case 'environmental':
    case 'temporal':
      return 'agility';
    default:
      return 'force';
  }
}

function inferThreatImpact(text: string, pressureType: PressureType): number {
  if (/\b(?:crush|kill|burn|flood|collapse|overrun|swarm|tear apart)\b/i.test(text)) {
    return 2;
  }
  return pressureType === 'combat' ? 2 : 1;
}

function inferVectors(text: string, pressureType: PressureType): WeaponVector[] {
  const vectors: WeaponVector[] = [];
  if (pressureType === 'environmental' || /\b(?:drive back|surround|corner|pin|close in)\b/i.test(text)) {
    vectors.push('targets-position');
  }
  if (/\b(?:inescapable|unavoidable|fills the room|cannot avoid|no way around)\b/i.test(text)) {
    vectors.push('cannot-be-avoided');
  }
  if (/\b(?:pierce|arrow|bolt|spear|shot|armor)\b/i.test(text)) {
    vectors.push('armor-piercing');
  }
  if (/\b(?:curse|poison|rot|bleed|burn|directly harms?)\b/i.test(text)) {
    vectors.push('direct-harm');
  }
  return vectors;
}

function buildActiveThreats(id: string, pressureText: string, pressureType: PressureType): ActiveThreat[] {
  if (!pressureText.trim()) {
    return [];
  }

  return [
    {
      id: `${id}-pressure`,
      name: extractPressureSource(pressureText, pressureType),
      role: inferThreatRole(pressureType),
      attack: {
        action: inferThreatAction(pressureType),
        impact: inferThreatImpact(pressureText, pressureType),
        vectors: inferVectors(pressureText, pressureType),
      },
      behavior: pressureText,
    },
  ];
}

function buildSimulationSecret(raw: string): SimulationSecret | undefined {
  if (!/\b(?:simulation|system|glitch|anomaly|fracture|render|machine)\b/i.test(raw)) {
    return undefined;
  }

  const fractureSigns = Array.from(
    new Set(
      (raw.match(/\b(?:glitch|anomaly|fracture|render tear|machine noise|impossible repeat|loop)\b/gi) ?? [])
        .map((entry) => entry.toLowerCase()),
    ),
  );

  return {
    premise: 'A hidden machine truth is leaking through the scene surface.',
    concealmentDirective: 'Keep the systemic truth invisible to the denizens until the campaign chooses to expose it.',
    fractureSigns,
    guideOnly: true,
  };
}

export function buildCoherenceProjection(input: ProjectionInput): CoherenceProjection {
  const agencyText = projectAgencyText(input.body);
  const pressureText = projectPressureText(input.body);
  const contingencyText = projectContingencyText(input.body);
  const consequenceText = projectConsequenceText(input.body);
  const environmentSummary = toSentence(
    normalizeText(input.body.ground, 'The space holds steady until pressure forces a change.'),
  );
  const pressureType = inferPressureType(
    `${pressureText} ${consequenceText} ${input.raw}`,
    input.body.stateType,
  );
  const activeThreats = buildActiveThreats(input.id, pressureText, pressureType);
  const tags = [
    input.body.stateType,
    pressureType,
    input.scope?.depth ?? 'scene',
  ];

  return {
    sceneCard: {
      id: input.id,
      name: input.title,
      campaignId: input.adventure,
      agency: [{ summary: agencyText, available: true }],
      pressure: [{
        source: extractPressureSource(pressureText, pressureType),
        summary: pressureText,
        type: pressureType,
        escalation: consequenceText,
        visible: input.body.stateType === 'active',
      }],
      contingency: [{
        trigger: input.body.stateType === 'latent' ? 'The hidden pressure is exposed or engaged.' : 'The party commits against the pressure.',
        change: contingencyText,
      }],
      consequence: [{
        ifIgnored: input.body.stateType === 'latent'
          ? 'If the party lets the latent pressure continue to build.'
          : 'If the party delay or do nothing.',
        escalation: consequenceText,
        terminal: /\b(?:irreversible|too late|collapse|consumed|lost for good|no escape)\b/i.test(consequenceText),
      }],
      activeThreats,
      environmentNotes: [{ summary: environmentSummary, tags }],
      simulation: buildSimulationSecret(input.raw),
      tags,
    },
    sections: COHERENCE_SECTION_ORDER.map((key) => {
      switch (key) {
        case 'agency':
          return { key, text: agencyText };
        case 'pressure':
          return { key, text: pressureText };
        case 'contingency':
          return { key, text: contingencyText };
        case 'consequence':
          return { key, text: consequenceText };
      }
    }) as CoherenceProjection['sections'],
    pressureType,
    environmentSummary,
  };
}