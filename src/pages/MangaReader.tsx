import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import type { Chapter, Work } from '@/types';
import { useLibrary } from '@/contexts/LibraryContext';
import { useToast } from '@/contexts/ToastContext';
import { usePageMeta } from '@/hooks/usePageMeta';
import { formatPercent } from '@/lib/format';
import { readStoredJson, storageKeys, writeStoredJson } from '@/lib/storage';
import { getAdjacentChapters, getWorkById, readerPath, workPath } from '@/services/catalog';
import { getMangaChapterPages } from '@/services/pages';
import { Icon } from '@/components/Icon';
import { ReaderMissing } from '@/components/ReaderMissing';

type ReadingMode = 'vertical' | 'paged';
type ReaderTheme = 'night' | 'dim' | 'paper';
type FitMode = 'width' | 'height';

interface MangaPrefs {
  mode: ReadingMode;
  theme: ReaderTheme;
  fit: FitMode;
}

const defaultPrefs: MangaPrefs = { mode: 'vertical', theme: 'night', fit: 'width' };

function readPrefs(): MangaPrefs {
  const stored = readStoredJson<Partial<MangaPrefs>>(storageKeys.readerManga);
  const mode = stored?.mode === 'paged' || stored?.mode === 'vertical' ? stored.mode : defaultPrefs.mode;
  const theme =
    stored?.theme === 'night' || stored?.theme === 'dim' || stored?.theme === 'paper'
      ? stored.theme
      : defaultPrefs.theme;
  const fit = stored?.fit === 'height' || stored?.fit === 'width' ? stored.fit : defaultPrefs.fit;
  return { mode, theme, fit };
}

