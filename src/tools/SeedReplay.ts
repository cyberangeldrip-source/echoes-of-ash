import type { ChunkCoordinate } from '../engine/voxel/VoxelTypes';

export interface ReplayFrame { readonly tick: number; readonly position: readonly [number, number, number]; readonly yaw: number; readonly actions: readonly string[]; }
export interface SeedReplayData { readonly formatVersion: 1; readonly seed: string; readonly initialChunks: readonly ChunkCoordinate[]; readonly frames: readonly ReplayFrame[]; }

export class SeedReplayRecorder {
  readonly #seed: string;
  readonly #initialChunks: readonly ChunkCoordinate[];
  readonly #frames: ReplayFrame[] = [];
  public constructor(seed: string, initialChunks: readonly ChunkCoordinate[]) { this.#seed = seed; this.#initialChunks = initialChunks.map(chunk => ({ ...chunk })); }
  public record(frame: ReplayFrame): void { const previous = this.#frames.at(-1); if (previous !== undefined && frame.tick <= previous.tick) throw new Error('Replay ticks must be strictly increasing.'); this.#frames.push({ ...frame, position: [...frame.position], actions: [...frame.actions] }); }
  public export(): SeedReplayData { return { formatVersion: 1, seed: this.#seed, initialChunks: this.#initialChunks.map(chunk => ({ ...chunk })), frames: this.#frames.map(frame => ({ ...frame, position: [...frame.position], actions: [...frame.actions] })) }; }
}

export function parseSeedReplay(serialized: string): SeedReplayData {
  const value: unknown = JSON.parse(serialized);
  if (typeof value !== 'object' || value === null) throw new Error('Replay is not an object.');
  const replay = value as Partial<SeedReplayData>;
  if (replay.formatVersion !== 1 || typeof replay.seed !== 'string' || !Array.isArray(replay.initialChunks) || !Array.isArray(replay.frames)) throw new Error('Invalid seed replay.');
  let previousTick = -1;
  for (const frame of replay.frames) { if (!Number.isSafeInteger(frame.tick) || frame.tick <= previousTick) throw new Error('Replay ticks are invalid.'); previousTick = frame.tick; }
  return replay as SeedReplayData;
}
