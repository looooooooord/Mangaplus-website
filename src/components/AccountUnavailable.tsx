import { ButtonLink } from './Button';
import { Icon } from './Icon';
import { Logo } from './Logo';

interface AccountUnavailableProps {
  title?: string;
  description?: string;
  showHome?: boolean;
}

export function AccountUnavailable({
  title = 'تسجيل الدخول غير متاح حالياً',
  description = 'يمكنك متابعة التصفح والقراءة، وحفظ أعمالك في مكتبتك على هذا الجهاز. سيظهر تسجيل الدخول هنا عند تفعيل حساب MangaPlus على الموقع.',
  showHome = true,
}: AccountUnavailableProps) {
  return (
    <div className="account-unavailable">
      <Logo size="md" to={null} showWordmark={false} />
      <span className="account-unavailable__icon" aria-hidden="true">
        <Icon name="shield" size={24} />
      </span>
      <h1 className="account-unavailable__title">{title}</h1>
      <p className="account-unavailable__text">{description}</p>
      <div className="account-unavailable__actions">
        {showHome ? (
          <ButtonLink to="/" variant="primary" iconLeft="home">
            الصفحة الرئيسية
          </ButtonLink>
        ) : null}
        <ButtonLink to="/library" variant="outline" iconLeft="library">
          مكتبتي
        </ButtonLink>
      </div>
    </div>
  );
}
