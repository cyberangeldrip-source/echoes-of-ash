import type { VoxelWorld } from '../../engine/voxel/VoxelWorld';
import type { ChunkStreamController, StreamUpdate } from './ChunkStreamController';
import type { StreamingFocus } from './ChunkStreamingPolicy';

export interface WorldStreamRuntimeUpdate extends StreamUpdate {
  readonly imported: number;
  readonly unloaded: number;
  readonly dirtyChunks: readonly string[];
}

export class WorldStreamRuntime {
  readonly #world: VoxelWorld;
  readonly #stream: ChunkStreamController;

  public constructor(world: VoxelWorld, stream: ChunkStreamController) {
    this.#world = world;
    this.#stream = stream;
  }

  public async update(focus: StreamingFocus, requestBudget: number, remeshBudget: number): Promise<WorldStreamRuntimeUpdate> {
    const result = await this.#stream.update(focus, requestBudget);
    let imported = 0;
    let unloaded = 0;
    for (const chunk of result.loaded) {
      this.#world.importChunk(chunk.coordinate, chunk.voxels);
      imported += 1;
    }
    for (const chunk of result.evicted) {
      if (this.#world.unloadChunk(chunk.coordinate) !== null) unloaded += 1;
    }
    return { ...result, imported, unloaded, dirtyChunks: this.#world.drainDirtyChunks(remeshBudget) };
  }
}
