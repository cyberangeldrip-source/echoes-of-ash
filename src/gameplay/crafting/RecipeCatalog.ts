import { itemId } from '../items/ItemDefinition';
import { recipeId } from './Recipe';
import type { Recipe, RecipeId } from './Recipe';

const RECIPES: readonly Recipe[] = [
  { id: recipeId('field-knife'), inputs: [{ item: itemId('driftwood'), quantity: 2 }, { item: itemId('fiber'), quantity: 3 }], output: { item: itemId('field-knife'), quantity: 1 }, station: 'hands', discovery: [{ type: 'inspect-item', item: itemId('driftwood') }, { type: 'inspect-item', item: itemId('fiber') }] },
  { id: recipeId('basalt-hammer'), inputs: [{ item: itemId('basalt'), quantity: 4 }, { item: itemId('hide'), quantity: 2 }], output: { item: itemId('basalt-hammer'), quantity: 1 }, station: 'workbench', discovery: [{ type: 'inspect-item', item: itemId('basalt') }] },
  { id: recipeId('windless-lamp'), inputs: [{ item: itemId('glow-spore'), quantity: 3 }, { item: itemId('forged-alloy'), quantity: 1 }], output: { item: itemId('windless-lamp'), quantity: 1 }, station: 'forge', discovery: [{ type: 'inspect-structure', structure: 'marsh-lantern-ruin' }] },
];

export class RecipeCatalog {
  readonly #recipes = new Map<RecipeId, Recipe>(RECIPES.map(recipe => [recipe.id, recipe]));
  public get(id: RecipeId): Recipe { const recipe = this.#recipes.get(id); if (recipe === undefined) throw new Error(`Unknown recipe: ${id}`); return recipe; }
  public values(): readonly Recipe[] { return [...this.#recipes.values()]; }
}
