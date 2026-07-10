import type { ChunkCoordinate } from '../../engine/voxel/VoxelTypes';
import type { BiomeId } from './Biome';

export interface GeneratedChunk {
  readonly coordinate: ChunkCoordinate;
  readonly voxels: Uint16Array;
  readonly surfaceBiomes: Uint8Array;
  readonly checksum: number;
}

export interface GenerationRequest {
  readonly requestId: number;
  readonly seed: string;
  readonly coordinate: ChunkCoordinate;
}

export interface GenerationSuccess {
  readonly type: 'generated';
  readonly requestId: number;
  readonly coordinate: ChunkCoordinate;
  readonly voxels: ArrayBuffer;
  readonly surfaceBiomes: ArrayBuffer;
  readonly checksum: number;
}

export interface GenerationFailure {
  readonly type: 'generation-error';
  readonly requestId: number;
  readonly message: string;
}

export type GenerationResponse = GenerationSuccess | GenerationFailure;
export type SurfaceBiome = BiomeId;
