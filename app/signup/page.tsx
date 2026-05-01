'use client';

import { useRouter } from 'next/navigation';
import { ClientSignupView } from '../../components/ClientSignupView';

/**
 * /signup — company onboarding flow.
 * On completion, user must verify email and wait for admin approval.
 */
export default function SignupPage() {
  const router = useRouter();
  
  // After signup, redirect to login (user must verify email and get approved)
  const onEnter = () => router.push('/login');
  const onBackToLogin = () => router.push('/login');

  return <ClientSignupView onEnter={onEnter} onBackToLogin={onBackToLogin}/>;
}
