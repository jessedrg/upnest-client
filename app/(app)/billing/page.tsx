'use client';

import { ClientBilling } from '../../../components/ClientSections';
import { LoadingFrame } from '../../../components/Skeletons';

export default function BillingPage() {
  return (
    <LoadingFrame keyDep="billing" variant="kpi-table">
      <ClientBilling/>
    </LoadingFrame>
  );
}
