import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useLibrary } from '@/contexts/LibraryContext';
import { useConfirm } from '@/contexts/ConfirmContext';
import { useToast } from '@/contexts/ToastContext';
import { usePageMeta } from '@/hooks/usePageMeta';
import { formatNumber } from '@/lib/format';
import { getWorkById } from '@/services/catalog';
import type { Work } from '@/types';
import { Badge } from '@/components/Badge';
import { ButtonLink } from '@/components/Button';
import { EmptyState } from '@/components/EmptyState';
import { FilterTabs } from '@/components/FilterTabs';
import { Icon } from '@/components/Icon';
import { Select } from '@/components/Select';
import { WorkCard } from '@/components/WorkCard';

type LibraryTab = 'all' | 'favorites' | 'following' | 'reading' | 'completed';
type LibrarySort = 'recent' | 'title' | 'progress' | 'rating';

interface LibraryEntry {
  work: Work;
  progress?: number;
  updatedAt: number;
}

const tabs: { value: LibraryTab; label: string }[] = [
  { value: 'all', label: 'كل شيء' },
  { value: 'favorites', label: 'المفضلة' },
  { value: 'following', label: 'أتابعها' },
  { value: 'reading', label: 'سجل القراءة' },
  { value: 'completed', label: 'مكتملة' },
];

const sortOptions: { value: LibrarySort; label: string }[] = [
  { value: 'recent', label: 'الأحدث' },
  { value: 'title', label: 'أبجدياً' },
  { value: 'progress', label: 'تقدم القراءة' },
  { value: 'rating', label: 'التقييم' },
];

const collator = new Intl.Collator('ar', { sensitivity: 'base' });

