import { describe, expect, it } from 'vitest';
import { CraftingService } from './CraftingService';
import { RecipeCatalog } from './RecipeCatalog';
import { recipeId } from './Recipe';
import { ItemCatalog } from '../items/ItemCatalog';
import { itemId } from '../items/ItemDefinition';
import { Inventory } from '../inventory/Inventory';

describe('CraftingService', () => {
  it('requires every declarative discovery trigger before crafting', () => {
    const service = new CraftingService(new RecipeCatalog());
    service.observe({ type: 'inspect-item', item: itemId('driftwood') });
    expect(service.isDiscovered(recipeId('field-knife'))).toBe(false);
    service.observe({ type: 'inspect-item', item: itemId('fiber') });
    expect(service.isDiscovered(recipeId('field-knife'))).toBe(true);
  });

  it('consumes obtainable ingredients and produces the real item', () => {
    const inventory = new Inventory(new ItemCatalog(), 8);
    inventory.add({ item: itemId('driftwood'), quantity: 2 });
    inventory.add({ item: itemId('fiber'), quantity: 3 });
    const service = new CraftingService(new RecipeCatalog());
    service.observe({ type: 'inspect-item', item: itemId('driftwood') });
    service.observe({ type: 'inspect-item', item: itemId('fiber') });
    service.craft(recipeId('field-knife'), 'hands', inventory);
    expect(inventory.count(itemId('field-knife'))).toBe(1);
    expect(inventory.count(itemId('fiber'))).toBe(0);
  });
});
