import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { LibraryState, ReadingProgress } from '@/types';
import { getWorkById, isLastChapter } from '@/services/catalog';
import { getAccountLibraryProvider, isAccountLibraryConnected } from '@/services/accountLibrary';
import { readLibrary, subscribeLibrary, updateLibrary } from '@/services/library';

export interface ProgressInput {
  workId: string;
  chapterId: string;
  chapterNumber: number;
  percent: number;
  pageIndex?: number;
  totalPages?: number;
}

interface LibraryContextValue {
  state: LibraryState;
  isFavorite: (workId: string) => boolean;
  isFollowing: (workId: string) => boolean;
  toggleFavorite: (workId: string) => boolean;
  toggleFollow: (workId: string) => boolean;
  recordProgress: (input: ProgressInput) => void;
  clearProgress: (workId: string) => void;
  clearLibrary: () => void;
  accountSyncConnected: boolean;
}

const LibraryContext = createContext<LibraryContextValue | null>(null);

export function LibraryProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<LibraryState>(() => readLibrary());

  useEffect(() => subscribeLibrary(() => setState(readLibrary())), []);

  const isFavorite = useCallback((workId: string) => state.favorites.includes(workId), [state.favorites]);
  const isFollowing = useCallback((workId: string) => state.follows.includes(workId), [state.follows]);

  const toggleFavorite = useCallback(
    (workId: string) => {
      const nextFavorite = !readLibrary().favorites.includes(workId);
      setState(
        updateLibrary((current) => ({
          ...current,
          favorites: nextFavorite
            ? [workId, ...current.favorites.filter((id) => id !== workId)]
            : current.favorites.filter((id) => id !== workId),
        })),
      );
      getAccountLibraryProvider()
        ?.setFavorite?.(workId, nextFavorite)
        .catch(() => undefined);
      return nextFavorite;
    },
    [],
  );

  const toggleFollow = useCallback(
    (workId: string) => {
      const nextFollowing = !readLibrary().follows.includes(workId);
      setState(
        updateLibrary((current) => ({
          ...current,
          follows: nextFollowing
            ? [workId, ...current.follows.filter((id) => id !== workId)]
            : current.follows.filter((id) => id !== workId),
        })),
      );
      getAccountLibraryProvider()
        ?.setFollow?.(workId, nextFollowing)
        .catch(() => undefined);
      return nextFollowing;
    },
    [],
  );

  const recordProgress = useCallback(
    ({ workId, chapterId, chapterNumber, percent, pageIndex, totalPages }: ProgressInput) => {
      const work = getWorkById(workId);
      const safePercent = Math.max(0, Math.min(100, percent));
      const finished = work ? isLastChapter(work, chapterId) && safePercent >= 98 : false;
      const entry: ReadingProgress = {
        workId,
        chapterId,
        chapterNumber,
        percent: safePercent,
        pageIndex,
        totalPages,
        updatedAt: new Date().toISOString(),
        completed: finished,
      };

      setState(
        updateLibrary((current) => {
          const previous = current.progress[workId];
          return {
            ...current,
            progress: {
              ...current.progress,
              [workId]: {
                ...entry,
                completed: entry.completed || Boolean(previous?.completed),
              },
            },
          };
        }),
      );

      getAccountLibraryProvider()
        ?.saveProgress?.(entry)
        .catch(() => undefined);
    },
    [],
  );

  const clearProgress = useCallback((workId: string) => {
    setState(
      updateLibrary((current) => {
        const next = { ...current.progress };
        delete next[workId];
        return { ...current, progress: next };
      }),
    );
  }, []);

  const clearLibrary = useCallback(() => {
    setState(
      updateLibrary(() => ({ favorites: [], follows: [], progress: {} })),
    );
  }, []);

  const value = useMemo<LibraryContextValue>(
    () => ({
      state,
      isFavorite,
      isFollowing,
      toggleFavorite,
      toggleFollow,
      recordProgress,
      clearProgress,
      clearLibrary,
      accountSyncConnected: isAccountLibraryConnected(),
    }),
    [
      state,
      isFavorite,
      isFollowing,
      toggleFavorite,
      toggleFollow,
      recordProgress,
      clearProgress,
      clearLibrary,
    ],
  );

  return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>;
}

export function useLibrary(): LibraryContextValue {
  const context = useContext(LibraryContext);
  if (!context) throw new Error('useLibrary must be used inside LibraryProvider');
  return context;
}
