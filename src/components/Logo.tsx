import { Link } from 'react-router-dom';
import { logoMarkUrl } from '@/lib/assets';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showWordmark?: boolean;
  to?: string | null;
  className?: string;
}

export function Logo({ size = 'md', showWordmark = true, to = '/', className = '' }: LogoProps) {
  const content = (
    <>
      <img
        className="logo__mark"
        src={logoMarkUrl}
        alt={showWordmark ? '' : 'MangaPlus'}
        width="40"
        height="40"
        decoding="async"
      />
      {showWordmark ? (
        <span className="logo__wordmark" dir="ltr">
          Manga<span className="logo__accent">Plus</span>
        </span>
      ) : null}
    </>
  );

  const classes = `logo logo--${size} ${className}`.trim();

  if (!to) {
    return (
      <span className={classes} aria-label="MangaPlus">
        {content}
      </span>
    );
  }

  return (
    <Link className={classes} to={to} aria-label="MangaPlus — الصفحة الرئيسية">
      {content}
    </Link>
  );
}
