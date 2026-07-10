import { CHUNK_EDGE } from '../../engine/voxel/VoxelTypes';
import type { ChunkCoordinate } from '../../engine/voxel/VoxelTypes';
import { chunkKey } from '../../engine/voxel/coordinates';

export interface StreamingFocus {
  readonly position: Readonly<{ x: number; y: number; z: number }>;
  readonly velocity: Readonly<{ x: number; y: number; z: number }>;
}

export interface StreamingTarget {
  readonly coordinate: ChunkCoordinate;
  readonly priority: number;
  readonly render: boolean;
}

export interface StreamingPolicyConfig {
  readonly renderRadius: number;
  readonly prefetchMargin: number;
  readonly verticalRadius: number;
  readonly velocityLookaheadSeconds: number;
}

export class ChunkStreamingPolicy {
  readonly #config: StreamingPolicyConfig;

  public constructor(config: StreamingPolicyConfig) {
    if (config.prefetchMargin < 1) throw new RangeError('Prefetch margin must exceed render radius.');
    this.#config = config;
  }

  public targets(focus: StreamingFocus): readonly StreamingTarget[] {
    const current = this.#chunkAt(focus.position);
    const predicted = this.#chunkAt({
      x: focus.position.x + focus.velocity.x * this.#config.velocityLookaheadSeconds,
      y: focus.position.y + focus.velocity.y * this.#config.velocityLookaheadSeconds,
      z: focus.position.z + focus.velocity.z * this.#config.velocityLookaheadSeconds,
    });
    const prefetchRadius = this.#config.renderRadius + this.#config.prefetchMargin;
    const unique = new Map<string, StreamingTarget>();
    this.#appendSphere(unique, current, current, prefetchRadius);
    this.#appendSphere(unique, predicted, current, prefetchRadius);
    return [...unique.values()].sort((left, right) => left.priority - right.priority || chunkKey(left.coordinate).localeCompare(chunkKey(right.coordinate)));
  }

  #appendSphere(targets: Map<string, StreamingTarget>, center: ChunkCoordinate, current: ChunkCoordinate, radius: number): void {
    for (let y = -this.#config.verticalRadius; y <= this.#config.verticalRadius; y += 1) {
      for (let z = -radius; z <= radius; z += 1) {
        for (let x = -radius; x <= radius; x += 1) {
          const horizontalDistance = Math.hypot(x, z);
          if (horizontalDistance > radius) continue;
          const coordinate = { x: center.x + x, y: center.y + y, z: center.z + z };
          const distanceFromPlayer = Math.hypot(coordinate.x - current.x, coordinate.y - current.y, coordinate.z - current.z);
          const target = { coordinate, priority: distanceFromPlayer, render: distanceFromPlayer <= this.#config.renderRadius };
          const key = chunkKey(coordinate);
          const existing = targets.get(key);
          if (existing === undefined || target.priority < existing.priority || (!existing.render && target.render)) targets.set(key, target);
        }
      }
    }
  }

  #chunkAt(position: Readonly<{ x: number; y: number; z: number }>): ChunkCoordinate {
    return { x: Math.floor(position.x / CHUNK_EDGE), y: Math.floor(position.y / CHUNK_EDGE), z: Math.floor(position.z / CHUNK_EDGE) };
  }
}
