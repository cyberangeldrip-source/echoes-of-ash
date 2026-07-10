import type { ListenerState, ScoredVoice, SpatialVoice } from './AudioTypes';

const BUS_PRIORITY = { ui: 1, player: 0.95, creature: 0.8, weather: 0.55, ambience: 0.45, music: 0.7 } as const;

export class VoiceAllocator {
  readonly #maximumVoices: number;

  public constructor(maximumVoices: number) {
    if (!Number.isSafeInteger(maximumVoices) || maximumVoices < 1) throw new RangeError('Voice limit must be positive.');
    this.#maximumVoices = maximumVoices;
  }

  public allocate(listener: ListenerState, voices: readonly SpatialVoice[]): readonly ScoredVoice[] {
    return voices.map(voice => this.#score(listener, voice))
      .filter((voice): voice is ScoredVoice => voice !== null)
      .sort((left, right) => right.score - left.score || left.voice.id.localeCompare(right.voice.id))
      .slice(0, this.#maximumVoices);
  }

  #score(listener: ListenerState, voice: SpatialVoice): ScoredVoice | null {
    const distance = Math.hypot(voice.position.x - listener.position.x, voice.position.y - listener.position.y, voice.position.z - listener.position.z);
    if (distance >= voice.maximumDistance) return null;
    const normalized = distance / voice.maximumDistance;
    const gain = (1 - normalized) * (1 - normalized);
    const score = voice.basePriority * BUS_PRIORITY[voice.bus] * (0.15 + gain * 0.85);
    return { voice, score, gain };
  }
}
