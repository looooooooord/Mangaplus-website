import { Link } from 'react-router-dom';
import { site } from '@/data/site';
import { usePageMeta } from '@/hooks/usePageMeta';
import { ButtonLink } from '@/components/Button';
import { Icon } from '@/components/Icon';
import { SectionHeader } from '@/components/SectionHeader';

const topics = [
  {
    icon: 'headset' as const,
    title: 'الدعم الفني',
    description: 'مشكلة في تسجيل الدخول، رابط تحقق، أو سلوك غير متوقع في القراءة.',
    value: site.contacts.support,
  },
  {
    icon: 'shield' as const,
    title: 'الخصوصية والبيانات',
    description: 'استفسارات عن بيانات الحساب، التخزين المحلي، أو طلب متعلق ببياناتك.',
    value: site.contacts.privacy,
  },
  {
    icon: 'sparkles' as const,
    title: 'الشراكات والمحتوى',
    description: 'استفسارات الناشرين والمؤلفين حول التعاون ونشر الأعمال.',
    value: site.contacts.partnerships,
  },
];

export default function Contact() {
  usePageMeta({
    title: 'اتصل بنا',
    description: 'قنوات التواصل الرسمية مع فريق MangaPlus، وطرق الوصول إلى الدعم والمساعدة.',
  });

  return (
    <>
      <section className="page-hero page-hero--compact">
        <div className="container page-hero__inner">
          <div>
            <p className="eyebrow">التواصل</p>
            <h1 className="page-hero__title">كيف يمكننا مساعدتك؟</h1>
            <p className="page-hero__text">
              قبل التواصل، جرّب الأسئلة الشائعة — كثير من الاستفسارات عن الحساب والقراءة لها إجابة
              سريعة هناك.
            </p>
            <div className="page-hero__actions">
              <ButtonLink to="/faq" iconLeft="info">
                الأسئلة الشائعة
              </ButtonLink>
              <ButtonLink to="/account" variant="outline" iconRight="arrowLeft">
                إعدادات الحساب
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>

      <section className="page">
        <div className="container">
          <SectionHeader
            eyebrow="القنوات الرسمية"
            title="اختر موضوع رسالتك"
            description="تُنشر عناوين التواصل الرسمية هنا عند اعتمادها. لا نستخدم أرقاماً أو عناوين غير رسمية."
          />
          <div className="contact-grid">
            {topics.map((topic) => (
              <article className="contact-card" key={topic.title}>
                <span className="contact-card__icon">
                  <Icon name={topic.icon} size={22} />
                </span>
                <h2>{topic.title}</h2>
                <p>{topic.description}</p>
                {topic.value ? (
                  <a className="contact-card__value" href={`mailto:${topic.value}`} dir="ltr">
                    <Icon name="mail" size={15} />
                    {topic.value}
                  </a>
                ) : (
                  <span className="contact-card__pending">
                    <Icon name="clock" size={15} />
                    القناة الرسمية قيد الاعتماد
                  </span>
                )}
              </article>
            ))}
          </div>

          <div className="contact-layout">
            <div className="panel contact-checklist">
              <h2 className="panel__title panel__title--sm">قبل إرسال رسالتك</h2>
              <p className="panel__text">
                إضافة هذه التفاصيل تساعدنا على الرد بسرعة، دون الحاجة إلى أسئلة إضافية.
              </p>
              <ul>
                <li>
                  <Icon name="check" size={15} />
                  البريد الإلكتروني المرتبط بحسابك (إن كانت المشكلة في الحساب).
                </li>
                <li>
                  <Icon name="check" size={15} />
                  وصف مختصر لما حدث، والخطوة التي سبقته.
                </li>
                <li>
                  <Icon name="check" size={15} />
                  اسم العمل والفصل إن كانت المشكلة أثناء القراءة.
                </li>
                <li>
                  <Icon name="check" size={15} />
                  نوع الجهاز والمتصفح، دون إرسال كلمة المرور أو رموز التحقق.
                </li>
              </ul>
            </div>

            <div className="panel panel--soft contact-safe">
              <span className="contact-safe__icon">
                <Icon name="shield" size={24} />
              </span>
              <h2 className="panel__title panel__title--sm">حماية حسابك</h2>
              <p className="panel__text">
                لا تشارك كلمة المرور أو روابط التحقق أو إعادة التعيين مع أي جهة، بما في ذلك من يدّعي
                أنه من فريق MangaPlus. لا نطلب هذه المعلومات عبر الرسائل.
              </p>
              <Link className="link-button" to="/forgot-password">
                استعادة كلمة المرور
                <Icon name="arrowLeft" size={15} />
              </Link>
            </div>
          </div>

          <div className="contact-quick">
            <h2>مشكلة شائعة؟</h2>
            <div className="contact-quick__grid">
              <Link to="/login">
                <Icon name="lock" size={18} />
                لا أستطيع تسجيل الدخول
              </Link>
              <Link to="/account">
                <Icon name="mail" size={18} />
                لم يصل رابط التحقق
              </Link>
              <Link to="/library">
                <Icon name="library" size={18} />
                مكتبتي لا تظهر
              </Link>
              <Link to="/faq">
                <Icon name="info" size={18} />
                أسئلة أخرى
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
