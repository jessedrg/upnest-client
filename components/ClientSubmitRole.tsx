'use client';

// ClientSubmitRole — TSX port. Form + sticky preview + pending submittals queue.

import * as React from 'react';
import { ADMIN_DATA, type RoleSubmittal } from './AdminData';
import { Chip, SectionTitle, Hairline } from './AdminShared';
import { emitToast } from './Toast';

type Form = {
  title: string;
  location: string;
  workMode: 'Remote' | 'Hybrid' | 'Onsite';
  salaryLow: string;
  salaryHigh: string;
  bounty: string;
  feePct: string;
  guarantee: '30' | '60' | '90' | '120';
  headcount: number | string;
  priority: 'low' | 'med' | 'high';
  confidential: boolean;
  agencyRestriction: 'preferred-network' | 'any' | 'exclusive';
  description: string;
  skills: string;
  seniority: 'Junior' | 'Mid' | 'Senior' | 'Staff' | 'Principal' | 'Executive';
};

const INITIAL: Form = {
  title: '',
  location: 'New York',
  workMode: 'Hybrid',
  salaryLow: '',
  salaryHigh: '',
  bounty: '',
  feePct: '22',
  guarantee: '90',
  headcount: 1,
  priority: 'med',
  confidential: false,
  agencyRestriction: 'preferred-network',
  description: '',
  skills: '',
  seniority: 'Senior',
};

