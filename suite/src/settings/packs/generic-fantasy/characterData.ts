/* ── Generic Fantasy (Aurel): Character Card Data ── */
/* Strictly aligned with Terminus RPG Alpha Draft 0.2 */
/* Paired Skill/Threshold engine, Impact & Vector armament, and Four-Verb Workings. */

export type SkillKey = 'force' | 'agility' | 'willpower';
export type ThresholdKey = 'endure' | 'avoid' | 'exert';
export type DieRank = 'd4' | 'd6' | 'd8' | 'd10' | 'd12';
export type WorkingVerb = 'Seal' | 'Expose' | 'Bridge' | 'Nullify';

export const DIE_FACES: Record<DieRank, number> = {
  d4: 4, d6: 6, d8: 8, d10: 10, d12: 12,
};

export const DIE_CIRCLES: Record<DieRank, number> = {
  d4: 1, d6: 2, d8: 3, d10: 4, d12: 5,
};

export const SKILL_THRESHOLD_LINK: Record<SkillKey, ThresholdKey> = {
  force: 'endure',
  agility: 'avoid',
  willpower: 'exert',
};

export interface SkillEntry {
  die: DieRank;
}

export interface LegacyAbility {
  name: string;
  trigger?: string;
  effect: string;
  exertCost?: string;
}

export interface WorkingEntry {
  name: string;
  verb: WorkingVerb;
  cost: string;
  anchor: string;
  effect: string;
  trigger?: string;
  unanchoredEffect?: string;
}

export interface OriginTrait {
  name: string;
  effect: string;
  mechanical: string;
}

export interface LegacyRole {
  name: string;
  fieldFunction: string;
  lineageNote?: string;
}

export interface WeaponItem {
  name: string;
  impact: number;
  vector: string;
  note?: string;
}

export interface ArmorItem {
  name: string;
  reduction: number;
  note?: string;
}

export interface ShieldItem {
  name: string;
  reduction: number;
  note?: string;
}

export interface CharacterCardData {
  name: string;
  origin: string;
  legacy: string;
  legacyRole: LegacyRole;
  originTrait: OriginTrait;
  approach: string;
  signature: string;
  level: number;
  skills: Record<SkillKey, SkillEntry>;
  /** Total maximum Threshold circles (including origin bonuses) */
  thresholds: Record<ThresholdKey, number>;
  primaryWeapon: WeaponItem;
  secondaryWeapon?: WeaponItem;
  armor: ArmorItem;
  shield?: ShieldItem;
  abilities: LegacyAbility[];
  workings?: WorkingEntry[];
  notes?: string;
}

/* ════════════════════════════════════════════════════════════════ */
/*  CHARACTER 1: Durgrim Ironvow (Dwarf Vanguard)                   */
/* ════════════════════════════════════════════════════════════════ */

const dwarfVanguardSkills: Record<SkillKey, SkillEntry> = {
  force: { die: 'd10' },
  agility: { die: 'd6' },
  willpower: { die: 'd6' },
};

const dwarfVanguardThresholds: Record<ThresholdKey, number> = {
  endure: DIE_CIRCLES['d10'] + 1, // 4 + 1 Dwarf bonus = 5 circles
  avoid: DIE_CIRCLES['d6'],        // 2 circles
  exert: DIE_CIRCLES['d6'],        // 2 circles
};

