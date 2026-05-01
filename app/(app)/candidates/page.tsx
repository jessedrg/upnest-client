'use client';

import { ClientCandidates } from '../../../components/ClientSections';
import { LoadingFrame } from '../../../components/Skeletons';
import { openCandidateModal } from '../../../components/CandidateDetailModal';
import type { Candidate } from '../../../lib/admin-data';

export default function CandidatesPage() {
  return (
    <LoadingFrame keyDep="candidates" variant="kpi-table">
      <ClientCandidates
        onCandidate={(c: Candidate) => openCandidateModal(c, 'client')}
      />
    </LoadingFrame>
  );
}
