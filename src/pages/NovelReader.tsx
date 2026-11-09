import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import type { Chapter, Work } from '@/types';
import { useLibrary } from '@/contexts/LibraryContext';
import { useToast } from '@/contexts/ToastContext';
import { usePageMeta } from '@/hooks/usePageMeta';
import { useScrollLock } from '@/hooks/useScrollLock';
import { formatPercent } from '@/lib/format';
import { readStoredJson, storageKeys, writeStoredJson } from '@/lib/storage';
import { getAdjacentChapters, getWorkById, readerPath, workPath } from '@/services/catalog';
import { estimateReadingMinutes } from '@/services/pages';
import { fallbackNovelChapter, getNovelChapter } from '@/data/novelContent';
import { Icon } from '@/components/Icon';
import { ReaderMissing } from '@/components/ReaderMissing';

type NovelTheme = 'paper' | 'sepia' | 'night';
type NovelFont = 'sans' | 'serif';

interface NovelPrefs {
  fontSize: number;
  lineHeight: number;
  font: NovelFont;
  theme: NovelTheme;
}

const defaultPrefs: NovelPrefs = { fontSize: 19, lineHeight: 1.95, font: 'sans', theme: 'paper' };

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function readPrefs(): NovelPrefs {
  const stored = readStoredJson<Partial<NovelPrefs>>(storageKeys.readerNovel);
  return {
    fontSize: clamp(typeof stored?.fontSize === 'number' ? stored.fontSize : defaultPrefs.fontSize, 16, 30),
    lineHeight: clamp(
      typeof stored?.lineHeight === 'number' ? stored.lineHeight : defaultPrefs.lineHeight,
      1.5,
      2.6,
    ),
    font: stored?.font === 'serif' || stored?.font === 'sans' ? stored.font : defaultPrefs.font,
    theme:
      stored?.theme === 'paper' || stored?.theme === 'sepia' || stored?.theme === 'night'
        ? stored.theme
        : defaultPrefs.theme,
  };
}

