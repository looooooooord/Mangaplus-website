import { site } from '@/data/site';
import { ButtonAnchor, ButtonLink, type ButtonSize, type ButtonVariant } from './Button';

interface AppDownloadButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  label?: string;
}

export function AppDownloadButton({
  variant = 'secondary',
  size = 'lg',
  fullWidth = false,
  label = 'تحميل التطبيق',
}: AppDownloadButtonProps) {
  if (site.android.downloadUrl) {
    return (
      <ButtonAnchor
        href={site.android.downloadUrl}
        target="_blank"
        rel="noopener noreferrer"
        variant={variant}
        size={size}
        fullWidth={fullWidth}
        iconLeft="download"
      >
        {label}
      </ButtonAnchor>
    );
  }

  return (
    <ButtonLink to="/download" variant={variant} size={size} fullWidth={fullWidth} iconLeft="download">
      {label}
    </ButtonLink>
  );
}
