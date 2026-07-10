import { describe, expect, it } from 'vitest';
import { BiomeId, classifyBiome } from './Biome';

describe('classifyBiome', () => {
  it('assigns all named climate extremes deterministically', () => {
    expect(classifyBiome({ elevation: 0.8, moisture: 0.3, temperature: 0.4, oceanProximity: 0 })).toBe(BiomeId.AshenHighlands);
    expect(classifyBiome({ elevation: 0.3, moisture: 0.8, temperature: 0.6, oceanProximity: 0 })).toBe(BiomeId.BioluminescentMarsh);
    expect(classifyBiome({ elevation: 0.12, moisture: 0.4, temperature: 0.5, oceanProximity: 0.9 })).toBe(BiomeId.DrownedTerraces);
    expect(classifyBiome({ elevation: 0.03, moisture: 0.2, temperature: 0.7, oceanProximity: 1 })).toBe(BiomeId.ObsidianReef);
  });
});
