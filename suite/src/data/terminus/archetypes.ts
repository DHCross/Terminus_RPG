import type { Die } from './skills';
import { CREATION_UPGRADES } from './advancement';

/**
 * Character origins/lineages for Terminus RPG
 */
export const ORIGINS = [
  {
    id: 'human-settled',
    name: 'Human (Settled)',
    description: 'Born into civic structures',
    archetypalBonus: 'Force',
  },
  {
    id: 'human-verge',
    name: 'Human (Verge)',
    description: 'From frontier settlements',
    archetypalBonus: 'Agility',
  },
  {
    id: 'stoneborn-holds',
    name: 'Stoneborn (Holds)',
    description: 'Deep dwellers, systematic',
    archetypalBonus: 'Willpower',
  },
  {
    id: 'stoneborn-peaks',
    name: 'Stoneborn (Peaks)',
    description: 'High dwellers, sparse',
    archetypalBonus: 'Force',
  },
  {
    id: 'wild-alfar',
    name: 'Wild Alfar',
    description: 'Wanderers and outsiders',
    archetypalBonus: 'Agility',
  },
  {
    id: 'high-alfar',
    name: 'High Alfar',
    description: 'Arcane-trained, structured',
    archetypalBonus: 'Willpower',
  },
] as const;

export type OriginId = typeof ORIGINS[number]['id'];

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
 */
export function generateArchetype(orderId: string, originId: OriginId): Archetype {
  const origin = ORIGINS.find(o => o.id === originId);
  if (!origin) throw new Error(`Unknown origin: ${originId}`);

  // Normalize order ID to titlecase for lookup
  const normalizedOrderId = orderId.charAt(0).toUpperCase() + orderId.slice(1).toLowerCase();

  const orderArchetypes: Record<string, { primary: 'Force' | 'Agility' | 'Willpower'; secondary: 'Force' | 'Agility' | 'Willpower'; fallback: 'Force' | 'Agility' | 'Willpower' }> = {
    'Seeker': { primary: 'Willpower', secondary: 'Agility', fallback: 'Force' },
    'Breaker': { primary: 'Force', secondary: 'Agility', fallback: 'Willpower' },
    'Warden': { primary: 'Force', secondary: 'Willpower', fallback: 'Agility' },
    'Rival': { primary: 'Agility', secondary: 'Force', fallback: 'Willpower' },
    'Broker': { primary: 'Willpower', secondary: 'Force', fallback: 'Agility' },
    'Shade': { primary: 'Agility', secondary: 'Willpower', fallback: 'Force' },
  };

  const orderShape = orderArchetypes[normalizedOrderId];
  if (!orderShape) throw new Error(`Unknown order: ${orderId}`);

  return {
    order: normalizedOrderId.toLowerCase(),
    origin: originId,
    name: `${normalizedOrderId} of ${origin.name}`,
    description: `A ${origin.description.toLowerCase()} member of the ${normalizedOrderId} Order`,
    primarySkill: orderShape.primary,
    secondarySkill: orderShape.secondary,
    fallbackSkill: orderShape.fallback,
  };
}

/**
 * Apply archetype to character creation state
 */
export function applyArchetypeUpgrades(
  archetype: Archetype
): Record<'Force' | 'Agility' | 'Willpower', Die> {
  const baseline = { Force: 'd4' as Die, Agility: 'd4' as Die, Willpower: 'd4' as Die };
  
  const upgrades = CREATION_UPGRADES.map(u => u.targetDie);
  const skills = [archetype.primarySkill, archetype.secondarySkill, archetype.fallbackSkill];
  
  skills.forEach((skill, index) => {
    baseline[skill] = upgrades[index];
  });
  
  return baseline;
}

/**
 * Random character generation
 */
export function generateRandomCharacter(orderId: string, originId?: OriginId) {
  const selectedOrigin = originId || ORIGINS[Math.floor(Math.random() * ORIGINS.length)].id;
  
  const archetype = generateArchetype(orderId, selectedOrigin);
  const skills = applyArchetypeUpgrades(archetype);
  
  return {
    archetype,
    skills,
  };
}
