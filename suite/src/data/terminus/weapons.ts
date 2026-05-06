export interface WeaponVector {
  id: string;
  name: string;
  description: string;
}

export interface Weapon {
  id: string;
  name: string;
  impact: number;
  vectors: WeaponVector[];
  notes?: string;
}

export const WEAPON_VECTORS: WeaponVector[] = [
  { id: 'armor-piercing', name: 'Armor-Piercing', description: 'Ignores some armor protection' },
  { id: 'quick', name: 'Quick', description: 'Fast to use, good for follow-up actions' },
  { id: 'balanced', name: 'Balanced', description: 'Well-rounded, no special strengths or weaknesses' },
  { id: 'reach', name: 'Reach', description: 'Can strike from further away' },
  { id: 'hard-to-avoid', name: 'Hard to Avoid', description: 'Difficult to dodge or evade' },
  { id: 'breaks-protection', name: 'Breaks Protection', description: 'Damages shields and armor' },
  { id: 'warding', name: 'Warding', description: 'Can deflect or block attacks' },
  { id: 'protects-position', name: 'Protects Position', description: 'Grants defensive bonuses' },
];

export const WEAPONS: Weapon[] = [
  {
    id: 'unarmed',
    name: 'Unarmed',
    impact: 1,
    vectors: [],
    notes: 'Fists, feet, or improvised weapons',
  },
  {
    id: 'knife',
    name: 'Knife',
    impact: 1,
    vectors: [{ id: 'armor-piercing', name: 'Armor-Piercing', description: 'Ignores some armor protection' }],
    notes: 'Small blade, good for close quarters',
  },
  {
    id: 'short-sword',
    name: 'Short Sword',
    impact: 2,
    vectors: [{ id: 'quick', name: 'Quick', description: 'Fast to use, good for follow-up actions' }],
    notes: 'Balanced one-handed blade',
  },
  {
    id: 'longsword',
    name: 'Longsword',
    impact: 2,
    vectors: [{ id: 'balanced', name: 'Balanced', description: 'Well-rounded, no special strengths or weaknesses' }],
    notes: 'Versatile two-handed or one-handed use',
  },
  {
    id: 'spear',
    name: 'Spear',
    impact: 2,
    vectors: [{ id: 'reach', name: 'Reach', description: 'Can strike from further away' }],
    notes: 'Reach weapon with thrusting capability',
  },
  {
    id: 'crossbow',
    name: 'Crossbow',
    impact: 2,
    vectors: [{ id: 'armor-piercing', name: 'Armor-Piercing', description: 'Ignores some armor protection' }],
    notes: 'Ranged weapon, requires reload',
  },
  {
    id: 'greataxe',
    name: 'Greataxe',
    impact: 3,
    vectors: [{ id: 'hard-to-avoid', name: 'Hard to Avoid', description: 'Difficult to dodge or evade' }],
    notes: 'Two-handed, devastating but slow',
  },
  {
    id: 'war-hammer',
    name: 'War Hammer',
    impact: 3,
    vectors: [{ id: 'breaks-protection', name: 'Breaks Protection', description: 'Damages shields and armor' }],
    notes: 'Effective against armored targets',
  },
  {
    id: 'staff',
    name: 'Staff',
    impact: 1,
    vectors: [
      { id: 'reach', name: 'Reach', description: 'Can strike from further away' },
      { id: 'warding', name: 'Warding', description: 'Can deflect or block attacks' },
    ],
    notes: 'Two-handed, defensive and reach',
  },
  {
    id: 'shield',
    name: 'Shield',
    impact: 1,
    vectors: [{ id: 'protects-position', name: 'Protects Position', description: 'Grants defensive bonuses' }],
    notes: 'Defensive tool, can be used offensively',
  },
];

export const SIGNATURE_ITEMS = [
  'lantern',
  'lens',
  'grimoire',
  'marked coin',
  'relic key',
  'archive seal',
  'hammer',
  'axe',
  'blade',
  'iron rod',
  'demolition charm',
  'broken standard',
  'shield',
  'staff',
  'oath-chain',
  'ward-stone',
  'field standard',
  'iron-bound mantle',
  'dueling blade',
  'marked glove',
  'racing token',
  'trophy',
  'challenge writ',
  'mirrored charm',
  'contract case',
  'seal ring',
  'ledger',
  'marked scales',
  'debt chain',
  'witness token',
  'mask',
  'cloak',
  'lockpick set',
  'black knife',
  'false papers',
  'mirrored pin',
];