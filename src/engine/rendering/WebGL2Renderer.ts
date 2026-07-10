import type { FrameEnvironment, Renderer } from './Renderer';

export class WebGL2Renderer implements Renderer {
  public readonly backend = 'webgl2' as const;
  readonly #canvas: HTMLCanvasElement;
  #context: WebGL2RenderingContext | null = null;

  public constructor(canvas: HTMLCanvasElement) {
    this.#canvas = canvas;
  }

  public async initialize(): Promise<void> {
    const context = this.#canvas.getContext('webgl2', {
      antialias: true,
      alpha: false,
      depth: true,
      powerPreference: 'high-performance',
    });
    if (context === null) throw new Error('WebGL2 is unavailable.');
    this.#context = context;
  }

  public resize(width: number, height: number, devicePixelRatio: number): void {
    const pixelWidth = Math.max(1, Math.floor(width * devicePixelRatio));
    const pixelHeight = Math.max(1, Math.floor(height * devicePixelRatio));
    if (this.#canvas.width !== pixelWidth) this.#canvas.width = pixelWidth;
    if (this.#canvas.height !== pixelHeight) this.#canvas.height = pixelHeight;
    this.#requireContext().viewport(0, 0, pixelWidth, pixelHeight);
  }

  public render(environment: FrameEnvironment): void {
    const gl = this.#requireContext();
    const [red, green, blue, alpha] = environment.sky;
    gl.clearColor(red, green, blue, alpha);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  }

  public dispose(): void {
    const extension = this.#context?.getExtension('WEBGL_lose_context');
    extension?.loseContext();
    this.#context = null;
  }

  #requireContext(): WebGL2RenderingContext {
    if (this.#context === null) throw new Error('WebGL2 renderer is not initialized.');
    return this.#context;
  }
}
