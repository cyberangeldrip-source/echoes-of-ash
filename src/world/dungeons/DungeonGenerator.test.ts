import { describe, expect, it } from 'vitest';
import { DungeonGenerator } from './DungeonGenerator';
import { validateDungeon } from './DungeonValidator';

describe('DungeonGenerator', () => {
  it('guarantees reachability of entrance, mechanism, and boss rooms', () => {
    const generator = new DungeonGenerator();
    for (let seed = 1; seed <= 30; seed += 1) {
      const layout = generator.generate(seed);
      const validation = validateDungeon(layout);
      expect(validation.valid).toBe(true);
      expect(layout.rooms.some(room => room.kind === 'mechanism')).toBe(true);
      expect(layout.rooms.some(room => room.kind === 'boss')).toBe(true);
    }
  });

  it('is deterministic for the same seed', () => {
    const generator = new DungeonGenerator();
    expect(generator.generate(1847)).toEqual(generator.generate(1847));
  });
});
