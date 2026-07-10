import { CHUNK_VOLUME, VOXEL_FORMAT_VERSION, VoxelId } from './VoxelTypes';
import type { ChunkCoordinate, LocalVoxelCoordinate } from './VoxelTypes';
import { localIndex } from './coordinates';

export class VoxelChunk {
  public readonly formatVersion = VOXEL_FORMAT_VERSION;
  public readonly coordinate: ChunkCoordinate;
  readonly #voxels: Uint16Array;
  #revision = 0;

  public constructor(coordinate: ChunkCoordinate, voxels?: Uint16Array) {
    if (voxels !== undefined && voxels.length !== CHUNK_VOLUME) {
      throw new RangeError(`Chunk data must contain ${CHUNK_VOLUME} voxels.`);
    }
    this.coordinate = Object.freeze({ ...coordinate });
    this.#voxels = voxels?.slice() ?? new Uint16Array(CHUNK_VOLUME);
  }

  public get revision(): number { return this.#revision; }

  public get(position: LocalVoxelCoordinate): VoxelId {
    return this.#voxels[localIndex(position)] as VoxelId;
  }

  public set(position: LocalVoxelCoordinate, voxel: VoxelId): boolean {
    const index = localIndex(position);
    if (this.#voxels[index] === voxel) return false;
    this.#voxels[index] = voxel;
    this.#revision += 1;
    return true;
  }

  public snapshot(): Uint16Array { return this.#voxels.slice(); }
}
