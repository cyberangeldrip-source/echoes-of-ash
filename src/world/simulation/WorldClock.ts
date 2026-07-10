export interface WorldTime { readonly day: number; readonly minuteOfDay: number; readonly normalizedDay: number; }

export class WorldClock {
  readonly #realSecondsPerGameDay: number;
  #absoluteMinutes: number;

  public constructor(realSecondsPerGameDay: number, initialMinute = 400) {
    if (realSecondsPerGameDay <= 0) throw new RangeError('Day duration must be positive.');
    this.#realSecondsPerGameDay = realSecondsPerGameDay;
    this.#absoluteMinutes = initialMinute;
  }

  public advance(realSeconds: number): WorldTime {
    this.#absoluteMinutes += Math.max(0, realSeconds) * 1440 / this.#realSecondsPerGameDay;
    return this.current();
  }

  public current(): WorldTime {
    const minuteOfDay = ((this.#absoluteMinutes % 1440) + 1440) % 1440;
    return { day: Math.floor(this.#absoluteMinutes / 1440) + 1, minuteOfDay, normalizedDay: minuteOfDay / 1440 };
  }
}
