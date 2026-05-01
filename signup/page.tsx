'use client';

import { useRouter } from 'next/navigation';
import { ClientSignupView } from '../../components/ClientSignupView';

/**
 * /signup — company onboarding flow. Same persistence model as login:
 * on completion, mark `auth.client = true` and route to /overview.
 */
export default function SignupPage() {
  const router = useRouter();
  const onEnter = () => {
    try {
      const auth = JSON.parse(localStorage.getItem('upnest:auth') || '{}');
      auth.client = true;
      localStorage.setItem('upnest:auth', JSON.stringify(auth));
    } catch {}
    router.push('/overview');
  };
  const onBackToLogin = () => router.push('/login');

  return <ClientSignupView onEnter={onEnter} onBackToLogin={onBackToLogin}/>;
}
