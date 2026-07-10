export interface CombatantState {
  vitality: number;
  poise: number;
  maximumPoise: number;
  staggerSeconds: number;
  invulnerabilitySeconds: number;
}

export interface WeaponProfile {
  readonly damage: number;
  readonly poiseDamage: number;
  readonly weight: number;
  readonly reach: number;
  readonly lightRecoverySeconds: number;
  readonly heavyRecoverySeconds: number;
}

export interface AttackIntent {
  readonly kind: 'light' | 'heavy';
  readonly comboIndex: number;
  readonly timingAccuracy: number;
}

export interface HitResult {
  readonly damage: number;
  readonly poiseDamage: number;
  readonly staggered: boolean;
  readonly knockback: number;
  readonly recoverySeconds: number;
}
