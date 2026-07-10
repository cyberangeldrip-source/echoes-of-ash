/// <reference lib="webworker" />
import { ChunkGenerator } from '../generation/ChunkGenerator';
import type { GenerationRequest, GenerationResponse } from '../generation/GenerationTypes';

const generators = new Map<string, ChunkGenerator>();

self.onmessage = (event: MessageEvent<GenerationRequest>): void => {
  const request = event.data;
  try {
    let generator = generators.get(request.seed);
    if (generator === undefined) {
      generator = new ChunkGenerator(request.seed);
      generators.set(request.seed, generator);
    }
    const generated = generator.generate(request.coordinate);
    const response: GenerationResponse = {
      type: 'generated',
      requestId: request.requestId,
      coordinate: generated.coordinate,
      voxels: generated.voxels.buffer,
      surfaceBiomes: generated.surfaceBiomes.buffer,
      checksum: generated.checksum,
    };
    self.postMessage(response, [response.voxels, response.surfaceBiomes]);
  } catch (error: unknown) {
    const response: GenerationResponse = {
      type: 'generation-error',
      requestId: request.requestId,
      message: error instanceof Error ? error.message : 'Unknown generation failure',
    };
    self.postMessage(response);
  }
};
