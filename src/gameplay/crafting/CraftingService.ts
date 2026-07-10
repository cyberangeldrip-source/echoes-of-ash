import type { Inventory } from '../inventory/Inventory';
import type { DiscoveryTrigger, Recipe, RecipeId, StationId } from './Recipe';
import type { RecipeCatalog } from './RecipeCatalog';

export class CraftingService {
  readonly #catalog: RecipeCatalog;
  readonly #discovered = new Set<RecipeId>();
  readonly #triggerProgress = new Map<RecipeId, Set<number>>();

  public constructor(catalog: RecipeCatalog) { this.#catalog = catalog; }
  public isDiscovered(recipe: RecipeId): boolean { return this.#discovered.has(recipe); }

  public observe(trigger: DiscoveryTrigger): readonly RecipeId[] {
    const unlocked: RecipeId[] = [];
    for (const recipe of this.#catalog.values()) {
      if (this.#discovered.has(recipe.id)) continue;
      const progress = this.#triggerProgress.get(recipe.id) ?? new Set<number>();
      recipe.discovery.forEach((required, index) => { if (this.#matches(required, trigger)) progress.add(index); });
      this.#triggerProgress.set(recipe.id, progress);
      if (progress.size === recipe.discovery.length) { this.#discovered.add(recipe.id); unlocked.push(recipe.id); }
    }
    return unlocked;
  }

  public craft(recipeId: RecipeId, station: StationId, inventory: Inventory): void {
    if (!this.#discovered.has(recipeId)) throw new Error(`Recipe ${recipeId} has not been discovered.`);
    const recipe = this.#catalog.get(recipeId);
    if (recipe.station !== station) throw new Error(`Recipe ${recipeId} requires ${recipe.station}.`);
    for (const input of recipe.inputs) if (inventory.count(input.item) < input.quantity) throw new Error(`Missing ingredient ${input.item}.`);
    if (!inventory.canAdd(recipe.output)) throw new Error('Inventory cannot hold the crafted output.');
    for (const input of recipe.inputs) inventory.remove(input.item, input.quantity);
    inventory.add(recipe.output);
  }

  #matches(required: DiscoveryTrigger, observed: DiscoveryTrigger): boolean {
    if (required.type !== observed.type) return false;
    if (required.type === 'inspect-item' && observed.type === 'inspect-item') return required.item === observed.item;
    if (required.type === 'inspect-structure' && observed.type === 'inspect-structure') return required.structure === observed.structure;
    return required.type === 'activate-mechanism' && observed.type === 'activate-mechanism' && required.mechanism === observed.mechanism;
  }
}
