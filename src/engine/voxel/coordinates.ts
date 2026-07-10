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

export function localPosition(index: number): LocalVoxelCoordinate {
  if (!Number.isSafeInteger(index) || index < 0 || index >= CHUNK_EDGE ** 3) throw new RangeError('Local voxel index is outside the chunk.');
  const y = Math.floor(index / (CHUNK_EDGE * CHUNK_EDGE));
  const remainder = index - y * CHUNK_EDGE * CHUNK_EDGE;
  const z = Math.floor(remainder / CHUNK_EDGE);
  return { x: remainder - z * CHUNK_EDGE, y, z };
}

export function adjacentChunkCoordinates(coordinate: ChunkCoordinate): readonly ChunkCoordinate[] {
  return [
    { x: coordinate.x - 1, y: coordinate.y, z: coordinate.z },
    { x: coordinate.x + 1, y: coordinate.y, z: coordinate.z },
    { x: coordinate.x, y: coordinate.y - 1, z: coordinate.z },
    { x: coordinate.x, y: coordinate.y + 1, z: coordinate.z },
    { x: coordinate.x, y: coordinate.y, z: coordinate.z - 1 },
    { x: coordinate.x, y: coordinate.y, z: coordinate.z + 1 },
  ];
}
