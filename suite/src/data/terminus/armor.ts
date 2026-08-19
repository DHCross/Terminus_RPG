/**
 * Canonical §10.5 (Alpha 0.2 FINAL). Supersedes Reduction-as-armor
 * and the earlier unmarked §10.5 table.
 *
 * Armor has no reduction value, no die, no track, and nothing to mark.
 * It buys an Endure answer. Engine leftover Reduction is not this rule.
 */

/** Residual engine slot. Matches engine `ArmorType`; do not expand until resolution is rewritten. */
export type PackEngineArmor = 'none' | 'leather' | 'chain' | 'plate';

export interface ArmorPermission {
  id: string;
  slot: 'body' | 'shield';
  /** Residual engine slot only. Shield does not replace body armor. */
  engineArmor: PackEngineArmor;
  permission: string;
  endure: string;
  cost: string;
  genericCost?: string;
  terminus: {
    name: string;
    material: string;
  };
  generic: {
    name: string;
    examples: string;
  };
}

export const ARMOR_DOCTRINE = {
  canonical:
    'Canonical as of Alpha 0.2. Armor has no reduction value, no die, no track, and nothing to mark.',
  theRule:
    'Armor does not reduce consequences. It buys you an answer.',
  how:
    'Wearing armor means you may respond with Endure where the fiction would otherwise deny it, and ties go to the armored defender. Heavier armor widens what Endure can answer and narrows what Avoid can do.',
  named:
    'Each type grants one named permission. That is the whole rule, and there is nothing to track between exchanges.',
  portable:
    'The permissions never change. Medium becomes a flak vest, Heavy becomes a hardsuit, and Take the Room still means corridors are survivable.',
  reading:
    'The question is not how much does it soak. It is which answer do I always want available, and which am I giving up.',
  shieldFriend:
    "Shield is the light build's best friend. Missiles and reach weapons are exactly what armor does least about, and Hold the Spot means a Shade in leather can plant themselves when the scene demands it. Covering an ally (Given Cover) is a bonus, not the reason to carry one.",
  mailForBreakers:
    "Mail is the Breaker's and Rival's armor. Take the Room is permission to fight in cramped places where dodging is not real. It keeps everything leather gives and, unlike plate, leaves Avoid open. You give up being quiet, and every clerk hears you coming.",
  mailGuide:
    'When a player in mail asks whether they can Endure something, the answer is almost always yes. That is the armor doing its job: expanding what they are allowed to try, not shaving a number off the result.',
  plateGuide:
    'When a player in plate wants to dodge, the answer is no, and they knew that when they buckled it on.',
  noRepair:
    'Armor never needs repair. Vectors strip the permission within a scene and it returns next scene, because tracking wear buys nothing that Breaks Protection does not already buy.',
  engineLeftover:
    'The live dice engine still subtracts a leftover Reduction number. That is not this rule. Do not teach it at the table.',
} as const;

export const ARMOR_BUILDS = [
  {
    id: 'leather-board',
    build: 'Leather + shield',
    gets: 'All three answers, plus never losing position',
    kills: 'A greataxe in a corridor',
  },
  {
    id: 'mail',
    build: 'Mail',
    gets: "Tringad's actual geography: crossings, halls, stairwells",
    kills: 'Any door that needed to be opened quietly',
  },
  {
    id: 'plate',
    build: 'Plate',
    gets: 'Collapsing floors become an ordinary Endure answer',
    kills: 'Anything that requires moving',
  },
] as const;

export const ARMOR_INTERACTIONS = [
  {
    id: 'breaks-protection',
    name: 'Breaks Protection (war hammer, maul, mace)',
    result: 'The permission is stripped for the rest of the scene. You are wearing metal that is no longer helping.',
  },
  {
    id: 'kells-sledge',
    name: "Kell's Sledge (Old Work)",
    result: 'The permission is gone outright, and the armor is on the floor.',
  },
  {
    id: 'unanswerable',
    name: 'Unanswerable (poison, gas, cold, dread)',
    result: 'Armor is irrelevant. Only Exert answers.',
  },
  {
    id: 'direct-pressure',
    name: 'Direct Pressure',
    result: 'Heavy armor converts some Direct Pressure into an ordinary Endure answer. The single best reason to wear it.',
  },
] as const;

