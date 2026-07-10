import { chunkKey } from '../../engine/voxel/coordinates';
import type { GeneratedChunk } from '../generation/GenerationTypes';
import type { ChunkGenerationClient } from './ChunkGenerationClient';
import type { StreamingFocus } from './ChunkStreamingPolicy';
import { ChunkStreamingPolicy } from './ChunkStreamingPolicy';
import { ChunkCache } from './ChunkCache';

export interface StreamUpdate {
  readonly loaded: readonly GeneratedChunk[];
  readonly evicted: readonly GeneratedChunk[];
  readonly pending: number;
}

export class ChunkStreamController {
  readonly #seed: string;
  readonly #generator: ChunkGenerationClient;
  readonly #policy: ChunkStreamingPolicy;
  readonly #cache: ChunkCache;
  readonly #pending = new Set<string>();
  readonly #completed: GeneratedChunk[] = [];

  public constructor(seed: string, generator: ChunkGenerationClient, policy: ChunkStreamingPolicy, cache: ChunkCache) {
    this.#seed = seed;
    this.#generator = generator;
    this.#policy = policy;
    this.#cache = cache;
  }

  public async update(focus: StreamingFocus, requestBudget: number): Promise<StreamUpdate> {
    const targets = this.#policy.targets(focus);
    const desired = new Set(targets.map(target => chunkKey(target.coordinate)));
    for (const target of targets) this.#cache.setPinned(target.coordinate, target.render);
    let requested = 0;
    for (const target of targets) {
      if (requested >= requestBudget) break;
      const key = chunkKey(target.coordinate);
      if (this.#cache.get(target.coordinate) !== undefined || this.#pending.has(key)) continue;
      this.#pending.add(key);
      requested += 1;
      void this.#generator.generate(this.#seed, target.coordinate).then(chunk => this.#completed.push(chunk)).finally(() => this.#pending.delete(key));
    }
    const loaded = this.#completed.splice(0, this.#completed.length);
    const evicted: GeneratedChunk[] = [];
    for (const chunk of loaded) evicted.push(...this.#cache.put(chunk, desired.has(chunkKey(chunk.coordinate))));
    return { loaded, evicted, pending: this.#pending.size };
  }
}
