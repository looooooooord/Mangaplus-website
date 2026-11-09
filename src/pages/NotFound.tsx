import { Link } from 'react-router-dom';
import { usePageMeta } from '@/hooks/usePageMeta';
import { logoMarkUrl } from '@/lib/assets';
import { getFeatured } from '@/services/catalog';
import { ButtonLink } from '@/components/Button';
import { Icon } from '@/components/Icon';
import { WorkCard } from '@/components/WorkCard';

export default function NotFound() {
  usePageMeta({
    title: 'الصفحة غير موجودة',
    description: 'لم نعثر على الصفحة المطلوبة في موقع MangaPlus.',
    noIndex: true,
  });

  const suggestions = getFeatured(4).slice(0, 4);

  return (
    <section className="page not-found">
      <div className="container">
        <div className="not-found__hero">
          <div className="not-found__content">
            <span className="not-found__code" dir="ltr">
              404
            </span>
            <p className="eyebrow">مسار غير موجود</p>
            <h1 className="page__title">يبدو أن هذه الصفحة أخذت طريقاً آخر</h1>
            <p className="page__lead">
              الرابط غير صحيح أو أن الصفحة نُقلت. يمكنك العودة إلى الرئيسية أو استكشاف الأعمال من
              جديد.
            </p>
            <div className="not-found__actions">
              <ButtonLink to="/" iconLeft="home">
                الصفحة الرئيسية
              </ButtonLink>
              <ButtonLink to="/explore" variant="outline" iconLeft="compass">
                استكشف الأعمال
              </ButtonLink>
              <ButtonLink to="/search" variant="ghost" iconLeft="search">
                البحث
              </ButtonLink>
            </div>
            <div className="not-found__links">
              <Link to="/library">
                <Icon name="library" size={16} />
                مكتبتي
              </Link>
              <Link to="/faq">
                <Icon name="info" size={16} />
                الأسئلة الشائعة
              </Link>
              <Link to="/contact">
                <Icon name="headset" size={16} />
                اتصل بنا
              </Link>
            </div>
          </div>
          <div className="not-found__art" aria-hidden="true">
            <span className="not-found__petal not-found__petal--one" />
            <span className="not-found__petal not-found__petal--two" />
            <span className="not-found__petal not-found__petal--three" />
            <img src={logoMarkUrl} alt="" width="120" height="120" />
          </div>
        </div>

        <div className="not-found__suggestions">
          <div className="section-head">
            <div className="section-head__content">
              <p className="eyebrow">اقتراحات</p>
              <h2 className="section-head__title">ربما تبحث عن واحدة من هذه</h2>
            </div>
            <Link className="section-head__action" to="/explore">
              <span>كل الأعمال</span>
              <Icon name="arrowLeft" size={17} />
            </Link>
          </div>
          <div className="work-grid work-grid--compact">
            {suggestions.map((work) => (
              <WorkCard key={work.id} work={work} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
