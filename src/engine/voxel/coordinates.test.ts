import { describe, expect, it } from 'vitest';
import { CHUNK_EDGE } from './VoxelTypes';
import { worldToChunkAddress } from './coordinates';

describe('worldToChunkAddress', () => {
  it('keeps positive coordinates stable at a chunk boundary', () => {
    expect(worldToChunkAddress({ x: CHUNK_EDGE, y: 0, z: 0 })).toEqual({
      chunk: { x: 1, y: 0, z: 0 },
      local: { x: 0, y: 0, z: 0 },
    });
  });

  it('maps negative world coordinates without seam duplication', () => {
    expect(worldToChunkAddress({ x: -1, y: -32, z: -33 })).toEqual({
      chunk: { x: -1, y: -1, z: -2 },
      local: { x: 31, y: 0, z: 31 },
    });
  });
});
