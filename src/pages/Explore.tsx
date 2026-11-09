import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { usePageMeta } from '@/hooks/usePageMeta';
import { formatNumber } from '@/lib/format';
import { genreLabel, isGenreId } from '@/data/genres';
import type { CatalogTypeFilter, GenreId, SortOption, WorkStatus } from '@/types';
import { listGenresInUse, queryCatalog } from '@/services/catalog';
import { ButtonLink } from '@/components/Button';
import { EmptyState } from '@/components/EmptyState';
import { FilterTabs } from '@/components/FilterTabs';
import { Icon } from '@/components/Icon';
import { Pagination } from '@/components/Pagination';
import { Select } from '@/components/Select';
import { WorkCard } from '@/components/WorkCard';

const typeTabs = [
  { value: 'all', label: 'كل الأعمال' },
  { value: 'manga', label: 'مانجا' },
  { value: 'novel', label: 'روايات' },
];

const statusOptions: { value: string; label: string }[] = [
  { value: 'all', label: 'كل الحالات' },
  { value: 'ongoing', label: 'مستمر' },
  { value: 'completed', label: 'مكتمل' },
  { value: 'hiatus', label: 'متوقف مؤقتاً' },
];

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'latest', label: 'الأحدث تحديثاً' },
  { value: 'popular', label: 'الأكثر قراءة' },
  { value: 'rating', label: 'الأعلى تقييماً' },
  { value: 'title', label: 'أبجدياً' },
];

const pageSize = 12;

function readType(value: string | null): CatalogTypeFilter {
  return value === 'manga' || value === 'novel' ? value : 'all';
}

function readStatus(value: string | null): WorkStatus | 'all' {
  return value === 'ongoing' || value === 'completed' || value === 'hiatus' ? value : 'all';
}

function readSort(value: string | null): SortOption {
  return value === 'popular' || value === 'rating' || value === 'title' || value === 'latest'
    ? value
    : 'latest';
}

