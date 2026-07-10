import { hashCoordinates, hashSeed, randomUnit } from '../generation/WorldSeed';

export type WeatherKind = 'clear' | 'rain' | 'fog' | 'ashfall' | 'storm';
export interface WeatherState { readonly kind: WeatherKind; readonly intensity: number; readonly wind: readonly [number, number]; readonly remainingSeconds: number; }

const MIN_DURATION = 90;
const DURATION_VARIANCE = 210;

export class WeatherSimulation {
  readonly #seed: number;
  #eventIndex = 0;
  #state: WeatherState;

  public constructor(seed: string) { this.#seed = hashSeed(seed); this.#state = this.#next(); }
  public get state(): WeatherState { return this.#state; }

  public advance(seconds: number): WeatherState {
    let remainingAdvance = Math.max(0, seconds);
    while (remainingAdvance >= this.#state.remainingSeconds) { remainingAdvance -= this.#state.remainingSeconds; this.#eventIndex += 1; this.#state = this.#next(); }
    this.#state = { ...this.#state, remainingSeconds: this.#state.remainingSeconds - remainingAdvance };
    return this.#state;
  }

  #next(): WeatherState {
    const base = hashCoordinates(this.#seed, this.#eventIndex, 11);
    const roll = base % 100;
    const kind: WeatherKind = roll < 32 ? 'clear' : roll < 51 ? 'rain' : roll < 67 ? 'fog' : roll < 88 ? 'ashfall' : 'storm';
    const intensity = kind === 'clear' ? 0 : 0.35 + randomUnit(hashCoordinates(base, 2, 7)) * 0.65;
    const angle = randomUnit(hashCoordinates(base, 3, 9)) * Math.PI * 2;
    const windSpeed = 0.15 + randomUnit(hashCoordinates(base, 5, 13)) * 0.85;
    return { kind, intensity, wind: [Math.cos(angle) * windSpeed, Math.sin(angle) * windSpeed], remainingSeconds: MIN_DURATION + randomUnit(hashCoordinates(base, 17, 19)) * DURATION_VARIANCE };
  }
}
