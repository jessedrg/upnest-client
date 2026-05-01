'use client';

// ClientLogin — TSX port of public/src/AppLogins.jsx::ClientLogin.

import * as React from 'react';
import { createClient } from '@/lib/supabase/client';
import { emitToast } from './Toast';

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '14px 16px',
  border: '1px solid var(--hair)',
  background: 'var(--paper)',
  fontFamily: 'var(--sans)',
  fontSize: 14,
  color: 'var(--ink)',
  outline: 'none',
};

export function ClientLogin({ onEnter, onSignup, initialPendingOrg }: {
  onEnter?: () => void;
  onSignup?: () => void;
  initialPendingOrg?: string | null;
}) {
  const [email, setEmail] = React.useState('');
  const [pw, setPw] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);

  const [pendingOrg, setPendingOrg] = React.useState<{ name: string; status: string } | null>(
    initialPendingOrg ? { name: initialPendingOrg, status: 'pending' } : null
  );

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !pw) {
      emitToast({ kind: 'error', title: 'Missing fields', body: 'Please enter email and password.' });
      return;
    }
    
    setIsLoading(true);
    setPendingOrg(null);
    
    try {
      const supabase = createClient();
      
      // Sign in
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password: pw,
      });
      
      if (authError) throw authError;
      if (!authData.user) throw new Error('Authentication failed');
      
      // Check if user belongs to a client organization
      const { data: clientUser, error: clientError } = await supabase
        .from('client_users')
        .select(`
          *,
          organization:client_organizations(id, name, status)
        `)
        .eq('user_id', authData.user.id)
        .single();
      
      if (clientError || !clientUser) {
        // User is not a client, maybe admin or recruiter - allow through
        emitToast({ kind: 'success', title: 'Welcome back', body: 'Entering the console...' });
        onEnter?.();
        return;
      }
      
      const org = clientUser.organization as { id: string; name: string; status: string };
      
      // Check organization status
      if (org.status === 'pending') {
        // Sign out and show pending message
        await supabase.auth.signOut();
        setPendingOrg({ name: org.name, status: 'pending' });
        return;
      }
      
      if (org.status === 'rejected') {
        await supabase.auth.signOut();
        emitToast({ 
          kind: 'error', 
          title: 'Access denied', 
          body: 'Your organization request was not approved. Please contact support.' 
        });
        return;
      }
      
      if (org.status === 'suspended') {
        await supabase.auth.signOut();
        emitToast({ 
          kind: 'error', 
          title: 'Account suspended', 
          body: 'Your organization has been suspended. Please contact support.' 
        });
        return;
      }
      
      // Organization is approved - allow access
      emitToast({ kind: 'success', title: 'Welcome back', body: 'Entering the console...' });
      onEnter?.();
      
    } catch (error: any) {
      console.error('[v0] Login error:', error);
      emitToast({ kind: 'error', title: 'Login failed', body: error?.message || 'Invalid credentials.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-split" style={{
      minHeight: '100vh', display: 'grid', gridTemplateColumns: '1fr 1fr',
      background: 'var(--paper)',
    }}>
      {/* Left: brand panel */}
      <div className="login-brand" style={{
        background: 'var(--ink)', color: '#F3E6CE',
        padding: '48px 56px', display: 'flex', flexDirection: 'column',
        justifyContent: 'space-between', position: 'relative', overflow: 'hidden',
      }}>
        <div className="mono" style={{ fontSize: 10, letterSpacing: '.24em', color: 'rgba(243,230,206,.55)' }}>
          UPNEST · COMPANIES
        </div>
        <div>
          <div className="mono" style={{ fontSize: 10, letterSpacing: '.22em', color: '#B88858' }}>§ 01 — ACCESS</div>
          <div className="serif" style={{
            fontSize: 'clamp(42px, 5vw, 68px)', fontStyle: 'italic',
            letterSpacing: '-0.03em', lineHeight: 1.02, marginTop: 20, textWrap: 'balance' as any,
          }}>
            The hiring layer<br/>
            <span style={{ color: '#B88858' }}>for companies</span><br/>
            that ship.
          </div>
          <div style={{
            fontSize: 16, color: 'rgba(243,230,206,.7)', fontStyle: 'italic',
            fontFamily: 'var(--serif)', marginTop: 22, maxWidth: 440, lineHeight: 1.5,
          }}>
            &ldquo;We&apos;ve placed 847 senior operators since 2022, at a median of 34 days from brief to offer.&rdquo;
          </div>
          <div className="mono" style={{ fontSize: 10, letterSpacing: '.18em', color: 'rgba(243,230,206,.4)', marginTop: 10 }}>
            — FROM THE LEDGER
          </div>
        </div>
        <div style={{ display: 'flex', gap: 24, paddingTop: 24, borderTop: '1px solid rgba(243,230,206,.1)' }}>
          {([['847', 'ROLES CLOSED'], ['34d', 'MEDIAN'], ['92%', 'RETENTION @ 12MO']] as const).map(([v, l]) => (
            <div key={l}>
              <div className="serif" style={{ fontSize: 28, fontStyle: 'italic' }}>{v}</div>
              <div className="mono" style={{ fontSize: 9, letterSpacing: '.14em', color: 'rgba(243,230,206,.5)', marginTop: 2 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right: form */}
      <div className="login-form" style={{
        padding: '64px 72px', display: 'flex', flexDirection: 'column',
        justifyContent: 'center', maxWidth: 560,
      }}>
        {pendingOrg ? (
          // Pending approval state
          <>
            <div className="mono" style={{ fontSize: 10, letterSpacing: '.22em', color: 'var(--t-4)' }}>
              PENDING APPROVAL
            </div>
            <div className="serif login-hero" style={{
              fontSize: 46, fontStyle: 'italic', letterSpacing: '-0.02em', lineHeight: 1.05, marginTop: 12,
            }}>Almost there.</div>
            <div style={{
              fontSize: 15, color: 'var(--t-3)', marginTop: 8,
              fontStyle: 'italic', fontFamily: 'var(--serif)',
            }}>Your request for <strong>{pendingOrg.name}</strong> is being reviewed by our team.</div>
            
            <div style={{
              marginTop: 32, padding: 24, background: 'var(--cream-100)',
              border: '1px solid var(--hair)', borderRadius: 8,
            }}>
              <div className="mono" style={{ fontSize: 10, letterSpacing: '.18em', color: 'var(--t-4)', marginBottom: 12 }}>
                WHAT HAPPENS NEXT
              </div>
              <ul style={{ margin: 0, padding: '0 0 0 18px', fontSize: 14, color: 'var(--t-2)', lineHeight: 1.7 }}>
                <li>Our team reviews your application within 24-48 hours</li>
                <li>You&apos;ll receive an email once approved</li>
                <li>Then you can sign in and start hiring</li>
              </ul>
            </div>
            
            <button 
              onClick={() => setPendingOrg(null)} 
              className="btn" 
              style={{
                marginTop: 24, padding: '14px 18px', fontSize: 14,
                background: 'transparent', border: '1px solid var(--hair)',
                cursor: 'pointer',
              }}
            >
              <span>← Back to sign in</span>
            </button>
          </>
        ) : (
          // Normal login form
          <>
            <div className="mono" style={{ fontSize: 10, letterSpacing: '.22em', color: 'var(--t-4)' }}>
              SIGN IN · CLIENT CONSOLE
            </div>
            <div className="serif login-hero" style={{
              fontSize: 46, fontStyle: 'italic', letterSpacing: '-0.02em', lineHeight: 1.05, marginTop: 12,
            }}>Welcome back.</div>
            <div style={{
              fontSize: 15, color: 'var(--t-3)', marginTop: 8,
              fontStyle: 'italic', fontFamily: 'var(--serif)',
            }}>Pick up where your pipeline left off.</div>

            <form onSubmit={handleLogin} style={{
              marginTop: 40, display: 'flex', flexDirection: 'column', gap: 16,
            }}>
              <label>
                <div className="mono" style={{ fontSize: 10, letterSpacing: '.18em', color: 'var(--t-4)', marginBottom: 6 }}>
                  COMPANY EMAIL
                </div>
                <input value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com" style={inputStyle}/>
              </label>
              <label>
                <div className="mono" style={{ fontSize: 10, letterSpacing: '.18em', color: 'var(--t-4)', marginBottom: 6 }}>
                  PASSWORD
                </div>
                <input type="password" value={pw} onChange={e => setPw(e.target.value)} placeholder="Enter your password" style={inputStyle}/>
              </label>
              <button type="submit" disabled={isLoading} className="btn btn-plum" style={{
                marginTop: 12, padding: '14px 18px', fontSize: 14, justifyContent: 'space-between',
                opacity: isLoading ? 0.7 : 1, cursor: isLoading ? 'wait' : 'pointer',
              }}>
                <span>{isLoading ? 'Signing in...' : 'Enter the console'}</span>
                <span style={{ fontFamily: 'var(--serif)', fontStyle: 'italic' }}>→</span>
              </button>
              <div className="mono" style={{
                fontSize: 10, letterSpacing: '.14em', color: 'var(--t-4)', textAlign: 'center', marginTop: 8,
              }}>
                NEW HERE? —{' '}
                <a href="#" onClick={e => { e.preventDefault(); onSignup && onSignup(); }} style={{ color: 'var(--plum-600)' }}>
                  REQUEST ACCESS
                </a>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
