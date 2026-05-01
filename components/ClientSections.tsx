'use client';

// Client sections — Candidates / Recruiters / Stats / Billing
// Migrated from public/src/ClientSections.jsx with native TS imports.

import * as React from 'react';
import { ADMIN_DATA, type Candidate } from '../lib/admin-data';
import { useClientData } from './ClientViews';
import { Chip, SectionTitle, Hairline, Mini, KpiTile } from './AdminShared';
import { Icons } from './Icons';
import { emitToast } from './Toast';

/* ========================= CLIENT CANDIDATES ========================= */
export function ClientCandidates({ onCandidate }: { onCandidate?: (c: Candidate) => void }) {
  const { candidates, roles } = useClientData();
  const [q, setQ] = React.useState('');
  const [stage, setStage] = React.useState('all');
  const [roleSel, setRoleSel] = React.useState('all');

  const filtered = candidates.filter(c => {
    if (stage !== 'all' && c.stage !== stage) return false;
    if (roleSel !== 'all' && c.roleId !== roleSel) return false;
    if (q && !(c.name + ' ' + c.role + ' ' + c.current).toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="pad-mobile" style={{ padding:'40px 48px 80px', maxWidth: 1800 }}>
      <div className="masthead" style={{ marginBottom:28 }}>
        <div className="mono" style={{ fontSize:10, letterSpacing:'.22em', color:'var(--t-4)' }}>SECTION · CANDIDATES</div>
        <h1 className="serif" style={{ fontSize:'clamp(44px, 5.2vw, 60px)', fontStyle:'italic', lineHeight:1.02, letterSpacing:'-0.03em', marginTop:10 }}>
          Everyone submitted<br/><span style={{ color:'var(--t-4)' }}>for Ramp.</span>
        </h1>
      </div>

      <div className="stat-strip" style={{ display:'flex', border:'1px solid var(--hair)', borderRight:0, marginBottom:32 }}>
        <KpiTile label="TOTAL"   value={candidates.length}/>
        <KpiTile label="IN PIPE" value={candidates.filter(c=>c.stage !== 'Hired' && c.stage !== 'Rejected').length}/>
        <KpiTile label="OFFERS"  value={candidates.filter(c=>c.stage==='Offer').length}/>
        <KpiTile label="HIRED"   value={candidates.filter(c=>c.stage==='Hired').length}/>
        <KpiTile label="SAVED"   value={candidates.filter(c=>c.saved).length}/>
      </div>

      <div style={{ display:'flex', alignItems:'center', gap:18, marginBottom:22, flexWrap:'wrap' }}>
        <div style={{ display:'flex', alignItems:'center', gap:6, border:'1px solid var(--hair)', borderRadius:999, padding:'6px 12px', minWidth:260 }}>
          <Icons.Search size={14}/>
          <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search candidate, role…"
            style={{ border:0, outline:'none', background:'transparent', fontSize:13, width:'100%', fontFamily:'var(--sans)' }}/>
        </div>
        <select value={stage} onChange={e=>setStage(e.target.value)} style={{ border:'1px solid var(--hair)', borderRadius:999, padding:'6px 12px', fontSize:12, background:'#fff', fontFamily:'var(--sans)' }}>
          <option value="all">All stages</option>
          {ADMIN_DATA.stages.map(s=><option key={s} value={s}>{s}</option>)}
        </select>
        <select value={roleSel} onChange={e=>setRoleSel(e.target.value)} style={{ border:'1px solid var(--hair)', borderRadius:999, padding:'6px 12px', fontSize:12, background:'#fff', fontFamily:'var(--sans)' }}>
          <option value="all">All roles</option>
          {roles.map(r=><option key={r.id} value={r.id}>{r.title}</option>)}
        </select>
        <div className="mono" style={{ fontSize:10, letterSpacing:'.14em', color:'var(--t-4)', marginLeft:'auto' }}>{filtered.length} RESULTS</div>
      </div>

      <div style={{ border:'1px solid var(--hair)', borderRadius:2, overflow:'hidden', background:'#fff' }}>
        <div className="mono" style={{
          display:'grid', gridTemplateColumns:'70px 1.4fr 1fr 110px 1fr 110px 60px', gap:16, padding:'12px 20px',
          borderBottom:'1px solid var(--hair)', background:'color-mix(in oklch, var(--paper) 50%, #fff)',
          fontSize:10, letterSpacing:'.16em', color:'var(--t-4)',
        }}>
          <span>NO.</span><span>CANDIDATE</span><span>ROLE</span><span>STAGE</span><span>RECRUITER</span><span>SUBMITTED</span><span></span>
        </div>
        {filtered.map((c, i) => (
          <button key={c.id} onClick={()=>onCandidate && onCandidate(c)} style={{
            appearance:'none', textAlign:'left', width:'100%', border:0, background:'transparent', cursor:'pointer',
            display:'grid', gridTemplateColumns:'70px 1.4fr 1fr 110px 1fr 110px 60px', gap:16, padding:'16px 20px',
            borderBottom: i < filtered.length-1 ? '1px solid var(--hair)' : 'none', alignItems:'center',
          }}
          onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background='color-mix(in oklch, var(--plum-600) 3%, transparent)'}
          onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background='transparent'}>
            <span className="mono" style={{ fontSize:10, letterSpacing:'.12em', color:'var(--t-4)' }}>{c.num}</span>
            <div style={{ display:'flex', alignItems:'center', gap:12, minWidth:0 }}>
              <div style={{ width:32, height:32, borderRadius:999, background:'var(--ink)', color:'var(--paper)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'var(--serif)', fontStyle:'italic', fontSize:12, flexShrink:0 }}>{c.initials}</div>
              <div style={{ minWidth:0 }}>
                <div style={{ fontFamily:'var(--serif)', fontSize:16, fontStyle:'italic', letterSpacing:'-0.01em' }}>{c.name}</div>
                <div className="mono" style={{ fontSize:9, letterSpacing:'.14em', color:'var(--t-4)', marginTop:2 }}>{c.current.toUpperCase()} · {c.years}Y</div>
              </div>
            </div>
            <div style={{ fontFamily:'var(--serif)', fontSize:14, fontStyle:'italic', minWidth:0, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{c.role}</div>
            <Chip tone={c.stage==='Hired'?'ok':c.stage==='Rejected'?'err':c.stage==='Offer'?'plum':'paper'}>{c.stage.toUpperCase()}</Chip>
            <div style={{ fontFamily:'var(--serif)', fontSize:14, fontStyle:'italic' }}>{c.recruiter}</div>
            <span className="mono" style={{ fontSize:10, letterSpacing:'.14em', color:'var(--t-4)' }}>{c.submitted.toUpperCase()}</span>
            <span className="mono" style={{ fontSize:14, color:'var(--t-4)', textAlign:'right' }}>→</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ========================= CLIENT RECRUITERS ========================= */
export function ClientRecruiters() {
  const { activeRecruiters, candidates } = useClientData();
  const rows = activeRecruiters.map(r => {
    const cs = candidates.filter(c => c.recruiter === r.name);
    return {
      ...r,
      submittedForUs: cs.length,
      hiredForUs: cs.filter(c=>c.stage==='Hired').length,
      offersForUs: cs.filter(c=>c.stage==='Offer').length,
    };
  });

  return (
    <div className="pad-mobile" style={{ padding:'40px 48px 80px', maxWidth: 1800 }}>
      <div className="masthead" style={{ marginBottom:28 }}>
        <div className="mono" style={{ fontSize:10, letterSpacing:'.22em', color:'var(--t-4)' }}>SECTION · RECRUITERS</div>
        <h1 className="serif" style={{ fontSize:'clamp(44px, 5.2vw, 60px)', fontStyle:'italic', lineHeight:1.02, letterSpacing:'-0.03em', marginTop:10 }}>
          Agencies working<br/><span style={{ color:'var(--t-4)' }}>on our roles.</span>
        </h1>
        <div className="mono" style={{ fontSize:11, letterSpacing:'.14em', color:'var(--t-4)', marginTop:14 }}>
          {rows.length} ACTIVE · PERFORMANCE SCOPED TO RAMP · LAST 90 DAYS
        </div>
      </div>

      <div style={{ border:'1px solid var(--hair)', borderRadius:2, overflow:'hidden', background:'#fff' }}>
        <div className="mono recruiter-table-head" style={{
          display:'grid', gridTemplateColumns:'1.2fr 1.2fr 90px 90px 90px 1fr 80px', gap:16, padding:'14px 24px',
          borderBottom:'1px solid var(--hair)', background:'color-mix(in oklch, var(--paper) 50%, #fff)',
          fontSize:10, letterSpacing:'.16em', color:'var(--t-4)',
        }}>
          <span>RECRUITER</span><span>AGENCY</span><span>SUB</span><span>OFFER</span><span>HIRED</span><span>EFFICIENCY</span><span></span>
        </div>
        {rows.map((r, i) => {
          const efficiency = r.submittedForUs ? Math.round((r.hiredForUs / r.submittedForUs) * 100) : 0;
          return (
            <div key={r.id} className="recruiter-row" style={{
              display:'grid', gridTemplateColumns:'1.2fr 1.2fr 90px 90px 90px 1fr 80px', gap:16, padding:'18px 24px',
              borderBottom: i < rows.length-1 ? '1px solid var(--hair)' : 'none', alignItems:'center',
            }}>
              <div style={{ display:'flex', alignItems:'center', gap:12, minWidth:0 }}>
                <div style={{ width:36, height:36, borderRadius:999, background:'var(--ink)', color:'var(--paper)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'var(--serif)', fontStyle:'italic', fontSize:13, flexShrink:0 }}>
                  {r.name.split(' ').map(s=>s[0]).slice(0,2).join('')}
                </div>
                <div style={{ minWidth:0 }}>
                  <div style={{ fontFamily:'var(--serif)', fontSize:17, fontStyle:'italic', letterSpacing:'-0.01em' }}>{r.name}</div>
                  <div className="mono" style={{ fontSize:9, letterSpacing:'.14em', color:'var(--t-4)', marginTop:2 }}>{r.tier.toUpperCase()} · JOINED {r.joined.toUpperCase()}</div>
                </div>
              </div>
              <div className="recruiter-cell" style={{ fontFamily:'var(--serif)', fontSize:15, fontStyle:'italic' }}>
                <span className="recruiter-label mono">AGENCY</span>{r.org}
              </div>
              <div className="recruiter-cell mono" style={{ fontSize:13, letterSpacing:'.08em', color:'var(--t-2)' }}>
                <span className="recruiter-label">SUB</span>{r.submittedForUs}
              </div>
              <div className="recruiter-cell mono" style={{ fontSize:13, letterSpacing:'.08em', color:'var(--t-2)' }}>
                <span className="recruiter-label">OFFER</span>{r.offersForUs}
              </div>
              <div className="recruiter-cell mono" style={{ fontSize:13, letterSpacing:'.08em', color:r.hiredForUs > 0 ? 'var(--ok)' : 'var(--t-3)' }}>
                <span className="recruiter-label">HIRED</span>{r.hiredForUs}
              </div>
              <div className="recruiter-cell" style={{ display:'flex', alignItems:'center', gap:10 }}>
                <span className="recruiter-label mono">EFFICIENCY</span>
                <Mini value={efficiency} max={100} accent={efficiency > 15 ? 'var(--ok)' : 'var(--plum-600)'}/>
                <span className="mono" style={{ fontSize:10, letterSpacing:'.1em', color:'var(--t-3)' }}>{efficiency}%</span>
              </div>
              <button className="btn btn-ghost recruiter-action" style={{ padding:'6px 12px', fontSize:11 }}
                      onClick={()=>emitToast({ kind:'info', title:'Message sent to ' + r.name })}>Message</button>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop:48 }}>
        <SectionTitle num="§ 02" title="Agency roster summary"/>
        <Hairline/>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(240px, 1fr))', gap:0, border:'1px solid var(--hair)', borderRight:0 }}>
          {Array.from(new Set(rows.map(r=>r.org))).map(org => {
            const pe = rows.filter(r=>r.org===org);
            const sub = pe.reduce((s,r)=>s+r.submittedForUs,0);
            const hired = pe.reduce((s,r)=>s+r.hiredForUs,0);
            return (
              <div key={org} style={{ padding:'20px 22px', borderRight:'1px solid var(--hair)' }}>
                <div className="mono" style={{ fontSize:10, letterSpacing:'.16em', color:'var(--t-4)' }}>AGENCY</div>
                <div className="serif" style={{ fontSize:22, fontStyle:'italic', letterSpacing:'-0.01em', marginTop:6 }}>{org}</div>
                <div className="mono" style={{ fontSize:10, letterSpacing:'.14em', color:'var(--t-4)', marginTop:10 }}>
                  {pe.length} RECRUITERS · {sub} SUBMITTED · {hired} HIRED
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ========================= CLIENT STATS ========================= */
export function ClientStats() {
  const { roles, candidates } = useClientData();
  const byStage: Record<string, number> = {};
  ['New','Screening','Phone','Technical','Sent to Client','On-site','Offer','Hired','Rejected'].forEach(s => {
    byStage[s] = candidates.filter(c => c.stage === s).length;
  });

  const conversion = candidates.length
    ? Math.round((candidates.filter(c=>c.stage==='Hired').length / candidates.length) * 100)
    : 0;

  return (
    <div className="pad-mobile" style={{ padding:'40px 48px 80px', maxWidth: 1800 }}>
      <div className="masthead" style={{ marginBottom:36 }}>
        <div className="mono" style={{ fontSize:10, letterSpacing:'.22em', color:'var(--t-4)' }}>SECTION · STATS · Q4</div>
        <h1 className="serif" style={{ fontSize:'clamp(48px, 6vw, 68px)', fontStyle:'italic', lineHeight:1.02, letterSpacing:'-0.03em', marginTop:10 }}>
          How we&rsquo;re hiring.
        </h1>
      </div>

      <div className="stat-strip" style={{ display:'flex', border:'1px solid var(--hair)', borderRight:0, marginBottom:40 }}>
        <KpiTile label="ROLES OPEN"     value={roles.filter(r=>r.status==='open').length} delta={+2}/>
        <KpiTile label="TOTAL IN PIPE"  value={candidates.filter(c=>c.stage!=='Hired' && c.stage!=='Rejected').length} delta={+14}/>
        <KpiTile label="OFFERS"         value={byStage['Offer']} sub="live"/>
        <KpiTile label="HIRED"          value={byStage['Hired']} delta={+22}/>
        <KpiTile label="FUNNEL"         value={conversion + '%'} sub="sub → hire"/>
      </div>

      <div className="stack-mobile" style={{ display:'grid', gridTemplateColumns:'1.35fr 1fr', gap:48 }}>
        <div>
          <SectionTitle num="§ 01" title="Stage funnel"/>
          <Hairline/>
          <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
            {Object.keys(byStage).map((s) => {
              const v = byStage[s];
              const max = Math.max(...Object.values(byStage));
              const w = max ? (v / max) * 100 : 0;
              return (
                <div key={s} style={{ display:'grid', gridTemplateColumns:'120px 1fr 40px', alignItems:'center', gap:14, padding:'10px 0', borderBottom:'1px solid var(--hair)' }}>
                  <div style={{ fontFamily:'var(--serif)', fontSize:16, fontStyle:'italic' }}>{s}</div>
                  <div style={{ height:26, background:'var(--hair)', position:'relative', borderRadius:2, overflow:'hidden' }}>
                    <div style={{ width: w+'%', height:'100%', background: s==='Hired'?'var(--ok)':s==='Rejected'?'var(--err)':s==='Offer'?'var(--plum-600)':'var(--ink)' }}/>
                  </div>
                  <div className="mono" style={{ fontSize:12, letterSpacing:'.1em', color:'var(--t-2)', textAlign:'right' }}>{v}</div>
                </div>
              );
            })}
          </div>

          <div style={{ marginTop:48 }}>
            <SectionTitle num="§ 02" title="Role health"/>
            <Hairline/>
            <div style={{ border:'1px solid var(--hair)', background:'#fff' }}>
              {roles.map((r, i) => {
                const age = r.age || 10;
                const health = age > 40 ? 'at-risk' : age > 25 ? 'warn' : 'healthy';
                return (
                  <div key={r.id} style={{
                    display:'grid', gridTemplateColumns:'1.5fr 60px 80px 80px 80px', gap:14, padding:'14px 20px',
                    borderBottom: i < roles.length-1 ? '1px solid var(--hair)' : 'none', alignItems:'center',
                  }}>
                    <div>
                      <div style={{ fontFamily:'var(--serif)', fontSize:15, fontStyle:'italic', letterSpacing:'-0.01em' }}>{r.title}</div>
                      <div className="mono" style={{ fontSize:9, letterSpacing:'.14em', color:'var(--t-4)', marginTop:2 }}>{r.num}</div>
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                      <span style={{ display:'inline-block', width:7, height:7, borderRadius:999,
                        background: health==='healthy'?'var(--ok)':health==='warn'?'#D99C1E':'var(--err)' }}/>
                      <span className="mono" style={{ fontSize:9, letterSpacing:'.12em', color:'var(--t-3)' }}>{health.toUpperCase()}</span>
                    </div>
                    <div className="mono" style={{ fontSize:11, letterSpacing:'.1em', color:'var(--t-3)' }}>{age}d old</div>
                    <div className="mono" style={{ fontSize:11, letterSpacing:'.1em', color:'var(--t-3)' }}>{r.candidates} cands</div>
                    <div className="mono" style={{ fontSize:11, letterSpacing:'.1em', color:'var(--t-3)' }}>TTA {r.tta}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div>
          <SectionTitle num="§ 03" title="Source mix"/>
          <Hairline/>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {Array.from(new Set(candidates.map(c=>c.source))).map(src => {
              const n = candidates.filter(c=>c.source===src).length;
              const pct = candidates.length ? Math.round((n/candidates.length)*100) : 0;
              return (
                <div key={src} style={{ padding:'10px 0', borderBottom:'1px solid var(--hair)' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:6 }}>
                    <span style={{ fontFamily:'var(--serif)', fontSize:15, fontStyle:'italic' }}>{src}</span>
                    <span className="mono" style={{ fontSize:11, letterSpacing:'.1em', color:'var(--t-3)' }}>{n} · {pct}%</span>
                  </div>
                  <div style={{ height:3, background:'var(--hair)' }}>
                    <div style={{ width: pct+'%', height:'100%', background:'var(--ink)' }}/>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ marginTop:48 }}>
            <SectionTitle num="§ 04" title="Notes"/>
            <Hairline/>
            <div className="serif" style={{ fontSize:17, fontStyle:'italic', lineHeight:1.45, color:'var(--t-2)', borderLeft:'3px solid var(--plum-600)', paddingLeft:16 }}>
              Staff iOS and Senior Platform are your strongest pipes — together they represent 62% of offers out. Consider consolidating recruiter attention there.
            </div>
            <div className="mono" style={{ fontSize:10, letterSpacing:'.14em', color:'var(--t-4)', marginTop:12 }}>
              GENERATED BY UPNEST · 2 MIN AGO
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ========================= CLIENT BILLING ========================= */
export function ClientBilling() {
  const invoices = [
    { id:'inv-04129', date:'Nov 01', amount:'$18,400', status:'paid',    desc:'Platform · Enterprise (42 seats)' },
    { id:'inv-04121', date:'Oct 28', amount:'$42,000', status:'paid',    desc:'Placement fee · Staff iOS Engineer · via Jesse Dragstra' },
    { id:'inv-04108', date:'Oct 15', amount:'$38,500', status:'paid',    desc:'Placement fee · Senior Platform Engineer · via Mira Holt' },
    { id:'inv-04097', date:'Oct 01', amount:'$18,400', status:'paid',    desc:'Platform · Enterprise (42 seats)' },
    { id:'inv-04082', date:'Sep 24', amount:'$24,000', status:'paid',    desc:'Placement fee · Engineering Manager · via Noor Salim' },
    { id:'inv-04075', date:'Nov 14', amount:'$45,000', status:'pending', desc:'Placement fee · Staff Compiler (pending countersign)' },
  ];
  const paid = invoices.filter(i=>i.status==='paid').reduce((s,i)=>s + parseInt(i.amount.replace(/[^0-9]/g,'')), 0);
  const pending = invoices.filter(i=>i.status==='pending').reduce((s,i)=>s + parseInt(i.amount.replace(/[^0-9]/g,'')), 0);

  return (
    <div className="pad-mobile" style={{ padding:'40px 48px 80px', maxWidth: 1800 }}>
      <div className="masthead" style={{ marginBottom:28 }}>
        <div className="mono" style={{ fontSize:10, letterSpacing:'.22em', color:'var(--t-4)' }}>SECTION · BILLING</div>
        <h1 className="serif" style={{ fontSize:'clamp(44px, 5.2vw, 60px)', fontStyle:'italic', lineHeight:1.02, letterSpacing:'-0.03em', marginTop:10 }}>
          Contracts &amp; invoices.
        </h1>
      </div>

      <div className="stat-strip" style={{ display:'flex', border:'1px solid var(--hair)', borderRight:0, marginBottom:40 }}>
        <KpiTile label="PLATFORM"     value="$18.4k" sub="/month · Enterprise"/>
        <KpiTile label="PAID YTD"     value={'$' + (paid/1000).toFixed(0) + 'k'}/>
        <KpiTile label="OUTSTANDING"  value={'$' + (pending/1000).toFixed(0) + 'k'} sub="1 invoice"/>
        <KpiTile label="STANDARD FEE" value="22%" sub="of first-year base"/>
      </div>

      <div className="stack-mobile" style={{ display:'grid', gridTemplateColumns:'1.4fr 1fr', gap:48 }}>
        <div>
          <SectionTitle num="§ 01" title="Invoices" right={<button className="btn btn-ghost" style={{ padding:'6px 12px', fontSize:11 }}>Export all</button>}/>
          <Hairline/>
          <div style={{ border:'1px solid var(--hair)', background:'#fff' }}>
            {invoices.map((inv, i) => (
              <div key={inv.id} style={{
                display:'grid', gridTemplateColumns:'100px 80px 1fr 120px 90px', gap:14, padding:'16px 20px',
                borderBottom: i < invoices.length-1 ? '1px solid var(--hair)' : 'none', alignItems:'center',
              }}>
                <span className="mono" style={{ fontSize:10, letterSpacing:'.14em', color:'var(--t-4)' }}>{inv.id.toUpperCase()}</span>
                <span className="mono" style={{ fontSize:11, letterSpacing:'.1em', color:'var(--t-2)' }}>{inv.date}</span>
                <span style={{ fontFamily:'var(--serif)', fontSize:14, fontStyle:'italic', lineHeight:1.3 }}>{inv.desc}</span>
                <span style={{ fontFamily:'var(--serif)', fontSize:17, fontStyle:'italic' }}>{inv.amount}</span>
                <Chip tone={inv.status==='paid' ? 'ok' : 'warn'}>{inv.status.toUpperCase()}</Chip>
              </div>
            ))}
          </div>
        </div>

        <div>
          <SectionTitle num="§ 02" title="Active contracts"/>
          <Hairline/>
          <div style={{ border:'1px solid var(--hair)', padding:'20px 22px', marginBottom:14, background:'#fff' }}>
            <div className="mono" style={{ fontSize:10, letterSpacing:'.14em', color:'var(--t-4)' }}>PLATFORM · MSA</div>
            <div className="serif" style={{ fontSize:22, fontStyle:'italic', letterSpacing:'-0.01em', marginTop:6 }}>Enterprise · v4.2</div>
            <div className="mono" style={{ fontSize:10, letterSpacing:'.14em', color:'var(--t-4)', marginTop:10 }}>
              COUNTERSIGNED · MAR 14, 2024 · RENEWS MAR 2026
            </div>
            <div style={{ display:'flex', gap:8, marginTop:14 }}>
              <button className="btn btn-ghost" style={{ padding:'8px 14px', fontSize:12 }}>View PDF</button>
              <button className="btn btn-ghost" style={{ padding:'8px 14px', fontSize:12 }}>Amendments</button>
            </div>
          </div>

          <div style={{ border:'1px solid var(--hair)', padding:'20px 22px', background:'#fff' }}>
            <div className="mono" style={{ fontSize:10, letterSpacing:'.14em', color:'var(--t-4)' }}>AGENCY · PLACEMENT</div>
            <div className="serif" style={{ fontSize:22, fontStyle:'italic', letterSpacing:'-0.01em', marginTop:6 }}>Standard terms · 22%</div>
            <div className="mono" style={{ fontSize:10, letterSpacing:'.14em', color:'var(--t-4)', marginTop:10 }}>
              APPLIES TO: 4 AGENCIES · 90 DAY GUARANTEE
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
