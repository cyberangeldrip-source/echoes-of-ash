import type { AttackIntent, CombatantState, HitResult, WeaponProfile } from './CombatTypes';

const MIN_TIMING_MULTIPLIER = 0.72;
const MAX_COMBO_INDEX = 2;

export class MeleeResolver {
  public resolve(attackerStamina: number, weapon: WeaponProfile, intent: AttackIntent, target: CombatantState): HitResult {
    if (intent.comboIndex < 0 || intent.comboIndex > MAX_COMBO_INDEX) throw new RangeError('Invalid combo index.');
    if (target.invulnerabilitySeconds > 0) return { damage: 0, poiseDamage: 0, staggered: false, knockback: 0, recoverySeconds: 0 };
    const heavy = intent.kind === 'heavy';
    const staminaFactor = Math.max(0.45, Math.min(1, attackerStamina));
    const timingFactor = MIN_TIMING_MULTIPLIER + Math.max(0, Math.min(1, intent.timingAccuracy)) * (1 - MIN_TIMING_MULTIPLIER);
    const comboFactor = 1 + intent.comboIndex * 0.08;
    const attackFactor = heavy ? 1.58 : 1;
    const damage = weapon.damage * attackFactor * timingFactor * comboFactor * staminaFactor;
    const poiseDamage = weapon.poiseDamage * (heavy ? 1.9 : 1) * timingFactor;
    target.vitality = Math.max(0, target.vitality - damage);
    target.poise -= poiseDamage;
    const staggered = target.poise <= 0;
    if (staggered) {
      target.staggerSeconds = Math.max(target.staggerSeconds, 0.35 + weapon.weight * 0.075);
      target.poise = target.maximumPoise;
    }
    const recoverySeconds = (heavy ? weapon.heavyRecoverySeconds : weapon.lightRecoverySeconds) * (1 + weapon.weight * 0.045);
    return { damage, poiseDamage, staggered, knockback: weapon.weight * attackFactor * timingFactor, recoverySeconds };
  }
}
