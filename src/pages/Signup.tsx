import { useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { isFirebaseConfigured } from '@/firebase/config';
import { authErrorMessage } from '@/firebase/errors';
import { usePageMeta } from '@/hooks/usePageMeta';
import { createAccount, sendVerificationEmail } from '@/services/auth';
import { AccountUnavailable } from '@/components/AccountUnavailable';
import { AuthShell } from '@/components/AuthShell';
import { Button } from '@/components/Button';
import { FormField } from '@/components/FormField';
import { GoogleSignInButton } from '@/components/GoogleSignInButton';
import { Icon } from '@/components/Icon';
import { PasswordChecklist, isPasswordValid, passwordStrength } from '@/components/PasswordChecklist';

interface SignupErrors {
  name?: string;
  email?: string;
  password?: string;
  confirm?: string;
  terms?: string;
}

export default function Signup() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [accepted, setAccepted] = useState(false);
  const [errors, setErrors] = useState<SignupErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  usePageMeta({
    title: 'إنشاء حساب',
    description: 'أنشئ حساب MangaPlus للموقع والتطبيق بحساب واحد.',
    noIndex: true,
  });

  if (!isFirebaseConfigured) {
    return (
      <section className="page">
        <div className="container container--narrow">
          <AccountUnavailable title="إنشاء الحساب غير متاح حالياً" />
        </div>
      </section>
    );
  }

  if (user) return <Navigate to="/account" replace />;

  const strength = passwordStrength(password);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setFormError(null);
    const nextErrors: SignupErrors = {};
    if (name.trim().length < 3) nextErrors.name = 'اختر اسماً من ٣ أحرف على الأقل.';
    if (!email.trim()) nextErrors.email = 'أدخل بريدك الإلكتروني.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim()))
      nextErrors.email = 'صيغة البريد الإلكتروني غير صحيحة.';
    if (!password) nextErrors.password = 'اختر كلمة مرور.';
    else if (!isPasswordValid(password))
      nextErrors.password = 'يجب أن تحتوي كلمة المرور على ٨ أحرف، وحرف، ورقم على الأقل.';
    if (confirm !== password) nextErrors.confirm = 'كلمتا المرور غير متطابقتين.';
    if (!accepted) nextErrors.terms = 'يجب الموافقة على الشروط وسياسة الخصوصية.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      const created = await createAccount(email, password, name);
      let verificationSent = true;
      try {
        await sendVerificationEmail();
      } catch {
        verificationSent = false;
      }
      toast({
        tone: 'success',
        title: `أهلاً ${created.displayName ?? name}`,
        description: verificationSent
          ? 'أرسلنا رسالة تحقق إلى بريدك. افتح الرابط لتأكيد الحساب.'
          : 'تم إنشاء حسابك. يمكنك إرسال رسالة التحقق من صفحة حسابك.',
      });
      navigate('/account', { replace: true });
    } catch (error) {
      setFormError(authErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      eyebrow="حساب MangaPlus"
      title="إنشاء حساب"
      subtitle="حساب واحد تستخدمه في الموقع والتطبيق، بنفس البريد وكلمة المرور."
      footer={
        <p>
          لديك حساب بالفعل؟ <Link to="/login">تسجيل الدخول</Link>
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
          label="اسم المستخدم"
          icon="user"
          value={name}
          onChange={(event) => {
            setName(event.target.value);
            setErrors((current) => ({ ...current, name: undefined }));
          }}
          error={errors.name}
          autoComplete="nickname"
          placeholder="مثال: قارئ الليل"
          maxLength={40}
          required
        />

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

        <div>
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
            autoComplete="new-password"
            placeholder="••••••••"
            required
          />
          {password ? (
            <div className="strength" aria-live="polite">
              <div className="strength__bars" aria-hidden="true">
                {[1, 2, 3, 4].map((level) => (
                  <span key={level} className={strength >= level ? `is-on strength--${strength}` : ''} />
                ))}
              </div>
              <span className="strength__label">
                {strength <= 1 ? 'ضعيفة' : strength === 2 ? 'متوسطة' : strength === 3 ? 'جيدة' : 'قوية'}
              </span>
            </div>
          ) : null}
          <PasswordChecklist value={password} />
        </div>

        <FormField
          label="تأكيد كلمة المرور"
          type="password"
          icon="lock"
          value={confirm}
          onChange={(event) => {
            setConfirm(event.target.value);
            setErrors((current) => ({ ...current, confirm: undefined }));
          }}
          error={errors.confirm}
          autoComplete="new-password"
          placeholder="••••••••"
          required
        />

        <div className={`terms-field ${errors.terms ? 'has-error' : ''}`.trim()}>
          <label className="checkbox">
            <input
              type="checkbox"
              checked={accepted}
              onChange={(event) => {
                setAccepted(event.target.checked);
                setErrors((current) => ({ ...current, terms: undefined }));
              }}
            />
            <span className="checkbox__mark" aria-hidden="true">
              <Icon name="check" size={12} />
            </span>
            <span>
              أوافق على <Link to="/terms">شروط الاستخدام</Link> و<Link to="/privacy">سياسة الخصوصية</Link>.
            </span>
          </label>
          {errors.terms ? (
            <p className="field__error" role="alert">
              {errors.terms}
            </p>
          ) : null}
        </div>

        <Button type="submit" size="lg" fullWidth loading={submitting}>
          {submitting ? 'جارٍ إنشاء الحساب…' : 'إنشاء الحساب'}
        </Button>
      </form>

      <div className="auth-divider">
        <span>أو</span>
      </div>

      <GoogleSignInButton
        disabled={submitting}
        onSuccess={(displayName) => {
          toast({
            tone: 'success',
            title: `أهلاً بك${displayName ? `، ${displayName}` : ''}`,
            description: 'تم إنشاء حسابك باستخدام Google.',
          });
          navigate('/account', { replace: true });
        }}
        onError={(error) => setFormError(authErrorMessage(error))}
      />

      <p className="auth-note">
        <Icon name="mail" size={16} />
        عند إنشاء الحساب بالبريد، سنرسل رابط تحقق يُفتح على موقع MangaPlus مباشرة.
      </p>
    </AuthShell>
  );
}
