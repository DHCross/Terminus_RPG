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
 * Character baseline at creation
 */
export const CHARACTER_BASELINE = {
  Force: 'd4' as Die,
  Agility: 'd4' as Die,
  Willpower: 'd4' as Die,
} as const;

/**
 * Upgrade options available during character creation
 */
export const CREATION_UPGRADES = [
  { label: 'Primary', targetDie: 'd10' as Die, description: 'One skill excels' },
  { label: 'Secondary', targetDie: 'd8' as Die, description: 'One skill is strong' },
  { label: 'Fallback', targetDie: 'd6' as Die, description: 'One skill is competent' },
] as const;

export interface CharacterCreationState {
  name: string;
  order: string;
  origin: string;
  Force: Die;
  Agility: Die;
  Willpower: Die;
  Endure: number;
  Avoid: number;
  Exert: number;
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
  if (currentDie === 'd12') return false;
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
  if (currentIndex === -1 || currentIndex === 4) return Infinity;
  const costKey = `${diceOrder[currentIndex]}_to_${diceOrder[currentIndex + 1]}` as keyof typeof ADVANCEMENT_COSTS;
  return ADVANCEMENT_COSTS[costKey];
}

/**
 * Advance a skill die, consuming AP
 */
export function advanceSkill(currentDie: Die, availableAP: number): { newDie: Die; apSpent: number } | null {
  const diceOrder = ['d4', 'd6', 'd8', 'd10', 'd12'] as const;
  const currentIndex = diceOrder.indexOf(currentDie);
  if (currentIndex === -1 || currentIndex === 4) return null;
  
  const nextDie = diceOrder[currentIndex + 1];
  const costKey = `${diceOrder[currentIndex]}_to_${nextDie}` as keyof typeof ADVANCEMENT_COSTS;
  const cost = ADVANCEMENT_COSTS[costKey];
  
  if (availableAP < cost) return null;
  
  return { newDie: nextDie, apSpent: cost };
}