export default function Explore() {
  const [params, setParams] = useSearchParams();
  const type = readType(params.get('type'));
  const genre: GenreId | 'all' = isGenreId(params.get('genre') ?? '') ? (params.get('genre') as GenreId) : 'all';
  const status = readStatus(params.get('status'));
  const sort = readSort(params.get('sort'));
  const page = Math.max(1, Number(params.get('page') ?? '1') || 1);

  const [queryValue, setQueryValue] = useState(params.get('q') ?? '');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const debouncedQuery = useDebouncedValue(queryValue, 320);

  usePageMeta({
    title:
      type === 'manga' ? 'استكشاف المانجا' : type === 'novel' ? 'استكشاف الروايات' : 'استكشاف الأعمال',
    description:
      'تصفّح المانجا والروايات في MangaPlus، وفلتر حسب التصنيف والحالة، ورتّب النتائج حسب الأحدث أو الشهرة أو التقييم.',
  });

  useEffect(() => {
    const current = params.get('q') ?? '';
    if (debouncedQuery === current) return;
    const next = new URLSearchParams(params);
    if (debouncedQuery.trim()) next.set('q', debouncedQuery.trim());
    else next.delete('q');
    next.delete('page');
    setParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery]);

  const update = (patch: Record<string, string | null>, resetPage = true) => {
    const next = new URLSearchParams(params);
    Object.entries(patch).forEach(([key, value]) => {
      if (value) next.set(key, value);
      else next.delete(key);
    });
    if (resetPage) next.delete('page');
    setParams(next, { replace: true });
  };

  const result = useMemo(
    () =>
      queryCatalog({
        query: debouncedQuery,
        type,
        genre,
        status,
        sort,
        page,
        pageSize,
      }),
    [debouncedQuery, type, genre, status, sort, page],
  );

  const counts = useMemo(
    () => ({
      all: queryCatalog({ query: debouncedQuery, pageSize: 1 }).total,
      manga: queryCatalog({ query: debouncedQuery, type: 'manga', pageSize: 1 }).total,
      novel: queryCatalog({ query: debouncedQuery, type: 'novel', pageSize: 1 }).total,
    }),
    [debouncedQuery],
  );

  const genres = useMemo(() => listGenresInUse(), []);
  const filtered = Boolean(debouncedQuery || genre !== 'all' || status !== 'all');

  const activeChips: { key: string; label: string; clear: () => void }[] = [];
  if (debouncedQuery)
    activeChips.push({
      key: 'q',
      label: `«${debouncedQuery}»`,
      clear: () => {
        setQueryValue('');
        update({ q: null });
      },
    });
  if (genre !== 'all')
    activeChips.push({ key: 'genre', label: genreLabel(genre), clear: () => update({ genre: null }) });
  if (status !== 'all')
    activeChips.push({
      key: 'status',
      label: statusOptions.find((option) => option.value === status)?.label ?? '',
      clear: () => update({ status: null }),
    });

  return (
    <section className="page explore">
      <div className="container">
        <nav className="breadcrumbs" aria-label="مسار الصفحة">
          <ButtonLink to="/" variant="ghost" size="sm" className="breadcrumbs__home">
            الرئيسية
          </ButtonLink>
          <Icon name="chevronLeft" size={14} />
          <span aria-current="page">استكشاف الأعمال</span>
        </nav>

        <header className="explore__head">
          <div>
            <p className="eyebrow">المكتبة</p>
            <h1 className="page__title">استكشف الأعمال</h1>
            <p className="page__lead">
              مانجا وروايات في مكتبة واحدة. اختر النوع أو التصنيف، أو ابحث باسم العمل لتبدأ القراءة.
            </p>
          </div>
          <div className="explore__count">
            <span className="explore__count-value">{formatNumber(result.total)}</span>
            <span className="explore__count-label">{filtered ? 'نتيجة مطابقة' : 'عملاً في المكتبة'}</span>
          </div>
        </header>

        <div className="explore__tabs">
          <FilterTabs
            label="نوع العمل"
            value={type}
            onChange={(value) => update({ type: value === 'all' ? null : value })}
            items={typeTabs.map((tab) => ({
              ...tab,
              count: counts[tab.value as 'all' | 'manga' | 'novel'],
            }))}
          />
        </div>

        <div className="explore__toolbar">
          <div className="search-input">
            <Icon name="search" size={19} />
            <input
              type="search"
              value={queryValue}
              onChange={(event) => setQueryValue(event.target.value)}
              placeholder="ابحث باسم العمل أو المؤلف…"
              aria-label="ابحث في المكتبة"
            />
            {queryValue ? (
              <button
                type="button"
                className="search-input__clear"
                onClick={() => setQueryValue('')}
                aria-label="مسح البحث"
              >
                <Icon name="close" size={15} />
              </button>
            ) : null}
          </div>

          <button
            type="button"
            className="filters-toggle"
            onClick={() => setFiltersOpen((current) => !current)}
            aria-expanded={filtersOpen}
            aria-controls="explore-filters"
          >
            <Icon name="filter" size={18} />
            الفلاتر
            {activeChips.length > 0 ? <span className="filters-toggle__dot" /> : null}
          </button>

          <div
            className={`explore__filters ${filtersOpen ? 'is-open' : ''}`.trim()}
            id="explore-filters"
          >
            <Select
              label="التصنيف"
              value={genre}
              onChange={(event) => update({ genre: event.target.value === 'all' ? null : event.target.value })}
              options={[
                { value: 'all', label: 'كل التصنيفات' },
                ...genres.map((item) => ({ value: item.id, label: item.label })),
              ]}
            />
            <Select
              label="الحالة"
              value={status}
              onChange={(event) => update({ status: event.target.value === 'all' ? null : event.target.value })}
              options={statusOptions}
            />
            <Select
              label="الترتيب"
              value={sort}
              onChange={(event) => update({ sort: event.target.value === 'latest' ? null : event.target.value })}
              options={sortOptions}
            />
          </div>
        </div>

        {activeChips.length > 0 ? (
          <div className="active-filters" aria-label="الفلاتر المطبقة">
            {activeChips.map((chip) => (
              <button key={chip.key} type="button" className="active-filter" onClick={chip.clear}>
                {chip.label}
                <Icon name="close" size={13} />
              </button>
            ))}
            <button
              type="button"
              className="link-button"
              onClick={() => {
                setQueryValue('');
                setParams(new URLSearchParams(), { replace: true });
              }}
            >
              مسح الكل
            </button>
          </div>
        ) : null}

        <p className="sr-only" aria-live="polite">
          {formatNumber(result.total)} نتيجة، الصفحة {formatNumber(result.page)} من{' '}
          {formatNumber(result.totalPages)}
        </p>

        {result.items.length > 0 ? (
          <>
            <div className="work-grid explore__grid">
              {result.items.map((work) => (
                <WorkCard key={work.id} work={work} />
              ))}
            </div>
            <Pagination
              page={result.page}
              totalPages={result.totalPages}
              onChange={(nextPage) => {
                update({ page: nextPage > 1 ? String(nextPage) : null }, false);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          </>
        ) : (
          <EmptyState
            icon="search"
            title="لا توجد أعمال مطابقة"
            description="جرّب تعديل الفلاتر أو البحث باسم مختلف. يمكنك أيضاً تصفح كل الأعمال للبدء من جديد."
            action={
              <button
                type="button"
                className="btn btn--primary btn--md"
                onClick={() => {
                  setQueryValue('');
                  setParams(new URLSearchParams(), { replace: true });
                }}
              >
                <span className="btn__label">عرض كل الأعمال</span>
              </button>
            }
          />
        )}
      </div>
    </section>
  );
}
