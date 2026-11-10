import type { ActionCodeSettings, User } from 'firebase/auth';
import { isErrorCode } from '@/firebase/errors';
import { getFirebaseAuth } from '@/firebase/client';

const siteOrigin = `${import.meta.env.VITE_SITE_URL ?? ''}`.replace(/\/$/, '');
const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');

export function actionHandlerUrl(): string {
  const origin =
    siteOrigin ||
    (typeof window !== 'undefined' ? `${window.location.origin}${basePath}` : basePath);
  return `${origin}/auth-action`;
}

/**
 * Sends users back to the site's own action page. The email templates in the
 * Firebase console should point their action URL at /auth-action as well, so no
 * default Firebase page is ever shown.
 */
export function actionCodeSettings(): ActionCodeSettings {
  return {
    url: actionHandlerUrl(),
    handleCodeInApp: true,
  };
}

export async function signInWithEmail(email: string, password: string): Promise<User> {
  const auth = await getFirebaseAuth();
  const { signInWithEmailAndPassword } = await import('firebase/auth');
  const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
  return credential.user;
}

export async function signInWithGoogle(): Promise<User> {
  const auth = await getFirebaseAuth();
  const { GoogleAuthProvider, signInWithPopup, signInWithRedirect } = await import('firebase/auth');
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });

  try {
    const credential = await signInWithPopup(auth, provider);
    return credential.user;
  } catch (error) {
    // Popups are blocked in some in-app browsers; a full redirect also works and
    // the auth state listener picks the session up when the user comes back.
    if (
      isErrorCode(error, 'auth/popup-blocked', 'auth/operation-not-supported-in-this-environment')
    ) {
      await signInWithRedirect(auth, provider);
    }
    throw error;
  }
}

export async function createAccount(email: string, password: string, displayName: string): Promise<User> {
  const auth = await getFirebaseAuth();
  const { createUserWithEmailAndPassword, updateProfile } = await import('firebase/auth');
  const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
  const name = displayName.trim();
  if (name) {
    try {
      await updateProfile(credential.user, { displayName: name });
    } catch {
      // The account exists at this point; the name can be set later from the profile page.
    }
  }
  return credential.user;
}

export async function signOutUser(): Promise<void> {
  const auth = await getFirebaseAuth();
  const { signOut } = await import('firebase/auth');
  await signOut(auth);
}

export async function sendVerificationEmail(): Promise<void> {
  const auth = await getFirebaseAuth();
  const { sendEmailVerification } = await import('firebase/auth');
  const user = auth.currentUser;
  if (!user) throw new Error('auth/no-current-user');
  await sendEmailVerification(user, actionCodeSettings());
}

export async function requestPasswordReset(email: string): Promise<void> {
  const auth = await getFirebaseAuth();
  const { sendPasswordResetEmail } = await import('firebase/auth');
  await sendPasswordResetEmail(auth, email.trim(), actionCodeSettings());
}

export async function applyEmailVerification(oobCode: string): Promise<void> {
  const auth = await getFirebaseAuth();
  const { applyActionCode } = await import('firebase/auth');
  await applyActionCode(auth, oobCode);
  if (auth.currentUser) {
    const { reload } = await import('firebase/auth');
    await reload(auth.currentUser).catch(() => undefined);
  }
}

export async function verifyResetCode(oobCode: string): Promise<string> {
  const auth = await getFirebaseAuth();
  const { verifyPasswordResetCode } = await import('firebase/auth');
  return verifyPasswordResetCode(auth, oobCode);
}

export async function completePasswordReset(oobCode: string, password: string): Promise<void> {
  const auth = await getFirebaseAuth();
  const { confirmPasswordReset } = await import('firebase/auth');
  await confirmPasswordReset(auth, oobCode, password);
}

export async function reloadUser(): Promise<User | null> {
  const auth = await getFirebaseAuth();
  if (!auth.currentUser) return null;
  const { reload } = await import('firebase/auth');
  await reload(auth.currentUser);
  return auth.currentUser;
}

export async function updateDisplayName(displayName: string): Promise<void> {
  const auth = await getFirebaseAuth();
  const user = auth.currentUser;
  if (!user) throw new Error('auth/no-current-user');
  const { updateProfile } = await import('firebase/auth');
  await updateProfile(user, { displayName: displayName.trim() });
}

/** Stores a photo URL on the account so it follows the user across devices. */
export async function updatePhotoUrl(photoURL: string): Promise<void> {
  const auth = await getFirebaseAuth();
  const user = auth.currentUser;
  if (!user) throw new Error('auth/no-current-user');
  const { updateProfile } = await import('firebase/auth');
  await updateProfile(user, { photoURL: photoURL.trim() || null });
}

export async function subscribeToAuth(
  listener: (user: User | null) => void,
): Promise<() => void> {
  const auth = await getFirebaseAuth();
  const { onAuthStateChanged } = await import('firebase/auth');
  return onAuthStateChanged(auth, listener);
}
