/* ── Generic Fantasy Setting Pack ── */

import { LayoutDashboard } from 'lucide-react';
import type { SettingPackUI } from '../../types';
import GenericFantasyDashboard from './GenericFantasyDashboard';

export const GENERIC_FANTASY_PACK_UI: SettingPackUI = {
  id: 'generic-fantasy',
  name: 'Aurel',
  genre: 'fantasy',
  version: '0.1.0',
  description:
    'The Aurel Partition — the Coherence Engine\'s first candidate build, quarantined as a high-entropy Sword & Sorcery sandbox. Skills drive Thresholds, Harm Potential routes through layered defenses, and the Hexad of Workings runs wild.',

  branding: {
    title: 'Aurel',
    subtitle: 'The First Candidate',
    badge: 'Preview 0.1',
  },

  nav: [{ to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true }],

  routes: [{ path: '', element: GenericFantasyDashboard, index: true }],

  dashboard: GenericFantasyDashboard,
};
