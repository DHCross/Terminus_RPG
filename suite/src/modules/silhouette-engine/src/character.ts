/* ── Silhouette RPG — Character Model ── */

import type { DieSize, InitiativePhase } from './dice';
import { initiativePhaseFromAgility, pipCount } from './dice';

export const ACTION_STATS = ['force', 'agility', 'willpower'] as const;
export type ActionStat = typeof ACTION_STATS[number];

export const DEFENSE_STATS = ['endure', 'avoid', 'exert'] as const;
export type DefenseStat = typeof DEFENSE_STATS[number];

export interface ActionDice {
  force: DieSize;
  agility: DieSize;
  willpower: DieSize;
}

export interface DefenseDice {
  endure: DieSize;
  avoid: DieSize;
  exert: DieSize;
}

export interface TrackState {
  current: number;
  max: number;
}

export interface CharacterTracks {
  endure: TrackState;
  vitality: TrackState;
  avoid: TrackState;
  exert: TrackState;
}

export const ARMOR_TYPES = ['none', 'leather', 'chain', 'plate'] as const;
export type ArmorType = typeof ARMOR_TYPES[number];

export const ARMOR_REDUCTION: Record<ArmorType, number> = {
  none: 0,
  leather: 1,
  chain: 1,
  plate: 2,
};

export const WEAPON_VECTORS = [
  'armor-piercing',
  'cannot-be-avoided',
  'targets-position',
  'direct-harm',
  'bonus-impact',
] as const;
export type WeaponVector = typeof WEAPON_VECTORS[number];

export interface WeaponProfile {
  name: string;
  impact: number;
  vectors: WeaponVector[];
  bonusImpact?: number;
  notes?: string;
}

export interface CharacterIdentity {
  background: string;
  immediateWant: string;
  origin?: string;
  deity?: string;
}

export interface CharacterDefinition {
  id: string;
  name: string;
  identity: CharacterIdentity;
  actions: ActionDice;
  defenses: DefenseDice;
  armor: ArmorType;
  weapons: {
    primary: WeaponProfile;
    secondary?: WeaponProfile;
  };
  notes?: string[];
}

export interface Character {
  id: string;
  name: string;
  identity: CharacterIdentity;
  actions: ActionDice;
  defenses: DefenseDice;
  tracks: CharacterTracks;
  armor: ArmorType;
  weapons: {
    primary: WeaponProfile;
    secondary: WeaponProfile;
  };
  initiativePhase: InitiativePhase;
  notes: string[];
}

export interface EnemyDefinition extends CharacterDefinition {
  behavior: string;
  attack?: WeaponProfile;
}

export interface Enemy extends Character {
  behavior: string;
  attack: WeaponProfile;
}

export const CONSEQUENCE_NAMES = [
  'cornered',
  'disarmed',
  'exposed',
  'separated',
  'prone',
  'pinned',
  'driven back',
  'off-balance',
  'delayed',
  'silenced',
  'cut off',
  'forced into hazard',
] as const;
export type ConsequenceName = typeof CONSEQUENCE_NAMES[number];

export function createTrack(die: DieSize): TrackState {
  const max = pipCount(die);
  return { current: max, max };
}

export function createTracks(defenses: DefenseDice): CharacterTracks {
  return {
    endure: createTrack(defenses.endure),
    vitality: createTrack(defenses.endure),
    avoid: createTrack(defenses.avoid),
    exert: createTrack(defenses.exert),
  };
}

export function defaultSecondaryWeapon(): WeaponProfile {
  return {
    name: 'Backup weapon',
    impact: 1,
    vectors: [],
  };
}

export function createCharacter(definition: CharacterDefinition): Character {
  return {
    id: definition.id,
    name: definition.name,
    identity: definition.identity,
    actions: definition.actions,
    defenses: definition.defenses,
    tracks: createTracks(definition.defenses),
    armor: definition.armor,
    weapons: {
      primary: definition.weapons.primary,
      secondary: definition.weapons.secondary ?? defaultSecondaryWeapon(),
    },
    initiativePhase: initiativePhaseFromAgility(definition.actions.agility),
    notes: definition.notes ?? [],
  };
}

export const createCharacterFrame = createCharacter;

export function createEnemy(definition: EnemyDefinition): Enemy {
  const character = createCharacter(definition);
  return {
    ...character,
    behavior: definition.behavior,
    attack: definition.attack ?? character.weapons.primary,
  };
}
