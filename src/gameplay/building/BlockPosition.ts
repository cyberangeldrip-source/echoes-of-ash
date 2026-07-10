export interface BlockPosition {
  readonly x: number;
  readonly y: number;
  readonly z: number;
}

export function blockKey(position: BlockPosition): string {
  return `${position.x},${position.y},${position.z}`;
}

export function adjacentBlocks(position: BlockPosition): readonly BlockPosition[] {
  return [
    { x: position.x - 1, y: position.y, z: position.z },
    { x: position.x + 1, y: position.y, z: position.z },
    { x: position.x, y: position.y - 1, z: position.z },
    { x: position.x, y: position.y + 1, z: position.z },
    { x: position.x, y: position.y, z: position.z - 1 },
    { x: position.x, y: position.y, z: position.z + 1 },
  ];
}
