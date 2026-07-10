import { entityFrom } from './Entity';
import type { Entity } from './Entity';
import { SparseSet } from './SparseSet';

export type ComponentKey<T> = symbol & { readonly __component: T };

export function componentKey<T>(description: string): ComponentKey<T> {
  return Symbol(description) as ComponentKey<T>;
}

export class EcsWorld {
  readonly #alive = new Set<Entity>();
  readonly #stores = new Map<symbol, SparseSet<unknown>>();
  #nextEntity = 1;

  public createEntity(): Entity {
    const entity = entityFrom(this.#nextEntity);
    this.#nextEntity += 1;
    this.#alive.add(entity);
    return entity;
  }

  public destroyEntity(entity: Entity): boolean {
    if (!this.#alive.delete(entity)) return false;
    for (const store of this.#stores.values()) store.delete(entity);
    return true;
  }

  public add<T>(entity: Entity, key: ComponentKey<T>, component: T): void {
    this.#assertAlive(entity);
    this.#store(key).set(entity, component);
  }

  public get<T>(entity: Entity, key: ComponentKey<T>): T | undefined {
    return this.#store(key).get(entity);
  }

  public remove<T>(entity: Entity, key: ComponentKey<T>): boolean {
    return this.#store(key).delete(entity);
  }

  public *query<A, B>(first: ComponentKey<A>, second: ComponentKey<B>): IterableIterator<readonly [Entity, A, B]> {
    const firstStore = this.#store(first);
    const secondStore = this.#store(second);
    const [small, other, reversed] = firstStore.size <= secondStore.size
      ? [firstStore, secondStore, false] as const
      : [secondStore, firstStore, true] as const;
    for (const [entity, component] of small.entries()) {
      const paired = other.get(entity);
      if (paired === undefined) continue;
      if (reversed) yield [entity, paired as A, component as B] as const;
      else yield [entity, component as A, paired as B] as const;
    }
  }

  #store<T>(key: ComponentKey<T>): SparseSet<T> {
    const existing = this.#stores.get(key);
    if (existing !== undefined) return existing as SparseSet<T>;
    const created = new SparseSet<T>();
    this.#stores.set(key, created as SparseSet<unknown>);
    return created;
  }

  #assertAlive(entity: Entity): void {
    if (!this.#alive.has(entity)) throw new Error(`Entity ${entity} is not alive.`);
  }
}