export const DWARVEN_FIGHTER: CharacterCardData = {
  name: 'Durgrim Ironvow',
  origin: 'Dwarf',
  legacy: 'The Vanguard',
  legacyRole: {
    name: 'The Vanguard',
    fieldFunction: 'Holds ground by presence and arms; steps into harm and stays standing',
    lineageNote: 'Aurel Martial Tradition',
  },
  originTrait: {
    name: 'Subterranean Anchor',
    effect: '+1 Threshold Circle in Endure. Ignore Ground restrictions from heavy armor, encumbrance, or unstable footing.',
    mechanical: 'Endure 5 (not 4) · Heavy armor never costs Ground',
  },
  approach: 'Anchor & Shatter',
  signature: 'Oathkeeper (Engraved Greatsword)',
  level: 3,
  skills: dwarfVanguardSkills,
  thresholds: dwarfVanguardThresholds,
  primaryWeapon: {
    name: 'Oathkeeper (Engraved Greatsword)',
    impact: 3,
    vector: 'hard to Avoid',
    note: 'Engraved with ancient Iron Vow oaths; glows amber when boundaries fracture nearby',
  },
  secondaryWeapon: {
    name: 'Throwing Axes (×3)',
    impact: 2,
    vector: 'reaches position',
  },
  armor: {
    name: 'Engraved Iron Plate',
    reduction: 2,
    note: 'Heavy plate armor; absorbs direct kinetic impacts into Endure',
  },
  shield: {
    name: 'Heater Shield',
    reduction: 1,
    note: 'Braced against incoming force; protects physical position',
  },
  abilities: [
    {
      name: 'Hold the Line',
      trigger: 'A nearby ally would lose a Threshold circle.',
      effect: 'Take that loss onto your own Endure instead if you can plausibly interpose your weapon or body.',
    },
    {
      name: 'Break the Tool',
      trigger: 'You win a Core Exchange with Force.',
      effect: 'Target the enemy\'s weapon, shield, focus, or armor mechanism instead of their Threshold. On success, disable or shatter that tool.',
    },
    {
      name: 'Anchor Point',
      trigger: 'Choose a doorway, breach, or boundary.',
      effect: 'Until you move, that position cannot be forced open, crossed, or collapsed by enemies.',
    },
    {
      name: 'Carry the Break',
      trigger: 'An enemy barrier or weapon breaks.',
      effect: 'Push the excess impact directly into an adjacent opponent or structural feature.',
    },
  ],
  notes: 'A quintessential front-line anchor. Endure 5 circles paired with Impact 3 greatsword. Use Hold the Line to protect fragile casters and Break the Tool to strip dangerous monster weapons.',
};

/* ════════════════════════════════════════════════════════════════ */
/*  CHARACTER 2: Sylarien Moon-Glass (Elven Esoteric Arts)          */
/* ════════════════════════════════════════════════════════════════ */

const elfWizardSkills: Record<SkillKey, SkillEntry> = {
  force: { die: 'd4' },
  agility: { die: 'd8' },
  willpower: { die: 'd10' },
};

const elfWizardThresholds: Record<ThresholdKey, number> = {
  endure: DIE_CIRCLES['d4'],        // 1 circle (fragile body)
  avoid: DIE_CIRCLES['d8'] + 1,     // 3 + 1 Elf bonus = 4 circles
  exert: DIE_CIRCLES['d10'],        // 4 circles (deep casting reservoir)
};

