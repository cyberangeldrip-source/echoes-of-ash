import { describe, expect, it } from 'vitest';
import { ChunkCache } from './ChunkCache';

function chunk(x: number) {
  return { coordinate: { x, y: 0, z: 0 }, voxels: new Uint16Array(8), surfaceBiomes: new Uint8Array(4), checksum: x };
}

describe('ChunkCache', () => {
  it('evicts the least recently used unpinned chunk under budget pressure', () => {
    const cache = new ChunkCache(25);
    cache.put(chunk(0));
    cache.put(chunk(1));
    cache.get({ x: 0, y: 0, z: 0 });
    const evicted = cache.put(chunk(2));
    expect(evicted.map(value => value.coordinate.x)).toEqual([1]);
    expect(cache.get({ x: 0, y: 0, z: 0 })).toBeDefined();
  });

  it('never evicts a render-pinned chunk', () => {
    const cache = new ChunkCache(12);
    cache.put(chunk(0), true);
    const evicted = cache.put(chunk(1));
    expect(evicted.map(value => value.coordinate.x)).toEqual([1]);
  });
});
