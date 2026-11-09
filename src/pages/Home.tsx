import { Link } from 'react-router-dom';
import { useLibrary } from '@/contexts/LibraryContext';
import { faqs, features } from '@/data/faqs';
import { site } from '@/data/site';
import { usePageMeta } from '@/hooks/usePageMeta';
import { formatCompact, timeAgo } from '@/lib/format';
import { logoMarkUrl } from '@/lib/assets';
import {
  getByType,
  getFeatured,
  getLatestChapters,
  getWorkById,
  readerPath,
  workPath,
} from '@/services/catalog';
import { AppDownloadButton } from '@/components/AppDownloadButton';
import { ButtonLink } from '@/components/Button';
import { Icon, type IconName } from '@/components/Icon';
import { NovelCard } from '@/components/NovelCard';
import { ProgressBar } from '@/components/ProgressBar';
import { Rating } from '@/components/Rating';
import { SectionHeader } from '@/components/SectionHeader';
import { StatusBadge, TypeBadge } from '@/components/Badge';
import { WorkCard } from '@/components/WorkCard';
import { WorkCover } from '@/components/WorkCover';

const featureIcons: Record<string, IconName> = {
  library: 'library',
  reader: 'layers',
  book: 'bookOpen',
  search: 'search',
  theme: 'moon',
  account: 'shield',
};

