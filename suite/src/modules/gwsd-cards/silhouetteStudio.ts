import type {
  ActionDice,
  ArmorType,
  Character,
  CharacterDefinition,
  DefenseDice,
  Enemy,
  EnemyDefinition,
  ValidationDiagnostic,
  WeaponProfile,
  WeaponVector,
} from '../silhouette-engine/src/index.ts';
import {
  ACTION_STATS,
  ARMOR_TYPES,
  DEFENSE_STATS,
  DIE_SIZES,
  WEAPON_VECTORS,
  buildPointCost,
  createCharacter,
  createEnemy,
  validateCharacter,
} from '../silhouette-engine/src/index.ts';

export interface WeaponDraft {
  name: string;
  impact: number;
  vectors: WeaponVector[];
  bonusImpact: number;
  notes: string;
}

export interface CharacterDraft {
  name: string;
  background: string;
  immediateWant: string;
  actions: ActionDice;
  defenses: DefenseDice;
  armor: ArmorType;
  primaryWeapon: WeaponDraft;
  secondaryWeapon: WeaponDraft;
  notesText: string;
}

export interface MonsterDraft extends CharacterDraft {
  behavior: string;
  attack: WeaponDraft;
}

export interface BuiltCharacterResult {
  definition: CharacterDefinition;
  character: Character;
  diagnostics: ValidationDiagnostic[];
  actionPoints: number;
  defensePoints: number;
}

export interface BuiltMonsterResult {
  definition: EnemyDefinition;
  enemy: Enemy;
  diagnostics: ValidationDiagnostic[];
  actionPoints: number;
  defensePoints: number;
}

export interface DraftPreset<TDraft> {
  key: string;
  label: string;
  description: string;
  draft: TDraft;
}

export const DIE_OPTIONS = DIE_SIZES.map((value) => ({
  value,
  label: `d${value}`,
  points: buildPointCost(value),
}));

export const VECTOR_OPTIONS = [...WEAPON_VECTORS];
export const ARMOR_OPTIONS = [...ARMOR_TYPES];

function cloneWeaponDraft(weapon: WeaponDraft): WeaponDraft {
  return {
    name: weapon.name,
    impact: weapon.impact,
    vectors: [...weapon.vectors],
    bonusImpact: weapon.bonusImpact,
    notes: weapon.notes,
  };
}

export function cloneCharacterDraft(draft: CharacterDraft): CharacterDraft {
  return {
    name: draft.name,
    background: draft.background,
    immediateWant: draft.immediateWant,
    actions: { ...draft.actions },
    defenses: { ...draft.defenses },
    armor: draft.armor,
    primaryWeapon: cloneWeaponDraft(draft.primaryWeapon),
    secondaryWeapon: cloneWeaponDraft(draft.secondaryWeapon),
    notesText: draft.notesText,
  };
}

export function cloneMonsterDraft(draft: MonsterDraft): MonsterDraft {
  return {
    ...cloneCharacterDraft(draft),
    behavior: draft.behavior,
    attack: cloneWeaponDraft(draft.attack),
  };
}

export function defaultWeaponDraft(overrides?: Partial<WeaponDraft>): WeaponDraft {
  return {
    name: 'Field blade',
    impact: 1,
    vectors: [],
    bonusImpact: 0,
    notes: '',
    ...overrides,
  };
}

export function defaultCharacterDraft(): CharacterDraft {
  return {
    name: 'New Character',
    background: 'A denizen shaped by the hidden machine.',
    immediateWant: 'Get through the next scene intact.',
    actions: {
      force: 6,
      agility: 8,
      willpower: 8,
    },
    defenses: {
      endure: 8,
      avoid: 8,
      exert: 6,
    },
    armor: 'none',
    primaryWeapon: defaultWeaponDraft({ name: 'Work blade' }),
    secondaryWeapon: defaultWeaponDraft({ name: 'Backup tool' }),
    notesText: '',
  };
}

export function defaultMonsterDraft(): MonsterDraft {
  return {
    ...defaultCharacterDraft(),
    name: 'New Monster',
    background: 'A threat expression riding the scene pressure.',
    immediateWant: 'Close distance and break the party formation.',
    armor: 'leather',
    primaryWeapon: defaultWeaponDraft({
      name: 'Natural weapons',
      vectors: ['bonus-impact'],
    }),
    secondaryWeapon: defaultWeaponDraft({
      name: 'Closing strike',
      vectors: ['targets-position'],
    }),
    attack: defaultWeaponDraft({
      name: 'Predation pattern',
      impact: 2,
      vectors: ['targets-position'],
    }),
    behavior: 'Pressure the weakest flank and turn the scene into a chase.',
  };
}

