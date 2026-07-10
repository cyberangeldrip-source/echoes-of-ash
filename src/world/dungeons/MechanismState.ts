export type MechanismPhase = 'inactive' | 'partial' | 'active';

export interface MechanismEffect {
  readonly id: string;
  readonly surfaceRegion: string;
  readonly mutation: 'open-channel' | 'drain-terrace' | 'warm-ash-ring' | 'rebuild-ruin';
}

export class MechanismState {
  readonly #phases = new Map<string, MechanismPhase>();
  readonly #appliedEffects = new Set<string>();

  public phase(id: string): MechanismPhase { return this.#phases.get(id) ?? 'inactive'; }

  public advance(id: string, effect: MechanismEffect): MechanismEffect | null {
    const current = this.phase(id);
    if (current === 'active') return null;
    const next: MechanismPhase = current === 'inactive' ? 'partial' : 'active';
    this.#phases.set(id, next);
    if (next !== 'active' || this.#appliedEffects.has(effect.id)) return null;
    this.#appliedEffects.add(effect.id);
    return effect;
  }

  public snapshot(): Readonly<Record<string, MechanismPhase>> { return Object.fromEntries(this.#phases); }
}
