import { BiomeId } from '../generation/Biome';
import type { WeatherState } from './WeatherSimulation';

export interface HazardContext { readonly biome: BiomeId; readonly weather: WeatherState; readonly normalizedDay: number; readonly swimming: boolean; readonly protection: ReadonlySet<string>; }
export interface HazardEffect { readonly id: string; readonly vitalityPerSecond: number; readonly staminaMultiplier: number; readonly visibilityMultiplier: number; }

export function biomeHazards(context: HazardContext): readonly HazardEffect[] {
  const effects: HazardEffect[] = [];
  if (context.biome === BiomeId.AshenHighlands && context.weather.kind === 'ashfall') effects.push({ id: 'ash-storm', vitalityPerSecond: context.protection.has('ash-mask') ? 0 : 0.25 * context.weather.intensity, staminaMultiplier: 0.88, visibilityMultiplier: Math.max(0.32, 1 - context.weather.intensity * 0.68) });
  if (context.biome === BiomeId.BioluminescentMarsh && (context.normalizedDay < 0.22 || context.normalizedDay > 0.78)) effects.push({ id: 'toxic-gas', vitalityPerSecond: context.protection.has('spore-filter') ? 0 : 0.4, staminaMultiplier: 0.82, visibilityMultiplier: 0.78 });
  if (context.biome === BiomeId.ObsidianReef && context.swimming) effects.push({ id: 'glass-shoals', vitalityPerSecond: context.protection.has('reef-guard') ? 0 : 0.65, staminaMultiplier: 0.72, visibilityMultiplier: 1 });
  if (context.biome === BiomeId.CinderBarrens) effects.push({ id: 'heat-vents', vitalityPerSecond: context.protection.has('heat-weave') ? 0 : 0.18, staminaMultiplier: 0.86, visibilityMultiplier: 0.92 });
  if (context.biome === BiomeId.SaltFlats && context.normalizedDay > 0.4 && context.normalizedDay < 0.62) effects.push({ id: 'salt-glare', vitalityPerSecond: 0, staminaMultiplier: 1, visibilityMultiplier: context.protection.has('glare-lenses') ? 0.9 : 0.54 });
  return effects;
}
