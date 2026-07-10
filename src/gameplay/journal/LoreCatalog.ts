import { fragmentId } from './LoreTypes';
import type { FragmentId, LoreFragment } from './LoreTypes';

const FRAGMENTS: readonly LoreFragment[] = [
  { id: fragmentId('ledger-waterline'), kind: 'physical', title: 'Ledger Without Names', observation: 'The final entries record water levels, not people. Every column ends on the same night.', claims: [{ subject: 'terrace-settlement', relation: 'monitored', object: 'rising-water', confidence: 0.9 }], related: [fragmentId('drowned-marks')] },
  { id: fragmentId('drowned-marks'), kind: 'environmental', title: 'Tide Marks Above', observation: 'Salt stains climb higher than any storm could reach. The terraces drowned one level at a time.', claims: [{ subject: 'rising-water', relation: 'was', object: 'controlled-process', confidence: 0.7 }], related: [fragmentId('ledger-waterline'), fragmentId('channel-machine')] },
  { id: fragmentId('channel-machine'), kind: 'structural', title: 'The Sleeping Channel', observation: 'Stone gates beneath the terraces connect to a warm mechanism below the seabed.', claims: [{ subject: 'ancient-machine', relation: 'controlled', object: 'rising-water', confidence: 0.85 }], related: [fragmentId('drowned-marks')] },
  { id: fragmentId('animals-avoid-shadow'), kind: 'behavioral', title: 'The Uncrossed Shadow', observation: 'Ashback herds turn aside before the ruin shadow reaches them at dusk.', claims: [{ subject: 'wildlife', relation: 'remembers', object: 'ruin-danger', confidence: 0.75 }], related: [] },
];

export class LoreCatalog {
  readonly #fragments = new Map<FragmentId, LoreFragment>(FRAGMENTS.map(fragment => [fragment.id, fragment]));
  public get(id: FragmentId): LoreFragment { const fragment = this.#fragments.get(id); if (fragment === undefined) throw new Error(`Unknown lore fragment: ${id}`); return fragment; }
  public values(): readonly LoreFragment[] { return [...this.#fragments.values()]; }
}
