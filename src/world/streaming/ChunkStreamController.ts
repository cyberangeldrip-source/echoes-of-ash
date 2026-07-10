import { chunkKey } from '../../engine/voxel/coordinates';
import type { VoxelWorld } from '../../engine/voxel/VoxelWorld';
import type { GeneratedChunk } from '../generation/GenerationTypes';
import type { ChunkGenerationClient } from './ChunkGenerationClient';
import type { StreamingFocus, StreamingTarget } from './ChunkStreamingPolicy';
import { ChunkStreamingPolicy } from './ChunkStreamingPolicy';
import { ChunkCache } from './ChunkCache';

export interface StreamUpdate {
  readonly installed: readonly GeneratedChunk[];
  readonly unloaded: readonly string[];
  readonly evicted: readonly GeneratedChunk[];
  readonly pending: number;
  readonly cacheBytes: number;
}

interface CompletedGeneration {
  readonly key: string;
  readonly chunk: GeneratedChunk;
}

export class ChunkStreamController {
  readonly #seed: string;
  readonly #generator: ChunkGenerationClient;
  readonly #policy: ChunkStreamingPolicy;
  readonly #cache: ChunkCache;
  readonly #world: VoxelWorld;
  readonly #pending = new Set<string>();
  readonly #completed: CompletedGeneration[] = [];
  readonly #failed = new Map<string, Error>();

  public constructor(seed: string, generator: ChunkGenerationClient, policy: ChunkStreamingPolicy, cache: ChunkCache, world: VoxelWorld) {
    this.#seed = seed;
    this.#generator = generator;
    this.#policy = policy;
    this.#cache = cache;
    this.#world = world;
  }

  public update(focus: StreamingFocus, requestBudget: number): StreamUpdate {
    if (!Number.isSafeInteger(requestBudget) || requestBudget < 0) throw new RangeError('Request budget must be a non-negative integer.');
    const targets = this.#policy.targets(focus);
    const renderTargets = new Map(targets.filter(target => target.render).map(target => [chunkKey(target.coordinate), target]));
    const installed: GeneratedChunk[] = [];
    const unloaded = this.#unloadOutsideRenderTargets(renderTargets);

    this.#cache.unpinAll();
    for (const target of targets) if (target.render) this.#cache.setPinned(target.coordinate, true);

    const completed = this.#completed.splice(0, this.#completed.length).sort((left, right) => left.key.localeCompare(right.key));
    const evicted: GeneratedChunk[] = [];
    for (const completion of completed) {
      const target = renderTargets.get(completion.key);
      evicted.push(...this.#cache.put(completion.chunk, target !== undefined));
    }

    for (const target of renderTargets.values()) {
      const cached = this.#cache.peek(target.coordinate);
      if (cached !== undefined && this.#world.installGeneratedChunk(cached.coordinate, cached.voxels)) installed.push(cached);
    }

    for (const chunk of evicted) this.#world.unloadChunk(chunk.coordinate);
    this.#schedule(targets, requestBudget);

    return { installed, unloaded, evicted, pending: this.#pending.size, cacheBytes: this.#cache.bytes };
  }

  public failures(): readonly Readonly<{ key: string; error: Error }>[] {
    return [...this.#failed.entries()].map(([key, error]) => ({ key, error })).sort((left, right) => left.key.localeCompare(right.key));
  }

  #schedule(targets: readonly StreamingTarget[], requestBudget: number): void {
    let requested = 0;
    for (const target of targets) {
      if (requested >= requestBudget) break;
      const key = chunkKey(target.coordinate);
      if (this.#cache.peek(target.coordinate) !== undefined || this.#pending.has(key) || this.#failed.has(key)) continue;
      this.#pending.add(key);
      requested += 1;
      void this.#generator.generate(this.#seed, target.coordinate).then(chunk => {
        this.#completed.push({ key, chunk });
      }).catch((error: unknown) => {
        this.#failed.set(key, error instanceof Error ? error : new Error('Unknown chunk generation failure.'));
      }).finally(() => this.#pending.delete(key));
    }
  }

  #unloadOutsideRenderTargets(renderTargets: ReadonlyMap<string, StreamingTarget>): readonly string[] {
    const unloaded: string[] = [];
    for (const coordinate of this.#world.loadedCoordinates()) {
      const key = chunkKey(coordinate);
      if (renderTargets.has(key)) continue;
      if (this.#world.unloadChunk(coordinate) !== null) unloaded.push(key);
    }
    return unloaded.sort();
  }
}
