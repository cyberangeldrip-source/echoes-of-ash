import { CHUNK_EDGE, VoxelId } from './VoxelTypes';
import type { ChunkCoordinate, WorldVoxelCoordinate } from './VoxelTypes';
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

  public ensureChunk(coordinate: ChunkCoordinate): VoxelChunk {
    const key = chunkKey(coordinate);
    const existing = this.#chunks.get(key);
    if (existing !== undefined) return existing;
    const chunk = new VoxelChunk(coordinate);
    this.#chunks.set(key, chunk);
    return chunk;
  }

  public getVoxel(position: WorldVoxelCoordinate): VoxelId {
    const address = worldToChunkAddress(position);
    return this.#chunks.get(chunkKey(address.chunk))?.get(address.local) ?? VoxelId.Air;
  }

  public setVoxel(position: WorldVoxelCoordinate, voxel: VoxelId): VoxelMutation | null {
    const address = worldToChunkAddress(position);
    const chunk = this.ensureChunk(address.chunk);
    const before = chunk.get(address.local);
    if (!chunk.set(address.local, voxel)) return null;
    return { position, before, after: voxel, dirtyChunks: this.#dirtyChunkKeys(address.chunk, address.local) };
  }

  #dirtyChunkKeys(chunk: ChunkCoordinate, local: WorldVoxelCoordinate): readonly string[] {
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
