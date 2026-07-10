import { SAVE_FORMAT_VERSION } from './SaveTypes';
import type { WorldSave } from './SaveTypes';

interface UnversionedValue { readonly formatVersion?: unknown; }

export function migrateSave(value: unknown): WorldSave {
  if (typeof value !== 'object' || value === null) throw new Error('Save payload is not an object.');
  const version = (value as UnversionedValue).formatVersion;
  if (version !== SAVE_FORMAT_VERSION) throw new Error(`Unsupported save format version: ${String(version)}.`);
  return validateCurrent(value);
}

function validateCurrent(value: object): WorldSave {
  const candidate = value as Partial<WorldSave>;
  if (candidate.formatVersion !== SAVE_FORMAT_VERSION) throw new Error('Invalid save version.');
  if (typeof candidate.saveId !== 'string' || candidate.saveId.length === 0) throw new Error('Invalid save identifier.');
  if (typeof candidate.seed !== 'string' || candidate.seed.length === 0) throw new Error('Invalid world seed.');
  if (typeof candidate.committedAt !== 'number' || !Number.isFinite(candidate.committedAt)) throw new Error('Invalid commit timestamp.');
  if (typeof candidate.worldTick !== 'number' || !Number.isSafeInteger(candidate.worldTick)) throw new Error('Invalid world tick.');
  if (candidate.player === undefined || !Array.isArray(candidate.player.position) || candidate.player.position.length !== 3) throw new Error('Invalid player state.');
  if (!Array.isArray(candidate.chunkDiffs)) throw new Error('Invalid chunk diffs.');
  if (candidate.mechanismStates === undefined || typeof candidate.mechanismStates !== 'object') throw new Error('Invalid mechanism states.');
  if (!Array.isArray(candidate.discoveredFragments)) throw new Error('Invalid journal state.');
  return candidate as WorldSave;
}