function NovelReaderView({ work, chapter }: { work: Work; chapter: Chapter }) {
  const navigate = useNavigate();
  const { state, recordProgress } = useLibrary();
  const { toast } = useToast();
  const [prefs, setPrefs] = useState<NovelPrefs>(readPrefs);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [tocOpen, setTocOpen] = useState(false);
  const [percent, setPercent] = useState(0);
  const percentRef = useRef(0);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mounted = useRef(true);

  const { previous, next } = getAdjacentChapters(work, chapter.id);
  const savedProgress = state.progress[work.id];
  const savedForChapter = savedProgress?.chapterId === chapter.id ? savedProgress : null;

  const paragraphs = useMemo(
    () => getNovelChapter(work.id, chapter.number) ?? fallbackNovelChapter(),
    [work.id, chapter.number],
  );
  const readingMinutes = useMemo(() => estimateReadingMinutes(paragraphs), [paragraphs]);

  useScrollLock(tocOpen);

  usePageMeta({
    title: `${work.title} — ${chapter.title}`,
    description: `قراءة رواية ${work.title}، ${chapter.title} على MangaPlus.`,
    noIndex: true,
  });

  useEffect(() => {
    writeStoredJson(storageKeys.readerNovel, prefs);
  }, [prefs]);

  const persist = useCallback(
    (value: number) => {
      if (!mounted.current) return;
      recordProgress({
        workId: work.id,
        chapterId: chapter.id,
        chapterNumber: chapter.number,
        percent: value,
      });
    },
    [recordProgress, work.id, chapter.id, chapter.number],
  );

  const scheduleSave = useCallback(
    (value: number) => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => persist(value), 600);
    },
    [persist],
  );

  const measure = useCallback(() => {
    const doc = document.documentElement;
    const max = doc.scrollHeight - window.innerHeight;
    const value = max > 0 ? (window.scrollY / max) * 100 : 100;
    return clamp(value, 0, 100);
  }, []);

  useEffect(() => {
    mounted.current = true;
    percentRef.current = savedForChapter?.percent ?? 0;
    setPercent(percentRef.current);

    const onScroll = () => {
      const value = measure();
      percentRef.current = value;
      setPercent(value);
      scheduleSave(value);
    };

    window.addEventListener('scroll', onScroll, { passive: true });

    const restoreTimer = setTimeout(() => {
      if (savedForChapter && savedForChapter.percent > 2) {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        window.scrollTo({ top: (savedForChapter.percent / 100) * max, behavior: 'auto' });
      }
      onScroll();
    }, 120);

    return () => {
      mounted.current = false;
      window.removeEventListener('scroll', onScroll);
      clearTimeout(restoreTimer);
      if (saveTimer.current) clearTimeout(saveTimer.current);
      if (percentRef.current > 0) {
        recordProgress({
          workId: work.id,
          chapterId: chapter.id,
          chapterNumber: chapter.number,
          percent: percentRef.current,
        });
      }
    };
    // Set up once per chapter.
  }, [chapter.id]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [chapter.id]);

  useEffect(() => {
    if (!tocOpen) return undefined;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setTocOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [tocOpen]);

  const updatePrefs = (patch: Partial<NovelPrefs>) => {
    setPrefs((current) => ({ ...current, ...patch }));
  };

  const adjustFont = (delta: number) =>
    updatePrefs({ fontSize: clamp(prefs.fontSize + delta, 16, 30) });

  const adjustLineHeight = (delta: number) =>
    updatePrefs({ lineHeight: Math.round(clamp(prefs.lineHeight + delta, 1.5, 2.6) * 100) / 100 });

  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await document.documentElement.requestFullscreen();
    } catch {
      toast({ tone: 'error', title: 'تعذّر تفعيل ملء الشاشة على هذا المتصفح' });
    }
  };

  const readerStyle = {
    '--novel-size': `${prefs.fontSize}px`,
    '--novel-leading': prefs.lineHeight,
    '--novel-font': prefs.font === 'serif' ? 'var(--font-serif)' : 'var(--font-sans)',
  } as CSSProperties;

  return (
    <div className={`reader reader--novel novel--${prefs.theme}`} style={readerStyle}>
      <div className="novel-progress" aria-hidden="true">
        <span style={{ width: `${percent}%` }} />
      </div>

      <header className="reader-bar reader-bar--top novel-bar">
        <div className="reader-bar__side">
          <Link className="reader-icon-btn" to={workPath(work.type, work.id)} aria-label="العودة إلى صفحة الرواية">
            <Icon name="arrowRight" size={20} />
          </Link>
          <div className="reader-bar__titles">
            <span className="reader-bar__title">{work.title}</span>
            <span className="reader-bar__subtitle">{chapter.title}</span>
          </div>
        </div>

        <div className="reader-bar__side reader-bar__side--end">
          <button
            type="button"
            className="reader-icon-btn"
            onClick={() => setTocOpen(true)}
            aria-label="فهرس الفصول"
            aria-haspopup="dialog"
          >
            <Icon name="list" size={20} />
          </button>
          <button
            type="button"
            className={`reader-icon-btn ${settingsOpen ? 'is-active' : ''}`.trim()}
            onClick={() => setSettingsOpen((current) => !current)}
            aria-label="إعدادات القراءة"
            aria-expanded={settingsOpen}
          >
            <Icon name="settings" size={19} />
          </button>
          <button type="button" className="reader-icon-btn" onClick={toggleFullscreen} aria-label="ملء الشاشة">
            <Icon name="expand" size={19} />
          </button>
        </div>
      </header>

      {settingsOpen ? (
        <div className="novel-settings" role="dialog" aria-label="إعدادات القراءة">
          <div className="novel-settings__row">
            <span className="novel-settings__label">حجم الخط</span>
            <div className="stepper">
              <button type="button" onClick={() => adjustFont(-1)} aria-label="تصغير الخط" disabled={prefs.fontSize <= 16}>
                −
              </button>
              <span>{prefs.fontSize}</span>
              <button type="button" onClick={() => adjustFont(1)} aria-label="تكبير الخط" disabled={prefs.fontSize >= 30}>
                +
              </button>
            </div>
          </div>

          <div className="novel-settings__row">
            <span className="novel-settings__label">ارتفاع السطر</span>
            <div className="stepper">
              <button
                type="button"
                onClick={() => adjustLineHeight(-0.1)}
                aria-label="تقليل ارتفاع السطر"
                disabled={prefs.lineHeight <= 1.5}
              >
                −
              </button>
              <span>{prefs.lineHeight.toFixed(1)}</span>
              <button
                type="button"
                onClick={() => adjustLineHeight(0.1)}
                aria-label="زيادة ارتفاع السطر"
                disabled={prefs.lineHeight >= 2.6}
              >
                +
              </button>
            </div>
          </div>

          <div className="novel-settings__row">
            <span className="novel-settings__label">نوع الخط</span>
            <div className="novel-settings__segmented">
              <button
                type="button"
                className={prefs.font === 'sans' ? 'is-active' : ''}
                onClick={() => updatePrefs({ font: 'sans' })}
                aria-pressed={prefs.font === 'sans'}
              >
                واضح
              </button>
              <button
                type="button"
                className={prefs.font === 'serif' ? 'is-active' : ''}
                onClick={() => updatePrefs({ font: 'serif' })}
                aria-pressed={prefs.font === 'serif'}
              >
                نسخ
              </button>
            </div>
          </div>

          <div className="novel-settings__row">
            <span className="novel-settings__label">لون الخلفية</span>
            <div className="reader-settings__swatches">
              {(['paper', 'sepia', 'night'] as NovelTheme[]).map((theme) => (
                <button
                  key={theme}
                  type="button"
                  className={`reader-swatch reader-swatch--${theme} ${prefs.theme === theme ? 'is-active' : ''}`.trim()}
                  onClick={() => updatePrefs({ theme })}
                  aria-pressed={prefs.theme === theme}
                  aria-label={
                    theme === 'paper' ? 'خلفية بيضاء' : theme === 'sepia' ? 'خلفية ورقية' : 'خلفية داكنة'
                  }
                />
              ))}
            </div>
          </div>

          <div className="novel-settings__footer">
            <button type="button" className="link-button" onClick={() => setPrefs(defaultPrefs)}>
              إعادة الضبط
            </button>
            <button type="button" className="novel-settings__close" onClick={() => setSettingsOpen(false)}>
              تم
            </button>
          </div>
        </div>
      ) : null}

      <main className="novel-scroll">
        <article className="novel-article">
          <header className="novel-article__head">
            <p className="novel-article__eyebrow">{work.title}</p>
            <h1 className="novel-article__title">{chapter.title}</h1>
            <p className="novel-article__meta">
              الفصل {chapter.number} · {readingMinutes} دقائق قراءة
            </p>
          </header>

          <div className="novel-article__body">
            {paragraphs.map((paragraph, index) => (
              <p key={`${chapter.id}-${index}`}>{paragraph}</p>
            ))}
          </div>

          <footer className="novel-article__foot">
            <span className="novel-article__end" aria-hidden="true">
              <Icon name="sparkles" size={20} />
            </span>
            <p>نهاية الفصل {chapter.number}</p>
            <div className="novel-article__actions">
              {previous ? (
                <Link className="btn btn--outline btn--md" to={readerPath('novel', work.id, previous.id)}>
                  <span className="btn__label">الفصل السابق</span>
                </Link>
              ) : null}
              {next ? (
                <Link className="btn btn--primary btn--md" to={readerPath('novel', work.id, next.id)}>
                  <span className="btn__label">الفصل التالي</span>
                  <Icon name="arrowLeft" size={17} />
                </Link>
              ) : (
                <Link className="btn btn--primary btn--md" to={workPath(work.type, work.id)}>
                  <span className="btn__label">صفحة الرواية</span>
                </Link>
              )}
            </div>
          </footer>
        </article>
      </main>

      <footer className="reader-bar novel-bar novel-bar--bottom">
        <button
          type="button"
          className="reader-nav__btn"
          disabled={!previous}
          onClick={() => previous && navigate(readerPath('novel', work.id, previous.id))}
        >
          <Icon name="chevronRight" size={18} />
          <span>السابق</span>
        </button>
        <div className="novel-bottom__progress">
          <span>الفصل {chapter.number} من {work.chapters.length}</span>
          <strong>{formatPercent(percent)}</strong>
        </div>
        <button
          type="button"
          className="reader-nav__btn reader-nav__btn--next"
          disabled={!next}
          onClick={() => next && navigate(readerPath('novel', work.id, next.id))}
        >
          <span>التالي</span>
          <Icon name="chevronLeft" size={18} />
        </button>
      </footer>

      {tocOpen ? (
        <div
          className="novel-toc"
          role="dialog"
          aria-modal="true"
          aria-label="فهرس الفصول"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setTocOpen(false);
          }}
        >
          <div className="novel-toc__panel">
            <div className="novel-toc__head">
              <div>
                <span className="novel-toc__eyebrow">فهرس الفصول</span>
                <h2>{work.title}</h2>
              </div>
              <button type="button" className="reader-icon-btn" onClick={() => setTocOpen(false)} aria-label="إغلاق الفهرس">
                <Icon name="close" size={19} />
              </button>
            </div>
            <ol className="novel-toc__list">
              {work.chapters.map((item) => (
                <li key={item.id}>
                  <Link
                    className={`novel-toc__item ${item.id === chapter.id ? 'is-current' : ''}`.trim()}
                    to={readerPath('novel', work.id, item.id)}
                    onClick={() => setTocOpen(false)}
                    aria-current={item.id === chapter.id ? 'page' : undefined}
                  >
                    <span className="novel-toc__num">{item.number}</span>
                    <span>{item.title}</span>
                    {item.id === chapter.id ? <Icon name="bookOpen" size={16} /> : null}
                  </Link>
                </li>
              ))}
            </ol>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default function NovelReader() {
  const { id = '', chapterId = '' } = useParams();
  const work = getWorkById(id, 'novel');
  const chapter = work?.chapters.find((item) => item.id === chapterId);

  if (!work) return <ReaderMissing type="novel" title="لم نعثر على هذه الرواية" />;
  if (!chapter) return <ReaderMissing type="novel" />;

  return <NovelReaderView key={chapter.id} work={work} chapter={chapter} />;
}
