import type { Renderer } from './Renderer';
import { WebGL2Renderer } from './WebGL2Renderer';
import { WebGPURenderer } from './WebGPURenderer';

export async function createRenderer(canvas: HTMLCanvasElement): Promise<Renderer> {
  if (navigator.gpu !== undefined) {
    const webGpu = new WebGPURenderer(canvas);
    try {
      await webGpu.initialize();
      return webGpu;
    } catch (error: unknown) {
      console.warn('WebGPU initialization failed, falling back to WebGL2.', error);
      webGpu.dispose();
    }
  }

  const webGl2 = new WebGL2Renderer(canvas);
  await webGl2.initialize();
  return webGl2;
}
