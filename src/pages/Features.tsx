import { usePageMeta } from '@/hooks/usePageMeta';
import { features } from '@/data/faqs';
import { ButtonLink } from '@/components/Button';
import { Icon, type IconName } from '@/components/Icon';
import { SectionHeader } from '@/components/SectionHeader';

const iconMap: Record<string, IconName> = {
  library: 'library',
  reader: 'layers',
  book: 'bookOpen',
  search: 'search',
  theme: 'moon',
  account: 'shield',
};

const deepDives = [
  {
    id: 'manga-reader',
    eyebrow: 'قارئ المانجا',
    title: 'تفاصيل مصممة للصفحات المصورة',
    text: 'اختر قراءة عمودية تتابع فيها الفصول بسلاسة، أو قراءة بالصفحات عندما تريد التركيز على صفحة واحدة. القارئ يدعم ملء الشاشة، وتغيير الخلفية، واختيار الفصل من مكان واحد.',
    points: [
      'عرض عمودي أو صفحة واحدة',
      'ملء عرض الصفحة أو الشاشة بالكامل',
      'أزرار واضحة للفصل السابق والتالي',
      'حفظ موضع القراءة على جهازك',
      'اختصارات لوحة المفاتيح على الكمبيوتر',
    ],
    icon: 'layers' as IconName,
  },
  {
    id: 'novel-reader',
    eyebrow: 'قارئ الروايات',
    title: 'نص مريح يمكنك تشكيله كما تحب',
    text: 'القراءة الطويلة تحتاج تفاصيل مختلفة. يمنحك قارئ الروايات تحكماً مباشراً في حجم الخط، وارتفاع السطر، ونوع الخط، ولون الخلفية، مع فهرس للفصول وشريط تقدم واضح.',
    points: [
      'أحجام خط من 16 إلى 30',
      'ارتفاع سطر قابل للتعديل',
      'خط واضح أو خط نسخي للروايات',
      'ثلاث خلفيات قراءة: بيضاء وورقية وداكنة',
      'فهرس فصول منسدل وسريع',
    ],
    icon: 'bookOpen' as IconName,
  },
  {
    id: 'library',
    eyebrow: 'المكتبة',
    title: 'مفضلة ومتابعة وسجل قراءة في ترتيب واحد',
    text: 'كل عمل تضيفه يظهر في مكتبتك مع نسبة تقدم القراءة وآخر فصل وصلت إليه. رتّب المكتبة حسب الأحدث أو الاسم أو التقدم، واعثر على ما تريد متابعته في ثوانٍ.',
    points: [
      'أقسام للمفضلة والمتابعة وسجل القراءة',
      'متابعة تقدم القراءة لكل عمل',
      'تمييز الأعمال المكتملة',
      'ترتيب وفلاتر سريعة',
      'يبقى محفوظاً على جهازك',
    ],
    icon: 'library' as IconName,
  },
  {
    id: 'search',
    eyebrow: 'الاستكشاف',
    title: 'ابحث بطريقتك، لا بطريقة النظام',
    text: 'البحث يتعامل مع العربية كما تُكتب فعلاً: يتجاهل التشكيل ويوحّد الألف والهمزة والتاء المربوطة. أضف إلى ذلك فلاتر النوع والتصنيف والحالة، وترتيباً حسب الأحدث أو الشهرة أو التقييم.',
    points: [
      'بحث فوري أثناء الكتابة',
      'تطبيع النص العربي في البحث',
      'فلاتر للنوع والتصنيف والحالة',
      'سجل بحث محلي يمكن مسحه',
      'اقتراحات وتصنيفات للبدء',
    ],
    icon: 'search' as IconName,
  },
];

export default function Features() {
  usePageMeta({
    title: 'المميزات',
    description:
      'تعرّف على مميزات MangaPlus: قارئ مانجا وقارئ روايات، مكتبة منظمة، بحث عربي، وضع داكن وحساب موحد.',
  });

  return (
    <>
      <section className="page-hero page-hero--compact">
        <div className="container page-hero__inner">
          <div>
            <p className="eyebrow">لماذا MangaPlus</p>
            <h1 className="page-hero__title">مميزات تعمل فعلاً، لا مجرد قائمة</h1>
            <p className="page-hero__text">
              كل ميزة هنا موجودة في الموقع وتستطيع تجربتها الآن: من القارئين إلى المكتبة والبحث
              والحساب.
            </p>
            <div className="page-hero__actions">
              <ButtonLink to="/explore" iconLeft="compass">
                جرّب القراءة
              </ButtonLink>
              <ButtonLink to="/faq" variant="outline" iconRight="arrowLeft">
                الأسئلة الشائعة
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="features-grid features-grid--wide">
            {features.map((feature) => (
              <article className="feature-card" key={feature.title}>
                <span className="feature-card__icon">
                  <Icon name={iconMap[feature.icon] ?? 'sparkles'} size={22} />
                </span>
                <h2>{feature.title}</h2>
                <p>{feature.description}</p>
              </article>
            ))}
            <article className="feature-card">
              <span className="feature-card__icon">
                <Icon name="device" size={22} />
              </span>
              <h2>على كل المقاسات</h2>
              <p>تصميم يعمل على الهاتف واللوحي والكمبيوتر، مع تجربة هاتف مستقلة لا تصغير لواجهة.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="section section--muted">
        <div className="container">
          <SectionHeader
            eyebrow="بالتفصيل"
            title="كيف تعمل المميزات"
            description="نظرة أقرب على الأجزاء التي تستخدمها في كل جلسة قراءة."
            align="center"
          />
          <div className="deep-dives">
            {deepDives.map((item, index) => (
              <article className={`deep-dive ${index % 2 === 1 ? 'deep-dive--flip' : ''}`.trim()} key={item.id} id={item.id}>
                <div className="deep-dive__visual" aria-hidden="true">
                  <span className="deep-dive__badge">{String(index + 1).padStart(2, '0')}</span>
                  <div className="deep-dive__mock">
                    <div className="deep-dive__mock-bar">
                      <span />
                      <span />
                      <span />
                    </div>
                    <div className="deep-dive__mock-body">
                      {Array.from({ length: 4 }, (_, line) => (
                        <span
                          key={line}
                          className={`deep-dive__mock-line ${line === 3 ? 'is-short' : ''}`.trim()}
                        />
                      ))}
                      <span className="deep-dive__mock-tile" />
                      <span className="deep-dive__mock-tile deep-dive__mock-tile--alt" />
                    </div>
                  </div>
                  <span className="deep-dive__icon">
                    <Icon name={item.icon} size={22} />
                  </span>
                </div>
                <div className="deep-dive__content">
                  <p className="eyebrow">{item.eyebrow}</p>
                  <h2>{item.title}</h2>
                  <p>{item.text}</p>
                  <ul className="deep-dive__points">
                    {item.points.map((point) => (
                      <li key={point}>
                        <Icon name="check" size={15} />
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="explore-cta">
            <div>
              <h2>جاهز للتجربة؟</h2>
              <p>افتح عملاً وابدأ القراءة، ثم عد إلى مكتبتك لتجد موضعك محفوظاً.</p>
            </div>
            <div className="explore-cta__actions">
              <ButtonLink to="/explore" variant="primary" iconLeft="compass">
                استكشف الأعمال
              </ButtonLink>
              <ButtonLink to="/download" variant="outline" iconLeft="device">
                تطبيق أندرويد
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
