import type { CSSProperties } from 'react';
import type { Work } from '@/types';

interface WorkCoverProps {
  work: Work;
  className?: string;
  showType?: boolean;
}

export function WorkCover({ work, className = '', showType = true }: WorkCoverProps) {
  const style = {
    '--cover-from': work.cover.from,
    '--cover-to': work.cover.to,
    '--cover-accent': work.cover.accent,
  } as CSSProperties;

  const isLong = work.title.length > 20;

  return (
    <div
      className={`work-cover work-cover--${work.cover.pattern} ${isLong ? 'work-cover--long' : ''} ${className}`.trim()}
      style={style}
      aria-hidden="true"
    >
      <span className="work-cover__halo" />
      <span className="work-cover__pattern" />
      <span className="work-cover__initial">{work.title.charAt(0)}</span>
      <div className="work-cover__body">
        {showType ? (
          <span className="work-cover__kicker" dir="ltr">
            {work.type === 'manga' ? 'MANGA' : 'NOVEL'}
          </span>
        ) : null}
        <span className="work-cover__title">{work.title}</span>
        <span className="work-cover__author">{work.author}</span>
      </div>
      <img className="work-cover__mark" src="/assets/logo-mark.svg" alt="" width="20" height="20" loading="lazy" />
      <span className="work-cover__gloss" />
    </div>
  );
}
