/* ── Coherence System — Scene Card Schema ── */

import type { ActionStat, ConsequenceName, WeaponVector } from './character';

/** Agency answers what the characters can actually do right now. */
export interface AgencyOption {
  summary: string;
  available: boolean;
  blockedBy?: string[];
  opensWhen?: string;
}

export const PRESSURE_TYPES = ['combat', 'social', 'environmental', 'temporal', 'occult'] as const;
export type PressureType = typeof PRESSURE_TYPES[number];

/** Pressure is the force actively pushing the scene somewhere bad. */
export interface PressureVector {
  source: string;
  summary: string;
  type: PressureType;
  escalation?: string;
  visible: boolean;
}

/** Contingency records what changes once the players commit to action. */
export interface ContingencyOutcome {
  trigger: string;
  change: string;
  effect?: MechanicalEffect;
}

/** Consequence tracks what worsens on its own if the party hesitates. */
export interface ConsequenceClock {
  ifIgnored: string;
  escalation: string;
  ticks?: {
    current: number;
    max: number;
    label?: string;
  };
  terminal?: boolean;
}

export interface ThreatAttack {
  action: ActionStat;
  impact: number;
  vectors: WeaponVector[];
}

export const ACTIVE_THREAT_ROLES = ['ambusher', 'authority', 'holder', 'predator', 'hazard', 'rival'] as const;
export type ActiveThreatRole = typeof ACTIVE_THREAT_ROLES[number];

export interface ActiveThreat {
  id: string;
  name: string;
  role: ActiveThreatRole;
  attack: ThreatAttack;
  behavior: string;
}

export interface EnvironmentNote {
  summary: string;
  tags?: string[];
}

/** The hidden truth exists for the Guide, never for the denizens. */
export interface SimulationSecret {
  premise: string;
  concealmentDirective: string;
  fractureSigns: string[];
  guideOnly: boolean;
}

export interface MechanicalEffect {
  target: 'endure' | 'vitality' | 'avoid' | 'exert' | 'initiative' | 'agency' | 'pressure';
  delta?: number;
  description: string;
  consequence?: ConsequenceName;
}

export interface SceneCard {
  id: string;
  name: string;
  campaignId: string;
  agency: AgencyOption[];
  pressure: PressureVector[];
  contingency: ContingencyOutcome[];
  consequence: ConsequenceClock[];
  activeThreats: ActiveThreat[];
  environmentNotes: EnvironmentNote[];
  simulation?: SimulationSecret;
  tags: string[];
}
