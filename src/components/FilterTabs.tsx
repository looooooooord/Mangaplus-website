import type { KeyboardEvent } from 'react';
import { formatNumber } from '@/lib/format';

export interface TabItem {
  value: string;
  label: string;
  count?: number;
}

interface FilterTabsProps {
  items: TabItem[];
  value: string;
  onChange: (value: string) => void;
  label: string;
  className?: string;
}

export function FilterTabs({ items, value, onChange, label, className = '' }: FilterTabsProps) {
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    const index = items.findIndex((item) => item.value === value);
    const direction = event.key === 'ArrowLeft' ? 1 : -1;
    const nextIndex = (index + direction + items.length) % items.length;
    const nextItem = items[nextIndex];
    if (nextItem) {
      onChange(nextItem.value);
      const button = event.currentTarget.querySelector<HTMLButtonElement>(
        `[data-value="${nextItem.value}"]`,
      );
      button?.focus();
    }
  };

  return (
    <div
      className={`filter-tabs ${className}`.trim()}
      role="tablist"
      aria-label={label}
      onKeyDown={onKeyDown}
    >
      {items.map((item) => {
        const selected = item.value === value;
        return (
          <button
            key={item.value}
            type="button"
            role="tab"
            data-value={item.value}
            aria-selected={selected}
            tabIndex={selected ? 0 : -1}
            className={`filter-tabs__tab ${selected ? 'is-active' : ''}`.trim()}
            onClick={() => onChange(item.value)}
          >
            <span>{item.label}</span>
            {typeof item.count === 'number' ? (
              <span className="filter-tabs__count">{formatNumber(item.count)}</span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
