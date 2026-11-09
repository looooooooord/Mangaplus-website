import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import type { Work } from '@/types';
import { genreLabel } from '@/data/genres';
import { workPath } from '@/services/catalog';
import { formatDate } from '@/lib/format';
import { ProgressBar } from './ProgressBar';
import { StatusBadge, TypeBadge } from './Badge';
import { WorkCover } from './WorkCover';

interface WorkRowProps {
  work: Work;
  progress?: number;
  progressLabel?: string;
  action?: ReactNode;
}

export function WorkRow({ work, progress, progressLabel, action }: WorkRowProps) {
  return (
    <article className="work-row">
      <Link className="work-row__link" to={workPath(work.type, work.id)}>
        <div className="work-row__cover">
          <WorkCover work={work} showType={false} />
        </div>
        <div className="work-row__body">
          <div className="work-row__head">
            <h3 className="work-row__title">{work.title}</h3>
            <span className="work-row__badges">
              <TypeBadge type={work.type} />
              <StatusBadge status={work.status} />
            </span>
          </div>
          <p className="work-row__meta">
            {work.genres.slice(0, 3).map(genreLabel).join(' · ')} · آخر تحديث {formatDate(work.updatedAt)}
          </p>
          {typeof progress === 'number' ? (
            <div className="work-row__progress">
              <ProgressBar value={progress} label={progressLabel ?? 'تقدم القراءة'} showValue />
            </div>
          ) : null}
        </div>
      </Link>
      {action ? <div className="work-row__action">{action}</div> : null}
    </article>
  );
}
