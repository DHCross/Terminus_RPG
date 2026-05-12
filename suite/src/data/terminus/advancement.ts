import type { Die } from './skills';

/**
 * Advancement Point economy for Terminus RPG
 * Escalating costs preserve pressure economy balance
 */
export const ADVANCEMENT_COSTS = {
  'd4_to_d6': 3,
  'd6_to_d8': 6,
  'd8_to_d10': 9,
  'd10_to_d12': 12,
} as const;

/**
 * Threshold mapping: Die value to number of active thresholds
 */
export const THRESHOLD_MAPPING: Record<Die, number> = {
  'd4': 1,
  'd6': 2,
  'd8': 3,
  'd10': 4,
  'd12': 5,
};

/**
 * Skill Die system - broad categories, not granular skills
 */
export const SKILL_DISCIPLINES = [
  'Lore',
  'Fieldcraft',
  'Influence',
  'Labor',
  'Observation',
  'Transit',
] as const;

export type SkillDiscipline = typeof SKILL_DISCIPLINES[number];

/**
 * Character baseline at creation
 */
export const CHARACTER_BASELINE = {
  Force: 'd4' as Die,
  Agility: 'd4' as Die,
  Willpower: 'd4' as Die,
} as const;

/**
 * Upgrade options available during character creation
 * Player chooses where to place each upgrade once
 */
export const CREATION_UPGRADES = [
  { label: 'Primary', targetDie: 'd10' as Die, description: 'One skill excels' },
  { label: 'Secondary', targetDie: 'd8' as Die, description: 'One skill is strong' },
  { label: 'Fallback', targetDie: 'd6' as Die, description: 'One skill is competent' },
] as const;

/**
 * Order abilities don't directly increase dice
 * They grant permissions and reactions
 */
export interface OrderAbility {
  name: string;
  limitation: 'once_per_scene' | 'once_per_exchange' | 'once_per_operation' | 'at_will';
  description: string;
  effect: string;
}

/**
 * Equipment impacts defense and mitigation
 * Not stat inflation
 */
export interface EquipmentSet {
  armor: {
    name: string;
    reduction: number;
    burden: number;
  };
  shield?: {
    name: string;
    reduction: number;
    burden: number;
  };
  signature: {
    name: string;
    description: string;
    mechanic: string;
  };
}

/**
 * Character creation state
 */
export interface CharacterCreationState {
  // Base identity
  name: string;
  order: string;
  origin: string;
  jurisdiction?: string;

  // Skills (baseline d4, then three upgrades)
  Force: Die;
  Agility: Die;
  Willpower: Die;

  // Auto-derived thresholds
  Endure: number;
  Avoid: number;
  Exert: number;

  // Skill Disciplines (optional, broad categories)
  skillDisciplines?: Record<SkillDiscipline, Die>;

  // Equipment
  equipment?: EquipmentSet;

  // Advancement tracking
  advancementPoints: number;
  completedOperations: number;
}

/**
 * Calculate thresholds from skill die
 */
export function deriveThresholds(skills: { Force: Die; Agility: Die; Willpower: Die }) {
  return {
    Endure: THRESHOLD_MAPPING[skills.Force],
    Avoid: THRESHOLD_MAPPING[skills.Agility],
    Exert: THRESHOLD_MAPPING[skills.Willpower],
  };
}

/**
 * Determine if a character can advance a skill
 */
export function canAdvanceSkill(currentDie: Die, availableAP: number): boolean {
  if (currentDie === 'd12') return false; // Maximum reached
  const diceOrder = ['d4', 'd6', 'd8', 'd10', 'd12'] as const;
  const currentIndex = diceOrder.indexOf(currentDie);
  const costKey = `${diceOrder[currentIndex]}_to_${diceOrder[currentIndex + 1]}` as keyof typeof ADVANCEMENT_COSTS;
  return availableAP >= ADVANCEMENT_COSTS[costKey];
}

/**
 * Calculate cost to advance a skill
 */
export function advancementCost(currentDie: Die): number {
  const diceOrder = ['d4', 'd6', 'd8', 'd10', 'd12'] as const;
  const currentIndex = diceOrder.indexOf(currentDie);
  if (currentIndex === -1 || currentIndex === 4) return Infinity; // Invalid or d12
  const costKey = `${diceOrder[currentIndex]}_to_${diceOrder[currentIndex + 1]}` as keyof typeof ADVANCEMENT_COSTS;
  return ADVANCEMENT_COSTS[costKey];
}

/**
 * Advance a skill die, consuming AP
 */
export function advanceSkill(currentDie: Die, availableAP: number): { newDie: Die; apSpent: number } | null {
  const diceOrder = ['d4', 'd6', 'd8', 'd10', 'd12'] as const;
  const currentIndex = diceOrder.indexOf(currentDie);
  if (currentIndex === -1 || currentIndex === 4) return null; // Invalid or at maximum
  
  const nextDie = diceOrder[currentIndex + 1];
  const costKey = `${diceOrder[currentIndex]}_to_${nextDie}` as keyof typeof ADVANCEMENT_COSTS;
  const cost = ADVANCEMENT_COSTS[costKey];
  
  if (availableAP < cost) return null; // Not enough AP
  
  return { newDie: nextDie, apSpent: cost };
}
