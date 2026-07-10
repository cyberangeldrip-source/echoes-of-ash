import type { RendererBackend } from '../rendering/Renderer';
import type { Renderer } from '../rendering/Renderer';
import { createRenderer } from '../rendering/createRenderer';
import { VoxelWorld } from '../voxel/VoxelWorld';
import { ChunkCache } from '../../world/streaming/ChunkCache';
import { ChunkGenerationClient } from '../../world/streaming/ChunkGenerationClient';
import { ChunkStreamController } from '../../world/streaming/ChunkStreamController';
import { ChunkStreamingPolicy } from '../../world/streaming/ChunkStreamingPolicy';
import type { StreamingFocus } from '../../world/streaming/ChunkStreamingPolicy';

const MAX_DEVICE_PIXEL_RATIO = 2;
const CHUNK_CACHE_BUDGET_BYTES = 256 * 1024 * 1024;
const CHUNK_REQUESTS_PER_FRAME = 2;
const DEFAULT_WORLD_SEED = 'EMBER-0001';

export class GameRuntime {
  readonly #canvas: HTMLCanvasElement;
  readonly #world = new VoxelWorld();
  readonly #generator = new ChunkGenerationClient();
  readonly #cache = new ChunkCache(CHUNK_CACHE_BUDGET_BYTES);
  readonly #streaming = new ChunkStreamController(
    DEFAULT_WORLD_SEED,
    this.#generator,
    new ChunkStreamingPolicy({ renderRadius: 5, prefetchMargin: 2, verticalRadius: 2, velocityLookaheadSeconds: 2.5 }),
    this.#cache,
    this.#world,
  );
  #focus: StreamingFocus = { position: { x: 0, y: 64, z: 0 }, velocity: { x: 0, y: 0, z: 0 } };
  #renderer: Renderer | null = null;
  #frameRequest = 0;
  #disposed = false;

  public constructor(canvas: HTMLCanvasElement) { this.#canvas = canvas; }

  public async start(): Promise<RendererBackend> {
    if (this.#disposed) throw new Error('A disposed game runtime cannot restart.');
    if (this.#renderer !== null) return this.#renderer.backend;
    this.#renderer = await createRenderer(this.#canvas);
    window.addEventListener('resize', this.#resize);
    this.#resize();
    this.#streaming.update(this.#focus, CHUNK_REQUESTS_PER_FRAME);
    this.#frameRequest = requestAnimationFrame(this.#frame);
    return this.#renderer.backend;
  }

  public setStreamingFocus(focus: StreamingFocus): void {
    this.#focus = {
      position: { ...focus.position },
      velocity: { ...focus.velocity },
    };
  }

  public stop(): void {
    if (this.#disposed) return;
    this.#disposed = true;
    cancelAnimationFrame(this.#frameRequest);
    window.removeEventListener('resize', this.#resize);
    this.#renderer?.dispose();
    this.#renderer = null;
    this.#generator.dispose();
    for (const coordinate of this.#world.loadedCoordinates()) this.#world.unloadChunk(coordinate);
  }

  readonly #resize = (): void => {
    this.#renderer?.resize(this.#canvas.clientWidth, this.#canvas.clientHeight, Math.min(window.devicePixelRatio, MAX_DEVICE_PIXEL_RATIO));
  };

  readonly #frame = (): void => {
    this.#streaming.update(this.#focus, CHUNK_REQUESTS_PER_FRAME);
    this.#renderer?.render({ sky: [0.11, 0.105, 0.09, 1] });
    this.#frameRequest = requestAnimationFrame(this.#frame);
  };
}
