'use client';

// CreateRoleModal — TSX port of public/src/CreateRoleModal.jsx.
// AI-assisted role creation modal: input → analyzing → review (4 tabs).

import * as React from 'react';
import { Icons } from './Icons';
import { emitToast } from './Toast';

/* ───────────────────────── Types ───────────────────────── */

type Stage = 'input' | 'analyzing' | 'review';
type Tab = 'basic' | 'details' | 'skills' | 'recruiter';

type CalibrationKind = 'candidate' | 'operator' | 'recruiter';
type Calibration = { id: number; url: string; kind: CalibrationKind; note: string };

export type DraftRole = {
  title: string; company: string; department: string; location: string;
  industry: string; type: string; level: string; remote: string; size: string;
  salary: string; website: string; priority: number; difficulty: string;
  visaSponsor: boolean; phoneScreen: boolean; noDisclosure: boolean;
  bounty: string; fee: string;
  requirements: string; about: string; benefits: string;
  required: string[]; niceToHave: string[];
  redFlags: string[]; screeningQs: string[];
  hiringManager: { name: string; title: string; linkedin: string };
  calibrationLinkedIns: Calibration[];
  aiInsight: string;
  status?: 'draft' | 'published';
};

const DEFAULT_ROLE: DraftRole = {
  title: 'Product Engineer (Up to 2 hires)',
  company: 'Confidential',
  department: 'General',
  location: 'In-person in NY; relocation support available for strong candidates',
  industry: 'Software Development',
  type: 'Full-time', level: 'Entry', remote: 'On-site', size: '1-10',
  salary: '$170K – $220K + equity',
  website: 'https://',
  priority: 93990,
  difficulty: 'Very Hard',
  visaSponsor: false, phoneScreen: true, noDisclosure: true,
  bounty: '$19,200', fee: '',
  requirements:
    '• 4+ years of full-stack experience building products end-to-end — you thrive when you own a codebase top to bottom\n• A product mindset: you care deeply about the customer and the business, not just the code\n• Obsessive attention to detail in design and interaction — you push for experiences that feel easy and delightful\n• Strong programming fundamentals and fluency across modern full-stack web technologies\n• Engineering experience at fast-growing, product-driven companies where you had to figure things out without a playbook (ideally at early-stage companies)\n\nBonus Skills:\n• Early-stage, high-growth company or founding-team experience.\n• HR or recruiting tech experience, or experience building tools for power users (CRMs, dashboards, internal tools).',
  about:
    'Supports hundreds of candidates, recruiters, and employers every day and has grown 10x in under a year with a 3-person team, spending almost nothing to get here. We recently raised a large seed round from top tier investors.',
  benefits: '',
  required: ['Full-stack', 'React', 'TypeScript', 'Node.js', 'Product sense'],
  niceToHave: ['Recruiting domain knowledge', 'Early-stage experience', 'Design intuition'],
  redFlags: [
    "Resume that looks like a 'cog in the machine'",
    'No excitement factor or entrepreneurial instinct',
    'Strong initial behavioral performance but struggles in deeper rounds',
    'Experience at recognizable big-tech without standout impact',
    'Lack of initiative or ambition',
  ],
  screeningQs: [
    'Can you describe a project where you used data to influence product decisions?',
    'How do you approach statistical analysis in your work?',
    'Can you give an example of a time you presented data to a non-technical audience?',
    'What strategies do you use to ensure data accuracy?',
    'How do you prioritize your tasks when working on multiple projects?',
  ],
  hiringManager: { name: '', title: '', linkedin: '' },
  calibrationLinkedIns: [],
  aiInsight: 'Looking for builder-archetype: people who shipped end-to-end products at small companies. Avoid pure FAANG-track candidates.',
};

/* ───────────────────────── Top-level modal ───────────────────────── */

