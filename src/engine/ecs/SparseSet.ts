import type { Entity } from './Entity';

export class SparseSet<T> {
  readonly #denseEntities: Entity[] = [];
  readonly #denseValues: T[] = [];
  readonly #sparse = new Map<Entity, number>();

  public get size(): number { return this.#denseEntities.length; }
  public has(entity: Entity): boolean { return this.#sparse.has(entity); }

  public get(entity: Entity): T | undefined {
    const index = this.#sparse.get(entity);
    return index === undefined ? undefined : this.#denseValues[index];
  }

  public set(entity: Entity, value: T): void {
    const existing = this.#sparse.get(entity);
    if (existing !== undefined) {
      this.#denseValues[existing] = value;
      return;
    }
    this.#sparse.set(entity, this.#denseEntities.length);
    this.#denseEntities.push(entity);
    this.#denseValues.push(value);
  }

  public delete(entity: Entity): boolean {
    const index = this.#sparse.get(entity);
    if (index === undefined) return false;
    const lastIndex = this.#denseEntities.length - 1;
    const lastEntity = this.#denseEntities[lastIndex];
    const lastValue = this.#denseValues[lastIndex];
    if (index !== lastIndex && lastEntity !== undefined && lastValue !== undefined) {
      this.#denseEntities[index] = lastEntity;
      this.#denseValues[index] = lastValue;
      this.#sparse.set(lastEntity, index);
    }
    this.#denseEntities.pop();
    this.#denseValues.pop();
    this.#sparse.delete(entity);
    return true;
  }

  public *entries(): IterableIterator<readonly [Entity, T]> {
    for (let index = 0; index < this.#denseEntities.length; index += 1) {
      const entity = this.#denseEntities[index];
      const value = this.#denseValues[index];
      if (entity !== undefined && value !== undefined) yield [entity, value] as const;
    }
  }
}
