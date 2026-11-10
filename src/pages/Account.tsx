import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useConfirm } from '@/contexts/ConfirmContext';
import { useLibrary } from '@/contexts/LibraryContext';
import { useProfile } from '@/contexts/ProfileContext';
import { useToast } from '@/contexts/ToastContext';
import { useTheme, type Theme } from '@/contexts/ThemeContext';
import { authErrorMessage } from '@/firebase/errors';
import { usePageMeta } from '@/hooks/usePageMeta';
import { useProfilePhoto } from '@/hooks/useProfilePhoto';
import { formatDate, formatNumber } from '@/lib/format';
import { readImageFile } from '@/lib/image';
import { isDeveloperEmail } from '@/lib/roles';
import {
  changePassword,
  hasPasswordProvider,
  reloadUser,
  sendVerificationEmail,
  setPassword,
  updateDisplayName,
  updatePhotoUrl,
} from '@/services/auth';
import { saveProfile, type ProfilePatch } from '@/services/userProfile';
import { Avatar } from '@/components/Avatar';
import { Badge } from '@/components/Badge';
import { Button, ButtonLink } from '@/components/Button';
import { FormField } from '@/components/FormField';
import { Icon } from '@/components/Icon';
import { PasswordChecklist, isPasswordValid } from '@/components/PasswordChecklist';
import { COUNTRY_OPTIONS, GENDER_OPTIONS } from '@/data/profileOptions';

function safeDate(value: string | null | undefined): string {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : formatDate(date.toISOString());
}

/** الدولة كما يحفظها التطبيق: اسم عربي جاهز، وإلا الاسم من رمز الدولة. */
function countryLabel(code: string, name: string): string {
  if (name.trim()) return name.trim();
  const normalized = code.trim().toLowerCase();
  if (!normalized) return 'غير محدد';
  return COUNTRY_OPTIONS.find((option) => option.value === normalized)?.label ?? code.trim();
}

function genderLabel(value: string): string {
  const normalized = value.trim();
  if (!normalized) return 'غير محدد';
  const known = GENDER_OPTIONS.find((option) => option.value === normalized);
  return known ? known.label : normalized;
}

