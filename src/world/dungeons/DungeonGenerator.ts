import { hashCoordinates } from '../generation/WorldSeed';
import { validateDungeon } from './DungeonValidator';
import { roomId } from './DungeonTypes';
import type { DungeonConnection, DungeonLayout, DungeonRoom, RoomKind } from './DungeonTypes';

const MAX_ATTEMPTS = 16;
const MIN_ROOMS = 9;
const ROOM_VARIANCE = 7;

export class DungeonGenerator {
  public generate(seed: number): DungeonLayout {
    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
      const layout = this.#attempt(hashCoordinates(seed, attempt, 0));
      if (validateDungeon(layout).valid) return layout;
    }
    throw new Error(`Failed to produce a connected dungeon after ${MAX_ATTEMPTS} attempts.`);
  }

  #attempt(seed: number): DungeonLayout {
    const roomCount = MIN_ROOMS + hashCoordinates(seed, 1, 0) % ROOM_VARIANCE;
    const rooms: DungeonRoom[] = [];
    const connections: DungeonConnection[] = [];
    rooms.push({ id: roomId('entrance'), kind: 'entrance', x: 0, depth: 0, required: true });
    for (let index = 1; index < roomCount; index += 1) {
      const kind = this.#roomKind(index, roomCount, seed);
      rooms.push({ id: roomId(`room-${index}`), kind, x: this.#signed(seed, index) * 3, depth: index * 4 + hashCoordinates(seed, index, 7) % 5, required: kind !== 'secret' });
      const parentIndex = hashCoordinates(seed, index, 19) % index;
      const parent = rooms[parentIndex];
      const current = rooms[index];
      if (parent !== undefined && current !== undefined) connections.push({ from: parent.id, to: current.id });
    }
    for (let index = 2; index < roomCount; index += 1) {
      if (hashCoordinates(seed, index, 31) % 4 !== 0) continue;
      const room = rooms[index];
      const previous = rooms[index - 2];
      if (room !== undefined && previous !== undefined) connections.push({ from: room.id, to: previous.id });
    }
    return { seed, rooms, connections: this.#deduplicate(connections) };
  }

  #roomKind(index: number, count: number, seed: number): RoomKind {
    if (index === count - 1) return 'boss';
    if (index === Math.floor(count * 0.55)) return 'mechanism';
    const roll = hashCoordinates(seed, index, 43) % 10;
    if (roll === 0) return 'secret';
    if (roll <= 2) return 'lore';
    return 'passage';
  }

  #signed(seed: number, index: number): number { return (hashCoordinates(seed, index, 71) % 9) - 4; }

  #deduplicate(connections: readonly DungeonConnection[]): readonly DungeonConnection[] {
    const found = new Set<string>();
    return connections.filter(connection => {
      const key = [connection.from, connection.to].sort().join(':');
      if (found.has(key)) return false;
      found.add(key);
      return true;
    });
  }
}
