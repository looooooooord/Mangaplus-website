import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from './Icon';

interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  actionLink?: { label: string; to: string };
  align?: 'start' | 'center';
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  action,
  actionLink,
  align = 'start',
}: SectionHeaderProps) {
  return (
    <div className={`section-head section-head--${align}`}>
      <div className="section-head__content">
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <h2 className="section-head__title">{title}</h2>
        {description ? <p className="section-head__text">{description}</p> : null}
      </div>
      {action ??
        (actionLink ? (
          <Link className="section-head__action" to={actionLink.to}>
            <span>{actionLink.label}</span>
            <Icon name="arrowLeft" size={17} />
          </Link>
        ) : null)}
    </div>
  );
}
