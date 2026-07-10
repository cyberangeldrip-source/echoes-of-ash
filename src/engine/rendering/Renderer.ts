export type RendererBackend = 'webgpu' | 'webgl2';

export interface FrameEnvironment {
  readonly sky: readonly [number, number, number, number];
}

export interface Renderer {
  readonly backend: RendererBackend;
  initialize(): Promise<void>;
  resize(width: number, height: number, devicePixelRatio: number): void;
  render(environment: FrameEnvironment): void;
  dispose(): void;
}
