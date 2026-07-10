import { CHUNK_EDGE } from './VoxelTypes';
import type { ChunkAddress, ChunkCoordinate, LocalVoxelCoordinate, WorldVoxelCoordinate } from './VoxelTypes';

export function floorDivide(value: number, divisor: number): number {
  return Math.floor(value / divisor);
}

export function positiveModulo(value: number, divisor: number): number {
  return ((value % divisor) + divisor) % divisor;
}

export function worldToChunkAddress(position: WorldVoxelCoordinate): ChunkAddress {
  return {
    chunk: {
      x: floorDivide(position.x, CHUNK_EDGE),
      y: floorDivide(position.y, CHUNK_EDGE),
      z: floorDivide(position.z, CHUNK_EDGE),
    },
    local: {
      x: positiveModulo(position.x, CHUNK_EDGE),
      y: positiveModulo(position.y, CHUNK_EDGE),
      z: positiveModulo(position.z, CHUNK_EDGE),
    },
  };
}

export function chunkKey(coordinate: ChunkCoordinate): string {
  return `${coordinate.x},${coordinate.y},${coordinate.z}`;
}

export function localIndex(position: LocalVoxelCoordinate): number {
  return position.x + CHUNK_EDGE * (position.z + CHUNK_EDGE * position.y);
}
