export interface Vec3 { readonly x: number; readonly y: number; readonly z: number; }
export interface Aabb { readonly minimum: Vec3; readonly maximum: Vec3; }
export interface SweepHit { readonly time: number; readonly normal: Vec3; }

export function sweptAabb(moving: Aabb, displacement: Vec3, obstacle: Aabb): SweepHit | null {
  const x = axisTimes(moving.minimum.x, moving.maximum.x, displacement.x, obstacle.minimum.x, obstacle.maximum.x);
  const y = axisTimes(moving.minimum.y, moving.maximum.y, displacement.y, obstacle.minimum.y, obstacle.maximum.y);
  const z = axisTimes(moving.minimum.z, moving.maximum.z, displacement.z, obstacle.minimum.z, obstacle.maximum.z);
  const entry = Math.max(x.entry, y.entry, z.entry);
  const exit = Math.min(x.exit, y.exit, z.exit);
  if (entry > exit || entry < 0 || entry > 1) return null;
  if (x.entry >= y.entry && x.entry >= z.entry) return { time: entry, normal: { x: displacement.x > 0 ? -1 : 1, y: 0, z: 0 } };
  if (y.entry >= z.entry) return { time: entry, normal: { x: 0, y: displacement.y > 0 ? -1 : 1, z: 0 } };
  return { time: entry, normal: { x: 0, y: 0, z: displacement.z > 0 ? -1 : 1 } };
}

function axisTimes(movingMin: number, movingMax: number, velocity: number, obstacleMin: number, obstacleMax: number): { readonly entry: number; readonly exit: number } {
  if (velocity === 0) return movingMax <= obstacleMin || movingMin >= obstacleMax ? { entry: Infinity, exit: -Infinity } : { entry: -Infinity, exit: Infinity };
  const first = (obstacleMin - movingMax) / velocity;
  const second = (obstacleMax - movingMin) / velocity;
  return { entry: Math.min(first, second), exit: Math.max(first, second) };
}
