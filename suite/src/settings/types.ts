/* ── Setting Pack UI types ── */

import type { ComponentType } from 'react';
import type { SettingPack as EngineSettingPack } from '../modules/coherence-engine/src/index';

/** A sidebar/nav entry. `to` is the route path. */
export interface NavItem {
  to: string;
  label: string;
  icon: ComponentType<{ size?: number; className?: string }>;
  end?: boolean;
}

/** A route the pack contributes to the app router. */
export interface PackRoute {
  /** Route path relative to the app root, e.g. "characters" or "" for index. */
  path: string;
  element: ComponentType;
  /** True for the index/dashboard route. */
  index?: boolean;
}

export interface PackBranding {
  title: string;
  subtitle: string;
  badge?: string;
  crest?: string;
}

/**
 * A Setting Pack as the frontend sees it: the engine {@link EngineSettingPack}
 * plus UI metadata (branding, nav, routes, dashboard).
 */
export interface SettingPackUI extends EngineSettingPack {
  branding: PackBranding;
  nav: NavItem[];
  routes: PackRoute[];
  /** The index/dashboard component for this pack. */
  dashboard: ComponentType;
}
