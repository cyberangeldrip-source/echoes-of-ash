import { describe, expect, it } from 'vitest';
import { AdaptiveMusic } from './AdaptiveMusic';

describe('AdaptiveMusic', () => {
  it('prioritizes boss and discovery states without abrupt default transitions', () => {
    const music = new AdaptiveMusic();
    expect(music.update({ predatorThreat: 0, discoveryImportance: 0, bossActive: false, playerInShelter: false }, 0.1)?.to).toBe('exploration');
    expect(music.update({ predatorThreat: 0, discoveryImportance: 1, bossActive: false, playerInShelter: false }, 0.1)?.to).toBe('discovery');
    expect(music.update({ predatorThreat: 0, discoveryImportance: 0, bossActive: true, playerInShelter: false }, 0.1)?.to).toBe('boss');
  });
});
