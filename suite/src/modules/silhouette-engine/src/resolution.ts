/* ── Silhouette RPG — Resolution Engine ── */

import { getSecureRandom } from '../../../utils/crypto';
import type { DieSize } from './dice';
import type {
  ActionStat,
  Character,
  ConsequenceName,
  DefenseStat,
  WeaponProfile,
} from './character';
import { ARMOR_REDUCTION } from './character';

interface OutcomeAccumulator {
  remaining: number;
  armorReduced: number;
  preventedByBurn: boolean;
  losses: TrackLoss;
  avoidConsequence?: ConsequenceName;
  rupture: RuptureType;
  notes: string[];
}

export interface DieRoll {
  die: DieSize;
  result: number;
}

export type DefenseChoice = DefenseStat;
export type DefenseResultType = 'full-block' | 'softened' | 'full-impact';
export type RuptureType = 'endure' | 'vitality' | 'avoid' | 'exert' | null;

export interface AttackRequest {
  attackerId: string;
  action: ActionStat;
  weapon?: WeaponProfile;
  attackRoll?: number;
  bonusImpact?: number;
}

export interface DefenseRequest {
  defenderId: string;
  choice: DefenseChoice;
  defenseRoll?: number;
  burn?: boolean;
  avoidConsequence?: ConsequenceName;
  avoidTrackLoss?: number;
}

export interface TrackLoss {
  endure: number;
  vitality: number;
  avoid: number;
  exert: number;
}

export interface ExchangeResult {
  attack: AttackRequest;
  defense: DefenseRequest;
  weapon: WeaponProfile;
  attackRoll: DieRoll;
  defenseRoll: DieRoll;
  impact: {
    base: number;
    bonus: number;
    remaining: number;
    armorReduced: number;
    reductionType: DefenseResultType;
    preventedByBurn: boolean;
    unresolved: number;
  };
  losses: TrackLoss;
  avoidConsequence?: ConsequenceName;
  rupture: RuptureType;
  notes: string[];
}

export function rollDie(die: DieSize): number {
  return Math.floor(getSecureRandom() * die) + 1;
}

export function calculateImpact(weapon: WeaponProfile, bonusImpact: number = 0): number {
  return weapon.impact + Math.max(0, bonusImpact);
}

export function resolveDefenseReduction(
  attackerRoll: number,
  defenderRoll: number,
  defenseDie: DieSize,
  impact: number,
): { remaining: number; reductionType: DefenseResultType } {
  if (defenderRoll === defenseDie) {
    return { remaining: 0, reductionType: 'full-block' };
  }

  if (defenderRoll >= attackerRoll) {
    return { remaining: Math.max(0, impact - 1), reductionType: 'softened' };
  }

  return { remaining: impact, reductionType: 'full-impact' };
}

function applyArmor(impact: number, defender: Character, weapon: WeaponProfile): { remaining: number; armorReduced: number } {
  if (weapon.vectors.includes('armor-piercing') || weapon.vectors.includes('direct-harm')) {
    return { remaining: impact, armorReduced: 0 };
  }

  const armorReduced = Math.min(impact, ARMOR_REDUCTION[defender.armor]);
  return {
    remaining: impact - armorReduced,
    armorReduced,
  };
}

function createOutcomeAccumulator(remaining: number): OutcomeAccumulator {
  return {
    remaining,
    armorReduced: 0,
    preventedByBurn: false,
    losses: { endure: 0, vitality: 0, avoid: 0, exert: 0 },
    rupture: null,
    notes: [],
  };
}

function trackDepleted(current: number, loss: number): boolean {
  return loss > 0 && current - loss <= 0;
}

function assertDefenseChoiceAllowed(weapon: WeaponProfile, choice: DefenseChoice): void {
  if (weapon.vectors.includes('cannot-be-avoided') && choice === 'avoid') {
    throw new Error('This attack cannot be Avoided. Choose Endure or Exert.');
  }

  if (weapon.vectors.includes('targets-position') && choice !== 'avoid') {
    throw new Error('This attack targets position and must be defended with Avoid.');
  }
}

function applyVitalityLoss(outcome: OutcomeAccumulator, defender: Character): void {
  outcome.losses.vitality = outcome.remaining;
  outcome.remaining = 0;

  if (outcome.losses.vitality === 0) {
    return;
  }

  if (outcome.rupture === 'endure') {
    outcome.notes.push('Endure overflow spilled into Vitality.');
  }

  if (trackDepleted(defender.tracks.vitality.current, outcome.losses.vitality)) {
    outcome.rupture = 'vitality';
  }
}

