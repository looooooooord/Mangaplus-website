import type { User } from 'firebase/auth';
import { useProfile } from '@/contexts/ProfileContext';

/**
 * الصورة المعروضة للحساب: الصورة المحفوظة في ملفه الشخصي المشترك مع التطبيق،
 * ثم رابط الصورة، ثم صورة حساب Google إن وُجدت.
 */
export function useProfilePhoto(user: User | null): string | null {
  const { profile } = useProfile();
  if (!user) return null;
  return profile?.photoData || profile?.photoUrl || user.photoURL || null;
}
