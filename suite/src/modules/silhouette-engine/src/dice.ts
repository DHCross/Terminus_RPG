/* ── Silhouette RPG — Dice Primitives ── */

export const DIE_SIZES = [4, 6, 8, 10, 12] as const;
export type DieSize = typeof DIE_SIZES[number];

export const DIE_LABELS = ['d4', 'd6', 'd8', 'd10', 'd12'] as const;
export type DieLabel = typeof DIE_LABELS[number];

export type InitiativePhase = 1 | 2 | 3 | 4 | 5;

/** Silhouette uses pip counts derived directly from the die ladder. */
export const PIP_COUNTS: Record<DieSize, number> = {
  4: 1,
  6: 2,
  8: 3,
  10: 4,
  12: 5,
};

/** Character creation starts at d4 and spends one point per step up the ladder. */
export const BUILD_POINT_COST: Record<DieSize, number> = {
  4: 0,
  6: 1,
  8: 2,
  10: 3,
  12: 4,
};

export function peakValue(die: DieSize): number {
  return die;
}

export function pipCount(die: DieSize): number {
  return PIP_COUNTS[die];
}

export function buildPointCost(die: DieSize): number {
  return BUILD_POINT_COST[die];
}

export function initiativePhaseFromAgility(die: DieSize): InitiativePhase {
  switch (die) {
    case 12:
      return 1;
    case 10:
      return 2;
    case 8:
      return 3;
    case 6:
      return 4;
    case 4:
      return 5;
  }
}

export function dieFromBuildPoints(points: number): DieSize {
  switch (points) {
    case 0:
      return 4;
    case 1:
      return 6;
    case 2:
      return 8;
    case 3:
      return 10;
    case 4:
      return 12;
    default:
      throw new RangeError(`Build-point rank ${points} is out of bounds [0..4]`);
  }
}
