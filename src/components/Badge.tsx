import type { ReactNode } from 'react';
import type { WorkStatus, WorkType } from '@/types';

export function statusLabel(status: WorkStatus): string {
  switch (status) {
    case 'completed':
      return 'مكتمل';
    case 'hiatus':
      return 'متوقف مؤقتاً';
    case 'ongoing':
    default:
      return 'مستمر';
  }
}

export function typeLabel(type: WorkType): string {
  return type === 'manga' ? 'مانجا' : 'رواية';
}

export function StatusBadge({ status }: { status: WorkStatus }) {
  return <span className={`badge badge--status badge--${status}`}>{statusLabel(status)}</span>;
}

export function TypeBadge({ type }: { type: WorkType }) {
  return (
    <span className={`badge badge--type badge--${type}`}>
      {type === 'manga' ? 'مانجا' : 'رواية'}
    </span>
  );
}

export function Badge({
  children,
  tone = 'neutral',
  className = '',
}: {
  children: ReactNode;
  tone?: 'neutral' | 'brand' | 'success' | 'warning' | 'danger' | 'gold' | 'dev';
  className?: string;
}) {
  return <span className={`badge badge--${tone} ${className}`.trim()}>{children}</span>;
}
