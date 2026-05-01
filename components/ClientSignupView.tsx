'use client';

// ClientSignupView — TSX port of public/src/ClientSignupView.jsx.
// Three-step (1) form (2) analyzing (3) parsed-confirm flow with a brand panel.

import * as React from 'react';
import { emitToast } from './Toast';

type LinkKind = 'website' | 'linkedin';
type Form = {
  firstName: string; lastName: string; email: string; password: string;
  website: string; linkedin: string;
};
type Profile = {
  name: string; logo: string; logoColor: string; tagline: string;
  industry: string; hq: string; size: string;
  headcount: string; funding: string; stage: string; founded: string;
  stack: string[]; openings: { title: string; dept: string }[];
};

export function ClientSignupView({ onEnter, onBackToLogin }: {
  onEnter: () => void;
  onBackToLogin: () => void;
}) {
  const [step, setStep] = React.useState<1 | 2 | 3>(1);
  const [linkKind, setLinkKind] = React.useState<LinkKind>('website');
  const [f, setF] = React.useState<Form>({
    firstName: 'Catherine', lastName: 'Long',
    email: 'catherine@ramp.com', password: '',
    website: 'https://ramp.com',
    linkedin: 'https://linkedin.com/company/ramp',
  });
  const [profile, setProfile] = React.useState<Profile | null>(null);
  const [analyzeBeats, setAnalyzeBeats] = React.useState(0);
  const set = <K extends keyof Form>(k: K, v: Form[K]) =>
    setF(prev => ({ ...prev, [k]: v }));

  const url = linkKind === 'website' ? f.website : f.linkedin;
  const looksValid = linkKind === 'website'
    ? /^https?:\/\/.+\..+/.test(f.website || '')
    : /linkedin\.com\/company\//i.test(f.linkedin || '');
  const canSubmit = !!(f.firstName && f.lastName && f.email && f.password && looksValid);

  React.useEffect(() => {
    if (step !== 2) return;
    setAnalyzeBeats(0);
    const beats = [500, 1200, 1900, 2600, 3300];
    const timers = beats.map((at, i) => window.setTimeout(() => setAnalyzeBeats(i + 1), at));
    const finish = window.setTimeout(() => {
      setProfile(mockPullCompany(f, linkKind));
      setStep(3);
      emitToast({
        kind: 'success', title: 'Company synced',
        body: 'We pulled your company profile. Take a look before continuing.',
      });
    }, 3800);
    return () => { timers.forEach(clearTimeout); clearTimeout(finish); };
  }, [step, f, linkKind]);

  const submitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) {
      emitToast({
        kind: 'error', title: 'Almost there',
        body: looksValid
          ? 'Fill in every field to continue.'
          : (linkKind === 'website' ? 'Enter a valid website URL.' : 'Enter a valid linkedin.com/company/… URL.'),
      });
      return;
    }
    setStep(2);
    emitToast({
      kind: 'info',
      title: linkKind === 'website' ? 'Crawling website' : 'Analyzing LinkedIn',
      body: 'Hang on while we read your company profile.',
    });
  };

  const finish = () => {
    emitToast({ kind: 'success', title: 'Welcome to upnest', body: 'Your client workspace is ready.' });
    setTimeout(() => onEnter(), 500);
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
            CHAPTER {String(step).padStart(2, '0')} — {step === 1 ? 'YOU & COMPANY' : step === 2 ? 'ANALYSIS' : 'CONFIRM'}
          </span>
          <div style={{ flex: 1, height: 1, background: 'var(--hair)' }}>
            <div style={{
              height: '100%', background: 'var(--ink)',
              width: `${(step / 3) * 100}%`, transition: 'width .6s var(--ease)',
            }}/>
          </div>
          <span className="mono num" style={{ fontSize: 10, letterSpacing: '.2em', color: 'var(--t-3)' }}>
            {step} / 3
          </span>
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
              {step === 1 && (<>Request<br/><span style={{ fontStyle: 'italic' }}>access.</span></>)}
              {step === 2 && (<>Reading your<br/><span style={{ fontStyle: 'italic' }}>company.</span></>)}
              {step === 3 && (<>Is this<br/><span style={{ fontStyle: 'italic' }}>your team?</span></>)}
            </h1>
            <div style={{
              fontSize: 15, color: 'var(--t-3)', marginTop: 14, fontStyle: 'italic',
              fontFamily: 'var(--serif)', maxWidth: 440,
            }}>
              {step === 1 && "Tell us who you are and where to find your company. We'll pre-fill the rest."}
              {step === 2 && 'Pulling team size, stack, recent roles, and funding signals.'}
              {step === 3 && 'Confirm what we found, or edit. You can always change this later in Settings.'}
            </div>
          </div>

          <div key={step} className="rise-in d4" style={{ animationDuration: '.5s' }}>
            {step === 1 && (
              <form onSubmit={submitForm} style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 22 }}>
                  <div className="ed-group">
                    <label className="ed-label">First name</label>
                    <input className="ed-field" value={f.firstName} onChange={e => set('firstName', e.target.value)} placeholder="Catherine"/>
                  </div>
                  <div className="ed-group">
                    <label className="ed-label">Last name</label>
                    <input className="ed-field" value={f.lastName} onChange={e => set('lastName', e.target.value)} placeholder="Long"/>
                  </div>
                </div>
                <div className="ed-group">
                  <label className="ed-label">Work email</label>
                  <input className="ed-field" value={f.email} onChange={e => set('email', e.target.value)} placeholder="you@company.com"/>
                </div>
                <div className="ed-group">
                  <label className="ed-label">Password</label>
                  <input className="ed-field" type="password" value={f.password} onChange={e => set('password', e.target.value)} placeholder="••••••••••••"/>
                </div>

                <div>
                  <label className="ed-label" style={{ marginBottom: 8 }}>How should we find your company?</label>
                  <div style={{
                    display: 'flex', gap: 0,
                    border: '1px solid var(--hair-strong)', borderRadius: 999,
                    padding: 3, marginBottom: 14, width: 'fit-content',
                  }}>
                    {([{ k: 'website', l: 'Website URL' }, { k: 'linkedin', l: 'LinkedIn URL' }] as const).map(o => (
                      <button type="button" key={o.k} onClick={() => setLinkKind(o.k as LinkKind)} style={{
                        appearance: 'none', border: 0, cursor: 'pointer',
                        background: linkKind === o.k ? 'var(--ink)' : 'transparent',
                        color: linkKind === o.k ? '#fff' : 'var(--t-3)',
                        padding: '8px 18px', borderRadius: 999,
                        fontFamily: 'var(--serif)', fontSize: 14,
                        fontStyle: linkKind === o.k ? 'italic' : 'normal',
                        transition: 'background .2s, color .2s',
                      }}>{o.l}</button>
                    ))}
                  </div>
                  <div className="ed-group">
                    {linkKind === 'website' ? (
                      <input className="ed-field" value={f.website} onChange={e => set('website', e.target.value)} placeholder="https://yourcompany.com"/>
                    ) : (
                      <input className="ed-field" value={f.linkedin} onChange={e => set('linkedin', e.target.value)} placeholder="https://linkedin.com/company/your-company"/>
                    )}
                    <div className="mono" style={{
                      fontSize: 10, letterSpacing: '.16em',
                      color: looksValid ? 'var(--plum-700)' : 'var(--t-4)', marginTop: 8,
                    }}>
                      {looksValid
                        ? (linkKind === 'website' ? "— WE'LL CRAWL THIS SITE" : "— WE'LL ANALYZE THIS COMPANY")
                        : (linkKind === 'website' ? 'PASTE A FULL HTTPS:// URL' : 'PASTE A LINKEDIN.COM/COMPANY/… URL')}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 12, marginTop: 8, alignItems: 'center' }}>
                  <button type="submit" disabled={!canSubmit} style={{
                    flex: 1, appearance: 'none', border: 0,
                    cursor: canSubmit ? 'pointer' : 'not-allowed',
                    background: 'var(--ink)', color: 'var(--paper)',
                    padding: '16px', borderRadius: 999,
                    fontFamily: 'var(--serif)', fontSize: 18, fontStyle: 'italic',
                    letterSpacing: '-0.005em',
                    opacity: canSubmit ? 1 : .4, transition: 'opacity .2s',
                  }}>
                    {linkKind === 'website' ? 'Crawl my company' : 'Analyze my company'}{' '}
                    <span style={{ fontStyle: 'normal' }}>→</span>
                  </button>
                </div>
              </form>
            )}

            {step === 2 && <CompanyAnalyzingPanel beats={analyzeBeats} url={url} kind={linkKind}/>}
            {step === 3 && profile && <ParsedCompanyPanel profile={profile} onFinish={finish}/>}
          </div>

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

