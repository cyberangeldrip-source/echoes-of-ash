import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  build: {
    target: 'es2022',
    sourcemap: true,
    assetsInlineLimit: 0,
    rollupOptions: {
      output: {
        manualChunks: {
          engine: ['src/engine/runtime/GameRuntime.ts'],
        },
      },
    },
  },
  worker: {
    format: 'es',
  },
});
