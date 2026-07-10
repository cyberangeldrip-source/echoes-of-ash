export const enum BiomeId {
  AshenHighlands,
  BioluminescentMarsh,
  DrownedTerraces,
  ObsidianReef,
  WhisperingPineReaches,
  CinderBarrens,
  SkyrootCanopy,
  SaltFlats,
}

export interface ClimateSample {
  readonly temperature: number;
  readonly moisture: number;
  readonly elevation: number;
  readonly oceanProximity: number;
}

export function classifyBiome(climate: ClimateSample): BiomeId {
  if (climate.elevation < 0.08) return BiomeId.ObsidianReef;
  if (climate.elevation < 0.16 && climate.oceanProximity > 0.6) return BiomeId.DrownedTerraces;
  if (climate.moisture > 0.68 && climate.elevation < 0.42) return BiomeId.BioluminescentMarsh;
  if (climate.elevation > 0.73) return BiomeId.AshenHighlands;
  if (climate.temperature > 0.7 && climate.moisture < 0.34) return BiomeId.CinderBarrens;
  if (climate.moisture > 0.7) return BiomeId.SkyrootCanopy;
  if (climate.moisture > 0.43) return BiomeId.WhisperingPineReaches;
  return BiomeId.SaltFlats;
}
