'use client';

import { useRouter } from 'next/navigation';
import { ClientOverview } from '../../../components/ClientViews';
import { LoadingFrame } from '../../../components/Skeletons';
import type { RoleRow } from '../../../lib/admin-data';

export default function OverviewPage() {
  const router = useRouter();
  const onNavigate = (k: string) => router.push('/' + k);
  const onOpenRole = (role: RoleRow) => {
    router.push('/roles/' + encodeURIComponent(role.id));
  };
  return (
    <LoadingFrame keyDep="overview" variant="kpi-table">
      <ClientOverview onNavigate={onNavigate} onOpenRole={onOpenRole}/>
    </LoadingFrame>
  );
}