function resolveEndureOutcome(
  outcome: OutcomeAccumulator,
  defender: Character,
  weapon: WeaponProfile,
): void {
  if (weapon.vectors.includes('direct-harm')) {
    outcome.notes.push('Direct harm skipped Endure and struck Vitality.');
    applyVitalityLoss(outcome, defender);
    return;
  }

  const armored = applyArmor(outcome.remaining, defender, weapon);
  outcome.remaining = armored.remaining;
  outcome.armorReduced = armored.armorReduced;
  if (outcome.armorReduced > 0) {
    outcome.notes.push('Armor reduced the incoming impact.');
  }

  outcome.losses.endure = Math.min(outcome.remaining, defender.tracks.endure.current);
  outcome.remaining -= outcome.losses.endure;
  if (trackDepleted(defender.tracks.endure.current, outcome.losses.endure)) {
    outcome.rupture = 'endure';
  }

  applyVitalityLoss(outcome, defender);
}

function resolveAvoidOutcome(
  outcome: OutcomeAccumulator,
  defense: DefenseRequest,
  defender: Character,
): void {
  if (outcome.remaining === 0) {
    return;
  }

  outcome.avoidConsequence = defense.avoidConsequence ?? 'driven back';
  outcome.losses.avoid = Math.max(1, defense.avoidTrackLoss ?? 1);
  outcome.remaining = 0;
  outcome.notes.push('Avoid traded injury for position and consequence.');

  if (trackDepleted(defender.tracks.avoid.current, outcome.losses.avoid)) {
    outcome.rupture = 'avoid';
  }
}

function resolveExertOutcome(
  outcome: OutcomeAccumulator,
  defense: DefenseRequest,
  defender: Character,
): void {
  const canBurn = outcome.remaining > 0 && Boolean(defense.burn) && defender.tracks.exert.current > 0;

  if (canBurn) {
    outcome.preventedByBurn = true;
    outcome.losses.exert = 1;
    outcome.remaining = 0;
    outcome.notes.push('Burn cancelled the remaining impact.');
  } else {
    outcome.losses.exert = Math.min(outcome.remaining, defender.tracks.exert.current);
    outcome.remaining = Math.max(0, outcome.remaining - outcome.losses.exert);
  }

  if (trackDepleted(defender.tracks.exert.current, outcome.losses.exert)) {
    outcome.rupture = 'exert';
  }

  if (outcome.remaining > 0) {
    outcome.notes.push('Exert ran dry before all impact could be absorbed.');
  }
}

export function resolveExchange(
  attack: AttackRequest,
  defense: DefenseRequest,
  attacker: Character,
  defender: Character,
): ExchangeResult {
  const weapon = attack.weapon ?? attacker.weapons.primary;
  const attackDie = attacker.actions[attack.action];
  const defenseDie = defender.defenses[defense.choice];
  const attackRoll: DieRoll = { die: attackDie, result: attack.attackRoll ?? rollDie(attackDie) };
  const defenseRoll: DieRoll = { die: defenseDie, result: defense.defenseRoll ?? rollDie(defenseDie) };
  const baseImpact = weapon.impact;
  const bonusImpact = Math.max(0, attack.bonusImpact ?? weapon.bonusImpact ?? 0);
  const totalImpact = calculateImpact(weapon, bonusImpact);
  const reduced = resolveDefenseReduction(attackRoll.result, defenseRoll.result, defenseDie, totalImpact);
  const outcome = createOutcomeAccumulator(reduced.remaining);

  assertDefenseChoiceAllowed(weapon, defense.choice);

  if (defense.choice === 'endure') {
    resolveEndureOutcome(outcome, defender, weapon);
  } else if (defense.choice === 'avoid') {
    resolveAvoidOutcome(outcome, defense, defender);
  } else {
    resolveExertOutcome(outcome, defense, defender);
  }

  return {
    attack,
    defense,
    weapon,
    attackRoll,
    defenseRoll,
    impact: {
      base: baseImpact,
      bonus: bonusImpact,
      remaining: reduced.remaining,
      armorReduced: outcome.armorReduced,
      reductionType: reduced.reductionType,
      preventedByBurn: outcome.preventedByBurn,
      unresolved: outcome.remaining,
    },
    losses: outcome.losses,
    avoidConsequence: outcome.avoidConsequence,
    rupture: outcome.rupture,
    notes: outcome.notes,
  };
}

export function applyExchangeResult(defender: Character, result: ExchangeResult): Character {
  return {
    ...defender,
    tracks: {
      endure: {
        current: Math.max(0, defender.tracks.endure.current - result.losses.endure),
        max: defender.tracks.endure.max,
      },
      vitality: {
        current: Math.max(0, defender.tracks.vitality.current - result.losses.vitality),
        max: defender.tracks.vitality.max,
      },
      avoid: {
        current: Math.max(0, defender.tracks.avoid.current - result.losses.avoid),
        max: defender.tracks.avoid.max,
      },
      exert: {
        current: Math.max(0, defender.tracks.exert.current - result.losses.exert),
        max: defender.tracks.exert.max,
      },
    },
  };
}
