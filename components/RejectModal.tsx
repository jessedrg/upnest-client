'use client';

// RejectWithdrawModal — collects a structured reason + optional note before
// either rejecting (client/admin action) or withdrawing (recruiter action) a candidate.
//
// Usage: open via the imperative API:
//   import { openRejectModal } from '@/components/RejectModal';
//   openRejectModal({ candidate, actor, mode: 'reject' | 'withdraw' });

import * as React from 'react';
import { REJECT_REASONS, WITHDRAW_REASONS, reject as rejectCandidate, withdraw as withdrawCandidate, type ReasonRow } from '../lib/candidate-store';
import type { Candidate } from '../lib/admin-data';

type Mode = 'reject' | 'withdraw';
type OpenArgs = {
  candidate: Candidate;
  actor?: { name: string; role: string };
  mode?: Mode;
};

let openImpl: ((args: OpenArgs) => void) | null = null;

export function openRejectModal(args: OpenArgs) {
  if (openImpl) openImpl(args);
}

export function RejectModal() {
  const [open, setOpen]   = React.useState(false);
  const [c, setC]         = React.useState<Candidate | null>(null);
  const [actor, setActor] = React.useState<{ name: string; role: string } | null>(null);
  const [mode, setMode]   = React.useState<Mode>('reject');
  const [code, setCode]   = React.useState<string>('not_qualified');
  const [note, setNote]   = React.useState<string>('');

  React.useEffect(() => {
    openImpl = ({ candidate, actor, mode }) => {
      const m: Mode = mode === 'withdraw' ? 'withdraw' : 'reject';
      setC(candidate);
      setActor(actor || null);
      setMode(m);
      setCode(m === 'withdraw' ? 'candidate_withdrew' : 'not_qualified');
      setNote('');
      setOpen(true);
    };
    return () => { openImpl = null; };
  }, []);

  if (!open || !c) return null;

  const isWithdraw = mode === 'withdraw';
  const REASONS: ReasonRow[] = isWithdraw ? WITHDRAW_REASONS : REJECT_REASONS;
  const selected = REASONS.find(r => r.code === code) || REASONS[0];
  const accent = isWithdraw ? 'var(--ink)' : 'var(--err)';

  const submit = () => {
    if (code === 'other' && !note.trim()) return;
    if (isWithdraw) {
      withdrawCandidate(c.id, code, note, actor || undefined);
    } else {
      rejectCandidate(c.id, code, note, actor || undefined);
    }
    setOpen(false);
  };

  const close = () => setOpen(false);

  const groups = isWithdraw
    ? [
        { label: 'Candidate-side',   items: REASONS.filter(r => r.tone === 'candidate') },
        { label: 'Recruiter-side',   items: REASONS.filter(r => r.tone === 'recruiter') },
        { label: 'Logistics',        items: REASONS.filter(r => r.tone === 'logistic') },
      ]
    : [
        { label: 'Fit & evaluation', items: REASONS.filter(r => r.tone === 'fit') },
        { label: 'Logistics',        items: REASONS.filter(r => r.tone === 'logistic') },
        { label: 'Withdrew',         items: REASONS.filter(r => r.tone === 'withdraw') },
      ];

  const headerLabel = isWithdraw ? '§ WITHDRAW CANDIDATE' : '§ REJECT CANDIDATE';
  const headerHeadline = isWithdraw
    ? <>Why are you pulling <em style={{ color:'var(--t-2)' }}>{c.name}</em> from the pipeline?</>
    : <>Why are you rejecting <em style={{ color:'var(--t-2)' }}>{c.name}</em>?</>;
  const headerSub = isWithdraw
    ? "Visible to the client team — they'll see this candidate as withdrawn with the reason below. Pipeline decisions stay with them."
    : 'Visible to your team — and to the client if this candidate was sent. Pick a reason; add detail if it helps.';
  const confirmLabel = isWithdraw ? 'Confirm withdrawal' : 'Confirm rejection';

  return (
    <React.Fragment>
      <div onClick={close} style={{
        position:'fixed', inset:0, background:'rgba(20,10,40,.45)', zIndex:80,
        backdropFilter:'blur(2px)',
        animation:'fadeIn .18s ease-out',
      }}/>

      <div style={{
        position:'fixed', top:'50%', left:'50%', transform:'translate(-50%,-50%)',
        width:'min(560px, 94vw)', maxHeight:'90vh', overflowY:'auto',
        background:'var(--paper)', border:'1px solid var(--hair-strong)',
        borderRadius:14, zIndex:81,
        boxShadow:'0 30px 80px rgba(20,10,40,.25)',
        animation:'rmIn .22s cubic-bezier(.2,.7,.2,1)',
      }}>
        <div style={{
          padding:'22px 28px 14px', borderBottom:'1px solid var(--hair)',
          display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:16,
        }}>
          <div style={{ minWidth:0 }}>
            <div className="mono" style={{ fontSize:10, letterSpacing:'.22em', color:accent, marginBottom:8 }}>
              {headerLabel}
            </div>
            <div className="serif" style={{ fontSize:24, letterSpacing:'-0.02em', lineHeight:1.15 }}>
              {headerHeadline}
            </div>
            <div style={{ fontSize:12, color:'var(--t-3)', marginTop:6, fontFamily:'var(--serif)', fontStyle:'italic' }}>
              {headerSub}
            </div>
          </div>
          <button onClick={close} style={{
            appearance:'none', border:'1px solid var(--hair)', background:'#fff',
            width:30, height:30, borderRadius:999, cursor:'pointer',
            fontSize:14, color:'var(--t-3)', display:'flex', alignItems:'center', justifyContent:'center',
            flexShrink:0,
          }}>×</button>
        </div>

        <div style={{ padding:'18px 28px 6px' }}>
          {groups.map((g, gi) => (
            <div key={g.label} style={{ marginBottom: gi === groups.length - 1 ? 4 : 18 }}>
              <div className="mono" style={{ fontSize:9, letterSpacing:'.22em', color:'var(--t-4)', marginBottom:8 }}>
                {g.label.toUpperCase()}
              </div>
              <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                {g.items.map(r => {
                  const active = code === r.code;
                  return (
                    <button key={r.code} onClick={() => setCode(r.code)} style={{
                      appearance:'none', cursor:'pointer',
                      border: active ? `1px solid ${accent}` : '1px solid var(--hair)',
                      background: active ? accent : '#fff',
                      color: active ? '#fff' : 'var(--t-2)',
                      padding:'8px 14px', borderRadius:999,
                      fontFamily:'var(--sans)', fontSize:13,
                      transition:'all .15s',
                    }}>
                      {r.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {selected && (
          <div style={{
            margin:'4px 28px 16px', padding:'12px 14px',
            border:'1px dashed var(--hair-strong)', borderRadius:8,
            background:'#fff',
            display:'flex', gap:10, alignItems:'flex-start',
          }}>
            <span style={{ width:7, height:7, borderRadius:999, background:accent, marginTop:7, flexShrink:0 }}/>
            <div>
              <div className="mono" style={{ fontSize:9, letterSpacing:'.18em', color:'var(--t-4)', marginBottom:3 }}>SELECTED REASON</div>
              <div style={{ fontFamily:'var(--serif)', fontSize:14, fontStyle:'italic', color:'var(--t-2)' }}>
                {selected.label} — <span style={{ color:'var(--t-3)' }}>{selected.detail}</span>
              </div>
            </div>
          </div>
        )}

        <div style={{ padding:'0 28px 8px' }}>
          <div style={{ display:'flex', alignItems:'baseline', justifyContent:'space-between', marginBottom:6 }}>
            <label className="mono" style={{ fontSize:9, letterSpacing:'.22em', color:'var(--t-4)' }}>
              ADDITIONAL CONTEXT {code === 'other' ? <span style={{ color:'var(--err)' }}>· REQUIRED</span> : <span style={{ color:'var(--t-4)' }}>· OPTIONAL</span>}
            </label>
            <span className="mono" style={{ fontSize:9, color:'var(--t-4)' }}>{note.length}/280</span>
          </div>
          <textarea
            value={note}
            onChange={e => setNote(e.target.value.slice(0, 280))}
            placeholder={code === 'other'
              ? 'Tell us what happened…'
              : 'Optional: specifics to share with the team. e.g. "Asked $240k base, role caps at $210k."'}
            rows={3}
            style={{
              width:'100%', resize:'vertical',
              border:'1px solid var(--hair)', borderRadius:8,
              padding:'10px 12px',
              fontFamily:'var(--sans)', fontSize:13, color:'var(--t-1)',
              background:'#fff', outline:'none',
              lineHeight:1.5,
            }}
            onFocus={e => e.target.style.borderColor = accent}
            onBlur={e => e.target.style.borderColor = 'var(--hair)'}
          />
        </div>

        <div style={{
          padding:'14px 28px 22px',
          display:'flex', justifyContent:'space-between', alignItems:'center', gap:10,
        }}>
          <div style={{ fontSize:11, color:'var(--t-4)', fontFamily:'var(--serif)', fontStyle:'italic' }}>
            {isWithdraw
              ? 'You can re-submit this candidate later if circumstances change.'
              : "You can un-reject later from the candidate's profile."}
          </div>
          <div style={{ display:'flex', gap:8 }}>
            <button onClick={close} className="btn btn-ghost" style={{ padding:'9px 14px', fontSize:13 }}>
              Cancel
            </button>
            <button onClick={submit}
              disabled={code === 'other' && !note.trim()}
              style={{
                appearance:'none', cursor: (code === 'other' && !note.trim()) ? 'not-allowed' : 'pointer',
                border: `1px solid ${accent}`,
                background: (code === 'other' && !note.trim()) ? 'var(--paper-2)' : accent,
                color: (code === 'other' && !note.trim()) ? 'var(--t-3)' : '#fff',
                padding:'10px 18px', borderRadius:999,
                fontFamily:'var(--sans)', fontSize:13, fontWeight:500,
                opacity: (code === 'other' && !note.trim()) ? .55 : 1,
                transition:'opacity .15s',
              }}>
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
        @keyframes rmIn  { from { opacity:0; transform:translate(-50%,-48%) scale(.97); } to { opacity:1; transform:translate(-50%,-50%) scale(1); } }
      `}</style>
    </React.Fragment>
  );
}
