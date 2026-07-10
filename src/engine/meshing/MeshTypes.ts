export interface ChunkMesh {
  readonly positions: Float32Array;
  readonly normals: Int8Array;
  readonly materials: Uint16Array;
  readonly indices: Uint32Array;
  readonly quadCount: number;
}

export interface VoxelSampler {
  sample(x: number, y: number, z: number): number;
}
