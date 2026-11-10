import { useEffect, useState } from 'react';
import type { User } from 'firebase/auth';
import { getLocalPhoto, subscribeToLocalPhoto } from '@/services/profilePhoto';

/**
 * Resolves the picture to show for an account: the one picked on this device
 * first, then the picture stored on the Firebase account (for example the
 * Google profile picture).
 */
export function useProfilePhoto(user: User | null): string | null {
  const uid = user?.uid ?? null;
  const [localPhoto, setLocalPhoto] = useState<string | null>(() => (uid ? getLocalPhoto(uid) : null));

  useEffect(() => {
    if (!uid) {
      setLocalPhoto(null);
      return undefined;
    }
    setLocalPhoto(getLocalPhoto(uid));
    return subscribeToLocalPhoto(() => setLocalPhoto(getLocalPhoto(uid)));
  }, [uid]);

  return localPhoto ?? user?.photoURL ?? null;
}
