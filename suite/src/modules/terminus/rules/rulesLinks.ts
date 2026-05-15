/**
 * Rules page section anchors and URL generation.
 * Use these IDs to link to specific sections of the rules reference document.
 */
export const RULES_SECTIONS = {
  'core-concepts': 'Core Concepts',
  orders: 'Orders',
  species: 'Species & Lineages',
  skills: 'Skills & Die Ladder',
  thresholds: 'Thresholds',
  'skill-disciplines': 'Skill Disciplines',
  advancement: 'Advancement',
  equipment: 'Equipment',
  'magic-modes': 'Magic Modes',
  'working-verbs': 'Working Verbs',
  'rupture-casting': 'Rupture Casting',
  'hostile-trace': 'Hostile Trace',
  'old-office-rites': 'Old Office Rites',
  'archetypal-castings': 'Archetypal Castings',
  'scene-cards': 'Scene Cards',
  drift: 'Scene Drift',
  conflict: 'Conflict Resolution',
} as const;

export type RulesSection = keyof typeof RULES_SECTIONS;

/** Build a URL to a specific rules section. */
export function rulesUrl(section: RulesSection): string {
  return `/rules#${section}`;
}

/** Build a URL to the rules page (no anchor). */
export function rulesPageUrl(): string {
  return '/rules';
}

/** Get the human-readable label for a rules section. */
export function rulesSectionLabel(section: RulesSection): string {
  return RULES_SECTIONS[section];
}
