import { describe, expect, it } from 'vitest';
import { VoiceAllocator } from './VoiceAllocator';

describe('VoiceAllocator', () => {
  it('culls inaudible and low-priority voices without silence gaps in retained loops', () => {
    const allocator = new VoiceAllocator(2);
    const listener = { position: { x: 0, y: 0, z: 0 }, forward: { x: 0, y: 0, z: 1 } };
    const allocated = allocator.allocate(listener, [
      { id: 'steps', bus: 'player', position: { x: 1, y: 0, z: 0 }, basePriority: 1, maximumDistance: 20, looping: false },
      { id: 'wind', bus: 'ambience', position: { x: 2, y: 0, z: 0 }, basePriority: 0.8, maximumDistance: 30, looping: true },
      { id: 'distant-eel', bus: 'creature', position: { x: 80, y: 0, z: 0 }, basePriority: 1, maximumDistance: 20, looping: false },
      { id: 'ash', bus: 'weather', position: { x: 3, y: 0, z: 0 }, basePriority: 0.3, maximumDistance: 20, looping: true },
    ]);
    expect(allocated.map(value => value.voice.id)).toEqual(['steps', 'wind']);
  });
});
