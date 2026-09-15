/**
 * Tiny seeded PRNG (mulberry32) so the generated dataset is reproducible —
 * same shape and content on every page load/build, not a different random
 * dataset each time, which would make bug reports and screenshots useless.
 */
export function createRng(seed: number) {
  let state = seed >>> 0

  function next(): number {
    state |= 0
    state = (state + 0x6d2b79f5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }

  function int(min: number, max: number): number {
    return Math.floor(next() * (max - min + 1)) + min
  }

  function float(min: number, max: number, decimals = 4): number {
    const value = next() * (max - min) + min
    const factor = 10 ** decimals
    return Math.round(value * factor) / factor
  }

  function bool(probability = 0.5): boolean {
    return next() < probability
  }

  function pick<T>(items: readonly T[]): T {
    return items[int(0, items.length - 1)]
  }

  function weightedPick<T>(items: readonly [T, number][]): T {
    const total = items.reduce((sum, [, weight]) => sum + weight, 0)
    let roll = next() * total
    for (const [item, weight] of items) {
      roll -= weight
      if (roll <= 0) return item
    }
    return items[items.length - 1][0]
  }

  function hex(length: number): string {
    let out = ''
    for (let i = 0; i < length; i++) out += int(0, 15).toString(16)
    return out
  }

  function address(): string {
    return `0x${hex(40)}`
  }

  function txHash(): string {
    return `0x${hex(64)}`
  }

  return { next, int, float, bool, pick, weightedPick, hex, address, txHash }
}

export type Rng = ReturnType<typeof createRng>
