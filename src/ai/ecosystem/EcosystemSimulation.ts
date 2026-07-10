import { SPECIES } from './Species';
import type { SpeciesId } from './Species';
import type { EcosystemSnapshot, PopulationState, RegionId, RegionState } from './EcosystemState';

const MEMORY_DECAY = 0.0008;
const FOOD_REGENERATION = 0.004;
const MAX_FOOD = 1;

export class EcosystemSimulation {
  readonly #regions = new Map<RegionId, RegionState>();
  #tick = 0;

  public addRegion(region: RegionState): void {
    if (this.#regions.has(region.id)) throw new Error(`Region ${region.id} already exists.`);
    this.#regions.set(region.id, region);
  }

  public recordPlayerHostility(regionId: RegionId, species: SpeciesId, severity: number): void {
    const population = this.#requirePopulation(regionId, species);
    population.rememberedHostility = Math.min(1, population.rememberedHostility + Math.max(0, severity));
    population.fear = Math.min(1, population.fear + severity * 0.7);
  }

  public tick(seconds: number): void {
    if (seconds <= 0) return;
    const migrations: Array<{ from: RegionId; to: RegionId; species: SpeciesId; count: number }> = [];
    for (const region of this.#regions.values()) {
      region.foodAvailability = Math.min(MAX_FOOD, region.foodAvailability + FOOD_REGENERATION * seconds);
      for (const population of region.populations.values()) {
        this.#simulatePopulation(region, population, seconds);
        const migration = this.#planMigration(region, population, seconds);
        if (migration !== null) migrations.push(migration);
      }
    }
    for (const migration of migrations) this.#applyMigration(migration);
    this.#tick += 1;
  }

  public snapshot(): EcosystemSnapshot {
    return {
      tick: this.#tick,
      regions: [...this.#regions.values()].map(region => ({
        id: region.id,
        populations: [...region.populations.values()].map(population => ({ ...population })),
      })),
    };
  }

  #simulatePopulation(region: RegionState, population: PopulationState, seconds: number): void {
    const species = SPECIES[population.species];
    population.hunger = Math.min(1, population.hunger + species.hungerRate * seconds * (1.1 - region.foodAvailability));
    const consumed = Math.min(region.foodAvailability, population.population * 0.00012 * seconds);
    region.foodAvailability -= consumed;
    population.hunger = Math.max(0, population.hunger - consumed * 4);
    population.fear = Math.max(0, population.fear - species.fearRecoveryRate * seconds);
    population.rememberedHostility = Math.max(0, population.rememberedHostility - MEMORY_DECAY * seconds);
    population.territoryPressure = population.population / species.softPopulationCap;
    const health = Math.max(0, 1 - population.hunger) * Math.max(0.2, region.foodAvailability);
    const crowding = Math.max(0, 1 - population.territoryPressure);
    const births = population.population * species.reproductionRate * health * crowding * seconds;
    const deaths = population.population * Math.max(0, population.hunger - 0.75) * 0.02 * seconds;
    population.population = Math.max(species.minimumPopulation, Math.min(species.softPopulationCap * 1.35, population.population + births - deaths));
  }

  #planMigration(region: RegionState, population: PopulationState, seconds: number): { from: RegionId; to: RegionId; species: SpeciesId; count: number } | null {
    if (region.neighbors.length === 0) return null;
    const ashPressure = population.species === 'ashback-elk' ? region.ashDensity : 0;
    const stormSafety = population.species === 'reefstalker' ? region.stormIntensity : 0;
    const pressure = Math.max(population.hunger, population.territoryPressure - 0.8, ashPressure, stormSafety, population.rememberedHostility);
    if (pressure < 0.55) return null;
    const destination = region.neighbors
      .map(id => this.#regions.get(id))
      .filter((candidate): candidate is RegionState => candidate !== undefined)
      .sort((left, right) => this.#migrationScore(left, population.species) - this.#migrationScore(right, population.species))[0];
    if (destination === undefined) return null;
    population.migrationRemainder += population.population * 0.015 * pressure * seconds;
    const count = Math.floor(population.migrationRemainder);
    if (count < 1) return null;
    population.migrationRemainder -= count;
    const floor = SPECIES[population.species].minimumPopulation;
    return { from: region.id, to: destination.id, species: population.species, count: Math.min(count, Math.max(0, Math.floor(population.population - floor))) };
  }

  #migrationScore(region: RegionState, species: SpeciesId): number {
    const population = region.populations.get(species)?.population ?? 0;
    return population / SPECIES[species].softPopulationCap + (1 - region.foodAvailability) + region.ashDensity + region.stormIntensity;
  }

  #applyMigration(migration: { from: RegionId; to: RegionId; species: SpeciesId; count: number }): void {
    if (migration.count === 0) return;
    const source = this.#requirePopulation(migration.from, migration.species);
    const destinationRegion = this.#regions.get(migration.to);
    if (destinationRegion === undefined) return;
    const destination = destinationRegion.populations.get(migration.species);
    source.population -= migration.count;
    if (destination === undefined) {
      destinationRegion.populations.set(migration.species, { species: migration.species, population: migration.count, hunger: source.hunger, fear: source.fear * 0.5, territoryPressure: 0, rememberedHostility: source.rememberedHostility * 0.5, migrationRemainder: 0 });
    } else {
      destination.population = Math.min(SPECIES[migration.species].softPopulationCap * 1.35, destination.population + migration.count);
    }
  }

  #requirePopulation(regionId: RegionId, species: SpeciesId): PopulationState {
    const population = this.#regions.get(regionId)?.populations.get(species);
    if (population === undefined) throw new Error(`Population ${species} is absent from ${regionId}.`);
    return population;
  }
}
