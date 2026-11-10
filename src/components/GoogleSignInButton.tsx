import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { authErrorMessage, errorCode } from '@/firebase/errors';
import { signInWithGoogle } from '@/services/auth';
import { GoogleIcon } from './GoogleIcon';

interface GoogleSignInButtonProps {
  /** Page to open after a successful sign-in. */
  next?: string | null;
}

/**
 * Google is the second way into the same MangaPlus account. The provider opens
 * a Firebase popup; if the browser blocks it, the request is retried as a
 * redirect and the session is picked up on return.
 */
export function GoogleSignInButton({ next }: GoogleSignInButtonProps) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onGoogle = async () => {
    setError(null);
    setBusy(true);
    try {
      const signedIn = await signInWithGoogle();
      await refreshUser();
      toast({
        tone: 'success',
        title: `أهلاً بك${signedIn.displayName ? `، ${signedIn.displayName}` : ''}`,
        description: 'تم تسجيل الدخول بحساب جوجل.',
      });
      navigate(next ?? '/account', { replace: true });
    } catch (caught) {
      // A redirect fallback leaves the page, and a superseded request is not a
      // failure the user needs to read about.
      if (errorCode(caught) !== 'auth/cancelled-popup-request') {
        setError(authErrorMessage(caught));
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-oauth">
      <button
        type="button"
        className="btn btn--outline btn--md btn--block auth-oauth__button"
        onClick={onGoogle}
        disabled={busy}
      >
        <GoogleIcon size={18} />
        <span className="btn__label">{busy ? 'جارٍ فتح جوجل…' : 'المتابعة باستخدام جوجل'}</span>
      </button>
      {error ? (
        <p className="field__error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
