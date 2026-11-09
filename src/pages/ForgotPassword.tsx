import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { isFirebaseConfigured } from '@/firebase/config';
import { authErrorMessage, isErrorCode } from '@/firebase/errors';
import { usePageMeta } from '@/hooks/usePageMeta';
import { requestPasswordReset } from '@/services/auth';
import { AccountUnavailable } from '@/components/AccountUnavailable';
import { AuthShell } from '@/components/AuthShell';
import { Button } from '@/components/Button';
import { FormField } from '@/components/FormField';
import { Icon } from '@/components/Icon';
import { StatusCard } from '@/components/StatusCard';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  usePageMeta({
    title: 'استعادة كلمة المرور',
    description: 'اطلب رابطاً آمناً لإعادة تعيين كلمة مرور حساب MangaPlus.',
    noIndex: true,
  });

  if (!isFirebaseConfigured) {
    return (
      <section className="page">
        <div className="container container--narrow">
          <AccountUnavailable title="استعادة كلمة المرور غير متاحة حالياً" />
        </div>
      </section>
    );
  }

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setFormError(null);
    if (!email.trim()) {
      setError('أدخل بريدك الإلكتروني.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) {
      setError('صيغة البريد الإلكتروني غير صحيحة.');
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await requestPasswordReset(email);
      setSent(true);
    } catch (sendError) {
      // Do not reveal whether an account exists for this address.
      if (isErrorCode(sendError, 'auth/user-not-found', 'auth/invalid-email')) {
        setSent(true);
      } else {
        setFormError(authErrorMessage(sendError));
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (sent) {
    return (
      <StatusCard
        tone="success"
        icon="mail"
        eyebrow="رسالة إعادة التعيين"
        title="تحقق من بريدك الإلكتروني"
        description={
          <p>
            إذا كان البريد <strong dir="ltr">{email.trim()}</strong> مرتبطاً بحساب، فستصلك رسالة تحتوي على
            رابط لإعادة تعيين كلمة المرور. يُفتح الرابط على موقع MangaPlus مباشرة.
          </p>
        }
        actions={
          <>
            <Link className="btn btn--primary btn--md" to="/login">
              <span className="btn__label">العودة إلى تسجيل الدخول</span>
            </Link>
            <button type="button" className="btn btn--ghost btn--md" onClick={() => setSent(false)}>
              <span className="btn__label">استخدام بريد آخر</span>
            </button>
          </>
        }
      >
        <p className="status-page__hint">لم تجد الرسالة؟ تحقق من مجلد البريد غير المرغوب فيه.</p>
      </StatusCard>
    );
  }

  return (
    <AuthShell
      eyebrow="استعادة الحساب"
      title="نسيت كلمة المرور؟"
      subtitle="أدخل بريدك الإلكتروني وسنرسل لك رابطاً لإعادة تعيين كلمة المرور."
      footer={
        <p>
          تذكرت كلمة المرور؟ <Link to="/login">تسجيل الدخول</Link>
        </p>
      }
    >
      {formError ? (
        <div className="form-alert form-alert--error" role="alert">
          <Icon name="alert" size={18} />
          <span>{formError}</span>
        </div>
      ) : null}

      <form className="auth-form" onSubmit={onSubmit} noValidate>
        <FormField
          label="البريد الإلكتروني"
          type="email"
          icon="mail"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            setError(null);
          }}
          error={error ?? undefined}
          autoComplete="email"
          placeholder="name@example.com"
          dir="ltr"
          required
        />

        <Button type="submit" size="lg" fullWidth loading={submitting} iconLeft="mail">
          {submitting ? 'جارٍ الإرسال…' : 'إرسال رابط إعادة التعيين'}
        </Button>
      </form>
    </AuthShell>
  );
}
