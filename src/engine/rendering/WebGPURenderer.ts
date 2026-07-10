import type { FrameEnvironment, Renderer } from './Renderer';

export class WebGPURenderer implements Renderer {
  public readonly backend = 'webgpu' as const;
  readonly #canvas: HTMLCanvasElement;
  #device: GPUDevice | null = null;
  #context: GPUCanvasContext | null = null;

  public constructor(canvas: HTMLCanvasElement) {
    this.#canvas = canvas;
  }

  public async initialize(): Promise<void> {
    if (navigator.gpu === undefined) throw new Error('WebGPU is unavailable.');
    const adapter = await navigator.gpu.requestAdapter({ powerPreference: 'high-performance' });
    if (adapter === null) throw new Error('No compatible WebGPU adapter found.');
    const device = await adapter.requestDevice();
    const context = this.#canvas.getContext('webgpu');
    if (context === null) throw new Error('WebGPU canvas context is unavailable.');
    context.configure({ device, format: navigator.gpu.getPreferredCanvasFormat(), alphaMode: 'opaque' });
    this.#device = device;
    this.#context = context;
  }

  public resize(width: number, height: number, devicePixelRatio: number): void {
    this.#canvas.width = Math.max(1, Math.floor(width * devicePixelRatio));
    this.#canvas.height = Math.max(1, Math.floor(height * devicePixelRatio));
  }

  public render(environment: FrameEnvironment): void {
    const device = this.#requireDevice();
    const context = this.#requireContext();
    const [r, g, b, a] = environment.sky;
    const encoder = device.createCommandEncoder();
    const pass = encoder.beginRenderPass({
      colorAttachments: [{
        view: context.getCurrentTexture().createView(),
        clearValue: { r, g, b, a },
        loadOp: 'clear',
        storeOp: 'store',
      }],
    });
    pass.end();
    device.queue.submit([encoder.finish()]);
  }

  public dispose(): void {
    this.#context?.unconfigure();
    this.#device?.destroy();
    this.#context = null;
    this.#device = null;
  }

  #requireDevice(): GPUDevice {
    if (this.#device === null) throw new Error('WebGPU renderer is not initialized.');
    return this.#device;
  }

  #requireContext(): GPUCanvasContext {
    if (this.#context === null) throw new Error('WebGPU renderer is not initialized.');
    return this.#context;
  }
}
