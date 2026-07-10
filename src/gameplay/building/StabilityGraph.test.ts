import { describe, expect, it } from 'vitest';
import { StabilityGraph } from './StabilityGraph';

describe('StabilityGraph', () => {
  it('propagates support incrementally through connected blocks', () => {
    const graph = new StabilityGraph();
    graph.add({ position: { x: 0, y: 0, z: 0 }, anchored: true, strength: 1 });
    graph.add({ position: { x: 0, y: 1, z: 0 }, anchored: false, strength: 1 });
    graph.add({ position: { x: 0, y: 2, z: 0 }, anchored: false, strength: 1 });
    expect(graph.get({ x: 0, y: 2, z: 0 })).toEqual({ state: 'supported', supportDistance: 2 });
  });

  it('marks a structure unsupported after its only support is removed', () => {
    const graph = new StabilityGraph();
    graph.add({ position: { x: 0, y: 0, z: 0 }, anchored: true, strength: 1 });
    graph.add({ position: { x: 0, y: 1, z: 0 }, anchored: false, strength: 1 });
    graph.add({ position: { x: 0, y: 2, z: 0 }, anchored: false, strength: 1 });
    graph.remove({ x: 0, y: 0, z: 0 });
    expect(graph.get({ x: 0, y: 1, z: 0 })?.state).toBe('unsupported');
    expect(graph.unsupportedComponents()).toEqual([[{ x: 0, y: 1, z: 0 }, { x: 0, y: 2, z: 0 }]]);
  });

  it('chooses the shortest remaining support chain', () => {
    const graph = new StabilityGraph();
    graph.add({ position: { x: 0, y: 0, z: 0 }, anchored: true, strength: 1 });
    graph.add({ position: { x: 0, y: 1, z: 0 }, anchored: false, strength: 1 });
    graph.add({ position: { x: 1, y: 1, z: 0 }, anchored: false, strength: 1 });
    graph.add({ position: { x: 1, y: 0, z: 0 }, anchored: true, strength: 1 });
    graph.remove({ x: 0, y: 0, z: 0 });
    expect(graph.get({ x: 0, y: 1, z: 0 })?.supportDistance).toBe(2);
  });
});
