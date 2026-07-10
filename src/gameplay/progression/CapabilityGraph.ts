export type CapabilityId = 'basic-shelter' | 'rope-climb' | 'cold-resistance' | 'forge-metal' | 'reinforced-building' | 'windproof-light' | 'gas-filter' | 'ancient-tooling' | 'automation' | 'deep-mechanism-access';
export type DiscoveryId = string & { readonly __discoveryId: unique symbol };
export function discoveryId(value: string): DiscoveryId { return value as DiscoveryId; }

export interface CapabilityNode { readonly capability: CapabilityId; readonly requiresDiscoveries: readonly DiscoveryId[]; readonly requiresCapabilities: readonly CapabilityId[]; }

const NODES: readonly CapabilityNode[] = [
  { capability: 'basic-shelter', requiresDiscoveries: [discoveryId('driftwood-fiber')], requiresCapabilities: [] },
  { capability: 'rope-climb', requiresDiscoveries: [discoveryId('fiber-knot')], requiresCapabilities: ['basic-shelter'] },
  { capability: 'cold-resistance', requiresDiscoveries: [discoveryId('ashback-hide')], requiresCapabilities: ['basic-shelter'] },
  { capability: 'forge-metal', requiresDiscoveries: [discoveryId('basalt-forge'), discoveryId('alloy-ore')], requiresCapabilities: ['cold-resistance'] },
  { capability: 'reinforced-building', requiresDiscoveries: [discoveryId('forged-alloy')], requiresCapabilities: ['forge-metal'] },
  { capability: 'windproof-light', requiresDiscoveries: [discoveryId('glow-spore'), discoveryId('marsh-lantern-ruin')], requiresCapabilities: ['forge-metal'] },
  { capability: 'gas-filter', requiresDiscoveries: [discoveryId('glow-spore'), discoveryId('filter-shell')], requiresCapabilities: ['windproof-light'] },
  { capability: 'ancient-tooling', requiresDiscoveries: [discoveryId('ancient-component'), discoveryId('activated-mechanism')], requiresCapabilities: ['forge-metal'] },
  { capability: 'automation', requiresDiscoveries: [discoveryId('motion-core')], requiresCapabilities: ['ancient-tooling', 'reinforced-building'] },
  { capability: 'deep-mechanism-access', requiresDiscoveries: [discoveryId('resonance-pattern')], requiresCapabilities: ['ancient-tooling'] },
];

export class CapabilityGraph {
  readonly #discoveries = new Set<DiscoveryId>();
  readonly #capabilities = new Set<CapabilityId>();

  public discover(id: DiscoveryId): readonly CapabilityId[] { this.#discoveries.add(id); return this.#resolve(); }
  public has(capability: CapabilityId): boolean { return this.#capabilities.has(capability); }
  public unlocked(): readonly CapabilityId[] { return [...this.#capabilities]; }

  #resolve(): readonly CapabilityId[] {
    const unlocked: CapabilityId[] = [];
    let changed = true;
    while (changed) {
      changed = false;
      for (const node of NODES) {
        if (this.#capabilities.has(node.capability)) continue;
        if (!node.requiresDiscoveries.every(id => this.#discoveries.has(id))) continue;
        if (!node.requiresCapabilities.every(capability => this.#capabilities.has(capability))) continue;
        this.#capabilities.add(node.capability); unlocked.push(node.capability); changed = true;
      }
    }
    return unlocked;
  }
}
