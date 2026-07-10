import { describe, expect, it } from 'vitest';
import { migrateSave } from './SaveMigration';
import { SAVE_FORMAT_VERSION } from './SaveTypes';

describe('migrateSave', () => {
  it('accepts a valid current save and rejects unknown versions', () => {
    const valid = {
      formatVersion: SAVE_FORMAT_VERSION,
      saveId: 'world-1', seed: 'EMBER', committedAt: 1, worldTick: 2,
      player: { position: [0, 64, 0], yaw: 0, pitch: 0, vitality: 100, stamina: 100 },
      chunkDiffs: [], mechanismStates: {}, discoveredFragments: [],
    };
    expect(migrateSave(valid).seed).toBe('EMBER');
    expect(() => migrateSave({ ...valid, formatVersion: 99 })).toThrow('Unsupported save format');
  });
});
