import type { ActivityCycle } from './Species';

export function activityLevel(cycle: ActivityCycle, normalizedDay: number): number {
  const time = ((normalizedDay % 1) + 1) % 1;
  if (cycle === 'diurnal') return smoothWindow(time, 0.22, 0.78);
  if (cycle === 'nocturnal') return 1 - smoothWindow(time, 0.18, 0.82);
  const dawn = bell(time, 0.24, 0.09);
  const dusk = bell(time, 0.76, 0.09);
  return Math.min(1, dawn + dusk);
}

function smoothWindow(value: number, start: number, end: number): number {
  return smoothstep(start, start + 0.12, value) * (1 - smoothstep(end - 0.12, end, value));
}
function smoothstep(start: number, end: number, value: number): number {
  const t = Math.max(0, Math.min(1, (value - start) / (end - start)));
  return t * t * (3 - 2 * t);
}
function bell(value: number, center: number, width: number): number {
  const distance = Math.min(Math.abs(value - center), 1 - Math.abs(value - center));
  return Math.max(0, 1 - distance / width);
}
