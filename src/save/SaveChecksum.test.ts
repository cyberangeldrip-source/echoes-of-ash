import { describe, expect, it } from 'vitest';
import { saveChecksum } from './SaveChecksum';

describe('saveChecksum', () => {
  it('is deterministic and sensitive to interrupted payloads', () => {
    const complete = '{"worldTick":120,"seed":"EMBER"}';
    expect(saveChecksum(complete)).toBe(saveChecksum(complete));
    expect(saveChecksum(complete)).not.toBe(saveChecksum(complete.slice(0, -1)));
  });
});
