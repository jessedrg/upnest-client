'use client';

import { useRouter } from 'next/navigation';
import { ClientRoles } from '../../../components/ClientViews';
import { LoadingFrame } from '../../../components/Skeletons';
import type { RoleRow } from '../../../lib/admin-data';

export default function RolesPage() {
  const router = useRouter();
  const onOpenRole = (role: RoleRow) => {
    router.push('/roles/' + encodeURIComponent(role.id));
  };
  const onSubmit = () => window.dispatchEvent(new CustomEvent('open-create-role'));
  return (
    <LoadingFrame keyDep="roles" variant="kpi-table">
      <ClientRoles onOpenRole={onOpenRole} onSubmit={onSubmit}/>
    </LoadingFrame>
  );
}
