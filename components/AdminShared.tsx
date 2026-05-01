'use client';

// Shared editorial primitives used by all client views.
// Migrated from AdminViews.jsx (window.AdminShared).

import * as React from 'react';

export function KpiTile({ label, value, delta, sub, big = false }: {
  label: string;
  value: React.ReactNode;
  delta?: number | null;
  sub?: React.ReactNode;
  big?: boolean;
}) {
  return (
    <div style={{ padding:'18px 22px', borderRight:'1px solid var(--hair)', flex:1, minWidth: big ? 200 : 140 }}>
      <div className="mono" style={{ fontSize:10, letterSpacing:'.16em', color:'var(--t-4)' }}>{label}</div>
      <div className="serif" style={{ fontSize: big ? 44 : 34, lineHeight:1, marginTop:8, fontStyle:'italic', letterSpacing:'-0.02em' }}>{value}</div>
      {(delta != null || sub) && (
        <div style={{ display:'flex', alignItems:'baseline', gap:8, marginTop:8 }}>
          {delta != null && (
            <span className="mono" style={{ fontSize:10, letterSpacing:'.12em', color: delta >= 0 ? 'var(--ok)' : 'var(--err)' }}>
              {delta >= 0 ? '▲' : '▼'} {Math.abs(delta)}%
            </span>
          )}
          {sub && <span className="mono" style={{ fontSize:10, letterSpacing:'.12em', color:'var(--t-4)' }}>{sub}</span>}
        </div>
      )}
    </div>
  );
}

export function SectionTitle({ num, title, sub, right }: {
  num?: string; title: React.ReactNode; sub?: React.ReactNode; right?: React.ReactNode;
}) {
  return (
    <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', gap:16, marginBottom:14 }}>
      <div style={{ display:'flex', alignItems:'baseline', gap:14, minWidth:0 }}>
        {num && <span className="mono" style={{ fontSize:10, letterSpacing:'.18em', color:'var(--t-4)' }}>{num}</span>}
        <div className="serif" style={{ fontSize:22, fontStyle:'italic', letterSpacing:'-0.01em' }}>{title}</div>
        {sub && <span className="mono" style={{ fontSize:10, letterSpacing:'.14em', color:'var(--t-4)' }}>{sub}</span>}
      </div>
      {right}
    </div>
  );
}

export function Hairline() {
  return <div style={{ height:1, background:'var(--hair)', margin:'0 0 20px' }}/>;
}

type ChipTone = 'ink' | 'paper' | 'ok' | 'warn' | 'err' | 'plum' | 'gold';
export function Chip({ tone='ink', children, italic=false }: { tone?: ChipTone; children: React.ReactNode; italic?: boolean }) {
  const tones: Record<ChipTone, { bg: string; fg: string; bd: string }> = {
    ink:   { bg:'#0A0A0B',     fg:'#F3E6CE',         bd:'transparent' },
    paper: { bg:'transparent', fg:'var(--t-2)',      bd:'var(--hair)' },
    ok:    { bg:'transparent', fg:'var(--ok)',       bd:'color-mix(in oklch, var(--ok) 35%, transparent)' },
    warn:  { bg:'transparent', fg:'#9B6700',         bd:'color-mix(in oklch, #9B6700 35%, transparent)' },
    err:   { bg:'transparent', fg:'var(--err)',      bd:'color-mix(in oklch, var(--err) 35%, transparent)' },
    plum:  { bg:'transparent', fg:'var(--plum-600)', bd:'color-mix(in oklch, var(--plum-600) 35%, transparent)' },
    gold:  { bg:'#B88858',     fg:'#fff',            bd:'transparent' },
  };
  const t = tones[tone] || tones.ink;
  return <span style={{
    display:'inline-flex', alignItems:'center', gap:6,
    padding:'3px 8px', borderRadius:999,
    background:t.bg, color:t.fg, border:`1px solid ${t.bd}`,
    fontFamily: italic ? 'var(--serif)' : 'var(--mono)', fontSize:10,
    fontStyle: italic ? 'italic' : 'normal',
    letterSpacing: italic ? '-0.01em' : '.1em',
    textTransform: italic ? 'none' : 'uppercase',
    whiteSpace:'nowrap',
  }}>{children}</span>;
}

export function HealthDot({ v }: { v: string }) {
  const c = v==='healthy' ? 'var(--ok)' : v==='at-risk' ? '#D99C1E' : v==='dormant' ? 'var(--t-4)' : 'var(--err)';
  return <span style={{ display:'inline-block', width:7, height:7, borderRadius:999, background:c, boxShadow:`0 0 0 3px color-mix(in oklch, ${c} 18%, transparent)` }}/>;
}

export function Mini({ value, max, accent='var(--ink)' }: { value: number; max: number; accent?: string }) {
  const w = Math.min(100, Math.max(0, (value/max)*100));
  return (
    <div style={{ height:3, background:'var(--hair)', borderRadius:2, overflow:'hidden', minWidth:60 }}>
      <div style={{ width: w + '%', height:'100%', background: accent }}/>
    </div>
  );
}

// Convenience legacy bundle (mirrors window.AdminShared)
export const AdminShared = { KpiTile, SectionTitle, Hairline, Chip, HealthDot, Mini };
