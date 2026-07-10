import { describe, expect, it } from 'vitest';
import { VoxelId } from '../voxel/VoxelTypes';
import { voxelRaycast } from './VoxelRaycast';

describe('voxelRaycast', () => {
  it('returns an exact target and adjacent placement cell', () => {
    const world = { getVoxel: ({ x, y, z }: { x: number; y: number; z: number }) => x === 3 && y === 1 && z === 0 ? VoxelId.Basalt : VoxelId.Air };
    const hit = voxelRaycast(world, { x: 0.5, y: 1.5, z: 0.5 }, { x: 1, y: 0, z: 0 }, 5);
    expect(hit?.voxel).toEqual({ x: 3, y: 1, z: 0 });
    expect(hit?.adjacent).toEqual({ x: 2, y: 1, z: 0 });
    expect(hit?.normal).toEqual({ x: -1, y: 0, z: 0 });
  });
});
