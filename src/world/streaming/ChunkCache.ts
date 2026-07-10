import type { GeneratedChunk } from '../generation/GenerationTypes';
import { chunkKey } from '../../engine/voxel/coordinates';
import type { ChunkCoordinate } from '../../engine/voxel/VoxelTypes';

interface CacheEntry {
  readonly chunk: GeneratedChunk;
  lastAccess: number;
  pinned: boolean;
}

export class ChunkCache {
  readonly #entries = new Map<string, CacheEntry>();
  readonly #maximumBytes: number;
  #clock = 0;
  #bytes = 0;

  public constructor(maximumBytes: number) {
    if (!Number.isSafeInteger(maximumBytes) || maximumBytes <= 0) throw new RangeError('Chunk cache budget must be positive.');
    this.#maximumBytes = maximumBytes;
  }

  public get bytes(): number { return this.#bytes; }
  public get size(): number { return this.#entries.size; }

  public get(coordinate: ChunkCoordinate): GeneratedChunk | undefined {
    const entry = this.#entries.get(chunkKey(coordinate));
    if (entry !== undefined) entry.lastAccess = ++this.#clock;
    return entry?.chunk;
  }

  public put(chunk: GeneratedChunk, pinned = false): readonly GeneratedChunk[] {
    const key = chunkKey(chunk.coordinate);
    const existing = this.#entries.get(key);
    if (existing !== undefined) this.#bytes -= this.#measure(existing.chunk);
    this.#entries.set(key, { chunk, lastAccess: ++this.#clock, pinned });
    this.#bytes += this.#measure(chunk);
    return this.#evict();
  }

  public setPinned(coordinate: ChunkCoordinate, pinned: boolean): void {
    const entry = this.#entries.get(chunkKey(coordinate));
    if (entry !== undefined) entry.pinned = pinned;
  }

  public delete(coordinate: ChunkCoordinate): GeneratedChunk | null {
    const key = chunkKey(coordinate);
    const entry = this.#entries.get(key);
    if (entry === undefined) return null;
    this.#entries.delete(key);
    this.#bytes -= this.#measure(entry.chunk);
    return entry.chunk;
  }

  #evict(): readonly GeneratedChunk[] {
    const evicted: GeneratedChunk[] = [];
    while (this.#bytes > this.#maximumBytes) {
      const candidate = [...this.#entries.entries()].filter(([, entry]) => !entry.pinned).sort((left, right) => left[1].lastAccess - right[1].lastAccess)[0];
      if (candidate === undefined) break;
      this.#entries.delete(candidate[0]);
      this.#bytes -= this.#measure(candidate[1].chunk);
      evicted.push(candidate[1].chunk);
    }
    return evicted;
  }

  #measure(chunk: GeneratedChunk): number { return chunk.voxels.byteLength + chunk.surfaceBiomes.byteLength; }
}
