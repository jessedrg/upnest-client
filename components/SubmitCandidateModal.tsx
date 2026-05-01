'use client';

// SubmitCandidateModal — TSX port of public/src/SubmitCandidateModal.jsx.
// Candidate info + role-specific screening questions + verification checkbox.

import * as React from 'react';
import { Icons } from './Icons';
import { emitToast } from './Toast';

type Stage = 'form' | 'submitting' | 'done';

export function SubmitCandidateModal({ open, closing, onClose, role }: {
  open: boolean;
  closing: boolean;
  onClose: () => void;
  role?: string | null;
}) {
  const [email, setEmail] = React.useState('');
  const [linkedin, setLinkedin] = React.useState('');
  const [filename, setFilename] = React.useState<string | null>(null);
  const [answers, setAnswers] = React.useState<Record<number, string>>({});
  const [verified, setVerified] = React.useState(false);
  const [stage, setStage] = React.useState<Stage>('form');
  const fileRef = React.useRef<HTMLInputElement | null>(null);

  const questions = [
    { q: "What is the candidate's asking salary?", hint: 'e.g. "$170K base"' },
    { q: "What is the candidate's notice period?", hint: 'Weeks, from signing' },
    { q: 'Amenable to the mentioned work setup?',  hint: 'Remote / hybrid / on-site' },
    { q: 'Location (City, Country)',                hint: 'Lagos, Nigeria' },
    { q: 'Need visa sponsorship?',                  hint: 'Yes / No; context welcome' },
  ];

  const required = questions.length;
  const answered = Object.values(answers).filter(v => (v || '').trim().length > 0).length;

  const canSubmit =
    email.trim().length > 4 && !!filename &&
    questions.every((_, i) => (answers[i] || '').trim().length > 0) &&
    verified;

  const submit = () => {
    if (!canSubmit) {
      emitToast({
        kind: 'error',
        title: 'Application incomplete',
        body: 'Fill every field, attach a CV, and confirm the call.',
      });
      return;
    }
    setStage('submitting');
    setTimeout(() => {
      setStage('done');
      emitToast({
        kind: 'success',
        title: 'Candidate submitted',
        body: `${role || 'Role'} · we'll email you when the client responds.`,
      });
    }, 1700);
  };

  const reset = () => {
    setEmail(''); setLinkedin(''); setFilename(null);
    setAnswers({}); setVerified(false); setStage('form');
  };
  const handleClose = () => { onClose(); setTimeout(reset, 400); };

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) return null;

  return (
    <div
      className={`modal-scrim ${closing ? 'closing' : ''}`}
      onClick={handleClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 210,
        background: 'rgba(20,10,40,.48)', backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        className={`modal-card ${closing ? 'closing' : ''}`}
        style={{
          width: 640, maxWidth: '100%', maxHeight: 'calc(100vh - 40px)',
          background: 'var(--paper)', borderRadius: 18, overflow: 'hidden',
          boxShadow: '0 30px 80px rgba(0,0,0,.28), 0 0 0 1px rgba(20,10,40,.04)',
          display: 'flex', flexDirection: 'column',
        }}
      >
        {/* head */}
        <div style={{
          padding: '22px 26px 16px', borderBottom: '1px solid var(--hair)', background: '#fff',
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16,
        }}>
          <div style={{ minWidth: 0 }}>
            <div className="mono" style={{
              fontSize: 10, letterSpacing: '.22em', color: 'var(--plum-700)', marginBottom: 6,
            }}>
              — SUBMIT CANDIDATE {role ? `· ${role.toUpperCase()}` : ''}
            </div>
            <h2 className="serif" style={{
              margin: 0, fontSize: 28, letterSpacing: '-0.025em', fontStyle: 'italic', lineHeight: 1.1,
            }}>
              {stage === 'done' ? 'Submitted.' : 'Add application manually.'}
            </h2>
            {stage !== 'done' && (
              <p style={{
                margin: '6px 0 0', fontFamily: 'var(--serif)', fontSize: 14, fontStyle: 'italic',
                color: 'var(--t-3)', letterSpacing: '-0.005em',
              }}>
                Candidate info + role-specific answers. Everything gets reviewed.
              </p>
            )}
          </div>
          <button onClick={handleClose} style={{
            width: 32, height: 32, borderRadius: 999, border: '1px solid var(--hair)',
            background: '#fff', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <Icons.Close size={13}/>
          </button>
        </div>

        {/* body */}
        <div style={{ flex: 1, overflow: 'auto', padding: '22px 26px' }}>
          {stage === 'form' && (
            <div className="step-fade">
              {/* Candidate info */}
              <div className="mono" style={{
                fontSize: 10, letterSpacing: '.18em', color: 'var(--t-3)', marginBottom: 12,
              }}>◉ CANDIDATE INFORMATION</div>
              <div style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 18,
              }}>
                <FieldHair label="EMAIL" required>
                  <input
                    value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="candidate@example.com"
                    style={hairInput}
                  />
                </FieldHair>
                <FieldHair label="LINKEDIN URL">
                  <input
                    value={linkedin} onChange={e => setLinkedin(e.target.value)}
                    placeholder="linkedin.com/in/…"
                    style={hairInput}
                  />
                </FieldHair>
              </div>

              <FieldHair label="RESUME (PDF)" required style={{ marginBottom: 22 }}>
                <input
                  ref={fileRef} type="file" accept=".pdf" style={{ display: 'none' }}
                  onChange={e => e.target.files?.[0] && setFilename(e.target.files[0].name)}
                />
                <button
                  onClick={() => fileRef.current?.click()}
                  style={{
                    appearance: 'none', cursor: 'pointer',
                    width: '100%', padding: '12px 0', border: 0,
                    borderBottom: '1px solid var(--hair-strong)',
                    background: 'transparent', textAlign: 'left',
                    fontFamily: 'var(--serif)', fontSize: 15,
                    fontStyle: filename ? 'normal' : 'italic',
                    color: filename ? 'var(--t-1)' : 'var(--t-3)',
                    display: 'flex', alignItems: 'center', gap: 10,
                  }}
                >
                  <span style={{
                    width: 24, height: 24, borderRadius: 6,
                    background: filename ? 'var(--plum-700)' : 'var(--paper-2)',
                    color: filename ? '#fff' : 'var(--t-3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'var(--serif)', fontSize: 13, fontStyle: 'italic', flexShrink: 0,
                  }}>↑</span>
                  {filename || 'Choose PDF file…'}
                </button>
              </FieldHair>

              {/* Role Questions header w/ progress */}
              <div style={{
                display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12,
              }}>
                <div className="mono" style={{
                  fontSize: 10, letterSpacing: '.18em', color: 'var(--t-3)',
                }}>◍ ROLE QUESTIONS · {required} REQUIRED</div>
                <div className="mono num" style={{
                  fontSize: 10, letterSpacing: '.1em',
                  color: answered === required ? 'var(--ok)' : 'var(--t-4)',
                }}>{answered}/{required} ANSWERED</div>
              </div>

              <div style={{
                height: 2, background: 'var(--hair)', borderRadius: 2,
                overflow: 'hidden', marginBottom: 18,
              }}>
                <div style={{
                  width: `${(answered / required) * 100}%`, height: '100%',
                  background: answered === required ? 'var(--ok)' : 'var(--plum-700)',
                  transition: 'width .3s var(--ease), background .2s',
                }}/>
              </div>

              {questions.map((q, i) => (
                <FieldHair
                  key={i}
                  label={`${String(i + 1).padStart(2, '0')}. ${q.q}`}
                  required numbered
                  style={{ marginBottom: 16 }}
                >
                  <input
                    value={answers[i] || ''}
                    onChange={e => setAnswers(a => ({ ...a, [i]: e.target.value }))}
                    placeholder={q.hint}
                    style={hairInput}
                  />
                </FieldHair>
              ))}

              {/* Verification */}
              <div style={{
                marginTop: 18, padding: '14px 16px',
                border: '1px solid var(--warn)', background: 'rgba(219,148,63,.06)',
                borderRadius: 12, display: 'flex', gap: 12, alignItems: 'flex-start',
              }}>
                <label style={{
                  width: 20, height: 20, borderRadius: 5,
                  border: '1.5px solid ' + (verified ? 'var(--ok)' : 'var(--hair-strong)'),
                  background: verified ? 'var(--ok)' : '#fff',
                  color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', fontSize: 12, flexShrink: 0, marginTop: 2,
                }}>
                  <input
                    type="checkbox" checked={verified}
                    onChange={e => setVerified(e.target.checked)} style={{ display: 'none' }}
                  />
                  {verified && '✓'}
                </label>
                <div>
                  <div className="mono" style={{
                    fontSize: 10, letterSpacing: '.16em', color: 'var(--warn)', marginBottom: 4,
                  }}>☎ SCREENING VERIFICATION</div>
                  <p style={{
                    margin: 0, fontFamily: 'var(--serif)', fontSize: 14, fontStyle: 'italic',
                    color: 'var(--t-2)', lineHeight: 1.5,
                  }}>
                    I have completed a phone or video call screening with this candidate. Submitting fake or unverified candidates may result in account suspension.
                  </p>
                </div>
              </div>
            </div>
          )}

          {stage === 'submitting' && (
            <div className="step-fade" style={{ padding: '16px 0 6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 22 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 999,
                  background: 'var(--plum-50)', color: 'var(--plum-700)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--serif)', fontSize: 22, fontStyle: 'italic',
                }}>↑</div>
                <div>
                  <div className="serif" style={{ fontSize: 19, letterSpacing: '-0.01em' }}>
                    Submitting application
                  </div>
                  <div className="mono" style={{
                    fontSize: 10, letterSpacing: '.2em', color: 'var(--t-3)', marginTop: 4,
                  }}>PARSING · MATCHING · FILING</div>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[
                  'Uploading resume (PDF)',
                  'Parsing experience + skills',
                  'Cross-checking against role brief',
                  'Filing under role pipeline',
                ].map((t, i) => (
                  <ShimRow key={i} text={t} done={i < 2}/>
                ))}
              </div>
            </div>
          )}

          {stage === 'done' && (
            <div className="step-fade" style={{ textAlign: 'center', padding: '26px 10px 10px' }}>
              <div style={{
                width: 72, height: 72, borderRadius: 999, margin: '0 auto 18px',
                background: 'rgba(47,167,154,.12)', color: 'var(--ok)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--serif)', fontSize: 34, fontStyle: 'italic',
              }}>✓</div>
              <h3 className="serif" style={{
                fontSize: 26, letterSpacing: '-0.02em', fontStyle: 'italic', margin: '0 0 6px',
              }}>Candidate submitted.</h3>
              <p style={{
                fontFamily: 'var(--serif)', fontSize: 15, fontStyle: 'italic',
                color: 'var(--t-3)', maxWidth: 420, margin: '0 auto 22px', lineHeight: 1.5,
              }}>
                <span style={{ color: 'var(--t-1)' }}>{email}</span> has been added to the pipeline. You&apos;ll see updates as the client reviews.
              </p>
              <div style={{
                border: '1px solid var(--hair)', borderRadius: 12, background: '#fff',
                padding: '14px 18px', maxWidth: 420, margin: '0 auto', textAlign: 'left',
              }}>
                <div className="mono" style={{
                  fontSize: 10, letterSpacing: '.18em', color: 'var(--t-3)', marginBottom: 8,
                }}>NEXT STEPS</div>
                {([
                  ['01', 'Client review within 24–48h'],
                  ['02', "You'll be notified via Slack + email"],
                  ['03', 'If moved forward → schedule phone screen'],
                ] as const).map(([n, t]) => (
                  <div key={n} style={{
                    display: 'grid', gridTemplateColumns: '28px 1fr', padding: '8px 0',
                    borderBottom: n !== '03' ? '1px solid var(--hair)' : 'none',
                  }}>
                    <span className="mono num" style={{ fontSize: 10, color: 'var(--t-4)' }}>{n}</span>
                    <span style={{
                      fontFamily: 'var(--serif)', fontSize: 14, fontStyle: 'italic', color: 'var(--t-2)',
                    }}>{t}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* footer */}
        <div style={{
          padding: '14px 22px', borderTop: '1px solid var(--hair)', background: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
        }}>
          <span className="mono" style={{
            fontSize: 10, letterSpacing: '.22em', color: 'var(--t-4)',
          }}>{stage === 'done' ? 'NICE WORK' : 'ESC TO CLOSE'}</span>
          <div style={{ display: 'flex', gap: 8 }}>
            {stage === 'form' && (
              <>
                <button onClick={handleClose} className="btn btn-ghost"
                        style={{ padding: '10px 16px', fontSize: 13 }}>
                  Cancel
                </button>
                <button
                  onClick={submit} disabled={!canSubmit}
                  className="btn btn-primary"
                  style={{
                    padding: '12px 18px', fontSize: 14, borderRadius: 999,
                    fontFamily: 'var(--serif)', fontStyle: 'italic', letterSpacing: '-0.005em',
                    opacity: canSubmit ? 1 : .4, cursor: canSubmit ? 'pointer' : 'not-allowed',
                  }}
                >↑ Submit application →</button>
              </>
            )}
            {stage === 'submitting' && (
              <button disabled className="btn btn-primary" style={{
                padding: '12px 18px', fontSize: 14, opacity: .6, cursor: 'wait',
                fontFamily: 'var(--serif)', fontStyle: 'italic', borderRadius: 999,
              }}>Working…</button>
            )}
            {stage === 'done' && (
              <>
                <button onClick={reset} className="btn btn-ghost"
                        style={{ padding: '10px 16px', fontSize: 13 }}>
                  + Add another
                </button>
                <button onClick={handleClose} className="btn btn-primary" style={{
                  padding: '12px 18px', fontSize: 14, borderRadius: 999,
                  fontFamily: 'var(--serif)', fontStyle: 'italic',
                }}>Done →</button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const hairInput: React.CSSProperties = {
  width: '100%', padding: '10px 0', border: 0,
  borderBottom: '1px solid var(--hair-strong)',
  background: 'transparent', outline: 'none',
  font: '400 15px/1.4 var(--serif)', letterSpacing: '-0.005em',
  color: 'var(--t-1)',
};

function FieldHair({ label, required, numbered, children, style }: {
  label: string;
  required?: boolean;
  numbered?: boolean;
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div style={{ position: 'relative', ...style }}>
      <label className="ed-label" style={{
        display: 'flex', alignItems: 'center', gap: 6,
        fontFamily: numbered ? 'var(--sans)' : 'var(--mono)',
        textTransform: numbered ? 'none' : 'uppercase',
        fontStyle: 'normal',
        fontSize: numbered ? 12 : 9,
        fontWeight: numbered ? 500 : 400,
        letterSpacing: numbered ? '-0.005em' : '.2em',
        color: numbered ? 'var(--t-1)' : 'var(--t-3)',
        marginBottom: 2,
      }}>
        {label}
        {required && <span style={{ color: 'var(--err)' }}>*</span>}
      </label>
      {children}
    </div>
  );
}

function ShimRow({ text, done }: { text: string; done: boolean }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '22px 1fr', gap: 10, alignItems: 'center' }}>
      <span className="mono num" style={{
        fontSize: 10, letterSpacing: '.14em',
        color: done ? 'var(--ok)' : 'var(--t-4)',
      }}>{done ? '✓' : '—'}</span>
      <div>
        <div style={{
          fontFamily: 'var(--serif)', fontSize: 15, fontStyle: 'italic',
          color: done ? 'var(--t-1)' : 'var(--t-3)',
        }}>{text}</div>
        {!done && (
          <div className="shimmer-bar" style={{
            height: 2, borderRadius: 2, marginTop: 6, background: 'var(--hair)',
          }}/>
        )}
      </div>
    </div>
  );
}

/* ─────────────── Host: open via window event ───────────────
 * ClientRoleDetail dispatches window.dispatchEvent(new CustomEvent('open-submit-candidate', { detail:{ role } }))
 * Mount this once at the app shell so anywhere in the tree can pop the modal.
 */
export function SubmitCandidateModalHost() {
  const [open, setOpen] = React.useState(false);
  const [closing, setClosing] = React.useState(false);
  const [role, setRole] = React.useState<string | null>(null);

  React.useEffect(() => {
    const onOpen = (e: Event) => {
      const detail = (e as CustomEvent).detail || {};
      setRole(detail.role || null);
      setClosing(false);
      setOpen(true);
    };
    window.addEventListener('open-submit-candidate', onOpen);
    return () => window.removeEventListener('open-submit-candidate', onOpen);
  }, []);

  const close = () => {
    setClosing(true);
    setTimeout(() => { setOpen(false); setClosing(false); }, 320);
  };

  return <SubmitCandidateModal open={open} closing={closing} onClose={close} role={role}/>;
}
