import { useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { isFirebaseConfigured } from '@/firebase/config';
import { authErrorMessage } from '@/firebase/errors';
import { usePageMeta } from '@/hooks/usePageMeta';
import { signInWithEmail } from '@/services/auth';
import { AccountUnavailable } from '@/components/AccountUnavailable';
import { AuthShell } from '@/components/AuthShell';
import { Button } from '@/components/Button';
import { FormField } from '@/components/FormField';
import { GoogleSignInButton } from '@/components/GoogleSignInButton';
import { Icon } from '@/components/Icon';

function safeNext(value: string | null): string | null {
  if (!value) return null;
  if (!value.startsWith('/') || value.startsWith('//')) return null;
  return value;
}

export default function Login() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = safeNext(params.get('next'));

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  usePageMeta({
    title: 'تسجيل الدخول',
    description: 'سجّل الدخول إلى MangaPlus بحسابك نفسه المستخدم في التطبيق.',
    noIndex: true,
  });

  if (!isFirebaseConfigured) {
    return (
      <section className="page">
        <div className="container container--narrow">
          <AccountUnavailable />
        </div>
      </section>
    );
  }

  if (user) {
    return <Navigate to={next ?? '/account'} replace />;
  }

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setFormError(null);
    const nextErrors: typeof errors = {};
    if (!email.trim()) nextErrors.email = 'أدخل بريدك الإلكتروني.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim()))
      nextErrors.email = 'صيغة البريد الإلكتروني غير صحيحة.';
    if (!password) nextErrors.password = 'أدخل كلمة المرور.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      const signedIn = await signInWithEmail(email, password);
      toast({
        tone: 'success',
        title: `أهلاً بك${signedIn.displayName ? `، ${signedIn.displayName}` : ''}`,
        description: signedIn.emailVerified
          ? 'تم تسجيل الدخول بنجاح.'
          : 'تم تسجيل الدخول. يمكنك تأكيد بريدك من صفحة حسابك.',
      });
      navigate(next ?? '/account', { replace: true });
    } catch (error) {
      setFormError(authErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      eyebrow="أهلاً بعودتك"
      title="تسجيل الدخول"
      subtitle="استخدم حساب MangaPlus نفسه الذي تستخدمه في التطبيق."
      footer={
        <p>
          ليس لديك حساب؟ <Link to="/signup">إنشاء حساب جديد</Link>
        </p>
      }
    >
      <GoogleSignInButton next={next} />

      <div className="auth-divider">
        <span>أو بالبريد الإلكتروني</span>
      </div>

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
            setErrors((current) => ({ ...current, email: undefined }));
          }}
          error={errors.email}
          autoComplete="email"
          placeholder="name@example.com"
          dir="ltr"
          required
        />

        <FormField
          label="كلمة المرور"
          type="password"
          icon="lock"
          value={password}
          onChange={(event) => {
            setPassword(event.target.value);
            setErrors((current) => ({ ...current, password: undefined }));
          }}
          error={errors.password}
          autoComplete="current-password"
          placeholder="••••••••"
          required
        />

        <div className="auth-form__row">
          <Link className="auth-link" to="/forgot-password">
            نسيت كلمة المرور؟
          </Link>
        </div>

        <Button type="submit" size="lg" fullWidth loading={submitting} iconLeft={submitting ? undefined : 'lock'}>
          {submitting ? 'جارٍ تسجيل الدخول…' : 'تسجيل الدخول'}
        </Button>
      </form>

      <div className="auth-divider">
        <span>أو</span>
      </div>

      <Link className="btn btn--outline btn--md btn--block" to="/signup">
        <span className="btn__label">إنشاء حساب جديد</span>
      </Link>

      <p className="auth-note">
        <Icon name="shield" size={16} />
        حسابات MangaPlus محمية، ولا تُشارك كلمة المرور مع أي جهة.
      </p>
    </AuthShell>
  );
}
