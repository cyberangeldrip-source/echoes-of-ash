export interface EncounterContext {
  readonly elapsedSeconds: number;
  readonly bossVitalityFraction: number;
  readonly flags: ReadonlySet<string>;
}

export interface EncounterAction {
  readonly type: 'set-phase' | 'stagger-boss' | 'activate-hazard' | 'complete';
  readonly value: string;
}

export interface EncounterRule {
  readonly id: string;
  readonly once: boolean;
  readonly predicate: (context: EncounterContext) => boolean;
  readonly actions: readonly EncounterAction[];
}

export class EncounterScript {
  readonly #rules: readonly EncounterRule[];
  readonly #fired = new Set<string>();

  public constructor(rules: readonly EncounterRule[]) { this.#rules = [...rules]; }

  public evaluate(context: EncounterContext): readonly EncounterAction[] {
    const actions: EncounterAction[] = [];
    for (const rule of this.#rules) {
      if (rule.once && this.#fired.has(rule.id)) continue;
      if (!rule.predicate(context)) continue;
      actions.push(...rule.actions);
      if (rule.once) this.#fired.add(rule.id);
    }
    return actions;
  }
}
