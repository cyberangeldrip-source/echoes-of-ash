import { CHUNK_EDGE, VoxelId } from '../voxel/VoxelTypes';
import type { ChunkMesh, VoxelSampler } from './MeshTypes';

interface MaskCell {
  readonly material: number;
  readonly direction: 1 | -1;
}

const AXES = [0, 1, 2] as const;
type Axis = (typeof AXES)[number];

type MutableVector = [number, number, number];

export class GreedyMesher {
  public build(sampler: VoxelSampler): ChunkMesh {
    const positions: number[] = [];
    const normals: number[] = [];
    const materials: number[] = [];
    const indices: number[] = [];
    let quadCount = 0;

    for (const depthAxis of AXES) {
      const widthAxis = ((depthAxis + 1) % 3) as Axis;
      const heightAxis = ((depthAxis + 2) % 3) as Axis;
      const mask: Array<MaskCell | null> = new Array(CHUNK_EDGE * CHUNK_EDGE).fill(null);
      const coordinate: MutableVector = [0, 0, 0];

      for (let slice = -1; slice < CHUNK_EDGE; slice += 1) {
        this.#buildMask(sampler, mask, coordinate, depthAxis, widthAxis, heightAxis, slice);
        quadCount += this.#emitMask(mask, positions, normals, materials, indices, depthAxis, widthAxis, heightAxis, slice);
      }
    }

    return {
      positions: new Float32Array(positions),
      normals: new Int8Array(normals),
      materials: new Uint16Array(materials),
      indices: new Uint32Array(indices),
      quadCount,
    };
  }

  #buildMask(sampler: VoxelSampler, mask: Array<MaskCell | null>, coordinate: MutableVector, depthAxis: Axis, widthAxis: Axis, heightAxis: Axis, slice: number): void {
    coordinate[depthAxis] = slice;
    for (let height = 0; height < CHUNK_EDGE; height += 1) {
      coordinate[heightAxis] = height;
      for (let width = 0; width < CHUNK_EDGE; width += 1) {
        coordinate[widthAxis] = width;
        const current = sampler.sample(coordinate[0], coordinate[1], coordinate[2]);
        coordinate[depthAxis] = slice + 1;
        const next = sampler.sample(coordinate[0], coordinate[1], coordinate[2]);
        coordinate[depthAxis] = slice;
        const currentSolid = current !== VoxelId.Air && current !== VoxelId.Water;
        const nextSolid = next !== VoxelId.Air && next !== VoxelId.Water;
        const index = width + height * CHUNK_EDGE;
        if (currentSolid === nextSolid) mask[index] = null;
        else if (currentSolid) mask[index] = { material: current, direction: 1 };
        else mask[index] = { material: next, direction: -1 };
      }
    }
  }

  #emitMask(mask: Array<MaskCell | null>, positions: number[], normals: number[], materials: number[], indices: number[], depthAxis: Axis, widthAxis: Axis, heightAxis: Axis, slice: number): number {
    let emitted = 0;
    for (let height = 0; height < CHUNK_EDGE; height += 1) {
      for (let width = 0; width < CHUNK_EDGE;) {
        const cell = mask[width + height * CHUNK_EDGE];
        if (cell === null) { width += 1; continue; }
        let rectangleWidth = 1;
        while (width + rectangleWidth < CHUNK_EDGE && this.#same(mask[width + rectangleWidth + height * CHUNK_EDGE], cell)) rectangleWidth += 1;
        let rectangleHeight = 1;
        heightLoop: while (height + rectangleHeight < CHUNK_EDGE) {
          for (let offset = 0; offset < rectangleWidth; offset += 1) {
            if (!this.#same(mask[width + offset + (height + rectangleHeight) * CHUNK_EDGE], cell)) break heightLoop;
          }
          rectangleHeight += 1;
        }
        this.#emitQuad(positions, normals, materials, indices, depthAxis, widthAxis, heightAxis, slice + 1, width, height, rectangleWidth, rectangleHeight, cell);
        for (let dy = 0; dy < rectangleHeight; dy += 1) {
          for (let dx = 0; dx < rectangleWidth; dx += 1) mask[width + dx + (height + dy) * CHUNK_EDGE] = null;
        }
        emitted += 1;
        width += rectangleWidth;
      }
    }
    return emitted;
  }

  #same(candidate: MaskCell | null | undefined, expected: MaskCell): boolean {
    return candidate?.material === expected.material && candidate.direction === expected.direction;
  }

  #emitQuad(positions: number[], normals: number[], materials: number[], indices: number[], depthAxis: Axis, widthAxis: Axis, heightAxis: Axis, depth: number, width: number, height: number, rectangleWidth: number, rectangleHeight: number, cell: MaskCell): void {
    const origin: MutableVector = [0, 0, 0];
    const across: MutableVector = [0, 0, 0];
    const up: MutableVector = [0, 0, 0];
    origin[depthAxis] = depth;
    origin[widthAxis] = width;
    origin[heightAxis] = height;
    across[widthAxis] = rectangleWidth;
    up[heightAxis] = rectangleHeight;
    const corners = cell.direction === 1
      ? [origin, this.#add(origin, across), this.#add(this.#add(origin, across), up), this.#add(origin, up)]
      : [origin, this.#add(origin, up), this.#add(this.#add(origin, across), up), this.#add(origin, across)];
    const base = positions.length / 3;
    for (const corner of corners) {
      positions.push(...corner);
      const normal: MutableVector = [0, 0, 0];
      normal[depthAxis] = cell.direction;
      normals.push(...normal);
      materials.push(cell.material);
    }
    indices.push(base, base + 1, base + 2, base, base + 2, base + 3);
  }

  #add(left: MutableVector, right: MutableVector): MutableVector {
    return [left[0] + right[0], left[1] + right[1], left[2] + right[2]];
  }
}
