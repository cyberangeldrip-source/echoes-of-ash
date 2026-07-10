import { describe, expect, it } from 'vitest';
import { componentKey, EcsWorld } from './World';

const Name = componentKey<string>('Name');
const Health = componentKey<number>('Health');

describe('EcsWorld', () => {
  it('joins sparse component stores without returning incomplete entities', () => {
    const world = new EcsWorld();
    const complete = world.createEntity();
    const partial = world.createEntity();
    world.add(complete, Name, 'Ashback Elk');
    world.add(complete, Health, 100);
    world.add(partial, Name, 'Cindermite');
    expect([...world.query(Name, Health)]).toEqual([[complete, 'Ashback Elk', 100]]);
  });

  it('removes every component when an entity is destroyed', () => {
    const world = new EcsWorld();
    const entity = world.createEntity();
    world.add(entity, Name, 'Reefstalker');
    expect(world.destroyEntity(entity)).toBe(true);
    expect(world.get(entity, Name)).toBeUndefined();
  });
});
