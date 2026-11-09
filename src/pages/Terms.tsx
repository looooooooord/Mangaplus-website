import { Link } from 'react-router-dom';
import { site } from '@/data/site';
import { formatDate } from '@/lib/format';
import { usePageMeta } from '@/hooks/usePageMeta';
import { Icon } from '@/components/Icon';

export default function Terms() {
  usePageMeta({
    title: 'شروط الاستخدام',
    description: 'شروط استخدام موقع MangaPlus والحساب المشترك مع التطبيق والمحتوى والمسؤوليات.',
  });

  return (
    <section className="page legal">
      <div className="container legal__layout">
        <article className="legal__article">
          <nav className="breadcrumbs" aria-label="مسار الصفحة">
            <Link to="/">الرئيسية</Link>
            <Icon name="chevronLeft" size={14} />
            <span aria-current="page">شروط الاستخدام</span>
          </nav>

          <header className="legal__head">
            <p className="eyebrow">القانون والخصوصية</p>
            <h1 className="page__title">شروط الاستخدام</h1>
            <p className="legal__updated">آخر تحديث: {formatDate(site.legalUpdatedAt)}</p>
            <p className="legal__lead">
              تحدد هذه الشروط قواعد استخدام موقع {site.name}. باستخدامك الموقع أو إنشاء حساب فيه،
              فإنك توافق على هذه الشروط.
            </p>
          </header>

          <nav className="legal__toc" aria-label="محتويات الصفحة">
            <h2>المحتويات</h2>
            <ol>
              <li>
                <a href="#service">وصف الخدمة</a>
              </li>
              <li>
                <a href="#accounts">الحساب والأمان</a>
              </li>
              <li>
                <a href="#use">الاستخدام المقبول</a>
              </li>
              <li>
                <a href="#content">المحتوى والملكية الفكرية</a>
              </li>
              <li>
                <a href="#availability">توفر الخدمة والتغييرات</a>
              </li>
              <li>
                <a href="#disclaimer">حدود المسؤولية</a>
              </li>
              <li>
                <a href="#termination">إنهاء الاستخدام</a>
              </li>
              <li>
                <a href="#law">القانون المعمول به</a>
              </li>
              <li>
                <a href="#contact">التواصل</a>
              </li>
            </ol>
          </nav>

          <section id="service">
            <h2>١. وصف الخدمة</h2>
            <p>
              {site.name} منصة لعرض وقراءة المانجا والروايات، وتنظيم المفضلة وسجل القراءة، وإدارة
              الحساب. قد تتغير ميزات الخدمة أو تتحسن مع الوقت، ونحاول إبلاغك بأي تغيير جوهري يمس
              استخدامك.
            </p>
          </section>

          <section id="accounts">
            <h2>٢. الحساب والأمان</h2>
            <p>
              يعتمد الموقع نظام الحسابات نفسه المستخدم في تطبيق {site.name}. أنت مسؤول عن الحفاظ على
              سرية كلمة المرور وعن أي نشاط يجري من خلال حسابك. يجب أن تكون بياناتك صحيحة، وأن تستخدم
              بريداً إلكترونياً تملكه فعلاً.
            </p>
            <p>
              يمكنك تعديل اسم المستخدم من صفحة حسابك، وإدارة التحقق من البريد واستعادة كلمة المرور
              عبر الروابط الرسمية. لا تشارك روابط التحقق أو إعادة التعيين مع أي شخص.
            </p>
          </section>

          <section id="use">
            <h2>٣. الاستخدام المقبول</h2>
            <ul>
              <li>الاستخدام الشخصي غير التجاري للموقع ومحتواه.</li>
              <li>عدم محاولة الوصول إلى حسابات الآخرين أو تعطيل الخدمة.</li>
              <li>عدم استخدام أدوات آلية لجمع المحتوى أو إعادة نشره.</li>
              <li>عدم نشر محتوى مخالف للقانون أو منتهك لحقوق الآخرين.</li>
              <li>عدم انتحال هوية شخص آخر أو جهة رسمية.</li>
            </ul>
            <p>
              نحتفظ بحق اتخاذ الإجراءات المناسبة، بما في ذلك تقييد الوصول، عند مخالفة هذه القواعد.
            </p>
          </section>

          <section id="content">
            <h2>٤. المحتوى والملكية الفكرية</h2>
            <p>
              جميع العناصر البصرية والتصميمية والشعارات والنصوص الخاصة بـ {site.name} مملوكة للمنصة
              أو مرخّصة لها. الأعمال المعروضة تخضع لحقوق أصحابها، ويُمنع إعادة نشرها أو استخدامها
              تجارياً دون تصريح.
            </p>
          </section>

          <section id="availability">
            <h2>٥. توفر الخدمة والتغييرات</h2>
            <p>
              نعمل على إبقاء الخدمة متاحة ومستقرة، لكننا لا نضمن استمرارها دون انقطاع. قد نوقف
              ميزة أو نغيّرها لأسباب تقنية أو تنظيمية، وقد يحدث توقف مؤقت أثناء الصيانة.
            </p>
          </section>

          <section id="disclaimer">
            <h2>٦. حدود المسؤولية</h2>
            <p>
              يُقدَّم الموقع «كما هو». لا نتحمل مسؤولية أي خسارة غير مباشرة ناتجة عن استخدام الموقع
              أو عدم القدرة على استخدامه، بالقدر الذي تسمح به القوانين المعمول بها. تبقى مسؤوليتك عن
              حماية جهازك وبياناتك.
            </p>
          </section>

          <section id="termination">
            <h2>٧. إنهاء الاستخدام</h2>
            <p>
              يمكنك التوقف عن استخدام الموقع في أي وقت، وإنهاء الجلسة من صفحة حسابك. قد نقيّد الوصول
              إلى الحساب عند انتهاك هذه الشروط أو عند وجود خطر على الخدمة أو المستخدمين.
            </p>
          </section>

          <section id="law">
            <h2>٨. القانون المعمول به</h2>
            <p>
              تُفسَّر هذه الشروط وفق القوانين المعمول بها في بلد إدارة المنصة، ما لم ينص قانون آخر
              على غير ذلك.
            </p>
          </section>

          <section id="contact">
            <h2>٩. التواصل</h2>
            <p>
              لأي سؤال عن هذه الشروط، راجع <Link to="/contact">صفحة الاتصال</Link> لمعرفة قنوات
              التواصل الرسمية.
            </p>
          </section>

          <footer className="legal__footer">
            <Icon name="info" size={17} />
            <p>
              هذه الصفحة تُقرأ مع <Link to="/privacy">سياسة الخصوصية</Link>، وكلتاهما جزء من اتفاقك
              معنا.
            </p>
          </footer>
        </article>
      </div>
    </section>
  );
}