export const ELVEN_WIZARD: CharacterCardData = {
  name: 'Sylarien Moon-Glass',
  origin: 'Elf',
  legacy: 'The Esoteric Arts',
  legacyRole: {
    name: 'The Esoteric Arts',
    fieldFunction: 'Works magic openly and unanchored; reshapes what reality permits',
    lineageNote: 'Aurel Arcane Tradition',
  },
  originTrait: {
    name: 'Deep Attunement',
    effect: '+1 Threshold Circle in Avoid. Cast Workings using natural elements (wood, wind, water) without requiring manufactured focus tools.',
    mechanical: 'Avoid 4 (not 3) · Natural casting focus',
  },
  approach: 'Expose & Nullify',
  signature: 'Moon-Glass Staff (Crystal-Tipped)',
  level: 3,
  skills: elfWizardSkills,
  thresholds: elfWizardThresholds,
  primaryWeapon: {
    name: 'Moon-Glass Staff',
    impact: 1,
    vector: 'reach / warding',
    note: 'Slender silver-barked staff; acts as an anchor for Workings and delivers Willpower strikes',
  },
  secondaryWeapon: {
    name: 'Silver Dagger',
    impact: 1,
    vector: 'armor-piercing',
  },
  armor: {
    name: 'Silk Robes',
    reduction: 0,
    note: 'No physical armor; relies entirely on Avoid and Exert barriers',
  },
  abilities: [
    {
      name: 'Unanchored Mastery',
      trigger: 'When casting any Working in Aurel.',
      effect: 'You may cast with 0 Exert. The Working succeeds with maximum scope, but advances the scene\'s Drift by +1 or +2.',
    },
    {
      name: 'Arcane Sight',
      trigger: 'Passive inspection of a scene.',
      effect: 'Expose active magical wards, supernatural pressures, and dimensional seams without rolling.',
    },
    {
      name: 'Slip the Boundary',
      trigger: 'Navigating guarded or warded terrain.',
      effect: 'Pass through magical barriers or physical boundaries by finding the unobserved seam in attention.',
    },
  ],
  workings: [
    {
      name: 'Pyre-Collapse',
      verb: 'Nullify',
      cost: 'Rupture: 0 Exert (+2 Drift)',
      anchor: 'Line of sight to destination',
      trigger: 'Declare Rupture; point crystal staff.',
      effect: 'Nullifies molecular cohesion in a 30ft radius, releasing a violent explosion. Delivers Impact 3 across all targets.',
      unanchoredEffect: 'Free cast! Scene Drift +2; Guide rolls Hostile Trace check.',
    },
    {
      name: 'Kinetic Flare',
      verb: 'Nullify',
      cost: '1 Exert (or 0 Exert + 1 Drift)',
      anchor: 'Moon-Glass crystal staff',
      trigger: 'Spend 1 Exert; project focused beam.',
      effect: 'Nullifies kinetic balance: delivers Impact 2 concussive force with the "hard to Avoid" vector.',
    },
    {
      name: 'Gate-Step',
      verb: 'Bridge',
      cost: '1 Exert',
      anchor: 'Line of sight to two open points',
      trigger: 'Spend 1 Exert; touch threshold.',
      effect: 'Bridges two spatial positions instantly. Caster and one ally traverse without crossing intervening Ground.',
    },
    {
      name: 'Gate-Lock',
      verb: 'Seal',
      cost: '1 Exert',
      anchor: 'Door, gate, or barrier touch',
      trigger: 'Spend 1 Exert; touch portal.',
      effect: 'Seals boundary state. While anchor holds, portal cannot be crossed or forced open.',
    },
    {
      name: 'Ward Sight',
      verb: 'Expose',
      cost: '1 Exert',
      anchor: 'Crystal lens or staff focus',
      trigger: 'Spend 1 Exert; sweep area.',
      effect: 'Exposes hidden runes, traps, occult pressures, or invisible entities in the scene.',
    },
  ],
  notes: 'High agility and casting power, but Endure 1 means physical strikes are dangerous. Use Avoid 4 to stay clear of melee exchanges. Has the option to cast unanchored when facing overwhelming odds.',
};

/* ════════════════════════════════════════════════════════════════ */
/*  CHARACTER 3: Brother Caedmon (Human Sacred Covenants)           */
/* ════════════════════════════════════════════════════════════════ */

const humanTheurgistSkills: Record<SkillKey, SkillEntry> = {
  force: { die: 'd6' },
  agility: { die: 'd6' },
  willpower: { die: 'd10' },
};

const humanTheurgistThresholds: Record<ThresholdKey, number> = {
  endure: DIE_CIRCLES['d6'],     // 2 circles
  avoid: DIE_CIRCLES['d6'],      // 2 circles
  exert: DIE_CIRCLES['d10'],     // 4 circles
};

