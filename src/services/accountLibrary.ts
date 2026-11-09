import type { ReadingProgress } from '@/types';

/**
 * Integration point for the account library that already belongs to the
 * MangaPlus app (favourites, follows and reading progress).
 *
 * The website does not create a second account store and does not pretend that
 * account data is synchronised. When the existing service exposes a web-safe
 * read/write API, register a provider here; the library screens and readers will
 * use it through the same functions they already call.
 */
export interface AccountLibrarySnapshot {
  favorites: string[];
  follows: string[];
  progress: ReadingProgress[];
}

export interface AccountLibraryProvider {
  /** Identifier of the existing service, kept for diagnostics. */
  id: string;
  loadLibrary(): Promise<AccountLibrarySnapshot>;
  saveProgress?(progress: ReadingProgress): Promise<void>;
  setFavorite?(workId: string, favorite: boolean): Promise<void>;
  setFollow?(workId: string, following: boolean): Promise<void>;
}

let provider: AccountLibraryProvider | null = null;

export function registerAccountLibraryProvider(next: AccountLibraryProvider | null): void {
  provider = next;
}

export function getAccountLibraryProvider(): AccountLibraryProvider | null {
  return provider;
}

export function isAccountLibraryConnected(): boolean {
  return provider !== null;
}
