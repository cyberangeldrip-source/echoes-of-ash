import type { ItemCatalog } from '../items/ItemCatalog';
import type { ItemId } from '../items/ItemDefinition';

export interface ItemStack { readonly item: ItemId; readonly quantity: number; }

export class Inventory {
  readonly #catalog: ItemCatalog;
  readonly #slots: Array<ItemStack | null>;

  public constructor(catalog: ItemCatalog, capacity: number) {
    if (!Number.isSafeInteger(capacity) || capacity <= 0) throw new RangeError('Inventory capacity must be positive.');
    this.#catalog = catalog;
    this.#slots = new Array<ItemStack | null>(capacity).fill(null);
  }

  public get slots(): readonly (ItemStack | null)[] { return this.#slots.map(stack => stack === null ? null : { ...stack }); }
  public count(item: ItemId): number { return this.#slots.reduce((sum, stack) => sum + (stack?.item === item ? stack.quantity : 0), 0); }
  public canAdd(stack: ItemStack): boolean { return this.#planAddition(stack).remaining === 0; }

  public add(stack: ItemStack): void {
    this.#validateStack(stack);
    const plan = this.#planAddition(stack);
    if (plan.remaining !== 0) throw new Error(`Not enough inventory space for ${stack.item}.`);
    for (const change of plan.changes) this.#slots[change.index] = change.stack;
  }

  public remove(item: ItemId, quantity: number): void {
    if (!Number.isSafeInteger(quantity) || quantity <= 0) throw new RangeError('Removal quantity must be positive.');
    if (this.count(item) < quantity) throw new Error(`Insufficient ${item}.`);
    let remaining = quantity;
    for (let index = this.#slots.length - 1; index >= 0 && remaining > 0; index -= 1) {
      const stack = this.#slots[index];
      if (stack?.item !== item) continue;
      const removed = Math.min(stack.quantity, remaining);
      const nextQuantity = stack.quantity - removed;
      this.#slots[index] = nextQuantity === 0 ? null : { item, quantity: nextQuantity };
      remaining -= removed;
    }
  }

  #planAddition(stack: ItemStack): { readonly changes: readonly { readonly index: number; readonly stack: ItemStack }[]; readonly remaining: number } {
    this.#validateStack(stack);
    const maximum = this.#catalog.get(stack.item).maximumStack;
    let remaining = stack.quantity;
    const changes: Array<{ readonly index: number; readonly stack: ItemStack }> = [];
    for (let index = 0; index < this.#slots.length && remaining > 0; index += 1) {
      const current = this.#slots[index];
      if (current?.item !== stack.item || current.quantity >= maximum) continue;
      const added = Math.min(maximum - current.quantity, remaining);
      changes.push({ index, stack: { item: stack.item, quantity: current.quantity + added } });
      remaining -= added;
    }
    for (let index = 0; index < this.#slots.length && remaining > 0; index += 1) {
      if (this.#slots[index] !== null || changes.some(change => change.index === index)) continue;
      const added = Math.min(maximum, remaining);
      changes.push({ index, stack: { item: stack.item, quantity: added } });
      remaining -= added;
    }
    return { changes, remaining };
  }

  #validateStack(stack: ItemStack): void {
    this.#catalog.get(stack.item);
    if (!Number.isSafeInteger(stack.quantity) || stack.quantity <= 0) throw new RangeError('Stack quantity must be positive.');
  }
}
