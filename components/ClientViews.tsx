'use client';

// Client views — Overview / Roles
// Migrated from public/src/ClientViews.jsx with native TS imports.

import * as React from 'react';
import { type RoleRow, type Candidate, type Recruiter } from '../lib/admin-data';
import { useClientDataFromDB } from '../lib/data-hooks';
import { KpiTile, SectionTitle, Hairline, Chip, Mini } from './AdminShared';
import { Icons } from './Icons';

// ------- scoped data hook -------
export function useClientData() {
  const data = useClientDataFromDB();
  
  return { 
    orgName: data.orgName || 'Your Company',
    roles: data.roles, 
    candidates: data.candidates, 
    activeRecruiters: data.activeRecruiters, 
    submittals: [],
    myActivity: [],
    all: data.all,
    isLoading: data.isLoading,
    error: data.error,
  };
}

/* ========================= CLIENT OVERVIEW ========================= */
export function ClientOverview({ onNavigate, onOpenRole }: {
  onNavigate?: (k: string) => void;
  onOpenRole?: (r: RoleRow) => void;
}) {
  const { roles, candidates, activeRecruiters } = useClientData();
  const openRoles = roles.filter(r => r.status === 'open').length;
  const focusedRoles = roles.filter(r => r.focused).length;
  const hired = candidates.filter(c => c.stage === 'Hired').length;
  const inPipe = candidates.filter(c => c.stage !== 'Hired' && c.stage !== 'Rejected').length;

  return (
    <div className="pad-mobile" style={{ padding:'40px 48px 80px', maxWidth: 1800 }}>
      {/* masthead */}
      <div className="masthead" style={{ marginBottom:36 }}>
        <div className="mono" style={{ fontSize:10, letterSpacing:'.22em', color:'var(--t-4)' }}>
          VOL. 04 · TUESDAY · {new Date().toLocaleDateString('en-US', { month:'long', day:'numeric' }).toUpperCase()}
        </div>
        <h1 className="serif" style={{ fontSize:'clamp(48px, 6vw, 68px)', fontStyle:'italic', lineHeight:1, letterSpacing:'-0.03em', marginTop:10, maxWidth:960 }}>
          Good morning, Catherine.<br/><span style={{ color:'var(--t-4)' }}>{inPipe} candidates are<br/>in motion.</span>
        </h1>
        <div className="mono" style={{ fontSize:11, letterSpacing:'.14em', color:'var(--t-4)', marginTop:14 }}>
          {openRoles} OPEN ROLES · {activeRecruiters.length} AGENCIES ENGAGED · NEXT REVIEW · FRIDAY 3PM
        </div>
      </div>

      {/* KPI strip */}
      <div className="stat-strip" style={{ display:'flex', border:'1px solid var(--hair)', borderRight:0, marginBottom:40 }}>
        <KpiTile label="OPEN ROLES" value={openRoles} delta={+2} sub={focusedRoles + ' focused'}/>
        <KpiTile label="IN PIPE"    value={inPipe}    delta={+14} sub="this week"/>
        <KpiTile label="OFFERS OUT" value={candidates.filter(c=>c.stage==='Offer').length} sub="2 accepted"/>
        <KpiTile label="HIRED YTD" value={hired + 7} delta={+22} sub="vs LY"/>
        <KpiTile label="AVG TTA"   value="14d" delta={-8} sub="target 18d"/>
      </div>

      {/* grid */}
      <div className="stack-mobile" style={{ display:'grid', gridTemplateColumns:'1.35fr 1fr', gap:48 }}>
        <div>
          <SectionTitle num="§ 01" title="Focused roles" sub="PRIORITY QUEUE"
            right={<button className="btn btn-ghost" onClick={()=>onNavigate && onNavigate('roles')} style={{ padding:'6px 12px', fontSize:11 }}>All roles →</button>}/>
          <Hairline/>
          <div style={{ display:'flex', flexDirection:'column' }}>
            {roles.filter(r => r.focused || r.status === 'open').slice(0, 5).map((r) => (
              <button key={r.id} onClick={()=>onOpenRole && onOpenRole(r)} style={{
                appearance:'none', textAlign:'left', width:'100%', border:0, background:'transparent', cursor:'pointer',
                display:'grid', gridTemplateColumns:'70px 1fr auto auto', gap:18, alignItems:'center',
                padding:'16px 4px', borderBottom:'1px solid var(--hair)',
              }}
              onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background='color-mix(in oklch, var(--plum-600) 4%, transparent)'}
              onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background='transparent'}>
                <span className="mono" style={{ fontSize:10, letterSpacing:'.12em', color:'var(--t-4)' }}>{r.num}</span>
                <div style={{ minWidth:0 }}>
                  <div style={{ display:'flex', alignItems:'baseline', gap:10 }}>
                    <div className="serif" style={{ fontSize:19, fontStyle:'italic', letterSpacing:'-0.01em' }}>{r.title}</div>
                    {r.focused && <Chip tone="plum">FOCUSED</Chip>}
                    {r.confidential && <Chip tone="paper">CONFIDENTIAL</Chip>}
                  </div>
                  <div className="mono" style={{ fontSize:10, letterSpacing:'.14em', color:'var(--t-4)', marginTop:4 }}>
                    {r.location.toUpperCase()} · {r.workMode.toUpperCase()} · {r.salary} · {r.recruiters} RECRUITERS · OPENED {r.opened.toUpperCase()}
                  </div>
                </div>
                <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:4 }}>
                  <div className="mono" style={{ fontSize:11, letterSpacing:'.12em', color:'var(--t-2)' }}>
                    {r.candidates} <span style={{ color:'var(--t-4)' }}>CANDS</span>
                  </div>
                  <Mini value={r.candidates} max={90} accent="var(--plum-600)"/>
                </div>
                <div className="mono" style={{ fontSize:14, color:'var(--t-4)' }}>→</div>
              </button>
            ))}
          </div>

          <div style={{ marginTop:48 }}>
            <SectionTitle num="§ 02" title="Recruiters on your roles"
              right={<button className="btn btn-ghost" onClick={()=>onNavigate && onNavigate('recruiters')} style={{ padding:'6px 12px', fontSize:11 }}>All →</button>}/>
            <Hairline/>
            <div style={{ display:'flex', flexDirection:'column' }}>
              {activeRecruiters.slice(0, 4).map(r => (
                <div key={r.id} style={{
                  display:'grid', gridTemplateColumns:'36px 1fr auto auto', gap:16, alignItems:'center',
                  padding:'14px 0', borderBottom:'1px solid var(--hair)',
                }}>
                  <div style={{ width:32, height:32, borderRadius:999, background:'var(--ink)', color:'var(--paper)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'var(--serif)', fontStyle:'italic', fontSize:13 }}>
                    {r.name.split(' ').map(s=>s[0]).slice(0,2).join('')}
                  </div>
                  <div style={{ minWidth:0 }}>
                    <div style={{ fontFamily:'var(--serif)', fontSize:17, fontStyle:'italic', letterSpacing:'-0.01em' }}>{r.name}</div>
                    <div className="mono" style={{ fontSize:10, letterSpacing:'.14em', color:'var(--t-4)', marginTop:2 }}>
                      {r.org.toUpperCase()} · {r.tier.toUpperCase()}
                    </div>
                  </div>
                  <div className="mono" style={{ fontSize:11, letterSpacing:'.12em', color:'var(--t-2)' }}>{r.submitted} <span style={{ color:'var(--t-4)' }}>SUB</span></div>
                  <div className="mono" style={{ fontSize:11, letterSpacing:'.12em', color:'var(--t-2)' }}>{r.placed} <span style={{ color:'var(--t-4)' }}>PLACED</span></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* right col: live pipeline + latest cands */}
        <div>
          <SectionTitle num="§ 03" title="Pipeline across Ramp"/>
          <Hairline/>
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            {['New','Screening','Phone','Technical','Sent to Client','On-site','Offer','Hired'].map((s, i) => {
              const total = candidates.filter(c => c.stage === s).length;
              const pct = candidates.length ? (total / candidates.length) * 100 : 0;
              return (
                <div key={s} style={{ display:'grid', gridTemplateColumns:'110px 1fr 30px', gap:14, alignItems:'center', padding:'6px 0', borderBottom: i < 7 ? '1px solid var(--hair)' : 'none' }}>
                  <div style={{ fontFamily:'var(--serif)', fontSize:15, fontStyle:'italic' }}>{s}</div>
                  <div style={{ height:4, background:'var(--hair)', borderRadius:2, overflow:'hidden' }}>
                    <div style={{ width: pct+'%', height:'100%', background: s==='Hired' ? 'var(--ok)' : s==='Offer' ? 'var(--plum-600)' : 'var(--ink)' }}/>
                  </div>
                  <div className="mono" style={{ fontSize:11, letterSpacing:'.1em', color:'var(--t-3)', textAlign:'right' }}>{total}</div>
                </div>
              );
            })}
          </div>

          <div style={{ marginTop:40 }}>
            <SectionTitle num="§ 04" title="Latest submissions"/>
            <Hairline/>
            <div style={{ display:'flex', flexDirection:'column' }}>
              {candidates.slice(0, 5).map(c => (
                <div key={c.id} style={{ padding:'12px 0', borderBottom:'1px solid var(--hair)' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', gap:10 }}>
                    <div style={{ fontFamily:'var(--serif)', fontSize:16, fontStyle:'italic', letterSpacing:'-0.01em' }}>{c.name}</div>
                    <Chip tone={c.stage==='Hired'?'ok':c.stage==='Rejected'?'err':c.stage==='Offer'?'plum':'paper'}>{c.stage.toUpperCase()}</Chip>
                  </div>
                  <div className="mono" style={{ fontSize:10, letterSpacing:'.14em', color:'var(--t-4)', marginTop:3 }}>
                    {c.role.toUpperCase()} · VIA {c.recruiter.split(' ')[0].toUpperCase()} · {c.submitted.toUpperCase()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ========================= CLIENT ROLES ========================= */
export function ClientRoles({ onOpenRole, onSubmit }: {
  onOpenRole?: (r: RoleRow) => void;
  onSubmit?: () => void;
}) {
  const { roles } = useClientData();
  const [status, setStatus] = React.useState<'all'|'open'|'paused'>('all');
  const [q, setQ] = React.useState('');

  const filtered = roles.filter(r => {
    if (status !== 'all' && r.status !== status) return false;
    if (q && !(r.title + ' ' + r.location).toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="pad-mobile" style={{ padding:'40px 48px 80px', maxWidth: 1800 }}>
      <div className="masthead" style={{ marginBottom:28 }}>
        <div className="mono" style={{ fontSize:10, letterSpacing:'.22em', color:'var(--t-4)' }}>SECTION · YOUR ROLES</div>
        <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', gap:24, flexWrap:'wrap', marginTop:10 }}>
          <h1 className="serif" style={{ fontSize:'clamp(44px, 5.2vw, 60px)', fontStyle:'italic', lineHeight:1.02, letterSpacing:'-0.03em' }}>
            Every seat we&rsquo;re hiring for.
          </h1>
          <button className="btn btn-primary" onClick={onSubmit} style={{ padding:'12px 20px' }}>+ Submit a role</button>
        </div>
      </div>

      <div style={{ display:'flex', alignItems:'center', gap:18, marginBottom:22, flexWrap:'wrap' }}>
        <div style={{ display:'flex', alignItems:'center', gap:6, border:'1px solid var(--hair)', borderRadius:999, padding:'6px 12px', minWidth:260 }}>
          <Icons.Search size={14}/>
          <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search role, location…"
            style={{ border:0, outline:'none', background:'transparent', fontSize:13, width:'100%', fontFamily:'var(--sans)' }}/>
        </div>
        <div style={{ display:'flex', gap:4 }}>
          {(['all','open','paused'] as const).map(s => (
            <button key={s} onClick={()=>setStatus(s)} style={{
              appearance:'none', border: status===s ? '1px solid var(--ink)' : '1px solid var(--hair)',
              background: status===s ? 'var(--ink)' : 'transparent',
              color: status===s ? 'var(--paper)' : 'var(--t-2)',
              padding:'6px 14px', borderRadius:999, fontSize:11, cursor:'pointer',
              fontFamily:'var(--mono)', letterSpacing:'.12em', textTransform:'uppercase',
            }}>{s}</button>
          ))}
        </div>
        <div className="mono" style={{ fontSize:10, letterSpacing:'.14em', color:'var(--t-4)', marginLeft:'auto' }}>{filtered.length} RESULTS</div>
      </div>

      {/* list */}
      <div style={{ border:'1px solid var(--hair)', borderRadius:2, overflow:'hidden', background:'#fff' }}>
        {filtered.map((r, i) => (
          <button key={r.id} onClick={()=>onOpenRole && onOpenRole(r)} style={{
            appearance:'none', textAlign:'left', width:'100%', border:0, background:'transparent', cursor:'pointer',
            display:'grid', gridTemplateColumns:'70px 2fr 1fr 140px 100px 80px 60px', gap:16, padding:'20px 24px',
            borderBottom: i < filtered.length-1 ? '1px solid var(--hair)' : 'none', alignItems:'center',
          }}
          onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background='color-mix(in oklch, var(--plum-600) 3%, transparent)'}
          onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background='transparent'}>
            <span className="mono" style={{ fontSize:10, letterSpacing:'.12em', color:'var(--t-4)' }}>{r.num}</span>
            <div style={{ minWidth:0 }}>
              <div style={{ display:'flex', alignItems:'baseline', gap:10, flexWrap:'wrap' }}>
                <div className="serif" style={{ fontSize:20, fontStyle:'italic', letterSpacing:'-0.01em' }}>{r.title}</div>
                {r.focused && <Chip tone="plum">FOCUSED</Chip>}
                {r.priority==='high' && <Chip tone="warn">HIGH PRIORITY</Chip>}
                {r.status==='paused' && <Chip tone="paper">ON HOLD</Chip>}
              </div>
              <div className="mono" style={{ fontSize:10, letterSpacing:'.14em', color:'var(--t-4)', marginTop:4 }}>
                {r.location.toUpperCase()} · {r.workMode.toUpperCase()} · OPENED {r.opened.toUpperCase()}
              </div>
            </div>
            <div>
              <div style={{ fontFamily:'var(--serif)', fontStyle:'italic', fontSize:15 }}>{r.salary}</div>
              <div className="mono" style={{ fontSize:10, letterSpacing:'.14em', color:'var(--t-4)', marginTop:2 }}>FEE {r.fee}</div>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
              <div className="mono" style={{ fontSize:10, letterSpacing:'.14em', color:'var(--t-4)' }}>PIPELINE</div>
              <div style={{ display:'flex', gap:2, height:4, background:'var(--hair)' }}>
                {(['New','Screening','Phone','Technical','SentToClient','OnSite','Offer','Hired'] as const).map(stg => {
                  const v = (r.pipeline as any)?.[stg] || 0;
                  return <div key={stg} style={{ flex:v, height:'100%', background: stg==='Hired'?'var(--ok)':stg==='Offer'?'var(--plum-600)':'var(--ink)' }}/>;
                })}
              </div>
            </div>
            <div className="mono" style={{ fontSize:12, letterSpacing:'.1em', color:'var(--t-2)' }}>{r.candidates} cands</div>
            <div className="mono" style={{ fontSize:11, letterSpacing:'.12em', color:'var(--t-3)' }}>{r.recruiters} rec.</div>
            <div className="mono" style={{ fontSize:14, color:'var(--t-4)', textAlign:'right' }}>→</div>
          </button>
        ))}
      </div>
    </div>
  );
}