export default function Account() {
  const { user, refreshUser, logout } = useAuth();
  const { profile, loading: profileLoading, error: profileError } = useProfile();
  const { state } = useLibrary();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const confirm = useConfirm();
  const navigate = useNavigate();

  const photoUrl = useProfilePhoto(user);
  const [editing, setEditing] = useState(false);
  const [nameValue, setNameValue] = useState(user?.displayName ?? '');
  const [photoUrlValue, setPhotoUrlValue] = useState('');
  /** undefined = لا تغيير، null = إزالة الصورة، نص = صورة جديدة من الجهاز. */
  const [pendingPhoto, setPendingPhoto] = useState<string | null | undefined>(undefined);
  const [photoBusy, setPhotoBusy] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);
  const [sendingVerification, setSendingVerification] = useState(false);
  const [checkingVerification, setCheckingVerification] = useState(false);

  usePageMeta({
    title: 'حسابي',
    description: 'بيانات حساب MangaPlus وإعداداتك وروابط مكتبتك.',
    noIndex: true,
  });

  if (!user) return null;

  const displayName =
    profile?.displayName?.trim() || user.displayName?.trim() || 'مستخدم MangaPlus';
  const verified = profile?.isVerified === true;
  // Firebase Auth هو المصدر الموثوق لتأكيد البريد؛ حقل المستند قد يكون قديماً.
  const emailVerified = user.emailVerified;
  const developer = profile?.isOfficialDeveloper === true || isDeveloperEmail(user.email);
  const canEdit = user.emailVerified || user.isAnonymous;
  const canSignInWithPassword = hasPasswordProvider(user);
  const signInMethod = canSignInWithPassword
    ? 'البريد الإلكتروني وكلمة المرور'
    : user.providerData.some((provider) => provider.providerId === 'google.com')
      ? 'حساب Google'
      : 'حساب مرتبط';
  const previewPhoto = pendingPhoto !== undefined ? pendingPhoto : photoUrl;
  const hasPhoto = Boolean(previewPhoto);
  const counts = {
    favorites: state.favorites.length,
    following: state.follows.length,
    reading: Object.keys(state.progress).length,
  };

  const startEditing = () => {
    if (!canEdit) {
      toast({
        tone: 'error',
        title: 'أكّد بريدك الإلكتروني أولاً',
        description: 'أرسلنا رسالة التحقق إلى بريدك؛ بعد التأكيد يمكنك تعديل اسمك وصورتك.',
      });
      return;
    }
    setNameValue(profile?.displayName?.trim() || user.displayName || '');
    setPhotoUrlValue(profile?.photoUrl ?? '');
    setPendingPhoto(undefined);
    setEditing(true);
  };

  const cancelEditing = () => {
    setEditing(false);
    setPendingPhoto(undefined);
    setPhotoUrlValue('');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const onPickPhoto = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setPhotoBusy(true);
    try {
      const dataUrl = await readImageFile(file);
      setPendingPhoto(dataUrl);
      setPhotoUrlValue('');
    } catch {
      toast({
        tone: 'error',
        title: 'تعذّر استخدام هذه الصورة',
        description: 'اختر صورة بصيغة JPG أو PNG ثم حاول مرة أخرى.',
      });
    } finally {
      setPhotoBusy(false);
    }
  };

  const onRemovePhoto = () => {
    setPendingPhoto(null);
    setPhotoUrlValue('');
  };

  const saveProfileChanges = async (event: FormEvent) => {
    event.preventDefault();
    const cleanName = nameValue.trim();
    const cleanUrl = photoUrlValue.trim();

    if (cleanName.length < 3) {
      toast({ tone: 'error', title: 'الاسم قصير جداً', description: 'استخدم ٣ أحرف على الأقل.' });
      return;
    }
    if (cleanUrl && !/^https?:\/\/\S+$/i.test(cleanUrl)) {
      toast({ tone: 'error', title: 'الرابط غير صحيح', description: 'استخدم رابطاً يبدأ بـ https://' });
      return;
    }

    const patch: ProfilePatch = {};
    if (cleanName !== (profile?.displayName ?? user.displayName ?? '').trim()) {
      patch.displayName = cleanName;
    }
    if (pendingPhoto !== undefined) {
      patch.photoData = pendingPhoto ?? '';
    } else if (cleanUrl !== (profile?.photoUrl ?? '')) {
      patch.photoUrl = cleanUrl;
    }

    setSavingProfile(true);
    try {
      await saveProfile(user, patch);
      if (patch.displayName) await updateDisplayName(patch.displayName);
      if (patch.photoData === '') await updatePhotoUrl('');
      await refreshUser();
      setEditing(false);
      setPendingPhoto(undefined);
      toast({ tone: 'success', title: 'تم حفظ بيانات الحساب' });
    } catch (error) {
      toast({ tone: 'error', title: 'تعذّر حفظ التعديلات', description: authErrorMessage(error) });
    } finally {
      setSavingProfile(false);
    }
  };

  const savePassword = async (event: FormEvent) => {
    event.preventDefault();

    if (canSignInWithPassword && !currentPassword) {
      toast({ tone: 'error', title: 'أدخل كلمة المرور الحالية', description: 'نحتاجها لتأكيد التغيير.' });
      return;
    }
    if (!isPasswordValid(newPassword)) {
      toast({
        tone: 'error',
        title: 'كلمة المرور ضعيفة',
        description: 'استخدم ٨ أحرف على الأقل مع حرف ورقم.',
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ tone: 'error', title: 'كلمتا المرور غير متطابقتين', description: 'أعد كتابة التأكيد.' });
      return;
    }

    setSavingPassword(true);
    try {
      if (canSignInWithPassword) {
        await changePassword(currentPassword, newPassword);
        toast({ tone: 'success', title: 'تم تغيير كلمة المرور' });
      } else {
        await setPassword(newPassword);
        toast({
          tone: 'success',
          title: 'تم تعيين كلمة مرور',
          description: 'يمكنك الآن الدخول بالبريد وكلمة المرور أو بحساب Google.',
        });
      }
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      await refreshUser();
    } catch (error) {
      if (error instanceof Error && error.message === 'auth/no-current-user') {
        toast({ tone: 'error', title: 'انتهت الجلسة', description: 'سجّل الدخول من جديد ثم حاول.' });
      } else {
        toast({ tone: 'error', title: 'تعذّر حفظ كلمة المرور', description: authErrorMessage(error) });
      }
    } finally {
      setSavingPassword(false);
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
              هذا هو حسابك نفسه في تطبيق MangaPlus: الاسم والصورة والبيانات تظهر في الاثنين.
            </p>
          </div>
        </header>

        <div className="account-grid">
          <div className="account-main">
            <section className="panel profile-card" aria-labelledby="profile-title">
              <div className="profile-card__top">
                <Avatar name={displayName} photoUrl={previewPhoto} size="xl" />
                <div className="profile-card__identity">
                  <h2
                    className={`profile-card__name ${verified ? 'name--gold' : ''}`.trim()}
                    id="profile-title"
                  >
                    {displayName}
                  </h2>
                  <p className="profile-card__email" dir="ltr">
                    {user.email ?? '—'}
                  </p>
                  <div className="profile-card__badges">
                    {verified ? (
                      <Badge tone="gold">
                        <Icon name="checkCircle" size={13} /> حساب موثّق
                      </Badge>
                    ) : emailVerified ? (
                      <Badge tone="success">
                        <Icon name="check" size={13} /> البريد مؤكّد
                      </Badge>
                    ) : (
                      <Badge tone="warning">
                        <Icon name="alert" size={13} /> البريد غير موثّق
                      </Badge>
                    )}
                    {developer ? (
                      <Badge tone="dev">
                        <Icon name="shield" size={13} /> مطوّر
                      </Badge>
                    ) : null}
                  </div>
                </div>
                {!editing ? (
                  <div className="profile-card__actions">
                    <Button
                      type="button"
                      variant="soft"
                      size="sm"
                      iconLeft="pen"
                      onClick={startEditing}
                    >
                      تعديل
                    </Button>
                  </div>
                ) : null}
              </div>

              {editing ? (
                <form className="profile-edit" onSubmit={saveProfileChanges}>
                  <div className="profile-edit__photo">
                    <p className="profile-card__label">صورة الملف الشخصي</p>
                    <div className="profile-photo__actions">
                      <label className="btn btn--soft btn--sm profile-photo__pick">
                        <Icon name={photoBusy ? 'refresh' : 'pen'} size={16} />
                        <span className="btn__label">
                          {photoBusy ? 'جارٍ تجهيز الصورة…' : hasPhoto ? 'تغيير الصورة' : 'اختيار صورة'}
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={onPickPhoto}
                          disabled={photoBusy}
                          hidden
                        />
                      </label>
                      {hasPhoto ? (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          iconLeft="trash"
                          onClick={onRemovePhoto}
                        >
                          إزالة الصورة
                        </Button>
                      ) : null}
                    </div>

                    <label className="profile-card__label" htmlFor="profile-photo-url">
                      أو رابط صورة
                    </label>
                    <input
                      id="profile-photo-url"
                      className="field__input"
                      value={photoUrlValue}
                      onChange={(event) => setPhotoUrlValue(event.target.value)}
                      placeholder="https://example.com/photo.jpg"
                      dir="ltr"
                      autoComplete="url"
                    />
                    <p className="profile-card__hint">
                      الصورة تُحفظ في حسابك وتظهر في الموقع والتطبيق على كل الأجهزة.
                    </p>
                  </div>

                  <div className="profile-edit__fields">
                    <FormField
                      label="الاسم الظاهر"
                      icon="user"
                      value={nameValue}
                      onChange={(event) => setNameValue(event.target.value)}
                      maxLength={40}
                      autoComplete="nickname"
                      hint="هذا الاسم يظهر في الموقع والتطبيق معاً."
                    />

                    <div className="profile-edit__actions">
                      <Button type="submit" iconLeft="check" loading={savingProfile}>
                        حفظ التغييرات
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={cancelEditing}
                        disabled={savingProfile}
                      >
                        إلغاء
                      </Button>
                    </div>
                  </div>
                </form>
              ) : null}

              {profileLoading ? (
                <p className="profile-card__hint">جارٍ تحميل بيانات الحساب من Firebase…</p>
              ) : null}
              {profileError ? (
                <p className="profile-card__hint">تعذّر تحميل بيانات الحساب: {authErrorMessage(profileError)}</p>
              ) : null}
            </section>

            {editing ? (
              <section className="panel" aria-labelledby="password-title">
                <div className="panel__head">
                  <h2 className="panel__title panel__title--sm" id="password-title">
                    {canSignInWithPassword ? 'كلمة المرور' : 'تعيين كلمة مرور'}
                  </h2>
                  <p className="panel__text">
                    {canSignInWithPassword
                      ? 'غيّر كلمة مرور حسابك. ستحتاج كلمة المرور الحالية لتأكيد التغيير.'
                      : 'حسابك يعمل عبر Google. يمكنك إضافة كلمة مرور للدخول بالبريد نفسه على أي جهاز.'}
                  </p>
                </div>

                <form className="password-form" onSubmit={savePassword}>
                  {canSignInWithPassword ? (
                    <FormField
                      label="كلمة المرور الحالية"
                      type="password"
                      icon="lock"
                      autoComplete="current-password"
                      value={currentPassword}
                      onChange={(event) => setCurrentPassword(event.target.value)}
                    />
                  ) : null}

                  <div className="password-form__grid">
                    <FormField
                      label="كلمة المرور الجديدة"
                      type="password"
                      icon="lock"
                      autoComplete="new-password"
                      value={newPassword}
                      onChange={(event) => setNewPassword(event.target.value)}
                    />
                    <FormField
                      label="تأكيد كلمة المرور"
                      type="password"
                      icon="lock"
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                    />
                  </div>

                  <PasswordChecklist value={newPassword} />

                  <div className="profile-edit__actions">
                    <Button type="submit" iconLeft="lock" loading={savingPassword}>
                      {canSignInWithPassword ? 'حفظ كلمة المرور' : 'تعيين كلمة المرور'}
                    </Button>
                  </div>
                </form>
              </section>
            ) : null}

            {!emailVerified ? (
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
                      أكّد بريدك لإكمال إعداد حسابك؛ بعد التأكيد يمكنك تعديل اسمك وصورتك من هنا.
                    </p>
                  </div>
                </div>
                <div className="verify-panel__actions">
                  <Button onClick={resendVerification} loading={sendingVerification} iconLeft="mail">
                    إعادة إرسال رسالة التحقق
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={checkVerification}
                    loading={checkingVerification}
                    iconLeft="refresh"
                  >
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
                  <dt>الاسم الظاهر</dt>
                  <dd className={verified ? 'name--gold' : ''}>{displayName}</dd>
                </div>
                <div>
                  <dt>اسم المستخدم</dt>
                  <dd dir="ltr">
                    {profile?.username ? `@${profile.username}` : 'لم يُحدَّد بعد'}
                  </dd>
                </div>
                <div>
                  <dt>البريد الإلكتروني</dt>
                  <dd dir="ltr">{user.email ?? '—'}</dd>
                </div>
                <div>
                  <dt>حالة الحساب</dt>
                  <dd>
                    {verified ? (
                      <span className="value--gold">
                        <Icon name="checkCircle" size={14} /> موثّق
                      </span>
                    ) : emailVerified ? (
                      'البريد مؤكّد'
                    ) : (
                      'بانتظار تأكيد البريد'
                    )}
                    {developer ? <span className="value--gold"> · مطوّر</span> : null}
                  </dd>
                </div>
                <div>
                  <dt>الدولة</dt>
                  <dd>{countryLabel(profile?.countryCode ?? '', profile?.countryName ?? '')}</dd>
                </div>
                <div>
                  <dt>الجنس</dt>
                  <dd>{genderLabel(profile?.gender ?? '')}</dd>
                </div>
                <div>
                  <dt>طريقة الدخول</dt>
                  <dd>{signInMethod}</dd>
                </div>
                <div>
                  <dt>تاريخ الانضمام</dt>
                  <dd>{safeDate(profile?.createdAt ?? user.metadata.creationTime)}</dd>
                </div>
                <div>
                  <dt>آخر تسجيل دخول</dt>
                  <dd>{safeDate(user.metadata.lastSignInTime)}</dd>
                </div>
              </dl>
              <p className="profile-card__hint">
                هذه البيانات محفوظة في حساب MangaPlus نفسه: الاسم والصورة تُعدَّل من هنا أو من
                التطبيق، والدولة والجنس واسم المستخدم تُعدَّل من التطبيق وتظهر هنا مباشرة.
              </p>
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
