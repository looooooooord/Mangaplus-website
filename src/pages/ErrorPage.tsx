import { usePageMeta } from '@/hooks/usePageMeta';
import { Button, ButtonLink } from '@/components/Button';
import { StatusCard } from '@/components/StatusCard';

export default function ErrorPage() {
  usePageMeta({
    title: 'حدث خطأ',
    description: 'تعذّر إتمام الطلب في موقع MangaPlus.',
    noIndex: true,
  });

  return (
    <StatusCard
      tone="error"
      icon="alert"
      eyebrow="خطأ غير متوقع"
      title="تعذّر إتمام الطلب"
      description={
        <p>
          حدث أمر غير متوقع أثناء تحميل هذه الصفحة. يمكنك المحاولة مرة أخرى، أو متابعة التصفح من
          الصفحة الرئيسية.
        </p>
      }
      actions={
        <>
          <Button onClick={() => window.location.reload()} iconLeft="refresh">
            إعادة المحاولة
          </Button>
          <ButtonLink to="/" variant="outline" iconLeft="home">
            الصفحة الرئيسية
          </ButtonLink>
          <ButtonLink to="/contact" variant="ghost">
            التواصل مع الدعم
          </ButtonLink>
        </>
      }
    />
  );
}
