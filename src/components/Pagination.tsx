import { Icon } from './Icon';
import { formatNumber } from '@/lib/format';

interface PaginationProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
  className?: string;
}

function pageList(page: number, totalPages: number): (number | 'gap')[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }
  const pages = new Set<number>([1, totalPages, page, page - 1, page + 1]);
  const sorted = [...pages].filter((value) => value >= 1 && value <= totalPages).sort((a, b) => a - b);
  const result: (number | 'gap')[] = [];
  sorted.forEach((value, index) => {
    if (index > 0 && value - (sorted[index - 1] ?? 0) > 1) result.push('gap');
    result.push(value);
  });
  return result;
}

export function Pagination({ page, totalPages, onChange, className = '' }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <nav className={`pagination ${className}`.trim()} aria-label="التنقل بين الصفحات">
      <button
        type="button"
        className="pagination__arrow"
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        aria-label="الصفحة السابقة"
      >
        <Icon name="chevronRight" size={18} />
      </button>

      <ul className="pagination__pages">
        {pageList(page, totalPages).map((item, index) =>
          item === 'gap' ? (
            <li key={`gap-${index}`} className="pagination__gap" aria-hidden="true">
              …
            </li>
          ) : (
            <li key={item}>
              <button
                type="button"
                className={`pagination__page ${item === page ? 'is-active' : ''}`.trim()}
                onClick={() => onChange(item)}
                aria-label={`الصفحة ${formatNumber(item)}`}
                aria-current={item === page ? 'page' : undefined}
              >
                {formatNumber(item)}
              </button>
            </li>
          ),
        )}
      </ul>

      <button
        type="button"
        className="pagination__arrow"
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages}
        aria-label="الصفحة التالية"
      >
        <Icon name="chevronLeft" size={18} />
      </button>
    </nav>
  );
}
