'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ClientRoleDetail } from '../../../../components/ClientRoleDetail';
import { LoadingFrame } from '../../../../components/Skeletons';
import { ADMIN_DATA, type RoleRow, type Candidate } from '../../../../lib/admin-data';

export default function RoleDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = decodeURIComponent(String(params?.id || ''));
  const [role, setRole] = useState<RoleRow | null>(null);

  useEffect(() => {
    let r: RoleRow | null = null;
    try {
      const stash = sessionStorage.getItem('upnest:client:selectedRole');
      if (stash) {
        const parsed = JSON.parse(stash);
        if (parsed?.id === id) r = parsed as RoleRow;
      }
    } catch {}
    if (!r) r = ADMIN_DATA.roles.find(x => x.id === id) || null;
    setRole(r);
  }, [id]);

  const onBack = () => router.push('/roles');
  const onCandidate = (c: Candidate) =>
    window.dispatchEvent(new CustomEvent('open-candidate', { detail: { candidate: c } }));

  return (
    <LoadingFrame keyDep={'role-' + id} variant="kpi-table">
      {role ? <ClientRoleDetail role={role} onBack={onBack} onCandidate={onCandidate}/> : null}
    </LoadingFrame>
  );
}
