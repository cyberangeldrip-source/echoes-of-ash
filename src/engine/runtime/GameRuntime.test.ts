import { describe, expect, it } from 'vitest';
import { ChunkStreamingPolicy } from '../../world/streaming/ChunkStreamingPolicy';

describe('game runtime streaming configuration', () => {
  it('keeps prefetch beyond render radius in the player velocity direction', () => {
    const policy = new ChunkStreamingPolicy({ renderRadius: 5, prefetchMargin: 2, verticalRadius: 2, velocityLookaheadSeconds: 2.5 });
    const targets = policy.targets({ position: { x: 0, y: 64, z: 0 }, velocity: { x: 80, y: 0, z: 0 } });
    expect(targets.some(target => target.coordinate.x > 5 && !target.render)).toBe(true);
  });
});
