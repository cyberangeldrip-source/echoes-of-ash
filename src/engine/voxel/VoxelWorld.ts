import { CHUNK_EDGE, VoxelId } from './VoxelTypes';
import type { ChunkCoordinate, LocalVoxelCoordinate, WorldVoxelCoordinate } from './VoxelTypes';
import { chunkKey, worldToChunkAddress } from './coordinates';
import { VoxelChunk } from './VoxelChunk';

export interface VoxelMutation {
  readonly position: WorldVoxelCoordinate;
  readonly before: VoxelId;
  readonly after: VoxelId;
  readonly dirtyChunks: readonly string[];
}

export class VoxelWorld {
  readonly #chunks = new Map<string, VoxelChunk>();
  readonly #dirtyChunks = new Set<string>();

  public get loadedChunkCount(): number { return this.#chunks.size; }

  public ensureChunk(coordinate: ChunkCoordinate): VoxelChunk {
    const key = chunkKey(coordinate);
    const existing = this.#chunks.get(key);
    if (existing !== undefined) return existing;
    const chunk = new VoxelChunk(coordinate);
    this.#chunks.set(key, chunk);
    return chunk;
  }

  public importChunk(coordinate: ChunkCoordinate, voxels: Uint16Array): VoxelChunk {
    const key = chunkKey(coordinate);
    const existing = this.#chunks.get(key);
    if (existing !== undefined && existing.revision > 0) return existing;
    const chunk = new VoxelChunk(coordinate, voxels);
    this.#chunks.set(key, chunk);
    this.#markChunkAndNeighborsDirty(coordinate);
    return chunk;
  }

  public unloadChunk(coordinate: ChunkCoordinate): VoxelChunk | null {
    const key = chunkKey(coordinate);
    const chunk = this.#chunks.get(key);
    if (chunk === undefined || chunk.revision > 0) return null;
    this.#chunks.delete(key);
    this.#markChunkAndNeighborsDirty(coordinate);
    return chunk;
  }

  public hasChunk(coordinate: ChunkCoordinate): boolean { return this.#chunks.has(chunkKey(coordinate)); }
  public getChunk(coordinate: ChunkCoordinate): VoxelChunk | undefined { return this.#chunks.get(chunkKey(coordinate)); }

  public getVoxel(position: WorldVoxelCoordinate): VoxelId {
    const address = worldToChunkAddress(position);
    return this.#chunks.get(chunkKey(address.chunk))?.get(address.local) ?? VoxelId.Air;
  }

  public setVoxel(position: WorldVoxelCoordinate, voxel: VoxelId): VoxelMutation | null {
    const address = worldToChunkAddress(position);
    const chunk = this.ensureChunk(address.chunk);
    const before = chunk.get(address.local);
    if (!chunk.set(address.local, voxel)) return null;
    const dirtyChunks = this.#dirtyChunkKeys(address.chunk, address.local);
    for (const key of dirtyChunks) this.#dirtyChunks.add(key);
    return { position, before, after: voxel, dirtyChunks };
  }

  public drainDirtyChunks(limit: number): readonly string[] {
    if (!Number.isSafeInteger(limit) || limit < 1) throw new RangeError('Dirty chunk limit must be positive.');
    const drained: string[] = [];
    for (const key of this.#dirtyChunks) {
      drained.push(key);
      this.#dirtyChunks.delete(key);
      if (drained.length >= limit) break;
    }
    return drained;
  }

  #markChunkAndNeighborsDirty(coordinate: ChunkCoordinate): void {
    this.#dirtyChunks.add(chunkKey(coordinate));
    this.#dirtyChunks.add(chunkKey({ ...coordinate, x: coordinate.x - 1 }));
    this.#dirtyChunks.add(chunkKey({ ...coordinate, x: coordinate.x + 1 }));
    this.#dirtyChunks.add(chunkKey({ ...coordinate, y: coordinate.y - 1 }));
    this.#dirtyChunks.add(chunkKey({ ...coordinate, y: coordinate.y + 1 }));
    this.#dirtyChunks.add(chunkKey({ ...coordinate, z: coordinate.z - 1 }));
    this.#dirtyChunks.add(chunkKey({ ...coordinate, z: coordinate.z + 1 }));
  }

  #dirtyChunkKeys(chunk: ChunkCoordinate, local: LocalVoxelCoordinate): readonly string[] {
    const dirty = new Set([chunkKey(chunk)]);
    if (local.x === 0) dirty.add(chunkKey({ ...chunk, x: chunk.x - 1 }));
    if (local.x === CHUNK_EDGE - 1) dirty.add(chunkKey({ ...chunk, x: chunk.x + 1 }));
    if (local.y === 0) dirty.add(chunkKey({ ...chunk, y: chunk.y - 1 }));
    if (local.y === CHUNK_EDGE - 1) dirty.add(chunkKey({ ...chunk, y: chunk.y + 1 }));
    if (local.z === 0) dirty.add(chunkKey({ ...chunk, z: chunk.z - 1 }));
    if (local.z === CHUNK_EDGE - 1) dirty.add(chunkKey({ ...chunk, z: chunk.z + 1 }));
    return [...dirty];
  }
}
