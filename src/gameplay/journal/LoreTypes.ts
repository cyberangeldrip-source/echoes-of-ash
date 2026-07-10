export type FragmentId = string & { readonly __fragmentId: unique symbol };
export function fragmentId(value: string): FragmentId { if (value.length === 0) throw new Error('Fragment id cannot be empty.'); return value as FragmentId; }

export type FragmentKind = 'physical' | 'structural' | 'behavioral' | 'environmental';

export interface LoreClaim {
  readonly subject: string;
  readonly relation: string;
  readonly object: string;
  readonly confidence: number;
}

export interface LoreFragment {
  readonly id: FragmentId;
  readonly kind: FragmentKind;
  readonly title: string;
  readonly observation: string;
  readonly claims: readonly LoreClaim[];
  readonly related: readonly FragmentId[];
}

export interface JournalEntry {
  readonly fragment: LoreFragment;
  readonly discoveredAtTick: number;
  readonly connections: readonly FragmentId[];
}
