/* ── Silhouette RPG — Schema Validation & Linting ── */

import type { Campaign } from './campaign';
import type { Character } from './character';
import type { SceneCard } from './scene';
import {
  ACTION_STATS,
  ARMOR_TYPES,
  DEFENSE_STATS,
} from './character';
import {
  DIE_SIZES,
  buildPointCost,
  initiativePhaseFromAgility,
  pipCount,
  type DieSize,
} from './dice';

export type Severity = 'error' | 'warning' | 'info';

export interface ValidationDiagnostic {
  code: string;
  severity: Severity;
  path: string;
  message: string;
}

export function validateSceneCard(card: SceneCard): ValidationDiagnostic[] {
  const diags: ValidationDiagnostic[] = [];

  if (!card.id) diags.push({ code: 'SCENE_NO_ID', severity: 'error', path: '/id', message: 'Scene card must have an id.' });
  if (!card.name) diags.push({ code: 'SCENE_NO_NAME', severity: 'error', path: '/name', message: 'Scene card must have a name.' });
  if (!card.campaignId) diags.push({ code: 'SCENE_NO_CAMPAIGN', severity: 'error', path: '/campaignId', message: 'Scene card must reference a campaign.' });

  if (card.agency.length === 0) {
    diags.push({ code: 'SCENE_NO_AGENCY', severity: 'error', path: '/agency', message: 'Scene card must answer what the players can do right now.' });
  }
  if (card.pressure.length === 0) {
    diags.push({ code: 'SCENE_NO_PRESSURE', severity: 'error', path: '/pressure', message: 'Scene card must include an active pressure vector.' });
  }
  if (card.contingency.length === 0) {
    diags.push({ code: 'SCENE_NO_CONTINGENCY', severity: 'error', path: '/contingency', message: 'Scene card must define what changes when the party acts.' });
  }
  if (card.consequence.length === 0) {
    diags.push({ code: 'SCENE_NO_CONSEQUENCE', severity: 'error', path: '/consequence', message: 'Scene card must define what worsens if the party does nothing.' });
  }

  const threatIds = new Set<string>();
  for (const threat of card.activeThreats) {
    if (!threat.id) {
      diags.push({ code: 'THREAT_NO_ID', severity: 'error', path: '/activeThreats', message: 'Each active threat must have an id.' });
      continue;
    }
    if (threatIds.has(threat.id)) {
      diags.push({ code: 'THREAT_DUPLICATE_ID', severity: 'error', path: `/activeThreats/${threat.id}`, message: `Duplicate active threat id: ${threat.id}` });
    }
    threatIds.add(threat.id);
  }

  if (card.simulation && !card.simulation.guideOnly) {
    diags.push({ code: 'SIMULATION_NOT_HIDDEN', severity: 'warning', path: '/simulation/guideOnly', message: 'Simulation metadata should remain Guide-only.' });
  }

  return diags;
}

export function validateCharacter(char: Character): ValidationDiagnostic[] {
  return [
    ...validateCharacterIdentity(char),
    ...validateActionDice(char),
    ...validateDefenseDice(char),
    ...validateBuildBudgets(char),
    ...validateArmor(char),
    ...validateTrackConsistency(char),
    ...validateTrackRanges(char),
    ...validateInitiative(char),
    ...validateWeaponImpacts(char),
  ];
}

export function validateCampaign(campaign: Campaign): ValidationDiagnostic[] {
  const diags: ValidationDiagnostic[] = [];

  if (!campaign.id) diags.push({ code: 'CAMPAIGN_NO_ID', severity: 'error', path: '/id', message: 'Campaign must have an id.' });
  if (!campaign.name) diags.push({ code: 'CAMPAIGN_NO_NAME', severity: 'error', path: '/name', message: 'Campaign must have a name.' });
  if (!campaign.simulationTruth.hiddenPremise) {
    diags.push({ code: 'CAMPAIGN_NO_PREMISE', severity: 'error', path: '/simulationTruth/hiddenPremise', message: 'Campaign must define the hidden simulation premise.' });
  }
  if (campaign.simulationTruth.denizensAware) {
    diags.push({ code: 'CAMPAIGN_PREMISE_EXPOSED', severity: 'warning', path: '/simulationTruth/denizensAware', message: 'Silhouette assumes the denizens do not know they live inside a system.' });
  }

  const sceneIds = new Set<string>();
  for (const scene of campaign.scenes) {
    if (sceneIds.has(scene.id)) {
      diags.push({ code: 'CAMPAIGN_DUPLICATE_SCENE', severity: 'error', path: `/scenes/${scene.id}`, message: `Duplicate scene id: ${scene.id}` });
    }
    sceneIds.add(scene.id);
    diags.push(...validateSceneCard(scene));
  }

  if (campaign.activeSceneId && !sceneIds.has(campaign.activeSceneId)) {
    diags.push({ code: 'CAMPAIGN_INVALID_ACTIVE_SCENE', severity: 'error', path: '/activeSceneId', message: `Active scene ${campaign.activeSceneId} was not found in campaign.scenes.` });
  }

  for (const phase of campaign.phases) {
    for (const sceneId of phase.featuredSceneIds) {
      if (!sceneIds.has(sceneId)) {
        diags.push({ code: 'PHASE_UNKNOWN_SCENE', severity: 'warning', path: `/phases/${phase.id}`, message: `Phase ${phase.name} references unknown scene ${sceneId}.` });
      }
    }
  }

  return diags;
}

function isValidDie(value: number): value is DieSize {
  return (DIE_SIZES as readonly number[]).includes(value);
}

function totalBuildPoints(dice: DieSize[]): number {
  return dice.reduce((sum, die) => sum + buildPointCost(die), 0);
}

