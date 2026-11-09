import type { ReactNode } from 'react';
import { Icon, type IconName } from './Icon';
import { Logo } from './Logo';

type StatusTone = 'success' | 'error' | 'warning' | 'info';

interface StatusCardProps {
  tone: StatusTone;
  icon: IconName;
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
  children?: ReactNode;
  eyebrow?: string;
}

export function StatusCard({ tone, icon, title, description, actions, children, eyebrow }: StatusCardProps) {
  return (
    <div className="status-page">
      <div className="status-page__card">
        <Logo size="md" />
        {eyebrow ? <p className="status-page__eyebrow">{eyebrow}</p> : null}
        <span className={`status-page__icon status-page__icon--${tone}`} aria-hidden="true">
          <Icon name={icon} size={28} />
        </span>
        <h1 className="status-page__title">{title}</h1>
        {description ? <div className="status-page__text">{description}</div> : null}
        {children}
        {actions ? <div className="status-page__actions">{actions}</div> : null}
      </div>
    </div>
  );
}
