import { adjacentBlocks, blockKey } from './BlockPosition';
import type { BlockPosition } from './BlockPosition';

export type StabilityState = 'supported' | 'strained' | 'unsupported';

export interface StructuralBlock {
  readonly position: BlockPosition;
  readonly anchored: boolean;
  readonly strength: number;
}

export interface StabilityChange {
  readonly position: BlockPosition;
  readonly previous: StabilityState | null;
  readonly current: StabilityState | null;
  readonly supportDistance: number | null;
}

interface Node {
  readonly block: StructuralBlock;
  supportDistance: number | null;
  state: StabilityState;
}

const STRAIN_DISTANCE = 5;
const MAX_SUPPORT_DISTANCE = 9;

export class StabilityGraph {
  readonly #nodes = new Map<string, Node>();

  public add(block: StructuralBlock): readonly StabilityChange[] {
    if (!Number.isSafeInteger(block.position.x) || !Number.isSafeInteger(block.position.y) || !Number.isSafeInteger(block.position.z)) throw new Error('Block coordinates must be integers.');
    if (block.strength <= 0) throw new RangeError('Structural strength must be positive.');
    const key = blockKey(block.position);
    if (this.#nodes.has(key)) throw new Error(`Structural block already exists at ${key}.`);
    this.#nodes.set(key, { block, supportDistance: null, state: 'unsupported' });
    return this.#recalculateFrom(block.position);
  }

  public remove(position: BlockPosition): readonly StabilityChange[] {
    const key = blockKey(position);
    const removed = this.#nodes.get(key);
    if (removed === undefined) return [];
    const previous: StabilityChange = { position, previous: removed.state, current: null, supportDistance: null };
    this.#nodes.delete(key);
    return [previous, ...this.#recalculateFrom(position)];
  }

  public get(position: BlockPosition): Readonly<{ state: StabilityState; supportDistance: number | null }> | null {
    const node = this.#nodes.get(blockKey(position));
    return node === undefined ? null : { state: node.state, supportDistance: node.supportDistance };
  }

  public unsupportedComponents(): readonly (readonly BlockPosition[])[] {
    const visited = new Set<string>();
    const components: BlockPosition[][] = [];
    for (const [key, node] of this.#nodes) {
      if (node.state !== 'unsupported' || visited.has(key)) continue;
      const component: BlockPosition[] = [];
      const queue = [node.block.position];
      visited.add(key);
      while (queue.length > 0) {
        const position = queue.shift();
        if (position === undefined) break;
        component.push(position);
        for (const adjacent of adjacentBlocks(position)) {
          const adjacentKey = blockKey(adjacent);
          const candidate = this.#nodes.get(adjacentKey);
          if (candidate?.state === 'unsupported' && !visited.has(adjacentKey)) {
            visited.add(adjacentKey);
            queue.push(candidate.block.position);
          }
        }
      }
      components.push(component);
    }
    return components;
  }

  #recalculateFrom(origin: BlockPosition): readonly StabilityChange[] {
    const affected = this.#collectConnected(origin);
    const previous = new Map<string, { readonly state: StabilityState; readonly distance: number | null }>();
    for (const key of affected) {
      const node = this.#nodes.get(key);
      if (node !== undefined) {
        previous.set(key, { state: node.state, distance: node.supportDistance });
        node.supportDistance = null;
        node.state = 'unsupported';
      }
    }
    const queue: Node[] = [];
    for (const key of affected) {
      const node = this.#nodes.get(key);
      if (node?.block.anchored === true) {
        node.supportDistance = 0;
        node.state = 'supported';
        queue.push(node);
      }
    }
    while (queue.length > 0) {
      const source = queue.shift();
      if (source === undefined || source.supportDistance === null) break;
      for (const position of adjacentBlocks(source.block.position)) {
        const target = this.#nodes.get(blockKey(position));
        if (target === undefined) continue;
        const distance = source.supportDistance + 1 / Math.max(0.25, target.block.strength);
        if (distance > MAX_SUPPORT_DISTANCE || (target.supportDistance !== null && target.supportDistance <= distance)) continue;
        target.supportDistance = distance;
        target.state = distance >= STRAIN_DISTANCE ? 'strained' : 'supported';
        queue.push(target);
      }
    }
    const changes: StabilityChange[] = [];
    for (const key of affected) {
      const node = this.#nodes.get(key);
      if (node === undefined) continue;
      const before = previous.get(key);
      if (before?.state !== node.state || before.distance !== node.supportDistance) {
        changes.push({ position: node.block.position, previous: before?.state ?? null, current: node.state, supportDistance: node.supportDistance });
      }
    }
    return changes;
  }

  #collectConnected(origin: BlockPosition): Set<string> {
    const affected = new Set<string>();
    const queue = [origin, ...adjacentBlocks(origin)];
    while (queue.length > 0) {
      const position = queue.shift();
      if (position === undefined) break;
      const key = blockKey(position);
      if (affected.has(key)) continue;
      const node = this.#nodes.get(key);
      if (node === undefined) continue;
      affected.add(key);
      for (const adjacent of adjacentBlocks(node.block.position)) queue.push(adjacent);
    }
    return affected;
  }
}
