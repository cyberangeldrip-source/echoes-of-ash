import { describe, expect, it } from 'vitest';
import { FixedStepClock } from './FixedStepClock';

describe('FixedStepClock', () => {
  it('produces identical simulation ticks across uneven render frames', () => {
    const clock = new FixedStepClock(20);
    const ticks: number[] = [];
    clock.advance(0.03, tick => ticks.push(tick.index));
    clock.advance(0.07, tick => ticks.push(tick.index));
    expect(ticks).toEqual([0, 1]);
  });

  it('clamps long frames to prevent a simulation spiral', () => {
    const clock = new FixedStepClock(20, 0.25);
    let ticks = 0;
    clock.advance(4, () => { ticks += 1; });
    expect(ticks).toBe(5);
  });
});
