import { describe, expect, it, vi } from 'vitest';
import { PerformanceProfiler } from './PerformanceProfiler';

describe('PerformanceProfiler', () => {
  it('maintains a bounded rolling profile per system', () => {
    const profiler = new PerformanceProfiler(2);
    const spy = vi.spyOn(performance, 'now').mockReturnValueOnce(0).mockReturnValueOnce(2).mockReturnValueOnce(2).mockReturnValueOnce(7).mockReturnValueOnce(7).mockReturnValueOnce(16);
    profiler.measure('simulation', () => 1); profiler.measure('simulation', () => 2); profiler.measure('simulation', () => 3);
    expect(profiler.summaries()[0]).toMatchObject({ name: 'simulation', averageMilliseconds: 7, maximumMilliseconds: 9, samples: 2 });
    spy.mockRestore();
  });
});
