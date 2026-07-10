import { describe, expect, it } from 'vitest';
import { InputBindingMap } from './InputBindings';

describe('InputBindingMap', () => {
  it('supports complete runtime rebinding without stale keys', () => {
    const bindings = new InputBindingMap();
    expect(bindings.actionsFor('KeyW')).toContain('move-forward');
    bindings.rebind('move-forward', ['ArrowUp']);
    expect(bindings.actionsFor('KeyW')).not.toContain('move-forward');
    expect(bindings.actionsFor('ArrowUp')).toContain('move-forward');
  });
});
