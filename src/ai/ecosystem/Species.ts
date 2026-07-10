export type SpeciesId = 'ashback-elk' | 'marshlight-eel' | 'reefstalker' | 'cindermite-swarm';
export type ActivityCycle = 'diurnal' | 'nocturnal' | 'crepuscular';

export interface SpeciesDefinition {
  readonly id: SpeciesId;
  readonly activity: ActivityCycle;
  readonly minimumPopulation: number;
  readonly softPopulationCap: number;
  readonly reproductionRate: number;
  readonly hungerRate: number;
  readonly fearRecoveryRate: number;
}

export const SPECIES: Readonly<Record<SpeciesId, SpeciesDefinition>> = {
  'ashback-elk': { id: 'ashback-elk', activity: 'crepuscular', minimumPopulation: 4, softPopulationCap: 28, reproductionRate: 0.012, hungerRate: 0.018, fearRecoveryRate: 0.04 },
  'marshlight-eel': { id: 'marshlight-eel', activity: 'nocturnal', minimumPopulation: 3, softPopulationCap: 18, reproductionRate: 0.009, hungerRate: 0.025, fearRecoveryRate: 0.025 },
  reefstalker: { id: 'reefstalker', activity: 'crepuscular', minimumPopulation: 2, softPopulationCap: 12, reproductionRate: 0.006, hungerRate: 0.021, fearRecoveryRate: 0.018 },
  'cindermite-swarm': { id: 'cindermite-swarm', activity: 'diurnal', minimumPopulation: 5, softPopulationCap: 36, reproductionRate: 0.018, hungerRate: 0.03, fearRecoveryRate: 0.008 },
};
