/* ── Signature Key Data ── */
/* Defining items that make a character legally and physically legible to the scene state. */
/* Aligned with Terminus RPG Alpha Draft 0.2. */

import type { SkillKey, ThresholdKey } from './characterData';

export type SignatureCategory =
  | 'Signature Implement'   // Iconic Weapon — exerts Force/Impact on Ground
  | 'Working Anchor'         // Focus — anchors Workings (Seal, Expose, Bridge, Nullify)
  | 'Resonance Key'          // Item of continuity — stabilizes Resolve & Thresholds
  | 'Unified Signature';     // Combines Implement + Anchor — holds its own Focus pool

export type KineticAlignmentSkill = SkillKey; // Force, Agility, or Willpower

export interface KineticAlignment {
  skill: KineticAlignmentSkill;
  threshold: ThresholdKey;
  description: string;
}

export interface EmbeddedPermission {
  name: string;
  formerly: string;       // legacy name (e.g., "Weapon Function", "Focus Function")
  type: 'Weapon Exception' | 'Anchor Exception' | 'Resonance Exception';
  effect: string;
  mechanical: string;
}

export interface SignatureKey {
  id: string;
  name: string;
  bearer: string;
  category: SignatureCategory;
  categoryFormerly: string;  // legacy name
  description: string;
  kineticAlignment: KineticAlignment;
  /** Calibration bonus = bearer's Level (Tier). Added to Impact or steps up Skill on aligned exchanges. */
  calibration: number;
  calibrationNote: string;
  embeddedPermissions: EmbeddedPermission[];
  /** Only for Unified Signatures: a dedicated Focus pool for casting without marking personal Exert. */
  focusPool?: { current: number; max: number };
  /** Heritage Register status — whether the item is certified at character creation. */
  heritageRegistered: boolean;
  heritageNote?: string;
}

/* ════════════════════════════════════════════════════════════════ */
/*  SIGNATURE KEY 1: The Vanguard's Engraved Greatsword             */
/* ════════════════════════════════════════════════════════════════ */

export const ENGRAVED_GREATSWORD: SignatureKey = {
  id: 'sig-greatsword',
  name: 'Oathkeeper',
  bearer: 'Durgrim Ironvow',
  category: 'Signature Implement',
  categoryFormerly: 'Iconic Weapon',
  description: 'A dwarven-forged greatsword engraved with the ancient oaths of the Iron Vow. The blade glows faintly amber when boundary permissions are fractured nearby.',
  kineticAlignment: {
    skill: 'force',
    threshold: 'endure',
    description: 'Force Alignment — links directly to Force rolls and Endure thresholds. Once per scene, step up Force die by one rank when smashing barriers or breaking enemy defenses.',
  },
  calibration: 3,
  calibrationNote: 'Level 3 Vanguard. Add +1 to Impact when winning a Core Exchange with Oathkeeper, or break through heavy armor reduction.',
  embeddedPermissions: [
    {
      name: 'Searing Kinetic Edge',
      formerly: 'Weapon Function (Armor Piercing)',
      type: 'Weapon Exception',
      effect: 'The blade generates searing-hot kinetic cuts that pierce heavy plate armor. Against plate-armored targets, ignore 1 point of armor reduction when Oathkeeper strikes.',
      mechanical: 'Passive: ignores 1 point of enemy armor reduction.',
    },
    {
      name: 'Rupture Sense',
      formerly: 'Detect Function',
      type: 'Weapon Exception',
      effect: 'The blade glows amber when an Unanchored Working or Reality Breach occurs within 60 feet. The glow intensity scales with the Drift level of the scene.',
      mechanical: 'Passive: detects unanchored castings and ruptures within 60 ft.',
    },
  ],
  heritageRegistered: true,
  heritageNote: 'Certified in the Heritage Register at character creation. The oaths engraved on the blade are recognized by the Iron Vow as an instrument of authority.',
};

/* ════════════════════════════════════════════════════════════════ */
/*  SIGNATURE KEY 2: The Seeker's Attuned Lantern                  */
/* ════════════════════════════════════════════════════════════════ */

export const ATTUNED_LANTERN: SignatureKey = {
  id: 'sig-lantern',
  name: 'The Last Lamp of Aurel',
  bearer: 'Brother Caedmon of the Iron Vow',
  category: 'Working Anchor',
  categoryFormerly: 'Magic Focus',
  description: 'A brass lantern that burns with a warm golden flame—not oil, but compressed ambient light from Aurel. It illuminates hidden Ground permissions, occult pressures, and supernatural wards.',
  kineticAlignment: {
    skill: 'willpower',
    threshold: 'exert',
    description: 'Willpower Alignment — links to Willpower tests and Exert thresholds. Once per scene, step up Willpower die by one rank when casting Expose or Seal Workings through the lantern.',
  },
  calibration: 3,
  calibrationNote: 'Level 3 Theurgist. The lantern is a Working Anchor—Calibration applies to Willpower casting rolls when the lantern is the active focus.',
  embeddedPermissions: [
    {
      name: 'Lantern Anchor',
      formerly: 'Focus Function (Vision)',
      type: 'Anchor Exception',
      effect: 'The lantern\'s light reveals hidden magical wards, runes, and occult pressures in its beam. In pitch darkness, the bearer reads ancient scripts without penalty.',
      mechanical: 'Passive: Expose occult pressures in beam radius without rolling.',
    },
    {
      name: 'Aurel Light Reserve',
      formerly: 'Energy Reserve',
      type: 'Anchor Exception',
      effect: 'The lantern contains a reserve of compressed ambient light. Once per session, release it as a free Seal Working (Coherence Field) without spending Exert.',
      mechanical: '1/session: free Coherence Field rote (0 Exert). The golden ward persists for the scene.',
    },
  ],
  heritageRegistered: true,
  heritageNote: 'Certified in the Heritage Register. The lantern is an ancient artifact from Aurel—its light holds a steady frequency that repels shadow.',
};