export default function Library() {
  const [params, setParams] = useSearchParams();
  const tab = (['favorites', 'following', 'reading', 'completed'] as string[]).includes(
    params.get('tab') ?? '',
  )
    ? (params.get('tab') as LibraryTab)
    : 'all';
  const [sort, setSort] = useState<LibrarySort>('recent');
  const { state, clearLibrary } = useLibrary();
  const confirm = useConfirm();
  const { toast } = useToast();

  usePageMeta({
    title: 'مكتبتي',
    description: 'المفضلة والمتابعة وسجل القراءة في مكتبة MangaPlus، مع تقدم القراءة لكل عمل.',
    noIndex: true,
  });

  const entries = useMemo(() => {
    const map = new Map<string, LibraryEntry>();

    state.favorites.forEach((workId) => {
      const work = getWorkById(workId);
      if (work) map.set(workId, { work, updatedAt: 0, progress: state.progress[workId]?.percent });
    });

    state.follows.forEach((workId) => {
      const work = getWorkById(workId);
      if (work && !map.has(workId)) map.set(workId, { work, updatedAt: 0, progress: state.progress[workId]?.percent });
    });

    Object.values(state.progress).forEach((entry) => {
      const work = getWorkById(entry.workId);
      if (!work) return;
      map.set(work.id, {
        work,
        progress: entry.percent,
        updatedAt: new Date(entry.updatedAt).getTime(),
      });
    });

    return [...map.values()];
  }, [state]);

  const filtered = useMemo(() => {
    let items = entries;
    if (tab === 'favorites') items = entries.filter((entry) => state.favorites.includes(entry.work.id));
    else if (tab === 'following') items = entries.filter((entry) => state.follows.includes(entry.work.id));
    else if (tab === 'reading') items = entries.filter((entry) => Boolean(state.progress[entry.work.id]));
    else if (tab === 'completed') items = entries.filter((entry) => Boolean(state.progress[entry.work.id]?.completed));

    const sorted = [...items];
    switch (sort) {
      case 'title':
        sorted.sort((a, b) => collator.compare(a.work.title, b.work.title));
        break;
      case 'progress':
        sorted.sort((a, b) => (b.progress ?? 0) - (a.progress ?? 0));
        break;
      case 'rating':
        sorted.sort((a, b) => b.work.rating - a.work.rating);
        break;
      case 'recent':
      default:
        sorted.sort((a, b) => b.updatedAt - a.updatedAt || collator.compare(a.work.title, b.work.title));
        break;
    }
    return sorted;
  }, [entries, state, tab, sort]);

  const counts = {
    favorites: state.favorites.length,
    following: state.follows.length,
    reading: Object.keys(state.progress).length,
    completed: Object.values(state.progress).filter((entry) => entry.completed).length,
  };

  const readingNow = Object.values(state.progress)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())[0];
  const readingWork = readingNow ? getWorkById(readingNow.workId) : undefined;

  const setTab = (value: string) => {
    const next = new URLSearchParams(params);
    if (value === 'all') next.delete('tab');
    else next.set('tab', value);
    setParams(next, { replace: true });
  };

  const onClear = async () => {
    const approved = await confirm({
      title: 'مسح المكتبة',
      description: 'سيتم حذف المفضلة والمتابعة وسجل القراءة من هذا الجهاز. لا يمكن التراجع عن هذه الخطوة.',
      confirmLabel: 'مسح المكتبة',
      tone: 'danger',
    });
    if (!approved) return;
    clearLibrary();
    toast({ tone: 'success', title: 'تم مسح المكتبة' });
  };

  const emptyCopy: Record<LibraryTab, { title: string; description: string }> = {
    all: {
      title: 'مكتبتك فارغة',
      description: 'أضف الأعمال إلى المفضلة أو ابدأ القراءة، وسيظهر كل شيء هنا.',
    },
    favorites: {
      title: 'لا مفضلة بعد',
      description: 'اضغط أيقونة القلب في أي عمل لتضيفه إلى مفضلتك.',
    },
    following: {
      title: 'لا أعمال تتابعها',
      description: 'تابع الأعمال التي تهتم بها لتصل إليها بسرعة من هنا.',
    },
    reading: {
      title: 'لم تبدأ القراءة بعد',
      description: 'افتح عملاً واقرأ فصلًا، وسيُحفظ تقدمك تلقائياً.',
    },
    completed: {
      title: 'لا أعمال مكتملة',
      description: 'عند إكمال آخر فصل من عمل، سيظهر هنا.',
    },
  };

  return (
    <section className="page library">
      <div className="container">
        <header className="library__head">
          <div>
            <p className="eyebrow">حسابك</p>
            <h1 className="page__title">مكتبتي</h1>
            <p className="page__lead">
              كل ما تضيفه أو تقرأه، في مكان واحد. تقدم القراءة محفوظ تلقائياً.
            </p>
            <div className="library__device">
              <Icon name="device" size={15} />
              محفوظة على هذا الجهاز
            </div>
          </div>
          <div className="library__stats">
            <span>
              <strong>{formatNumber(counts.favorites)}</strong>
              مفضلة
            </span>
            <span>
              <strong>{formatNumber(counts.following)}</strong>
              أتابعها
            </span>
            <span>
              <strong>{formatNumber(counts.reading)}</strong>
              في القراءة
            </span>
            <span>
              <strong>{formatNumber(counts.completed)}</strong>
              مكتملة
            </span>
          </div>
        </header>

        {readingWork && readingNow ? (
          <div className="library-continue">
            <div className="library-continue__text">
              <span className="library-continue__eyebrow">
                <Icon name="clock" size={15} /> تابع من حيث توقفت
              </span>
              <h2>{readingWork.title}</h2>
              <p>
                الفصل {readingNow.chapterNumber} · {formatNumber(Math.round(readingNow.percent))}% من الفصل
              </p>
            </div>
            <Link
              className="btn btn--primary btn--md"
              to={`/reader/${readingWork.type}/${readingWork.id}/${readingNow.chapterId}`}
            >
              <span className="btn__label">متابعة القراءة</span>
              <Icon name="play" size={16} />
            </Link>
          </div>
        ) : null}

        <div className="library__toolbar">
          <FilterTabs
            label="أقسام المكتبة"
            value={tab}
            onChange={setTab}
            items={tabs.map((item) => ({
              ...item,
              count:
                item.value === 'all'
                  ? entries.length
                  : item.value === 'favorites'
                    ? counts.favorites
                    : item.value === 'following'
                      ? counts.following
                      : item.value === 'reading'
                        ? counts.reading
                        : counts.completed,
            }))}
          />
          <div className="library__actions">
            <Select
              label="ترتيب المكتبة"
              value={sort}
              onChange={(event) => setSort(event.target.value as LibrarySort)}
              options={sortOptions}
            />
            {entries.length > 0 ? (
              <button type="button" className="library__clear" onClick={onClear}>
                <Icon name="trash" size={16} />
                مسح المكتبة
              </button>
            ) : null}
          </div>
        </div>

        {filtered.length > 0 ? (
          <div className="work-grid">
            {filtered.map((entry) => (
              <div className="library-card" key={entry.work.id}>
                <WorkCard work={entry.work} progress={entry.progress} />
                <div className="library-card__flags">
                  {state.favorites.includes(entry.work.id) ? (
                    <Badge tone="danger">مفضلة</Badge>
                  ) : null}
                  {state.follows.includes(entry.work.id) ? <Badge tone="brand">أتابعه</Badge> : null}
                  {state.progress[entry.work.id]?.completed ? <Badge tone="success">مكتمل</Badge> : null}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={tab === 'favorites' ? 'heart' : tab === 'reading' ? 'clock' : 'library'}
            title={emptyCopy[tab].title}
            description={emptyCopy[tab].description}
            action={
              <ButtonLink to="/explore" variant="primary" iconLeft="compass">
                استكشف الأعمال
              </ButtonLink>
            }
          />
        )}
      </div>
    </section>
  );
}
