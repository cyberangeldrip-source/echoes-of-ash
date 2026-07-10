import { describe, expect, it } from 'vitest';
import { VoxelId } from '../../engine/voxel/VoxelTypes';
import { VoxelWorld } from '../../engine/voxel/VoxelWorld';
import type { ChunkStreamController, StreamUpdate } from './ChunkStreamController';
import { WorldStreamRuntime } from './WorldStreamRuntime';

class FakeStreamController {
  public update(): Promise<StreamUpdate> {
    const voxels = new Uint16Array(32 * 32 * 32);
    voxels[0] = VoxelId.Basalt;
    return Promise.resolve({ loaded: [{ coordinate: { x: 0, y: 0, z: 0 }, voxels, surfaceBiomes: new Uint8Array(32 * 32), checksum: 1 }], evicted: [], pending: 0 });
  }
}

describe('WorldStreamRuntime', () => {
  it('imports worker output through the authoritative world API', async () => {
    const world = new VoxelWorld();
    const runtime = new WorldStreamRuntime(world, new FakeStreamController() as unknown as ChunkStreamController);
    const result = await runtime.update({ position: { x: 0, y: 0, z: 0 }, velocity: { x: 0, y: 0, z: 0 } }, 1, 8);
    expect(result.imported).toBe(1);
    expect(world.getVoxel({ x: 0, y: 0, z: 0 })).toBe(VoxelId.Basalt);
    expect(result.dirtyChunks).toContain('0,0,0');
  });

  it('does not evict chunks carrying player mutations', () => {
    const world = new VoxelWorld();
    world.ensureChunk({ x: 0, y: 0, z: 0 });
    world.setVoxel({ x: 1, y: 1, z: 1 }, VoxelId.Obsidian);
    expect(world.unloadChunk({ x: 0, y: 0, z: 0 })).toBeNull();
    expect(world.hasChunk({ x: 0, y: 0, z: 0 })).toBe(true);
  });
});