/* ════════════════════════════════════════════════════════════════ */
/*  SIGNATURE KEY 3: The Elven Wizard's Unified Staff              */
/* ════════════════════════════════════════════════════════════════ */

export const CRYSTAL_STAFF: SignatureKey = {
  id: 'sig-staff',
  name: 'Moon-Glass Staff',
  bearer: 'Sylarien Moon-Glass',
  category: 'Unified Signature',
  categoryFormerly: 'Arcane Inheritance',
  description: 'A slender staff of silver-barked wood topped with a crystal that reflects moonlight. It is both a physical implement delivering Willpower strikes and a universal Working Anchor.',
  kineticAlignment: {
    skill: 'willpower',
    threshold: 'exert',
    description: 'Willpower Alignment — channels Willpower into physical strikes and Workings. Once per scene, step up Willpower die by one rank when casting through the staff.',
  },
  calibration: 3,
  calibrationNote: 'Level 3 Wizard. As a Unified Signature, Calibration applies to both weapon strikes (Impact 2) and Working checks.',
  embeddedPermissions: [
    {
      name: 'Moon-Glass Focus',
      formerly: 'Arcane Focus (Weapon)',
      type: 'Weapon Exception',
      effect: 'The crystal focuses ambient moonlight into concussive kinetic force. Strikes deliver Willpower-aligned force with the "reach" vector.',
      mechanical: 'As weapon: Impact 2, Willpower-aligned with reach/warding vector.',
    },
    {
      name: 'Deep Court Anchor',
      formerly: 'Focus Function (Natural Casting)',
      type: 'Anchor Exception',
      effect: 'The staff serves as an Anchor for all four verbs (Seal, Expose, Bridge, Nullify). Amplifies Elf natural-casting: no material components needed.',
      mechanical: 'Anchor for all 4 verbs. Amplifies natural casting.',
    },
  ],
  focusPool: { current: 2, max: 2 },
  heritageRegistered: true,
  heritageNote: 'Certified in the Heritage Register as an Arcane Inheritance item. Has a dedicated Focus Pool (2 points) that can be spent to cast Workings without marking personal Exert.',
};

/* ════════════════════════════════════════════════════════════════ */
/*  SIGNATURE KEY 4: A Resonance Key (Inspirational Focus)         */
/* ════════════════════════════════════════════════════════════════ */

export const OATH_CHAIN: SignatureKey = {
  id: 'sig-oathchain',
  name: 'The Iron Vow Chain',
  bearer: 'Durgrim Ironvow',
  category: 'Resonance Key',
  categoryFormerly: 'Inspirational Focus',
  description: 'A heavy iron chain worn around the wrist, each link engraved with a name of a fallen comrade. It stabilizes the bearer\'s resolve through historical continuity.',
  kineticAlignment: {
    skill: 'willpower',
    threshold: 'exert',
    description: 'Willpower Alignment — grounds the bearer\'s resolve. Once per scene, step up Willpower die by one rank when making a mental check or resisting mental pressure.',
  },
  calibration: 0,
  calibrationNote: 'Resonance Keys provide defensive continuity rather than offensive impact. Calibration = 0.',
  embeddedPermissions: [
    {
      name: 'Resolve Stabilizer',
      formerly: 'Inspirational Function',
      type: 'Resonance Exception',
      effect: 'When the bearer\'s Avoid or Endure circles are completely exhausted, the chain\'s memory grounds them. Once per scene, restore 1 lost Threshold circle as a free action.',
      mechanical: '1/scene: restore 1 marked Threshold circle when depleted.',
    },
    {
      name: 'Oath Memory',
      formerly: 'Sentimental Continuity',
      type: 'Resonance Exception',
      effect: 'The chain carries the names of the fallen. When rolling a Mental check against fear, compulsion, or mental rupture, step up the Willpower die by one rank.',
      mechanical: 'Passive: step up Willpower die on Mental checks vs fear/compulsion.',
    },
  ],
  heritageRegistered: false,
  heritageNote: 'Personal, not licensed. The chain\'s power comes from emotional continuity and sworn memory rather than institutional certification.',
};

export const ALL_SIGNATURE_KEYS: SignatureKey[] = [
  ENGRAVED_GREATSWORD,
  ATTUNED_LANTERN,
  CRYSTAL_STAFF,
  OATH_CHAIN,
];
