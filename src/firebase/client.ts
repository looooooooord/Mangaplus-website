import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import type { Auth } from 'firebase/auth';
import { firebaseConfig, isFirebaseConfigured } from './config';

export class FirebaseUnavailableError extends Error {
  constructor() {
    super('account-service-unavailable');
    this.name = 'FirebaseUnavailableError';
  }
}

let authPromise: Promise<Auth> | null = null;

function getFirebaseApp(): FirebaseApp {
  return getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
}

/**
 * Loads Firebase Auth on demand so the public pages stay light and the account
 * SDK is only downloaded when it is actually needed.
 */
export function getFirebaseAuth(): Promise<Auth> {
  if (!isFirebaseConfigured) return Promise.reject(new FirebaseUnavailableError());

  if (!authPromise) {
    authPromise = import('firebase/auth')
      .then(({ getAuth }) => getAuth(getFirebaseApp()))
      .catch((error: unknown) => {
        authPromise = null;
        throw error;
      });
  }

  return authPromise;
}
