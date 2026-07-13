/**
 * Seeded pseudo-random number generator (Mulberry32).
 *
 * Benefits:
 * - Deterministic: same seed → same sequence → reproducible datasets
 * - Fast: single 32-bit state, no memory allocations
 * - Statistically good: passes BigCrush for practical purposes
 *
 * Usage:
 *   const rng = createRng(42);
 *   rng.next();           // 0..1 float
 *   rng.int(1, 100);      // integer in range
 *   rng.pick(array);      // random element
 *   rng.weighted(items, weights);  // weighted selection
 */

export interface Rng {
  /** Returns a float in [0, 1) */
  next(): number;
  /** Returns an integer in [min, max] inclusive */
  int(min: number, max: number): number;
  /** Returns a float in [min, max) with given decimal precision */
  float(min: number, max: number, decimals?: number): number;
  /** Pick a random element from an array */
  pick<T>(arr: readonly T[]): T;
  /** Pick with weighted probability (weights don't need to sum to 1) */
  weighted<T>(items: readonly T[], weights: readonly number[]): T;
  /** Pick using Zipf distribution (first items are much more likely) */
  zipf<T>(arr: readonly T[], skew?: number): T;
  /** Generate a random string of given length from charset */
  string(length: number, charset: string): string;
  /** Shuffle an array (Fisher-Yates) returning a new array */
  shuffle<T>(arr: readonly T[]): T[];
  /** Boolean with given probability of true (0..1) */
  bool(probability?: number): boolean;
  /** Normal distribution (Box-Muller) with given mean and stddev */
  gaussian(mean: number, stddev: number): number;
  /** Get the current seed for reproducibility */
  seed: number;
  /** Fork: create a child RNG with a derived seed (for parallel generation) */
  fork(): Rng;
}

/**
 * Create a seeded RNG instance using Mulberry32 algorithm.
 * If no seed is provided, uses a time-based seed.
 */
export function createRng(seed?: number): Rng {
  let state = seed ?? (Date.now() ^ (Math.random() * 0x100000000)) >>> 0;
  const originalSeed = state;

  // Mulberry32 core
  function mulberry32(): number {
    state |= 0;
    state = (state + 0x6D2B79F5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  const rng: Rng = {
    seed: originalSeed,

    next(): number {
      return mulberry32();
    },

    int(min: number, max: number): number {
      return Math.floor(mulberry32() * (max - min + 1)) + min;
    },

    float(min: number, max: number, decimals = 2): number {
      const val = mulberry32() * (max - min) + min;
      const factor = Math.pow(10, decimals);
      return Math.round(val * factor) / factor;
    },

    pick<T>(arr: readonly T[]): T {
      return arr[Math.floor(mulberry32() * arr.length)];
    },

    weighted<T>(items: readonly T[], weights: readonly number[]): T {
      const totalWeight = weights.reduce((a, b) => a + b, 0);
      let r = mulberry32() * totalWeight;
      for (let i = 0; i < items.length; i++) {
        r -= weights[i];
        if (r <= 0) return items[i];
      }
      return items[items.length - 1];
    },

    zipf<T>(arr: readonly T[], skew = 1.0): T {
      // Zipf: P(rank k) ∝ 1/k^skew
      // Pre-compute weights on the fly (cheap for typical array sizes)
      const n = arr.length;
      let totalWeight = 0;
      for (let i = 1; i <= n; i++) {
        totalWeight += 1 / Math.pow(i, skew);
      }
      let r = mulberry32() * totalWeight;
      for (let i = 0; i < n; i++) {
        r -= 1 / Math.pow(i + 1, skew);
        if (r <= 0) return arr[i];
      }
      return arr[n - 1];
    },

    string(length: number, charset: string): string {
      let s = '';
      for (let i = 0; i < length; i++) {
        s += charset[Math.floor(mulberry32() * charset.length)];
      }
      return s;
    },

    shuffle<T>(arr: readonly T[]): T[] {
      const result = [...arr];
      for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(mulberry32() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
      }
      return result;
    },

    bool(probability = 0.5): boolean {
      return mulberry32() < probability;
    },

    gaussian(mean: number, stddev: number): number {
      // Box-Muller transform
      const u1 = mulberry32();
      const u2 = mulberry32();
      const z = Math.sqrt(-2 * Math.log(u1 || 0.0001)) * Math.cos(2 * Math.PI * u2);
      return mean + z * stddev;
    },

    fork(): Rng {
      // Derive a new seed from current state
      const childSeed = (state ^ 0xDEADBEEF) >>> 0;
      return createRng(childSeed);
    },
  };

  return rng;
}

/**
 * Utility: create a deterministic seed from a string (for shareable URLs).
 */
export function seedFromString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0; // Convert to 32-bit integer
  }
  return hash >>> 0;
}
