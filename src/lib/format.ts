const numberFormatter = new Intl.NumberFormat('ar-SA-u-nu-latn');

const compactFormatter = new Intl.NumberFormat('ar-SA-u-nu-latn', {
  notation: 'compact',
  maximumFractionDigits: 1,
});

const dateFormatter = new Intl.DateTimeFormat('ar-SA-u-nu-latn', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

const shortDateFormatter = new Intl.DateTimeFormat('ar-SA-u-nu-latn', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

const relativeFormatter = new Intl.RelativeTimeFormat('ar-SA-u-nu-latn', { numeric: 'auto' });

export function formatNumber(value: number): string {
  return numberFormatter.format(value);
}

export function formatCompact(value: number): string {
  return compactFormatter.format(value);
}

export function formatDate(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? '' : dateFormatter.format(date);
}

export function formatShortDate(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? '' : shortDateFormatter.format(date);
}

const day = 24 * 60 * 60 * 1000;

export function timeAgo(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const diff = date.getTime() - Date.now();
  const days = Math.round(diff / day);
  if (Math.abs(days) < 1) return 'اليوم';
  if (Math.abs(days) < 30) return relativeFormatter.format(days, 'day');
  if (Math.abs(days) < 365) return relativeFormatter.format(Math.round(days / 30), 'month');
  return relativeFormatter.format(Math.round(days / 365), 'year');
}

export function formatPercent(value: number): string {
  const clamped = Math.max(0, Math.min(100, Math.round(value)));
  return `${numberFormatter.format(clamped)}%`;
}

export function ratingLabel(value: number): string {
  return value.toFixed(1);
}

export function initials(name: string | null | undefined, fallback = 'M'): string {
  const clean = (name ?? '').trim();
  if (!clean) return fallback;
  const parts = clean.split(/\s+/).slice(0, 2);
  return parts.map((part) => part.charAt(0)).join('');
}
