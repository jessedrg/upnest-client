'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { ClientNav, ClientTopBar } from '../../components/ClientShell';
import { Icons } from '../../components/Icons';
import { ToastHost, emitToast } from '../../components/Toast';
import { RejectModal } from '../../components/RejectModal';
import { CandidateDetailModalHost } from '../../components/CandidateDetailModal';
import { CreateRoleModal } from '../../components/CreateRoleModal';
import { SubmitCandidateModalHost } from '../../components/SubmitCandidateModal';

const ROUTE_META: Record<string, { t: string; s: string }> = {
  overview:   { t: 'Overview',   s: 'COMPANY DASHBOARD' },
  roles:      { t: 'Roles',      s: 'OPEN POSITIONS' },
  candidates: { t: 'Candidates', s: 'YOUR PIPELINE' },
  recruiters: { t: 'Recruiters', s: 'YOUR PARTNERS' },
  stats:      { t: 'Stats',      s: 'PERFORMANCE' },
  billing:    { t: 'Billing',    s: 'INVOICES · PLAN' },
  submit:     { t: 'Submit a role', s: 'NEW REQUISITION' },
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [authChecked, setAuthChecked] = useState(false);
  const [authed, setAuthed] = useState(false);

  // CreateRole modal still uses the JSX bridge until ported.
  const [createOpen, setCreateOpen] = useState(false);
  const [createClosing, setCreateClosing] = useState(false);

  const seg = (pathname || '/').replace(/^\//, '').split('/')[0] || 'overview';
  const meta = ROUTE_META[seg] || ROUTE_META.overview;

  useEffect(() => {
    try {
      const auth = JSON.parse(localStorage.getItem('upnest:auth') || '{}');
      if (!auth.client) router.replace('/login');
      else setAuthed(true);
    } catch { router.replace('/login'); }
    setAuthChecked(true);
  }, [router]);

  useEffect(() => {
    const onOpenCreate = () => {
      setCreateClosing(false);
      setCreateOpen(true);
    };
    window.addEventListener('open-create-role', onOpenCreate);
    return () => window.removeEventListener('open-create-role', onOpenCreate);
  }, []);

  const onNavigate = useCallback((k: string) => {
    if (ROUTE_META[k]) router.push('/' + k);
  }, [router]);

  const onExitClient = useCallback(() => {
    try {
      const auth = JSON.parse(localStorage.getItem('upnest:auth') || '{}');
      auth.client = false;
      localStorage.setItem('upnest:auth', JSON.stringify(auth));
    } catch {}
    router.push('/login');
  }, [router]);

  const openCreate = useCallback(() => {
    setCreateClosing(false);
    setCreateOpen(true);
  }, []);
  const closeCreate = useCallback(() => {
    setCreateClosing(true);
    setTimeout(() => { setCreateOpen(false); setCreateClosing(false); }, 240);
  }, []);

  if (!authChecked || !authed) return null;

  const right = (
    <>
      <button
        className="btn btn-ghost"
        style={{ padding: '8px 14px', fontSize: 12 }}
        onClick={() => emitToast({ kind: 'info', title: 'No notifications' })}
        aria-label="Notifications"
      ><Icons.Bell size={14}/></button>
      <button
        className="btn btn-primary"
        style={{ padding: '8px 14px', fontSize: 12 }}
        onClick={openCreate}
      ><Icons.Plus size={12}/> Submit role</button>
    </>
  );

  return (
    <>
      <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--paper)' }}>
        <ClientNav
          current={seg === 'role-detail' ? 'roles' : (seg as any)}
          onNavigate={onNavigate}
          onExitClient={onExitClient}
          orgName="Ramp"
          orgLogo="R"
          userName="Catherine Hughes"
        />
        <main style={{ flex: 1, minWidth: 0, background: 'var(--paper)' }}>
          <ClientTopBar title={meta.t} subtitle={meta.s} right={right}/>
          {children}
        </main>

        <CreateRoleModal
          open={createOpen}
          closing={createClosing}
          onClose={closeCreate}
          onCreated={() => {}}
        />

        <CandidateDetailModalHost/>
        <SubmitCandidateModalHost/>
        <ToastHost/>
        <RejectModal/>
      </div>
    </>
  );
}
