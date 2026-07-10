import { describe, expect, it } from 'vitest';
import { ProjectileSimulation } from './ProjectileSimulation';

describe('ProjectileSimulation', () => {
  it('applies clearly reduced underwater range', () => {
    const simulation = new ProjectileSimulation();
    const air = { position: { x: 0, y: 2, z: 0 }, velocity: { x: 10, y: 0, z: 0 }, radius: 0.1, ageSeconds: 0, maximumAgeSeconds: 5, active: true };
    const water = { position: { x: 0, y: -2, z: 0 }, velocity: { x: 10, y: 0, z: 0 }, radius: 0.1, ageSeconds: 0, maximumAgeSeconds: 5, active: true };
    const environment = { gravity: 9.8, waterSurface: 0, waterDrag: 3, sweep: () => null };
    simulation.step(air, environment, 0.5);
    simulation.step(water, environment, 0.5);
    expect(water.position.x).toBeLessThan(air.position.x * 0.3);
  });
});
