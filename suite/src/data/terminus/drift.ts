export type DriftMode = 'hazard' | 'trap';
export type DriftTypeId = 'hesitation' | 'ambient' | 'alert' | 'entropy';

export interface DriftDoctrinePoint {
  title: string;
  summary: string;
}

export interface DriftTypeInfo {
  id: DriftTypeId;
  name: string;
  drivesClock: string;
  feel: string;
  setting: string;
  guideUse: string;
}

export interface DriftModeInfo {
  id: DriftMode;
  name: string;
  test: string;
  driftShape: string;
  examples: string[];
}

export const DRIFT_DOCTRINE: DriftDoctrinePoint[] = [
  {
    title: 'Fill-in-the-blank',
    summary: 'Drift answers one Guide question: what happens if they stall? Pre-answering that is the exact moment most Guides improvise badly.',
  },
  {
    title: 'The type dial',
    summary: 'Protect this above everything else. What advances the clock (hesitation, ambient, alert, entropy) is the genre. Do not let it become optional.',
  },
  {
    title: 'Executable state',
    summary: 'Write Drift as a concrete end-of-round trigger, not vague urgency or mood text.',
  },
  {
    title: 'Do not freeze it',
    summary: 'An ability that pauses Drift pays the table for standing still. Foreknowledge is allowed. A pause button is not.',
  },
];

export const DRIFT_TYPES: DriftTypeInfo[] = [
  {
    id: 'hesitation',
    name: 'Hesitation',
    drivesClock: 'Player inaction, stalled choices, repeated errors, a ruptured step left unattended.',
    feel: 'Tense, deliberate, procedural.',
    setting: 'Tringad default. Routine protects the scene until the cell stalls.',
    guideUse: 'The city is watching. Drift ticks when the cell argues, delays, or leaves the fault alone.',
  },
  {
    id: 'ambient',
    name: 'Ambient',
    drivesClock: 'Automatic tick each round: weather, wildfire, collapse, unanchored Workings.',
    feel: 'Relentless, mythic, desperate.',
    setting: 'Aurel default. Nothing repeats, so nothing holds.',
    guideUse: 'The roof is burning. Drift climbs whether or not anyone acts. Solve it and get out.',
  },
  {
    id: 'alert',
    name: 'Alert',
    drivesClock: 'Loud actions, failed stealth, perimeter alarms, a Vector that is Loud.',
    feel: 'Measured, escalating, cat-and-mouse.',
    setting: 'Infiltration and heists, in any ward.',
    guideUse: 'Guards are sweeping. Quiet work does not tick it. A crossbow does.',
  },
  {
    id: 'entropy',
    name: 'Entropy',
    drivesClock: 'Environmental exposure, corruption, containment leak.',
    feel: 'Claustrophobic, degrading, survival.',
    setting: 'Anomaly and breach sites.',
    guideUse: 'The air is poisoning. Exposure is the clock, not a decision delay.',
  },
];

export const DRIFT_MODES: DriftModeInfo[] = [
  {
    id: 'hazard',
    name: 'Hazard',
    test: 'Waiting makes the environment worse.',
    driftShape: 'Exposure, degradation, collapse, contamination, flooding, smoke, heat, pressure, or resource loss.',
    examples: [
      'At the end of each round, the water rises another step on the ferry stair.',
      'At the end of each round, all characters in smoke lose 1 Endure circle unless protected.',
      'At the end of each round, one more floor section becomes unsafe.',
    ],
  },
  {
    id: 'trap',
    name: 'Trap',
    test: 'Waiting advances an active intent or response.',
    driftShape: 'Alerts, lockouts, pursuit, reset cycles, reinforcements, targeting, adaptation, or prepared opposition.',
    examples: [
      'At the end of each round, one more watch takes alert posture.',
      'At the end of each round, the vault locks one additional exit.',
      'At the end of each round, the mechanism selects a new target.',
    ],
  },
];

export const DRIFT_WRITING_RULES = [
  'Choose the Drift type first (hesitation, ambient, alert, or entropy). That is the dial. Do not skip it.',
  'Start with "At the end of each round..." or, for hesitation, "If the cell stalls..."',
  'Name a visible state change.',
  'Avoid "eventually," "soon," "the tension rises," and other fake urgency.',
  'Make each tick change what players can safely do next.',
  'If the Drift has no action consequence, rewrite it.',
];

export const SCENE_CARD_PREP = {
  burden:
    'Four boxes per scene is real prep. If Guides fill two and wing the rest, the engine\'s best feature becomes optional.',
  fillFirst:
    'If you only fill one box, fill Drift. Write the type and one executable sentence. That is the feature you must not wing.',
  fillSecond:
    'Will second: pick an interested party first. Their interest is the Will box.',
  theRest:
    'Ground and Shift can start as one sentence each. They thicken in play. Drift that starts empty will stay empty.',
} as const;
