import type { GameAction } from './InputBindings';
import { InputBindingMap } from './InputBindings';

export class InputController {
  readonly #bindings: InputBindingMap;
  readonly #pressed = new Set<GameAction>();
  readonly #justPressed = new Set<GameAction>();
  readonly #target: HTMLElement;

  public constructor(target: HTMLElement, bindings = new InputBindingMap()) { this.#target = target; this.#bindings = bindings; }
  public attach(): void { window.addEventListener('keydown', this.#keyDown); window.addEventListener('keyup', this.#keyUp); this.#target.addEventListener('mousedown', this.#mouseDown); this.#target.addEventListener('mouseup', this.#mouseUp); }
  public detach(): void { window.removeEventListener('keydown', this.#keyDown); window.removeEventListener('keyup', this.#keyUp); this.#target.removeEventListener('mousedown', this.#mouseDown); this.#target.removeEventListener('mouseup', this.#mouseUp); this.#pressed.clear(); this.#justPressed.clear(); }
  public isPressed(action: GameAction): boolean { return this.#pressed.has(action); }
  public consumePress(action: GameAction): boolean { const found = this.#justPressed.has(action); this.#justPressed.delete(action); return found; }
  public endFrame(): void { this.#justPressed.clear(); }
  public get bindings(): InputBindingMap { return this.#bindings; }

  readonly #keyDown = (event: KeyboardEvent): void => { if (event.repeat) return; this.#activate(event.code); };
  readonly #keyUp = (event: KeyboardEvent): void => { this.#deactivate(event.code); };
  readonly #mouseDown = (event: MouseEvent): void => { this.#activate(`Mouse${event.button}`); };
  readonly #mouseUp = (event: MouseEvent): void => { this.#deactivate(`Mouse${event.button}`); };
  #activate(code: string): void { for (const action of this.#bindings.actionsFor(code)) { this.#pressed.add(action); this.#justPressed.add(action); } }
  #deactivate(code: string): void { for (const action of this.#bindings.actionsFor(code)) this.#pressed.delete(action); }
}
