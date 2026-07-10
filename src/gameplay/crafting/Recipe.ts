import type { ItemId } from '../items/ItemDefinition';

export type RecipeId = string & { readonly __recipeId: unique symbol };
export type StationId = 'hands' | 'workbench' | 'forge' | 'ancient-assembler';

export interface Ingredient { readonly item: ItemId; readonly quantity: number; }
export interface Recipe {
  readonly id: RecipeId;
  readonly inputs: readonly Ingredient[];
  readonly output: Ingredient;
  readonly station: StationId;
  readonly discovery: readonly DiscoveryTrigger[];
}

export type DiscoveryTrigger =
  | { readonly type: 'inspect-item'; readonly item: ItemId }
  | { readonly type: 'inspect-structure'; readonly structure: string }
  | { readonly type: 'activate-mechanism'; readonly mechanism: string };

export function recipeId(value: string): RecipeId { return value as RecipeId; }
