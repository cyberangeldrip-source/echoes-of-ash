export type Entity = number & { readonly __entity: unique symbol };

export function entityFrom(value: number): Entity {
  if (!Number.isSafeInteger(value) || value <= 0) throw new RangeError('Entity identifiers must be positive safe integers.');
  return value as Entity;
}
