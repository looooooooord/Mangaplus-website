import { useState } from 'react';
import { initials } from '@/lib/format';

interface AvatarProps {
  name?: string | null;
  photoUrl?: string | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Avatar({ name, photoUrl, size = 'md' }: AvatarProps) {
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <span className={`avatar avatar--${size}`}>
      {photoUrl && !imageFailed ? (
        <img
          src={photoUrl}
          alt=""
          className="avatar__image"
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => setImageFailed(true)}
        />
      ) : (
        <span className="avatar__initials" aria-hidden="true">
          {initials(name)}
        </span>
      )}
    </span>
  );
}
