'use client';

import { ClientRecruiters } from '../../../components/ClientSections';
import { LoadingFrame } from '../../../components/Skeletons';

export default function RecruitersPage() {
  return (
    <LoadingFrame keyDep="recruiters" variant="kpi-table">
      <ClientRecruiters/>
    </LoadingFrame>
  );
}
