import { VoxelId } from '../voxel/VoxelTypes';
import type { WorldVoxelCoordinate } from '../voxel/VoxelTypes';

export interface RaycastWorld { getVoxel(position: WorldVoxelCoordinate): VoxelId; }
export interface RaycastHit { readonly voxel: WorldVoxelCoordinate; readonly adjacent: WorldVoxelCoordinate; readonly normal: Readonly<{ x: number; y: number; z: number }>; readonly distance: number; readonly material: VoxelId; }

export function voxelRaycast(world: RaycastWorld, origin: Readonly<{ x: number; y: number; z: number }>, direction: Readonly<{ x: number; y: number; z: number }>, maximumDistance: number): RaycastHit | null {
  const length = Math.hypot(direction.x, direction.y, direction.z);
  if (length === 0 || maximumDistance <= 0) return null;
  const ray = { x: direction.x / length, y: direction.y / length, z: direction.z / length };
  const cell = { x: Math.floor(origin.x), y: Math.floor(origin.y), z: Math.floor(origin.z) };
  const step = { x: Math.sign(ray.x), y: Math.sign(ray.y), z: Math.sign(ray.z) };
  const delta = { x: ray.x === 0 ? Infinity : Math.abs(1 / ray.x), y: ray.y === 0 ? Infinity : Math.abs(1 / ray.y), z: ray.z === 0 ? Infinity : Math.abs(1 / ray.z) };
  const side = {
    x: ray.x === 0 ? Infinity : ((step.x > 0 ? cell.x + 1 - origin.x : origin.x - cell.x) * delta.x),
    y: ray.y === 0 ? Infinity : ((step.y > 0 ? cell.y + 1 - origin.y : origin.y - cell.y) * delta.y),
    z: ray.z === 0 ? Infinity : ((step.z > 0 ? cell.z + 1 - origin.z : origin.z - cell.z) * delta.z),
  };
  let distance = 0;
  let previous = { ...cell };
  let normal = { x: 0, y: 0, z: 0 };
  while (distance <= maximumDistance) {
    const material = world.getVoxel(cell);
    if (material !== VoxelId.Air && material !== VoxelId.Water) return { voxel: { ...cell }, adjacent: previous, normal, distance, material };
    previous = { ...cell };
    if (side.x <= side.y && side.x <= side.z) { distance = side.x; side.x += delta.x; cell.x += step.x; normal = { x: -step.x, y: 0, z: 0 }; }
    else if (side.y <= side.z) { distance = side.y; side.y += delta.y; cell.y += step.y; normal = { x: 0, y: -step.y, z: 0 }; }
    else { distance = side.z; side.z += delta.z; cell.z += step.z; normal = { x: 0, y: 0, z: -step.z }; }
  }
  return null;
}
