import type { LoreFragment } from './LoreTypes';

export interface LoreConflict {
  readonly subject: string;
  readonly relation: string;
  readonly objects: readonly string[];
  readonly fragments: readonly string[];
}

export function validateLoreConsistency(fragments: readonly LoreFragment[]): readonly LoreConflict[] {
  const claims = new Map<string, Map<string, Set<string>>>();
  for (const fragment of fragments) {
    for (const claim of fragment.claims) {
      if (claim.confidence < 0.8) continue;
      const key = `${claim.subject}:${claim.relation}`;
      const objects = claims.get(key) ?? new Map<string, Set<string>>();
      const sources = objects.get(claim.object) ?? new Set<string>();
      sources.add(fragment.id);
      objects.set(claim.object, sources);
      claims.set(key, objects);
    }
  }
  const conflicts: LoreConflict[] = [];
  for (const [key, objects] of claims) {
    if (objects.size < 2) continue;
    const separator = key.indexOf(':');
    conflicts.push({ subject: key.slice(0, separator), relation: key.slice(separator + 1), objects: [...objects.keys()], fragments: [...objects.values()].flatMap(sources => [...sources]) });
  }
  return conflicts;
}
