'use client';

import { useRouter } from 'next/navigation';
import { ClientSubmitRole } from '../../../components/ClientSubmitRole';
import { LoadingFrame } from '../../../components/Skeletons';

export default function SubmitRolePage() {
  const router = useRouter();
  const onBack = () => router.push('/roles');
  return (
    <LoadingFrame keyDep="submit" variant="kpi-table">
      <ClientSubmitRole onBack={onBack}/>
    </LoadingFrame>
  );
}
