'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { ClientLogin } from '../../components/ClientLogin';

export default function ClientLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [initialPending, setInitialPending] = useState<string | null>(null);

  useEffect(() => {
    // Check for pending org from URL params (redirected from middleware)
    const pendingOrg = searchParams.get('pending');
    if (pendingOrg) {
      setInitialPending(pendingOrg);
    }
    
    // Check if already logged in with approved org
    const checkAuth = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user && !pendingOrg) {
        // Check org status
        const { data: clientUser } = await supabase
          .from('client_users')
          .select('organization:client_organizations(status)')
          .eq('user_id', user.id)
          .single();
        
        const org = clientUser?.organization as { status: string } | null;
        if (org?.status === 'approved') {
          router.replace('/overview');
        }
      }
    };
    
    checkAuth();
  }, [router, searchParams]);

  const onEnter = () => {
    router.push('/overview');
  };

  const onSignup = () => router.push('/signup');

  return <ClientLogin onEnter={onEnter} onSignup={onSignup} initialPendingOrg={initialPending}/>;
}
