import { itemId } from './ItemDefinition';
import type { ItemDefinition, ItemId } from './ItemDefinition';

const DEFINITIONS: readonly ItemDefinition[] = [
  { id: itemId('driftwood'), name: 'Driftwood', maximumStack: 40, tags: ['wood', 'tier-1'] },
  { id: itemId('fiber'), name: 'Saltgrass Fiber', maximumStack: 60, tags: ['fiber', 'tier-1'] },
  { id: itemId('basalt'), name: 'Worked Basalt', maximumStack: 50, tags: ['stone', 'tier-2'] },
  { id: itemId('hide'), name: 'Ashback Hide', maximumStack: 20, tags: ['hide', 'tier-2'] },
  { id: itemId('forged-alloy'), name: 'Forged Alloy', maximumStack: 30, tags: ['metal', 'tier-3'] },
  { id: itemId('glow-spore'), name: 'Glow-spore Reagent', maximumStack: 30, tags: ['reagent', 'tier-4'] },
  { id: itemId('ancient-component'), name: 'Ancient-machine Component', maximumStack: 10, tags: ['machine', 'tier-5'] },
  { id: itemId('field-knife'), name: 'Driftwood Field Knife', maximumStack: 1, tags: ['tool', 'tier-1'] },
  { id: itemId('basalt-hammer'), name: 'Basalt Hammer', maximumStack: 1, tags: ['tool', 'tier-2'] },
  { id: itemId('windless-lamp'), name: 'Windless Lamp', maximumStack: 1, tags: ['utility', 'tier-4'] },
];

export class ItemCatalog {
  readonly #items = new Map<ItemId, ItemDefinition>(DEFINITIONS.map(definition => [definition.id, definition]));

  public get(id: ItemId): ItemDefinition {
    const definition = this.#items.get(id);
    if (definition === undefined) throw new Error(`Unknown item: ${id}`);
    return definition;
  }

  public has(id: ItemId): boolean { return this.#items.has(id); }
}
