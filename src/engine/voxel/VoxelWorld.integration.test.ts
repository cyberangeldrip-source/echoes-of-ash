import { describe, expect, it } from 'vitest';
import { CHUNK_VOLUME, VoxelId } from './VoxelTypes';
import { VoxelWorld } from './VoxelWorld';

function generated(fill: VoxelId): Uint16Array {
  const voxels = new Uint16Array(CHUNK_VOLUME);
  voxels.fill(fill);
  return voxels;
}

describe('VoxelWorld streamed lifecycle', () => {
  it('installs and unloads generated chunks only through lifecycle APIs', () => {
    const world = new VoxelWorld();
    const events: string[] = [];
    world.subscribe(event => events.push(`${event.type}:${event.coordinate.x}`));
    expect(world.installGeneratedChunk({ x: 0, y: 0, z: 0 }, generated(VoxelId.Basalt))).toBe(true);
    expect(world.installGeneratedChunk({ x: 0, y: 0, z: 0 }, generated(VoxelId.Ash))).toBe(false);
    expect(world.getVoxel({ x: 2, y: 2, z: 2 })).toBe(VoxelId.Basalt);
    expect(world.unloadChunk({ x: 0, y: 0, z: 0 })).not.toBeNull();
    expect(events).toEqual(['loaded:0', 'unloaded:0']);
  });

  it('reapplies authoritative voxel diffs after eviction and regeneration', () => {
    const world = new VoxelWorld();
    const coordinate = { x: 0, y: 0, z: 0 };
    world.installGeneratedChunk(coordinate, generated(VoxelId.Basalt));
    world.setVoxel({ x: 31, y: 4, z: 4 }, VoxelId.Obsidian);
    world.unloadChunk(coordinate);
    world.installGeneratedChunk(coordinate, generated(VoxelId.Basalt));
    expect(world.getVoxel({ x: 31, y: 4, z: 4 })).toBe(VoxelId.Obsidian);
    expect(world.diffSnapshots()).toEqual([{ chunkKey: '0,0,0', revision: 1, changes: [[4255, VoxelId.Obsidian]] }]);
  });

  it('invalidates both sides of a seam on chunk load and unload', () => {
    const world = new VoxelWorld();
    world.installGeneratedChunk({ x: 0, y: 0, z: 0 }, generated(VoxelId.Basalt));
    expect(world.consumeDirtyChunks()).toContain('1,0,0');
    world.installGeneratedChunk({ x: 1, y: 0, z: 0 }, generated(VoxelId.Basalt));
    const loadedDirty = world.consumeDirtyChunks();
    expect(loadedDirty).toContain('0,0,0');
    expect(loadedDirty).toContain('1,0,0');
    world.unloadChunk({ x: 1, y: 0, z: 0 });
    expect(world.consumeDirtyChunks()).toContain('0,0,0');
  });
});
