import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { getFeatured } from '@/services/catalog';
import { Icon } from './Icon';
import { Logo } from './Logo';
import { WorkCover } from './WorkCover';

interface AuthShellProps {
  eyebrow: string;
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function AuthShell({ eyebrow, title, subtitle, children, footer }: AuthShellProps) {
  const covers = getFeatured(2);

  return (
    <section className="auth-page">
      <div className="container auth-shell">
        <aside className="auth-brand">
          <div className="auth-brand__glow" aria-hidden="true" />
          <Logo size="lg" />
          <div className="auth-brand__content">
            <p className="auth-brand__eyebrow">MangaPlus</p>
            <h2 className="auth-brand__title">حساب واحد يتبعك حيث تقرأ</h2>
            <p className="auth-brand__text">
              استخدم حساب MangaPlus نفسه الموجود في التطبيق، دون إنشاء حساب جديد أو كلمة مرور أخرى.
            </p>
            <ul className="auth-brand__points">
              <li>
                <span>
                  <Icon name="check" size={14} />
                </span>
                نفس البريد وكلمة المرور
              </li>
              <li>
                <span>
                  <Icon name="check" size={14} />
                </span>
                مكتبتك ومفضلتك في مكان واحد
              </li>
              <li>
                <span>
                  <Icon name="check" size={14} />
                </span>
                تحقق من البريد واستعادته داخل الموقع
              </li>
            </ul>
          </div>

          <div className="auth-brand__covers" aria-hidden="true">
            {covers.map((work) => (
              <div className="auth-brand__cover" key={work.id}>
                <WorkCover work={work} showType={false} />
              </div>
            ))}
          </div>
        </aside>

        <div className="auth-panel">
          <div className="auth-card">
            <p className="eyebrow">{eyebrow}</p>
            <h1 className="auth-card__title">{title}</h1>
            <p className="auth-card__subtitle">{subtitle}</p>
            {children}
            {footer ? <div className="auth-card__footer">{footer}</div> : null}
            <p className="auth-card__legal">
              باستخدامك MangaPlus فإنك توافق على{' '}
              <Link to="/terms">شروط الاستخدام</Link> و<Link to="/privacy">سياسة الخصوصية</Link>.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