export function ClientSubmitRole({ onBack }: { onBack: () => void }) {
  const [form, setForm] = React.useState<Form>(INITIAL);
  const [submitted, setSubmitted] = React.useState(false);
  const update = <K extends keyof Form>(k: K, v: Form[K]) =>
    setForm(f => ({ ...f, [k]: v }));

  const submit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSubmitted(true);
    emitToast({
      kind: 'success',
      title: 'Role submitted for review',
      body: '3 recruiters will be notified',
    });
  };

  const myPending: RoleSubmittal[] = (ADMIN_DATA.roleSubmittals || [])
    .filter(s => s.org === 'Ramp');

  const estBounty = React.useMemo(() => {
    const high = parseInt(String(form.salaryHigh).replace(/[^0-9]/g, ''));
    const pct = parseFloat(form.feePct) || 22;
    if (!high) return null;
    return Math.round(high * 1000 * (pct / 100));
  }, [form.salaryHigh, form.feePct]);

  if (submitted) {
    return (
      <div className="pad-mobile" style={{
        padding: '80px 48px', maxWidth: 720, margin: '0 auto', textAlign: 'center',
      }}>
        <div className="mono" style={{
          fontSize: 10, letterSpacing: '.22em', color: 'var(--t-4)',
        }}>SUBMITTED · RS-00{Math.floor(Math.random() * 900) + 100}</div>
        <h1 className="serif" style={{
          fontSize: 'clamp(40px, 5vw, 56px)', fontStyle: 'italic',
          lineHeight: 1.05, letterSpacing: '-0.03em', marginTop: 14,
        }}>We&apos;ve got it.</h1>
        <p className="serif" style={{
          fontSize: 20, fontStyle: 'italic', color: 'var(--t-3)',
          marginTop: 18, lineHeight: 1.5,
        }}>
          Your role goes to our ops team for a quick sanity check. Once approved, it broadcasts to your preferred network — usually within 4 hours.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 32 }}>
          <button
            className="btn btn-ghost"
            onClick={() => { setSubmitted(false); setForm({ ...form, title: '', description: '' }); }}
            style={{ padding: '12px 20px' }}
          >Submit another</button>
          <button className="btn btn-primary" onClick={onBack} style={{ padding: '12px 22px' }}>
            Back to submittals
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pad-mobile" style={{ padding: '40px 48px 80px', maxWidth: 1800 }}>
      <div className="masthead" style={{ marginBottom: 32 }}>
        <div className="mono" style={{
          fontSize: 10, letterSpacing: '.22em', color: 'var(--t-4)',
        }}>SECTION · SUBMIT A ROLE</div>
        <h1 className="serif" style={{
          fontSize: 'clamp(44px, 5.2vw, 60px)', fontStyle: 'italic',
          lineHeight: 1.02, letterSpacing: '-0.03em', marginTop: 10,
        }}>Brief a new role.</h1>
        <p className="serif" style={{
          fontSize: 19, fontStyle: 'italic', color: 'var(--t-3)',
          marginTop: 14, lineHeight: 1.5, maxWidth: 700,
        }}>
          The more context you give, the better our recruiters target candidates. Required fields marked with{' '}
          <span className="mono" style={{ letterSpacing: '.1em', color: 'var(--plum-600)' }}>§</span>.
        </p>
      </div>

      <form
        onSubmit={submit}
        style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 48 }}
        className="stack-mobile"
      >
        {/* left: form */}
        <div>
          <SectionTitle num="§ 01" title="Role basics"/>
          <Hairline/>
          <Field label="Title §" req>
            <input
              value={form.title} onChange={e => update('title', e.target.value)} required
              placeholder="e.g. Staff Compiler Engineer"
              style={inputStyle}
            />
          </Field>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <Field label="Location §">
              <input
                value={form.location} onChange={e => update('location', e.target.value)} required
                style={inputStyle}
              />
            </Field>
            <Field label="Work mode">
              <select
                value={form.workMode}
                onChange={e => update('workMode', e.target.value as Form['workMode'])}
                style={inputStyle}
              >
                <option>Remote</option><option>Hybrid</option><option>Onsite</option>
              </select>
            </Field>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20 }}>
            <Field label="Seniority">
              <select
                value={form.seniority}
                onChange={e => update('seniority', e.target.value as Form['seniority'])}
                style={inputStyle}
              >
                <option>Junior</option><option>Mid</option><option>Senior</option>
                <option>Staff</option><option>Principal</option><option>Executive</option>
              </select>
            </Field>
            <Field label="Headcount">
              <input
                type="number" min={1} value={form.headcount}
                onChange={e => update('headcount', e.target.value)}
                style={inputStyle}
              />
            </Field>
            <Field label="Priority">
              <select
                value={form.priority}
                onChange={e => update('priority', e.target.value as Form['priority'])}
                style={inputStyle}
              >
                <option value="low">Low</option>
                <option value="med">Medium</option>
                <option value="high">High</option>
              </select>
            </Field>
          </div>

          <div style={{ height: 32 }}/>
          <SectionTitle num="§ 02" title="Compensation & fee"/>
          <Hairline/>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <Field label="Base salary · low §">
              <PrefixedInput
                prefix="$" suffix="K"
                value={form.salaryLow}
                onChange={v => update('salaryLow', v)}
                required
              />
            </Field>
            <Field label="Base salary · high §">
              <PrefixedInput
                prefix="$" suffix="K"
                value={form.salaryHigh}
                onChange={v => update('salaryHigh', v)}
                required
              />
            </Field>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <Field label="Placement fee %">
              <div style={{ ...inputStyle, display: 'flex', alignItems: 'center', padding: 0, overflow: 'hidden' }}>
                <input
                  type="number" step="0.5" min="15" max="35"
                  value={form.feePct}
                  onChange={e => update('feePct', e.target.value)}
                  style={{
                    border: 0, padding: '10px 12px', outline: 'none',
                    fontFamily: 'var(--sans)', fontSize: 14, width: '100%', background: 'transparent',
                  }}
                />
                <span style={{
                  padding: '0 12px', color: 'var(--t-4)',
                  fontFamily: 'var(--mono)', fontSize: 13,
                }}>%</span>
              </div>
            </Field>
            <Field label="Guarantee (days)">
              <select
                value={form.guarantee}
                onChange={e => update('guarantee', e.target.value as Form['guarantee'])}
                style={inputStyle}
              >
                <option value="30">30 days</option>
                <option value="60">60 days</option>
                <option value="90">90 days</option>
                <option value="120">120 days</option>
              </select>
            </Field>
          </div>

          <Field label="Custom bounty (optional)" hint="Flat bounty paid on placement. Leave blank to use the % fee above.">
            <PrefixedInput
              prefix="$"
              value={form.bounty}
              onChange={v => update('bounty', v)}
              placeholder={estBounty ? estBounty.toLocaleString() + ' · estimated' : 'e.g. 28,000'}
            />
          </Field>

          <div style={{ height: 32 }}/>
          <SectionTitle num="§ 03" title="The details"/>
          <Hairline/>
          <Field label="Description §">
            <textarea
              value={form.description}
              onChange={e => update('description', e.target.value)}
              required
              placeholder="What is this person building? Who will they work with? What's the must-have experience?"
              rows={6}
              style={{
                ...inputStyle, fontFamily: 'var(--sans)', lineHeight: 1.6, resize: 'vertical',
              }}
            />
          </Field>
          <Field label="Must-have skills (comma-separated)">
            <input
              value={form.skills}
              onChange={e => update('skills', e.target.value)}
              placeholder="Rust, LLVM, Systems, Compilers"
              style={inputStyle}
            />
          </Field>

          <div style={{ height: 32 }}/>
          <SectionTitle num="§ 04" title="Access"/>
          <Hairline/>
          <Field label="Who can see this role?">
            <select
              value={form.agencyRestriction}
              onChange={e => update('agencyRestriction', e.target.value as Form['agencyRestriction'])}
              style={inputStyle}
            >
              <option value="preferred-network">Preferred network only (4 agencies)</option>
              <option value="any">Any vetted recruiter on upnest</option>
              <option value="exclusive">Exclusive · one agency</option>
            </select>
          </Field>
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 0', cursor: 'pointer' }}>
            <input
              type="checkbox" checked={form.confidential}
              onChange={e => update('confidential', e.target.checked)}
            />
            <div>
              <div style={{ fontFamily: 'var(--serif)', fontSize: 15, fontStyle: 'italic' }}>
                Confidential role
              </div>
              <div className="mono" style={{
                fontSize: 10, letterSpacing: '.12em', color: 'var(--t-4)', marginTop: 2,
              }}>RECRUITERS SEE TITLE ONLY UNTIL NDA SIGNED</div>
            </div>
          </label>

          <div style={{
            display: 'flex', gap: 12, marginTop: 36,
            paddingTop: 24, borderTop: '1px solid var(--hair)',
          }}>
            <button
              type="button" className="btn btn-ghost"
              style={{ padding: '12px 20px' }} onClick={onBack}
            >Cancel</button>
            <button
              type="button" className="btn btn-ghost"
              style={{ padding: '12px 20px' }}
              onClick={() => emitToast({
                kind: 'info', title: 'Draft saved',
                body: 'Resume from Submit queue',
              })}
            >Save draft</button>
            <button
              type="submit" className="btn btn-primary"
              style={{ padding: '12px 28px', marginLeft: 'auto' }}
            >Submit for review</button>
          </div>
        </div>

        {/* right: preview + my pending */}
        <aside>
          <div style={{ position: 'sticky', top: 100 }}>
            <SectionTitle num="§ —" title="Preview"/>
            <Hairline/>
            <div style={{ border: '1px solid var(--hair)', padding: '22px 24px', background: '#fff' }}>
              <div className="mono" style={{
                fontSize: 10, letterSpacing: '.18em', color: 'var(--t-4)',
              }}>RAMP · NEW ROLE</div>
              <div className="serif" style={{
                fontSize: 24, fontStyle: 'italic', letterSpacing: '-0.02em',
                marginTop: 8, lineHeight: 1.1,
              }}>{form.title || 'Your role title'}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 14 }}>
                <Chip tone="paper">{form.location.toUpperCase()}</Chip>
                <Chip tone="paper">{form.workMode.toUpperCase()}</Chip>
                {form.salaryLow && form.salaryHigh && (
                  <Chip tone="paper">${form.salaryLow}–{form.salaryHigh}K</Chip>
                )}
                <Chip tone="plum">FEE {form.feePct}%</Chip>
                {form.priority === 'high' && <Chip tone="warn">HIGH PRIORITY</Chip>}
                {form.confidential && <Chip tone="paper">CONFIDENTIAL</Chip>}
              </div>
              <div style={{
                marginTop: 18, display: 'flex', justifyContent: 'space-between',
                paddingTop: 14, borderTop: '1px solid var(--hair)',
              }}>
                <div>
                  <div className="mono" style={{
                    fontSize: 9, letterSpacing: '.14em', color: 'var(--t-4)',
                  }}>EST. BOUNTY</div>
                  <div style={{
                    fontFamily: 'var(--serif)', fontSize: 22, fontStyle: 'italic',
                    letterSpacing: '-0.01em', marginTop: 2,
                  }}>
                    {form.bounty
                      ? '$' + parseInt(form.bounty).toLocaleString()
                      : estBounty ? '$' + estBounty.toLocaleString() : '—'}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="mono" style={{
                    fontSize: 9, letterSpacing: '.14em', color: 'var(--t-4)',
                  }}>GUARANTEE</div>
                  <div style={{
                    fontFamily: 'var(--serif)', fontSize: 22, fontStyle: 'italic',
                    letterSpacing: '-0.01em', marginTop: 2,
                  }}>{form.guarantee}d</div>
                </div>
              </div>
            </div>

            <div style={{ marginTop: 32 }}>
              <SectionTitle
                num="§ —"
                title="Pending submittals"
                sub={myPending.length ? myPending.length + ' IN REVIEW' : '—'}
              />
              <Hairline/>
              {myPending.length === 0 ? (
                <div className="serif" style={{
                  fontSize: 16, fontStyle: 'italic', color: 'var(--t-4)', padding: '12px 0',
                }}>
                  No pending submittals. Roles broadcast within ~4h of approval.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {myPending.map(s => (
                    <div key={s.id} style={{ padding: '14px 0', borderBottom: '1px solid var(--hair)' }}>
                      <div style={{
                        display: 'flex', justifyContent: 'space-between',
                        gap: 10, alignItems: 'baseline',
                      }}>
                        <div style={{
                          fontFamily: 'var(--serif)', fontSize: 15,
                          fontStyle: 'italic', letterSpacing: '-0.01em',
                        }}>{s.title}</div>
                        <Chip tone={s.status === 'needs-info' ? 'warn' : 'paper'}>
                          {s.status.toUpperCase()}
                        </Chip>
                      </div>
                      <div className="mono" style={{
                        fontSize: 10, letterSpacing: '.12em', color: 'var(--t-4)', marginTop: 4,
                      }}>{s.num} · {s.submittedAt.toUpperCase()} · {s.bounty} BOUNTY</div>
                      {s.needsInfo && (
                        <div style={{
                          marginTop: 8, padding: '8px 12px',
                          background: 'color-mix(in oklch, #D99C1E 8%, transparent)',
                          borderLeft: '3px solid #D99C1E',
                        }}>
                          <div className="mono" style={{
                            fontSize: 9, letterSpacing: '.14em', color: '#9B6700',
                          }}>ADMIN NEEDS INFO</div>
                          <div style={{ fontSize: 13, color: 'var(--t-2)', marginTop: 2 }}>{s.needsInfo}</div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </aside>
      </form>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  border: '1px solid var(--hair)',
  background: '#fff',
  padding: '10px 12px',
  fontFamily: 'var(--sans)',
  fontSize: 14,
  color: 'var(--ink)',
  outline: 'none',
  borderRadius: 2,
  width: '100%',
  boxSizing: 'border-box',
};

function Field({ label, hint, children, req }: {
  label: string;
  hint?: string;
  children: React.ReactNode;
  req?: boolean;
}) {
  return (
    <div style={{ marginBottom: 18 }}>
      <label style={{ display: 'block', marginBottom: 6 }}>
        <span className="mono" style={{
          fontSize: 10, letterSpacing: '.14em',
          color: req ? 'var(--plum-600)' : 'var(--t-4)',
          textTransform: 'uppercase',
        }}>{label}</span>
      </label>
      {children}
      {hint && (
        <div className="mono" style={{
          fontSize: 10, letterSpacing: '.12em', color: 'var(--t-4)', marginTop: 4,
        }}>{hint.toUpperCase()}</div>
      )}
    </div>
  );
}

function PrefixedInput({ prefix, suffix, value, onChange, required, placeholder }: {
  prefix?: string; suffix?: string;
  value: string; onChange: (v: string) => void;
  required?: boolean; placeholder?: string;
}) {
  return (
    <div style={{ ...inputStyle, display: 'flex', alignItems: 'center', padding: 0, overflow: 'hidden' }}>
      {prefix && (
        <span style={{
          padding: '0 12px', color: 'var(--t-4)',
          fontFamily: 'var(--mono)', fontSize: 13,
        }}>{prefix}</span>
      )}
      <input
        type="number"
        value={value}
        onChange={e => onChange(e.target.value)}
        required={required}
        placeholder={placeholder}
        style={{
          border: 0, padding: '10px 12px 10px 0', outline: 'none',
          fontFamily: 'var(--sans)', fontSize: 14, width: '100%', background: 'transparent',
        }}
      />
      {suffix && (
        <span style={{
          padding: '0 12px', color: 'var(--t-4)',
          fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '.1em',
        }}>{suffix}</span>
      )}
    </div>
  );
}