function CompanyAnalyzingPanel({ beats, url, kind }: {
  beats: number; url: string; kind: LinkKind;
}) {
  const lines = [
    kind === 'website' ? 'Crawling homepage' : 'Resolving company page',
    'Reading about, team & jobs',
    'Identifying funding & headcount',
    'Matching tech stack & industry',
    'Done',
  ];
  return (
    <div style={{
      border: '1px solid var(--hair-strong)', borderRadius: 14, padding: '26px 28px',
      background: '#fff', position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', inset: 0,
        background: 'repeating-linear-gradient(0deg, transparent 0 3px, rgba(120,75,140,.04) 3px 4px)',
        pointerEvents: 'none',
      }}/>
      <div className="mono" style={{ fontSize: 10, letterSpacing: '.22em', color: 'var(--plum-700)', marginBottom: 14 }}>
        — ANALYZING COMPANY
      </div>
      <div className="mono" style={{ fontSize: 11, color: 'var(--t-3)', wordBreak: 'break-all', marginBottom: 18 }}>
        ⌁ {url}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {lines.map((l, i) => {
          const done = i < beats;
          const active = i === beats;
          return (
            <div key={l} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              opacity: done || active ? 1 : .35, transition: 'opacity .3s',
            }}>
              <span style={{
                width: 14, height: 14, borderRadius: 999,
                border: done ? '1px solid var(--plum-600)' : '1px solid var(--hair-strong)',
                background: done ? 'var(--plum-600)' : 'transparent',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontSize: 9,
              }}>{done ? '✓' : ''}</span>
              <span className="serif" style={{
                fontSize: 18, fontStyle: active ? 'italic' : 'normal', letterSpacing: '-0.01em',
              }}>
                {l}
                {active && <span className="dots-pulse" style={{ marginLeft: 6, color: 'var(--t-4)' }}>…</span>}
              </span>
            </div>
          );
        })}
      </div>
      <style>{`
        .dots-pulse { animation: pulseO 1.2s ease-in-out infinite; }
        @keyframes pulseO { 0%,100% { opacity:.3 } 50% { opacity:1 } }
      `}</style>
    </div>
  );
}

