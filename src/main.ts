import './styles.css';
import { GameRuntime } from './engine/runtime/GameRuntime';

const canvas = document.querySelector<HTMLCanvasElement>('#world');
const status = document.querySelector<HTMLElement>('#status');

if (canvas === null || status === null) {
  throw new Error('Required application elements are missing.');
}

const runtime = new GameRuntime(canvas);

runtime.start().then((backend) => {
  status.textContent = `${backend.toUpperCase()} ONLINE · AUTHORITATIVE WORLD READY`;
}).catch((error: unknown) => {
  const message = error instanceof Error ? error.message : 'Unknown startup failure';
  status.textContent = `STARTUP FAILED · ${message}`;
  console.error(error);
});
