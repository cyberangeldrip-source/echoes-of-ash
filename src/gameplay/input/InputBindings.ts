export type GameAction = 'move-forward' | 'move-backward' | 'move-left' | 'move-right' | 'jump' | 'sprint' | 'crouch' | 'interact' | 'primary-action' | 'secondary-action' | 'inventory' | 'journal' | 'pause';

export interface InputBinding { readonly action: GameAction; readonly codes: readonly string[]; }

export const DEFAULT_BINDINGS: readonly InputBinding[] = [
  { action: 'move-forward', codes: ['KeyW'] }, { action: 'move-backward', codes: ['KeyS'] },
  { action: 'move-left', codes: ['KeyA'] }, { action: 'move-right', codes: ['KeyD'] },
  { action: 'jump', codes: ['Space'] }, { action: 'sprint', codes: ['ShiftLeft', 'ShiftRight'] },
  { action: 'crouch', codes: ['ControlLeft', 'ControlRight'] }, { action: 'interact', codes: ['KeyE'] },
  { action: 'primary-action', codes: ['Mouse0'] }, { action: 'secondary-action', codes: ['Mouse2'] },
  { action: 'inventory', codes: ['KeyI', 'Tab'] }, { action: 'journal', codes: ['KeyJ'] }, { action: 'pause', codes: ['Escape'] },
];

export class InputBindingMap {
  readonly #bindings = new Map<GameAction, Set<string>>();
  public constructor(bindings: readonly InputBinding[] = DEFAULT_BINDINGS) { for (const binding of bindings) this.rebind(binding.action, binding.codes); }
  public rebind(action: GameAction, codes: readonly string[]): void { if (codes.length === 0) throw new Error(`${action} needs at least one binding.`); this.#bindings.set(action, new Set(codes)); }
  public actionsFor(code: string): readonly GameAction[] { return [...this.#bindings].filter(([, codes]) => codes.has(code)).map(([action]) => action); }
  public snapshot(): readonly InputBinding[] { return [...this.#bindings].map(([action, codes]) => ({ action, codes: [...codes] })); }
}
