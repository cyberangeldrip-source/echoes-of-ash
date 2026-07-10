import { describe, expect, it } from 'vitest';
import { MeleeResolver } from './MeleeResolver';

const weapon = { damage: 20, poiseDamage: 30, weight: 4, reach: 2, lightRecoverySeconds: 0.4, heavyRecoverySeconds: 0.9 };

describe('MeleeResolver', () => {
  it('makes heavy timed attacks weightier without reducing them to larger damage only', () => {
    const target = { vitality: 100, poise: 40, maximumPoise: 40, staggerSeconds: 0, invulnerabilitySeconds: 0 };
    const hit = new MeleeResolver().resolve(1, weapon, { kind: 'heavy', comboIndex: 1, timingAccuracy: 1 }, target);
    expect(hit.staggered).toBe(true);
    expect(hit.knockback).toBeGreaterThan(4);
    expect(hit.recoverySeconds).toBeGreaterThan(weapon.heavyRecoverySeconds);
  });

  it('respects invulnerability without mutating vitality', () => {
    const target = { vitality: 100, poise: 40, maximumPoise: 40, staggerSeconds: 0, invulnerabilitySeconds: 0.1 };
    expect(new MeleeResolver().resolve(1, weapon, { kind: 'light', comboIndex: 0, timingAccuracy: 1 }, target).damage).toBe(0);
    expect(target.vitality).toBe(100);
  });
});
