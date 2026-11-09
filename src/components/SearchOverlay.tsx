import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useScrollLock } from '@/hooks/useScrollLock';
import { listGenresInUse, queryCatalog, workPath } from '@/services/catalog';
import { genreLabel } from '@/data/genres';
import { readStoredJson, storageKeys, writeStoredJson } from '@/lib/storage';
import { logoMarkUrl } from '@/lib/assets';
import { Icon } from './Icon';
import { StatusBadge, TypeBadge } from './Badge';
import { EmptyState } from './EmptyState';

interface SearchOverlayProps {
  open: boolean;
  onClose: () => void;
}

function readRecent(): string[] {
  const stored = readStoredJson<unknown>(storageKeys.recentSearches);
  return Array.isArray(stored)
    ? stored.filter((item): item is string => typeof item === 'string').slice(0, 5)
    : [];
}

export function SearchOverlay({ open, onClose }: SearchOverlayProps) {
  const [value, setValue] = useState('');
  const [recent, setRecent] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const debouncedValue = useDebouncedValue(value, 200);
  const isTyping = value.trim() !== debouncedValue.trim();

  useScrollLock(open);

  useEffect(() => {
    if (!open) return;
    setRecent(readRecent());
    const timer = setTimeout(() => inputRef.current?.focus(), 60);
    return () => clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  const results = useMemo(() => {
    const query = debouncedValue.trim();
    if (!query) return [];
    return queryCatalog({ query, pageSize: 6 }).items;
  }, [debouncedValue]);

  const popularGenres = useMemo(() => listGenresInUse().slice(0, 6), []);
  const popularTitles = useMemo(() => queryCatalog({ sort: 'popular', pageSize: 4 }).items, []);

  const remember = (term: string) => {
    const clean = term.trim();
    if (!clean) return;
    const next = [clean, ...readRecent().filter((item) => item !== clean)].slice(0, 5);
    writeStoredJson(storageKeys.recentSearches, next);
    setRecent(next);
  };

  const goToSearch = (event?: FormEvent) => {
    event?.preventDefault();
    const term = value.trim();
    if (!term) return;
    remember(term);
    onClose();
    navigate(`/search?q=${encodeURIComponent(term)}`);
  };

  const clearRecent = () => {
    writeStoredJson(storageKeys.recentSearches, []);
    setRecent([]);
  };

  if (!open) return null;

  const trimmed = value.trim();

  return (
    <div
      className="search-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="quick-search-title"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="search-panel">
        <h2 id="quick-search-title" className="sr-only">
          البحث في MangaPlus
        </h2>
        <form className="search-panel__form" onSubmit={goToSearch} role="search">
          <Icon name="search" size={20} className="search-panel__icon" />
          <input
            ref={inputRef}
            type="search"
            className="search-panel__input"
            placeholder="ابحث باسم العمل أو المؤلف…"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            aria-label="ابحث في MangaPlus"
            autoComplete="off"
          />
          {trimmed ? (
            <button
              type="button"
              className="search-panel__clear"
              onClick={() => {
                setValue('');
                inputRef.current?.focus();
              }}
              aria-label="مسح البحث"
            >
              <Icon name="close" size={16} />
            </button>
          ) : null}
          <button type="button" className="search-panel__close" onClick={onClose} aria-label="إغلاق البحث">
            <span className="search-panel__esc" aria-hidden="true">
              Esc
            </span>
            <Icon name="close" size={18} />
          </button>
        </form>

        <div className="search-panel__body">
          {!trimmed ? (
            <>
              {recent.length > 0 ? (
                <section className="search-block" aria-labelledby="recent-title">
                  <div className="search-block__head">
                    <h3 id="recent-title">بحثك الأخير</h3>
                    <button type="button" className="link-button" onClick={clearRecent}>
                      مسح
                    </button>
                  </div>
                  <div className="search-chips">
                    {recent.map((term) => (
                      <button
                        key={term}
                        type="button"
                        className="search-chip"
                        onClick={() => setValue(term)}
                      >
                        <Icon name="clock" size={14} />
                        {term}
                      </button>
                    ))}
                  </div>
                </section>
              ) : null}

              <section className="search-block" aria-labelledby="genres-title">
                <div className="search-block__head">
                  <h3 id="genres-title">تصفح التصنيفات</h3>
                </div>
                <div className="search-chips">
                  {popularGenres.map((genre) => (
                    <Link
                      key={genre.id}
                      className="search-chip"
                      to={`/explore?genre=${genre.id}`}
                      onClick={onClose}
                    >
                      {genre.label}
                    </Link>
                  ))}
                </div>
              </section>

              <section className="search-block" aria-labelledby="popular-title">
                <div className="search-block__head">
                  <h3 id="popular-title">الأكثر قراءة</h3>
                  <Link className="link-button" to="/explore?sort=popular" onClick={onClose}>
                    عرض الكل
                  </Link>
                </div>
                <div className="search-quick-list">
                  {popularTitles.map((work, index) => (
                    <Link
                      key={work.id}
                      className="search-quick"
                      to={workPath(work.type, work.id)}
                      onClick={onClose}
                    >
                      <span className="search-quick__rank">{index + 1}</span>
                      <span className="search-quick__body">
                        <span className="search-quick__title">{work.title}</span>
                        <span className="search-quick__meta">
                          {work.genres.slice(0, 2).map(genreLabel).join(' · ')}
                        </span>
                      </span>
                      <Icon name="arrowLeft" size={16} />
                    </Link>
                  ))}
                </div>
              </section>
            </>
          ) : isTyping ? (
            <div className="search-loading" aria-busy="true" aria-label="جارٍ البحث">
              {Array.from({ length: 4 }, (_, index) => (
                <div className="search-loading__row" key={index}>
                  <span className="skeleton" style={{ width: 44, height: 60, borderRadius: 8 }} />
                  <span className="search-loading__lines">
                    <span className="skeleton" style={{ width: '45%', height: 14, borderRadius: 6 }} />
                    <span className="skeleton" style={{ width: '28%', height: 11, borderRadius: 6 }} />
                  </span>
                </div>
              ))}
            </div>
          ) : results.length > 0 ? (
            <section className="search-block" aria-labelledby="results-title">
              <div className="search-block__head">
                <h3 id="results-title">النتائج</h3>
                <button type="button" className="link-button" onClick={() => goToSearch()}>
                  كل النتائج
                </button>
              </div>
              <div className="search-results">
                {results.map((work) => (
                  <Link
                    key={work.id}
                    className="search-result"
                    to={workPath(work.type, work.id)}
                    onClick={() => {
                      remember(trimmed);
                      onClose();
                    }}
                  >
                    <span className="search-result__cover">
                      <img src={logoMarkUrl} alt="" width="18" height="18" loading="lazy" />
                    </span>
                    <span className="search-result__body">
                      <span className="search-result__title">{work.title}</span>
                      <span className="search-result__meta">
                        {work.genres.slice(0, 2).map(genreLabel).join(' · ')}
                      </span>
                    </span>
                    <span className="search-result__badges">
                      <TypeBadge type={work.type} />
                      <StatusBadge status={work.status} />
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          ) : (
            <EmptyState
              icon="search"
              compact
              title="لا نتائج مطابقة"
              description={`لم نعثر على نتائج لـ «${trimmed}». جرّب كلمة أخرى أو تصفّح التصنيفات.`}
              action={
                <Link className="btn btn--soft btn--sm" to={`/search?q=${encodeURIComponent(trimmed)}`} onClick={onClose}>
                  <span className="btn__label">فتح صفحة البحث</span>
                </Link>
              }
            />
          )}
        </div>

        <div className="search-panel__foot">
          <span>
            <kbd>Enter</kbd> لفتح البحث الكامل
          </span>
          <span>
            <kbd>Esc</kbd> للإغلاق
          </span>
        </div>
      </div>
    </div>
  );
}
