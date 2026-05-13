export type DriftMode = 'hazard' | 'trap';

export interface DriftDoctrinePoint {
  title: string;
  summary: string;
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
    title: 'The Else Statement',
    summary: 'Drift answers one GM question: what changes if the players do nothing?',
  },
  {
    title: 'Executable State',
    summary: 'Write Drift as a concrete end-of-round trigger, not vague urgency or mood text.',
  },
  {
    title: 'Rhythm Engine',
    summary: 'Drift creates forward motion automatically, so the GM does not have to invent pacing pressure mid-scene.',
  },
  {
    title: 'Threat Classifier',
    summary: 'The shape of Drift tells the GM whether the scene is behaving like a Hazard or a Trap.',
  },
];

export const DRIFT_MODES: DriftModeInfo[] = [
  {
    id: 'hazard',
    name: 'Hazard',
    test: 'Waiting makes the environment worse.',
    driftShape: 'Exposure, degradation, collapse, contamination, flooding, smoke, heat, pressure, or resource loss.',
    examples: [
      'At the end of each round, the water rises 5 feet.',
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
      'At the end of each round, one more guard squad enters alert posture.',
      'At the end of each round, the vault locks one additional exit.',
      'At the end of each round, the mechanism selects a new target.',
    ],
  },
];

export const DRIFT_WRITING_RULES = [
  'Start with "At the end of each round..."',
  'Name a visible state change.',
  'Avoid "eventually," "soon," "the tension rises," and other fake urgency.',
  'Make each tick change what players can safely do next.',
  'If the Drift has no action consequence, rewrite it.',
];
