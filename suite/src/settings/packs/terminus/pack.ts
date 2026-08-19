/* ── Terminus Setting Pack ── */

import {
  Book,
  Flame,
  LayoutDashboard,
  Layers,
  MessageSquare,
  ScrollText,
  Sparkles,
  Tent,
  Users,
  Skull,
  Languages,
} from 'lucide-react';
import type { SettingPackUI } from '../../types';
import TerminusDashboard from './TerminusDashboard';
import { CharacterWorkbench } from '../../../modules/terminus/character/CharacterWorkbench';
import { OrdersView } from '../../../modules/terminus/orders/OrdersView';
import { SpeciesView } from '../../../modules/terminus/species/SpeciesView';
import { PlaytestTools } from '../../../modules/terminus/playtest/PlaytestTools';
import { SceneCardsWorkbench } from '../../../modules/terminus/scene/SceneCardsWorkbench';
import { MagicView } from '../../../modules/terminus/magic/MagicView';
import { RulesPage } from '../../../modules/terminus/rules/RulesPage';
import { NPCWorkbench } from '../../../modules/terminus/npc/NPCWorkbench';
import { MonsterWorkbench } from '../../../modules/terminus/monster/MonsterWorkbench';
import { NomenclatorWorkbench } from '../../../modules/terminus/names/NomenclatorWorkbench';
import { AdventureWorkbench } from '../../../modules/terminus/adventure/AdventureWorkbench';
import { CampaignView } from '../../../modules/terminus/campaign/CampaignView';

export const TERMINUS_PACK: SettingPackUI = {
  id: 'terminus',
  name: 'Terminus RPG',
  genre: 'civic dark fantasy',
  version: '0.2.0',
  description:
    'Responders sent into districts where roads move, laws contradict themselves, and bells ring for people who no longer exist. The secret architecture beneath the world of Tringad.',

  branding: {
    title: 'Terminus RPG',
    subtitle: 'Civic Archive Suite',
    badge: 'Alpha 0.2',
    crest: '/terminus-logo.svg',
  },

  nav: [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/campaign', label: 'Campaign Q&A', icon: MessageSquare },
    { to: '/adventures', label: 'Adventure Forge', icon: Sparkles },
    { to: '/scene-cards', label: 'Scene Cards', icon: Layers },
    { to: '/nomenclator', label: 'Nomenclator', icon: Languages },
    { to: '/characters', label: 'Characters', icon: Users },
    { to: '/npcs', label: 'NPC Vault', icon: Users },
    { to: '/bestiary', label: 'Bestiary', icon: Skull },
    { to: '/magic', label: 'Magic', icon: Flame },
    { to: '/species', label: 'Lineages', icon: Users },
    { to: '/orders', label: 'Orders', icon: Book },
    { to: '/playtest', label: 'Playtest Tools', icon: Tent },
    { to: '/rules', label: 'Playtest Rules', icon: ScrollText },
  ],

  routes: [
    { path: '', element: TerminusDashboard, index: true },
    { path: 'scene-cards', element: SceneCardsWorkbench },
    { path: 'characters', element: CharacterWorkbench },
    { path: 'npcs', element: NPCWorkbench },
    { path: 'bestiary', element: MonsterWorkbench },
    { path: 'nomenclator', element: NomenclatorWorkbench },
    { path: 'adventures', element: AdventureWorkbench },
    { path: 'magic', element: MagicView },
    { path: 'species', element: SpeciesView },
    { path: 'orders', element: OrdersView },
    { path: 'playtest', element: PlaytestTools },
    { path: 'rules', element: RulesPage },
    { path: 'campaign', element: CampaignView },
  ],

  dashboard: TerminusDashboard,
};
