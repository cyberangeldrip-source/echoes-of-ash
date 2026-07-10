import type { BlockPosition } from './BlockPosition';

export interface ScheduledCollapse {
  readonly executeAt: number;
  readonly blocks: readonly BlockPosition[];
}

export class CollapseScheduler {
  readonly #pending: ScheduledCollapse[] = [];

  public schedule(now: number, blocks: readonly BlockPosition[], delaySeconds: number): void {
    if (blocks.length === 0) return;
    if (delaySeconds < 0) throw new RangeError('Collapse delay cannot be negative.');
    this.#pending.push({ executeAt: now + delaySeconds, blocks: blocks.map(position => ({ ...position })) });
    this.#pending.sort((left, right) => left.executeAt - right.executeAt);
  }

  public drain(now: number, frameBudget: number): readonly ScheduledCollapse[] {
    if (!Number.isSafeInteger(frameBudget) || frameBudget < 1) throw new RangeError('Collapse frame budget must be a positive integer.');
    const ready: ScheduledCollapse[] = [];
    while (ready.length < frameBudget) {
      const next = this.#pending[0];
      if (next === undefined || next.executeAt > now) break;
      ready.push(next);
      this.#pending.shift();
    }
    return ready;
  }
}
