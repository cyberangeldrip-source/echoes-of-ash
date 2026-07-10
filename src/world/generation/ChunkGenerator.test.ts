import { describe, expect, it } from 'vitest';
import { CHUNK_VOLUME } from '../../engine/voxel/VoxelTypes';
import { ChunkGenerator } from './ChunkGenerator';

describe('ChunkGenerator', () => {
  it('is deterministic for the same seed and coordinate', () => {
    const first = new ChunkGenerator('EMBER-1847').generate({ x: 2, y: 1, z: -3 });
    const second = new ChunkGenerator('EMBER-1847').generate({ x: 2, y: 1, z: -3 });
    expect(first.checksum).toBe(second.checksum);
    expect(first.voxels).toEqual(second.voxels);
    expect(first.voxels).toHaveLength(CHUNK_VOLUME);
  });

  it('produces structurally different worlds for different seeds', () => {
    const coordinate = { x: 0, y: 1, z: 0 };
    const first = new ChunkGenerator('EMBER-1847').generate(coordinate);
    const second = new ChunkGenerator('TIDE-9031').generate(coordinate);
    expect(first.checksum).not.toBe(second.checksum);
  });
});
