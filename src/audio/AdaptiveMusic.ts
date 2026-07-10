export type MusicState = 'silence' | 'exploration' | 'tension' | 'discovery' | 'boss';

export interface MusicContext {
  readonly predatorThreat: number;
  readonly discoveryImportance: number;
  readonly bossActive: boolean;
  readonly playerInShelter: boolean;
}

export interface MusicTransition {
  readonly from: MusicState;
  readonly to: MusicState;
  readonly crossfadeSeconds: number;
}

export class AdaptiveMusic {
  #state: MusicState = 'silence';
  #discoveryHold = 0;

  public get state(): MusicState { return this.#state; }

  public update(context: MusicContext, seconds: number): MusicTransition | null {
    this.#discoveryHold = Math.max(0, this.#discoveryHold - seconds);
    if (context.discoveryImportance > 0.6) this.#discoveryHold = 4;
    const next = this.#choose(context);
    if (next === this.#state) return null;
    const transition = { from: this.#state, to: next, crossfadeSeconds: next === 'boss' ? 0.8 : next === 'discovery' ? 0.35 : 2.5 };
    this.#state = next;
    return transition;
  }

  #choose(context: MusicContext): MusicState {
    if (context.bossActive) return 'boss';
    if (this.#discoveryHold > 0) return 'discovery';
    if (context.predatorThreat > 0.42) return 'tension';
    if (context.playerInShelter && context.predatorThreat === 0) return 'silence';
    return 'exploration';
  }
}
