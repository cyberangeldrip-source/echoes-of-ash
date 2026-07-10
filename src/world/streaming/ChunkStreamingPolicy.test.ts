import { describe, expect, it } from 'vitest';
import { ChunkStreamingPolicy } from './ChunkStreamingPolicy';

describe('ChunkStreamingPolicy', () => {
  it('prefetches chunks along velocity beyond the current render area', () => {
    const policy = new ChunkStreamingPolicy({ renderRadius: 2, prefetchMargin: 2, verticalRadius: 1, velocityLookaheadSeconds: 3 });
    const targets = policy.targets({ position: { x: 0, y: 64, z: 0 }, velocity: { x: 40, y: 0, z: 0 } });
    expect(targets.some(target => target.coordinate.x >= 3 && !target.render)).toBe(true);
    expect(targets[0]?.coordinate).toEqual({ x: 0, y: 2, z: 0 });
  });

  it('deduplicates overlapping current and predicted regions', () => {
    const policy = new ChunkStreamingPolicy({ renderRadius: 1, prefetchMargin: 1, verticalRadius: 0, velocityLookaheadSeconds: 2 });
    const targets = policy.targets({ position: { x: 10, y: 10, z: 10 }, velocity: { x: 1, y: 0, z: 0 } });
    const keys = targets.map(target => `${target.coordinate.x},${target.coordinate.y},${target.coordinate.z}`);
    expect(new Set(keys).size).toBe(keys.length);
  });
});
