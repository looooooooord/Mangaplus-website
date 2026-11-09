import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useConfirm } from '@/contexts/ConfirmContext';
import { useLibrary } from '@/contexts/LibraryContext';
import { useToast } from '@/contexts/ToastContext';
import { useTheme, type Theme } from '@/contexts/ThemeContext';
import { authErrorMessage } from '@/firebase/errors';
import { usePageMeta } from '@/hooks/usePageMeta';
import { formatDate, formatNumber } from '@/lib/format';
import { reloadUser, sendVerificationEmail, updateDisplayName } from '@/services/auth';
import { Avatar } from '@/components/Avatar';
import { Badge } from '@/components/Badge';
import { Button, ButtonLink } from '@/components/Button';
import { Icon } from '@/components/Icon';

function safeDate(value: string | undefined): string {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : formatDate(date.toISOString());
}

export default function Account() {
  const { user, refreshUser, logout } = useAuth();
  const { state } = useLibrary();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const confirm = useConfirm();
  const navigate = useNavigate();

  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState(user?.displayName ?? '');
  const [savingName, setSavingName] = useState(false);
  const [sendingVerification, setSendingVerification] = useState(false);
  const [checkingVerification, setCheckingVerification] = useState(false);

  usePageMeta({
    title: 'حسابي',
    description: 'بيانات حساب MangaPlus وإعداداتك وروابط مكتبتك.',
    noIndex: true,
  });

  if (!user) return null;

  const displayName = user.displayName?.trim() || 'مستخدم MangaPlus';
  const counts = {
    favorites: state.favorites.length,
    following: state.follows.length,
    reading: Object.keys(state.progress).length,
  };

  const saveName = async (event: FormEvent) => {
    event.preventDefault();
    const clean = nameValue.trim();
    if (clean.length < 3) {
      toast({ tone: 'error', title: 'الاسم قصير جداً', description: 'استخدم ٣ أحرف على الأقل.' });
      return;
    }
    setSavingName(true);
    try {
      await updateDisplayName(clean);
      await refreshUser();
      setEditingName(false);
      toast({ tone: 'success', title: 'تم تحديث الاسم' });
    } catch (error) {
      toast({ tone: 'error', title: 'تعذّر تحديث الاسم', description: authErrorMessage(error) });
    } finally {
      setSavingName(false);
    }
  };

  const resendVerification = async () => {
    setSendingVerification(true);
    try {
      await sendVerificationEmail();
      toast({
        tone: 'success',
        title: 'أرسلنا رسالة التحقق',
        description: 'افتح الرابط في بريدك لتأكيد الحساب.',
      });
    } catch (error) {
      toast({ tone: 'error', title: 'تعذّر إرسال الرسالة', description: authErrorMessage(error) });
    } finally {
      setSendingVerification(false);
    }
  };

  const checkVerification = async () => {
    setCheckingVerification(true);
    try {
      const refreshed = await reloadUser();
      await refreshUser();
      if (refreshed?.emailVerified) {
        toast({ tone: 'success', title: 'تم تأكيد بريدك الإلكتروني' });
      } else {
        toast({
          tone: 'info',
          title: 'لم يُؤكَّد البريد بعد',
          description: 'افتح رابط التحقق من بريدك ثم حاول مجدداً.',
        });
      }
    } catch (error) {
      toast({ tone: 'error', title: 'تعذّر تحديث الحالة', description: authErrorMessage(error) });
    } finally {
      setCheckingVerification(false);
    }
  };

  const onLogout = async () => {
    const approved = await confirm({
      title: 'تسجيل الخروج',
      description: 'هل تريد إنهاء الجلسة على هذا الجهاز؟',
      confirmLabel: 'تسجيل الخروج',
    });
    if (!approved) return;
    try {
      await logout();
      toast({ tone: 'success', title: 'تم تسجيل الخروج' });
      navigate('/');
    } catch (error) {
      toast({ tone: 'error', title: 'تعذّر تسجيل الخروج', description: authErrorMessage(error) });
    }
  };

  return (
    <section className="page account">
      <div className="container">
        <nav className="breadcrumbs" aria-label="مسار الصفحة">
          <Link to="/">الرئيسية</Link>
          <Icon name="chevronLeft" size={14} />
          <span aria-current="page">حسابي</span>
        </nav>

        <header className="account__head">
          <div>
            <p className="eyebrow">حساب MangaPlus</p>
            <h1 className="page__title">حسابي</h1>
            <p className="page__lead">
              حسابك هنا هو نفسه حساب MangaPlus في التطبيق، بنفس البريد وكلمة المرور.
            </p>
          </div>
        </header>

        <div className="account-grid">
          <div className="account-main">
            <section className="panel profile-card" aria-labelledby="profile-title">
              <h2 className="sr-only" id="profile-title">
                الملف الشخصي
              </h2>
              <div className="profile-card__top">
                <Avatar name={displayName} photoUrl={user.photoURL} size="xl" />
                <div className="profile-card__identity">
                  <h2 className="profile-card__name">{displayName}</h2>
                  <p className="profile-card__email" dir="ltr">
                    {user.email ?? '—'}
                  </p>
                  <div className="profile-card__badges">
                    {user.emailVerified ? (
                      <Badge tone="success">
                        <Icon name="checkCircle" size={13} /> بريد موثّق
                      </Badge>
                    ) : (
                      <Badge tone="warning">
                        <Icon name="alert" size={13} /> البريد غير موثّق
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {editingName ? (
                <form className="profile-card__form" onSubmit={saveName}>
                  <label className="profile-card__label" htmlFor="display-name">
                    اسم المستخدم
                  </label>
                  <input
                    id="display-name"
                    className="field__input"
                    value={nameValue}
                    onChange={(event) => setNameValue(event.target.value)}
                    maxLength={40}
                    autoComplete="nickname"
                  />
                  <div className="profile-card__form-actions">
                    <Button type="submit" size="sm" loading={savingName}>
                      حفظ
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingName(false);
                        setNameValue(user.displayName ?? '');
                      }}
                    >
                      إلغاء
                    </Button>
                  </div>
                </form>
              ) : (
                <Button
                  variant="soft"
                  size="sm"
                  iconLeft="pen"
                  onClick={() => {
                        setNameValue(user.displayName ?? '');
                        setEditingName(true);
                  }}
                >
                  تعديل اسم المستخدم
                </Button>
              )}
            </section>

            {!user.emailVerified ? (
              <section className="panel verify-panel" aria-labelledby="verify-title">
                <div className="verify-panel__head">
                  <span className="verify-panel__icon">
                    <Icon name="mail" size={20} />
                  </span>
                  <div>
                    <h2 className="panel__title panel__title--sm" id="verify-title">
                      تحقق من بريدك الإلكتروني
                    </h2>
                    <p className="panel__text">
                      أكّد بريدك لإكمال إعداد حسابك. يُفتح رابط التحقق على موقع MangaPlus مباشرة.
                    </p>
                  </div>
                </div>
                <div className="verify-panel__actions">
                  <Button onClick={resendVerification} loading={sendingVerification} iconLeft="mail">
                    إعادة إرسال رسالة التحقق
                  </Button>
                  <Button variant="ghost" onClick={checkVerification} loading={checkingVerification} iconLeft="refresh">
                    تحققت؟ حدّث الحالة
                  </Button>
                </div>
              </section>
            ) : null}

            <section className="panel" aria-labelledby="details-title">
              <h2 className="panel__title panel__title--sm" id="details-title">
                معلومات الحساب
              </h2>
              <dl className="info-list info-list--two">
                <div>
                  <dt>البريد الإلكتروني</dt>
                  <dd dir="ltr">{user.email ?? '—'}</dd>
                </div>
                <div>
                  <dt>حالة البريد</dt>
                  <dd>{user.emailVerified ? 'موثّق' : 'بانتظار التحقق'}</dd>
                </div>
                <div>
                  <dt>طريقة الدخول</dt>
                  <dd>{user.providerData[0]?.providerId === 'password' ? 'البريد الإلكتروني' : 'حساب مرتبط'}</dd>
                </div>
                <div>
                  <dt>تاريخ الانضمام</dt>
                  <dd>{safeDate(user.metadata.creationTime)}</dd>
                </div>
                <div>
                  <dt>آخر تسجيل دخول</dt>
                  <dd>{safeDate(user.metadata.lastSignInTime)}</dd>
                </div>
                <div>
                  <dt>اسم المستخدم</dt>
                  <dd>{displayName}</dd>
                </div>
              </dl>
            </section>

            <section className="panel" aria-labelledby="settings-title">
              <h2 className="panel__title panel__title--sm" id="settings-title">
                الإعدادات
              </h2>
              <div className="settings-row">
                <div>
                  <h3>المظهر</h3>
                  <p>يُحفظ اختيارك على هذا الجهاز ويُطبَّق على كل الصفحات.</p>
                </div>
                <div className="theme-choice" role="group" aria-label="اختيار المظهر">
                  {(['light', 'dark'] as Theme[]).map((option) => (
                    <button
                      key={option}
                      type="button"
                      className={theme === option ? 'is-active' : ''}
                      onClick={() => setTheme(option)}
                      aria-pressed={theme === option}
                    >
                      <Icon name={option === 'light' ? 'sun' : 'moon'} size={16} />
                      {option === 'light' ? 'فاتح' : 'داكن'}
                    </button>
                  ))}
                </div>
              </div>
              <div className="settings-row">
                <div>
                  <h3>اللغة</h3>
                  <p>واجهة الموقع بالعربية، مع دعم كامل للاتجاه من اليمين إلى اليسار.</p>
                </div>
                <span className="settings-value">
                  <Icon name="globe" size={16} />
                  العربية
                </span>
              </div>
            </section>
          </div>

          <aside className="account-aside">
            <section className="panel" aria-labelledby="links-title">
              <h2 className="panel__title panel__title--sm" id="links-title">
                مكتبتي
              </h2>
              <div className="account-links">
                <Link to="/library">
                  <span className="account-links__icon">
                    <Icon name="heart" size={18} />
                  </span>
                  <span className="account-links__body">
                    <strong>المفضلة</strong>
                    <small>{formatNumber(counts.favorites)} عمل</small>
                  </span>
                  <Icon name="chevronLeft" size={16} />
                </Link>
                <Link to="/library?tab=following">
                  <span className="account-links__icon">
                    <Icon name="bookmark" size={18} />
                  </span>
                  <span className="account-links__body">
                    <strong>أتابعها</strong>
                    <small>{formatNumber(counts.following)} عمل</small>
                  </span>
                  <Icon name="chevronLeft" size={16} />
                </Link>
                <Link to="/library?tab=reading">
                  <span className="account-links__icon">
                    <Icon name="clock" size={18} />
                  </span>
                  <span className="account-links__body">
                    <strong>سجل القراءة</strong>
                    <small>{formatNumber(counts.reading)} عمل</small>
                  </span>
                  <Icon name="chevronLeft" size={16} />
                </Link>
              </div>
              <p className="account-aside__note">
                تُحفظ هذه المكتبة على هذا الجهاز، وتبقى متاحة عند العودة من أي متصفح على الجهاز نفسه.
              </p>
            </section>

            <section className="panel panel--soft" aria-labelledby="help-title">
              <h2 className="panel__title panel__title--sm" id="help-title">
                تحتاج مساعدة؟
              </h2>
              <p className="panel__text">
                تجد إجابات الحساب والقراءة في الأسئلة الشائعة، ويمكنك التواصل مع الدعم من صفحة الاتصال.
              </p>
              <div className="account-aside__buttons">
                <ButtonLink to="/faq" variant="outline" size="sm" iconLeft="info">
                  الأسئلة الشائعة
                </ButtonLink>
                <ButtonLink to="/contact" variant="ghost" size="sm" iconLeft="headset">
                  اتصل بنا
                </ButtonLink>
              </div>
            </section>

            <section className="panel logout-panel">
              <div>
                <h2 className="panel__title panel__title--sm">إنهاء الجلسة</h2>
                <p className="panel__text">تسجيل الخروج لا يحذف بيانات حسابك.</p>
              </div>
              <Button variant="danger" onClick={onLogout} iconLeft="logout">
                تسجيل الخروج
              </Button>
            </section>
          </aside>
        </div>
      </div>
    </section>
  );
}
