export const CHUNK_EDGE = 32;
export const CHUNK_VOLUME = CHUNK_EDGE * CHUNK_EDGE * CHUNK_EDGE;
export const VOXEL_FORMAT_VERSION = 1;

export const enum VoxelId {
  Air = 0,
  Basalt = 1,
  Ash = 2,
  Water = 3,
  Obsidian = 4,
}

export interface ChunkCoordinate {
  readonly x: number;
  readonly y: number;
  readonly z: number;
}

export interface WorldVoxelCoordinate {
  readonly x: number;
  readonly y: number;
  readonly z: number;
}

export interface LocalVoxelCoordinate {
  readonly x: number;
  readonly y: number;
  readonly z: number;
}

export interface ChunkAddress {
  readonly chunk: ChunkCoordinate;
  readonly local: LocalVoxelCoordinate;
}
