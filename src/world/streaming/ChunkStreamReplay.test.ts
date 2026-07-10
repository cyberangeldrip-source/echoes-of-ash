import { describe, expect, it } from 'vitest';
import { CHUNK_VOLUME, VoxelId } from '../../engine/voxel/VoxelTypes';
import { VoxelWorld } from '../../engine/voxel/VoxelWorld';
import type { GeneratedChunk } from '../generation/GenerationTypes';
import { ChunkCache } from './ChunkCache';
import type { ChunkGenerationClient } from './ChunkGenerationClient';
import { ChunkStreamController } from './ChunkStreamController';
import { ChunkStreamingPolicy } from './ChunkStreamingPolicy';

class DeterministicGenerator {
  public generate(_seed: string, coordinate: { x: number; y: number; z: number }): Promise<GeneratedChunk> {
    const voxels = new Uint16Array(CHUNK_VOLUME);
    voxels.fill((Math.abs(coordinate.x + coordinate.z) % 4 + 1) as VoxelId);
    return Promise.resolve({ coordinate, voxels, surfaceBiomes: new Uint8Array(1024), checksum: coordinate.x * 31 + coordinate.z });
  }
}

const REPLAY = [
  { position: { x: 0, y: 64, z: 0 }, velocity: { x: 0, y: 0, z: 0 } },
  { position: { x: 48, y: 64, z: 4 }, velocity: { x: 18, y: 0, z: 2 } },
  { position: { x: 160, y: 64, z: -64 }, velocity: { x: 70, y: 0, z: -20 } },
] as const;

async function runReplay(): Promise<readonly string[]> {
  const world = new VoxelWorld();
  const policy = new ChunkStreamingPolicy({ renderRadius: 1, prefetchMargin: 1, verticalRadius: 0, velocityLookaheadSeconds: 2 });
  const controller = new ChunkStreamController('EMBER', new DeterministicGenerator() as unknown as ChunkGenerationClient, policy, new ChunkCache(1024 * 1024 * 8), world);
  const trace: string[] = [];
  world.subscribe(event => trace.push(`${event.type}:${event.coordinate.x},${event.coordinate.y},${event.coordinate.z}`));
  for (const focus of REPLAY) {
    controller.update(focus, 100);
    await Promise.resolve(); await Promise.resolve();
    controller.update(focus, 0);
    trace.push(`dirty:${world.consumeDirtyChunks().join('|')}`);
  }
  return trace;
}

describe('chunk stream seed replay', () => {
  it('reproduces identical lifecycle and seam invalidation traces', async () => {
    expect(await runReplay()).toEqual(await runReplay());
  });
});
