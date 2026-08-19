export type VectorFamily = 'denial' | 'punishment' | 'reach' | 'delay' | 'structural' | 'quiet';

export interface WeaponVector {
  id: string;
  name: string;
  family: VectorFamily;
  description: string;
  examples?: string;
}

export interface Weapon {
  id: string;
  name: string;
  impact: number;
  vectors: WeaponVector[];
  notes?: string;
}

export const VECTOR_FAMILY_LABELS: Record<VectorFamily, { name: string; summary: string }> = {
  denial: {
    name: 'Denial',
    summary: 'Remove a Threshold from the table. Under the right conditions, one of the defender\'s three answers is simply unavailable.',
  },
  punishment: {
    name: 'Punishment',
    summary: 'The target still chooses freely. The choice just has a price attached.',
  },
  reach: {
    name: 'Reach',
    summary: 'When your Impact exceeds what the target can absorb, the remainder does not evaporate.',
  },
  delay: {
    name: 'Delay',
    summary: 'Harm that arrives later. These are the ones players fear, because the exchange looks survivable at the time.',
  },
  structural: {
    name: 'Structural',
    summary: 'Harm aimed at things, not people.',
  },
  quiet: {
    name: 'Quiet',
    summary: 'The scene does not notice. The opposite of Loud.',
  },
};

export const VECTOR_DOCTRINE = {
  designRule:
    'There is no armor class, no to-hit roll, and no passive defense, so there is nothing to pierce. Bypassing a defense here does not mean ignoring a number. It means taking away the answer they wanted to give.',
  stacking:
    'One Vector per exchange. A weapon may carry two or three Vectors, but only one applies per exchange and the attacker declares which one before the dice come out.',
  impactCeiling:
    'Impact stays small on purpose. A war hammer is Impact 3 and that is the ceiling. If you find yourself wanting bigger numbers, what you actually want is a better Vector.',
  noCrits:
    'Do not build a critical-hit economy on top of this. Vectors already give the exchange its texture. If a Vector needs a maximum roll to be worth taking, it is a weak Vector.',
} as const;

export const WEAPON_VECTORS: WeaponVector[] = [
  {
    id: 'hard-to-avoid',
    name: 'Hard to Avoid',
    family: 'denial',
    description: 'In a corridor, a crowd, a doorway, or on a stair, the target cannot answer with Avoid. There is nowhere to go.',
    examples: 'greataxe, greatsword, wide swing',
  },
  {
    id: 'reaches-position',
    name: 'Reaches Position',
    family: 'denial',
    description: 'Giving ground does not help. If the target answers with Avoid, they must also give up the position they were holding.',
    examples: 'spear, halberd, pole weapons',
  },
  {
    id: 'breaks-protection',
    name: 'Breaks Protection',
    family: 'denial',
    description: 'If the target answers with Endure, their armor permission is stripped for the rest of the scene. They are wearing metal that is no longer helping. The permission returns next scene.',
    examples: 'war hammer, maul, pick',
  },
  {
    id: 'unanswerable',
    name: 'Unanswerable',
    family: 'denial',
    description: 'Poison, gas, cold, drowning, dread: Endure and Avoid are both off the table. Only Exert answers, and Exert is the smallest pool most characters have.',
  },
  {
    id: 'quick',
    name: 'Quick',
    family: 'punishment',
    description: 'If they answer with Endure, you go again before anyone else acts. Slow, heavy answers invite a second cut.',
    examples: 'short sword, knife, rapier',
  },
  {
    id: 'grasping',
    name: 'Grasping',
    family: 'punishment',
    description: 'If they answer with Avoid, they are caught: held, hooked, tangled, or pinned where they tried to go.',
    examples: 'net, chain, hook, whip, grapple',
  },
  {
    id: 'wearing',
    name: 'Wearing',
    family: 'punishment',
    description: 'If they answer with Exert, they lose two circles instead of one. Sustained mental pressure eats reserve fast.',
    examples: 'dread, interrogation, sustained Working',
  },
  {
    id: 'loud',
    name: 'Loud',
    family: 'punishment',
    description: 'Whatever they answer with, the scene notices. Drift ticks.',
    examples: 'crossbow, firearm, shattering, screaming',
  },
  {
    id: 'carried',
    name: 'Carried',
    family: 'reach',
    description: 'Leftover Impact goes into what the target was attached to: the railing behind them, the door they were holding, the person they were shielding.',
  },
  {
    id: 'through',
    name: 'Through',
    family: 'reach',
    description: 'Leftover Impact continues to the next thing in line. Crossbow bolts, thrusts, and anything with real momentum.',
  },
  {
    id: 'wide',
    name: 'Wide',
    family: 'reach',
    description: 'Split your Impact between two adjacent targets before either answers. Two ones instead of one two.',
  },
  {
    id: 'bleeding',
    name: 'Bleeding',
    family: 'delay',
    description: 'Costs one more circle at the end of the next round unless someone closes it.',
  },
  {
    id: 'fouled',
    name: 'Fouled',
    family: 'delay',
    description: 'Poison, rot, infection. One circle per round until treated, and treatment usually is not in the room.',
  },
  {
    id: 'sworn',
    name: 'Sworn',
    family: 'delay',
    description: 'The consequence lands whenever the target next breaks a promise, crosses a threshold, or lies. Almost always a Working, not a weapon.',
  },
  {
    id: 'sundering',
    name: 'Sundering',
    family: 'structural',
    description: 'Doubles Impact against objects, mechanisms, seals, and anchors. Terrible against bodies.',
  },
  {
    id: 'silencing',
    name: 'Silencing',
    family: 'structural',
    description: 'Stops a Working, a bell, a signal, or a voice, instead of hurting whoever was making it.',
  },
  {
    id: 'unmaking',
    name: 'Unmaking',
    family: 'structural',
    description: 'Destroys the anchor rather than the effect. The ward does not break; the stone holding it does.',
  },
  {
    id: 'quiet',
    name: 'Quiet',
    family: 'quiet',
    description: 'The scene does not notice. No Drift tick from the noise of the act.',
    examples: 'sling, thrown stone',
  },
];