function ParsedCompanyPanel({ profile, onFinish }: { profile: Profile; onFinish: () => void }) {
  return (
    <div>
      <div style={{
        border: '1px solid var(--hair-strong)', borderRadius: 14,
        background: '#fff', padding: '24px 26px',
      }}>
        <div style={{
          display: 'flex', gap: 14, alignItems: 'center',
          borderBottom: '1px solid var(--hair)', paddingBottom: 18, marginBottom: 18,
        }}>
          <div style={{
            width: 56, height: 56, borderRadius: 10,
            background: profile.logoColor, color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--mono)', fontSize: 24, fontWeight: 700,
          }}>{profile.logo}</div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div className="serif" style={{ fontSize: 24, letterSpacing: '-0.02em', fontStyle: 'italic' }}>
              {profile.name}
            </div>
            <div style={{ fontSize: 13, color: 'var(--t-3)' }}>{profile.tagline}</div>
            <div className="mono" style={{ fontSize: 10, letterSpacing: '.16em', color: 'var(--t-4)', marginTop: 4 }}>
              {profile.industry.toUpperCase()} · {profile.hq.toUpperCase()} · {profile.size}
            </div>
          </div>
        </div>

        <div className="mono" style={{ fontSize: 10, letterSpacing: '.2em', color: 'var(--t-4)', marginBottom: 12 }}>
          § WHAT WE FOUND
        </div>
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0,
          border: '1px solid var(--hair)', borderRadius: 10,
        }}>
          {([
            ['HEADCOUNT', profile.headcount],
            ['FUNDING',   profile.funding],
            ['STAGE',     profile.stage],
            ['FOUNDED',   profile.founded],
          ] as const).map(([k, v], i) => (
            <div key={k} style={{
              padding: '14px 16px',
              borderRight: i % 2 === 0 ? '1px solid var(--hair)' : 'none',
              borderBottom: i < 2 ? '1px solid var(--hair)' : 'none',
            }}>
              <div className="mono" style={{ fontSize: 9, letterSpacing: '.18em', color: 'var(--t-4)' }}>{k}</div>
              <div className="serif" style={{ fontSize: 18, letterSpacing: '-0.01em', marginTop: 2 }}>{v}</div>
            </div>
          ))}
        </div>

        <div className="mono" style={{ fontSize: 10, letterSpacing: '.2em', color: 'var(--t-4)', marginTop: 18, marginBottom: 10 }}>
          § TECH STACK
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {profile.stack.map(s => (
            <span key={s} className="mono" style={{
              fontSize: 10, letterSpacing: '.14em',
              padding: '5px 10px', borderRadius: 999,
              border: '1px solid var(--hair-strong)', color: 'var(--t-2)',
            }}>{s.toUpperCase()}</span>
          ))}
        </div>

        <div className="mono" style={{ fontSize: 10, letterSpacing: '.2em', color: 'var(--t-4)', marginTop: 18, marginBottom: 10 }}>
          § RECENT OPENINGS
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {profile.openings.map((r, i) => (
            <div key={i} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
              padding: '10px 0',
              borderBottom: i < profile.openings.length - 1 ? '1px solid var(--hair)' : 'none',
            }}>
              <span className="serif" style={{ fontSize: 16 }}>{r.title}</span>
              <span className="mono" style={{ fontSize: 10, letterSpacing: '.14em', color: 'var(--t-4)' }}>
                {r.dept.toUpperCase()}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, marginTop: 20, alignItems: 'center' }}>
        <button onClick={onFinish} style={{
          flex: 1, appearance: 'none', border: 0, cursor: 'pointer',
          background: 'var(--ink)', color: 'var(--paper)',
          padding: '16px', borderRadius: 999,
          fontFamily: 'var(--serif)', fontSize: 18, fontStyle: 'italic',
        }}>
          Looks right — create my workspace <span style={{ fontStyle: 'normal' }}>→</span>
        </button>
      </div>
    </div>
  );
}

