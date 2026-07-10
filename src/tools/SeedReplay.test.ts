import { describe, expect, it } from 'vitest';
import { parseSeedReplay, SeedReplayRecorder } from './SeedReplay';

describe('SeedReplayRecorder', () => {
  it('round trips deterministic player inputs for bug reproduction', () => {
    const recorder = new SeedReplayRecorder('EMBER-1847', [{ x: 0, y: 1, z: 0 }]);
    recorder.record({ tick: 1, position: [0, 64, 0], yaw: 1, actions: ['move-forward'] });
    const parsed = parseSeedReplay(JSON.stringify(recorder.export()));
    expect(parsed.seed).toBe('EMBER-1847');
    expect(parsed.frames[0]?.actions).toEqual(['move-forward']);
  });
});
