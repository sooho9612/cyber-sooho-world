/**
 * Lightweight in-memory board list cache (SWR-style).
 * Industry analogue: TanStack Query / SWR — show cache immediately,
 * revalidate in background; invalidate on mutations.
 */

export type BoardCacheEntry<T = unknown> = {
  items: T[];
  totalCount: number;
  fetchedAt: number;
};

/** Soft-fresh window: skip loading UI; still revalidate quietly */
export const BOARD_CACHE_STALE_MS = 60_000;

const store = new Map<string, BoardCacheEntry>();

export function makeBoardCacheKey(parts: {
  tableName: string;
  page: number;
  itemsPerPage: number;
  activeFilter: string | null;
  booleanFilterOn: boolean;
  sortId: string;
  /** Bumps cache when list projection changes (e.g. slim vs *) */
  listSelect?: string;
}): string {
  return [
    parts.tableName,
    `p=${parts.page}`,
    `n=${parts.itemsPerPage}`,
    `f=${parts.activeFilter ?? ''}`,
    `b=${parts.booleanFilterOn ? 1 : 0}`,
    `s=${parts.sortId}`,
    `sel=${parts.listSelect ?? '*'}`,
  ].join('|');
}

export function getBoardCache<T>(key: string): BoardCacheEntry<T> | undefined {
  return store.get(key) as BoardCacheEntry<T> | undefined;
}

export function setBoardCache<T>(key: string, entry: BoardCacheEntry<T>): void {
  store.set(key, entry as BoardCacheEntry);
}

/** Drop all pages/filters for a table after create/update/delete */
export function invalidateBoardTable(tableName: string): void {
  const prefix = `${tableName}|`;
  for (const key of store.keys()) {
    if (key.startsWith(prefix) || key === tableName) {
      store.delete(key);
    }
  }
}

export function isBoardCacheFresh(entry: BoardCacheEntry, now = Date.now()): boolean {
  return now - entry.fetchedAt < BOARD_CACHE_STALE_MS;
}
