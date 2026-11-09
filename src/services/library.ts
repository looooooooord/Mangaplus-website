import type { LibraryState, ReadingProgress } from '@/types';
import { storageKeys } from '@/lib/storage';

export const LIBRARY_EVENT = 'mangaplus:library-changed';

export function emptyLibrary(): LibraryState {
  return { favorites: [], follows: [], progress: {} };
}

function uniqueStrings(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return Array.from(new Set(value.filter((item): item is string => typeof item === 'string' && item.length > 0)));
}

function sanitizeProgressEntry(value: unknown): ReadingProgress | null {
  if (typeof value !== 'object' || value === null) return null;
  const entry = value as Partial<ReadingProgress>;
  if (typeof entry.workId !== 'string' || typeof entry.chapterId !== 'string') return null;
  if (typeof entry.chapterNumber !== 'number' || !Number.isFinite(entry.chapterNumber)) return null;
  const percent = typeof entry.percent === 'number' && Number.isFinite(entry.percent)
    ? Math.min(100, Math.max(0, entry.percent))
    : 0;
  return {
    workId: entry.workId,
    chapterId: entry.chapterId,
    chapterNumber: entry.chapterNumber,
    percent,
    pageIndex: typeof entry.pageIndex === 'number' && entry.pageIndex >= 0 ? entry.pageIndex : undefined,
    totalPages: typeof entry.totalPages === 'number' && entry.totalPages > 0 ? entry.totalPages : undefined,
    updatedAt: typeof entry.updatedAt === 'string' ? entry.updatedAt : new Date().toISOString(),
    completed: Boolean(entry.completed),
  };
}

export function sanitizeLibrary(value: unknown): LibraryState {
  if (typeof value !== 'object' || value === null) return emptyLibrary();
  const input = value as Partial<LibraryState>;
  const progress: Record<string, ReadingProgress> = {};
  if (input.progress && typeof input.progress === 'object') {
    Object.values(input.progress).forEach((entry) => {
      const clean = sanitizeProgressEntry(entry);
      if (clean) progress[clean.workId] = clean;
    });
  }
  return {
    favorites: uniqueStrings(input.favorites),
    follows: uniqueStrings(input.follows),
    progress,
  };
}

export function readLibrary(): LibraryState {
  try {
    const raw = window.localStorage.getItem(storageKeys.library);
    if (!raw) return emptyLibrary();
    return sanitizeLibrary(JSON.parse(raw));
  } catch {
    return emptyLibrary();
  }
}

export function writeLibrary(state: LibraryState): void {
  try {
    window.localStorage.setItem(storageKeys.library, JSON.stringify(state));
  } catch {
    // Storage can be unavailable; the in-memory state still works for this session.
  }
  window.dispatchEvent(new CustomEvent(LIBRARY_EVENT));
}

export function updateLibrary(mutator: (state: LibraryState) => LibraryState): LibraryState {
  const next = sanitizeLibrary(mutator(readLibrary()));
  writeLibrary(next);
  return next;
}

export function subscribeLibrary(callback: () => void): () => void {
  const onStorage = (event: StorageEvent) => {
    if (event.key === storageKeys.library) callback();
  };
  window.addEventListener(LIBRARY_EVENT, callback);
  window.addEventListener('storage', onStorage);
  return () => {
    window.removeEventListener(LIBRARY_EVENT, callback);
    window.removeEventListener('storage', onStorage);
  };
}
