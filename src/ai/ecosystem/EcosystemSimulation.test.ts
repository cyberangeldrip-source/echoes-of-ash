import { describe, expect, it } from 'vitest';
import { EcosystemSimulation } from './EcosystemSimulation';
import { regionId } from './EcosystemState';

function population(species: 'ashback-elk' | 'cindermite-swarm', count: number) {
  return { species, population: count, hunger: 0.2, fear: 0, territoryPressure: 0, rememberedHostility: 0, migrationRemainder: 0 };
}

describe('EcosystemSimulation', () => {
  it('preserves a species population floor under starvation', () => {
    const simulation = new EcosystemSimulation();
    const id = regionId('highlands:0,0');
    simulation.addRegion({ id, biome: 'Ashen Highlands', neighbors: [], populations: new Map([['ashback-elk', population('ashback-elk', 4)]]), foodAvailability: 0, ashDensity: 0.9, stormIntensity: 0 });
    for (let index = 0; index < 100; index += 1) simulation.tick(60);
    expect(simulation.snapshot().regions[0]?.populations[0]?.population).toBeGreaterThanOrEqual(4);
  });

  it('persists hostility memory and migrates without overstacking', () => {
    const simulation = new EcosystemSimulation();
    const source = regionId('barrens:0,0');
    const target = regionId('barrens:1,0');
    simulation.addRegion({ id: source, biome: 'Cinder Barrens', neighbors: [target], populations: new Map([['cindermite-swarm', population('cindermite-swarm', 30)]]), foodAvailability: 0.2, ashDensity: 0, stormIntensity: 0 });
    simulation.addRegion({ id: target, biome: 'Cinder Barrens', neighbors: [source], populations: new Map([['cindermite-swarm', population('cindermite-swarm', 5)]]), foodAvailability: 1, ashDensity: 0, stormIntensity: 0 });
    simulation.recordPlayerHostility(source, 'cindermite-swarm', 1);
    simulation.tick(120);
    const regions = simulation.snapshot().regions;
    expect(regions[0]?.populations[0]?.rememberedHostility).toBeGreaterThan(0);
    expect(regions[1]?.populations[0]?.population).toBeGreaterThan(5);
    expect(regions[1]?.populations[0]?.population).toBeLessThanOrEqual(48.6);
  });
});
