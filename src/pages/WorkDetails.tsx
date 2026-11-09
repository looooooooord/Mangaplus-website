import { useMemo, useState, type CSSProperties } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useLibrary } from '@/contexts/LibraryContext';
import { useToast } from '@/contexts/ToastContext';
import { genreLabel } from '@/data/genres';
import { usePageMeta } from '@/hooks/usePageMeta';
import { formatCompact, formatDate, formatPercent, timeAgo } from '@/lib/format';
import {
  getRelated,
  getWorkById,
  readerPath,
  workPath,
} from '@/services/catalog';
import type { WorkType } from '@/types';
import { Badge, StatusBadge, TypeBadge } from '@/components/Badge';
import { ButtonLink } from '@/components/Button';
import { EmptyState } from '@/components/EmptyState';
import { FavoriteButton } from '@/components/FavoriteButton';
import { Icon } from '@/components/Icon';
import { ProgressBar } from '@/components/ProgressBar';
import { Rating } from '@/components/Rating';
import { WorkCard } from '@/components/WorkCard';
import { WorkCover } from '@/components/WorkCover';

interface WorkDetailsProps {
  type: WorkType;
}

export default function WorkDetails({ type }: WorkDetailsProps) {
  const { id = '' } = useParams();
  const work = getWorkById(id, type);
  const { state, isFollowing, toggleFollow } = useLibrary();
  const { toast } = useToast();
  const [chapterQuery, setChapterQuery] = useState('');
  const [ascending, setAscending] = useState(false);

  usePageMeta({
    title: work ? work.title : 'العمل غير موجود',
    description: work?.description,
    type: 'article',
  });

  const progress = work ? state.progress[work.id] : undefined;

  const chapters = useMemo(() => {
    if (!work) return [];
    const query = chapterQuery.trim().toLowerCase();
    const filtered = query
      ? work.chapters.filter(
          (chapter) =>
            chapter.title.toLowerCase().includes(query) ||
            String(chapter.number).includes(query),
        )
      : work.chapters;
    return [...filtered].sort((a, b) => (ascending ? a.number - b.number : b.number - a.number));
  }, [work, chapterQuery, ascending]);

  if (!work) {
    return (
      <section className="page">
        <div className="container">
          <nav className="breadcrumbs" aria-label="مسار الصفحة">
            <Link to="/">الرئيسية</Link>
            <Icon name="chevronLeft" size={14} />
            <Link to="/explore">الأعمال</Link>
          </nav>
          <EmptyState
            icon="bookOpen"
            title="لم نعثر على هذا العمل"
            description="قد يكون الرابط قديماً أو تم نقل العمل. يمكنك متابعة الاستكشاف من المكتبة."
            action={
              <ButtonLink to="/explore" variant="primary" iconLeft="compass">
                استكشف الأعمال
              </ButtonLink>
            }
          />
        </div>
      </section>
    );
  }

  const currentChapter = progress
    ? work.chapters.find((chapter) => chapter.id === progress.chapterId)
    : undefined;
  const startChapter = currentChapter ?? work.chapters[0];
  const following = isFollowing(work.id);
  const related = getRelated(work, 4);

  const onFollow = () => {
    const next = toggleFollow(work.id);
    toast({
      tone: 'success',
      title: next ? 'تتابع هذا العمل' : 'أوقفت متابعة العمل',
      description: next ? `ستجد «${work.title}» في مكتبتك.` : `أُزيل «${work.title}» من قائمة المتابعة.`,
    });
  };

  const copyLink = async () => {
    const url = `${window.location.origin}${workPath(work.type, work.id)}`;
    try {
      await navigator.clipboard.writeText(url);
      toast({ tone: 'success', title: 'تم نسخ الرابط' });
    } catch {
      toast({ tone: 'error', title: 'تعذّر نسخ الرابط' });
    }
  };

  return (
    <>
      <section
        className="detail-hero"
        style={
          {
            '--detail-from': work.cover.from,
            '--detail-to': work.cover.to,
            '--detail-accent': work.cover.accent,
          } as CSSProperties
        }
      >
        <div className="detail-hero__bg" aria-hidden="true" />
        <div className="container detail-hero__inner">
          <div className="detail-hero__cover">
            <WorkCover work={work} />
          </div>

          <div className="detail-hero__body">
            <nav className="breadcrumbs breadcrumbs--light" aria-label="مسار الصفحة">
              <Link to="/">الرئيسية</Link>
              <Icon name="chevronLeft" size={14} />
              <Link to={`/explore?type=${work.type}`}>{work.type === 'manga' ? 'المانجا' : 'الروايات'}</Link>
              <Icon name="chevronLeft" size={14} />
              <span aria-current="page">{work.title}</span>
            </nav>

            <div className="detail-hero__badges">
              <TypeBadge type={work.type} />
              <StatusBadge status={work.status} />
              <Badge tone="brand">{work.year}</Badge>
            </div>

            <h1 className="detail-hero__title">{work.title}</h1>
            <p className="detail-hero__latin">
              {work.latinTitle}
            </p>
            <p className="detail-hero__tagline">{work.tagline}</p>

            <div className="detail-hero__stats">
              <span className="detail-hero__rating">
                <Rating value={work.rating} size="md" />
                <span className="detail-hero__stat-label">{work.rating.toFixed(1)} من 5</span>
              </span>
              <span className="detail-hero__divider" aria-hidden="true" />
              <span className="detail-hero__stat">
                <Icon name="library" size={16} />
                {formatCompact(work.readers)} قارئ
              </span>
              <span className="detail-hero__stat">
                <Icon name="layers" size={16} />
                {work.chapters.length} فصلاً
              </span>
              <span className="detail-hero__stat">
                <Icon name="clock" size={16} />
                تحديث {timeAgo(work.updatedAt)}
              </span>
            </div>

            <div className="detail-hero__actions">
              {startChapter ? (
                <ButtonLink
                  to={readerPath(work.type, work.id, startChapter.id)}
                  size="lg"
                  iconLeft="play"
                >
                  {currentChapter ? 'تابع القراءة' : 'ابدأ القراءة'}
                </ButtonLink>
              ) : null}
              <FavoriteButton workId={work.id} title={work.title} variant="label" className="detail-fav" />
              <button
                type="button"
                className={`detail-action ${following ? 'is-active' : ''}`.trim()}
                onClick={onFollow}
                aria-pressed={following}
              >
                <Icon name={following ? 'bookmarkFilled' : 'bookmark'} size={18} />
                <span>{following ? 'أتابعه' : 'متابعة'}</span>
              </button>
              <button type="button" className="detail-action detail-action--icon" onClick={copyLink} aria-label="نسخ رابط العمل">
                <Icon name="external" size={18} />
              </button>
            </div>

            {progress ? (
              <div className="detail-hero__progress">
                <ProgressBar
                  value={progress.percent}
                  label={`تقدمك في الفصل ${progress.chapterNumber}: ${formatPercent(progress.percent)}`}
                  showValue
                />
                {progress.completed ? <Badge tone="success">أكملت هذا العمل</Badge> : null}
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section className="detail-body">
        <div className="container detail-body__grid">
          <div className="detail-main">
            <article className="panel">
              <h2 className="panel__title">عن العمل</h2>
              <p className="detail-description">{work.description}</p>
              <div className="detail-genres" aria-label="التصنيفات">
                {work.genres.map((genre) => (
                  <Link key={genre} className="genre-chip" to={`/explore?genre=${genre}`}>
                    {genreLabel(genre)}
                  </Link>
                ))}
              </div>
            </article>

            <section className="panel" id="chapters" aria-labelledby="chapters-title">
              <div className="chapters-head">
                <div>
                  <h2 className="panel__title" id="chapters-title">
                    الفصول
                    <span className="chapters-head__count">{work.chapters.length}</span>
                  </h2>
                  <p className="panel__subtitle">
                    {work.type === 'novel' ? 'فصول نصية كاملة، تُقرأ في قارئ الروايات.' : 'فصول مصورة، تُقرأ في قارئ المانجا.'}
                  </p>
                </div>
                <div className="chapters-tools">
                  <div className="search-input search-input--sm">
                    <Icon name="search" size={16} />
                    <input
                      type="search"
                      value={chapterQuery}
                      onChange={(event) => setChapterQuery(event.target.value)}
                      placeholder="ابحث في الفصول"
                      aria-label="البحث داخل الفصول"
                    />
                  </div>
                  <button
                    type="button"
                    className="chapters-order"
                    onClick={() => setAscending((current) => !current)}
                    aria-label={ascending ? 'عرض من الأحدث للأقدم' : 'عرض من الأقدم للأحدث'}
                  >
                    <Icon name={ascending ? 'arrowUp' : 'arrowDown'} size={16} />
                    {ascending ? 'الأقدم أولاً' : 'الأحدث أولاً'}
                  </button>
                </div>
              </div>

              {chapters.length > 0 ? (
                <ol className="chapter-list">
                  {chapters.map((chapter) => {
                    const isCurrent = progress?.chapterId === chapter.id;
                    return (
                      <li key={chapter.id}>
                        <Link
                          className={`chapter-row ${isCurrent ? 'is-current' : ''}`.trim()}
                          to={readerPath(work.type, work.id, chapter.id)}
                        >
                          <span className="chapter-row__num">{chapter.number}</span>
                          <span className="chapter-row__body">
                            <span className="chapter-row__title">{chapter.title}</span>
                            <span className="chapter-row__meta">
                              {formatDate(chapter.publishedAt)}
                              {isCurrent ? ' · آخر قراءة' : ''}
                            </span>
                          </span>
                          {isCurrent ? <Badge tone="brand">توقفت هنا</Badge> : null}
                          <span className="chapter-row__icon" aria-hidden="true">
                            <Icon name={work.type === 'manga' ? 'play' : 'bookOpen'} size={16} />
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ol>
              ) : (
                <EmptyState
                  compact
                  icon="search"
                  title="لا فصول بهذا الاسم"
                  description="جرّب رقم فصل أو كلمة مختلفة."
                />
              )}
            </section>

            {related.length > 0 ? (
              <section className="panel" aria-labelledby="related-title">
                <h2 className="panel__title" id="related-title">
                  أعمال قد تعجبك
                </h2>
                <div className="work-grid work-grid--compact">
                  {related.map((item) => (
                    <WorkCard key={item.id} work={item} />
                  ))}
                </div>
              </section>
            ) : null}
          </div>

          <aside className="detail-aside">
            <div className="panel info-card">
              <h2 className="panel__title">معلومات العمل</h2>
              <dl className="info-list">
                <div>
                  <dt>النوع</dt>
                  <dd>{work.type === 'manga' ? 'مانجا' : 'رواية'}</dd>
                </div>
                <div>
                  <dt>الحالة</dt>
                  <dd>{work.status === 'ongoing' ? 'مستمر' : work.status === 'completed' ? 'مكتمل' : 'متوقف مؤقتاً'}</dd>
                </div>
                <div>
                  <dt>المؤلف</dt>
                  <dd>{work.author}</dd>
                </div>
                {work.artist ? (
                  <div>
                    <dt>الرسم</dt>
                    <dd>{work.artist}</dd>
                  </div>
                ) : null}
                <div>
                  <dt>سنة الإصدار</dt>
                  <dd>{work.year}</dd>
                </div>
                <div>
                  <dt>الفصول</dt>
                  <dd>{work.chapters.length}</dd>
                </div>
                <div>
                  <dt>آخر تحديث</dt>
                  <dd>{formatDate(work.updatedAt)}</dd>
                </div>
                <div>
                  <dt>التقييم</dt>
                  <dd>{work.rating.toFixed(1)} / 5</dd>
                </div>
                <div>
                  <dt>القراء</dt>
                  <dd>{formatCompact(work.readers)}</dd>
                </div>
              </dl>
            </div>

            <div className="panel panel--soft">
              <h2 className="panel__title panel__title--sm">
                <Icon name="library" size={18} /> مكتبتك
              </h2>
              <p className="panel__text">
                أضف العمل إلى المفضلة أو المتابعة ليظهر في مكتبتك مع تقدم القراءة، ويبقى محفوظاً على
                هذا الجهاز.
              </p>
              <Link className="link-button" to="/library">
                عرض المكتبة
                <Icon name="arrowLeft" size={15} />
              </Link>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