export default function Home() {
  usePageMeta({
    title: 'الرئيسية',
    description:
      'اكتشف المانجا والروايات على MangaPlus، تابع الفصول الجديدة، واقرأ بواجهة عربية مريحة على الهاتف والكمبيوتر.',
  });

  const featured = getFeatured(6);
  const heroWorks = featured.slice(0, 3);
  const latest = getLatestChapters(6);
  const manga = getByType('manga', 6);
  const novels = getByType('novel', 4);
  const { state } = useLibrary();

  const continueReading = Object.values(state.progress)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 3)
    .map((entry) => ({ entry, work: getWorkById(entry.workId) }))
    .filter((item) => item.work);

  return (
    <>
      <section className="hero">
        <div className="hero__bg" aria-hidden="true">
          <span className="hero__orb hero__orb--one" />
          <span className="hero__orb hero__orb--two" />
          <span className="hero__grid" />
        </div>
        <div className="container hero__inner">
          <div className="hero__content">
            <p className="hero__eyebrow">
              <span className="hero__eyebrow-dot" aria-hidden="true" />
              {site.name} · منصة المانجا والروايات
            </p>
            <h1 className="hero__title">
              عالم المانجا والروايات
              <span className="hero__title-line">بين يديك، بلا تشتيت</span>
            </h1>
            <p className="hero__text">
              استكشف مكتبة عربية متجددة من المانجا والروايات، اقرأ بقارئ مصمم لكل نوع، وأكمل من حيث
              توقفت في أي وقت.
            </p>
            <div className="hero__actions">
              <ButtonLink to="/explore" size="lg" iconLeft="compass">
                استكشف الأعمال
              </ButtonLink>
              <AppDownloadButton variant="glass" size="lg" />
            </div>
            <ul className="hero__points">
              <li>
                <Icon name="checkCircle" size={17} /> واجهة عربية كاملة
              </li>
              <li>
                <Icon name="checkCircle" size={17} /> قارئ مانجا وقارئ روايات
              </li>
              <li>
                <Icon name="checkCircle" size={17} /> حساب MangaPlus نفسه
              </li>
            </ul>
          </div>

          <div className="hero__visual">
            <div className="hero__covers" aria-hidden="true">
              {heroWorks.map((work, index) => (
                <div className={`hero__cover hero__cover--${index}`} key={work.id}>
                  <WorkCover work={work} showType={false} />
                </div>
              ))}
            </div>
            <div className="hero__badge hero__badge--top" aria-hidden="true">
              <span className="hero__badge-icon">
                <Icon name="bookOpen" size={18} />
              </span>
              <span>
                <strong>قارئان مخصصان</strong>
                <small>مانجا · روايات</small>
              </span>
            </div>
            <div className="hero__badge hero__badge--bottom" aria-hidden="true">
              <span className="hero__badge-icon">
                <Icon name="moon" size={18} />
              </span>
              <span>
                <strong>وضع داكن</strong>
                <small>مريح للعين ليلاً</small>
              </span>
            </div>
          </div>
        </div>
      </section>

      {continueReading.length > 0 ? (
        <section className="section section--tight">
          <div className="container">
            <SectionHeader
              eyebrow="متابعة"
              title="أكمل من حيث توقفت"
              description="آخر ما قرأته على هذا الجهاز."
              actionLink={{ label: 'المكتبة', to: '/library' }}
            />
            <div className="resume-grid">
              {continueReading.map(({ entry, work }) =>
                work ? (
                  <Link key={entry.workId} className="resume-card" to={readerPath(work.type, work.id, entry.chapterId)}>
                    <span className="resume-card__cover">
                      <WorkCover work={work} showType={false} />
                    </span>
                    <span className="resume-card__body">
                      <span className="resume-card__title">{work.title}</span>
                      <span className="resume-card__meta">الفصل {entry.chapterNumber}</span>
                      <ProgressBar value={entry.percent} showValue />
                    </span>
                    <span className="resume-card__play">
                      <Icon name="play" size={16} />
                    </span>
                  </Link>
                ) : null,
              )}
            </div>
          </div>
        </section>
      ) : null}

      <section className="section">
        <div className="container">
          <SectionHeader
            eyebrow="مختارات MangaPlus"
            title="أعمال تستحق البداية بها"
            description="مجموعة مختارة من الأعمال التي يتابعها القراء أكثر."
            actionLink={{ label: 'كل الأعمال', to: '/explore' }}
          />
          <div className="featured-rail">
            {featured.slice(0, 6).map((work, index) => (
              <div className="featured-rail__item" key={work.id}>
                <span className="featured-rail__rank">{String(index + 1).padStart(2, '0')}</span>
                <WorkCard work={work} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--muted">
        <div className="container">
          <SectionHeader
            eyebrow="جديد المكتبة"
            title="أحدث الفصول"
            description="آخر ما أُضيف إلى الأعمال في المكتبة."
            actionLink={{ label: 'استكشف الكل', to: '/explore?sort=latest' }}
          />
          <div className="latest-layout">
            <div className="latest-list">
              {latest.map(({ work, chapter }) => (
                <Link
                  key={`${work.id}-${chapter.id}`}
                  className="latest-item"
                  to={readerPath(work.type, work.id, chapter.id)}
                >
                  <span className="latest-item__cover">
                    <WorkCover work={work} showType={false} />
                  </span>
                  <span className="latest-item__body">
                    <span className="latest-item__top">
                      <span className="latest-item__title">{work.title}</span>
                      <TypeBadge type={work.type} />
                    </span>
                    <span className="latest-item__meta">
                      {chapter.title} · {timeAgo(chapter.publishedAt)}
                    </span>
                  </span>
                  <span className="latest-item__action" aria-hidden="true">
                    <Icon name="arrowLeft" size={17} />
                  </span>
                </Link>
              ))}
            </div>

            <aside className="rank-panel" aria-label="الأكثر قراءة">
              <div className="rank-panel__head">
                <span className="rank-panel__icon">
                  <Icon name="sparkles" size={18} />
                </span>
                <div>
                  <h3>الأكثر قراءة</h3>
                  <p>اختيارات القراء هذا الأسبوع</p>
                </div>
              </div>
              <ol className="rank-panel__list">
                {featured.slice(0, 4).map((work, index) => (
                  <li key={work.id}>
                    <Link to={workPath(work.type, work.id)}>
                      <span className="rank-panel__rank">{index + 1}</span>
                      <span className="rank-panel__body">
                        <span className="rank-panel__title">{work.title}</span>
                        <span className="rank-panel__meta">{formatCompact(work.readers)} قارئ</span>
                      </span>
                      <Rating value={work.rating} showValue={false} />
                    </Link>
                  </li>
                ))}
              </ol>
              <Link className="rank-panel__more" to="/explore?sort=popular">
                عرض القائمة كاملة
                <Icon name="arrowLeft" size={16} />
              </Link>
            </aside>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHeader
            eyebrow="مانجا"
            title="فصول مصورة بتفاصيلها"
            description="قصص مصورة بأساليب رسم متنوعة، من الأكشن إلى الغموض."
            actionLink={{ label: 'كل المانجا', to: '/explore?type=manga' }}
          />
          <div className="work-grid">
            {manga.map((work) => (
              <WorkCard key={work.id} work={work} />
            ))}
          </div>
        </div>
      </section>

      <section className="section section--muted">
        <div className="container">
          <SectionHeader
            eyebrow="روايات"
            title="حكايات تُقرأ على مهل"
            description="نصوص عربية كاملة، بقارئ مريح وتخصيص كامل للقراءة."
            actionLink={{ label: 'كل الروايات', to: '/explore?type=novel' }}
          />
          <div className="novel-grid">
            {novels.map((work) => (
              <NovelCard key={work.id} work={work} />
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHeader
            eyebrow="لماذا MangaPlus"
            title="تفاصيل تجعل القراءة أسهل"
            description="كل ما تحتاجه للقراءة في مكان واحد، بواجهة لا تشتت انتباهك."
            align="center"
          />
          <div className="features-grid">
            {features.map((feature) => (
              <article className="feature-card" key={feature.title}>
                <span className="feature-card__icon">
                  <Icon name={featureIcons[feature.icon] ?? 'sparkles'} size={22} />
                </span>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="why">
            <div className="why__content">
              <p className="eyebrow">تجربة MangaPlus</p>
              <h2 className="why__title">قراءة مصممة للعربية، لا مجرد ترجمة واجهة</h2>
              <p className="why__text">
                بدأنا من اتجاه النص ومقاسات الخطوط، لا من قالب جاهز. النتيجة واجهة تقرأ فيها الفصل
                كاملاً دون أن تبحث عن الزر التالي.
              </p>
              <ul className="why__list">
                <li>
                  <span className="why__check">
                    <Icon name="check" size={16} />
                  </span>
                  <div>
                    <h3>اتجاه ونصوص سليمة</h3>
                    <p>عناوين وفصول ونصوص مختلطة العربية واللاتينية بترتيب صحيح.</p>
                  </div>
                </li>
                <li>
                  <span className="why__check">
                    <Icon name="check" size={16} />
                  </span>
                  <div>
                    <h3>قراءة بلا مقاطعة</h3>
                    <p>قارئ بملء الشاشة، أزرار واضحة، وحفظ تلقائي لموضع القراءة.</p>
                  </div>
                </li>
                <li>
                  <span className="why__check">
                    <Icon name="check" size={16} />
                  </span>
                  <div>
                    <h3>كل شيء في مكانه</h3>
                    <p>المفضلة والمتابعة وسجل القراءة في مكتبة واحدة مرتبة.</p>
                  </div>
                </li>
              </ul>
              <div className="why__actions">
                <ButtonLink to="/features" variant="primary" iconRight="arrowLeft">
                  تعرّف على المميزات
                </ButtonLink>
                <ButtonLink to="/library" variant="ghost">
                  افتح مكتبتك
                </ButtonLink>
              </div>
            </div>

            <div className="why__visual">
              <div className="why__panel">
                <div className="why__panel-head">
                  <span className="why__panel-dots" aria-hidden="true">
                    <i />
                    <i />
                    <i />
                  </span>
                  <span className="why__panel-title">قارئ الروايات</span>
                </div>
                <div className="why__page">
                  <p className="why__page-eyebrow">الفصل الثالث</p>
                  <h3>رسائل لم تُقرأ</h3>
                  <p>
                    لم تكن مريم تنوي فتح الصندوق. كان موضوعاً في أعلى الخزانة كما تركته جدتها،
                    مغطىً بقطعة قماشٍ زرقاء…
                  </p>
                  <span className="why__page-line" />
                  <span className="why__page-line why__page-line--short" />
                  <div className="why__page-foot">
                    <span>
                      <Icon name="bookOpen" size={14} /> وضع مريح
                    </span>
                    <span>٧٤٪</span>
                  </div>
                </div>
              </div>
              <div className="why__chip why__chip--one">
                <Icon name="heartFilled" size={16} /> المفضلة
              </div>
              <div className="why__chip why__chip--two">
                <Icon name="moon" size={16} /> وضع داكن
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section section--muted">
        <div className="container">
          <div className="faq-teaser">
            <div className="faq-teaser__head">
              <p className="eyebrow">الأسئلة الشائعة</p>
              <h2>أسئلة يبدأ بها الجميع</h2>
              <p>إجابات مختصرة عن الحساب والمكتبة والقراءة على MangaPlus.</p>
              <ButtonLink to="/faq" variant="outline" iconRight="arrowLeft">
                كل الأسئلة
              </ButtonLink>
            </div>
            <div className="accordion">
              {faqs.slice(0, 5).map((faq) => (
                <details className="accordion__item" key={faq.question}>
                  <summary className="accordion__summary">
                    <span>{faq.question}</span>
                    <Icon name="chevronDown" size={18} className="accordion__chevron" />
                  </summary>
                  <div className="accordion__body">
                    <p>{faq.answer}</p>
                  </div>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="app-cta">
            <div className="app-cta__content">
              <p className="eyebrow eyebrow--light">تطبيق MangaPlus</p>
              <h2>مكتبتك معك أينما ذهبت</h2>
              <p>
                تطبيق MangaPlus لأندرويد مصمم للقراءة على الهاتف. تعرّف على التطبيق ومتطلباته من
                صفحة التحميل.
              </p>
              <div className="app-cta__actions">
                <AppDownloadButton variant="primary" size="lg" />
                <ButtonLink to="/download" variant="glass" size="lg" iconRight="arrowLeft">
                  تفاصيل التطبيق
                </ButtonLink>
              </div>
            </div>
            <div className="app-cta__art" aria-hidden="true">
              <div className="app-cta__phone">
                <span className="app-cta__phone-notch" />
                <div className="app-cta__phone-screen">
                  <img src={logoMarkUrl} alt="" width="44" height="44" />
                  <span className="app-cta__phone-title">MangaPlus</span>
                  <span className="app-cta__phone-line" />
                  <span className="app-cta__phone-line app-cta__phone-line--short" />
                  <span className="app-cta__phone-cover">
                    <WorkCover work={novels[0]!} showType={false} />
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section section--tight">
        <div className="container">
          <div className="explore-cta">
            <div>
              <h2>جاهز لعملك القادم؟</h2>
              <p>تصفّح المكتبة حسب النوع أو التصنيف أو الحالة، واختر البداية المناسبة لك.</p>
            </div>
            <div className="explore-cta__actions">
              <ButtonLink to="/explore" variant="primary" iconLeft="compass">
                استكشف الآن
              </ButtonLink>
              <ButtonLink to="/search" variant="outline" iconLeft="search">
                ابحث بالاسم
              </ButtonLink>
            </div>
          </div>
          <p className="home-note">
            <StatusBadge status="ongoing" />
            <span>مكتبة MangaPlus تتجدد باستمرار</span>
            <span aria-hidden="true">·</span>
            <Link to="/about">تعرّف على المنصة</Link>
          </p>
        </div>
      </section>
    </>
  );
}
