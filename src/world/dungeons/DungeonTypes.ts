export type RoomId = string & { readonly __roomId: unique symbol };
export function roomId(value: string): RoomId { return value as RoomId; }

export type RoomKind = 'entrance' | 'passage' | 'mechanism' | 'lore' | 'boss' | 'secret';

export interface DungeonRoom {
  readonly id: RoomId;
  readonly kind: RoomKind;
  readonly x: number;
  readonly depth: number;
  readonly required: boolean;
}

export interface DungeonConnection {
  readonly from: RoomId;
  readonly to: RoomId;
}

export interface DungeonLayout {
  readonly seed: number;
  readonly rooms: readonly DungeonRoom[];
  readonly connections: readonly DungeonConnection[];
}
