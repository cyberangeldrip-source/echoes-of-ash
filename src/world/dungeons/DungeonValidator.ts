import type { DungeonLayout, RoomId } from './DungeonTypes';

export interface DungeonValidation {
  readonly valid: boolean;
  readonly unreachableRequiredRooms: readonly RoomId[];
  readonly invalidConnections: number;
}

export function validateDungeon(layout: DungeonLayout): DungeonValidation {
  const rooms = new Map(layout.rooms.map(room => [room.id, room]));
  const entrance = layout.rooms.find(room => room.kind === 'entrance');
  if (entrance === undefined) return { valid: false, unreachableRequiredRooms: layout.rooms.filter(room => room.required).map(room => room.id), invalidConnections: 0 };
  const adjacency = new Map<RoomId, RoomId[]>();
  for (const room of layout.rooms) adjacency.set(room.id, []);
  let invalidConnections = 0;
  for (const connection of layout.connections) {
    if (!rooms.has(connection.from) || !rooms.has(connection.to) || connection.from === connection.to) { invalidConnections += 1; continue; }
    adjacency.get(connection.from)?.push(connection.to);
    adjacency.get(connection.to)?.push(connection.from);
  }
  const visited = new Set<RoomId>([entrance.id]);
  const queue: RoomId[] = [entrance.id];
  while (queue.length > 0) {
    const current = queue.shift();
    if (current === undefined) break;
    for (const neighbor of adjacency.get(current) ?? []) if (!visited.has(neighbor)) { visited.add(neighbor); queue.push(neighbor); }
  }
  const unreachableRequiredRooms = layout.rooms.filter(room => room.required && !visited.has(room.id)).map(room => room.id);
  return { valid: invalidConnections === 0 && unreachableRequiredRooms.length === 0, unreachableRequiredRooms, invalidConnections };
}
