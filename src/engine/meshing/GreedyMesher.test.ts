import { describe, expect, it } from 'vitest';
import { CHUNK_EDGE, CHUNK_VOLUME, VoxelId } from '../voxel/VoxelTypes';
import { ChunkSampler } from './ChunkSampler';
import { GreedyMesher } from './GreedyMesher';

function filled(voxel: VoxelId): Uint16Array {
  const data = new Uint16Array(CHUNK_VOLUME);
  data.fill(voxel);
  return data;
}

describe('GreedyMesher', () => {
  it('merges a solid chunk into six quads', () => {
    const sampler = new ChunkSampler({ center: filled(VoxelId.Basalt), neighbors: {} });
    const mesh = new GreedyMesher().build(sampler);
    expect(mesh.quadCount).toBe(6);
    expect(mesh.indices).toHaveLength(36);
  });

  it('removes the shared face between loaded neighboring chunks', () => {
    const center = filled(VoxelId.Basalt);
    const neighbor = filled(VoxelId.Basalt);
    const openMesh = new GreedyMesher().build(new ChunkSampler({ center, neighbors: {} }));
    const joinedMesh = new GreedyMesher().build(new ChunkSampler({ center, neighbors: { positiveX: neighbor } }));
    expect(joinedMesh.quadCount).toBe(openMesh.quadCount - 1);
  });

  it('preserves material boundaries while merging', () => {
    const data = filled(VoxelId.Basalt);
    for (let z = 0; z < CHUNK_EDGE; z += 1) data[z * CHUNK_EDGE] = VoxelId.Obsidian;
    const mesh = new GreedyMesher().build(new ChunkSampler({ center: data, neighbors: {} }));
    expect(mesh.quadCount).toBeGreaterThan(6);
  });
});
