import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { isFirebaseConfigured } from '@/firebase/config';
import { authErrorMessage, isErrorCode } from '@/firebase/errors';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { usePageMeta } from '@/hooks/usePageMeta';
import {
  applyEmailVerification,
  completePasswordReset,
  requestPasswordReset,
  verifyResetCode,
} from '@/services/auth';
import { AuthShell } from '@/components/AuthShell';
import { Button } from '@/components/Button';
import { FormField } from '@/components/FormField';
import { Icon } from '@/components/Icon';
import { Logo } from '@/components/Logo';
import { PasswordChecklist, isPasswordValid } from '@/components/PasswordChecklist';
import { StatusCard } from '@/components/StatusCard';

type ActionPhase =
  | 'checking'
  | 'verify-success'
  | 'reset-form'
  | 'reset-success'
  | 'expired'
  | 'invalid'
  | 'offline'
  | 'unavailable'
  | 'error';

function LoadingCard() {
  return (
    <div className="status-page">
      <div className="status-page__card">
        <Logo size="md" />
        <span className="status-spinner" aria-hidden="true" />
        <h1 className="status-page__title">جارٍ التحقق من الرابط</h1>
        <p className="status-page__text">لحظة واحدة حتى يكتمل التحقق.</p>
      </div>
    </div>
  );
}

