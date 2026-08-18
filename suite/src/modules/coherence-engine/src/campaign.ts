/* ── Silhouette RPG — Campaign Layer ── */

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
  simulationTruth: SimulationTruth;
  faultLines: FaultLine[];
  phases: CampaignPhase[];
  scenes: SceneCard[];
  activeSceneId: string | null;
  sceneHistory: string[];
}
