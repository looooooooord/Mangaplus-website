import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/contexts/ProfileContext';
import { useConfirm } from '@/contexts/ConfirmContext';
import { useToast } from '@/contexts/ToastContext';
import { authErrorMessage } from '@/firebase/errors';
import { useProfilePhoto } from '@/hooks/useProfilePhoto';
import { Avatar } from './Avatar';
import { Icon } from './Icon';

export function AccountMenu() {
  const { user, logout } = useAuth();
  const { profile } = useProfile();
  const { toast } = useToast();
  const confirm = useConfirm();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const photoUrl = useProfilePhoto(user);

  useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  if (!user) return null;

  const name = profile?.displayName?.trim() || user.displayName?.trim() || 'حسابي';

  const onLogout = async () => {
    setOpen(false);
    const approved = await confirm({
      title: 'تسجيل الخروج',
      description: 'هل تريد إنهاء الجلسة على هذا الجهاز؟',
      confirmLabel: 'تسجيل الخروج',
      cancelLabel: 'البقاء',
    });
    if (!approved) return;
    setBusy(true);
    try {
      await logout();
      toast({ tone: 'success', title: 'تم تسجيل الخروج' });
      navigate('/');
    } catch (error) {
      toast({ tone: 'error', title: 'تعذّر تسجيل الخروج', description: authErrorMessage(error) });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="account-menu" ref={rootRef}>
      <button
        type="button"
        className="account-menu__trigger"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="قائمة الحساب"
      >
        <Avatar name={user.displayName} photoUrl={photoUrl} size="sm" />
        <span className="account-menu__name">{name}</span>
        <Icon name="chevronDown" size={15} className="account-menu__chevron" />
      </button>

      {open ? (
        <div className="account-menu__panel" role="menu" aria-label="حساب MangaPlus">
          <div className="account-menu__head">
            <Avatar name={user.displayName} photoUrl={photoUrl} size="md" />
            <div>
              <p className="account-menu__title">{name}</p>
              <p className="account-menu__email" dir="ltr">
                {user.email}
              </p>
            </div>
          </div>
          <Link className="account-menu__item" to="/account" role="menuitem" onClick={() => setOpen(false)}>
            <Icon name="user" size={18} />
            حسابي
          </Link>
          <Link className="account-menu__item" to="/library" role="menuitem" onClick={() => setOpen(false)}>
            <Icon name="library" size={18} />
            المكتبة
          </Link>
          <Link
            className="account-menu__item"
            to="/library?tab=favorites"
            role="menuitem"
            onClick={() => setOpen(false)}
          >
            <Icon name="heart" size={18} />
            المفضلة
          </Link>
          <button
            type="button"
            className="account-menu__item account-menu__item--danger"
            role="menuitem"
            onClick={onLogout}
            disabled={busy}
          >
            <Icon name="logout" size={18} />
            تسجيل الخروج
          </button>
        </div>
      ) : null}
    </div>
  );
}
