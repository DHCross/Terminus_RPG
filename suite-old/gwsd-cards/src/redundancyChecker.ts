/* ── Redundancy Checker — detect near-duplicate GWSD cards ──
 *
 * Compares all scene pairs using Jaccard word-overlap similarity.
 * Flags pairs at or above threshold (default 90%) as "Narrative Redundancy"
 * so the GM/writer can merge, rewrite, or intentionally keep them.
 */

import type { Scene } from './types';

export interface RedundancyPair {
  sceneA: string; // scene ID
  sceneB: string;
  similarity: number; // 0–1
}

/** Jaccard similarity between two word sets. */
function wordSimilarity(a: string, b: string): number {
  const wordsA = new Set(a.toLowerCase().split(/\s+/).filter((w) => w.length > 2));
  const wordsB = new Set(b.toLowerCase().split(/\s+/).filter((w) => w.length > 2));

  if (wordsA.size === 0 && wordsB.size === 0) return 1;
  if (wordsA.size === 0 || wordsB.size === 0) return 0;

  let overlap = 0;
  for (const word of wordsA) {
    if (wordsB.has(word)) overlap++;
  }

  const union = new Set([...wordsA, ...wordsB]).size;
  return overlap / union;
}

/** Extract combined GWSD body text from a scene. */
function sceneBodyText(scene: Scene): string {
  return scene.cards
    .map((card) => (card.cardText || card.text).trim())
    .join(' ');
}

/**
 * Find all scene pairs with GWSD bodies at or above `threshold` similarity.
 * Default threshold: 0.9 (90% word overlap = likely redundant).
 */
export function findRedundancies(
  scenes: Scene[],
  threshold = 0.9,
): RedundancyPair[] {
  const pairs: RedundancyPair[] = [];

  for (let i = 0; i < scenes.length; i++) {
    const bodyA = sceneBodyText(scenes[i]);
    if (!bodyA.trim()) continue;

    for (let j = i + 1; j < scenes.length; j++) {
      const bodyB = sceneBodyText(scenes[j]);
      if (!bodyB.trim()) continue;

      const sim = wordSimilarity(bodyA, bodyB);
      if (sim >= threshold) {
        pairs.push({ sceneA: scenes[i].id, sceneB: scenes[j].id, similarity: sim });
      }
    }
  }

  return pairs;
}

/** Set of scene IDs appearing in any redundancy pair. */
export function redundantSceneIds(pairs: RedundancyPair[]): Set<string> {
  const ids = new Set<string>();
  for (const { sceneA, sceneB } of pairs) {
    ids.add(sceneA);
    ids.add(sceneB);
  }
  return ids;
}
