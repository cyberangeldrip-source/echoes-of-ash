export const SAVE_FORMAT_VERSION = 1;

export interface PlayerSaveState {
  readonly position: readonly [number, number, number];
  readonly yaw: number;
  readonly pitch: number;
  readonly vitality: number;
  readonly stamina: number;
}

export interface ChunkDiffRecord {
  readonly chunkKey: string;
  readonly revision: number;
  readonly changes: readonly (readonly [localIndex: number, voxel: number])[];
}

export interface WorldSave {
  readonly formatVersion: typeof SAVE_FORMAT_VERSION;
  readonly saveId: string;
  readonly seed: string;
  readonly committedAt: number;
  readonly worldTick: number;
  readonly player: PlayerSaveState;
  readonly chunkDiffs: readonly ChunkDiffRecord[];
  readonly mechanismStates: Readonly<Record<string, 'inactive' | 'partial' | 'active'>>;
  readonly discoveredFragments: readonly string[];
}

export interface SaveManifest {
  readonly saveId: string;
  readonly activeSlot: 'a' | 'b';
  readonly revision: number;
  readonly checksum: number;
}
