export const SKILLS = {
  FORCE: 'Force',
  AGILITY: 'Agility',
  WILLPOWER: 'Willpower'
} as const;

export type Skill = typeof SKILLS[keyof typeof SKILLS];

export const DIE_LADDER = ['d4', 'd6', 'd8', 'd10', 'd12'] as const;
export type Die = typeof DIE_LADDER[number];

export const CIRCLE_MAPPING: Record<Die, number> = {
  'd4': 1,
  'd6': 2,
  'd8': 3,
  'd10': 4,
  'd12': 5
} as const;
