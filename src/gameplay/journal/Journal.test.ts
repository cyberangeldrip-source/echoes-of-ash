import { describe, expect, it } from 'vitest';
import { Journal } from './Journal';
import { LoreCatalog } from './LoreCatalog';
import { fragmentId } from './LoreTypes';
import { validateLoreConsistency } from './LoreConsistencyValidator';

describe('Journal', () => {
  it('builds a coherent partial graph regardless of discovery order', () => {
    const catalog = new LoreCatalog();
    const journal = new Journal(catalog);
    journal.discover(fragmentId('channel-machine'), 20);
    journal.discover(fragmentId('drowned-marks'), 5);
    const timeline = journal.timeline();
    expect(timeline).toHaveLength(1);
    expect(timeline[0]?.map(entry => entry.fragment.id)).toContain('channel-machine');
    expect(journal.entries()[0]?.fragment.id).toBe('drowned-marks');
  });

  it('contains no high-confidence lore contradictions', () => {
    const catalog = new LoreCatalog();
    expect(validateLoreConsistency(catalog.values())).toEqual([]);
  });
});
