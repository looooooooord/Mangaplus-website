import { site, hasDownloadLink } from '@/data/site';
import { usePageMeta } from '@/hooks/usePageMeta';
import { ButtonAnchor, ButtonLink } from '@/components/Button';
import { Icon } from '@/components/Icon';
import { WorkCover } from '@/components/WorkCover';
import { getFeatured } from '@/services/catalog';

const appFeatures = [
  {
    icon: 'layers' as const,
    title: 'قراءة مصممة للهاتف',
    text: 'قارئ يعمل بسلاسة على الشاشات الصغيرة، مع تحكم واضح بلمسة واحدة.',
  },
  {
    icon: 'library' as const,
    title: 'حساب MangaPlus',
    text: 'سجّل الدخول بالحساب نفسه المستخدم في الموقع، دون بيانات جديدة.',
  },
  {
    icon: 'bookOpen' as const,
    title: 'مانجا وروايات',
    text: 'مكتبة واحدة تجمع القصص المصورة والروايات النصية.',
  },
  {
    icon: 'moon' as const,
    title: 'وضع داكن',
    text: 'قراءة مريحة في الإضاءة المنخفضة، دون إجهاد للعين.',
  },
];

const steps = [
  { title: 'افتح صفحة التحميل الرسمية', text: 'ننشر الرابط الرسمي هنا فقط، ولا نستخدم روابط خارجية غير معلنة.' },
  { title: 'ثبّت التطبيق', text: 'اتبع خطوات التثبيت المعتادة على جهاز أندرويد من المتجر الرسمي.' },
  { title: 'سجّل الدخول', text: 'استخدم بريدك وكلمة المرور نفسها لحساب MangaPlus.' },
];

export default function Download() {
  usePageMeta({
    title: 'تحميل التطبيق',
    description: 'تعرّف على تطبيق MangaPlus لأندرويد وطريقة الحصول على النسخة الرسمية.',
  });

  const covers = getFeatured(2);

  return (
    <>
      <section className="download-hero">
        <div className="download-hero__bg" aria-hidden="true" />
        <div className="container download-hero__inner">
          <div className="download-hero__content">
            <p className="eyebrow eyebrow--light">تطبيق أندرويد</p>
            <h1 className="download-hero__title">تطبيق MangaPlus في جيبك</h1>
            <p className="download-hero__text">
              مكتبتك وقارئك المفضل على الهاتف. التطبيق يستخدم حساب MangaPlus نفسه، فتنتقل بين الموقع
              والتطبيق دون إنشاء حساب آخر.
            </p>
            <div className="download-hero__actions">
              {hasDownloadLink ? (
                <ButtonAnchor
                  href={site.android.downloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  size="lg"
                  iconLeft="download"
                >
                  تحميل من المتجر الرسمي
                </ButtonAnchor>
              ) : (
                <div className="download-status" role="status">
                  <span className="download-status__icon">
                    <Icon name="device" size={20} />
                  </span>
                  <div>
                    <strong>رابط التحميل الرسمي لم يُنشر بعد</strong>
                    <p>سيظهر رابط المتجر الرسمي في هذه الصفحة عند اعتماده.</p>
                  </div>
                </div>
              )}
              <ButtonLink to="/explore" variant="glass" size="lg" iconRight="arrowLeft">
                اقرأ على الموقع الآن
              </ButtonLink>
            </div>
            <p className="download-hero__note">
              <Icon name="shield" size={15} />
              ننشر روابط التحميل الرسمية فقط، ولا نطلب منك تفعيل مصادر غير معروفة.
            </p>
          </div>

          <div className="download-hero__visual" aria-hidden="true">
            <div className="download-phone">
              <span className="download-phone__notch" />
              <div className="download-phone__screen">
                <div className="download-phone__top">
                  <img src="/assets/logo-mark.svg" alt="" width="30" height="30" />
                  <span>MangaPlus</span>
                </div>
                <div className="download-phone__covers">
                  {covers.map((work) => (
                    <div className="download-phone__cover" key={work.id}>
                      <WorkCover work={work} showType={false} />
                    </div>
                  ))}
                </div>
                <span className="download-phone__line" />
                <span className="download-phone__line download-phone__line--short" />
                <div className="download-phone__nav">
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            </div>
            <span className="download-hero__ring download-hero__ring--one" />
            <span className="download-hero__ring download-hero__ring--two" />
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="download-intro">
            <div>
              <p className="eyebrow">لماذا التطبيق</p>
              <h2>التجربة نفسها، بحجم يناسب يدك</h2>
            </div>
            <p>
              صُمم التطبيق لمن يقرأ في الطريق أو قبل النوم: خطوط واضحة، انتقالات سريعة، وواجهة
              تعمل بيد واحدة. وكل ما تضيفه إلى مكتبتك يبقى مرتباً.
            </p>
          </div>

          <div className="download-features">
            {appFeatures.map((feature) => (
              <article className="download-feature" key={feature.title}>
                <span className="download-feature__icon">
                  <Icon name={feature.icon} size={21} />
                </span>
                <h3>{feature.title}</h3>
                <p>{feature.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--muted">
        <div className="container">
          <div className="download-steps">
            <div className="download-steps__head">
              <p className="eyebrow">البدء</p>
              <h2>كيف تحصل على التطبيق؟</h2>
              <p>ثلاث خطوات واضحة، دون روابط وسطية أو ملفات غير رسمية.</p>
            </div>
            <ol className="download-steps__list">
              {steps.map((step, index) => (
                <li key={step.title}>
                  <span className="download-steps__num">{index + 1}</span>
                  <div>
                    <h3>{step.title}</h3>
                    <p>{step.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className="download-cta">
            <div>
              <h2>لا تنتظر التطبيق للبدء</h2>
              <p>كل ما في الموقع يعمل الآن على متصفح هاتفك، بما في ذلك القارئان والمكتبة.</p>
            </div>
            <div className="download-cta__actions">
              <ButtonLink to="/explore" variant="primary" iconLeft="compass">
                استكشف الأعمال
              </ButtonLink>
              <ButtonLink to="/features" variant="outline" iconRight="arrowLeft">
                المميزات
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