function notesFromText(notesText: string): string[] {
  return notesText
    .split(/\n+/)
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function slugifyName(name: string, fallback: string): string {
  const cleaned = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return cleaned || fallback;
}

export function weaponDraftToProfile(weapon: WeaponDraft): WeaponProfile {
  const profile: WeaponProfile = {
    name: weapon.name.trim() || 'Unnamed weapon',
    impact: Math.max(1, weapon.impact),
    vectors: [...weapon.vectors],
  };

  if (weapon.bonusImpact > 0) {
    profile.bonusImpact = weapon.bonusImpact;
  }
  if (weapon.notes.trim()) {
    profile.notes = weapon.notes.trim();
  }

  return profile;
}

export function buildPointsForActions(actions: ActionDice): number {
  return ACTION_STATS.reduce((sum, stat) => sum + buildPointCost(actions[stat]), 0);
}

export function buildPointsForDefenses(defenses: DefenseDice): number {
  return DEFENSE_STATS.reduce((sum, stat) => sum + buildPointCost(defenses[stat]), 0);
}

export function characterDefinitionFromDraft(draft: CharacterDraft): CharacterDefinition {
  return {
    id: slugifyName(draft.name, 'character-frame'),
    name: draft.name.trim() || 'Unnamed Character',
    identity: {
      background: draft.background.trim() || 'No background entered.',
      immediateWant: draft.immediateWant.trim() || 'No immediate want entered.',
    },
    actions: { ...draft.actions },
    defenses: { ...draft.defenses },
    armor: draft.armor,
    weapons: {
      primary: weaponDraftToProfile(draft.primaryWeapon),
      secondary: weaponDraftToProfile(draft.secondaryWeapon),
    },
    notes: notesFromText(draft.notesText),
  };
}

export function monsterDefinitionFromDraft(draft: MonsterDraft): EnemyDefinition {
  return {
    ...characterDefinitionFromDraft(draft),
    id: slugifyName(draft.name, 'monster-frame'),
    behavior: draft.behavior.trim() || 'Apply scene pressure and exploit hesitation.',
    attack: weaponDraftToProfile(draft.attack),
  };
}

export function buildCharacterFromDraft(draft: CharacterDraft): BuiltCharacterResult {
  const definition = characterDefinitionFromDraft(draft);
  const character = createCharacter(definition);

  return {
    definition,
    character,
    diagnostics: validateCharacter(character),
    actionPoints: buildPointsForActions(draft.actions),
    defensePoints: buildPointsForDefenses(draft.defenses),
  };
}

export function buildMonsterFromDraft(draft: MonsterDraft): BuiltMonsterResult {
  const definition = monsterDefinitionFromDraft(draft);
  const enemy = createEnemy(definition);

  return {
    definition,
    enemy,
    diagnostics: validateCharacter(enemy),
    actionPoints: buildPointsForActions(draft.actions),
    defensePoints: buildPointsForDefenses(draft.defenses),
  };
}

function createCharacterPreset(draft: CharacterDraft, key: string, label: string, description: string): DraftPreset<CharacterDraft> {
  return {
    key,
    label,
    description,
    draft,
  };
}

function createMonsterPreset(draft: MonsterDraft, key: string, label: string, description: string): DraftPreset<MonsterDraft> {
  return {
    key,
    label,
    description,
    draft,
  };
}

export const CHARACTER_PRESETS: DraftPreset<CharacterDraft>[] = [
  createCharacterPreset(
    {
      ...defaultCharacterDraft(),
      name: 'Boundary Runner',
      background: 'A courier who learned to feel where the simulation snags.',
      immediateWant: 'Move first and keep the exit open.',
      actions: { force: 6, agility: 10, willpower: 6 },
      defenses: { endure: 6, avoid: 10, exert: 6 },
      primaryWeapon: defaultWeaponDraft({ name: 'Reach knife', vectors: ['armor-piercing'] }),
      secondaryWeapon: defaultWeaponDraft({ name: 'Throwing spikes', vectors: ['targets-position'] }),
      notesText: 'Fast opener\nBest when the scene needs repositioning',
    },
    'boundary-runner',
    'Boundary Runner',
    'High-agility operator built to seize initiative and reposition under pressure.',
  ),
  createCharacterPreset(
    {
      ...defaultCharacterDraft(),
      name: 'Pressure Saint',
      background: 'A ritual survivor who can hold steady while the world tears.',
      immediateWant: 'Keep everyone upright through the first breach.',
      actions: { force: 8, agility: 6, willpower: 8 },
      defenses: { endure: 10, avoid: 6, exert: 4 },
      armor: 'chain',
      primaryWeapon: defaultWeaponDraft({ name: 'Breaker maul', impact: 2, vectors: ['bonus-impact'] }),
      secondaryWeapon: defaultWeaponDraft({ name: 'Ward knife', vectors: ['direct-harm'] }),
      notesText: 'Front-line anchor\nBuilt to take Endure ruptures late',
    },
    'pressure-saint',
    'Pressure Saint',
    'Balanced front-liner with strong endurance and force for breach scenes.',
  ),
  createCharacterPreset(
    {
      ...defaultCharacterDraft(),
      name: 'Signal Reader',
      background: 'A pattern-listener trained to hear the machine underneath speech.',
      immediateWant: 'Turn hidden pressure into a clean opening.',
      actions: { force: 4, agility: 8, willpower: 10 },
      defenses: { endure: 6, avoid: 8, exert: 8 },
      primaryWeapon: defaultWeaponDraft({ name: 'Resonance rod', vectors: ['direct-harm'] }),
      secondaryWeapon: defaultWeaponDraft({ name: 'Silent pistol', vectors: ['cannot-be-avoided'] }),
      notesText: 'Best in occult and social scenes\nStrong willpower opener',
    },
    'signal-reader',
    'Signal Reader',
    'Willpower-heavy specialist for social, occult, and hidden-truth pressure.',
  ),
];

export const MONSTER_PRESETS: DraftPreset<MonsterDraft>[] = [
  createMonsterPreset(
    {
      ...defaultMonsterDraft(),
      name: 'Hall Stalker',
      background: 'A corridor predator that pushes isolated targets away from support.',
      immediateWant: 'Split the formation and finish the rear guard.',
      actions: { force: 8, agility: 8, willpower: 6 },
      defenses: { endure: 8, avoid: 8, exert: 6 },
      primaryWeapon: defaultWeaponDraft({ name: 'Raking claws', impact: 2, vectors: ['targets-position'] }),
      secondaryWeapon: defaultWeaponDraft({ name: 'Snap bite', impact: 1, vectors: ['bonus-impact'] }),
      attack: defaultWeaponDraft({ name: 'Lunge chain', impact: 2, vectors: ['targets-position', 'bonus-impact'] }),
      behavior: 'Drive one target out of cover, then collapse on whoever falls behind.',
      notesText: 'Works best in narrow agency spaces',
    },
    'hall-stalker',
    'Hall Stalker',
    'Predator monster that weaponizes movement and separation.',
  ),
  createMonsterPreset(
    {
      ...defaultMonsterDraft(),
      name: 'Archive Warden',
      background: 'An authority construct that punishes disobedience and blocks exits.',
      immediateWant: 'Hold the chamber and break anyone who tests the perimeter.',
      actions: { force: 10, agility: 4, willpower: 8 },
      defenses: { endure: 10, avoid: 4, exert: 8 },
      armor: 'plate',
      primaryWeapon: defaultWeaponDraft({ name: 'Suppression pike', impact: 2, vectors: ['armor-piercing'] }),
      secondaryWeapon: defaultWeaponDraft({ name: 'Shock gauntlet', impact: 1, vectors: ['direct-harm'] }),
      attack: defaultWeaponDraft({ name: 'Containment sweep', impact: 2, vectors: ['cannot-be-avoided'] }),
      behavior: 'Advance methodically, deny agency, and turn delay into surrender.',
      notesText: 'Good for authority pressure scenes\nActs like a moving choke point',
    },
    'archive-warden',
    'Archive Warden',
    'Heavy authority monster with armor and scene-control vectors.',
  ),
  createMonsterPreset(
    {
      ...defaultMonsterDraft(),
      name: 'Glitch Bloom',
      background: 'A fault-line bloom that renders the room hostile in pulses.',
      immediateWant: 'Fill the scene until hesitation becomes impossible.',
      actions: { force: 6, agility: 6, willpower: 10 },
      defenses: { endure: 6, avoid: 6, exert: 10 },
      primaryWeapon: defaultWeaponDraft({ name: 'Fracture tendrils', impact: 1, vectors: ['direct-harm'] }),
      secondaryWeapon: defaultWeaponDraft({ name: 'Needle lash', impact: 1, vectors: ['armor-piercing'] }),
      attack: defaultWeaponDraft({ name: 'Render pulse', impact: 2, vectors: ['cannot-be-avoided', 'direct-harm'] }),
      behavior: 'Spread through the room, punish stalling, and convert space into consequence.',
      notesText: 'Occult/environmental hybrid\nBest when the scene already has a hidden fault line',
    },
    'glitch-bloom',
    'Glitch Bloom',
    'Occult hazard-creature hybrid for simulation-fracture scenes.',
  ),
];

export function downloadJson(filename: string, data: unknown): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}