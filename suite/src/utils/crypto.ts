/**
 * Generates a cryptographically secure random number between 0 (inclusive) and 1 (exclusive),
 * similar to Math.random().
 */
export function getSecureRandom(): number {
  const array = new Uint32Array(1);
  (globalThis.crypto || window.crypto).getRandomValues(array);
  // Divide by 2^32 to get a value between 0 and 1
  return array[0] / (0xffffffff + 1);
}
