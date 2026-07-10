import { CHUNK_EDGE, CHUNK_VOLUME, VoxelId } from '../../engine/voxel/VoxelTypes';
import type { ChunkCoordinate } from '../../engine/voxel/VoxelTypes';
import { BiomeId, classifyBiome } from './Biome';
import type { ClimateSample } from './Biome';
import type { GeneratedChunk } from './GenerationTypes';
import { fractalNoise2D } from './Noise';
import { hashCoordinates, hashSeed } from './WorldSeed';

const SEA_LEVEL = 46;
const TERRAIN_SCALE = 0.0045;
const DETAIL_SCALE = 0.018;
const MAX_HEIGHT = 112;

export class ChunkGenerator {
  readonly #seed: number;

  public constructor(seed: string) {
    this.#seed = hashSeed(seed);
  }

  public generate(coordinate: ChunkCoordinate): GeneratedChunk {
    const voxels = new Uint16Array(CHUNK_VOLUME);
    const surfaceBiomes = new Uint8Array(CHUNK_EDGE * CHUNK_EDGE);
    for (let localZ = 0; localZ < CHUNK_EDGE; localZ += 1) {
      for (let localX = 0; localX < CHUNK_EDGE; localX += 1) {
        const worldX = coordinate.x * CHUNK_EDGE + localX;
        const worldZ = coordinate.z * CHUNK_EDGE + localZ;
        const surface = this.#sampleSurface(worldX, worldZ);
        surfaceBiomes[localX + localZ * CHUNK_EDGE] = surface.biome;
        this.#fillColumn(voxels, coordinate, localX, localZ, surface.height, surface.biome);
      }
    }
    return { coordinate, voxels, surfaceBiomes, checksum: this.#checksum(voxels, surfaceBiomes) };
  }

  #sampleSurface(x: number, z: number): { readonly height: number; readonly biome: BiomeId } {
    const continental = fractalNoise2D(this.#seed, x * TERRAIN_SCALE, z * TERRAIN_SCALE, 5);
    const detail = fractalNoise2D(this.#seed + 7001, x * DETAIL_SCALE, z * DETAIL_SCALE, 3);
    const islandDistance = Math.hypot(x, z) / 2600;
    const islandMask = Math.max(-1, 1 - islandDistance * islandDistance);
    const normalizedElevation = Math.max(0, Math.min(1, (continental * 0.43 + detail * 0.08 + islandMask * 0.49 + 1) * 0.5));
    const height = Math.floor(normalizedElevation * MAX_HEIGHT);
    const climate = this.#sampleClimate(x, z, normalizedElevation, height);
    return { height, biome: classifyBiome(climate) };
  }

  #sampleClimate(x: number, z: number, elevation: number, height: number): ClimateSample {
    const latitude = Math.min(1, Math.abs(z) / 5000);
    const temperatureNoise = fractalNoise2D(this.#seed + 1709, x * 0.002, z * 0.002, 3);
    const moistureNoise = fractalNoise2D(this.#seed + 3011, x * 0.003, z * 0.003, 4);
    return {
      temperature: Math.max(0, Math.min(1, 0.82 - latitude * 0.45 - elevation * 0.28 + temperatureNoise * 0.18)),
      moisture: Math.max(0, Math.min(1, 0.5 + moistureNoise * 0.42)),
      elevation,
      oceanProximity: Math.max(0, 1 - Math.abs(height - SEA_LEVEL) / 24),
    };
  }

  #fillColumn(voxels: Uint16Array, coordinate: ChunkCoordinate, x: number, z: number, height: number, biome: BiomeId): void {
    for (let y = 0; y < CHUNK_EDGE; y += 1) {
      const worldY = coordinate.y * CHUNK_EDGE + y;
      const index = x + CHUNK_EDGE * (z + CHUNK_EDGE * y);
      if (worldY > height) {
        voxels[index] = worldY <= SEA_LEVEL ? VoxelId.Water : VoxelId.Air;
      } else if (worldY === height) {
        voxels[index] = this.#surfaceVoxel(biome);
      } else {
        voxels[index] = worldY < height - 5 ? VoxelId.Basalt : VoxelId.Ash;
      }
    }
  }

  #surfaceVoxel(biome: BiomeId): VoxelId {
    if (biome === BiomeId.ObsidianReef || biome === BiomeId.CinderBarrens) return VoxelId.Obsidian;
    if (biome === BiomeId.DrownedTerraces) return VoxelId.Basalt;
    return VoxelId.Ash;
  }

  #checksum(voxels: Uint16Array, biomes: Uint8Array): number {
    let hash = this.#seed;
    for (const voxel of voxels) hash = hashCoordinates(hash, voxel, hash >>> 8);
    for (const biome of biomes) hash = hashCoordinates(hash, biome, hash >>> 16);
    return hash >>> 0;
  }
}
