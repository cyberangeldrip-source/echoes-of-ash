import { VoxelId } from '../voxel/VoxelTypes';
import type { VoxelWorld } from '../voxel/VoxelWorld';
import { sweptAabb } from './SweptAabb';
import type { Aabb, Vec3 } from './SweptAabb';
import type { CollisionResolver } from '../../gameplay/player/PlayerMovementSystem';

const PLAYER_HALF_WIDTH = 0.32;
const PLAYER_HEIGHT = 1.8;
const COLLISION_EPSILON = 0.0001;
const MAX_COLLISION_ITERATIONS = 4;

export class VoxelCollisionResolver implements CollisionResolver {
  readonly #world: VoxelWorld;
  public constructor(world: VoxelWorld) { this.#world = world; }

  public move(position: Readonly<Vec3>, displacement: Readonly<Vec3>): { readonly position: Vec3; readonly grounded: boolean } {
    let current = { ...position };
    let remaining = { ...displacement };
    let grounded = false;
    for (let iteration = 0; iteration < MAX_COLLISION_ITERATIONS; iteration += 1) {
      const body = this.#playerAabb(current);
      const broadphase = this.#broadphase(body, remaining);
      let nearest: ReturnType<typeof sweptAabb> = null;
      for (let y = Math.floor(broadphase.minimum.y); y <= Math.floor(broadphase.maximum.y); y += 1) for (let z = Math.floor(broadphase.minimum.z); z <= Math.floor(broadphase.maximum.z); z += 1) for (let x = Math.floor(broadphase.minimum.x); x <= Math.floor(broadphase.maximum.x); x += 1) {
        const voxel = this.#world.getVoxel({ x, y, z });
        if (voxel === VoxelId.Air || voxel === VoxelId.Water) continue;
        const hit = sweptAabb(body, remaining, { minimum: { x, y, z }, maximum: { x: x + 1, y: y + 1, z: z + 1 } });
        if (hit !== null && (nearest === null || hit.time < nearest.time)) nearest = hit;
      }
      if (nearest === null) { current = add(current, remaining); break; }
      const travel = Math.max(0, nearest.time - COLLISION_EPSILON);
      current = add(current, multiply(remaining, travel));
      grounded ||= nearest.normal.y > 0;
      const leftover = multiply(remaining, 1 - nearest.time);
      const projection = leftover.x * nearest.normal.x + leftover.y * nearest.normal.y + leftover.z * nearest.normal.z;
      remaining = { x: leftover.x - nearest.normal.x * projection, y: leftover.y - nearest.normal.y * projection, z: leftover.z - nearest.normal.z * projection };
      if (Math.hypot(remaining.x, remaining.y, remaining.z) < COLLISION_EPSILON) break;
    }
    return { position: current, grounded };
  }

  #playerAabb(position: Readonly<Vec3>): Aabb { return { minimum: { x: position.x - PLAYER_HALF_WIDTH, y: position.y, z: position.z - PLAYER_HALF_WIDTH }, maximum: { x: position.x + PLAYER_HALF_WIDTH, y: position.y + PLAYER_HEIGHT, z: position.z + PLAYER_HALF_WIDTH } }; }
  #broadphase(aabb: Aabb, movement: Vec3): Aabb { return { minimum: { x: Math.min(aabb.minimum.x, aabb.minimum.x + movement.x), y: Math.min(aabb.minimum.y, aabb.minimum.y + movement.y), z: Math.min(aabb.minimum.z, aabb.minimum.z + movement.z) }, maximum: { x: Math.max(aabb.maximum.x, aabb.maximum.x + movement.x), y: Math.max(aabb.maximum.y, aabb.maximum.y + movement.y), z: Math.max(aabb.maximum.z, aabb.maximum.z + movement.z) } }; }
}
function add(left: Readonly<Vec3>, right: Readonly<Vec3>): Vec3 { return { x: left.x + right.x, y: left.y + right.y, z: left.z + right.z }; }
function multiply(value: Readonly<Vec3>, scalar: number): Vec3 { return { x: value.x * scalar, y: value.y * scalar, z: value.z * scalar }; }
