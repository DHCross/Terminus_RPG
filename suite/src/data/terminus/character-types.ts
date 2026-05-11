/**
 * Unified Character type system for Terminus RPG
 * Single source of truth for all character data across Generator, Card, Vault, and Advancement.
 */

import type { Die } from './skills';
import type { OrderAbility } from './orders';

/* ── Core enums / constants ── */

export const SPECIES_IDS = ['human', 'high_alfar', 'deep_alfar', 'wild_alfar', 'stoneborn'] as const;
export type SpeciesId = typeof SPECIES_IDS[number];

export const ORDER_IDS = ['seeker', 'breaker', 'warden', 'rival', 'broker', 'shade'] as const;
export type OrderId = typeof ORDER_IDS[number];

/* ── Skill / Threshold core types ── */

export interface SkillSet {
  Force: Die;
  Agility: Die;
  Willpower: Die;
}

export interface ThresholdSet {
  Endure: number;
  Avoid: number;
  Exert: number;
}

/* ── Equipment ── */

export interface CharacterEquipment {
  primaryWeapon: string;
  secondaryWeapon: string;
  armor: string;
}

/* ── Background / lore fields ── */

export interface CharacterBackground {
  region: string;
  localOrigin: string;
  oldOffice: string;
  localRite: string;
  accordRelationship: string;
  frame: string;
  edge: string;
}

/* ── The unified Character interface ── */

export interface Character {
  // Identity
  id: string;
  name: string;
  species: SpeciesId | '';
  order: OrderId | '';
  approach: string;
  signature: string;

  // Selected abilities (names from the order's ability list)
  selectedAbilities: string[];

  // Skills → Thresholds are always derived, but stored for display
  skills: SkillSet;

  // Equipment
  equipment: CharacterEquipment;

  // Background / narrative
  background: CharacterBackground;

  // Free-form notes
  orderAbilitiesNotes: string;

  // Advancement
  advancementPoints: number;
  completedOperations: number;

  // Timestamps
  createdAt: string;
  updatedAt: string;
}

/* ── Defaults ── */

export const DEFAULT_SKILLS: SkillSet = {
  Force: 'd4',
  Agility: 'd4',
  Willpower: 'd4',
};

export const DEFAULT_EQUIPMENT: CharacterEquipment = {
  primaryWeapon: 'unarmed',
  secondaryWeapon: '',
  armor: 'none',
};

export const DEFAULT_BACKGROUND: CharacterBackground = {
  region: '',
  localOrigin: '',
  oldOffice: '',
  localRite: '',
  accordRelationship: '',
  frame: '',
  edge: '',
};

export function createBlankCharacter(): Character {
  return {
    id: '',
    name: 'New Character',
    species: '',
    order: '',
    approach: '',
    signature: '',
    selectedAbilities: [],
    skills: { ...DEFAULT_SKILLS },
    equipment: { ...DEFAULT_EQUIPMENT },
    background: { ...DEFAULT_BACKGROUND },
    orderAbilitiesNotes: '',
    advancementPoints: 0,
    completedOperations: 0,
    createdAt: '',
    updatedAt: '',
  };
}

/* ── Threshold derivation (single source of truth) ── */

const THRESHOLD_FROM_DIE: Record<Die, number> = {
  'd4': 1,
  'd6': 2,
  'd8': 3,
  'd10': 4,
  'd12': 5,
};

export function deriveThresholds(skills: SkillSet): ThresholdSet {
  return {
    Endure: THRESHOLD_FROM_DIE[skills.Force],
    Avoid: THRESHOLD_FROM_DIE[skills.Agility],
    Exert: THRESHOLD_FROM_DIE[skills.Willpower],
  };
}
