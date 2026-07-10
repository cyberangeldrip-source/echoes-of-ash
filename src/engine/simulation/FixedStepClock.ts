export interface SimulationStep {
  readonly index: number;
  readonly seconds: number;
}

export class FixedStepClock {
  readonly #stepSeconds: number;
  readonly #maximumFrameSeconds: number;
  #accumulator = 0;
  #stepIndex = 0;

  public constructor(ticksPerSecond: number, maximumFrameSeconds = 0.25) {
    if (ticksPerSecond <= 0) throw new RangeError('Tick rate must be positive.');
    this.#stepSeconds = 1 / ticksPerSecond;
    this.#maximumFrameSeconds = maximumFrameSeconds;
  }

  public advance(frameSeconds: number, step: (tick: SimulationStep) => void): number {
    this.#accumulator += Math.min(Math.max(frameSeconds, 0), this.#maximumFrameSeconds);
    let count = 0;
    while (this.#accumulator >= this.#stepSeconds) {
      step({ index: this.#stepIndex, seconds: this.#stepSeconds });
      this.#stepIndex += 1;
      this.#accumulator -= this.#stepSeconds;
      count += 1;
    }
    return count;
  }

  public get interpolation(): number { return this.#accumulator / this.#stepSeconds; }
}
