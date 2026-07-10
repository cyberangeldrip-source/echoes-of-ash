import type { RendererBackend } from '../rendering/Renderer';
import type { Renderer } from '../rendering/Renderer';
import { createRenderer } from '../rendering/createRenderer';
import { VoxelWorld } from '../voxel/VoxelWorld';

const MAX_DEVICE_PIXEL_RATIO = 2;

export class GameRuntime {
  readonly #canvas: HTMLCanvasElement;
  readonly #world = new VoxelWorld();
  #renderer: Renderer | null = null;
  #frameRequest = 0;

  public constructor(canvas: HTMLCanvasElement) {
    this.#canvas = canvas;
  }

  public async start(): Promise<RendererBackend> {
    if (this.#renderer !== null) return this.#renderer.backend;
    this.#renderer = await createRenderer(this.#canvas);
    this.#world.ensureChunk({ x: 0, y: 0, z: 0 });
    window.addEventListener('resize', this.#resize);
    this.#resize();
    this.#frameRequest = requestAnimationFrame(this.#frame);
    return this.#renderer.backend;
  }

  public stop(): void {
    cancelAnimationFrame(this.#frameRequest);
    window.removeEventListener('resize', this.#resize);
    this.#renderer?.dispose();
    this.#renderer = null;
  }

  readonly #resize = (): void => {
    this.#renderer?.resize(
      this.#canvas.clientWidth,
      this.#canvas.clientHeight,
      Math.min(window.devicePixelRatio, MAX_DEVICE_PIXEL_RATIO),
    );
  };

  readonly #frame = (): void => {
    this.#renderer?.render({ sky: [0.11, 0.105, 0.09, 1] });
    this.#frameRequest = requestAnimationFrame(this.#frame);
  };
}
