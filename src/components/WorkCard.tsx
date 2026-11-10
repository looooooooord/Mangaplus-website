import { Link } from 'react-router-dom';
import type { Work } from '@/types';
import { genreLabel } from '@/data/genres';
import { workPath } from '@/services/catalog';
import { formatPercent } from '@/lib/format';
import { FavoriteButton } from './FavoriteButton';
import { Rating } from './Rating';
import { WorkCover } from './WorkCover';
import { StatusBadge } from './Badge';

interface WorkCardProps {
  work: Work;
  progress?: number;
  priority?: boolean;
}

export function WorkCard({ work, progress }: WorkCardProps) {
  const genreText = work.genres.slice(0, 2).map(genreLabel).join(' · ');

  return (
    <article className="work-card">
      <Link className="work-card__link" to={workPath(work.type, work.id)}>
        <div className="work-card__media">
          <WorkCover work={work} />
          <span className="work-card__badge">
            <StatusBadge status={work.status} />
          </span>
          {typeof progress === 'number' ? (
            <span className="work-card__progress" aria-label={`تقدم القراءة ${formatPercent(progress)}`}>
              <span style={{ width: `${Math.min(100, Math.max(0, progress))}%` }} />
            </span>
          ) : null}
        </div>
        <div className="work-card__info">
          <h3 className="work-card__title">{work.title}</h3>
          <p className="work-card__meta">
            <span>{genreText}</span>
            <span className="work-card__dot" aria-hidden="true" />
            <span>{work.type === 'manga' ? 'مانجا' : 'رواية'}</span>
          </p>
          <div className="work-card__stats">
            <Rating value={work.rating} />
          </div>
        </div>
      </Link>
      <FavoriteButton workId={work.id} title={work.title} className="work-card__fav" />
    </article>
  );
}
