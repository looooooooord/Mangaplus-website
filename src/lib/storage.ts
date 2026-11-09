export const storageKeys = {
  theme: 'mangaplus.theme',
  library: 'mangaplus.library.v1',
  recentSearches: 'mangaplus.recent-searches.v1',
  readerManga: 'mangaplus.reader.manga.v1',
  readerNovel: 'mangaplus.reader.novel.v1',
} as const;

export function readStoredJson<T>(key: string): T | null {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function writeStoredJson(key: string, value: unknown): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage can be unavailable (private mode or full quota); the UI keeps working.
  }
}

export function readStoredString(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function writeStoredString(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Ignore storage failures.
  }
}

export function removeStored(key: string): void {
  try {
    window.localStorage.removeItem(key);
  } catch {
    // Ignore storage failures.
  }
}
