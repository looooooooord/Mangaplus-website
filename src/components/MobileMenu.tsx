import { useEffect, useState, type FormEvent } from 'react';
import { createPortal } from 'react-dom';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/contexts/ProfileContext';
import { useScrollLock } from '@/hooks/useScrollLock';
import { useProfilePhoto } from '@/hooks/useProfilePhoto';
import { Avatar } from './Avatar';
import { Icon } from './Icon';
import { Logo } from './Logo';
import { ThemeToggle } from './ThemeToggle';

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
  onOpenSearch: () => void;
}

const links = [
  { to: '/', label: 'الرئيسية', icon: 'home' as const, end: true },
  { to: '/explore', label: 'استكشف الأعمال', icon: 'compass' as const, end: false },
  { to: '/library', label: 'مكتبتي', icon: 'library' as const, end: false },
  { to: '/features', label: 'مميزات MangaPlus', icon: 'sparkles' as const, end: false },
  { to: '/faq', label: 'الأسئلة الشائعة', icon: 'info' as const, end: false },
  { to: '/download', label: 'تحميل التطبيق', icon: 'download' as const, end: false },
];

export function MobileMenu({ open, onClose, onOpenSearch }: MobileMenuProps) {
  const { user } = useAuth();
  const { profile } = useProfile();
  const photoUrl = useProfilePhoto(user);
  const [term, setTerm] = useState('');
  const navigate = useNavigate();

  useScrollLock(open);

  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) setTerm('');
  }, [open]);

  if (!open) return null;

  const onSearch = (event: FormEvent) => {
    event.preventDefault();
    const clean = term.trim();
    if (!clean) {
      onClose();
      onOpenSearch();
      return;
    }
    onClose();
    navigate(`/search?q=${encodeURIComponent(clean)}`);
  };

  return createPortal(
    <div className="drawer" role="dialog" aria-modal="true" aria-label="قائمة التنقل">
      <button type="button" className="drawer__backdrop" onClick={onClose} aria-label="إغلاق القائمة" />
      <aside className="drawer__panel">
        <div className="drawer__top">
          <Logo size="sm" />
          <button type="button" className="icon-btn" onClick={onClose} aria-label="إغلاق القائمة">
            <Icon name="close" size={20} />
          </button>
        </div>

        {user ? (
          <NavLink to="/account" className="drawer__account" onClick={onClose}>
            <Avatar
              name={profile?.displayName?.trim() || user.displayName}
              photoUrl={photoUrl}
              size="md"
            />
            <span className="drawer__account-body">
              <span className="drawer__account-name">
                {profile?.displayName?.trim() || user.displayName?.trim() || 'حسابي'}
              </span>
              <span className="drawer__account-email" dir="ltr">
                {user.email}
              </span>
            </span>
            <Icon name="chevronLeft" size={18} />
          </NavLink>
        ) : (
          <div className="drawer__auth">
            <NavLink className="btn btn--primary btn--md btn--block" to="/login" onClick={onClose}>
              <span className="btn__label">تسجيل الدخول</span>
            </NavLink>
            <NavLink className="btn btn--outline btn--md btn--block" to="/signup" onClick={onClose}>
              <span className="btn__label">إنشاء حساب</span>
            </NavLink>
          </div>
        )}

        <form className="drawer__search" onSubmit={onSearch} role="search">
          <Icon name="search" size={18} />
          <input
            type="search"
            value={term}
            onChange={(event) => setTerm(event.target.value)}
            placeholder="ابحث في MangaPlus…"
            aria-label="ابحث في MangaPlus"
          />
        </form>

        <nav className="drawer__nav" aria-label="التنقل في الموقع">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) => `drawer__link ${isActive ? 'is-active' : ''}`.trim()}
              onClick={onClose}
            >
              <Icon name={link.icon} size={19} />
              <span>{link.label}</span>
              <Icon name="chevronLeft" size={16} className="drawer__link-chevron" />
            </NavLink>
          ))}
        </nav>

        <div className="drawer__footer">
          <div className="drawer__theme">
            <span>المظهر</span>
            <ThemeToggle />
          </div>
          <p className="drawer__note">اللغة العربية · الواجهة الكاملة</p>
        </div>
      </aside>
    </div>,
    document.body,
  );
}
