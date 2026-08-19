/* ── Coherence System — Campaign Layer ── */

import type { SceneCard } from './scene';

/** The Guide knows the hidden machine. The world does not. */
export interface SimulationTruth {
  hiddenPremise: string;
  denizensAware: boolean;
  guideDirective: string;
  anomalyVocabulary: string[];
  failureState: string;
}

export interface FaultLine {
  id: string;
  label: string;
  visibleSymptom: string;
  hiddenCause: string;
  escalation: string;
}

export interface CampaignPhase {
  id: string;
  name: string;
  summary: string;
  defaultPressure: string;
  featuredSceneIds: string[];
}

export interface Campaign {
  id: string;
  name: string;
  version: string;
  /**
   * The Setting Pack this campaign belongs to, e.g. "terminus" or
   * "generic-fantasy". Omitted means the Coherence baseline. The frontend pack
   * registry resolves this id to a {@link SettingPack} for validation and UI.
   */
  packId?: string;
  simulationTruth: SimulationTruth;
  faultLines: FaultLine[];
  phases: CampaignPhase[];
  scenes: SceneCard[];
  activeSceneId: string | null;
  sceneHistory: string[];
}
