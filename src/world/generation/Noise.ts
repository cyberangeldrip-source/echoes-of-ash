import { hashCoordinates, randomUnit } from './WorldSeed';

function fade(value: number): number {
  return value * value * value * (value * (value * 6 - 15) + 10);
}

function interpolate(start: number, end: number, amount: number): number {
  return start + (end - start) * amount;
}

export function valueNoise2D(seed: number, x: number, z: number): number {
  const x0 = Math.floor(x);
  const z0 = Math.floor(z);
  const tx = fade(x - x0);
  const tz = fade(z - z0);
  const north = interpolate(
    randomUnit(hashCoordinates(seed, x0, z0)),
    randomUnit(hashCoordinates(seed, x0 + 1, z0)),
    tx,
  );
  const south = interpolate(
    randomUnit(hashCoordinates(seed, x0, z0 + 1)),
    randomUnit(hashCoordinates(seed, x0 + 1, z0 + 1)),
    tx,
  );
  return interpolate(north, south, tz) * 2 - 1;
}

export function fractalNoise2D(seed: number, x: number, z: number, octaves: number): number {
  let value = 0;
  let amplitude = 1;
  let frequency = 1;
  let totalAmplitude = 0;
  for (let octave = 0; octave < octaves; octave += 1) {
    value += valueNoise2D(seed + octave * 1013, x * frequency, z * frequency) * amplitude;
    totalAmplitude += amplitude;
    amplitude *= 0.5;
    frequency *= 2;
  }
  return value / totalAmplitude;
}
