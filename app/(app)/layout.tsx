'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
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

interface ClientOrg {
  id: string;
  name: string;
  logo_url: string | null;
}

interface UserInfo {
  name: string;
  email: string;
  org: ClientOrg | null;
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [authChecked, setAuthChecked] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  // CreateRole modal still uses the JSX bridge until ported.
  const [createOpen, setCreateOpen] = useState(false);
  const [createClosing, setCreateClosing] = useState(false);

  const seg = (pathname || '/').replace(/^\//, '').split('/')[0] || 'overview';
  const meta = ROUTE_META[seg] || ROUTE_META.overview;

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.replace('/login');
        setAuthChecked(true);
        return;
      }
      
      // Get user profile and client organization
      const { data: clientUser } = await supabase
        .from('client_users')
        .select(`
          organization:client_organizations(id, name, logo_url, status)
        `)
        .eq('user_id', user.id)
        .single();
      
      if (!clientUser?.organization) {
        // User is not a client - might be admin/recruiter, allow for now
        setUserInfo({
          name: user.user_metadata?.first_name || user.email?.split('@')[0] || 'User',
          email: user.email || '',
          org: null,
        });
        setAuthed(true);
        setAuthChecked(true);
        return;
      }
      
      const org = clientUser.organization as ClientOrg & { status: string };
      
      // Check if organization is approved
      if (org.status !== 'approved') {
        await supabase.auth.signOut();
        router.replace('/login?pending=' + encodeURIComponent(org.name));
        setAuthChecked(true);
        return;
      }
      
      // Get user profile for name
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('first_name, last_name, full_name')
        .eq('id', user.id)
        .single();
      
      const userName = profile?.full_name || 
        `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim() ||
        user.user_metadata?.first_name ||
        user.email?.split('@')[0] || 'User';
      
      setUserInfo({
        name: userName,
        email: user.email || '',
        org: { id: org.id, name: org.name, logo_url: org.logo_url },
      });
      setAuthed(true);
      setAuthChecked(true);
    };
    
    checkAuth();
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

  const onExitClient = useCallback(async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
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
          orgName={userInfo?.org?.name || 'Your Company'}
          orgLogo={userInfo?.org?.logo_url || userInfo?.org?.name?.[0] || 'C'}
          userName={userInfo?.name || 'User'}
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
