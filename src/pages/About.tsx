import { usePageMeta } from '@/hooks/usePageMeta';
import { site } from '@/data/site';
import { ButtonLink } from '@/components/Button';
import { Icon } from '@/components/Icon';
import { SectionHeader } from '@/components/SectionHeader';
import { WorkCover } from '@/components/WorkCover';
import { getFeatured } from '@/services/catalog';

const values = [
  {
    icon: 'bookOpen' as const,
    title: 'القراءة أولاً',
    text: 'كل قرار في التصميم يخدم القراءة: مساحة أوسع للنص، أزرار واضحة، وحركة أقل تشتيتاً.',
  },
  {
    icon: 'globe' as const,
    title: 'عربية بأصولها',
    text: 'اتجاه صحيح، خطوط عربية محترفة، وواجهة لا تحتاج ترجمة ذهنية أثناء الاستخدام.',
  },
  {
    icon: 'shield' as const,
    title: 'حساب واحد',
    text: 'نفس حساب MangaPlus في التطبيق والموقع، دون تكرار أو حسابات منفصلة.',
  },
  {
    icon: 'sparkles' as const,
    title: 'تفاصيل مدروسة',
    text: 'حالات تحميل، رسائل واضحة، ووضع داكن مريح — حتى في أطول جلسات القراءة.',
  },
];

export default function About() {
  usePageMeta({
    title: 'من نحن',
    description: 'تعرّف على MangaPlus: منصة عربية للمانجا والروايات، وطريقة تفكيرنا في تجربة القراءة.',
  });

  const covers = getFeatured(3);

  return (
    <>
      <section className="page-hero">
        <div className="container page-hero__inner">
          <div>
            <p className="eyebrow">عن المنصة</p>
            <h1 className="page-hero__title">نصنع مكاناً عربياً للقراءة، لا مجرد واجهة</h1>
            <p className="page-hero__text">
              {site.name} منصة عربية تجمع المانجا والروايات في تجربة واحدة. بدأنا من سؤال بسيط: كيف
              نقرأ الفصل كاملاً دون أن نفكر في الواجهة؟ كل صفحة هنا محاولة للإجابة.
            </p>
            <div className="page-hero__actions">
              <ButtonLink to="/explore" iconLeft="compass">
                استكشف المكتبة
              </ButtonLink>
              <ButtonLink to="/features" variant="outline" iconRight="arrowLeft">
                المميزات
              </ButtonLink>
            </div>
          </div>
          <div className="page-hero__covers" aria-hidden="true">
            {covers.map((work) => (
              <div className="page-hero__cover" key={work.id}>
                <WorkCover work={work} showType={false} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="about-story">
            <div className="about-story__intro">
              <p className="eyebrow">قصتنا</p>
              <h2>من فكرة بسيطة إلى مكتبة كاملة</h2>
            </div>
            <div className="about-story__body">
              <p>
                نشأت MangaPlus من رغبة في تجربة قراءة عربية لا تشبه النسخ المترجمة من واجهات أخرى.
                لاحظنا أن القارئ العربي يقضي وقتاً في التعامل مع اتجاهات النص وأحجام الخطوط بدلاً من
                الاستمتاع بالحكاية، فبدأنا من هناك: اتجاه صحيح، خطوط مناسبة، وقارئان مختلفان
                للمانجا والروايات.
              </p>
              <p>
                اليوم تجمع المنصة مكتبة من الأعمال المتنوعة، وتقدم تجربة استكشاف واضحة وتصنيفات
                دقيقة. ونعمل باستمرار على تحسين القراءة على الهاتف، لأن الهاتف هو المكان الذي يقرأ
                فيه معظم الناس.
              </p>
              <p>
                نؤمن أن المنصة الجيدة لا تُقاس بعدد الأزرار، بل بعدد اللحظات التي تنسى فيها أنك
                تستخدمها. هذا ما نطارد في كل تحديث.
              </p>
            </div>
          </div>

          <div className="about-values">
            {values.map((value) => (
              <article className="about-value" key={value.title}>
                <span className="about-value__icon">
                  <Icon name={value.icon} size={22} />
                </span>
                <h3>{value.title}</h3>
                <p>{value.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--muted">
        <div className="container">
          <SectionHeader
            eyebrow="الحساب والخصوصية"
            title="كيف يعمل حسابك؟"
            description="حساب الموقع هو حساب التطبيق نفسه، وبيانات القراءة لها مسار واضح."
            align="center"
          />
          <div className="about-account">
            <div className="panel">
              <span className="about-account__icon">
                <Icon name="shield" size={22} />
              </span>
              <h3>مصادقة موثوقة</h3>
              <p>
                يعتمد الموقع على نظام المصادقة نفسه المستخدم في تطبيق MangaPlus. لا ننشئ حساباً
                منفصلاً، ولا نطلب كلمة مرور جديدة، ولا نخزّن كلمة المرور بأنفسنا.
              </p>
            </div>
            <div className="panel">
              <span className="about-account__icon">
                <Icon name="device" size={22} />
              </span>
              <h3>مكتبتك على جهازك</h3>
              <p>
                تُحفظ المفضلة والمتابعة وسجل القراءة في متصفح هذا الجهاز. هذا يعني أنك تجدها عند
                العودة من الجهاز نفسه، دون الحاجة إلى حساب.
              </p>
            </div>
            <div className="panel">
              <span className="about-account__icon">
                <Icon name="mail" size={22} />
              </span>
              <h3>روابط تبقى داخل الموقع</h3>
              <p>
                التحقق من البريد وإعادة تعيين كلمة المرور يحدثان في صفحات MangaPlus، برسائل واضحة
                وخطوات قليلة، دون رموز تظهر على الشاشة.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="explore-cta">
            <div>
              <h2>تعرّف على التجربة بنفسك</h2>
              <p>أفضل طريقة لفهم MangaPlus هي أن تفتح فصلاً وتقرأ.</p>
            </div>
            <div className="explore-cta__actions">
              <ButtonLink to="/explore" variant="primary" iconLeft="compass">
                ابدأ الاستكشاف
              </ButtonLink>
              <ButtonLink to="/contact" variant="outline" iconLeft="headset">
                تواصل معنا
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
