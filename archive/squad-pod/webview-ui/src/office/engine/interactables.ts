/**
 * Interactable System
 *
 * Registry that maps tileset item IDs to character actions.
 * Provides lookup functions for finding interactable items near
 * characters and resolving interaction points.
 *
 * This is foundational infrastructure — the data structures and
 * lookups are ready, but full AI-driven interaction behavior
 * (e.g., characters autonomously going to brew coffee) is a
 * future enhancement.
 */

import type { TilesetInteractable, TilesetItem } from '../sprites/assetLoader.js';
import { TILE_SIZE } from '../types.js';
import { getItemOccupiedCells } from './collision.js';

// ── Types ─────────────────────────────────────────────────────────

export interface InteractableEntry {
  itemId: string;
  action: string;
  item: TilesetItem;
}

/** A placed interactable in the office grid. */
export interface PlacedInteractable {
  entry: InteractableEntry;
  col: number;
  row: number;
}

/** An interaction point adjacent to an interactable item. */
export interface InteractionPoint {
  interactable: PlacedInteractable;
  /** Grid cell where the character should stand to interact. */
  standCol: number;
  standRow: number;
}

// ── Registry ──────────────────────────────────────────────────────

export class InteractableRegistry {
  private entries = new Map<string, InteractableEntry>();

  /**
   * Build the registry from tileset metadata interactables and item definitions.
   */
  load(
    interactables: TilesetInteractable[],
    getItem: (id: string) => TilesetItem | undefined,
  ): void {
    this.entries.clear();
    for (const def of interactables) {
      const item = getItem(def.item_id);
      if (!item) continue;
      this.entries.set(def.item_id, {
        itemId: def.item_id,
        action: def.action,
        item,
      });
    }
  }

  /** Get an interactable entry by item ID. */
  get(itemId: string): InteractableEntry | undefined {
    return this.entries.get(itemId);
  }

  /** Check if an item ID is interactable. */
  has(itemId: string): boolean {
    return this.entries.has(itemId);
  }

  /** Get all registered interactable entries. */
  getAll(): InteractableEntry[] {
    return Array.from(this.entries.values());
  }

  /** Get entries filtered by action type. */
  getByAction(action: string): InteractableEntry[] {
    return this.getAll().filter(e => e.action === action);
  }

  /** Number of registered interactables. */
  get size(): number {
    return this.entries.size;
  }
}

// ── Spatial queries ───────────────────────────────────────────────

/**
 * Find all grid cells adjacent to a placed interactable where a
 * character could stand to interact.  Excludes cells occupied by
 * the item itself and cells outside the grid bounds.
 */
export function getInteractionPoints(
  placed: PlacedInteractable,
  gridCols: number,
  gridRows: number,
  blockedTiles: Set<string>,
): InteractionPoint[] {
  const occupied = new Set<string>();
  const cells = getItemOccupiedCells(placed.entry.item, placed.col, placed.row);
  for (const cell of cells) {
    occupied.add(`${cell.col},${cell.row}`);
  }

  const adjacent = new Set<string>();
  for (const cell of cells) {
    const neighbors = [
      { col: cell.col - 1, row: cell.row },
      { col: cell.col + 1, row: cell.row },
      { col: cell.col, row: cell.row - 1 },
      { col: cell.col, row: cell.row + 1 },
    ];
    for (const n of neighbors) {
      const key = `${n.col},${n.row}`;
      if (
        n.col >= 0 && n.col < gridCols &&
        n.row >= 0 && n.row < gridRows &&
        !occupied.has(key) &&
        !blockedTiles.has(key)
      ) {
        adjacent.add(key);
      }
    }
  }

  const points: InteractionPoint[] = [];
  for (const key of adjacent) {
    const [c, r] = key.split(',').map(Number);
    points.push({
      interactable: placed,
      standCol: c,
      standRow: r,
    });
  }
  return points;
}

/**
 * Check whether a character at (charCol, charRow) is adjacent to
 * any cell occupied by a placed interactable.
 */
export function isAdjacentToInteractable(
  charCol: number,
  charRow: number,
  placed: PlacedInteractable,
): boolean {
  const itemCols = Math.ceil(placed.entry.item.bounds.width / TILE_SIZE);
  const itemRows = Math.ceil(placed.entry.item.bounds.height / TILE_SIZE);

  for (let r = 0; r < itemRows; r++) {
    for (let c = 0; c < itemCols; c++) {
      const cellCol = placed.col + c;
      const cellRow = placed.row + r;
      const dist = Math.abs(charCol - cellCol) + Math.abs(charRow - cellRow);
      if (dist === 1) return true;
    }
  }
  return false;
}

/**
 * Find all placed interactables adjacent to a character's position.
 */
export function findNearbyInteractables(
  charCol: number,
  charRow: number,
  placedInteractables: PlacedInteractable[],
): PlacedInteractable[] {
  return placedInteractables.filter(p =>
    isAdjacentToInteractable(charCol, charRow, p),
  );
}

/**
 * Find the closest interaction point to a character among all
 * placed interactables.  Returns null if none are reachable.
 */
export function findClosestInteractionPoint(
  charCol: number,
  charRow: number,
  placedInteractables: PlacedInteractable[],
  gridCols: number,
  gridRows: number,
  blockedTiles: Set<string>,
): InteractionPoint | null {
  let closest: InteractionPoint | null = null;
  let bestDist = Infinity;

  for (const placed of placedInteractables) {
    const points = getInteractionPoints(placed, gridCols, gridRows, blockedTiles);
    for (const point of points) {
      const dist = Math.abs(charCol - point.standCol) + Math.abs(charRow - point.standRow);
      if (dist < bestDist) {
        bestDist = dist;
        closest = point;
      }
    }
  }

  return closest;
}