function vec(...ids: string[]): WeaponVector[] {
  return ids.map((id) => {
    const found = WEAPON_VECTORS.find((vector) => vector.id === id);
    if (!found) throw new Error(`Unknown vector: ${id}`);
    return found;
  });
}

export const WEAPONS: Weapon[] = [
  { id: 'unarmed', name: 'Unarmed', impact: 1, vectors: vec('quick') },
  { id: 'knife', name: 'Knife', impact: 1, vectors: vec('quick', 'bleeding') },
  { id: 'short-sword', name: 'Short sword', impact: 2, vectors: vec('quick') },
  { id: 'longsword', name: 'Longsword', impact: 2, vectors: vec('quick', 'carried') },
  { id: 'spear', name: 'Spear', impact: 2, vectors: vec('reaches-position') },
  { id: 'halberd', name: 'Halberd', impact: 2, vectors: vec('reaches-position', 'grasping') },
  { id: 'greataxe', name: 'Greataxe', impact: 3, vectors: vec('hard-to-avoid', 'wide') },
  { id: 'war-hammer', name: 'War hammer', impact: 3, vectors: vec('breaks-protection', 'sundering') },
  { id: 'maul', name: 'Maul', impact: 3, vectors: vec('breaks-protection', 'carried') },
  { id: 'crossbow', name: 'Crossbow', impact: 2, vectors: vec('through', 'loud') },
  { id: 'sling', name: 'Sling, thrown stone', impact: 1, vectors: vec('quiet') },
  { id: 'net', name: 'Net, chain', impact: 1, vectors: vec('grasping') },
  { id: 'staff', name: 'Staff', impact: 1, vectors: vec('reaches-position', 'silencing') },
  { id: 'mace', name: 'Mace, hammer (one hand)', impact: 2, vectors: vec('breaks-protection') },
  { id: 'shield', name: 'Shield', impact: 1, vectors: vec('carried') },
  {
    id: 'chalk',
    name: 'Chalk, salt, cord',
    impact: 0,
    vectors: vec('silencing'),
    notes: 'Silencing against unanchored things.',
  },
];

export { SIGNATURE_ITEMS } from './signatures';
