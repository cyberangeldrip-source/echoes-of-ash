export interface HudState {
  readonly biome: string;
  readonly day: number;
  readonly time: string;
  readonly weather: string;
  readonly vitality: number;
  readonly stamina: number;
  readonly interaction: string | null;
  readonly caption: string | null;
}

export class Hud {
  readonly #root: HTMLElement;
  readonly #biome: HTMLElement;
  readonly #clock: HTMLElement;
  readonly #weather: HTMLElement;
  readonly #vitality: HTMLElement;
  readonly #stamina: HTMLElement;
  readonly #interaction: HTMLElement;
  readonly #captions: HTMLElement;

  public constructor(root: HTMLElement) {
    this.#root = root;
    this.#biome = this.#required('[data-hud="biome"]'); this.#clock = this.#required('[data-hud="clock"]');
    this.#weather = this.#required('[data-hud="weather"]'); this.#vitality = this.#required('[data-hud="vitality"]');
    this.#stamina = this.#required('[data-hud="stamina"]'); this.#interaction = this.#required('[data-hud="interaction"]');
    this.#captions = this.#required('[data-hud="captions"]');
  }

  public render(state: HudState): void {
    this.#biome.textContent = state.biome; this.#clock.textContent = `DAY ${String(state.day).padStart(2, '0')} · ${state.time}`; this.#weather.textContent = state.weather;
    this.#vitality.style.setProperty('--meter', String(Math.max(0, Math.min(1, state.vitality))));
    this.#stamina.style.setProperty('--meter', String(Math.max(0, Math.min(1, state.stamina))));
    this.#interaction.textContent = state.interaction ?? ''; this.#interaction.toggleAttribute('hidden', state.interaction === null);
    this.#captions.textContent = state.caption ?? ''; this.#captions.toggleAttribute('hidden', state.caption === null);
  }

  public setVisible(visible: boolean): void { this.#root.toggleAttribute('hidden', !visible); }
  #required(selector: string): HTMLElement { const element = this.#root.querySelector<HTMLElement>(selector); if (element === null) throw new Error(`HUD element missing: ${selector}`); return element; }
}
