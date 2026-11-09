import { initials } from '@/lib/format';

interface AvatarProps {
  name?: string | null;
  photoUrl?: string | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Avatar({ name, photoUrl, size = 'md' }: AvatarProps) {
  return (
    <span className={`avatar avatar--${size}`}>
      {photoUrl ? (
        <img src={photoUrl} alt="" className="avatar__image" loading="lazy" referrerPolicy="no-referrer" />
      ) : (
        <span className="avatar__initials" aria-hidden="true">
          {initials(name)}
        </span>
      )}
    </span>
  );
}
