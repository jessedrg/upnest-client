'use client';

// ClientSignupView — Real signup flow without mock crawl.
// Two-step: (1) form (2) success/pending message.

import * as React from 'react';
import { createClient } from '@/lib/supabase/client';
import { emitToast } from './Toast';

type Form = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  companyName: string;
  website: string;
  industry: string;
  companySize: string;
};

const INDUSTRIES = [
  'Technology',
  'Fintech',
  'Healthcare',
  'E-commerce',
  'SaaS',
  'Enterprise Software',
  'Consumer',
  'Other',
];

const COMPANY_SIZES = [
  '1-10',
  '11-50',
  '51-200',
  '201-500',
  '501-1000',
  '1000+',
];

export function ClientSignupView({ onEnter, onBackToLogin }: {
  onEnter: () => void;
  onBackToLogin: () => void;
}) {
  const [step, setStep] = React.useState<1 | 2>(1);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [f, setF] = React.useState<Form>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    companyName: '',
    website: '',
    industry: 'Technology',
    companySize: '11-50',
  });

  const set = <K extends keyof Form>(k: K, v: Form[K]) =>
    setF(prev => ({ ...prev, [k]: v }));

  const canSubmit = !!(
    f.firstName.trim() &&
    f.lastName.trim() &&
    f.email.trim() &&
    f.password.length >= 6 &&
    f.companyName.trim()
  );

  const submitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!canSubmit) {
      emitToast({
        kind: 'error',
        title: 'Missing fields',
        body: f.password.length < 6 
          ? 'Password must be at least 6 characters.' 
          : 'Please fill in all required fields.',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const supabase = createClient();

      // 1. Sign up the user with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: f.email,
        password: f.password,
        options: {
          emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ??
            `${window.location.origin}/auth/callback`,
          data: {
            first_name: f.firstName,
            last_name: f.lastName,
            role: 'client',
          },
        },
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('No user created');

      // 2. Create the client organization (status defaults to 'pending')
      const { data: orgData, error: orgError } = await supabase
        .from('client_organizations')
        .insert({
          name: f.companyName.trim(),
          website: f.website.trim() || null,
          industry: f.industry,
          company_size: f.companySize,
          contact_name: `${f.firstName} ${f.lastName}`,
          contact_email: f.email,
          // status defaults to 'pending' in the database
        })
        .select()
        .single();

      if (orgError) throw orgError;

      // 3. Create user profile with client role
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          id: authData.user.id,
          first_name: f.firstName,
          last_name: f.lastName,
          full_name: `${f.firstName} ${f.lastName}`,
          email: f.email,
          role: 'client',
          status: 'pending',
        });

      if (profileError) {
        // Profile might be created by trigger, log but continue
        console.error('[v0] Profile creation note:', profileError.message);
      }

      // 4. Link user to client organization as owner
      const { error: linkError } = await supabase
        .from('client_users')
        .insert({
          user_id: authData.user.id,
          organization_id: orgData.id,
          role: 'owner',
        });

      if (linkError) throw linkError;

      // Success - show pending step
      setStep(2);
      emitToast({
        kind: 'success',
        title: 'Request submitted',
        body: 'Check your email to verify your account.',
      });

    } catch (error: any) {
      console.error('[v0] Signup error:', error);
      emitToast({
        kind: 'error',
        title: 'Signup failed',
        body: error?.message || 'Something went wrong. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '1.05fr 1fr',
      minHeight: '100vh', background: 'var(--paper)', overflow: 'hidden',
    }}>
      {/* LEFT */}
      <div className="curtain-left" style={{
        position: 'relative', display: 'flex', flexDirection: 'column',
        padding: '32px 56px 32px',
      }}>
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div className="wordmark-in serif" style={{
            fontSize: 30, letterSpacing: '-0.03em', fontStyle: 'italic',
          }}>upnest</div>
          <button className="rise-in d1" onClick={onBackToLogin} style={{
            appearance: 'none', border: 0, background: 'transparent', cursor: 'pointer',
            fontFamily: 'var(--serif)', fontSize: 15, fontStyle: 'italic', color: 'var(--t-2)',
          }}>← Sign in instead</button>
        </header>

        <div className="rise-in d2" style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 28 }}>
          <span className="mono" style={{ fontSize: 10, letterSpacing: '.2em', color: 'var(--t-3)' }}>
            {step === 1 ? 'REQUEST ACCESS' : 'PENDING APPROVAL'}
          </span>
          <div style={{ flex: 1, height: 1, background: 'var(--hair)' }}>
            <div style={{
              height: '100%', background: 'var(--ink)',
              width: step === 1 ? '50%' : '100%', transition: 'width .6s var(--ease)',
            }}/>
          </div>
        </div>

        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center',
          maxWidth: 520, width: '100%', margin: '0 auto',
        }}>
          <div className="rise-in d2" style={{ marginBottom: 14 }}>
            <div className="mono" style={{ fontSize: 10, letterSpacing: '.22em', color: 'var(--plum-700)' }}>§ FOR COMPANIES</div>
          </div>

          <div className="rise-in d3" style={{ marginBottom: 34 }}>
            <h1 className="serif" style={{
              fontSize: 60, lineHeight: .95, letterSpacing: '-0.035em', margin: 0,
            }}>
              {step === 1 ? (
                <>Request<br/><span style={{ fontStyle: 'italic' }}>access.</span></>
              ) : (
                <>Almost<br/><span style={{ fontStyle: 'italic' }}>there.</span></>
              )}
            </h1>
            <div style={{
              fontSize: 15, color: 'var(--t-3)', marginTop: 14, fontStyle: 'italic',
              fontFamily: 'var(--serif)', maxWidth: 440,
            }}>
              {step === 1 
                ? "Tell us about you and your company. We'll review your request within 24-48 hours."
                : "Your request is being reviewed. You'll receive an email once approved."}
            </div>
          </div>

          <div key={step} className="rise-in d4" style={{ animationDuration: '.5s' }}>
            {step === 1 ? (
              <form onSubmit={submitForm} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                {/* Name row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
                  <div className="ed-group">
                    <label className="ed-label">First name *</label>
                    <input 
                      className="ed-field" 
                      value={f.firstName} 
                      onChange={e => set('firstName', e.target.value)} 
                      placeholder="Catherine"
                      required
                    />
                  </div>
                  <div className="ed-group">
                    <label className="ed-label">Last name *</label>
                    <input 
                      className="ed-field" 
                      value={f.lastName} 
                      onChange={e => set('lastName', e.target.value)} 
                      placeholder="Long"
                      required
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="ed-group">
                  <label className="ed-label">Work email *</label>
                  <input 
                    className="ed-field" 
                    type="email"
                    value={f.email} 
                    onChange={e => set('email', e.target.value)} 
                    placeholder="you@company.com"
                    required
                  />
                </div>

                {/* Password */}
                <div className="ed-group">
                  <label className="ed-label">Password * (min 6 characters)</label>
                  <input 
                    className="ed-field" 
                    type="password" 
                    value={f.password} 
                    onChange={e => set('password', e.target.value)} 
                    placeholder="••••••••••••"
                    minLength={6}
                    required
                  />
                </div>

                {/* Company name */}
                <div className="ed-group">
                  <label className="ed-label">Company name *</label>
                  <input 
                    className="ed-field" 
                    value={f.companyName} 
                    onChange={e => set('companyName', e.target.value)} 
                    placeholder="Acme Inc."
                    required
                  />
                </div>

                {/* Website (optional) */}
                <div className="ed-group">
                  <label className="ed-label">Company website (optional)</label>
                  <input 
                    className="ed-field" 
                    value={f.website} 
                    onChange={e => set('website', e.target.value)} 
                    placeholder="https://yourcompany.com"
                  />
                </div>

                {/* Industry & Size row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
                  <div className="ed-group">
                    <label className="ed-label">Industry</label>
                    <select 
                      className="ed-field" 
                      value={f.industry} 
                      onChange={e => set('industry', e.target.value)}
                      style={{ cursor: 'pointer' }}
                    >
                      {INDUSTRIES.map(i => (
                        <option key={i} value={i}>{i}</option>
                      ))}
                    </select>
                  </div>
                  <div className="ed-group">
                    <label className="ed-label">Company size</label>
                    <select 
                      className="ed-field" 
                      value={f.companySize} 
                      onChange={e => set('companySize', e.target.value)}
                      style={{ cursor: 'pointer' }}
                    >
                      {COMPANY_SIZES.map(s => (
                        <option key={s} value={s}>{s} employees</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Submit button */}
                <div style={{ marginTop: 8 }}>
                  <button 
                    type="submit" 
                    disabled={!canSubmit || isSubmitting} 
                    style={{
                      width: '100%',
                      appearance: 'none', 
                      border: 0,
                      cursor: canSubmit && !isSubmitting ? 'pointer' : 'not-allowed',
                      background: 'var(--ink)', 
                      color: 'var(--paper)',
                      padding: '16px', 
                      borderRadius: 999,
                      fontFamily: 'var(--serif)', 
                      fontSize: 18, 
                      fontStyle: 'italic',
                      letterSpacing: '-0.005em',
                      opacity: canSubmit && !isSubmitting ? 1 : 0.5,
                      transition: 'opacity .2s',
                    }}
                  >
                    {isSubmitting ? 'Submitting...' : 'Request access'}{' '}
                    <span style={{ fontStyle: 'normal' }}>→</span>
                  </button>
                </div>
              </form>
            ) : (
              /* Step 2: Pending confirmation */
              <div style={{
                border: '1px solid var(--hair-strong)',
                borderRadius: 14,
                background: '#fff',
                padding: '32px',
              }}>
                <div style={{
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  background: 'var(--plum-100)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 24,
                }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--plum-700)" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                    <polyline points="22 4 12 14.01 9 11.01"/>
                  </svg>
                </div>

                <h2 className="serif" style={{
                  fontSize: 28,
                  fontStyle: 'italic',
                  margin: '0 0 12px 0',
                  letterSpacing: '-0.02em',
                }}>
                  Request submitted for {f.companyName}
                </h2>

                <p style={{
                  color: 'var(--t-3)',
                  fontSize: 15,
                  lineHeight: 1.6,
                  margin: '0 0 24px 0',
                }}>
                  We&apos;ve sent a verification email to <strong>{f.email}</strong>. 
                  Please verify your email, then our team will review your request within 24-48 hours.
                </p>

                <div style={{
                  background: 'var(--cream-100)',
                  border: '1px solid var(--hair)',
                  borderRadius: 8,
                  padding: 20,
                  marginBottom: 24,
                }}>
                  <div className="mono" style={{
                    fontSize: 10,
                    letterSpacing: '.18em',
                    color: 'var(--t-4)',
                    marginBottom: 12,
                  }}>
                    WHAT HAPPENS NEXT
                  </div>
                  <ul style={{
                    margin: 0,
                    padding: '0 0 0 18px',
                    fontSize: 14,
                    color: 'var(--t-2)',
                    lineHeight: 1.8,
                  }}>
                    <li>Check your inbox and verify your email</li>
                    <li>Our team reviews your company (24-48 hours)</li>
                    <li>You&apos;ll receive an approval email</li>
                    <li>Sign in and start hiring</li>
                  </ul>
                </div>

                <button
                  onClick={onBackToLogin}
                  style={{
                    width: '100%',
                    appearance: 'none',
                    border: '1px solid var(--hair-strong)',
                    background: 'transparent',
                    padding: '14px',
                    borderRadius: 999,
                    cursor: 'pointer',
                    fontFamily: 'var(--serif)',
                    fontSize: 16,
                    color: 'var(--t-1)',
                  }}
                >
                  ← Back to sign in
                </button>
              </div>
            )}
          </div>

          {step === 1 && (
            <div className="rise-in d5" style={{
              textAlign: 'center', marginTop: 24, color: 'var(--t-3)', fontSize: 13,
            }}>
              Already have an account?{' '}
              <a style={{
                color: 'var(--t-1)', fontStyle: 'italic', fontFamily: 'var(--serif)',
                fontSize: 15, textDecoration: 'none', borderBottom: '1px solid var(--ink)',
              }} href="#" onClick={e => { e.preventDefault(); onBackToLogin(); }}>
                Sign in
              </a>
            </div>
          )}
        </div>

        <footer className="rise-in d5" style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          color: 'var(--t-4)', fontSize: 10, fontFamily: 'var(--mono)',
          letterSpacing: '.16em', paddingTop: 20, borderTop: '1px solid var(--hair)',
        }}>
          <span>© UPNEST · NEW CLIENT</span>
          <span>EN · US</span>
        </footer>
      </div>

      {/* RIGHT — editorial brand panel */}
      <div className="curtain-right" style={{
        background: 'var(--ink)', color: '#F3E6CE',
        padding: '48px 56px', display: 'flex', flexDirection: 'column',
        justifyContent: 'space-between', position: 'relative', overflow: 'hidden',
      }}>
        <div className="mono" style={{ fontSize: 10, letterSpacing: '.24em', color: 'rgba(243,230,206,.55)' }}>
          UPNEST · COMPANIES
        </div>
        <div>
          <div className="mono" style={{ fontSize: 10, letterSpacing: '.22em', color: '#B88858' }}>
            § NEW HERE — REQUEST ACCESS
          </div>
          <div className="serif" style={{
            fontSize: 'clamp(40px, 4.6vw, 64px)', fontStyle: 'italic',
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
    </div>
  );
}
