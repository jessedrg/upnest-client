'use client';

import { useParams, useRouter } from 'next/navigation';
import { ClientRoleDetail } from '../../../../components/ClientRoleDetail';
import { LoadingFrame } from '../../../../components/Skeletons';
import { useRoleWithCandidates } from '../../../../lib/data-hooks';
import type { RoleRow, Candidate } from '../../../../lib/admin-data';

export default function RoleDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = decodeURIComponent(String(params?.id || ''));
  
  const { role, isLoading } = useRoleWithCandidates(id);

  const onBack = () => router.push('/roles');
  const onCandidate = (c: Candidate) =>
    window.dispatchEvent(new CustomEvent('open-candidate', { detail: { candidate: c } }));

  if (isLoading) {
    return <LoadingFrame keyDep={'role-' + id} variant="kpi-table"><div /></LoadingFrame>;
  }

  return (
    <LoadingFrame keyDep={'role-' + id} variant="kpi-table">
      {role ? <ClientRoleDetail role={role as RoleRow} onBack={onBack} onCandidate={onCandidate}/> : null}
    </LoadingFrame>
  );
}