function validateCharacterIdentity(char: Character): ValidationDiagnostic[] {
  const diags: ValidationDiagnostic[] = [];

  if (!char.id) diags.push({ code: 'CHAR_NO_ID', severity: 'error', path: '/id', message: 'Character must have an id.' });
  if (!char.name) diags.push({ code: 'CHAR_NO_NAME', severity: 'error', path: '/name', message: 'Character must have a name.' });

  return diags;
}

function validateActionDice(char: Character): ValidationDiagnostic[] {
  const diags: ValidationDiagnostic[] = [];

  for (const action of ACTION_STATS) {
    if (!isValidDie(char.actions[action])) {
      diags.push({ code: 'CHAR_INVALID_ACTION_DIE', severity: 'error', path: `/actions/${action}`, message: `Invalid die size ${char.actions[action]} for ${action}.` });
    }
  }

  return diags;
}

function validateDefenseDice(char: Character): ValidationDiagnostic[] {
  const diags: ValidationDiagnostic[] = [];

  for (const defense of DEFENSE_STATS) {
    if (!isValidDie(char.defenses[defense])) {
      diags.push({ code: 'CHAR_INVALID_DEFENSE_DIE', severity: 'error', path: `/defenses/${defense}`, message: `Invalid die size ${char.defenses[defense]} for ${defense}.` });
    }
  }

  return diags;
}

function validateBuildBudgets(char: Character): ValidationDiagnostic[] {
  const diags: ValidationDiagnostic[] = [];
  const actionPoints = totalBuildPoints(Object.values(char.actions));
  const defensePoints = totalBuildPoints(Object.values(char.defenses));

  if (actionPoints !== 5) {
    diags.push({ code: 'CHAR_ACTION_POINT_MISMATCH', severity: 'warning', path: '/actions', message: `Action dice spend ${actionPoints} build points; Silhouette player characters normally spend 5.` });
  }

  if (defensePoints !== 5) {
    diags.push({ code: 'CHAR_DEFENSE_POINT_MISMATCH', severity: 'warning', path: '/defenses', message: `Defense dice spend ${defensePoints} build points; Silhouette player characters normally spend 5.` });
  }

  return diags;
}

function validateArmor(char: Character): ValidationDiagnostic[] {
  if (ARMOR_TYPES.includes(char.armor)) {
    return [];
  }

  return [{
    code: 'CHAR_INVALID_ARMOR',
    severity: 'error',
    path: '/armor',
    message: `Armor type ${String(char.armor)} is not supported.`,
  }];
}

function validateTrackConsistency(char: Character): ValidationDiagnostic[] {
  const diags: ValidationDiagnostic[] = [];
  const expectedEndure = pipCount(char.defenses.endure);
  const expectedAvoid = pipCount(char.defenses.avoid);
  const expectedExert = pipCount(char.defenses.exert);

  if (char.tracks.endure.max !== expectedEndure) {
    diags.push({ code: 'CHAR_ENDURE_TRACK_MISMATCH', severity: 'error', path: '/tracks/endure/max', message: `Endure max ${char.tracks.endure.max} should equal ${expectedEndure}.` });
  }
  if (char.tracks.vitality.max !== expectedEndure) {
    diags.push({ code: 'CHAR_VITALITY_TRACK_MISMATCH', severity: 'error', path: '/tracks/vitality/max', message: `Vitality max ${char.tracks.vitality.max} should equal ${expectedEndure}.` });
  }
  if (char.tracks.avoid.max !== expectedAvoid) {
    diags.push({ code: 'CHAR_AVOID_TRACK_MISMATCH', severity: 'error', path: '/tracks/avoid/max', message: `Avoid max ${char.tracks.avoid.max} should equal ${expectedAvoid}.` });
  }
  if (char.tracks.exert.max !== expectedExert) {
    diags.push({ code: 'CHAR_EXERT_TRACK_MISMATCH', severity: 'error', path: '/tracks/exert/max', message: `Exert max ${char.tracks.exert.max} should equal ${expectedExert}.` });
  }

  return diags;
}

function validateTrackRanges(char: Character): ValidationDiagnostic[] {
  const diags: ValidationDiagnostic[] = [];

  for (const [trackName, track] of Object.entries(char.tracks)) {
    if (track.current < 0 || track.current > track.max) {
      diags.push({ code: 'CHAR_TRACK_OUT_OF_RANGE', severity: 'error', path: `/tracks/${trackName}/current`, message: `${trackName} current value ${track.current} must stay between 0 and ${track.max}.` });
    }
  }

  return diags;
}

function validateInitiative(char: Character): ValidationDiagnostic[] {
  const expectedPhase = initiativePhaseFromAgility(char.actions.agility);
  if (char.initiativePhase === expectedPhase) {
    return [];
  }

  return [{
    code: 'CHAR_INITIATIVE_MISMATCH',
    severity: 'warning',
    path: '/initiativePhase',
    message: `Initiative phase ${char.initiativePhase} should be ${expectedPhase} for Agility ${char.actions.agility}.`,
  }];
}

function validateWeaponImpacts(char: Character): ValidationDiagnostic[] {
  const diags: ValidationDiagnostic[] = [];

  if (char.weapons.primary.impact < 1) {
    diags.push({ code: 'CHAR_PRIMARY_IMPACT_INVALID', severity: 'error', path: '/weapons/primary/impact', message: 'Primary weapon impact must be at least 1.' });
  }
  if (char.weapons.secondary.impact < 1) {
    diags.push({ code: 'CHAR_SECONDARY_IMPACT_INVALID', severity: 'error', path: '/weapons/secondary/impact', message: 'Secondary weapon impact must be at least 1.' });
  }

  return diags;
}
