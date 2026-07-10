import type { AudioEnvironment } from './AudioTypes';

export interface ReverbProfile {
  readonly wet: number;
  readonly decaySeconds: number;
  readonly lowpassHz: number;
}

const PROFILES: Readonly<Record<AudioEnvironment, ReverbProfile>> = {
  'open-air': { wet: 0.06, decaySeconds: 0.45, lowpassHz: 18000 },
  cave: { wet: 0.58, decaySeconds: 3.2, lowpassHz: 7200 },
  ruin: { wet: 0.34, decaySeconds: 1.65, lowpassHz: 10500 },
};

export function reverbProfile(environment: AudioEnvironment): ReverbProfile { return PROFILES[environment]; }
