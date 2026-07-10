import { describe, expect, it } from 'vitest';
import { MechanismState } from './MechanismState';

describe('MechanismState', () => {
  it('applies a surface consequence exactly once', () => {
    const state = new MechanismState();
    const effect = { id: 'channel-1', surfaceRegion: 'terraces:2,1', mutation: 'open-channel' as const };
    expect(state.advance('machine-1', effect)).toBeNull();
    expect(state.advance('machine-1', effect)).toEqual(effect);
    expect(state.advance('machine-1', effect)).toBeNull();
    expect(state.phase('machine-1')).toBe('active');
  });
});
