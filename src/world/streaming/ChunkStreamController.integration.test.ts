import { describe, expect, it } from 'vitest';
import { CHUNK_VOLUME, VoxelId } from '../../engine/voxel/VoxelTypes';
import { VoxelWorld } from '../../engine/voxel/VoxelWorld';
import type { GeneratedChunk } from '../generation/GenerationTypes';
import { ChunkCache } from './ChunkCache';
import type { ChunkGenerationClient } from './ChunkGenerationClient';
import { ChunkStreamController } from './ChunkStreamController';
import { ChunkStreamingPolicy } from './ChunkStreamingPolicy';

class ImmediateGenerator {
  public readonly requested: string[] = [];
  public generate(_seed: string, coordinate: { x: number; y: number; z: number }): Promise<GeneratedChunk> {
    this.requested.push(`${coordinate.x},${coordinate.y},${coordinate.z}`);
    const voxels = new Uint16Array(CHUNK_VOLUME);
    voxels.fill(VoxelId.Basalt);
    return Promise.resolve({ coordinate, voxels, surfaceBiomes: new Uint8Array(32 * 32), checksum: coordinate.x });
  }
}

async function flushGeneration(): Promise<void> { await Promise.resolve(); await Promise.resolve(); }

describe('ChunkStreamController', () => {
  it('prefetches along velocity and installs only render-target chunks', async () => {
    const generator = new ImmediateGenerator();
    const world = new VoxelWorld();
    const cache = new ChunkCache(20 * (CHUNK_VOLUME * 2 + 1024));
    const policy = new ChunkStreamingPolicy({ renderRadius: 1, prefetchMargin: 2, verticalRadius: 0, velocityLookaheadSeconds: 3 });
    const controller = new ChunkStreamController('EMBER', generator as unknown as ChunkGenerationClient, policy, cache, world);
    controller.update({ position: { x: 0, y: 0, z: 0 }, velocity: { x: 40, y: 0, z: 0 } }, 100);
    await flushGeneration();
    controller.update({ position: { x: 0, y: 0, z: 0 }, velocity: { x: 40, y: 0, z: 0 } }, 0);
    expect(generator.requested.some(key => Number(key.split(',')[0]) >= 3)).toBe(true);
    expect(world.loadedCoordinates().every(coordinate => Math.hypot(coordinate.x, coordinate.z) <= 1)).toBe(true);
  });

  it('enforces memory budget during rapid teleport stress', async () => {
    const generator = new ImmediateGenerator();
    const world = new VoxelWorld();
    const chunkBytes = CHUNK_VOLUME * 2 + 32 * 32;
    const cache = new ChunkCache(chunkBytes * 5);
    const policy = new ChunkStreamingPolicy({ renderRadius: 0, prefetchMargin: 1, verticalRadius: 0, velocityLookaheadSeconds: 2 });
    const controller = new ChunkStreamController('EMBER', generator as unknown as ChunkGenerationClient, policy, cache, world);
    for (let teleport = 0; teleport < 12; teleport += 1) {
      controller.update({ position: { x: teleport * 320, y: 0, z: 0 }, velocity: { x: 80, y: 0, z: 0 } }, 20);
      await flushGeneration();
      const update = controller.update({ position: { x: teleport * 320, y: 0, z: 0 }, velocity: { x: 80, y: 0, z: 0 } }, 0);
      expect(update.cacheBytes).toBeLessThanOrEqual(cache.maximumBytes);
      expect(world.loadedChunkCount).toBeLessThanOrEqual(1);
    }
  });
});
