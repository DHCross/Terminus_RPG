/* ── Coherence System — Setting Pack ── */

import type { ArmorType, WeaponVector, ActionStat, DefenseStat, ConsequenceName } from './character';
import type { PressureType, ActiveThreatRole } from './scene';
import type { SimulationTruth } from './campaign';

/**
 * A Setting Pack is one expression of the Coherence System engine.
 *
 * The engine's mechanical vocabulary (action stats, defense stats, weapon
 * vectors) is fixed: those are how the resolution engine actually works. A
 * pack supplies display labels for that mechanical vocabulary, and defines the
 * content vocabulary the engine carries but does not mechanically branch on:
 * armor types, consequence names, pressure types, threat roles, build budgets,
 * and the default simulation-truth template.
 *
 * Terminus is one pack. Generic Fantasy is another. A genre with no pack uses
 * {@link DEFAULT_PACK} (the Coherence baseline).
 */

export interface StatLabels {
  /** Display labels for the fixed action stats (force/agility/willpower). */
  actions: Partial<Record<ActionStat, string>>;
  /** Display labels for the fixed defense stats (endure/avoid/exert). */
  defenses: Partial<Record<DefenseStat, string>>;
}

export interface ArmorLabels {
  /** Display labels for the supported armor types. */
  [type: string]: string;
}

export interface WeaponVectorLabels {
  /** Display labels for the fixed weapon vectors. */
  [vector: string]: string;
}

/**
 * Content vocabulary a pack may override or extend.
 *
 * Each field is optional; omitted fields fall back to the engine defaults
 * exported from `character.ts` and `scene.ts`.
 */
export interface PackVocabulary {
  /**
   * Armor types the setting supports, with their impact-reduction values.
   * Defaults to the engine's `ARMOR_TYPES` / `ARMOR_REDUCTION`.
   */
  armor?: {
    types: readonly ArmorType[];
    reduction: Record<ArmorType, number>;
    labels?: ArmorLabels;
  };
  /**
   * Consequence names the setting recognizes. Defaults to the engine's
   * `CONSEQUENCE_NAMES`. Packs may extend or replace this list.
   */
  consequences?: readonly ConsequenceName[];
  /**
   * Pressure types the setting uses to classify scene pressure. Defaults to
   * the engine's `PRESSURE_TYPES`.
   */
  pressureTypes?: readonly PressureType[];
  /**
   * Active threat roles the setting uses. Defaults to the engine's
   * `ACTIVE_THREAT_ROLES`.
   */
  threatRoles?: readonly ActiveThreatRole[];
}

export interface BuildBudgets {
  /** Build points spent on action dice. Default 5. */
  actions: number;
  /** Build points spent on defense dice. Default 5. */
  defenses: number;
}

export interface SettingPack {
  id: string;
  name: string;
  /** Genre label, e.g. "civic dark fantasy", "generic fantasy". */
  genre: string;
  version: string;
  description?: string;
  /** Display labels for the engine's fixed mechanical vocabulary. */
  statLabels?: StatLabels;
  weaponVectorLabels?: WeaponVectorLabels;
  /** Content vocabulary overrides/extensions. */
  vocabulary?: PackVocabulary;
  /** Character-creation build budgets. */
  buildBudgets?: Partial<BuildBudgets>;
  /** Default simulation-truth scaffolding for new campaigns. */
  simulationTemplate?: Partial<SimulationTruth>;
}

/** The Coherence baseline pack: engine defaults with no setting flavor. */
export const DEFAULT_PACK: SettingPack = {
  id: 'coherence-baseline',
  name: 'Coherence System',
  genre: 'generic',
  version: '0.1.0',
  description: 'The genre-agnostic Coherence System baseline. No setting flavor applied.',
};
