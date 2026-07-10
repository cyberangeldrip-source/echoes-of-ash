import { CHUNK_EDGE, VoxelId } from '../voxel/VoxelTypes';
import type { VoxelSampler } from './MeshTypes';

export type NeighborDirection = 'negativeX' | 'positiveX' | 'negativeY' | 'positiveY' | 'negativeZ' | 'positiveZ';

export interface ChunkVoxelNeighborhood {
  readonly center: Uint16Array;
  readonly neighbors: Readonly<Partial<Record<NeighborDirection, Uint16Array>>>;
}

export class ChunkSampler implements VoxelSampler {
  readonly #data: ChunkVoxelNeighborhood;

  public constructor(data: ChunkVoxelNeighborhood) {
    this.#data = data;
  }

  public sample(x: number, y: number, z: number): number {
    if (x >= 0 && x < CHUNK_EDGE && y >= 0 && y < CHUNK_EDGE && z >= 0 && z < CHUNK_EDGE) return this.#read(this.#data.center, x, y, z);
    if (x === -1) return this.#readNeighbor('negativeX', CHUNK_EDGE - 1, y, z);
    if (x === CHUNK_EDGE) return this.#readNeighbor('positiveX', 0, y, z);
    if (y === -1) return this.#readNeighbor('negativeY', x, CHUNK_EDGE - 1, z);
    if (y === CHUNK_EDGE) return this.#readNeighbor('positiveY', x, 0, z);
    if (z === -1) return this.#readNeighbor('negativeZ', x, y, CHUNK_EDGE - 1);
    if (z === CHUNK_EDGE) return this.#readNeighbor('positiveZ', x, y, 0);
    return VoxelId.Air;
  }

  #readNeighbor(direction: NeighborDirection, x: number, y: number, z: number): number {
    const neighbor = this.#data.neighbors[direction];
    return neighbor === undefined ? VoxelId.Air : this.#read(neighbor, x, y, z);
  }

  #read(voxels: Uint16Array, x: number, y: number, z: number): number {
    return voxels[x + CHUNK_EDGE * (z + CHUNK_EDGE * y)] ?? VoxelId.Air;
  }
}
