import { Link } from 'react-router-dom';
import type { Work } from '@/types';
import { genreLabel } from '@/data/genres';
import { readerPath, workPath } from '@/services/catalog';
import { Rating } from './Rating';
import { StatusBadge, TypeBadge } from './Badge';
import { WorkCover } from './WorkCover';
import { Icon } from './Icon';

export function NovelCard({ work }: { work: Work }) {
  const firstChapter = work.chapters[0];

  return (
    <article className="novel-card">
      <Link className="novel-card__cover" to={workPath(work.type, work.id)} tabIndex={-1} aria-hidden="true">
        <WorkCover work={work} showType={false} />
      </Link>
      <div className="novel-card__body">
        <div className="novel-card__badges">
          <TypeBadge type={work.type} />
          <StatusBadge status={work.status} />
        </div>
        <h3 className="novel-card__title">
          <Link to={workPath(work.type, work.id)}>{work.title}</Link>
        </h3>
        <p className="novel-card__tagline">{work.tagline}</p>
        <p className="novel-card__desc">{work.description}</p>
        <div className="novel-card__meta">
          <Rating value={work.rating} />
          <span aria-hidden="true">·</span>
          <span>{work.genres.slice(0, 2).map(genreLabel).join(' · ')}</span>
          <span aria-hidden="true">·</span>
          <span>{work.chapters.length} فصلاً</span>
        </div>
        {firstChapter ? (
          <Link className="novel-card__read" to={readerPath('novel', work.id, firstChapter.id)}>
            <Icon name="bookOpen" size={17} />
            ابدأ القراءة
          </Link>
        ) : null}
      </div>
    </article>
  );
}
