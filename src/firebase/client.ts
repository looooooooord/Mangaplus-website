import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import type { Auth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';
import { firebaseConfig, isFirebaseConfigured } from './config';

export class FirebaseUnavailableError extends Error {
  constructor() {
    super('account-service-unavailable');
    this.name = 'FirebaseUnavailableError';
  }
}

let authPromise: Promise<Auth> | null = null;
let firestorePromise: Promise<Firestore> | null = null;

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

/**
 * Loads the Firestore SDK on demand. The website reads and writes the same
 * `userProfiles` documents the MangaPlus app uses, so both clients share one
 * profile with the same picture, name, country and badges.
 */
export function getFirebaseFirestore(): Promise<Firestore> {
  if (!isFirebaseConfigured) return Promise.reject(new FirebaseUnavailableError());

  if (!firestorePromise) {
    firestorePromise = import('firebase/firestore')
      .then(({ getFirestore }) => getFirestore(getFirebaseApp()))
      .catch((error: unknown) => {
        firestorePromise = null;
        throw error;
      });
  }

  return firestorePromise;
}
