import type { User } from 'firebase/auth';
import { getFirebaseFirestore } from '@/firebase/client';

/**
 * حساب MangaPlus واحد للموقع والتطبيق: الملف الشخصي محفوظ في مجموعة
 * `userProfiles/{uid}` داخل مشروع Firebase نفسه، بنفس الحقول التي يقرأها
 * التطبيق ويكتبها، فأي تعديل هنا يظهر هناك والعكس.
 */
export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  username: string;
  countryCode: string;
  countryName: string;
  gender: string;
  bio: string;
  photoUrl: string;
  photoData: string;
  isGuest: boolean;
  emailVerified: boolean;
  isVerified: boolean;
  isOfficialDeveloper: boolean;
  syncFavorites: boolean;
  createdAt: string | null;
}

/** الحقول التي تسمح بها قواعد Firestore للتعديل من العميل. */
export interface ProfilePatch {
  displayName?: string;
  photoUrl?: string;
  photoData?: string;
}

export const PROFILE_VERIFICATION_REQUIRED = 'profile/verification-required';
export const PROFILE_PHOTO_TOO_LARGE = 'profile/photo-too-large';

/** خطأ يحمل رمزاً يفهمه جدول الرسائل العربية. */
function profileError(code: string): Error {
  const error = new Error(code) as Error & { code: string };
  error.code = code;
  return error;
}

/** حد التطبيق نفسه لحجم الصورة المحفوظة كنص base64. */
const PHOTO_DATA_LIMIT = 850000;

function text(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function toIsoDate(value: unknown): string | null {
  if (value && typeof value === 'object' && 'toDate' in value) {
    const date = (value as { toDate: () => Date }).toDate();
    return Number.isNaN(date.getTime()) ? null : date.toISOString();
  }
  if (value instanceof Date) return value.toISOString();
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return new Date(value).toISOString();
  return null;
}

function toProfile(uid: string, data: Record<string, unknown>): UserProfile {
  return {
    uid,
    email: text(data.email),
    displayName: text(data.displayName),
    username: text(data.username),
    countryCode: text(data.countryCode),
    countryName: text(data.countryName),
    gender: text(data.gender),
    bio: text(data.bio),
    photoUrl: text(data.photoUrl),
    photoData: text(data.photoData),
    isGuest: data.isGuest === true,
    emailVerified: data.emailVerified === true,
    isVerified: data.isVerified === true,
    isOfficialDeveloper: data.isOfficialDeveloper === true,
    syncFavorites: data.syncFavorites !== false,
    createdAt: toIsoDate(data.createdAt),
  };
}

/** يشترك في مستند الملف الشخصي ويتابع أي تغيير يحدث من التطبيق. */
export async function subscribeToProfile(
  uid: string,
  onProfile: (profile: UserProfile | null) => void,
  onError: (error: unknown) => void,
): Promise<() => void> {
  const db = await getFirebaseFirestore();
  const { doc, onSnapshot } = await import('firebase/firestore');
  return onSnapshot(
    doc(db, 'userProfiles', uid),
    (snapshot) => onProfile(snapshot.exists() ? toProfile(uid, snapshot.data()) : null),
    (error) => onError(error),
  );
}

/**
 * يحفظ الاسم أو الصورة في الملف الشخصي المشترك. قواعد Firestore تسمح بذلك فقط
 * بعد تأكيد البريد (أو لحساب ضيف)، تماماً كما في التطبيق.
 */
export async function saveProfile(user: User, patch: ProfilePatch): Promise<void> {
  if (!user.emailVerified && !user.isAnonymous) {
    throw profileError(PROFILE_VERIFICATION_REQUIRED);
  }

  const changes: Record<string, string> = {};
  if (patch.displayName !== undefined) changes.displayName = patch.displayName.trim();
  if (patch.photoData !== undefined) {
    if (patch.photoData.length > PHOTO_DATA_LIMIT) throw profileError(PROFILE_PHOTO_TOO_LARGE);
    changes.photoData = patch.photoData;
    changes.photoUrl = '';
  }
  if (patch.photoUrl !== undefined) {
    changes.photoUrl = patch.photoUrl.trim();
    changes.photoData = '';
  }
  if (Object.keys(changes).length === 0) return;

  const db = await getFirebaseFirestore();
  const { doc, getDoc, serverTimestamp, setDoc, updateDoc } = await import('firebase/firestore');
  const ref = doc(db, 'userProfiles', user.uid);
  const snapshot = await getDoc(ref);

  if (snapshot.exists()) {
    await updateDoc(ref, changes);
    return;
  }

  // أول تعديل من الموقع لحساب أُنشئ هنا (بدون ملف شخصي بعد): ننشئ المستند
  // بالحقول التي يتوقعها التطبيق حتى يظهر الحساب بشكل صحيح هناك.
  await setDoc(ref, {
    uid: user.uid,
    email: user.email ?? '',
    username: '',
    countryCode: '',
    countryName: '',
    gender: '',
    bio: '',
    birthDate: null,
    createdAt: serverTimestamp(),
    isGuest: user.isAnonymous,
    emailVerified: user.emailVerified,
    isVerified: false,
    isOfficialDeveloper: false,
    syncFavorites: true,
    ...changes,
  });
}
