import type { Die } from './skills';
import { CREATION_UPGRADES } from './advancement';

/**
 * Character origins/lineages for Terminus RPG
 * Combined with Orders for archetype variation
 */
export const ORIGINS = [
  {
    id: 'human-settled',
    name: 'Human (Settled)',
    description: 'Born into civic structures',
    archetypalBonus: 'Force' as const,
  },
  {
    id: 'human-verge',
    name: 'Human (Verge)',
    description: 'From frontier settlements',
    archetypalBonus: 'Agility' as const,
  },
  {
    id: 'stoneborn-holds',
    name: 'Stoneborn (Holds)',
    description: 'Deep dwellers, systematic',
    archetypalBonus: 'Willpower' as const,
  },
  {
    id: 'stoneborn-peaks',
    name: 'Stoneborn (Peaks)',
    description: 'High dwellers, sparse',
    archetypalBonus: 'Force' as const,
  },
  {
    id: 'wild-alfar',
    name: 'Wild Alfar',
    description: 'Wanderers and outsiders',
    archetypalBonus: 'Agility' as const,
  },
  {
    id: 'high-alfar',
    name: 'High Alfar',
    description: 'Arcane-trained, structured',
    archetypalBonus: 'Willpower' as const,
  },
] as const;

export type OriginId = typeof ORIGINS[number]['id'];

/**
 * Archetype templates: Order + Origin combinations
 * Define which skill gets the primary upgrade
 */
export interface Archetype {
  order: string;
  origin: OriginId;
  name: string;
  description: string;
  primarySkill: 'Force' | 'Agility' | 'Willpower';
  secondarySkill: 'Force' | 'Agility' | 'Willpower';
  fallbackSkill: 'Force' | 'Agility' | 'Willpower';
}

/**
 * Generate archetype from Order and Origin
 * Ensures both systems influence character shape
 */
export function generateArchetype(orderId: string, originId: OriginId): Archetype {
  const origin = ORIGINS.find(o => o.id === originId);
  if (!origin) throw new Error(`Unknown origin: ${originId}`);

  // Order archetypal shapes
  const orderArchetypes: Record<string, { primary: 'Force' | 'Agility' | 'Willpower'; secondary: 'Force' | 'Agility' | 'Willpower'; fallback: 'Force' | 'Agility' | 'Willpower' }> = {
    'Seeker': { primary: 'Willpower', secondary: 'Agility', fallback: 'Force' },
    'Breaker': { primary: 'Force', secondary: 'Agility', fallback: 'Willpower' },
    'Warden': { primary: 'Force', secondary: 'Willpower', fallback: 'Agility' },
    'Rival': { primary: 'Agility', secondary: 'Force', fallback: 'Willpower' },
    'Broker': { primary: 'Willpower', secondary: 'Force', fallback: 'Agility' },
    'Shade': { primary: 'Agility', secondary: 'Willpower', fallback: 'Force' },
  };

  const orderShape = orderArchetypes[orderId];
  if (!orderShape) throw new Error(`Unknown order: ${orderId}`);

  return {
    order: orderId,
    origin: originId,
    name: `${orderId} of ${origin.name}`,
    description: `A ${origin.description.toLowerCase()} member of the ${orderId} Order`,
    primarySkill: orderShape.primary,
    secondarySkill: orderShape.secondary,
    fallbackSkill: orderShape.fallback,
  };
}

/**
 * Apply archetype to character creation state
 * Assigns the three creation upgrades to appropriate skills
 */
export function applyArchetypeUpgrades(
  archetype: Archetype
): Record<'Force' | 'Agility' | 'Willpower', Die> {
  const baseline = { Force: 'd4' as Die, Agility: 'd4' as Die, Willpower: 'd4' as Die };
  
  // Apply three upgrades in order
  const upgrades = CREATION_UPGRADES.map(u => u.targetDie);
  const skills = [archetype.primarySkill, archetype.secondarySkill, archetype.fallbackSkill];
  
  skills.forEach((skill, index) => {
    baseline[skill] = upgrades[index];
  });
  
  return baseline;
}

/**
 * Random character generation
 * Rolls archetype then applies upgrades
 */
export function generateRandomCharacter(orderId: string, originId?: OriginId) {
  // If origin not specified, pick randomly
  const selectedOrigin = originId || ORIGINS[Math.floor(Math.random() * ORIGINS.length)].id;
  
  const archetype = generateArchetype(orderId, selectedOrigin);
  const skills = applyArchetypeUpgrades(archetype);
  
  return {
    archetype,
    skills,
  };
}
