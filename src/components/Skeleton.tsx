export function Skeleton({
  width,
  height,
  radius,
  className = '',
}: {
  width?: string | number;
  height?: string | number;
  radius?: string | number;
  className?: string;
}) {
  return (
    <span
      className={`skeleton ${className}`.trim()}
      style={{ width, height, borderRadius: radius }}
      aria-hidden="true"
    />
  );
}

export function WorkCardSkeleton() {
  return (
    <div className="work-card work-card--skeleton" aria-hidden="true">
      <Skeleton className="skeleton--cover" />
      <div className="work-card__info">
        <Skeleton width="70%" height={16} radius={6} />
        <Skeleton width="45%" height={12} radius={6} />
      </div>
    </div>
  );
}

export function WorkGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="work-grid" aria-hidden="true">
      {Array.from({ length: count }, (_, index) => (
        <WorkCardSkeleton key={index} />
      ))}
    </div>
  );
}

export function WorkRowSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="work-rows" aria-hidden="true">
      {Array.from({ length: count }, (_, index) => (
        <div className="work-row work-row--skeleton" key={index}>
          <Skeleton width={56} height={78} radius={10} />
          <div className="work-row__body">
            <Skeleton width="45%" height={15} radius={6} />
            <Skeleton width="30%" height={12} radius={6} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function RouteSkeleton() {
  return (
    <div className="page page--loading" aria-busy="true" aria-label="جارٍ تحميل الصفحة">
      <div className="container">
        <Skeleton width={220} height={28} radius={10} />
        <Skeleton width={420} height={16} radius={8} />
        <div style={{ height: 28 }} />
        <WorkGridSkeleton count={6} />
      </div>
    </div>
  );
}

export function DetailSkeleton() {
  return (
    <div className="container page--loading" aria-busy="true" aria-label="جارٍ تحميل العمل">
      <div className="detail-hero detail-hero--skeleton">
        <Skeleton className="skeleton--detail-cover" />
        <div className="detail-hero__body">
          <Skeleton width={120} height={24} radius={8} />
          <Skeleton width="70%" height={38} radius={10} />
          <Skeleton width="55%" height={16} radius={8} />
          <Skeleton width="100%" height={80} radius={12} />
          <Skeleton width={220} height={46} radius={14} />
        </div>
      </div>
    </div>
  );
}
