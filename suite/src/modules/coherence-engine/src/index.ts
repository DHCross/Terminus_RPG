/* ── Silhouette RPG — State Engine ── */

export {
  DIE_SIZES,
  DIE_LABELS,
  PIP_COUNTS,
  BUILD_POINT_COST,
  peakValue,
  pipCount,
  buildPointCost,
  initiativePhaseFromAgility,
  dieFromBuildPoints,
} from './dice';
export type { DieSize, DieLabel, InitiativePhase } from './dice';

export {
  ACTION_STATS,
  DEFENSE_STATS,
  ARMOR_TYPES,
  ARMOR_REDUCTION,
  WEAPON_VECTORS,
  CONSEQUENCE_NAMES,
  createTrack,
  createTracks,
  defaultSecondaryWeapon,
  createCharacter,
  createCharacterFrame,
  createEnemy,
} from './character';
export type {
  ActionStat,
  DefenseStat,
  ActionDice,
  DefenseDice,
  TrackState,
  CharacterTracks,
  ArmorType,
  WeaponVector,
  WeaponProfile,
  CharacterIdentity,
  CharacterDefinition,
  Character,
  EnemyDefinition,
  Enemy,
  ConsequenceName,
} from './character';

export {
  PRESSURE_TYPES,
  ACTIVE_THREAT_ROLES,
} from './scene';
export type {
  AgencyOption,
  PressureType,
  PressureVector,
  ContingencyOutcome,
  ConsequenceClock,
  ThreatAttack,
  ActiveThreatRole,
  ActiveThreat,
  EnvironmentNote,
  SimulationSecret,
  MechanicalEffect,
  SceneCard,
} from './scene';

export type {
  SimulationTruth,
  FaultLine,
  CampaignPhase,
  Campaign,
} from './campaign';

export {
  rollDie,
  calculateImpact,
  resolveDefenseReduction,
  resolveExchange,
  applyExchangeResult,
} from './resolution';
export type {
  DieRoll,
  DefenseChoice,
  DefenseResultType,
  RuptureType,
  AttackRequest,
  DefenseRequest,
  TrackLoss,
  ExchangeResult,
} from './resolution';

export {
  validateSceneCard,
  validateCharacter,
  validateCampaign,
} from './validation';
export type { Severity, ValidationDiagnostic } from './validation';
