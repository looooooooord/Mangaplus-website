import { ratingLabel } from '@/lib/format';
import { Icon } from './Icon';

interface RatingProps {
  value: number;
  size?: 'sm' | 'md';
  showValue?: boolean;
}

export function Rating({ value, size = 'sm', showValue = true }: RatingProps) {
  return (
    <span className={`rating rating--${size}`} aria-label={`التقييم ${ratingLabel(value)} من ٥`}>
      <Icon name="starFilled" size={size === 'sm' ? 14 : 16} className="rating__star" />
      {showValue ? <span className="rating__value">{ratingLabel(value)}</span> : null}
    </span>
  );
}
