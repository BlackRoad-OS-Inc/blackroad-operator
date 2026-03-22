/**
 * Collision Layer
 *
 * Determines which grid cells are blocked based on tileset metadata
 * item types.  Items of type "furniture", "electronics", "appliance",
 * and "wall" block character movement.  "floor" and "decoration"
 * types are walkable.
 *
 * Works alongside the existing `getBlockedTiles()` in layoutManager.ts
 * which uses furniture catalog width/height.  This module adds
 * metadata-aware collision that uses actual pixel bounds to calculate
 * grid occupancy for multi-tile items.
 */

import { TILE_SIZE } from '../types.js';
import type { TilesetItem, ItemType } from '../sprites/assetLoader.js';

/** Item types that block character movement. */
const BLOCKING_TYPES: ReadonlySet<ItemType> = new Set([
  'furniture',
  'electronics',
  'appliance',
  'wall',
]);

/** Item types that characters can walk through. */
const WALKABLE_TYPES: ReadonlySet<ItemType> = new Set([
  'floor',
  'decoration',
]);

/**
 * Check whether a tileset item type blocks character movement.
 */
export function isBlockingType(type: ItemType): boolean {
  return BLOCKING_TYPES.has(type);
}

/**
 * Check whether a tileset item type allows character movement.
 */
export function isWalkableType(type: ItemType): boolean {
  return WALKABLE_TYPES.has(type);
}

/**
 * Represents a placed metadata item in the office grid.
 * `col` and `row` are the top-left grid cell of the item.
 */
export interface PlacedMetadataItem {
  item: TilesetItem;
  col: number;
  row: number;
}

/**
 * Calculate which grid cells an item occupies given its placement
 * position and pixel bounds.  Rounds up so partial tiles are included.
 *
 * @returns Array of { col, row } grid cells the item covers.
 */
export function getItemOccupiedCells(
  item: TilesetItem,
  col: number,
  row: number,
): Array<{ col: number; row: number }> {
  const cols = Math.ceil(item.bounds.width / TILE_SIZE);
  const rows = Math.ceil(item.bounds.height / TILE_SIZE);
  const cells: Array<{ col: number; row: number }> = [];

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      cells.push({ col: col + c, row: row + r });
    }
  }
  return cells;
}

/**
 * Build a set of blocked tile keys ("col,row") from an array of
 * placed metadata items.  Only items with blocking types contribute.
 */
export function getMetadataBlockedTiles(
  placedItems: PlacedMetadataItem[],
): Set<string> {
  const blocked = new Set<string>();

  for (const placed of placedItems) {
    if (!isBlockingType(placed.item.type)) continue;

    const cells = getItemOccupiedCells(placed.item, placed.col, placed.row);
    for (const cell of cells) {
      blocked.add(`${cell.col},${cell.row}`);
    }
  }

  return blocked;
}

/**
 * Merge metadata-based blocked tiles with the existing layout's
 * blocked tiles set.  Returns a new combined set.
 */
export function mergeBlockedTiles(
  existingBlocked: Set<string>,
  metadataBlocked: Set<string>,
): Set<string> {
  const merged = new Set(existingBlocked);
  for (const key of metadataBlocked) {
    merged.add(key);
  }
  return merged;
}

/**
 * Validate that a placed item's position is grid-aligned.
 * Returns true if col and row are non-negative integers
 * (placement always snaps to the 16px grid).
 */
export function isPlacementGridAligned(col: number, row: number): boolean {
  return (
    Number.isInteger(col) && col >= 0 &&
    Number.isInteger(row) && row >= 0
  );
}

/**
 * Check whether placing an item at (col, row) would overlap with
 * any tiles in the given blocked set.
 */
export function wouldOverlap(
  item: TilesetItem,
  col: number,
  row: number,
  blocked: Set<string>,
): boolean {
  const cells = getItemOccupiedCells(item, col, row);
  return cells.some(cell => blocked.has(`${cell.col},${cell.row}`));
}
