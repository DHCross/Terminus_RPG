/* ── Coherence baseline pack (no setting flavor) ── */

import { LayoutDashboard } from 'lucide-react';
import type { SettingPackUI } from '../../types';
import DefaultDashboard from './DefaultDashboard';

export const DEFAULT_PACK_UI: SettingPackUI = {
  id: 'coherence-baseline',
  name: 'Coherence System',
  genre: 'generic',
  version: '0.1.0',
  description: 'The genre-agnostic Coherence System baseline. No setting flavor applied.',

  branding: {
    title: 'Coherence System',
    subtitle: 'Baseline Engine',
    badge: 'Engine 0.1',
  },

  nav: [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  ],

  routes: [
    { path: '', element: DefaultDashboard, index: true },
  ],

  dashboard: DefaultDashboard,
};