function mockPullCompany(f: Form, kind: LinkKind): Profile {
  const url = kind === 'website' ? f.website : f.linkedin;
  let name = 'Ramp';
  let logo = 'R';
  let logoColor = '#3D4D2A';
  try {
    const m = (url || '').match(/(?:linkedin\.com\/company\/|https?:\/\/)([^/?]+)/i);
    if (m && m[1]) {
      const raw = m[1].replace(/^www\./, '').split(/[./-]/)[0];
      name = raw.charAt(0).toUpperCase() + raw.slice(1);
      logo = name[0].toUpperCase();
      const palette = ['#3D4D2A', '#5A2E63', '#2E5A63', '#63452E', '#7A4A8E', '#0A4D40'];
      let h = 0;
      for (let i = 0; i < raw.length; i++) h = ((h * 31 + raw.charCodeAt(i)) | 0);
      logoColor = palette[Math.abs(h) % palette.length];
    }
  } catch {}
  return {
    name, logo, logoColor,
    tagline: 'Spend management for finance teams who want to move fast.',
    industry: 'Fintech', hq: 'New York, NY', size: '500–1,000',
    headcount: '~720', funding: '$1.4B raised', stage: 'Series E', founded: '2019',
    stack: ['React', 'TypeScript', 'Go', 'Postgres', 'Kafka', 'AWS'],
    openings: [
      { title: 'Senior Platform Engineer', dept: 'Engineering' },
      { title: 'Staff iOS Engineer',        dept: 'Engineering' },
      { title: 'Product Manager, Cards',    dept: 'Product' },
    ],
  };
}
