const FNV_OFFSET = 2166136261;
const FNV_PRIME = 16777619;

export function hashSeed(value: string): number {
  let hash = FNV_OFFSET;
  for (const character of value) {
    hash ^= character.codePointAt(0) ?? 0;
    hash = Math.imul(hash, FNV_PRIME);
  }
  return hash >>> 0;
}

export function hashCoordinates(seed: number, x: number, y: number, z = 0): number {
  let hash = seed;
  hash = Math.imul(hash ^ x, 0x45d9f3b);
  hash = Math.imul(hash ^ y, 0x45d9f3b);
  hash = Math.imul(hash ^ z, 0x45d9f3b);
  hash ^= hash >>> 16;
  return hash >>> 0;
}

export function randomUnit(hash: number): number {
  return hash / 0xffffffff;
}
