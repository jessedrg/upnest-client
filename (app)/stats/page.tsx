'use client';

import { ClientStats } from '../../../components/ClientSections';
import { LoadingFrame } from '../../../components/Skeletons';

export default function StatsPage() {
  return (
    <LoadingFrame keyDep="stats" variant="kpi-table">
      <ClientStats/>
    </LoadingFrame>
  );
}
