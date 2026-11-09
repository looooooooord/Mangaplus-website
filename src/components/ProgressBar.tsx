import { formatPercent } from '@/lib/format';

interface ProgressBarProps {
  value: number;
  label?: string;
  showValue?: boolean;
  size?: 'sm' | 'md';
}

export function ProgressBar({ value, label, showValue = false, size = 'sm' }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div className={`progress progress--${size}`}>
      {label || showValue ? (
        <div className="progress__meta">
          {label ? <span className="progress__label">{label}</span> : null}
          {showValue ? <span className="progress__value">{formatPercent(clamped)}</span> : null}
        </div>
      ) : null}
      <div
        className="progress__track"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={clamped}
        aria-label={label ?? 'تقدم القراءة'}
      >
        <span className="progress__fill" style={{ width: `${clamped}%` }} />
      </div>
    </div>
  );
}
