/* ── GWSD Card Generator types ── */

import type {
  PressureType,
  SceneCard as SilhouetteSceneCard,
} from '../../silhouette-engine/src/index.ts';

export const ACTIVE_STATE_ORDER = ['ground', 'will', 'shift', 'drift'] as const;
export const LATENT_STATE_ORDER = ['ground', 'will', 'trigger', 'accumulation'] as const;

export type ActiveGWSDState = typeof ACTIVE_STATE_ORDER[number];
export type LatentGWSDState = typeof LATENT_STATE_ORDER[number];
export type GWSDState = ActiveGWSDState | LatentGWSDState;
export type SceneStateType = 'active' | 'latent';

export const SILHOUETTE_SECTION_ORDER = ['agency', 'pressure', 'contingency', 'consequence'] as const;
export type SilhouetteSectionKey = typeof SILHOUETTE_SECTION_ORDER[number];

export interface SilhouetteSection {
  key: SilhouetteSectionKey;
  text: string;
}

export interface SilhouetteProjection {
  sceneCard: SilhouetteSceneCard;
  sections: [SilhouetteSection, SilhouetteSection, SilhouetteSection, SilhouetteSection];
  pressureType: PressureType;
  environmentSummary: string;
}

/**
 * Content type classification for parsed blocks.
 * Only SCENE_STATE blocks produce GWSD cards.
 */
export type ContentType = 'scene_state' | 'reference' | 'diagnostic';

/**
 * Narrative depth — where this card sits in the adventure hierarchy.
 * Color communicates depth (darker = broader scope), NOT GWSD state.
 *
 * campaign — Rare. One or two per adventure. Macro-state summary.
 * act      — Overview cards the GM consults at session start.
 * scene    — Most common. Named encounter or area.
 * state    — Immediate moment within a scene (multi-phase scenes).
 */
export type NarrativeDepth = 'campaign' | 'act' | 'scene' | 'state';

/** Scope metadata attached to each scene/card */
export interface GWSDScope {
  depth: NarrativeDepth;
  /** Pre-formatted breadcrumb, e.g. "ACT II — Watchful Rest / SCENE — Common Hall" */
  banner: string;
  /** Ancestor chain for programmatic use */
  breadcrumb?: Array<{ depth: NarrativeDepth; title: string }>;
}

export interface BaseGWSDCard<TStateType extends SceneStateType, TState extends GWSDState> {
  id: string;
  sceneId: string;
  stateType: TStateType;
  state: TState;
  /** Book register — atmospheric prose for manuscript [gwsd] blocks */
  text: string;
  /** Card register — imperative fragments for physical table cards */
  cardText?: string;
  source: 'parsed' | 'manual' | 'ai' | 'hoskbrew';
}

export type ActiveGWSDCard = BaseGWSDCard<'active', ActiveGWSDState>;
export type LatentGWSDCard = BaseGWSDCard<'latent', LatentGWSDState>;
export type GWSDCard = ActiveGWSDCard | LatentGWSDCard;

/** Extraction mode for the two-pass pipeline */
export type ExtractionMode = 'auto' | 'tagged' | 'structural' | 'ai';

/** Convenience type for the four GWSD body fields */
export interface ActiveGWSDBody {
  stateType: 'active';
  ground: string;
  will: string;
  shift: string;
  drift: string;
}

export interface LatentGWSDBody {
  stateType: 'latent';
  ground: string;
  will: string;
  trigger: string;
  accumulation: string;
  reveal?: string;
}

export type GWSDBody = ActiveGWSDBody | LatentGWSDBody;

/** A detected scene chunk from Pass A (structural segmentation) */
export interface SceneChunk {
  id: string;
  title: string;
  depth: NarrativeDepth;
  /** Full prose text (sidebars stripped) */
  prose: string;
  /** Sidebar blocks found within this scene */
  sidebars: string[];
  /** Read-aloud blocks found within this scene */
  readAlouds: string[];
  startLine: number;
  ancestors: Array<{ depth: NarrativeDepth; title: string }>;
  raw: string;
}

export interface Scene {
  id: string;
  title: string;
  adventure: string;
  act?: string;
  order: number;
  stateType: SceneStateType;
  cards: [GWSDCard, GWSDCard, GWSDCard, GWSDCard];
  raw: string;
  /** Hierarchical scope (position in adventure structure) */
  scope?: GWSDScope;
  /** Content type — only 'scene_state' produces valid GWSD cards */
  contentType?: ContentType;
  /** Validation warnings from post-extraction checks */
  validationWarnings?: string[];
  /** Silhouette RPG scene-card projection used by the live rules view */
  silhouette?: SilhouetteProjection;
}

export interface Deck {
  id: string;
  name: string;
  description?: string;
  scenes: Scene[];
  createdAt: string;
  updatedAt: string;
}

export function isLatentBody(body: GWSDBody): body is LatentGWSDBody {
  return body.stateType === 'latent';
}

export function isActiveBody(body: GWSDBody): body is ActiveGWSDBody {
  return body.stateType === 'active';
}

export function isLatentCard(card: GWSDCard): card is LatentGWSDCard {
  return card.stateType === 'latent';
}

export function isActiveCard(card: GWSDCard): card is ActiveGWSDCard {
  return card.stateType === 'active';
}

/**
 * State labels — semi-bold, uppercase, muted dark (#374151).
 * NOT color-coded. Position is enough once the eye learns the pattern.
 */
export const STATE_META: Record<GWSDState, { label: string; color: string; hex: string }> = {
  ground: { label: 'GROUND', color: 'Muted Dark', hex: '#374151' },
  will:   { label: 'WILL',   color: 'Muted Dark', hex: '#374151' },
  shift:  { label: 'SHIFT',  color: 'Muted Dark', hex: '#374151' },
  drift:  { label: 'DRIFT',  color: 'Muted Dark', hex: '#374151' },
  trigger: { label: 'TRIGGER', color: 'Muted Dark', hex: '#374151' },
  accumulation: { label: 'ACCUMULATION', color: 'Muted Dark', hex: '#374151' },
};

export const SILHOUETTE_SECTION_META: Record<SilhouetteSectionKey, { label: string; color: string; hex: string }> = {
  agency: { label: 'AGENCY', color: 'Muted Dark', hex: '#374151' },
  pressure: { label: 'PRESSURE', color: 'Muted Dark', hex: '#374151' },
  contingency: { label: 'CONTINGENCY', color: 'Muted Dark', hex: '#374151' },
  consequence: { label: 'CONSEQUENCE', color: 'Muted Dark', hex: '#374151' },
};

/**
 * Narrative hierarchy → banner color.
 * Darker = higher in hierarchy. The GM's hand reaches for "current intensity."
 *
 * | Depth     | Spec Hex  | Text      |
 * |-----------|-----------|-----------|
 * | Campaign  | #1F2937   | #F9FAFB   |
 * | Act       | #374151   | #F3F4F6   |
 * | Scene     | #6B7280   | #FFFFFF   |
 * | State     | #9CA3AF   | #111827   |
 */
export const SCOPE_STYLES: Record<NarrativeDepth, { bg: string; text: string; label: string }> = {
  campaign:  { bg: '#1F2937', text: '#F9FAFB', label: 'CAMPAIGN' },
  act:       { bg: '#374151', text: '#F3F4F6', label: 'ACT' },
  scene:     { bg: '#6B7280', text: '#FFFFFF', label: 'SCENE' },
  state:     { bg: '#9CA3AF', text: '#111827', label: 'STATE' },
};
