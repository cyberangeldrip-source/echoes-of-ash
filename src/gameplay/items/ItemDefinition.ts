export type ItemId = string & { readonly __itemId: unique symbol };

export function itemId(value: string): ItemId {
  if (!/^[a-z][a-z0-9-]*$/.test(value)) throw new Error(`Invalid item identifier: ${value}`);
  return value as ItemId;
}

export interface ItemDefinition {
  readonly id: ItemId;
  readonly name: string;
  readonly maximumStack: number;
  readonly tags: readonly string[];
}
