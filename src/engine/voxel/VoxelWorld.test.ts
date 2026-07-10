import { describe, expect, it } from 'vitest';
import { VoxelId } from './VoxelTypes';
import { VoxelWorld } from './VoxelWorld';

describe('VoxelWorld', () => {
  it('routes mutations through the authoritative store', () => {
    const world = new VoxelWorld();
    const mutation = world.setVoxel({ x: 4, y: 5, z: 6 }, VoxelId.Basalt);
    expect(mutation?.before).toBe(VoxelId.Air);
    expect(world.getVoxel({ x: 4, y: 5, z: 6 })).toBe(VoxelId.Basalt);
    expect(world.setVoxel({ x: 4, y: 5, z: 6 }, VoxelId.Basalt)).toBeNull();
  });

  it('dirties both chunks when a seam voxel changes', () => {
    const world = new VoxelWorld();
    const mutation = world.setVoxel({ x: 31, y: 2, z: 3 }, VoxelId.Obsidian);
    expect(mutation?.dirtyChunks).toEqual(['0,0,0', '1,0,0']);
  });
});
