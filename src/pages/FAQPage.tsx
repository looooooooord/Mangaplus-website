import { usePageMeta } from '@/hooks/usePageMeta';
import { faqs } from '@/data/faqs';
import { ButtonLink } from '@/components/Button';
import { Icon } from '@/components/Icon';

export default function FAQPage() {
  usePageMeta({
    title: 'الأسئلة الشائعة',
    description:
      'إجابات عن الحساب والمكتبة والقراءة وتطبيق MangaPlus: أسئلة يتكرر طرحها من القراء.',
  });

  return (
    <>
      <section className="page-hero page-hero--compact">
        <div className="container page-hero__inner">
          <div>
            <p className="eyebrow">المساعدة</p>
            <h1 className="page-hero__title">الأسئلة الشائعة</h1>
            <p className="page-hero__text">
              جمعنا أكثر الأسئلة تكراراً عن الحساب والمكتبة والقراءة. إن لم تجد إجابتك، صفحة الاتصال
              أقرب إليك من أي مكان.
            </p>
          </div>
        </div>
      </section>

      <section className="page">
        <div className="container faq-layout">
          <div className="faq-layout__main">
            <div className="accordion accordion--page">
              {faqs.map((faq, index) => (
                <details className="accordion__item" key={faq.question} open={index === 0}>
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

          <aside className="faq-layout__aside">
            <div className="panel">
              <h2 className="panel__title panel__title--sm">اختصارات سريعة</h2>
              <div className="faq-links">
                <ButtonLink to="/signup" variant="soft" size="sm" iconLeft="user" fullWidth>
                  إنشاء حساب
                </ButtonLink>
                <ButtonLink to="/forgot-password" variant="soft" size="sm" iconLeft="lock" fullWidth>
                  استعادة كلمة المرور
                </ButtonLink>
                <ButtonLink to="/library" variant="soft" size="sm" iconLeft="library" fullWidth>
                  مكتبتي
                </ButtonLink>
                <ButtonLink to="/explore" variant="soft" size="sm" iconLeft="compass" fullWidth>
                  استكشاف الأعمال
                </ButtonLink>
              </div>
            </div>

            <div className="panel panel--soft">
              <span className="faq-aside__icon">
                <Icon name="headset" size={22} />
              </span>
              <h2 className="panel__title panel__title--sm">لم تجد إجابتك؟</h2>
              <p className="panel__text">
                اطّلع على صفحة الاتصال لمعرفة القنوات الرسمية وطرق الوصول إلى فريق MangaPlus.
              </p>
              <ButtonLink to="/contact" variant="outline" size="sm" iconRight="arrowLeft">
                صفحة الاتصال
              </ButtonLink>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