export const DIVINE_THEURGIST: CharacterCardData = {
  name: 'Brother Caedmon of the Iron Vow',
  origin: 'Human',
  legacy: 'The Sacred Covenants',
  legacyRole: {
    name: 'The Sacred Covenants',
    fieldFunction: 'Seals boundaries and mends what is broken, bound by the Edgeless Vow',
    lineageNote: 'Aurel Holy Tradition',
  },
  originTrait: {
    name: 'Flexible Training',
    effect: 'Once per scene, step up one Skill roll by one die rank if the action fits your Covenant.',
    mechanical: '1/scene: step up Skill die (d6→d8, d8→d10, etc.)',
  },
  approach: 'Seal & Mend',
  signature: 'The Last Lamp of Aurel (Brass Lantern)',
  level: 3,
  skills: humanTheurgistSkills,
  thresholds: humanTheurgistThresholds,
  primaryWeapon: {
    name: 'Blessed Flanged Mace',
    impact: 2,
    vector: 'breaks protection',
    note: 'Edgeless holy weapon; applies blunt force without breaking the Covenant vow',
  },
  secondaryWeapon: {
    name: 'Leather Sling',
    impact: 1,
    vector: 'reaches position',
  },
  armor: {
    name: 'Ring-Mail Hauberk',
    reduction: 1,
    note: 'Flexible metal links worn over coarse clerical vestments',
  },
  shield: {
    name: 'Buckler',
    reduction: 1,
    note: 'Small steel buckler strapped to the forearm',
  },
  abilities: [
    {
      name: 'The Edgeless Vow',
      trigger: 'Passive covenant rule.',
      effect: 'Power is held by refusing edged steel. Carry only bludgeoning and binding tools. Drawing a bladed weapon suspends Mending permissions until the vow is restored.',
    },
    {
      name: 'Threshold Seal',
      trigger: 'Hold a defensive position closed.',
      effect: 'A doorway, arch, or passage cannot be crossed by enemies while maintaining concentration.',
    },
    {
      name: 'Civilian Cover',
      trigger: 'Environmental Drift escalation strikes allies.',
      effect: 'Shield nearby companions; absorb the Drift consequence into your own Endure or Exert circles.',
    },
  ],
  workings: [
    {
      name: 'Structure Lock',
      verb: 'Seal',
      cost: '1 Exert',
      anchor: 'Bandages, oil, or holy water',
      trigger: 'Spend 1 Exert; touch wounded target.',
      effect: 'Seals biological trauma: target immediately restores 1 marked Threshold Circle in Endure.',
    },
    {
      name: 'Coherence Field',
      verb: 'Seal',
      cost: '1 Exert',
      anchor: 'Self or touched ally',
      trigger: 'Spend 1 Exert; raise the lantern.',
      effect: 'Creates a shimmering golden barrier: +1 flat reduction against incoming Impact for the scene.',
    },
    {
      name: 'Expose the Unholy',
      verb: 'Expose',
      cost: '1 Exert',
      anchor: 'Lantern beam or holy symbol',
      trigger: 'Spend 1 Exert; speak invocation.',
      effect: 'Exposes supernatural entities, curses, and false authority, forcing hidden horrors to manifest visibly.',
    },
    {
      name: 'Rust-Wake',
      verb: 'Nullify',
      cost: '2 Exert',
      anchor: 'Touched metal or stone object',
      trigger: 'Spend 2 Exert; touch target barrier.',
      effect: 'Nullifies physical density: corrodes enemy armor reduction by 1 or turns a lock to brittle dust.',
    },
    {
      name: 'Blessing of Accord',
      verb: 'Bridge',
      cost: '1 Exert',
      anchor: 'Spoken prayer and witness gesture',
      trigger: 'Spend 1 Exert; bless ally.',
      effect: 'Bridges divine fortitude to an ally: step up their next Skill roll by one die rank.',
    },
  ],
  notes: 'Balanced theurgist supporting front-line cells. The Edgeless Vow forbids blades but grants deep restorative mending. The Last Lamp reveals hidden wards and stabilizes allies.',
};
