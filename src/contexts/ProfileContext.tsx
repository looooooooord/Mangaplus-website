import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { subscribeToProfile, type UserProfile } from '@/services/userProfile';

interface ProfileContextValue {
  profile: UserProfile | null;
  loading: boolean;
  error: unknown;
}

const ProfileContext = createContext<ProfileContextValue>({
  profile: null,
  loading: false,
  error: null,
});

/**
 * يقرأ الملف الشخصي المشترك مع التطبيق مرة واحدة ويوزّعه على الموقع، فيتحدّث
 * الصورة والاسم والشارات فوراً عندما يتغير المستند من التطبيق أو من هنا.
 */
export function ProfileProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const uid = user?.uid ?? null;
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    setProfile(null);
    setError(null);
    if (!uid) {
      setLoading(false);
      return undefined;
    }

    let active = true;
    let unsubscribe: (() => void) | undefined;
    setLoading(true);

    subscribeToProfile(
      uid,
      (nextProfile) => {
        if (!active) return;
        setProfile(nextProfile);
        setLoading(false);
      },
      (nextError) => {
        if (!active) return;
        setError(nextError);
        setLoading(false);
      },
    )
      .then((cleanup) => {
        if (!active) {
          cleanup();
          return;
        }
        unsubscribe = cleanup;
      })
      .catch((nextError: unknown) => {
        if (!active) return;
        setError(nextError);
        setLoading(false);
      });

    return () => {
      active = false;
      unsubscribe?.();
    };
  }, [uid]);

  const value = useMemo<ProfileContextValue>(
    () => ({ profile, loading, error }),
    [profile, loading, error],
  );

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile(): ProfileContextValue {
  return useContext(ProfileContext);
}
