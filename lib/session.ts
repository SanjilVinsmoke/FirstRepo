/**
 * Lightweight session-based history (stored in a server-side in-memory map,
 * keyed by a cookie session ID).  Replace with DB rows for production.
 */
import type { HistoryEntry } from "@/types";

const HISTORY_LIMIT = 5;

// Map<sessionId, HistoryEntry[]>
const store = new Map<string, HistoryEntry[]>();

export function addHistoryEntry(sessionId: string, entry: HistoryEntry): void {
  const list = store.get(sessionId) ?? [];
  list.unshift(entry); // newest first
  if (list.length > HISTORY_LIMIT) list.length = HISTORY_LIMIT;
  store.set(sessionId, list);
}

export function getHistory(sessionId: string): HistoryEntry[] {
  return store.get(sessionId) ?? [];
}
