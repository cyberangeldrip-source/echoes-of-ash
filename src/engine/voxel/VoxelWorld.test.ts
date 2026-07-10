import { describe, expect, it } from 'vitest';
import { CHUNK_VOLUME, VoxelId } from './VoxelTypes';
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

  it('imports generated data without exposing the source buffer', () => {
    const world = new VoxelWorld();
    const source = new Uint16Array(CHUNK_VOLUME);
    source[0] = VoxelId.Basalt;
    world.importChunk({ x: 0, y: 0, z: 0 }, source);
    source[0] = VoxelId.Air;
    expect(world.getVoxel({ x: 0, y: 0, z: 0 })).toBe(VoxelId.Basalt);
  });

  it('marks adjacent chunks dirty when a generated chunk enters or leaves', () => {
    const world = new VoxelWorld();
    world.importChunk({ x: 0, y: 0, z: 0 }, new Uint16Array(CHUNK_VOLUME));
    expect(world.drainDirtyChunks(7)).toHaveLength(7);
    expect(world.unloadChunk({ x: 0, y: 0, z: 0 })).not.toBeNull();
    expect(world.drainDirtyChunks(7)).toContain('1,0,0');
  });
});
