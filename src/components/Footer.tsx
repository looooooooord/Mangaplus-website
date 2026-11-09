import { Link } from 'react-router-dom';
import { site } from '@/data/site';
import { Icon } from './Icon';
import { Logo } from './Logo';

const columns = [
  {
    title: 'استكشف',
    links: [
      { label: 'الرئيسية', to: '/' },
      { label: 'كل الأعمال', to: '/explore' },
      { label: 'المانجا', to: '/explore?type=manga' },
      { label: 'الروايات', to: '/explore?type=novel' },
      { label: 'البحث', to: '/search' },
    ],
  },
  {
    title: 'MangaPlus',
    links: [
      { label: 'من نحن', to: '/about' },
      { label: 'المميزات', to: '/features' },
      { label: 'تحميل التطبيق', to: '/download' },
      { label: 'اتصل بنا', to: '/contact' },
    ],
  },
  {
    title: 'الحساب',
    links: [
      { label: 'تسجيل الدخول', to: '/login' },
      { label: 'إنشاء حساب', to: '/signup' },
      { label: 'المكتبة', to: '/library' },
      { label: 'استعادة كلمة المرور', to: '/forgot-password' },
    ],
  },
  {
    title: 'الدعم والقانون',
    links: [
      { label: 'الأسئلة الشائعة', to: '/faq' },
      { label: 'سياسة الخصوصية', to: '/privacy' },
      { label: 'شروط الاستخدام', to: '/terms' },
    ],
  },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer__top">
          <div className="footer__brand">
            <Logo size="md" />
            <p className="footer__tagline">
              منصة عربية للمانجا والروايات، مصممة لتكون مريحة في القراءة وواضحة في التفاصيل.
            </p>
            <div className="footer__pills">
              <span className="footer__pill">
                <Icon name="globe" size={14} />
                واجهة عربية كاملة
              </span>
              <span className="footer__pill">
                <Icon name="device" size={14} />
                يعمل على كل الأجهزة
              </span>
            </div>
          </div>

          <div className="footer__columns">
            {columns.map((column) => (
              <nav className="footer__column" key={column.title} aria-label={column.title}>
                <h2 className="footer__heading">{column.title}</h2>
                <ul>
                  {column.links.map((link) => (
                    <li key={link.to + link.label}>
                      <Link to={link.to}>{link.label}</Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        <div className="footer__bottom">
          <p className="footer__copyright">
            © {year} {site.name}. جميع الحقوق محفوظة.
          </p>
          <div className="footer__legal">
            <Link to="/privacy">الخصوصية</Link>
            <span aria-hidden="true">·</span>
            <Link to="/terms">الشروط</Link>
            <span aria-hidden="true">·</span>
            <Link to="/contact">الدعم</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
