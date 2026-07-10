import { describe, expect, it } from 'vitest';
import { WeatherSimulation } from './WeatherSimulation';

describe('WeatherSimulation', () => {
  it('replays the same weather sequence from a world seed', () => {
    const first = new WeatherSimulation('EMBER-1847'); const second = new WeatherSimulation('EMBER-1847');
    expect(first.state).toEqual(second.state);
    expect(first.advance(500)).toEqual(second.advance(500));
  });
});
