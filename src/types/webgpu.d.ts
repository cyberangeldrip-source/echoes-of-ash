interface GPU {
  requestAdapter(options?: { powerPreference?: 'low-power' | 'high-performance' }): Promise<GPUAdapter | null>;
  getPreferredCanvasFormat(): string;
}
interface GPUAdapter { requestDevice(): Promise<GPUDevice>; }
interface GPUDevice {
  readonly queue: { submit(commands: readonly GPUCommandBuffer[]): void };
  createCommandEncoder(): GPUCommandEncoder;
  destroy(): void;
}
interface GPUCommandBuffer {}
interface GPUCommandEncoder {
  beginRenderPass(descriptor: { colorAttachments: readonly [{ view: GPUTextureView; clearValue: { r: number; g: number; b: number; a: number }; loadOp: 'clear'; storeOp: 'store' }] }): GPURenderPassEncoder;
  finish(): GPUCommandBuffer;
}
interface GPURenderPassEncoder { end(): void; }
interface GPUTexture { createView(): GPUTextureView; }
interface GPUTextureView {}
interface GPUCanvasContext {
  configure(configuration: { device: GPUDevice; format: string; alphaMode: 'opaque' }): void;
  getCurrentTexture(): GPUTexture;
  unconfigure(): void;
}
interface Navigator { readonly gpu?: GPU; }
interface HTMLCanvasElement { getContext(contextId: 'webgpu'): GPUCanvasContext | null; }
