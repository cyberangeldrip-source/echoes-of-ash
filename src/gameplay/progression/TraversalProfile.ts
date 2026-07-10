import type { CapabilityId } from './CapabilityGraph';

export interface TraversalProfile { readonly climbHeight: number; readonly swimStaminaMultiplier: number; readonly ashDamageMultiplier: number; readonly gasDamageMultiplier: number; readonly darknessVisibility: number; }

export function traversalProfile(capabilities: ReadonlySet<CapabilityId>): TraversalProfile {
  return {
    climbHeight: capabilities.has('rope-climb') ? 12 : 2,
    swimStaminaMultiplier: capabilities.has('ancient-tooling') ? 0.65 : 1,
    ashDamageMultiplier: capabilities.has('cold-resistance') ? 0.72 : 1,
    gasDamageMultiplier: capabilities.has('gas-filter') ? 0 : 1,
    darknessVisibility: capabilities.has('windproof-light') ? 0.9 : 0.4,
  };
}
