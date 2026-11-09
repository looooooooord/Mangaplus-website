import type { MouseEvent } from 'react';
import { useLibrary } from '@/contexts/LibraryContext';
import { useToast } from '@/contexts/ToastContext';
import { Icon } from './Icon';

interface FavoriteButtonProps {
  workId: string;
  title: string;
  variant?: 'icon' | 'label';
  className?: string;
}

export function FavoriteButton({ workId, title, variant = 'icon', className = '' }: FavoriteButtonProps) {
  const { isFavorite, toggleFavorite } = useLibrary();
  const { toast } = useToast();
  const active = isFavorite(workId);

  const onClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const next = toggleFavorite(workId);
    toast({
      tone: 'success',
      title: next ? 'أُضيف إلى المفضلة' : 'أُزيل من المفضلة',
      description: next ? `«${title}» صار في مكتبتك.` : `لم يعد «${title}» في المفضلة.`,
    });
  };

  const classes = [
    'fav-btn',
    variant === 'label' ? 'fav-btn--label' : '',
    active ? 'is-active' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type="button"
      className={classes}
      onClick={onClick}
      aria-pressed={active}
      aria-label={active ? `إزالة «${title}» من المفضلة` : `إضافة «${title}» إلى المفضلة`}
      title={active ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة'}
    >
      <Icon name={active ? 'heartFilled' : 'heart'} size={18} />
      {variant === 'label' ? (
        <span>{active ? 'في المفضلة' : 'المفضلة'}</span>
      ) : null}
    </button>
  );
}
