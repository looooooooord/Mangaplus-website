import { works } from '@/data/works';
import { genres, genreLabel } from '@/data/genres';
import type {
  CatalogQuery,
  CatalogResult,
  Chapter,
  Genre,
  Work,
  WorkStatus,
  WorkType,
} from '@/types';

/**
 * Catalogue access layer. Pages and components only talk to this module, so a
 * real catalogue provider can be wired in later without touching the UI.
 */

export function normalizeArabic(input: string): string {
  return input
    .toLowerCase()
    .replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED]/g, '')
    .replace(/\u0640/g, '')
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/[ؤئ]/g, 'ء')
    .replace(/\s+/g, ' ')
    .trim();
}

const collator = new Intl.Collator('ar', { sensitivity: 'base' });

const statusOrder: WorkStatus[] = ['ongoing', 'completed', 'hiatus'];

function matchesQuery(work: Work, normalizedQuery: string): boolean {
  if (!normalizedQuery) return true;
  const genreText = work.genres.map(genreLabel).join(' ');
  const haystack = normalizeArabic(
    [work.title, work.latinTitle, work.author, work.tagline, work.description, genreText].join(' '),
  );
  const tokens = normalizedQuery.split(' ').filter(Boolean);
  return tokens.every((token) => haystack.includes(token));
}

function sortWorks(items: Work[], sort: CatalogQuery['sort']): Work[] {
  const sorted = [...items];
  switch (sort) {
    case 'popular':
      sorted.sort((a, b) => b.readers - a.readers);
      break;
    case 'rating':
      sorted.sort((a, b) => b.rating - a.rating || b.readers - a.readers);
      break;
    case 'title':
      sorted.sort((a, b) => collator.compare(a.title, b.title));
      break;
    case 'latest':
    default:
      sorted.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      break;
  }
  return sorted;
}

export function queryCatalog(query: CatalogQuery = {}): CatalogResult {
  const {
    query: rawQuery = '',
    type = 'all',
    genre = 'all',
    status = 'all',
    sort = 'latest',
    pageSize = 12,
  } = query;

  const normalizedQuery = normalizeArabic(rawQuery);
  const safePageSize = Math.max(1, Math.min(48, Math.floor(pageSize)));
  const requestedPage = Math.max(1, Math.floor(query.page ?? 1));

  let items = works.filter((work) => {
    if (type !== 'all' && work.type !== type) return false;
    if (genre !== 'all' && !work.genres.includes(genre)) return false;
    if (status !== 'all' && work.status !== status) return false;
    return matchesQuery(work, normalizedQuery);
  });

  items = sortWorks(items, sort);

  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / safePageSize));
  const page = Math.min(requestedPage, totalPages);
  const start = (page - 1) * safePageSize;

  return {
    items: items.slice(start, start + safePageSize),
    total,
    page,
    pageSize: safePageSize,
    totalPages,
  };
}

export function getWorkById(id: string, type?: WorkType): Work | null {
  const found = works.find((work) => work.id === id);
  if (!found) return null;
  if (type && found.type !== type) return null;
  return found;
}

export function getWorkStatuses(): WorkStatus[] {
  return statusOrder;
}

export function getGenres(): Genre[] {
  return genres;
}

export function listGenresInUse(): Genre[] {
  const used = new Set<string>();
  works.forEach((work) => work.genres.forEach((genre) => used.add(genre)));
  return genres.filter((genre) => used.has(genre.id));
}

export function getFeatured(limit = 6): Work[] {
  return [...works]
    .sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)) || b.rating - a.rating)
    .slice(0, limit);
}

export function getByType(type: WorkType, limit?: number): Work[] {
  const items = sortWorks(
    works.filter((work) => work.type === type),
    'latest',
  );
  return typeof limit === 'number' ? items.slice(0, limit) : items;
}

export function getLatestUpdated(limit = 6): Work[] {
  return sortWorks(works, 'latest').slice(0, limit);
}

export interface LatestChapterEntry {
  work: Work;
  chapter: Chapter;
}

export function getLatestChapters(limit = 6, type?: WorkType): LatestChapterEntry[] {
  return works
    .filter((work) => !type || work.type === type)
    .map((work) => ({ work, chapter: work.chapters[work.chapters.length - 1] }))
    .filter((entry): entry is LatestChapterEntry => Boolean(entry.chapter))
    .sort(
      (a, b) => new Date(b.chapter.publishedAt).getTime() - new Date(a.chapter.publishedAt).getTime(),
    )
    .slice(0, limit);
}

export function getRelated(work: Work, limit = 6): Work[] {
  const scored = works
    .filter((candidate) => candidate.id !== work.id)
    .map((candidate) => {
      const shared = candidate.genres.filter((genre) => work.genres.includes(genre)).length;
      const sameType = candidate.type === work.type ? 1 : 0;
      return { candidate, score: shared * 2 + sameType };
    })
    .filter((entry) => entry.score > 1)
    .sort((a, b) => b.score - a.score || b.candidate.rating - a.candidate.rating);

  const related = scored.slice(0, limit).map((entry) => entry.candidate);
  if (related.length >= limit) return related;

  const fillers = works
    .filter((candidate) => candidate.id !== work.id && !related.some((item) => item.id === candidate.id))
    .sort((a, b) => b.rating - a.rating)
    .slice(0, limit - related.length);

  return [...related, ...fillers];
}

export function getAdjacentChapters(work: Work, chapterId: string): {
  current: Chapter | null;
  previous: Chapter | null;
  next: Chapter | null;
  index: number;
} {
  const index = work.chapters.findIndex((chapter) => chapter.id === chapterId);
  if (index < 0) return { current: null, previous: null, next: null, index: -1 };
  return {
    current: work.chapters[index],
    previous: index > 0 ? work.chapters[index - 1] : null,
    next: index < work.chapters.length - 1 ? work.chapters[index + 1] : null,
    index,
  };
}

export function isLastChapter(work: Work, chapterId: string): boolean {
  return work.chapters[work.chapters.length - 1]?.id === chapterId;
}

export function readerPath(type: WorkType, workId: string, chapterId: string): string {
  return `/reader/${type}/${workId}/${chapterId}`;
}

export function workPath(type: WorkType, workId: string): string {
  return `/${type}/${workId}`;
}

