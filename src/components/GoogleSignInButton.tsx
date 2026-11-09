import { useState } from 'react';
import { signInWithGoogle } from '@/services/auth';

interface GoogleSignInButtonProps {
  onSuccess: (displayName?: string | null) => void;
  onError: (error: unknown) => void;
  disabled?: boolean;
}

function GoogleMark() {
  return (
    <svg className="google-signin__logo" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M21.35 12.23c0-.78-.07-1.53-.22-2.25H12v4.26h5.24a4.48 4.48 0 0 1-1.94 2.94v2.45h3.14c1.84-1.7 2.91-4.2 2.91-7.4Z" />
      <path fill="#34A853" d="M12 21.5c2.63 0 4.84-.87 6.45-2.37l-3.14-2.45c-.87.58-1.98.92-3.31.92-2.54 0-4.69-1.72-5.46-4.03H3.3v2.53A9.74 9.74 0 0 0 12 21.5Z" />
      <path fill="#FBBC05" d="M6.54 13.57A5.86 5.86 0 0 1 6.23 12c0-.54.11-1.07.31-1.57V7.9H3.3A9.5 9.5 0 0 0 2.25 12c0 1.48.35 2.88 1.05 4.1l3.24-2.53Z" />
      <path fill="#EA4335" d="M12 6.4c1.43 0 2.71.49 3.72 1.46l2.79-2.79C16.84 3.5 14.63 2.5 12 2.5A9.74 9.74 0 0 0 3.3 7.9l3.24 2.53C6.85 8.12 9 6.4 12 6.4Z" />
    </svg>
  );
}

export function GoogleSignInButton({ onSuccess, onError, disabled = false }: GoogleSignInButtonProps) {
  const [submitting, setSubmitting] = useState(false);

  const handleClick = async () => {
    setSubmitting(true);
    try {
      const user = await signInWithGoogle();
      onSuccess(user.displayName);
    } catch (error) {
      onError(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <button
      type="button"
      className="google-signin"
      onClick={handleClick}
      disabled={disabled || submitting}
      aria-busy={submitting}
    >
      <GoogleMark />
      <span>{submitting ? 'جارٍ المتابعة مع Google…' : 'المتابعة باستخدام Google'}</span>
    </button>
  );
}
