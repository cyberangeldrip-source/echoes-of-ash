import { describe, expect, it } from 'vitest';
import { sweptAabb } from './SweptAabb';

describe('sweptAabb', () => {
  it('prevents fast movement from tunneling through a voxel', () => {
    const moving = { minimum: { x: 0, y: 0, z: 0 }, maximum: { x: 0.6, y: 1.8, z: 0.6 } };
    const obstacle = { minimum: { x: 4, y: 0, z: 0 }, maximum: { x: 5, y: 1, z: 1 } };
    const hit = sweptAabb(moving, { x: 10, y: 0, z: 0 }, obstacle);
    expect(hit?.time).toBeCloseTo(0.34);
    expect(hit?.normal).toEqual({ x: -1, y: 0, z: 0 });
  });
});
