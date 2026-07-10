export interface ProfileSample { readonly name: string; readonly milliseconds: number; readonly frame: number; }
export interface ProfileSummary { readonly name: string; readonly averageMilliseconds: number; readonly maximumMilliseconds: number; readonly samples: number; }

export class PerformanceProfiler {
  readonly #samples = new Map<string, ProfileSample[]>();
  readonly #maximumSamples: number;
  #frame = 0;

  public constructor(maximumSamples = 240) { if (!Number.isSafeInteger(maximumSamples) || maximumSamples < 1) throw new RangeError('Sample capacity must be positive.'); this.#maximumSamples = maximumSamples; }
  public nextFrame(): void { this.#frame += 1; }
  public measure<T>(name: string, operation: () => T): T { const start = performance.now(); try { return operation(); } finally { this.record(name, performance.now() - start); } }
  public async measureAsync<T>(name: string, operation: () => Promise<T>): Promise<T> { const start = performance.now(); try { return await operation(); } finally { this.record(name, performance.now() - start); } }
  public record(name: string, milliseconds: number): void { const samples = this.#samples.get(name) ?? []; samples.push({ name, milliseconds, frame: this.#frame }); if (samples.length > this.#maximumSamples) samples.splice(0, samples.length - this.#maximumSamples); this.#samples.set(name, samples); }
  public summaries(): readonly ProfileSummary[] { return [...this.#samples].map(([name, samples]) => ({ name, averageMilliseconds: samples.reduce((sum, sample) => sum + sample.milliseconds, 0) / samples.length, maximumMilliseconds: Math.max(...samples.map(sample => sample.milliseconds)), samples: samples.length })).sort((left, right) => right.averageMilliseconds - left.averageMilliseconds); }
}
