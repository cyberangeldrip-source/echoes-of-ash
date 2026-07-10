import type { ChunkCoordinate } from '../../engine/voxel/VoxelTypes';
import type { GeneratedChunk, GenerationRequest, GenerationResponse } from '../generation/GenerationTypes';

interface PendingRequest {
  readonly resolve: (chunk: GeneratedChunk) => void;
  readonly reject: (reason: Error) => void;
}

export class ChunkGenerationClient {
  readonly #worker: Worker;
  readonly #pending = new Map<number, PendingRequest>();
  #nextRequestId = 1;

  public constructor() {
    this.#worker = new Worker(new URL('../workers/generation.worker.ts', import.meta.url), { type: 'module' });
    this.#worker.addEventListener('message', this.#handleMessage);
    this.#worker.addEventListener('error', this.#handleWorkerError);
  }

  public generate(seed: string, coordinate: ChunkCoordinate): Promise<GeneratedChunk> {
    const requestId = this.#nextRequestId;
    this.#nextRequestId += 1;
    const request: GenerationRequest = { requestId, seed, coordinate };
    return new Promise((resolve, reject) => {
      this.#pending.set(requestId, { resolve, reject });
      this.#worker.postMessage(request);
    });
  }

  public dispose(): void {
    this.#worker.terminate();
    const error = new Error('Chunk generation client disposed.');
    for (const request of this.#pending.values()) request.reject(error);
    this.#pending.clear();
  }

  readonly #handleMessage = (event: MessageEvent<GenerationResponse>): void => {
    const response = event.data;
    const pending = this.#pending.get(response.requestId);
    if (pending === undefined) return;
    this.#pending.delete(response.requestId);
    if (response.type === 'generation-error') {
      pending.reject(new Error(response.message));
      return;
    }
    pending.resolve({
      coordinate: response.coordinate,
      voxels: new Uint16Array(response.voxels),
      surfaceBiomes: new Uint8Array(response.surfaceBiomes),
      checksum: response.checksum,
    });
  };

  readonly #handleWorkerError = (event: ErrorEvent): void => {
    const error = new Error(event.message);
    for (const request of this.#pending.values()) request.reject(error);
    this.#pending.clear();
  };
}
