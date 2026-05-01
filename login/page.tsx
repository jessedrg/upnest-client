'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ClientLogin } from '../../components/ClientLogin';

export default function ClientLoginPage() {
  const router = useRouter();

  useEffect(() => {
    try {
      const auth = JSON.parse(localStorage.getItem('upnest:auth') || '{}');
      if (auth.client) router.replace('/overview');
    } catch {}
  }, [router]);

  const onEnter = () => {
    try {
      const auth = JSON.parse(localStorage.getItem('upnest:auth') || '{}');
      auth.client = true;
      localStorage.setItem('upnest:auth', JSON.stringify(auth));
    } catch {}
    router.push('/overview');
  };

  const onSignup = () => router.push('/signup');

  return <ClientLogin onEnter={onEnter} onSignup={onSignup}/>;
}
