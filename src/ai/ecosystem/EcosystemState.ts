import type { SpeciesId } from './Species';

export type RegionId = string & { readonly __regionId: unique symbol };
export function regionId(value: string): RegionId { if (value.length === 0) throw new Error('Region id cannot be empty.'); return value as RegionId; }

export interface PopulationState {
  readonly species: SpeciesId;
  population: number;
  hunger: number;
  fear: number;
  territoryPressure: number;
  rememberedHostility: number;
  migrationRemainder: number;
}

export interface RegionState {
  readonly id: RegionId;
  readonly biome: string;
  readonly neighbors: readonly RegionId[];
  readonly populations: Map<SpeciesId, PopulationState>;
  foodAvailability: number;
  ashDensity: number;
  stormIntensity: number;
}

export interface EcosystemSnapshot {
  readonly tick: number;
  readonly regions: readonly {
    readonly id: RegionId;
    readonly populations: readonly Readonly<PopulationState>[];
  }[];
}
