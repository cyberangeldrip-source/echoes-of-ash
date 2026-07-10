import type { RendererBackend } from '../rendering/Renderer';
import type { Renderer } from '../rendering/Renderer';
import { createRenderer } from '../rendering/createRenderer';
import { VoxelWorld } from '../voxel/VoxelWorld';
import { ChunkCache } from '../../world/streaming/ChunkCache';
import { ChunkGenerationClient } from '../../world/streaming/ChunkGenerationClient';
import { ChunkStreamController } from '../../world/streaming/ChunkStreamController';
import { ChunkStreamingPolicy } from '../../world/streaming/ChunkStreamingPolicy';
import { WorldStreamRuntime } from '../../world/streaming/WorldStreamRuntime';

const MAX_DEVICE_PIXEL_RATIO = 2;
const STREAM_REQUEST_BUDGET = 2;
const REMESH_BUDGET = 3;
const STREAM_INTERVAL_SECONDS = 0.1;
const CHUNK_MEMORY_BUDGET_BYTES = 192 * 1024 * 1024;

export class GameRuntime {
  readonly #canvas: HTMLCanvasElement;
  readonly #world = new VoxelWorld();
  readonly #generation = new ChunkGenerationClient();
  readonly #streamRuntime: WorldStreamRuntime;
  readonly #focus = { position: { x: 0, y: 64, z: 0 }, velocity: { x: 0, y: 0, z: 0 } };
  #renderer: Renderer | null = null;
  #frameRequest = 0;
  #previousFrame = 0;
  #streamAccumulator = STREAM_INTERVAL_SECONDS;
  #streamUpdateRunning = false;

  public constructor(canvas: HTMLCanvasElement) {
    this.#canvas = canvas;
    const policy = new ChunkStreamingPolicy({ renderRadius: 5, prefetchMargin: 2, verticalRadius: 2, velocityLookaheadSeconds: 2.5 });
    const cache = new ChunkCache(CHUNK_MEMORY_BUDGET_BYTES);
    const stream = new ChunkStreamController('EMBER-0001', this.#generation, policy, cache);
    this.#streamRuntime = new WorldStreamRuntime(this.#world, stream);
  }

  public async start(): Promise<RendererBackend> {
    if (this.#renderer !== null) return this.#renderer.backend;
    this.#renderer = await createRenderer(this.#canvas);
    window.addEventListener('resize', this.#resize);
    this.#resize();
    this.#previousFrame = performance.now();
    await this.#updateStreaming();
    this.#frameRequest = requestAnimationFrame(this.#frame);
    return this.#renderer.backend;
  }

  public stop(): void {
    cancelAnimationFrame(this.#frameRequest);
    window.removeEventListener('resize', this.#resize);
    this.#generation.dispose();
    this.#renderer?.dispose();
    this.#renderer = null;
  }

  public setStreamingFocus(position: Readonly<{ x: number; y: number; z: number }>, velocity: Readonly<{ x: number; y: number; z: number }>): void {
    this.#focus.position.x = position.x;
    this.#focus.position.y = position.y;
    this.#focus.position.z = position.z;
    this.#focus.velocity.x = velocity.x;
    this.#focus.velocity.y = velocity.y;
    this.#focus.velocity.z = velocity.z;
  }

  readonly #resize = (): void => {
    this.#renderer?.resize(this.#canvas.clientWidth, this.#canvas.clientHeight, Math.min(window.devicePixelRatio, MAX_DEVICE_PIXEL_RATIO));
  };

  readonly #frame = (timestamp: number): void => {
    const frameSeconds = Math.min(0.25, Math.max(0, (timestamp - this.#previousFrame) / 1000));
    this.#previousFrame = timestamp;
    this.#streamAccumulator += frameSeconds;
    if (this.#streamAccumulator >= STREAM_INTERVAL_SECONDS && !this.#streamUpdateRunning) {
      this.#streamAccumulator = 0;
      void this.#updateStreaming();
    }
    this.#renderer?.render({ sky: [0.11, 0.105, 0.09, 1] });
    this.#frameRequest = requestAnimationFrame(this.#frame);
  };

  async #updateStreaming(): Promise<void> {
    this.#streamUpdateRunning = true;
    try {
      await this.#streamRuntime.update(this.#focus, STREAM_REQUEST_BUDGET, REMESH_BUDGET);
    } finally {
      this.#streamUpdateRunning = false;
    }
  }
}
