import type { FragmentId, JournalEntry } from './LoreTypes';
import type { LoreCatalog } from './LoreCatalog';

export class Journal {
  readonly #catalog: LoreCatalog;
  readonly #discovered = new Map<FragmentId, number>();

  public constructor(catalog: LoreCatalog) { this.#catalog = catalog; }

  public discover(id: FragmentId, worldTick: number): boolean {
    this.#catalog.get(id);
    if (this.#discovered.has(id)) return false;
    this.#discovered.set(id, worldTick);
    return true;
  }

  public entries(): readonly JournalEntry[] {
    return [...this.#discovered.entries()]
      .map(([id, tick]) => {
        const fragment = this.#catalog.get(id);
        return { fragment, discoveredAtTick: tick, connections: fragment.related.filter(related => this.#discovered.has(related)) };
      })
      .sort((left, right) => left.discoveredAtTick - right.discoveredAtTick || left.fragment.id.localeCompare(right.fragment.id));
  }

  public timeline(): readonly (readonly JournalEntry[])[] {
    const entries = this.entries();
    const adjacency = new Map<FragmentId, Set<FragmentId>>();
    for (const entry of entries) adjacency.set(entry.fragment.id, new Set(entry.connections));
    const visited = new Set<FragmentId>();
    const groups: JournalEntry[][] = [];
    for (const entry of entries) {
      if (visited.has(entry.fragment.id)) continue;
      const group: JournalEntry[] = [];
      const queue = [entry.fragment.id];
      visited.add(entry.fragment.id);
      while (queue.length > 0) {
        const current = queue.shift();
        if (current === undefined) break;
        const found = entries.find(candidate => candidate.fragment.id === current);
        if (found !== undefined) group.push(found);
        for (const related of adjacency.get(current) ?? []) if (!visited.has(related)) { visited.add(related); queue.push(related); }
      }
      groups.push(group);
    }
    return groups;
  }
}
