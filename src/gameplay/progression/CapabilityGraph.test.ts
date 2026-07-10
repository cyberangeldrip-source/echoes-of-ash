import { describe, expect, it } from 'vitest';
import { CapabilityGraph, discoveryId } from './CapabilityGraph';

describe('CapabilityGraph', () => {
  it('unlocks capabilities through discovery rather than experience points', () => {
    const graph = new CapabilityGraph();
    expect(graph.discover(discoveryId('driftwood-fiber'))).toEqual(['basic-shelter']);
    expect(graph.discover(discoveryId('fiber-knot'))).toEqual(['rope-climb']);
    expect(graph.has('rope-climb')).toBe(true);
  });

  it('requires an activated mechanism for ancient tooling', () => {
    const graph = new CapabilityGraph();
    for (const id of ['driftwood-fiber', 'ashback-hide', 'basalt-forge', 'alloy-ore', 'ancient-component']) graph.discover(discoveryId(id));
    expect(graph.has('ancient-tooling')).toBe(false);
    graph.discover(discoveryId('activated-mechanism'));
    expect(graph.has('ancient-tooling')).toBe(true);
  });
});
