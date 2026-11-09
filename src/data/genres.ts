import type { Genre, GenreId } from '@/types';

export const genres: Genre[] = [
  { id: 'action', label: 'أكشن' },
  { id: 'adventure', label: 'مغامرة' },
  { id: 'fantasy', label: 'فانتازيا' },
  { id: 'romance', label: 'رومانسية' },
  { id: 'drama', label: 'دراما' },
  { id: 'comedy', label: 'كوميديا' },
  { id: 'mystery', label: 'غموض' },
  { id: 'horror', label: 'رعب' },
  { id: 'scifi', label: 'خيال علمي' },
  { id: 'slice', label: 'شريحة من الحياة' },
  { id: 'historical', label: 'تاريخي' },
  { id: 'sports', label: 'رياضة' },
  { id: 'thriller', label: 'إثارة' },
  { id: 'isekai', label: 'عوالم أخرى' },
];

const genreLabels = new Map<string, string>(genres.map((genre) => [genre.id, genre.label]));

export function genreLabel(id: string): string {
  return genreLabels.get(id) ?? id;
}

export function isGenreId(value: string): value is GenreId {
  return genreLabels.has(value);
}
