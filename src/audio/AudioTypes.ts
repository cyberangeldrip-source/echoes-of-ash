export type AudioBus = 'ambience' | 'creature' | 'weather' | 'player' | 'music' | 'ui';
export type AudioEnvironment = 'open-air' | 'cave' | 'ruin';

export interface ListenerState {
  readonly position: Readonly<{ x: number; y: number; z: number }>;
  readonly forward: Readonly<{ x: number; y: number; z: number }>;
}

export interface SpatialVoice {
  readonly id: string;
  readonly bus: AudioBus;
  readonly position: Readonly<{ x: number; y: number; z: number }>;
  readonly basePriority: number;
  readonly maximumDistance: number;
  readonly looping: boolean;
}

export interface ScoredVoice {
  readonly voice: SpatialVoice;
  readonly score: number;
  readonly gain: number;
}