export const ARMOR_TYPES: ArmorPermission[] = [
  {
    id: 'none',
    slot: 'body',
    engineArmor: 'none',
    permission: '',
    endure: 'Only what the fiction plainly allows',
    cost: '',
    terminus: { name: 'Street clothes', material: '' },
    generic: { name: 'None', examples: '' },
  },
  {
    id: 'padded',
    slot: 'body',
    engineArmor: 'none',
    permission: 'Take the Knock',
    endure: 'Fists, clubs, falls, crowd crush',
    cost: '',
    terminus: { name: "Porter's Jack", material: 'padded' },
    generic: { name: 'Padded', examples: '' },
  },
  {
    id: 'leather',
    slot: 'body',
    engineArmor: 'leather',
    permission: 'Take the Edge',
    endure: '+ blades and close work',
    cost: 'Still silent',
    terminus: { name: 'Nightjack', material: 'boiled leather' },
    generic: { name: 'Light', examples: 'leather, hide' },
  },
  {
    id: 'chain',
    slot: 'body',
    engineArmor: 'chain',
    permission: 'Take the Room',
    endure: '+ Hard to Avoid: corridors, doorways, stairs, crowds',
    cost: 'Rings. No concealment, no unmarked entry.',
    genericCost: 'Noisy. No concealment.',
    terminus: { name: 'Gatecoat', material: 'mail' },
    generic: { name: 'Medium', examples: 'mail, scale, brigandine' },
  },
  {
    id: 'plate',
    slot: 'body',
    engineArmor: 'plate',
    permission: 'Take Anything',
    endure: '+ falls and collapse that would be Direct Pressure',
    cost: 'No Avoid, ever. Loud, slow, sinks.',
    genericCost: 'No Avoid, ever. Slow, sinks.',
    terminus: { name: 'Sworn Harness', material: 'plate' },
    generic: { name: 'Heavy', examples: 'plate, harness' },
  },
  {
    id: 'shield',
    slot: 'shield',
    engineArmor: 'none',
    permission: 'Hold the Spot',
    endure: 'Missiles and reach weapons, and you never lose position',
    cost: 'One hand',
    terminus: { name: 'Board', material: 'shield, stacks with any' },
    generic: { name: 'Shield', examples: 'stacks with any' },
  },
];

export const BODY_ARMOR = ARMOR_TYPES.filter((piece) => piece.slot === 'body');
export const SHIELD_ARMOR = ARMOR_TYPES.find((piece) => piece.slot === 'shield')!;

export function findArmor(id?: string): ArmorPermission | undefined {
  if (!id) return undefined;
  return ARMOR_TYPES.find((piece) => piece.id === id);
}

/** Map a pack armor id onto the engine's leftover Reduction slot. Not the table rule. */
export function toEngineArmor(id?: string): PackEngineArmor {
  return findArmor(id)?.engineArmor ?? 'none';
}

export function terminusArmorLabel(piece: ArmorPermission): string {
  if (!piece.terminus.material) return piece.terminus.name;
  return `${piece.terminus.name} (${piece.terminus.material})`;
}

export function genericArmorLabel(piece: ArmorPermission): string {
  if (!piece.generic.examples) return piece.generic.name;
  return `${piece.generic.name} (${piece.generic.examples})`;
}

export function cycleBodyArmor(id?: string): string {
  const index = Math.max(0, BODY_ARMOR.findIndex((piece) => piece.id === id));
  return BODY_ARMOR[(index + 1) % BODY_ARMOR.length].id;
}

export function sheetArmorLine(id: string | undefined, flavor: 'terminus' | 'generic'): string {
  const piece = findArmor(id) ?? BODY_ARMOR[0];
  const name = flavor === 'terminus' ? terminusArmorLabel(piece) : genericArmorLabel(piece);
  return piece.permission ? `${name} — ${piece.permission}` : name;
}
