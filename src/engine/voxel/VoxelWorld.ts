import { CHUNK_EDGE, CHUNK_VOLUME, VoxelId } from './VoxelTypes';
import type { ChunkCoordinate, LocalVoxelCoordinate, WorldVoxelCoordinate } from './VoxelTypes';
import { adjacentChunkCoordinates, chunkKey, localIndex, localPosition, worldToChunkAddress } from './coordinates';
import { VoxelChunk } from './VoxelChunk';

export interface VoxelMutation {
  readonly position: WorldVoxelCoordinate;
  readonly before: VoxelId;
  readonly after: VoxelId;
  readonly dirtyChunks: readonly string[];
}

export type ChunkLifecycleEvent =
  | { readonly type: 'loaded'; readonly coordinate: ChunkCoordinate; readonly revision: number }
  | { readonly type: 'unloaded'; readonly coordinate: ChunkCoordinate; readonly revision: number };

export interface ChunkDiffSnapshot {
  readonly chunkKey: string;
  readonly revision: number;
  readonly changes: readonly (readonly [localIndex: number, voxel: VoxelId])[];
}

type LifecycleListener = (event: ChunkLifecycleEvent) => void;

export class VoxelWorld {
  readonly #chunks = new Map<string, VoxelChunk>();
  readonly #diffs = new Map<string, Map<number, VoxelId>>();
  readonly #diffRevisions = new Map<string, number>();
  readonly #dirtyChunks = new Set<string>();
  readonly #listeners = new Set<LifecycleListener>();

  public get loadedChunkCount(): number { return this.#chunks.size; }

  public loadedCoordinates(): readonly ChunkCoordinate[] {
    return [...this.#chunks.values()].map(chunk => chunk.coordinate);
  }

  public hasChunk(coordinate: ChunkCoordinate): boolean {
    return this.#chunks.has(chunkKey(coordinate));
  }

  public installGeneratedChunk(coordinate: ChunkCoordinate, voxels: Uint16Array): boolean {
    if (voxels.length !== CHUNK_VOLUME) throw new RangeError(`Generated chunk must contain ${CHUNK_VOLUME} voxels.`);
    const key = chunkKey(coordinate);
    if (this.#chunks.has(key)) return false;
    const chunk = new VoxelChunk(coordinate, voxels);
    for (const [index, voxel] of this.#diffs.get(key) ?? []) chunk.set(localPosition(index), voxel);
    this.#chunks.set(key, chunk);
    this.#dirtyNeighborhood(coordinate);
    this.#emit({ type: 'loaded', coordinate: chunk.coordinate, revision: chunk.revision });
    return true;
  }

  public unloadChunk(coordinate: ChunkCoordinate): Uint16Array | null {
    const key = chunkKey(coordinate);
    const chunk = this.#chunks.get(key);
    if (chunk === undefined) return null;
    const snapshot = chunk.snapshot();
    this.#chunks.delete(key);
    this.#dirtyNeighborhood(coordinate);
    this.#emit({ type: 'unloaded', coordinate: chunk.coordinate, revision: chunk.revision });
    return snapshot;
  }

  public ensureChunk(coordinate: ChunkCoordinate): VoxelChunk {
    const key = chunkKey(coordinate);
    const existing = this.#chunks.get(key);
    if (existing !== undefined) return existing;
    this.installGeneratedChunk(coordinate, new Uint16Array(CHUNK_VOLUME));
    const created = this.#chunks.get(key);
    if (created === undefined) throw new Error(`Failed to install chunk ${key}.`);
    return created;
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
    const key = chunkKey(address.chunk);
    const changes = this.#diffs.get(key) ?? new Map<number, VoxelId>();
    changes.set(localIndex(address.local), voxel);
    this.#diffs.set(key, changes);
    this.#diffRevisions.set(key, (this.#diffRevisions.get(key) ?? 0) + 1);
    const dirtyChunks = this.#mutationDirtyKeys(address.chunk, address.local);
    for (const dirty of dirtyChunks) this.#dirtyChunks.add(dirty);
    return { position: { ...position }, before, after: voxel, dirtyChunks };
  }

  public consumeDirtyChunks(): readonly string[] {
    const dirty = [...this.#dirtyChunks].sort();
    this.#dirtyChunks.clear();
    return dirty;
  }

  public diffSnapshots(): readonly ChunkDiffSnapshot[] {
    return [...this.#diffs.entries()].map(([key, changes]) => ({
      chunkKey: key,
      revision: this.#diffRevisions.get(key) ?? 0,
      changes: [...changes.entries()].sort((left, right) => left[0] - right[0]),
    })).sort((left, right) => left.chunkKey.localeCompare(right.chunkKey));
  }

  public subscribe(listener: LifecycleListener): () => void {
    this.#listeners.add(listener);
    return () => this.#listeners.delete(listener);
  }

  #emit(event: ChunkLifecycleEvent): void {
    for (const listener of this.#listeners) listener(event);
  }

  #dirtyNeighborhood(coordinate: ChunkCoordinate): void {
    this.#dirtyChunks.add(chunkKey(coordinate));
    for (const adjacent of adjacentChunkCoordinates(coordinate)) this.#dirtyChunks.add(chunkKey(adjacent));
  }

  #mutationDirtyKeys(chunk: ChunkCoordinate, local: LocalVoxelCoordinate): readonly string[] {
    const dirty = new Set([chunkKey(chunk)]);
    if (local.x === 0) dirty.add(chunkKey({ ...chunk, x: chunk.x - 1 }));
    if (local.x === CHUNK_EDGE - 1) dirty.add(chunkKey({ ...chunk, x: chunk.x + 1 }));
    if (local.y === 0) dirty.add(chunkKey({ ...chunk, y: chunk.y - 1 }));
    if (local.y === CHUNK_EDGE - 1) dirty.add(chunkKey({ ...chunk, y: chunk.y + 1 }));
    if (local.z === 0) dirty.add(chunkKey({ ...chunk, z: chunk.z - 1 }));
    if (local.z === CHUNK_EDGE - 1) dirty.add(chunkKey({ ...chunk, z: chunk.z + 1 }));
    return [...dirty].sort();
  }
}