function MangaReaderView({ work, chapter }: { work: Work; chapter: Chapter }) {
  const navigate = useNavigate();
  const { state, recordProgress } = useLibrary();
  const { toast } = useToast();
  const [prefs, setPrefs] = useState<MangaPrefs>(readPrefs);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mounted = useRef(true);

  const { previous, next } = getAdjacentChapters(work, chapter.id);
  const pages = useMemo(() => getMangaChapterPages(work.id, chapter.number), [work.id, chapter.number]);

  const savedProgress = state.progress[work.id];
  const savedForChapter = savedProgress?.chapterId === chapter.id ? savedProgress : null;
  const initialPage = savedForChapter?.pageIndex ?? 0;
  const [pageIndex, setPageIndex] = useState(() =>
    Math.min(Math.max(0, initialPage), Math.max(0, pages.length - 1)),
  );
  const [percent, setPercent] = useState(() => savedForChapter?.percent ?? 0);
  const percentRef = useRef(savedForChapter?.percent ?? 0);

  const pageIndexRef = useRef(pageIndex);

  usePageMeta({
    title: `${work.title} — ${chapter.title}`,
    description: `قراءة ${work.title}، ${chapter.title} على MangaPlus.`,
    noIndex: true,
  });

  useEffect(() => {
    writeStoredJson(storageKeys.readerManga, prefs);
  }, [prefs]);

  useEffect(() => {
    pageIndexRef.current = pageIndex;
  }, [pageIndex]);

  const persist = useCallback(
    (value: number) => {
      if (!mounted.current) return;
      recordProgress({
        workId: work.id,
        chapterId: chapter.id,
        chapterNumber: chapter.number,
        percent: value,
        pageIndex: pageIndexRef.current,
        totalPages: pages.length,
      });
    },
    [recordProgress, work.id, chapter.id, chapter.number, pages.length],
  );

  const scheduleSave = useCallback(
    (value: number) => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => persist(value), 550);
    },
    [persist],
  );

  const updatePercent = useCallback(
    (value: number) => {
      const clamped = Math.max(0, Math.min(100, value));
      percentRef.current = clamped;
      setPercent(clamped);
      scheduleSave(clamped);
    },
    [scheduleSave],
  );

  // Save the last position when the chapter changes or the reader closes.
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      if (saveTimer.current) clearTimeout(saveTimer.current);
      const lastValue = percentRef.current;
      if (lastValue > 0) {
        recordProgress({
          workId: work.id,
          chapterId: chapter.id,
          chapterNumber: chapter.number,
          percent: lastValue,
          pageIndex: pageIndexRef.current,
          totalPages: pages.length,
        });
      }
    };
  }, [work.id, chapter.id, chapter.number, pages.length, recordProgress]);

  // Restore the saved page in vertical mode.
  useEffect(() => {
    if (prefs.mode !== 'vertical' || !savedForChapter) return undefined;
    const target = Math.min(savedForChapter.pageIndex ?? 0, pages.length - 1);
    if (target <= 0) return undefined;
    const timer = setTimeout(() => {
      document.getElementById(`manga-page-${target}`)?.scrollIntoView({ block: 'start' });
    }, 120);
    return () => clearTimeout(timer);
    // Reads the position once when the reader opens.
  }, []);

  useEffect(() => {
    const onFullscreenChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await document.documentElement.requestFullscreen();
    } catch {
      toast({ tone: 'error', title: 'تعذّر تفعيل ملء الشاشة على هذا المتصفح' });
    }
  };

  const changePage = useCallback(
    (nextIndex: number) => {
      const clamped = Math.max(0, Math.min(pages.length - 1, nextIndex));
      setPageIndex(clamped);
      pageIndexRef.current = clamped;
      updatePercent(((clamped + 1) / pages.length) * 100);
    },
    [pages.length, updatePercent],
  );

  useEffect(() => {
    if (prefs.mode === 'paged') {
      updatePercent(((pageIndex + 1) / pages.length) * 100);
      return undefined;
    }
    const timer = setTimeout(() => {
      document.getElementById(`manga-page-${pageIndexRef.current}`)?.scrollIntoView({ block: 'start' });
    }, 60);
    return () => clearTimeout(timer);
  }, [prefs.mode, pageIndex, pages.length, updatePercent]);

  useEffect(() => {
    if (prefs.mode !== 'vertical') return;
    const el = scrollRef.current;
    if (!el) return;
    const max = el.scrollHeight - el.clientHeight;
    percentRef.current = max > 0 ? (el.scrollTop / max) * 100 : 100;
    setPercent(percentRef.current);
  }, [prefs.mode]);

  const onScroll = () => {
    const el = scrollRef.current;
    if (!el || prefs.mode !== 'vertical') return;
    const max = el.scrollHeight - el.clientHeight;
    const value = max > 0 ? (el.scrollTop / max) * 100 : 100;
    percentRef.current = Math.max(0, Math.min(100, value));
    setPercent(percentRef.current);
    const estimatedPage = Math.min(
      pages.length - 1,
      Math.floor((percentRef.current / 100) * pages.length),
    );
    pageIndexRef.current = estimatedPage;
    scheduleSave(percentRef.current);
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && ['INPUT', 'SELECT', 'TEXTAREA'].includes(target.tagName)) return;
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        if (prefs.mode === 'paged') changePage(pageIndex + 1);
        else scrollRef.current?.scrollBy({ top: window.innerHeight * 0.9, behavior: 'smooth' });
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        if (prefs.mode === 'paged') changePage(pageIndex - 1);
        else scrollRef.current?.scrollBy({ top: -window.innerHeight * 0.9, behavior: 'smooth' });
      } else if (event.key === ' ') {
        event.preventDefault();
        if (prefs.mode === 'paged') changePage(pageIndex + 1);
        else scrollRef.current?.scrollBy({ top: window.innerHeight * 0.9, behavior: 'smooth' });
      } else if (event.key.toLowerCase() === 'f') {
        void toggleFullscreen();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  });

  const readerStyle = {
    '--reader-bg': prefs.theme === 'night' ? '#080B14' : prefs.theme === 'dim' ? '#1A2030' : '#E9E6DF',
    '--reader-bar': prefs.theme === 'night' ? 'rgba(10, 15, 26, 0.92)' : prefs.theme === 'dim' ? 'rgba(26, 32, 48, 0.94)' : 'rgba(247, 245, 240, 0.95)',
    '--reader-text': prefs.theme === 'paper' ? '#141B29' : '#EAF0FA',
    '--reader-border': prefs.theme === 'paper' ? 'rgba(20, 27, 41, 0.12)' : 'rgba(255, 255, 255, 0.12)',
  } as CSSProperties;

  return (
    <div className={`reader reader--manga reader--${prefs.theme}`} style={readerStyle}>
      <header className="reader-bar reader-bar--top">
        <div className="reader-bar__side">
          <Link className="reader-icon-btn" to={workPath(work.type, work.id)} aria-label="العودة إلى صفحة العمل">
            <Icon name="arrowRight" size={20} />
          </Link>
          <div className="reader-bar__titles">
            <span className="reader-bar__title">{work.title}</span>
            <span className="reader-bar__subtitle">{chapter.title}</span>
          </div>
        </div>

        <div className="reader-bar__center">
          <label className="reader-select">
            <span className="sr-only">اختيار الفصل</span>
            <select
              value={chapter.id}
              onChange={(event) => navigate(readerPath('manga', work.id, event.target.value))}
            >
              {work.chapters.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.title === `الفصل ${item.number}`
                    ? `الفصل ${item.number}`
                    : `الفصل ${item.number} — ${item.title}`}
                </option>
              ))}
            </select>
            <Icon name="chevronDown" size={15} />
          </label>
        </div>

        <div className="reader-bar__side reader-bar__side--end">
          <div className="reader-mode" role="group" aria-label="طريقة العرض">
            <button
              type="button"
              className={prefs.mode === 'vertical' ? 'is-active' : ''}
              onClick={() => setPrefs((current) => ({ ...current, mode: 'vertical' }))}
              aria-pressed={prefs.mode === 'vertical'}
              title="قراءة عمودية"
            >
              <Icon name="list" size={17} />
              <span>عمودي</span>
            </button>
            <button
              type="button"
              className={prefs.mode === 'paged' ? 'is-active' : ''}
              onClick={() => setPrefs((current) => ({ ...current, mode: 'paged' }))}
              aria-pressed={prefs.mode === 'paged'}
              title="قراءة بالصفحات"
            >
              <Icon name="layers" size={17} />
              <span>صفحات</span>
            </button>
          </div>
          <button
            type="button"
            className={`reader-icon-btn ${settingsOpen ? 'is-active' : ''}`.trim()}
            onClick={() => setSettingsOpen((current) => !current)}
            aria-label="إعدادات القارئ"
            aria-expanded={settingsOpen}
          >
            <Icon name="settings" size={19} />
          </button>
          <button
            type="button"
            className="reader-icon-btn"
            onClick={toggleFullscreen}
            aria-label={isFullscreen ? 'الخروج من ملء الشاشة' : 'ملء الشاشة'}
          >
            <Icon name={isFullscreen ? 'shrink' : 'expand'} size={19} />
          </button>
        </div>
      </header>

      {settingsOpen ? (
        <div className="reader-settings" role="dialog" aria-label="إعدادات القارئ">
          <div className="reader-settings__group">
            <span className="reader-settings__label">العرض</span>
            <div className="reader-settings__options">
              <button
                type="button"
                className={prefs.fit === 'width' ? 'is-active' : ''}
                onClick={() => setPrefs((current) => ({ ...current, fit: 'width' }))}
                aria-pressed={prefs.fit === 'width'}
              >
                ملء العرض
              </button>
              <button
                type="button"
                className={prefs.fit === 'height' ? 'is-active' : ''}
                onClick={() => setPrefs((current) => ({ ...current, fit: 'height' }))}
                aria-pressed={prefs.fit === 'height'}
              >
                ملء الشاشة
              </button>
            </div>
          </div>
          <div className="reader-settings__group">
            <span className="reader-settings__label">الخلفية</span>
            <div className="reader-settings__swatches">
              {(['night', 'dim', 'paper'] as ReaderTheme[]).map((theme) => (
                <button
                  key={theme}
                  type="button"
                  className={`reader-swatch reader-swatch--${theme} ${prefs.theme === theme ? 'is-active' : ''}`.trim()}
                  onClick={() => setPrefs((current) => ({ ...current, theme }))}
                  aria-pressed={prefs.theme === theme}
                  aria-label={
                    theme === 'night' ? 'خلفية داكنة' : theme === 'dim' ? 'خلفية رمادية' : 'خلفية فاتحة'
                  }
                />
              ))}
            </div>
          </div>
          <button type="button" className="reader-settings__close" onClick={() => setSettingsOpen(false)}>
            إغلاق الإعدادات
          </button>
        </div>
      ) : null}

      <div className={`reader-viewport ${prefs.mode === 'vertical' ? 'is-vertical' : 'is-paged'}`.trim()}>
        {prefs.mode === 'vertical' ? (
          <div className="reader-scroll" ref={scrollRef} onScroll={onScroll}>
            <div className={`reader-pages reader-pages--${prefs.fit}`}>
              {pages.map((page, pageNumber) => (
                <figure
                  className="reader-page"
                  key={page.id}
                  id={`manga-page-${pageNumber}`}
                >
                  <img
                    src={page.uri}
                    width={page.width}
                    height={page.height}
                    alt={`صفحة ${pageNumber + 1} من ${pages.length}`}
                    loading={pageNumber < 2 ? 'eager' : 'lazy'}
                    decoding="async"
                    draggable={false}
                  />
                </figure>
              ))}
            </div>
            <div className="reader-end">
              <span className="reader-end__icon">
                <Icon name="checkCircle" size={26} />
              </span>
              <h2>أكملت آخر صفحة في هذا الفصل</h2>
              <p>{next ? 'يمكنك الانتقال إلى الفصل التالي الآن.' : 'هذا آخر فصل متاح من العمل.'}</p>
              <div className="reader-end__actions">
                {next ? (
                  <Link className="btn btn--primary btn--md" to={readerPath('manga', work.id, next.id)}>
                    <span className="btn__label">الفصل التالي</span>
                    <Icon name="arrowLeft" size={17} />
                  </Link>
                ) : (
                  <Link className="btn btn--primary btn--md" to={workPath(work.type, work.id)}>
                    <span className="btn__label">صفحة العمل</span>
                  </Link>
                )}
                <Link className="btn btn--ghost btn--md" to="/library">
                  <span className="btn__label">المكتبة</span>
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="reader-paged">
            <button
              type="button"
              className="reader-paged__strip reader-paged__strip--next"
              onClick={() => changePage(pageIndex + 1)}
              aria-label="الصفحة التالية"
              disabled={pageIndex >= pages.length - 1}
            />
            <div className="reader-paged__stage">
              {pages[pageIndex] ? (
                <img
                  key={pages[pageIndex]?.id}
                  src={pages[pageIndex]?.uri}
                  width={pages[pageIndex]?.width}
                  height={pages[pageIndex]?.height}
                  alt={`صفحة ${pageIndex + 1} من ${pages.length}`}
                  decoding="async"
                  className="reader-paged__image"
                />
              ) : null}
            </div>
            <button
              type="button"
              className="reader-paged__strip reader-paged__strip--prev"
              onClick={() => changePage(pageIndex - 1)}
              aria-label="الصفحة السابقة"
              disabled={pageIndex <= 0}
            />
            <span className="reader-paged__counter">
              {pageIndex + 1} / {pages.length}
            </span>
          </div>
        )}
      </div>

      <footer className="reader-bar reader-bar--bottom">
        <div className="reader-nav">
          <button
            type="button"
            className="reader-nav__btn"
            disabled={!previous}
            onClick={() => previous && navigate(readerPath('manga', work.id, previous.id))}
          >
            <Icon name="chevronRight" size={18} />
            <span>الفصل السابق</span>
          </button>
          <div className="reader-progress">
            <div className="reader-progress__meta">
              <span>
                الفصل {chapter.number} من {work.chapters.length}
              </span>
              <span>{formatPercent(percent)}</span>
            </div>
            <div className="reader-progress__track" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(percent)} aria-label="تقدم القراءة">
              <span style={{ width: `${percent}%` }} />
            </div>
          </div>
          <button
            type="button"
            className="reader-nav__btn reader-nav__btn--next"
            disabled={!next}
            onClick={() => next && navigate(readerPath('manga', work.id, next.id))}
          >
            <span>الفصل التالي</span>
            <Icon name="chevronLeft" size={18} />
          </button>
        </div>
        <span className="reader-hint">
          <kbd>←</kbd> <kbd>→</kbd> للتنقل · <kbd>F</kbd> لملء الشاشة
        </span>
      </footer>
    </div>
  );
}

export default function MangaReader() {
  const { id = '', chapterId = '' } = useParams();
  const work = getWorkById(id, 'manga');
  const chapter = work?.chapters.find((item) => item.id === chapterId);

  if (!work) return <ReaderMissing type="manga" title="لم نعثر على هذا العمل" />;
  if (!chapter) return <ReaderMissing type="manga" />;

  return <MangaReaderView key={chapter.id} work={work} chapter={chapter} />;
}