export function CreateRoleModal({ open, closing, onClose, onCreated }: {
  open: boolean;
  closing: boolean;
  onClose: () => void;
  onCreated?: (r: DraftRole) => void;
}) {
  const [filename, setFilename] = React.useState<string | null>(null);
  const [stage, setStage] = React.useState<Stage>('input');
  const [tab, setTab] = React.useState<Tab>('basic');
  const [role, setRole] = React.useState<DraftRole | null>(null);
  const [analyzeStep, setAnalyzeStep] = React.useState(0);
  const fileRef = React.useRef<HTMLInputElement | null>(null);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const canAnalyze = !!filename;

  const analyzeSteps = [
    'Reading job description',
    'Inferring location & work mode',
    'Extracting responsibilities and split',
    'Detecting must-have / nice-to-have skills',
    'Estimating compensation band & difficulty',
    'Drafting red flags and screening questions',
    'Finding ideal candidate profiles',
  ];

  const analyze = () => {
    setStage('analyzing');
    setAnalyzeStep(0);
    const stepDuration = 700;
    let i = 0;
    const tick = () => {
      i++;
      if (i < analyzeSteps.length) {
        setAnalyzeStep(i);
        setTimeout(tick, stepDuration);
      } else {
        setTimeout(() => {
          setRole(DEFAULT_ROLE);
          setStage('review');
          setTab('basic');
        }, stepDuration);
      }
    };
    setTimeout(tick, stepDuration);
  };

  const update = (patch: Partial<DraftRole>) => setRole(r => (r ? { ...r, ...patch } : r));

  const reset = () => {
    setFilename(null); setRole(null); setStage('input'); setTab('basic'); setAnalyzeStep(0);
  };
  const handleClose = () => { onClose(); setTimeout(reset, 400); };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) setFilename(f.name);
  };

  if (!open) return null;

  return (
    <div
      className={`modal-scrim ${closing ? 'closing' : ''}`}
      onClick={handleClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(20,10,40,.48)', backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
      }}
    >
      <div
        className={`modal-card ${closing ? 'closing' : ''}`}
        onClick={e => e.stopPropagation()}
        style={{
          width: 780, maxWidth: '100%', maxHeight: '92vh',
          background: 'var(--paper)', borderRadius: 18, overflow: 'hidden',
          boxShadow: '0 30px 80px rgba(0,0,0,.28), 0 0 0 1px rgba(20,10,40,.04)',
          display: 'flex', flexDirection: 'column',
        }}
      >
        {/* header */}
        <div style={{
          padding: '22px 26px 16px', borderBottom: '1px solid var(--hair)', background: '#fff',
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16,
        }}>
          <div>
            <div className="mono" style={{ fontSize: 10, letterSpacing: '.22em', color: 'var(--plum-700)', marginBottom: 8 }}>
              — NEW ROLE · STEP {stage === 'input' ? '01' : stage === 'analyzing' ? '02' : '03'} OF 03
            </div>
            <h2 className="serif" style={{
              margin: 0, fontSize: 30, letterSpacing: '-0.025em', lineHeight: 1.05, fontStyle: 'italic',
            }}>
              {stage === 'input' && 'Draft with AI.'}
              {stage === 'analyzing' && 'Reading your draft…'}
              {stage === 'review' && 'Looks right?'}
            </h2>
          </div>
          <button onClick={handleClose} style={{
            width: 32, height: 32, borderRadius: 999, border: '1px solid var(--hair)',
            background: '#fff', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <Icons.Close size={13}/>
          </button>
        </div>

        {/* tab strip */}
        {stage === 'review' && (
          <div style={{
            display: 'flex', gap: 2, padding: '0 26px',
            borderBottom: '1px solid var(--hair)', background: '#fff',
          }}>
            {([
              { k: 'basic', l: 'Basic' },
              { k: 'details', l: 'Details' },
              { k: 'skills', l: 'Skills' },
              { k: 'recruiter', l: 'Calibration · Recruiter' },
            ] as const).map(t => (
              <button
                key={t.k}
                onClick={() => setTab(t.k as Tab)}
                style={{
                  appearance: 'none', border: 0, background: 'transparent', cursor: 'pointer',
                  padding: '14px 14px', position: 'relative',
                  fontFamily: 'var(--serif)',
                  fontStyle: tab === t.k ? 'italic' : 'normal',
                  fontSize: 15, letterSpacing: '-0.01em',
                  color: tab === t.k ? 'var(--t-1)' : 'var(--t-3)',
                }}
              >
                {t.l}
                {tab === t.k && (
                  <span style={{
                    position: 'absolute', left: 12, right: 12, bottom: -1,
                    height: 2, background: 'var(--ink)',
                  }}/>
                )}
              </button>
            ))}
          </div>
        )}

        {/* body */}
        <div style={{ padding: '22px 26px', flex: 1, overflow: 'auto' }}>
          {stage === 'input' && (
            <InputStep filename={filename} setFilename={setFilename} fileRef={fileRef} handleFile={handleFile}/>
          )}
          {stage === 'analyzing' && <AnalyzingStep step={analyzeStep} steps={analyzeSteps}/>}
          {stage === 'review' && role && (
            <>
              {tab === 'basic'     && <BasicTab role={role} update={update}/>}
              {tab === 'details'   && <DetailsTab role={role} update={update}/>}
              {tab === 'skills'    && <SkillsTab role={role} update={update}/>}
              {tab === 'recruiter' && <RecruiterTab role={role} update={update}/>}
            </>
          )}
        </div>

        {/* footer */}
        <div style={{
          padding: '16px 22px', borderTop: '1px solid var(--hair)', background: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
        }}>
          <span className="mono" style={{ fontSize: 10, letterSpacing: '.22em', color: 'var(--t-4)' }}>ESC TO CLOSE</span>
          <div style={{ display: 'flex', gap: 8 }}>
            {stage === 'review' && (
              <button onClick={() => setStage('input')} className="btn btn-ghost" style={{ padding: '10px 16px', fontSize: 13 }}>
                ← Edit draft
              </button>
            )}
            {stage === 'input' && (
              <button onClick={analyze} disabled={!canAnalyze} className="btn btn-primary" style={{
                padding: '12px 18px', fontSize: 14,
                fontFamily: 'var(--serif)', fontStyle: 'italic', letterSpacing: '-0.005em',
                borderRadius: 999, opacity: canAnalyze ? 1 : .45,
                cursor: canAnalyze ? 'pointer' : 'not-allowed',
              }}>✶ Analyze with AI →</button>
            )}
            {stage === 'analyzing' && (
              <button disabled className="btn btn-primary" style={{
                padding: '12px 18px', fontSize: 14, opacity: .6, cursor: 'wait',
                fontFamily: 'var(--serif)', fontStyle: 'italic', borderRadius: 999,
              }}>Working…</button>
            )}
            {stage === 'review' && role && (
              <>
                <button
                  onClick={() => {
                    onCreated && onCreated({ ...role, status: 'draft' });
                    emitToast({ kind: 'info', title: 'Saved as draft' });
                    handleClose();
                  }}
                  className="btn btn-ghost"
                  style={{ padding: '10px 16px', fontSize: 13 }}
                >Save draft</button>
                <button
                  onClick={() => {
                    onCreated && onCreated({ ...role, status: 'published' });
                    emitToast({ kind: 'success', title: 'Role published' });
                    handleClose();
                  }}
                  className="btn btn-primary"
                  style={{
                    padding: '12px 18px', fontSize: 14, borderRadius: 999,
                    fontFamily: 'var(--serif)', fontStyle: 'italic', letterSpacing: '-0.005em',
                  }}
                >Publish role →</button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────── Input + Analyzing ───────────────────────── */

function InputStep({ filename, setFilename, fileRef, handleFile }: {
  filename: string | null;
  setFilename: (v: string | null) => void;
  fileRef: React.MutableRefObject<HTMLInputElement | null>;
  handleFile: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  const [drag, setDrag] = React.useState(false);
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDrag(false);
    const f = e.dataTransfer.files?.[0];
    if (f) setFilename(f.name);
  };
  return (
    <div className="step-fade">
      <input
        ref={fileRef} type="file" accept=".pdf,.doc,.docx,.txt"
        onChange={handleFile} style={{ display: 'none' }}
      />
      <div
        onClick={() => fileRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={onDrop}
        style={{
          border: `1.5px dashed ${drag ? 'var(--plum-700)' : 'var(--hair-strong)'}`,
          borderRadius: 14,
          padding: '56px 24px', textAlign: 'center', cursor: 'pointer',
          background: drag ? 'var(--plum-50)' : '#fff',
          transition: 'all .2s ease',
        }}
      >
        <div className="serif" style={{
          fontSize: 42, color: 'var(--plum-700)', marginBottom: 14,
          lineHeight: 1, fontStyle: 'italic',
        }}>
          {filename ? '✓' : '↑'}
        </div>
        <div className="serif" style={{
          fontSize: 22, fontStyle: 'italic', letterSpacing: '-0.01em', color: 'var(--t-1)',
        }}>{filename || 'Drop a job description'}</div>
        <div className="mono" style={{
          fontSize: 10, letterSpacing: '.22em', color: 'var(--t-4)', marginTop: 10,
        }}>{filename ? 'READY TO ANALYZE' : 'PDF · DOC · DOCX · TXT — UP TO 10 MB'}</div>
      </div>

      <div style={{
        marginTop: 18, padding: '14px 16px',
        borderLeft: '2px solid var(--plum-700)', background: '#fff',
        display: 'flex', gap: 12,
      }}>
        <div className="serif" style={{ fontSize: 18, fontStyle: 'italic', color: 'var(--plum-700)', lineHeight: 1.2 }}>✶</div>
        <div>
          <div className="mono" style={{ fontSize: 9, letterSpacing: '.24em', color: 'var(--t-3)', marginBottom: 4 }}>
            WHAT HAPPENS NEXT
          </div>
          <div style={{ fontFamily: 'var(--serif)', fontSize: 14, lineHeight: 1.5, color: 'var(--t-2)' }}>
            Claude reads the JD and extracts <em>title, location, comp band, must-haves, red flags, screening questions, and ideal candidate profiles</em>. You&apos;ll review and edit everything before publishing.
          </div>
        </div>
      </div>
    </div>
  );
}

function AnalyzingStep({ step, steps }: { step: number; steps: string[] }) {
  return (
    <div className="step-fade" style={{ padding: '12px 0 6px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
        <div style={{
          width: 48, height: 48, borderRadius: 999,
          background: 'var(--plum-50)', color: 'var(--plum-700)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--serif)', fontSize: 24, fontStyle: 'italic',
          animation: 'spin 4s linear infinite',
        }}>✶</div>
        <div>
          <div className="serif" style={{ fontSize: 21, letterSpacing: '-0.01em' }}>Reading the job description</div>
          <div className="mono" style={{
            fontSize: 10, letterSpacing: '.2em', color: 'var(--t-3)', marginTop: 4,
          }}>CLAUDE · EXTRACT + CLASSIFY</div>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {steps.map((t, i) => {
          const done = i < step;
          const active = i === step;
          return (
            <div key={i} style={{
              display: 'grid', gridTemplateColumns: '22px 1fr', gap: 14, alignItems: 'center',
              padding: '10px 0',
              borderBottom: i < steps.length - 1 ? '1px solid var(--hair)' : 0,
              opacity: done || active ? 1 : 0.45,
              transition: 'opacity .3s ease',
            }}>
              <span className="mono num" style={{
                fontSize: 11, letterSpacing: '.14em',
                color: done ? 'var(--ok)' : active ? 'var(--plum-700)' : 'var(--t-4)',
                fontStyle: active ? 'italic' : 'normal',
                fontFamily: active ? 'var(--serif)' : 'var(--mono)',
              }}>{done ? '✓' : active ? '✶' : '—'}</span>
              <div>
                <div style={{
                  fontFamily: 'var(--serif)', fontSize: 15,
                  fontStyle: active ? 'italic' : 'normal',
                  color: done ? 'var(--t-2)' : active ? 'var(--t-1)' : 'var(--t-3)',
                }}>{t}</div>
                {active && (
                  <div className="shimmer-bar" style={{
                    height: 2, borderRadius: 2, marginTop: 6, background: 'var(--hair)',
                  }}/>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ───────────────────────── Field primitives ───────────────────────── */

const fieldStyle: React.CSSProperties = {
  padding: '10px 12px', border: '1px solid var(--hair)', borderRadius: 8,
  background: '#fff', outline: 'none',
  fontSize: 14, color: 'var(--t-1)',
  fontFamily: 'var(--sans)', letterSpacing: '-0.005em',
  width: '100%', boxSizing: 'border-box',
};

function Field({ label, children, half, required }: {
  label: string; children: React.ReactNode; half?: boolean; required?: boolean;
}) {
  return (
    <label style={{
      display: 'flex', flexDirection: 'column', gap: 6,
      gridColumn: half ? 'span 1' : 'span 2',
    }}>
      <span className="mono" style={{ fontSize: 10, letterSpacing: '.2em', color: 'var(--t-3)' }}>
        {label}{required && <span style={{ color: 'var(--plum-700)' }}> *</span>}
      </span>
      {children}
    </label>
  );
}

function TextIn({ value, onChange, placeholder }: {
  value: string | undefined; onChange: (v: string) => void; placeholder?: string;
}) {
  return <input value={value ?? ''} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={fieldStyle}/>;
}

function NumIn({ value, onChange, placeholder }: {
  value: number | undefined; onChange: (v: number) => void; placeholder?: string;
}) {
  return (
    <input
      type="number"
      value={value ?? ''}
      onChange={e => onChange(Number(e.target.value))}
      placeholder={placeholder}
      style={fieldStyle}
    />
  );
}

function SelectIn({ value, onChange, options }: {
  value: string; onChange: (v: string) => void; options: string[];
}) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)} style={{
      ...fieldStyle, appearance: 'none',
      backgroundImage: 'linear-gradient(45deg, transparent 50%, var(--t-3) 50%), linear-gradient(135deg, var(--t-3) 50%, transparent 50%)',
      backgroundPosition: 'calc(100% - 14px) 50%, calc(100% - 10px) 50%',
      backgroundSize: '4px 4px', backgroundRepeat: 'no-repeat', paddingRight: 30,
    }}>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

function Toggle({ on, onChange, label }: {
  on: boolean; onChange: (v: boolean) => void; label: string;
}) {
  return (
    <button onClick={() => onChange(!on)} type="button" style={{
      appearance: 'none', border: 0, cursor: 'pointer', background: 'transparent',
      display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0',
    }}>
      <span style={{
        width: 32, height: 18, borderRadius: 999,
        position: 'relative', transition: 'background .2s',
        background: on ? 'var(--ink)' : 'var(--hair-strong)',
      }}>
        <span style={{
          position: 'absolute', top: 2, left: on ? 16 : 2,
          width: 14, height: 14, borderRadius: 999, background: '#fff',
          transition: 'left .2s', boxShadow: '0 1px 2px rgba(0,0,0,.2)',
        }}/>
      </span>
      <span style={{ fontSize: 13, color: 'var(--t-2)' }}>{label}</span>
    </button>
  );
}

function DifficultyPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const opts = [
    { k: 'Very Easy', c: '#D9F2DD', fg: '#0F5132' },
    { k: 'Easy',      c: '#E8F4D9', fg: '#3F5C1B' },
    { k: 'Medium',    c: '#FFE7B8', fg: '#7A4A00' },
    { k: 'Hard',      c: '#FFCCB8', fg: '#8B2A00' },
    { k: 'Very Hard', c: '#FFB3B3', fg: '#8B0000' },
  ];
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
      {opts.map(o => (
        <button
          key={o.k} type="button" onClick={() => onChange(o.k)}
          style={{
            appearance: 'none', cursor: 'pointer', border: 0,
            padding: '6px 12px', borderRadius: 999,
            fontSize: 12, fontWeight: 500,
            background: value === o.k ? o.c : 'transparent',
            color: value === o.k ? o.fg : 'var(--t-3)',
            outline: value === o.k ? 'none' : '1px solid var(--hair)',
            transition: 'all .15s',
          }}
        >{o.k}</button>
      ))}
    </div>
  );
}

function TagList({ tags, onChange, placeholder, tone = 'default' }: {
  tags: string[]; onChange: (v: string[]) => void;
  placeholder?: string; tone?: 'default' | 'err';
}) {
  const [draft, setDraft] = React.useState('');
  const add = () => {
    const v = draft.trim();
    if (!v) return;
    onChange([...(tags || []), v]);
    setDraft('');
  };
  const remove = (i: number) => onChange(tags.filter((_, j) => j !== i));
  const toneStyle: React.CSSProperties = tone === 'err'
    ? { background: '#E8423A', color: '#fff' }
    : { background: 'var(--paper-2)', color: 'var(--t-2)', border: '1px solid var(--hair)' };
  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
        <input
          value={draft} onChange={e => setDraft(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
          placeholder={placeholder} style={fieldStyle}
        />
        <button onClick={add} type="button" style={{
          appearance: 'none', border: '1px solid var(--hair)', background: '#fff', cursor: 'pointer',
          width: 40, borderRadius: 8, fontSize: 16, color: 'var(--t-2)', flexShrink: 0,
        }}>+</button>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {(tags || []).map((t, i) => (
          <span key={i} style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '6px 10px 6px 12px', borderRadius: 999, fontSize: 12,
            ...toneStyle,
          }}>
            {t}
            <button onClick={() => remove(i)} type="button" style={{
              appearance: 'none', border: 0, background: 'transparent', cursor: 'pointer',
              color: tone === 'err' ? 'rgba(255,255,255,.85)' : 'var(--t-3)',
              fontSize: 13, padding: 0, lineHeight: 1,
            }}>✕</button>
          </span>
        ))}
      </div>
    </div>
  );
}

/* ───────────────────────── Tabs ───────────────────────── */

function BasicTab({ role, update }: { role: DraftRole; update: (p: Partial<DraftRole>) => void }) {
  return (
    <div className="step-fade" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
      <Field label="JOB TITLE" required><TextIn value={role.title} onChange={v => update({ title: v })}/></Field>
      <Field label="COMPANY" required><TextIn value={role.company} onChange={v => update({ company: v })}/></Field>

      <Field label="DEPARTMENT" required half><TextIn value={role.department} onChange={v => update({ department: v })}/></Field>
      <Field label="LOCATION" required half><TextIn value={role.location} onChange={v => update({ location: v })}/></Field>

      <Field label="INDUSTRY" half><TextIn value={role.industry} onChange={v => update({ industry: v })}/></Field>
      <Field label="TYPE" half>
        <SelectIn value={role.type} onChange={v => update({ type: v })}
          options={['Full-time', 'Part-time', 'Contract', 'Temporary']}/>
      </Field>

      <Field label="LEVEL" half>
        <SelectIn value={role.level} onChange={v => update({ level: v })}
          options={['Entry', 'Mid', 'Senior', 'Lead', 'Principal', 'Director', 'VP', 'C-Level']}/>
      </Field>
      <Field label="REMOTE" half>
        <SelectIn value={role.remote} onChange={v => update({ remote: v })}
          options={['On-site', 'Hybrid', 'Remote']}/>
      </Field>

      <Field label="SIZE" half>
        <SelectIn value={role.size} onChange={v => update({ size: v })}
          options={['1-10', '11-50', '51-200', '201-500', '501-1k', '1k+']}/>
      </Field>
      <Field label="SALARY RANGE" half>
        <TextIn value={role.salary} onChange={v => update({ salary: v })} placeholder="$170K – $220K + equity"/>
      </Field>

      <Field label="WEBSITE" half>
        <TextIn value={role.website} onChange={v => update({ website: v })} placeholder="https://"/>
      </Field>
      <Field label="PRIORITY (0 = HIGHEST)" half>
        <NumIn value={role.priority} onChange={v => update({ priority: v })}/>
      </Field>

      <Field label="HIRING DIFFICULTY">
        <DifficultyPicker value={role.difficulty} onChange={v => update({ difficulty: v })}/>
      </Field>

      <div style={{
        gridColumn: 'span 2',
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14,
        paddingTop: 8, borderTop: '1px solid var(--hair)',
      }}>
        <Toggle on={role.visaSponsor}  onChange={v => update({ visaSponsor: v })}  label="Visa sponsorship"/>
        <Toggle on={role.phoneScreen}  onChange={v => update({ phoneScreen: v })}  label="Phone screening"/>
        <Toggle on={role.noDisclosure} onChange={v => update({ noDisclosure: v })} label="No disclosure"/>
        <div style={{ display: 'flex', gap: 10 }}>
          <label style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span className="mono" style={{ fontSize: 10, letterSpacing: '.2em', color: 'var(--t-3)' }}>BOUNTY $</span>
            <TextIn value={role.bounty} onChange={v => update({ bounty: v })}/>
          </label>
          <label style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span className="mono" style={{ fontSize: 10, letterSpacing: '.2em', color: 'var(--t-3)' }}>FEE %</span>
            <TextIn value={role.fee} onChange={v => update({ fee: v })} placeholder="—"/>
          </label>
        </div>
      </div>

      {role.noDisclosure && (
        <div style={{
          gridColumn: 'span 2', display: 'flex', gap: 12, padding: '12px 14px',
          background: '#FFF6D6', borderRadius: 10, border: '1px solid #E8C766',
        }}>
          <span style={{ color: '#A8860E', fontSize: 16, lineHeight: 1 }}>⚠</span>
          <div style={{ fontSize: 12, color: '#6B5300', letterSpacing: '-0.005em', lineHeight: 1.5 }}>
            <strong>Well-Known Client:</strong> You cannot disclose the company name or first contact with candidates. Violation of this policy may result in account deactivation.
          </div>
        </div>
      )}
    </div>
  );
}

function DetailsTab({ role, update }: { role: DraftRole; update: (p: Partial<DraftRole>) => void }) {
  const ta: React.CSSProperties = {
    ...fieldStyle, minHeight: 160, resize: 'vertical',
    fontFamily: 'var(--sans)', lineHeight: 1.6, padding: '12px 14px',
  };
  return (
    <div className="step-fade" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <Field label="REQUIRED SKILLS · RESPONSIBILITIES">
        <textarea value={role.requirements} onChange={e => update({ requirements: e.target.value })} style={ta}/>
      </Field>
      <Field label="ABOUT THE COMPANY">
        <textarea value={role.about} onChange={e => update({ about: e.target.value })} style={{ ...ta, minHeight: 100 }}/>
      </Field>
      <Field label="BENEFITS">
        <textarea
          value={role.benefits} onChange={e => update({ benefits: e.target.value })}
          placeholder="Equity, health, 401k, remote budget…"
          style={{ ...ta, minHeight: 80 }}
        />
      </Field>
    </div>
  );
}

function SkillsTab({ role, update }: { role: DraftRole; update: (p: Partial<DraftRole>) => void }) {
  return (
    <div className="step-fade" style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      <div>
        <div className="mono" style={{ fontSize: 10, letterSpacing: '.2em', color: 'var(--t-3)', marginBottom: 10 }}>
          REQUIRED SKILLS
        </div>
        <TagList tags={role.required} onChange={v => update({ required: v })} placeholder="Type and press Enter…"/>
      </div>
      <div>
        <div className="mono" style={{ fontSize: 10, letterSpacing: '.2em', color: 'var(--t-3)', marginBottom: 10 }}>
          NICE TO HAVE
        </div>
        <TagList tags={role.niceToHave} onChange={v => update({ niceToHave: v })} placeholder="Type and press Enter…"/>
      </div>
    </div>
  );
}

function RecruiterTab({ role, update }: { role: DraftRole; update: (p: Partial<DraftRole>) => void }) {
  return (
    <div className="step-fade" style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      <section style={{ border: '1px solid var(--hair)', borderRadius: 12, padding: 18, background: '#fff' }}>
        <div style={{
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
          gap: 12, marginBottom: 14,
        }}>
          <div>
            <div className="serif" style={{ fontSize: 21, fontStyle: 'italic', letterSpacing: '-0.01em' }}>
              Calibrate with humans you&apos;d hire
            </div>
            <div style={{
              fontSize: 13, color: 'var(--t-3)', marginTop: 6, lineHeight: 1.55,
              maxWidth: 560, fontFamily: 'var(--serif)',
            }}>
              Add LinkedIn profiles of <em>candidates you&apos;d kill to have</em> or <em>operators whose taste you trust</em>. We use them as the benchmark — not job boards, not keyword filters.
            </div>
          </div>
          <span className="chip" style={{
            background: 'var(--plum-50)', color: 'var(--plum-700)',
            fontSize: 10, letterSpacing: '.18em', padding: '4px 10px',
          }}>AI BENCHMARK</span>
        </div>
        <CalibrationList
          items={role.calibrationLinkedIns || []}
          onChange={v => update({ calibrationLinkedIns: v })}
        />
      </section>

      <div>
        <div className="mono" style={{ fontSize: 10, letterSpacing: '.2em', color: 'var(--t-3)', marginBottom: 10 }}>
          RED FLAGS TO WATCH
        </div>
        <TagList tags={role.redFlags} onChange={v => update({ redFlags: v })} placeholder="Add red flag…" tone="err"/>
      </div>

      <div>
        <div className="mono" style={{ fontSize: 10, letterSpacing: '.2em', color: 'var(--t-3)', marginBottom: 10 }}>
          SCREENING QUESTIONS
        </div>
        <TagList tags={role.screeningQs} onChange={v => update({ screeningQs: v })} placeholder="Add question…"/>
      </div>

      <div style={{ paddingTop: 18, borderTop: '1px solid var(--hair)' }}>
        <div className="mono" style={{ fontSize: 10, letterSpacing: '.2em', color: 'var(--t-3)', marginBottom: 10 }}>
          HIRING MANAGER
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
          <Field label="NAME" half>
            <TextIn value={role.hiringManager.name} onChange={v => update({ hiringManager: { ...role.hiringManager, name: v } })}/>
          </Field>
          <Field label="TITLE" half>
            <TextIn value={role.hiringManager.title} onChange={v => update({ hiringManager: { ...role.hiringManager, title: v } })}/>
          </Field>
          <Field label="LINKEDIN" half>
            <TextIn
              value={role.hiringManager.linkedin}
              onChange={v => update({ hiringManager: { ...role.hiringManager, linkedin: v } })}
              placeholder="https://..."
            />
          </Field>
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────── Calibration list ───────────────────────── */

function CalibrationList({ items, onChange }: {
  items: Calibration[]; onChange: (v: Calibration[]) => void;
}) {
  const [draftUrl, setDraftUrl] = React.useState('');
  const [draftKind, setDraftKind] = React.useState<CalibrationKind>('candidate');
  const [draftNote, setDraftNote] = React.useState('');

  const add = () => {
    if (!draftUrl.trim()) return;
    onChange([...items, { id: Date.now(), url: draftUrl.trim(), kind: draftKind, note: draftNote.trim() }]);
    setDraftUrl(''); setDraftNote(''); setDraftKind('candidate');
  };
  const remove = (id: number) => onChange(items.filter(x => x.id !== id));

  const kindLabel = (k: CalibrationKind) =>
    k === 'candidate' ? 'Top candidate' : k === 'operator' ? 'Operator I trust' : 'Recruiter I trust';
  const kindGlyph = (k: CalibrationKind) =>
    k === 'candidate' ? '◆' : k === 'operator' ? '✦' : '✶';

  return (
    <div>
      {items.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
          {items.map((it, i) => (
            <div key={it.id} style={{
              display: 'grid', gridTemplateColumns: 'auto 1fr auto',
              gap: 12, alignItems: 'center',
              padding: '12px 14px', border: '1px solid var(--hair)',
              borderRadius: 10, background: 'var(--paper)',
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: 999,
                background: 'var(--ink)', color: 'var(--paper)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--serif)', fontSize: 15, fontStyle: 'italic',
              }}>{kindGlyph(it.kind)}</div>
              <div style={{ minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
                  <span className="mono" style={{
                    fontSize: 9, letterSpacing: '.22em', color: 'var(--plum-700)',
                  }}>{kindLabel(it.kind).toUpperCase()}</span>
                  <span className="num" style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--t-4)' }}>
                    BENCHMARK · {String(i + 1).padStart(2, '0')}
                  </span>
                </div>
                <div style={{
                  fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--t-2)',
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: 3,
                }}>{it.url}</div>
                {it.note && (
                  <div style={{
                    fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 13,
                    color: 'var(--t-2)', marginTop: 5, lineHeight: 1.4,
                  }}>&ldquo;{it.note}&rdquo;</div>
                )}
              </div>
              <button onClick={() => remove(it.id)} title="Remove" style={{
                appearance: 'none', border: 0, background: 'transparent', cursor: 'pointer',
                color: 'var(--t-4)', fontSize: 18, padding: '4px 8px', lineHeight: 1,
              }}>×</button>
            </div>
          ))}
        </div>
      )}

      <div style={{
        border: '1px dashed var(--hair-strong)', borderRadius: 10,
        padding: 14, background: 'var(--paper)',
      }}>
        <div className="mono" style={{
          fontSize: 9, letterSpacing: '.22em', color: 'var(--t-3)', marginBottom: 10,
        }}>ADD A BENCHMARK</div>
        <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
          {([
            { k: 'candidate', l: 'Top candidate' },
            { k: 'operator',  l: 'Operator I trust' },
            { k: 'recruiter', l: 'Recruiter I trust' },
          ] as const).map(({ k, l }) => (
            <button
              key={k} type="button"
              onClick={() => setDraftKind(k as CalibrationKind)}
              style={{
                appearance: 'none', cursor: 'pointer',
                padding: '6px 12px', borderRadius: 999, fontSize: 12, fontWeight: 500,
                background: draftKind === k ? 'var(--ink)' : 'transparent',
                color: draftKind === k ? 'var(--paper)' : 'var(--t-3)',
                border: draftKind === k ? '1px solid var(--ink)' : '1px solid var(--hair)',
                fontFamily: 'var(--sans)',
              }}
            >{l}</button>
          ))}
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '10px 12px', border: '1px solid var(--hair)', borderRadius: 8,
          background: '#fff', marginBottom: 8,
        }}>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '.2em', color: 'var(--t-4)' }}>LINKEDIN</span>
          <input
            value={draftUrl}
            onChange={e => setDraftUrl(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
            placeholder="https://linkedin.com/in/..."
            style={{ flex: 1, border: 0, outline: 'none', fontSize: 14, background: 'transparent', fontFamily: 'var(--mono)' }}
          />
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '10px 12px', border: '1px solid var(--hair)', borderRadius: 8,
          background: '#fff', marginBottom: 10,
        }}>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '.2em', color: 'var(--t-4)' }}>WHY</span>
          <input
            value={draftNote}
            onChange={e => setDraftNote(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
            placeholder="One line: what makes this person the bar (optional)"
            style={{
              flex: 1, border: 0, outline: 'none', fontSize: 14,
              background: 'transparent', fontFamily: 'var(--serif)', fontStyle: 'italic',
            }}
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="button" onClick={add} disabled={!draftUrl.trim()}
            style={{
              appearance: 'none', border: 0,
              cursor: draftUrl.trim() ? 'pointer' : 'not-allowed',
              padding: '8px 16px', borderRadius: 999,
              background: 'var(--ink)', color: 'var(--paper)',
              fontFamily: 'var(--serif)', fontStyle: 'italic',
              fontSize: 13, letterSpacing: '-0.005em',
              opacity: draftUrl.trim() ? 1 : 0.4,
            }}
          >+ Add benchmark</button>
        </div>
      </div>
    </div>
  );
}
