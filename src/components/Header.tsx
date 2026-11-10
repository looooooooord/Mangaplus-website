import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { AccountMenu } from './AccountMenu';
import { Icon } from './Icon';
import { Logo } from './Logo';
import { MobileMenu } from './MobileMenu';
import { SearchOverlay } from './SearchOverlay';
import { ThemeToggle } from './ThemeToggle';

const navItems = [
  { to: '/', label: 'الرئيسية', end: true },
  { to: '/explore', label: 'استكشف', end: false },
  { to: '/library', label: 'المكتبة', end: false },
  { to: '/features', label: 'المميزات', end: false },
  { to: '/faq', label: 'الأسئلة', end: false },
];

export function Header() {
  const { user, loading } = useAuth();
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const typing =
        target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA' || target?.isContentEditable;
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setSearchOpen(true);
      } else if (event.key === '/' && !typing) {
        event.preventDefault();
        setSearchOpen(true);
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <>
      <header className={`site-header ${scrolled ? 'is-scrolled' : ''}`.trim()}>
        <div className="container site-header__inner">
          <Logo size="md" />

          <button
            type="button"
            className="icon-btn menu-trigger"
            onClick={() => setMenuOpen(true)}
            aria-label="فتح قائمة التنقل"
          >
            <Icon name="menu" size={22} />
          </button>

          <nav className="site-nav" aria-label="التنقل الرئيسي">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) => `site-nav__link ${isActive ? 'is-active' : ''}`.trim()}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="site-header__actions">
            <button
              type="button"
              className="icon-btn search-trigger"
              onClick={() => setSearchOpen(true)}
              aria-label="فتح البحث"
              aria-haspopup="dialog"
            >
              <Icon name="search" size={20} />
              <span className="search-trigger__hint" aria-hidden="true">
                /
              </span>
            </button>

            <ThemeToggle />

            {loading ? (
              <span className="header-user-skeleton" aria-hidden="true" />
            ) : user ? (
              <AccountMenu />
            ) : (
              <div className="header-auth">
                <NavLink className="btn btn--primary btn--sm header-auth__login" to="/login" aria-label="تسجيل الدخول">
                  <Icon name="user" size={17} className="header-auth__login-icon" />
                  <span className="btn__label">تسجيل الدخول</span>
                </NavLink>
                <NavLink className="header-auth__signup" to="/signup">
                  إنشاء حساب
                </NavLink>
              </div>
            )}
          </div>
        </div>
      </header>

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} onOpenSearch={() => setSearchOpen(true)} />
    </>
  );
}
