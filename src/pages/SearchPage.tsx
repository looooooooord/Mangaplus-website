import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { usePageMeta } from '@/hooks/usePageMeta';
import { readStoredJson, storageKeys, writeStoredJson } from '@/lib/storage';
import { formatNumber } from '@/lib/format';
import { listGenresInUse, queryCatalog } from '@/services/catalog';
import { genreLabel } from '@/data/genres';
import type { CatalogTypeFilter } from '@/types';
import { Button } from '@/components/Button';
import { EmptyState } from '@/components/EmptyState';
import { FavoriteButton } from '@/components/FavoriteButton';
import { FilterTabs } from '@/components/FilterTabs';
import { Icon } from '@/components/Icon';
import { WorkRow } from '@/components/WorkRow';
import { WorkRowSkeleton } from '@/components/Skeleton';

const typeTabs = [
  { value: 'all', label: 'الكل' },
  { value: 'manga', label: 'مانجا' },
  { value: 'novel', label: 'روايات' },
];

function readRecent(): string[] {
  const stored = readStoredJson<unknown>(storageKeys.recentSearches);
  return Array.isArray(stored)
    ? stored.filter((item): item is string => typeof item === 'string').slice(0, 8)
    : [];
}

export default function SearchPage() {
  const [params, setParams] = useSearchParams();
  const urlQuery = params.get('q') ?? '';
  const [term, setTerm] = useState(urlQuery);
  const [type, setType] = useState<CatalogTypeFilter>(() => {
    const initial = params.get('type');
    return initial === 'manga' || initial === 'novel' ? initial : 'all';
  });
  const [recent, setRecent] = useState<string[]>(readRecent);
  const inputRef = useRef<HTMLInputElement>(null);
  const lastUrlQuery = useRef(urlQuery);
  const debounced = useDebouncedValue(term, 240);
  const isTyping = term.trim() !== debounced.trim();
  const hasQuery = debounced.trim().length > 0;

  usePageMeta({
    title: hasQuery ? `البحث: ${debounced.trim()}` : 'البحث',
    description: 'ابحث في مكتبة MangaPlus بالاسم أو المؤلف، وفلتر النتائج بين المانجا والروايات.',
    noIndex: true,
  });

  useEffect(() => {
    if (urlQuery === lastUrlQuery.current) return;
    lastUrlQuery.current = urlQuery;
    setTerm(urlQuery);
  }, [urlQuery]);

  useEffect(() => {
    const next = params.get('type');
    setType(next === 'manga' || next === 'novel' ? next : 'all');
  }, [params]);

  const changeType = (value: string) => {
    setType(value as CatalogTypeFilter);
    const next = new URLSearchParams(params);
    if (value === 'all') next.delete('type');
    else next.set('type', value);
    setParams(next, { replace: true });
  };

  const results = useMemo(
    () =>
      hasQuery
        ? queryCatalog({ query: debounced, type, pageSize: 30 })
        : null,
    [debounced, type, hasQuery],
  );

  const counts = useMemo(() => {
    if (!hasQuery) return null;
    return {
      all: queryCatalog({ query: debounced, pageSize: 1 }).total,
      manga: queryCatalog({ query: debounced, type: 'manga', pageSize: 1 }).total,
      novel: queryCatalog({ query: debounced, type: 'novel', pageSize: 1 }).total,
    };
  }, [debounced, hasQuery]);

  const genres = useMemo(() => listGenresInUse().slice(0, 8), []);

  const remember = (value: string) => {
    const clean = value.trim();
    if (!clean) return;
    const next = [clean, ...readRecent().filter((item) => item !== clean)].slice(0, 8);
    writeStoredJson(storageKeys.recentSearches, next);
    setRecent(next);
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    const clean = term.trim();
    if (!clean) {
      inputRef.current?.focus();
      return;
    }
    remember(clean);
    const search = new URLSearchParams(params);
    search.set('q', clean);
    setParams(search, { replace: true });
  };

  const clearRecent = () => {
    writeStoredJson(storageKeys.recentSearches, []);
    setRecent([]);
  };

  const removeRecent = (value: string) => {
    const next = recent.filter((item) => item !== value);
    writeStoredJson(storageKeys.recentSearches, next);
    setRecent(next);
  };

  return (
    <section className="page search-page">
      <div className="container">
        <nav className="breadcrumbs" aria-label="مسار الصفحة">
          <Link to="/">الرئيسية</Link>
          <Icon name="chevronLeft" size={14} />
          <span aria-current="page">البحث</span>
        </nav>

        <header className="search-page__head">
          <p className="eyebrow">ابحث في المكتبة</p>
          <h1 className="page__title">ما الذي تريد قراءته اليوم؟</h1>
          <p className="page__lead">
            اكتب اسم العمل أو المؤلف، أو اختر تصنيفاً لتضييق النتائج. النتائج تظهر أثناء الكتابة.
          </p>
        </header>

        <form className="search-hero" role="search" onSubmit={onSubmit}>
          <Icon name="search" size={22} />
          <input
            ref={inputRef}
            type="search"
            value={term}
            onChange={(event) => setTerm(event.target.value)}
            placeholder="ابحث باسم العمل أو المؤلف…"
            aria-label="ابحث باسم العمل أو المؤلف"
            autoComplete="off"
          />
          {term ? (
            <button
              type="button"
              className="search-hero__clear"
              onClick={() => {
                setTerm('');
                inputRef.current?.focus();
              }}
              aria-label="مسح البحث"
            >
              <Icon name="close" size={16} />
            </button>
          ) : null}
          <Button type="submit" size="md" className="search-hero__submit">
            بحث
          </Button>
        </form>

        {hasQuery || isTyping ? (
          <>
            <div className="search-page__toolbar">
              <FilterTabs
                label="نوع النتيجة"
                value={type}
                onChange={changeType}
                items={typeTabs.map((tab) => ({
                  ...tab,
                  count: counts?.[tab.value as 'all' | 'manga' | 'novel'],
                }))}
              />
              {results ? (
                <span className="search-page__count">
                  {formatNumber(results.total)} نتيجة لـ «{debounced.trim()}»
                </span>
              ) : null}
            </div>

            {isTyping ? (
              <div className="search-page__results">
                <WorkRowSkeleton count={4} />
              </div>
            ) : results && results.items.length > 0 ? (
              <div className="search-page__results">
                {results.items.map((work) => (
                  <WorkRow
                    key={work.id}
                    work={work}
                    action={<FavoriteButton workId={work.id} title={work.title} />}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                icon="search"
                title="لم نجد ما يطابق بحثك"
                description={`لا توجد نتائج لـ «${debounced.trim()}». جرّب كلمة أقصر أو ابحث عن تصنيف.`}
                action={
                  <div className="empty-state__chips">
                    {genres.slice(0, 4).map((genre) => (
                      <button
                        key={genre.id}
                        type="button"
                        className="search-chip"
                        onClick={() => setTerm(genre.label)}
                      >
                        {genre.label}
                      </button>
                    ))}
                  </div>
                }
              />
            )}
          </>
        ) : (
          <div className="search-page__start">
            {recent.length > 0 ? (
              <section className="search-block" aria-labelledby="search-recent">
                <div className="search-block__head">
                  <h2 id="search-recent">بحثك الأخير</h2>
                  <button type="button" className="link-button" onClick={clearRecent}>
                    مسح السجل
                  </button>
                </div>
                <ul className="recent-list">
                  {recent.map((value) => (
                    <li key={value} className="recent-list__item">
                      <button type="button" className="recent-list__term" onClick={() => setTerm(value)}>
                        <Icon name="clock" size={16} />
                        {value}
                      </button>
                      <button
                        type="button"
                        className="recent-list__remove"
                        onClick={() => removeRecent(value)}
                        aria-label={`إزالة «${value}» من سجل البحث`}
                      >
                        <Icon name="close" size={14} />
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            <section className="search-block" aria-labelledby="search-genres">
              <div className="search-block__head">
                <h2 id="search-genres">تصفح حسب التصنيف</h2>
              </div>
              <div className="search-chips">
                {genres.map((genre) => (
                  <button
                    key={genre.id}
                    type="button"
                    className="search-chip"
                    onClick={() => setTerm(genre.label)}
                  >
                    {genre.label}
                  </button>
                ))}
              </div>
              <p className="search-page__hint">
                يمكنك أيضاً <Link to="/explore">تصفح كل الأعمال</Link> مع الفلاتر والترتيب.
              </p>
            </section>

            <section className="search-block" aria-labelledby="search-suggested">
              <div className="search-block__head">
                <h2 id="search-suggested">اقتراحات للبدء</h2>
              </div>
              <div className="search-suggested">
                {queryCatalog({ sort: 'rating', pageSize: 4 }).items.map((work) => (
                  <Link key={work.id} to={`/${work.type}/${work.id}`} className="search-suggested__item">
                    <span className="search-suggested__title">{work.title}</span>
                    <span className="search-suggested__meta">
                      {work.genres.slice(0, 2).map(genreLabel).join(' · ')}
                    </span>
                    <Icon name="arrowLeft" size={15} />
                  </Link>
                ))}
              </div>
            </section>
          </div>
        )}
      </div>
    </section>
  );
}
