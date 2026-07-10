import { describe, expect, it } from 'vitest';
import { BiomeId } from '../generation/Biome';
import { biomeHazards } from './BiomeHazards';

const ashfall = { kind: 'ashfall' as const, intensity: 1, wind: [0, 0] as const, remainingSeconds: 10 };
describe('biomeHazards', () => {
  it('keeps weather visibility above a fair minimum', () => { expect(biomeHazards({ biome: BiomeId.AshenHighlands, weather: ashfall, normalizedDay: 0.5, swimming: false, protection: new Set() })[0]?.visibilityMultiplier).toBeGreaterThanOrEqual(0.32); });
  it('lets preparation neutralize damage without deleting the biome effect', () => { const effect = biomeHazards({ biome: BiomeId.AshenHighlands, weather: ashfall, normalizedDay: 0.5, swimming: false, protection: new Set(['ash-mask']) })[0]; expect(effect?.vitalityPerSecond).toBe(0); expect(effect?.visibilityMultiplier).toBeLessThan(1); });
});