export default function AuthAction() {
  const [params] = useSearchParams();
  // Router navigation keeps the deployment base path (/Mangaplus-website) intact
  // while dropping mode/oobCode from the address bar once the code is consumed.
  const navigate = useNavigate();
  const mode = params.get('mode');
  const oobCode = params.get('oobCode');
  const linkError = params.get('error');
  const online = useOnlineStatus();
  const { refreshUser } = useAuth();

  const [phase, setPhase] = useState<ActionPhase>('checking');
  const [resetEmail, setResetEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [resendEmail, setResendEmail] = useState('');
  const [resendState, setResendState] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [resendError, setResendError] = useState<string | null>(null);

  usePageMeta({
    title: 'تأكيد الحساب وإعادة تعيين كلمة المرور',
    description: 'تأكيد البريد الإلكتروني وإعادة تعيين كلمة المرور لحساب MangaPlus.',
    noIndex: true,
  });

  useEffect(() => {
    let active = true;

    const run = async () => {
      if (!isFirebaseConfigured) {
        setPhase('unavailable');
        return;
      }
      if (!online) {
        setPhase('offline');
        return;
      }
      if (linkError || !mode || !oobCode) {
        setPhase('invalid');
        return;
      }

      setPhase('checking');

      if (mode === 'verifyEmail') {
        try {
          await applyEmailVerification(oobCode);
          if (!active) return;
          await refreshUser();
          setPhase('verify-success');
          navigate('/auth-action', { replace: true });
        } catch (error) {
          if (!active) return;
          if (isErrorCode(error, 'auth/expired-action-code')) setPhase('expired');
          else if (isErrorCode(error, 'auth/invalid-action-code')) setPhase('invalid');
          else setPhase('error');
        }
        return;
      }

      if (mode === 'resetPassword') {
        try {
          const email = await verifyResetCode(oobCode);
          if (!active) return;
          setResetEmail(email);
          setResetCode(oobCode);
          setPhase('reset-form');
        } catch (error) {
          if (!active) return;
          if (isErrorCode(error, 'auth/expired-action-code')) setPhase('expired');
          else if (isErrorCode(error, 'auth/invalid-action-code')) setPhase('invalid');
          else setPhase('error');
        }
        return;
      }

      setPhase('invalid');
    };

    void run();
    return () => {
      active = false;
    };
  }, [mode, oobCode, linkError, online, refreshUser]);

  const submitReset = async (event: FormEvent) => {
    event.preventDefault();
    setFieldError(null);
    if (!isPasswordValid(password)) {
      setFieldError('يجب أن تحتوي كلمة المرور على ٨ أحرف، وحرف، ورقم على الأقل.');
      return;
    }
    if (password !== confirm) {
      setFieldError('كلمتا المرور غير متطابقتين.');
      return;
    }
    setSubmitting(true);
    try {
      await completePasswordReset(resetCode, password);
      setPhase('reset-success');
      navigate('/auth-action', { replace: true });
    } catch (error) {
      if (isErrorCode(error, 'auth/expired-action-code')) setPhase('expired');
      else if (isErrorCode(error, 'auth/invalid-action-code')) setPhase('invalid');
      else setFieldError(authErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  const sendNewResetLink = async (event: FormEvent) => {
    event.preventDefault();
    setResendError(null);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(resendEmail.trim())) {
      setResendError('صيغة البريد الإلكتروني غير صحيحة.');
      return;
    }
    setResendState('sending');
    try {
      await requestPasswordReset(resendEmail);
      setResendState('sent');
    } catch (error) {
      if (isErrorCode(error, 'auth/user-not-found')) {
        setResendState('sent');
      } else {
        setResendState('idle');
        setResendError(authErrorMessage(error));
      }
    }
  };

  if (phase === 'checking') return <LoadingCard />;

  if (phase === 'verify-success') {
    return (
      <StatusCard
        tone="success"
        icon="checkCircle"
        eyebrow="تم التحقق"
        title="تم تأكيد بريدك الإلكتروني"
        description={
          <p>اكتمل التحقق من حسابك. يمكنك الآن متابعة التصفح والقراءة، وإدارة حسابك من صفحة حسابي.</p>
        }
        actions={
          <>
            <Link className="btn btn--primary btn--md" to="/account">
              <span className="btn__label">الذهاب إلى حسابي</span>
            </Link>
            <Link className="btn btn--outline btn--md" to="/explore">
              <span className="btn__label">تصفح الأعمال</span>
            </Link>
          </>
        }
      />
    );
  }

  if (phase === 'reset-success') {
    return (
      <StatusCard
        tone="success"
        icon="lock"
        eyebrow="تم التحديث"
        title="تم تغيير كلمة المرور"
        description={
          <p>
            يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة. تأكد من تحديث أي تطبيق يستخدم الحساب نفسه.
          </p>
        }
        actions={
          <Link className="btn btn--primary btn--md" to="/login">
            <span className="btn__label">تسجيل الدخول</span>
          </Link>
        }
      />
    );
  }

  if (phase === 'reset-form') {
    return (
      <AuthShell
        eyebrow="إعادة تعيين كلمة المرور"
        title="اختر كلمة مرور جديدة"
        subtitle="كلمة المرور الجديدة تُطبَّق على حساب MangaPlus في الموقع والتطبيق."
        footer={
          <p>
            تذكرت كلمة المرور؟ <Link to="/login">تسجيل الدخول</Link>
          </p>
        }
      >
        <div className="auth-account">
          <Icon name="mail" size={17} />
          <span dir="ltr">{resetEmail}</span>
        </div>

        {fieldError ? (
          <div className="form-alert form-alert--error" role="alert">
            <Icon name="alert" size={18} />
            <span>{fieldError}</span>
          </div>
        ) : null}

        <form className="auth-form" onSubmit={submitReset} noValidate>
          <FormField
            label="كلمة المرور الجديدة"
            type="password"
            icon="lock"
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
              setFieldError(null);
            }}
            autoComplete="new-password"
            placeholder="••••••••"
            required
          />
          <PasswordChecklist value={password} />
          <FormField
            label="تأكيد كلمة المرور"
            type="password"
            icon="lock"
            value={confirm}
            onChange={(event) => {
              setConfirm(event.target.value);
              setFieldError(null);
            }}
            autoComplete="new-password"
            placeholder="••••••••"
            required
          />
          <Button type="submit" size="lg" fullWidth loading={submitting}>
            {submitting ? 'جارٍ الحفظ…' : 'حفظ كلمة المرور'}
          </Button>
        </form>
      </AuthShell>
    );
  }

  if (phase === 'expired') {
    return (
      <StatusCard
        tone="warning"
        icon="clock"
        eyebrow="انتهت الصلاحية"
        title="انتهت صلاحية الرابط"
        description={
          <p>
            روابط {mode === 'resetPassword' ? 'إعادة تعيين كلمة المرور' : 'التحقق'} صالحة لفترة محدودة. اطلب
            رابطاً جديداً للمتابعة.
          </p>
        }
        actions={
          mode === 'resetPassword' ? null : (
            <>
              <Link className="btn btn--primary btn--md" to="/login?next=%2Faccount">
                <span className="btn__label">تسجيل الدخول لإعادة الإرسال</span>
              </Link>
              <Link className="btn btn--outline btn--md" to="/explore">
                <span className="btn__label">تصفح الأعمال</span>
              </Link>
            </>
          )
        }
      >
        {mode === 'resetPassword' ? (
          resendState === 'sent' ? (
            <div className="status-note status-note--success">
              <Icon name="checkCircle" size={17} />
              إذا كان البريد مرتبطاً بحساب، فستصلك رسالة جديدة خلال دقائق.
            </div>
          ) : (
            <form className="status-form" onSubmit={sendNewResetLink} noValidate>
              <FormField
                label="بريدك الإلكتروني"
                type="email"
                icon="mail"
                value={resendEmail}
                onChange={(event) => {
                  setResendEmail(event.target.value);
                  setResendError(null);
                }}
                error={resendError ?? undefined}
                placeholder="name@example.com"
                dir="ltr"
                required
              />
              <Button type="submit" loading={resendState === 'sending'} iconLeft="mail">
                إرسال رابط جديد
              </Button>
            </form>
          )
        ) : (
          <p className="status-page__hint">
            يمكنك إعادة إرسال رسالة التحقق من صفحة حسابك بعد تسجيل الدخول.
          </p>
        )}
      </StatusCard>
    );
  }

  if (phase === 'offline') {
    return (
      <StatusCard
        tone="warning"
        icon="globe"
        eyebrow="الاتصال"
        title="لا يوجد اتصال بالإنترنت"
        description={<p>يحتاج التحقق من الروابط إلى اتصال. تحقق من شبكتك ثم أعد المحاولة.</p>}
        actions={
          <Button onClick={() => window.location.reload()} iconLeft="refresh">
            إعادة المحاولة
          </Button>
        }
      />
    );
  }

  if (phase === 'unavailable') {
    return (
      <StatusCard
        tone="info"
        icon="shield"
        eyebrow="حساب MangaPlus"
        title="خدمة الحساب غير متاحة حالياً"
        description={
          <p>يمكنك متابعة التصفح والقراءة، وحفظ أعمالك في مكتبتك على هذا الجهاز.</p>
        }
        actions={
          <>
            <Link className="btn btn--primary btn--md" to="/">
              <span className="btn__label">الصفحة الرئيسية</span>
            </Link>
            <Link className="btn btn--outline btn--md" to="/explore">
              <span className="btn__label">تصفح الأعمال</span>
            </Link>
          </>
        }
      />
    );
  }

  if (phase === 'invalid') {
    return (
      <StatusCard
        tone="error"
        icon="alert"
        eyebrow="رابط غير صالح"
        title="الرابط غير صالح"
        description={
          <p>
            تعذّر التحقق من هذا الرابط. قد يكون مستخدماً من قبل أو ناقصاً. اطلب رابطاً جديداً ثم حاول
            مرة أخرى.
          </p>
        }
        actions={
          <>
            <Link className="btn btn--primary btn--md" to="/forgot-password">
              <span className="btn__label">طلب رابط جديد</span>
            </Link>
            <Link className="btn btn--outline btn--md" to="/login">
              <span className="btn__label">تسجيل الدخول</span>
            </Link>
          </>
        }
      />
    );
  }

  return (
    <StatusCard
      tone="error"
      icon="alert"
      eyebrow="تعذّر الإكمال"
      title="لم يكتمل التحقق"
      description={<p>حدث أمر غير متوقع أثناء معالجة الرابط. يمكنك المحاولة مرة أخرى.</p>}
      actions={
        <>
          <Button onClick={() => window.location.reload()} iconLeft="refresh">
            إعادة المحاولة
          </Button>
          <Link className="btn btn--ghost btn--md" to="/contact">
            <span className="btn__label">التواصل مع الدعم</span>
          </Link>
        </>
      }
    />
  );
}
