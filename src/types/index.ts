export type WorkType = 'manga' | 'novel';

export type WorkStatus = 'ongoing' | 'completed' | 'hiatus';

export type SortOption = 'latest' | 'popular' | 'rating' | 'title';

export type CatalogTypeFilter = WorkType | 'all';

export type CoverPattern = 'rays' | 'orbs' | 'grid' | 'waves' | 'diagonal';

export interface CoverTheme {
  from: string;
  to: string;
  accent: string;
  pattern: CoverPattern;
}

export interface Chapter {
  id: string;
  number: number;
  title: string;
  publishedAt: string;
}

export interface Work {
  id: string;
  type: WorkType;
  title: string;
  latinTitle: string;
  tagline: string;
  description: string;
  genres: string[];
  status: WorkStatus;
  author: string;
  artist?: string;
  rating: number;
  readers: number;
  year: number;
  createdAt: string;
  updatedAt: string;
  chapters: Chapter[];
  cover: CoverTheme;
  featured?: boolean;
}

export type GenreId =
  | 'action'
  | 'adventure'
  | 'fantasy'
  | 'romance'
  | 'drama'
  | 'comedy'
  | 'mystery'
  | 'horror'
  | 'scifi'
  | 'slice'
  | 'historical'
  | 'sports'
  | 'thriller'
  | 'isekai';

export interface Genre {
  id: GenreId;
  label: string;
}

export interface ReaderPage {
  id: string;
  uri: string;
  width: number;
  height: number;
}

export interface NovelChapter {
  chapterId: string;
  paragraphs: string[];
}

export interface ReadingProgress {
  workId: string;
  chapterId: string;
  chapterNumber: number;
  /** Percentage (0–100) of the current chapter that has been read. */
  percent: number;
  pageIndex?: number;
  totalPages?: number;
  updatedAt: string;
  completed: boolean;
}

export interface LibraryState {
  favorites: string[];
  follows: string[];
  progress: Record<string, ReadingProgress>;
}

export interface CatalogQuery {
  query?: string;
  type?: CatalogTypeFilter;
  genre?: GenreId | 'all';
  status?: WorkStatus | 'all';
  sort?: SortOption;
  page?: number;
  pageSize?: number;
}

export interface CatalogResult {
  items: Work[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface SearchSuggestion {
  works: Work[];
  genres: Genre[];
}
