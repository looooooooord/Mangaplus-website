import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { AccountUnavailable } from './AccountUnavailable';
import { RouteSkeleton } from './Skeleton';

export function RequireAccount({ children }: { children: ReactNode }) {
  const { user, loading, configured } = useAuth();
  const location = useLocation();

  if (!configured) {
    return (
      <section className="page">
        <div className="container container--narrow">
          <AccountUnavailable />
        </div>
      </section>
    );
  }

  if (loading) return <RouteSkeleton />;

  if (!user) {
    const next = encodeURIComponent(`${location.pathname}${location.search}`);
    return <Navigate to={`/login?next=${next}`} replace />;
  }

  return <>{children}</>;
}
