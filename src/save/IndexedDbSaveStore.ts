import { saveChecksum } from './SaveChecksum';
import { migrateSave } from './SaveMigration';
import type { SaveManifest, WorldSave } from './SaveTypes';

const DATABASE_NAME = 'echoes-of-ash';
const DATABASE_VERSION = 1;
const PAYLOAD_STORE = 'payloads';
const MANIFEST_STORE = 'manifests';

type SaveSlot = 'a' | 'b';

interface StoredPayload {
  readonly key: string;
  readonly serialized: string;
  readonly checksum: number;
}

export class IndexedDbSaveStore {
  #database: IDBDatabase | null = null;

  public async open(): Promise<void> {
    if (this.#database !== null) return;
    this.#database = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
      request.onupgradeneeded = () => {
        const database = request.result;
        if (!database.objectStoreNames.contains(PAYLOAD_STORE)) database.createObjectStore(PAYLOAD_STORE, { keyPath: 'key' });
        if (!database.objectStoreNames.contains(MANIFEST_STORE)) database.createObjectStore(MANIFEST_STORE, { keyPath: 'saveId' });
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error ?? new Error('Failed to open save database.'));
    });
  }

  public async commit(save: WorldSave): Promise<void> {
    const database = this.#requireDatabase();
    const previous = await this.#readManifest(save.saveId);
    const slot: SaveSlot = previous?.activeSlot === 'a' ? 'b' : 'a';
    const serialized = JSON.stringify(save);
    const checksum = saveChecksum(serialized);
    const payload: StoredPayload = { key: this.#payloadKey(save.saveId, slot), serialized, checksum };
    await this.#transaction(database, 'readwrite', transaction => {
      transaction.objectStore(PAYLOAD_STORE).put(payload);
    });
    const verified = await this.#readPayload(save.saveId, slot);
    if (verified === null || verified.checksum !== checksum || saveChecksum(verified.serialized) !== checksum) {
      throw new Error('Save verification failed before atomic manifest swap.');
    }
    const manifest: SaveManifest = { saveId: save.saveId, activeSlot: slot, revision: (previous?.revision ?? 0) + 1, checksum };
    await this.#transaction(database, 'readwrite', transaction => {
      transaction.objectStore(MANIFEST_STORE).put(manifest);
    });
  }

  public async load(saveId: string): Promise<WorldSave | null> {
    const manifest = await this.#readManifest(saveId);
    if (manifest === null) return null;
    const active = await this.#readPayload(saveId, manifest.activeSlot);
    if (active !== null && active.checksum === manifest.checksum && saveChecksum(active.serialized) === active.checksum) {
      return migrateSave(JSON.parse(active.serialized) as unknown);
    }
    const fallbackSlot: SaveSlot = manifest.activeSlot === 'a' ? 'b' : 'a';
    const fallback = await this.#readPayload(saveId, fallbackSlot);
    if (fallback === null || saveChecksum(fallback.serialized) !== fallback.checksum) throw new Error('Both save slots are corrupt.');
    return migrateSave(JSON.parse(fallback.serialized) as unknown);
  }

  public close(): void { this.#database?.close(); this.#database = null; }

  async #readManifest(saveId: string): Promise<SaveManifest | null> {
    const result = await this.#request<SaveManifest | undefined>(this.#requireDatabase(), MANIFEST_STORE, saveId);
    return result ?? null;
  }

  async #readPayload(saveId: string, slot: SaveSlot): Promise<StoredPayload | null> {
    const result = await this.#request<StoredPayload | undefined>(this.#requireDatabase(), PAYLOAD_STORE, this.#payloadKey(saveId, slot));
    return result ?? null;
  }

  #request<T>(database: IDBDatabase, store: string, key: IDBValidKey): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const transaction = database.transaction(store, 'readonly');
      const request = transaction.objectStore(store).get(key);
      request.onsuccess = () => resolve(request.result as T);
      request.onerror = () => reject(request.error ?? new Error('Save read failed.'));
    });
  }

  #transaction(database: IDBDatabase, mode: IDBTransactionMode, operation: (transaction: IDBTransaction) => void): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const transaction = database.transaction([PAYLOAD_STORE, MANIFEST_STORE], mode);
      operation(transaction);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error ?? new Error('Save transaction failed.'));
      transaction.onabort = () => reject(transaction.error ?? new Error('Save transaction aborted.'));
    });
  }

  #payloadKey(saveId: string, slot: SaveSlot): string { return `${saveId}:${slot}`; }
  #requireDatabase(): IDBDatabase { if (this.#database === null) throw new Error('Save store is not open.'); return this.#database; }
}
