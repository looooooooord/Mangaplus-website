import { ButtonLink } from './Button';
import { Icon } from './Icon';
import { Logo } from './Logo';

interface ReaderMissingProps {
  type: 'manga' | 'novel';
  title?: string;
}

export function ReaderMissing({ type, title = 'لم نعثر على هذا الفصل' }: ReaderMissingProps) {
  return (
    <div className="reader-missing">
      <div className="reader-missing__card">
        <Logo size="md" to={null} />
        <span className="reader-missing__icon" aria-hidden="true">
          <Icon name={type === 'manga' ? 'layers' : 'bookOpen'} size={26} />
        </span>
        <h1>{title}</h1>
        <p>قد يكون الرابط قديماً أو تم نقل العمل. يمكنك العودة إلى المكتبة واختيار فصل آخر.</p>
        <div className="reader-missing__actions">
          <ButtonLink to={type === 'manga' ? '/explore?type=manga' : '/explore?type=novel'} iconLeft="compass">
            تصفح {type === 'manga' ? 'المانجا' : 'الروايات'}
          </ButtonLink>
          <ButtonLink to="/library" variant="outline" iconLeft="library">
            مكتبتي
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}
