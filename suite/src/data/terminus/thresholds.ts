import { SKILLS, type Skill } from './skills';

export const THRESHOLDS = {
  ENDURE: 'Endure',
  AVOID: 'Avoid',
  EXERT: 'Exert'
} as const;

export type Threshold = typeof THRESHOLDS[keyof typeof THRESHOLDS];

export const SKILL_TO_THRESHOLD_MAP: Record<Skill, Threshold> = {
  [SKILLS.FORCE]: THRESHOLDS.ENDURE,
  [SKILLS.AGILITY]: THRESHOLDS.AVOID,
  [SKILLS.WILLPOWER]: THRESHOLDS.EXERT
} as const;
