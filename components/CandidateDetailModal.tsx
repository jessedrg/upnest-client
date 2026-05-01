'use client';

// CandidateDetailModal — full-screen popup with all candidate context.
// TSX port of public/src/CandidateDetailModal.jsx.
//
// Open via:
//   import { openCandidateModal } from '@/components/CandidateDetailModal';
//   openCandidateModal(candidate, 'admin' | 'recruiter' | 'client');

import * as React from 'react';
import { type Candidate, type RoleRow, type Recruiter, type OrgRow } from '../lib/admin-data';
import { useCandidateStore, STAGES } from '../lib/candidate-store';
import { Chip } from './AdminShared';
import { openRejectModal } from './RejectModal';
import { emitToast } from './Toast';

/* ============ Note store ============ */

const NOTES_KEY = 'upnest:candidate-notes';
type Note = {
  id: string; author: string; role: string; avatar: string;
  org: string; body: string; ts: string;
};
type NotesMap = Record<string, Note[]>;

const noteSubs = new Set<() => void>();
const readAll = (): NotesMap => {
  if (typeof window === 'undefined') return {};
  try { return JSON.parse(localStorage.getItem(NOTES_KEY) || '{}') || {}; } catch { return {}; }
};
const writeAll = (obj: NotesMap) => {
  try { localStorage.setItem(NOTES_KEY, JSON.stringify(obj)); } catch {}
  for (const fn of noteSubs) try { fn(); } catch {}
};

function seedFor(id: string): Note[] {
  const hash = String(id).split('').reduce((a, c) => (a * 31 + c.charCodeAt(0)) | 0, 0);
  const variant = Math.abs(hash) % 3;
  if (variant === 0) {
    return [
      { id:'n1', author:'Jesse Dragstra', role:'recruiter', avatar:'J', org:'Parabol Partners',
        body:'Submitted after a 45-min intro. Sharp on systems, clearly the lead on the Plaid Link rebuild — owned the migration end-to-end. Comp expectation $245k base, flexible on equity. Recommending fast-track.',
        ts:'4d ago' },
      { id:'n2', author:'Catherine Hughes', role:'client', avatar:'C', org:'Ramp',
        body:'Strong CV. Bit concerned about the gap between Brex and current role — can you ask what happened there?',
        ts:'3d ago' },
      { id:'n3', author:'Jesse Dragstra', role:'recruiter', avatar:'J', org:'Parabol Partners',
        body:'Asked. Took time off to care for a parent, completely fine. Has references from his Brex manager confirming top-tier performer.',
        ts:'2d ago' },
      { id:'n4', author:'Mira Holt', role:'admin', avatar:'M', org:'upnest',
        body:'Internal: cross-checked LinkedIn vs CV — all dates match. Eligible for full bounty.',
        ts:'1d ago' },
    ];
  }
  if (variant === 1) {
    return [
      { id:'n1', author:'Noor Salim', role:'recruiter', avatar:'N', org:'Cedar & Finch',
        body:'Brought to me through a shared connection at Stripe. Currently leading a 4-person platform team — wants more product surface, less infra. Available within 6 weeks.',
        ts:'1w ago' },
      { id:'n2', author:'Jesse Dragstra', role:'admin', avatar:'J', org:'upnest',
        body:'Spoke to Noor — verified linkedIn, references warm. Approving the submission.',
        ts:'5d ago' },
    ];
  }
  return [
    { id:'n1', author:'Ben Ortiz', role:'recruiter', avatar:'B', org:'Independent',
      body:'Cold email in March, kept the relationship warm. Great fit for the Vercel role specifically — has worked with Next.js since v3.',
      ts:'2w ago' },
    { id:'n2', author:'Mira Holt', role:'admin', avatar:'M', org:'upnest',
      body:"Internal: this is Ben's first submission of the quarter. Watch for completeness.",
      ts:'1w ago' },
    { id:'n3', author:'Guillermo Rauch', role:'client', avatar:'G', org:'Vercel',
      body:"Looks great on paper. Let's push to phone screen this week.",
      ts:'3d ago' },
  ];
}

function getNotes(candidateId: string): Note[] {
  const all = readAll();
  if (all[candidateId]) return all[candidateId];
  const seed = seedFor(candidateId);
  all[candidateId] = seed;
  writeAll(all);
  return seed;
}

function addNote(candidateId: string, note: Omit<Note, 'id' | 'ts'>) {
  const all = readAll();
  const list = all[candidateId] || [];
  list.push({
    id: 'n-' + Date.now(),
    ts: 'just now',
    ...note,
  });
  all[candidateId] = list;
  writeAll(all);
}

function useNotes(candidateId: string): Note[] {
  const [, setTick] = React.useState(0);
  React.useEffect(() => {
    const fn = () => setTick(t => t + 1);
    noteSubs.add(fn);
    return () => { noteSubs.delete(fn); };
  }, []);
  return getNotes(candidateId);
}

/* ============ Imperative open API ============ */

export type Viewer = 'admin' | 'recruiter' | 'client';
type OpenArgs = { candidate: Candidate; viewer?: Viewer };

let openImpl: ((args: OpenArgs) => void) | null = null;

export function openCandidateModal(candidate: Candidate, viewer: Viewer = 'client') {
  if (openImpl) openImpl({ candidate, viewer });
}

const VIEWER_IDENTITY: Record<Viewer, { name: string; role: string; avatar: string; org: string; audience: string }> = {
  admin:     { name: 'Mira Holt',        role: 'admin',     avatar: 'M', org: 'upnest',           audience: 'recruiter, client, internal' },
  recruiter: { name: 'Jesse Dragstra',   role: 'recruiter', avatar: 'J', org: 'Parabol Partners', audience: 'client, admin' },
  client:    { name: 'Catherine Hughes', role: 'client',    avatar: 'C', org: 'Ramp',             audience: 'recruiter, admin' },
};

const VISIBLE_TO_CLIENT = new Set(['Sent to Client', 'On-site', 'Offer', 'Hired']);

const SAMPLE_OWNERSHIP = [
  'the platform team and ship infra-shifting refactors',
  'core product surfaces and own delivery end-to-end',
  'integrations with downstream services',
  "an experiments squad that's shipped 4 product wins this year",
  'mobile app architecture and the iOS team',
];
const SAMPLE_PRIOR = [
  'three years at a Series B fintech and a brief stint at AWS',
  'a senior role at a growth-stage devtools company',
  'two YC startups, one acquired',
  'a stint at Big Tech and a YC company',
  'leadership roles at two sub-100-person teams',
];

/* ============ Modal host ============ */

export function CandidateDetailModalHost() {
  const [candidate, setCandidate] = React.useState<Candidate | null>(null);
  const [viewer, setViewer] = React.useState<Viewer>('client');

  React.useEffect(() => {
    openImpl = ({ candidate, viewer }) => {
      setCandidate(candidate);
      setViewer(viewer || 'client');
    };
    // Also support legacy `open-candidate` events from existing pages.
    const onLegacy = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.candidate) {
        setCandidate(detail.candidate);
        setViewer(detail.viewer || 'client');
      }
    };
    window.addEventListener('open-candidate', onLegacy);
    return () => {
      openImpl = null;
      window.removeEventListener('open-candidate', onLegacy);
    };
  }, []);

  if (!candidate) return null;
  return (
    <CandidateDetailModal
      candidate={candidate}
      viewer={viewer}
      onClose={() => setCandidate(null)}
    />
  );
}

/* ============ The modal itself ============ */

function CandidateDetailModal({ candidate, viewer, onClose }: {
  candidate: Candidate;
  viewer: Viewer;
  onClose: () => void;
}) {
  const c = candidate;
  const notes = useNotes(c.id);
  const { setStage } = useCandidateStore();
  const [draft, setDraft] = React.useState('');
  const [tab, setTab] = React.useState<'overview' | 'notes' | 'history'>('overview');

  const me = VIEWER_IDENTITY[viewer] || VIEWER_IDENTITY.admin;

  const allRoles = React.useMemo(() => {
    // Only show the current role since we don't have full context from ADMIN_DATA anymore
    const roles = [{ id: c.roleId, title: c.role, org: c.org, stage: c.stage, status: 'active' as const, submitted: c.submitted }];
    return roles;
  }, [c.roleId, c.stage, c.org, c.role, c.submitted]);

  // Simplified - create stub recruiter/org from candidate data
  const recruiterMeta: Recruiter | null = c.recruiter ? {
    id: 'rec-' + c.recruiter.replace(/\s/g, '-').toLowerCase(),
    name: c.recruiter,
    org: 'Partner Agency',
    status: 'active',
    tier: 'senior',
    roles: 0,
    submitted: 0,
    placed: 0,
    rev: 0,
    fee: '22%',
    joined: '',
    email: '',
    phone: '',
    linkedin: '',
    location: '',
    timezone: '',
    portfolio: '',
    bio: '',
  } : null;
  
  const orgMeta: OrgRow | null = c.org ? {
    id: 'org-' + c.org.replace(/\s/g, '-').toLowerCase(),
    name: c.org,
    type: 'company',
    tier: 'Enterprise',
    logo: c.org[0],
    joined: '',
    mrr: 0,
    health: 'healthy',
    seats: 0,
    roles: 0,
    candidates: 0,
    primary: '',
    domain: '',
  } : null;

  const handleAddNote = () => {
    const body = draft.trim();
    if (!body) return;
    addNote(c.id, {
      author: me.name, role: me.role, avatar: me.avatar, org: me.org, body,
    });
    setDraft('');
    emitToast({ kind: 'success', title: 'Note added', body: 'Visible to ' + me.audience });
  };

  const stageIdx = STAGES.indexOf(c.stage as any);
  const visibleToClient = VISIBLE_TO_CLIENT.has(c.stage);

  return (
    <React.Fragment>
      <div onClick={onClose} style={{
        position:'fixed', inset:0, background:'rgba(10,10,11,.55)',
        zIndex:200, animation:'modalScrimIn .22s var(--ease) both',
        backdropFilter:'blur(2px)',
      }}/>

      <div style={{
        position:'fixed', inset:'4vh 4vw',
        maxWidth: 1500, margin: '0 auto',
        background:'var(--paper)', zIndex:201,
        borderRadius:16, overflow:'hidden',
        boxShadow:'0 40px 120px rgba(0,0,0,.35)',
        animation:'modalPop .32s cubic-bezier(.22,.9,.22,1) both',
        display:'flex', flexDirection:'column',
      }}>
        {/* HEADER */}
        <div style={{
          padding:'28px 36px 22px',
          borderBottom:'1px solid var(--hair)',
          display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:18,
        }}>
          <div style={{ display:'flex', gap:18, minWidth:0 }}>
            <div style={{
              width:64, height:64, borderRadius:999,
              background:'var(--ink)', color:'var(--paper)',
              display:'flex', alignItems:'center', justifyContent:'center',
              fontFamily:'var(--serif)', fontStyle:'italic', fontSize:26, flexShrink:0,
            }}>{c.initials}</div>
            <div style={{ minWidth:0 }}>
              <div className="mono" style={{ fontSize:10, letterSpacing:'.22em', color:'var(--t-4)' }}>
                {c.num} · {(c.source || 'DIRECT').toUpperCase()}
                {visibleToClient && <span style={{ marginLeft:10, color:'var(--plum-700)' }}>· VISIBLE TO CLIENT</span>}
              </div>
              <div className="serif" style={{ fontSize:38, fontStyle:'italic', letterSpacing:'-0.03em', lineHeight:1.05, marginTop:6 }}>{c.name}</div>
              <div style={{ marginTop:8, display:'flex', alignItems:'center', gap:14, flexWrap:'wrap', color:'var(--t-3)', fontFamily:'var(--serif)', fontSize:15 }}>
                <span style={{ fontStyle:'italic' }}>{c.title}</span>
                <span style={{ color:'var(--t-5)' }}>·</span>
                <span>at <em>{c.current}</em></span>
                <span style={{ color:'var(--t-5)' }}>·</span>
                <span className="mono" style={{ fontSize:11, letterSpacing:'.14em', color:'var(--t-4)' }}>{c.years}Y EXP</span>
                <span style={{ color:'var(--t-5)' }}>·</span>
                <span className="mono" style={{ fontSize:11, letterSpacing:'.14em', color:'var(--t-4)' }}>{(c.location || '').toUpperCase()}</span>
              </div>
            </div>
          </div>
          <div style={{ display:'flex', gap:8, alignItems:'center' }}>
            <button onClick={onClose} title="Close" style={{
              appearance:'none', border:0, background:'var(--paper-2)', cursor:'pointer',
              width:36, height:36, borderRadius:999, fontSize:16, color:'var(--t-2)',
            }}>✕</button>
          </div>
        </div>

        {/* PIPELINE TRACK */}
        <div style={{ padding:'18px 36px 14px', borderBottom:'1px solid var(--hair)', background:'color-mix(in oklch, var(--paper) 60%, #fff)' }}>
          <div className="mono" style={{ fontSize:9, letterSpacing:'.22em', color:'var(--t-4)', marginBottom:10 }}>STAGE PIPELINE</div>
          <div style={{ display:'flex', gap:6, alignItems:'flex-end' }}>
            {STAGES.filter(s => s !== 'Rejected' && s !== 'Withdrawn').map((s, i) => {
              const order = STAGES.filter(x => x !== 'Rejected' && x !== 'Withdrawn');
              const cur = order.indexOf(c.stage as any);
              const reached = i <= cur;
              const isClientBoundary = s === 'Sent to Client';
              return (
                <div key={s} style={{ flex:1, display:'flex', flexDirection:'column', gap:6, alignItems:'flex-start' }}>
                  <div style={{
                    width:'100%', height:4,
                    background: reached ? (isClientBoundary && i === cur ? 'var(--plum-700)' : 'var(--ink)') : 'var(--hair)',
                    borderRadius:1,
                  }}/>
                  <div className="mono" style={{
                    fontSize:9, letterSpacing:'.16em',
                    color: reached ? (isClientBoundary ? 'var(--plum-700)' : 'var(--t-2)') : 'var(--t-4)',
                    whiteSpace:'nowrap',
                  }}>{s.toUpperCase()}</div>
                </div>
              );
            })}
            {c.stage === 'Rejected' && (
              <div style={{ paddingLeft:10, fontFamily:'var(--mono)', fontSize:10, color:'var(--err)', letterSpacing:'.2em', alignSelf:'center' }}>· REJECTED</div>
            )}
            {c.stage === 'Withdrawn' && (
              <div style={{ paddingLeft:10, fontFamily:'var(--mono)', fontSize:10, color:'var(--t-3)', letterSpacing:'.2em', alignSelf:'center' }}>· WITHDRAWN</div>
            )}
          </div>
        </div>

        {/* TABS */}
        <div style={{ padding:'0 36px', borderBottom:'1px solid var(--hair)', display:'flex', gap:24 }}>
          {([
            { k:'overview' as const, l:'Overview' },
            { k:'notes' as const,    l:`Notes · ${notes.length}` },
            { k:'history' as const,  l:'Activity' },
          ]).map(t => (
            <button key={t.k} onClick={()=>setTab(t.k)} style={{
              appearance:'none', border:0, background:'transparent', cursor:'pointer',
              padding:'14px 0', position:'relative',
              fontFamily:'var(--serif)', fontSize:15, letterSpacing:'-0.005em',
              fontStyle: tab === t.k ? 'italic' : 'normal',
              color: tab === t.k ? 'var(--t-1)' : 'var(--t-3)',
            }}>
              {t.l}
              {tab === t.k && <span style={{ position:'absolute', left:0, right:0, bottom:-1, height:2, background:'var(--ink)' }}/>}
            </button>
          ))}
        </div>

        <div style={{ flex:1, overflow:'auto', padding:'28px 36px' }}>
          {tab === 'overview' && (
            <OverviewTab c={c} allRoles={allRoles} recruiterMeta={recruiterMeta} orgMeta={orgMeta}/>
          )}
          {tab === 'notes' && (
            <NotesTab notes={notes} draft={draft} setDraft={setDraft} onAdd={handleAddNote} me={me}/>
          )}
          {tab === 'history' && (
            <HistoryTab c={c}/>
          )}
        </div>

        {/* FOOTER */}
        {viewer !== 'client' && (
          <div style={{
            padding:'16px 36px', borderTop:'1px solid var(--hair)',
            display:'flex', alignItems:'center', justifyContent:'space-between', gap:12,
            background:'#fff',
          }}>
            <div style={{ display:'flex', gap:8 }}>
              <button onClick={() => {
                openRejectModal({ candidate: c, actor: { name: me.name, role: me.role } });
              }} className="btn btn-ghost" style={{ padding:'10px 14px' }}>
                Reject
              </button>
              {!visibleToClient && c.stage !== 'Rejected' && (
                <button onClick={()=> setStage(c.id, 'Sent to Client')}
                  style={{
                    appearance:'none', border:'1px solid var(--plum-700)',
                    background:'var(--plum-700)', color:'var(--paper)',
                    padding:'10px 16px', borderRadius:999, cursor:'pointer',
                    fontFamily:'var(--serif)', fontStyle:'italic', fontSize:14,
                  }}>
                  → Send to client
                </button>
              )}
            </div>
            <div style={{ display:'flex', gap:8 }}>
              <button onClick={()=> {
                const next = STAGES[Math.min(stageIdx + 1, STAGES.indexOf('Hired' as any))];
                if (next && next !== c.stage) setStage(c.id, next);
              }} className="btn btn-primary" style={{ padding:'10px 16px' }}>
                Advance stage →
              </button>
            </div>
          </div>
        )}
        {viewer === 'client' && (
          <div style={{
            padding:'16px 36px', borderTop:'1px solid var(--hair)',
            display:'flex', alignItems:'center', justifyContent:'flex-end', gap:8, background:'#fff',
          }}>
            <button className="btn btn-ghost" style={{ padding:'10px 14px' }}
              onClick={()=> emitToast({ kind:'info', title:'Recruiter notified', body:"They'll respond within 24h." })}>
              Message recruiter
            </button>
            <button className="btn btn-primary" style={{ padding:'10px 16px' }}
              onClick={()=> emitToast({ kind:'success', title:'Interview requested', body:"We'll coordinate with the recruiter." })}>
              Request interview
            </button>
          </div>
        )}
      </div>
    </React.Fragment>
  );
}

/* ============ Tabs ============ */

type AllRoleRow = {
  id: string; title: string; org: string; stage: string;
  status: 'active' | 'archived'; submitted: string;
};

function OverviewTab({ c, allRoles, recruiterMeta, orgMeta }: {
  c: Candidate;
  allRoles: AllRoleRow[];
  recruiterMeta: Recruiter | null;
  orgMeta: OrgRow | null;
}) {
  return (
    <div style={{ display:'grid', gridTemplateColumns:'1.4fr 1fr', gap:36 }}>
      <div>
        <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:24 }}>
          <Chip tone={c.stage==='Hired'?'ok':c.stage==='Rejected'?'err':c.stage==='Sent to Client'?'plum':'paper'}>{c.stage?.toUpperCase()}</Chip>
          <Chip tone="paper">{(c.location || '').toUpperCase()}</Chip>
          <Chip tone="paper">{c.salary}</Chip>
          {c.flagged && <Chip tone="err">FLAGGED</Chip>}
          {c.saved && <Chip tone="gold">SAVED</Chip>}
        </div>

        <div className="serif" style={{
          fontSize:22, fontStyle:'italic', lineHeight:1.4,
          color:'var(--t-1)', borderLeft:'3px solid var(--plum-600)',
          paddingLeft:20, marginBottom:32, letterSpacing:'-0.005em',
        }}>
          &ldquo;{c.quote}&rdquo;
        </div>

        <div className="mono" style={{ fontSize:10, letterSpacing:'.22em', color:'var(--t-4)', marginBottom:8 }}>§ ABOUT</div>
        <p className="serif" style={{ fontSize:15, lineHeight:1.65, color:'var(--t-2)', margin:'0 0 24px', textWrap:'pretty' }}>
          {c.years}-year operator most recently at <em>{c.current}</em>, where they own {SAMPLE_OWNERSHIP[(c.years || 5) % SAMPLE_OWNERSHIP.length]}. Prior stints include {SAMPLE_PRIOR[(c.years || 3) % SAMPLE_PRIOR.length]}. Open to {c.location?.includes('Remote') ? 'remote and hybrid' : c.location} roles, comp expectation around {c.salary}.
        </p>

        <div className="mono" style={{ fontSize:10, letterSpacing:'.22em', color:'var(--t-4)', marginBottom:12 }}>§ ROLES SUBMITTED TO</div>
        <div style={{ display:'flex', flexDirection:'column', gap:0, border:'1px solid var(--hair)', borderRadius:10, overflow:'hidden' }}>
          {allRoles.map((r, i) => (
            <div key={r.id + i} style={{
              display:'grid', gridTemplateColumns:'1fr auto auto', alignItems:'center', gap:14,
              padding:'14px 16px',
              borderBottom: i < allRoles.length - 1 ? '1px solid var(--hair)' : 'none',
              background: i === 0 ? '#fff' : 'transparent',
            }}>
              <div style={{ minWidth:0 }}>
                <div style={{ fontFamily:'var(--serif)', fontSize:16, fontStyle: i === 0 ? 'italic' : 'normal', letterSpacing:'-0.005em' }}>
                  {r.title} {i === 0 && <span className="mono" style={{ fontSize:9, color:'var(--plum-700)', letterSpacing:'.18em', marginLeft:8 }}>· CURRENT</span>}
                </div>
                <div className="mono" style={{ fontSize:9, letterSpacing:'.16em', color:'var(--t-4)', marginTop:3 }}>
                  {r.org?.toUpperCase()} · SUBMITTED {r.submitted?.toUpperCase()}
                </div>
              </div>
              <Chip tone={r.stage === 'Hired' ? 'ok' : r.stage === 'Rejected' || r.stage === 'Withdrawn' ? 'paper' : 'plum'}>{r.stage?.toUpperCase()}</Chip>
              <span className="mono" style={{ fontSize:10, letterSpacing:'.16em', color: r.status === 'archived' ? 'var(--t-4)' : 'var(--ink)' }}>
                {r.status === 'archived' ? 'ARCHIVED' : 'ACTIVE'}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="mono" style={{ fontSize:10, letterSpacing:'.22em', color:'var(--t-4)', marginBottom:10 }}>§ OWNED BY</div>
        <div style={{
          border:'1px solid var(--hair)', borderRadius:10, padding:18,
          background:'#fff', marginBottom:24,
        }}>
          <div style={{ display:'flex', alignItems:'flex-start', gap:14 }}>
            <div style={{
              width:44, height:44, borderRadius:999,
              background:'linear-gradient(135deg, #F3E6CE, #B88858)', color:'var(--ink)',
              display:'flex', alignItems:'center', justifyContent:'center',
              fontFamily:'var(--serif)', fontSize:17, fontStyle:'italic',
            }}>{(c.recruiter || '?')[0]}</div>
            <div style={{ minWidth:0, flex:1 }}>
              <div style={{ fontFamily:'var(--serif)', fontSize:18, fontStyle:'italic', letterSpacing:'-0.005em' }}>{c.recruiter}</div>
              <div className="mono" style={{ fontSize:10, letterSpacing:'.16em', color:'var(--t-4)', marginTop:3 }}>
                {(recruiterMeta?.org || 'INDEPENDENT').toUpperCase()} · {(recruiterMeta?.tier || 'recruiter').toUpperCase()}
              </div>
              {recruiterMeta?.email && (
                <div style={{ fontFamily:'var(--mono)', fontSize:11, color:'var(--t-3)', marginTop:8 }}>{recruiterMeta.email}</div>
              )}
            </div>
          </div>
          {recruiterMeta?.bio && (
            <div className="serif" style={{ fontSize:13, fontStyle:'italic', lineHeight:1.5, color:'var(--t-3)', marginTop:12, paddingTop:12, borderTop:'1px solid var(--hair)' }}>
              &ldquo;{recruiterMeta.bio}&rdquo;
            </div>
          )}
        </div>

        <div className="mono" style={{ fontSize:10, letterSpacing:'.22em', color:'var(--t-4)', marginBottom:10 }}>§ HIRING ORG</div>
        <div style={{
          border:'1px solid var(--hair)', borderRadius:10, padding:18,
          background:'#fff', marginBottom:24,
        }}>
          <div style={{ display:'flex', alignItems:'center', gap:14 }}>
            <div style={{
              width:44, height:44, borderRadius:10,
              background:'var(--ink)', color:'var(--paper)',
              display:'flex', alignItems:'center', justifyContent:'center',
              fontFamily:'var(--serif)', fontSize:18, fontStyle:'italic',
            }}>{orgMeta?.logo || (c.org || '?')[0]}</div>
            <div style={{ minWidth:0, flex:1 }}>
              <div style={{ fontFamily:'var(--serif)', fontSize:18, fontStyle:'italic', letterSpacing:'-0.005em' }}>{c.org}</div>
              <div className="mono" style={{ fontSize:10, letterSpacing:'.16em', color:'var(--t-4)', marginTop:3 }}>
                {orgMeta?.tier?.toUpperCase() || 'COMPANY'}{orgMeta?.domain ? ' · ' + orgMeta.domain.toUpperCase() : ''}
              </div>
            </div>
          </div>
          {orgMeta?.primary && (
            <div style={{ marginTop:14, paddingTop:12, borderTop:'1px solid var(--hair)' }}>
              <div className="mono" style={{ fontSize:9, letterSpacing:'.18em', color:'var(--t-4)' }}>PRIMARY CONTACT</div>
              <div style={{ fontFamily:'var(--serif)', fontSize:14, fontStyle:'italic', marginTop:4 }}>{orgMeta.primary}</div>
            </div>
          )}
        </div>

        <div className="mono" style={{ fontSize:10, letterSpacing:'.22em', color:'var(--t-4)', marginBottom:10 }}>§ DETAILS</div>
        <div style={{ display:'flex', flexDirection:'column', gap:0, border:'1px solid var(--hair)', borderRadius:10, overflow:'hidden' }}>
          {([
            ['SOURCE', c.source],
            ['CURRENT', c.current],
            ['EXPERIENCE', c.years + ' years'],
            ['LOCATION', c.location],
            ['EXPECTED COMP', c.salary],
            ['SUBMITTED', c.submitted],
          ] as Array<[string, string | number | undefined]>).map(([k, v], i, arr) => (
            <div key={k} style={{
              display:'grid', gridTemplateColumns:'130px 1fr', gap:14,
              padding:'10px 16px',
              borderBottom: i < arr.length - 1 ? '1px solid var(--hair)' : 'none',
            }}>
              <span className="mono" style={{ fontSize:10, letterSpacing:'.16em', color:'var(--t-4)' }}>{k}</span>
              <span style={{ fontFamily:'var(--serif)', fontSize:14, fontStyle:'italic' }}>{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function NotesTab({ notes, draft, setDraft, onAdd, me }: {
  notes: Note[];
  draft: string;
  setDraft: (v: string) => void;
  onAdd: () => void;
  me: { name: string; role: string; avatar: string; org: string; audience: string };
}) {
  return (
    <div style={{ maxWidth:780 }}>
      <div className="mono" style={{ fontSize:10, letterSpacing:'.22em', color:'var(--t-4)', marginBottom:12 }}>
        § NOTES THREAD · {notes.length} ENTRIES
      </div>
      <p style={{ fontFamily:'var(--serif)', fontStyle:'italic', fontSize:14, color:'var(--t-3)', margin:'0 0 24px', lineHeight:1.5, textWrap:'pretty' }}>
        Recruiters, clients, and admins all post here. Each entry is tagged with its author&apos;s role, so you always know who said what.
      </p>

      <div style={{ display:'flex', flexDirection:'column', gap:0, marginBottom:28 }}>
        {notes.map((n, i) => {
          const tone = n.role === 'admin' ? 'var(--ink)' : n.role === 'client' ? 'var(--plum-700)' : '#B88858';
          const bg   = n.role === 'admin' ? 'var(--ink)' : n.role === 'client' ? 'var(--plum-700)' : 'linear-gradient(135deg, #F3E6CE, #B88858)';
          return (
            <div key={n.id} style={{
              display:'grid', gridTemplateColumns:'44px 1fr', gap:14,
              padding:'18px 0', borderBottom: i < notes.length - 1 ? '1px solid var(--hair)' : 'none',
            }}>
              <div style={{
                width:36, height:36, borderRadius:999,
                background: bg,
                color: n.role === 'recruiter' ? 'var(--ink)' : 'var(--paper)',
                display:'flex', alignItems:'center', justifyContent:'center',
                fontFamily:'var(--serif)', fontSize:15, fontStyle:'italic', flexShrink:0,
              }}>{n.avatar}</div>
              <div style={{ minWidth:0 }}>
                <div style={{ display:'flex', alignItems:'baseline', gap:10, flexWrap:'wrap' }}>
                  <span style={{ fontFamily:'var(--serif)', fontSize:15, fontStyle:'italic' }}>{n.author}</span>
                  <span className="mono" style={{
                    fontSize:9, letterSpacing:'.18em', padding:'2px 8px', borderRadius:4,
                    color: tone, border: `1px solid ${tone}`, opacity:.85,
                  }}>{n.role.toUpperCase()}</span>
                  <span className="mono" style={{ fontSize:10, letterSpacing:'.14em', color:'var(--t-4)' }}>· {n.org?.toUpperCase()}</span>
                  <span className="mono" style={{ fontSize:10, letterSpacing:'.14em', color:'var(--t-4)', marginLeft:'auto' }}>{n.ts?.toUpperCase()}</span>
                </div>
                <div className="serif" style={{ fontSize:15, lineHeight:1.55, color:'var(--t-1)', marginTop:8, textWrap:'pretty' }}>
                  {n.body}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{
        border:'1px solid var(--hair-strong)', borderRadius:12, padding:14, background:'#fff',
      }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
          <div style={{
            width:30, height:30, borderRadius:999,
            background: me.role === 'admin' ? 'var(--ink)' : me.role === 'client' ? 'var(--plum-700)' : 'linear-gradient(135deg, #F3E6CE, #B88858)',
            color: me.role === 'recruiter' ? 'var(--ink)' : 'var(--paper)',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontFamily:'var(--serif)', fontSize:13, fontStyle:'italic',
          }}>{me.avatar}</div>
          <span style={{ fontFamily:'var(--serif)', fontStyle:'italic', fontSize:14 }}>{me.name}</span>
          <span className="mono" style={{ fontSize:9, letterSpacing:'.18em', color:'var(--t-4)' }}>· {me.role.toUpperCase()}</span>
        </div>
        <textarea
          value={draft}
          onChange={e=>setDraft(e.target.value)}
          placeholder="Add a note. Visible to everyone on this candidate."
          rows={3}
          style={{
            width:'100%', border:0, outline:'none', resize:'vertical',
            fontFamily:'var(--serif)', fontSize:15, lineHeight:1.5,
            background:'transparent', color:'var(--t-1)',
          }}
        />
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:8, paddingTop:10, borderTop:'1px solid var(--hair)' }}>
          <span className="mono" style={{ fontSize:9, letterSpacing:'.18em', color:'var(--t-4)' }}>
            VISIBLE TO {me.audience.toUpperCase()}
          </span>
          <button onClick={onAdd} disabled={!draft.trim()} style={{
            appearance:'none', border:0, cursor: draft.trim() ? 'pointer' : 'not-allowed',
            background:'var(--ink)', color:'var(--paper)',
            padding:'8px 16px', borderRadius:999,
            fontFamily:'var(--serif)', fontStyle:'italic', fontSize:13,
            opacity: draft.trim() ? 1 : 0.4,
          }}>+ Post note</button>
        </div>
      </div>
    </div>
  );
}

function HistoryTab({ c }: { c: Candidate }) {
  const log = [
    { ts:'2 mo ago', actor:'Jesse Dragstra', verb:'submitted candidate', detail:'Initial profile + LinkedIn' },
    { ts:'7 wk ago', actor:'Mira Holt',     verb:'admin approved',       detail:'Profile complete · LinkedIn verified' },
    { ts:'6 wk ago', actor:'Jesse Dragstra', verb:'moved to Screening',   detail:'Spoke for 30 min, sharp' },
    { ts:'5 wk ago', actor:'Jesse Dragstra', verb:'moved to Phone',       detail:'Phone screen scheduled' },
    { ts:'4 wk ago', actor:'Catherine Hughes', verb:'reviewed profile',   detail:'From Ramp side' },
    { ts:'3 wk ago', actor:'Jesse Dragstra', verb:'moved to Technical',   detail:'Take-home assigned' },
    { ts:'2 wk ago', actor: ['Sent to Client','On-site','Offer','Hired'].includes(c.stage) ? 'Jesse Dragstra' : null, verb:'sent to client', detail:'Visible to Ramp' },
  ].filter(e => e.actor) as { ts: string; actor: string; verb: string; detail: string }[];

  return (
    <div style={{ maxWidth:720 }}>
      <div className="mono" style={{ fontSize:10, letterSpacing:'.22em', color:'var(--t-4)', marginBottom:18 }}>§ ACTIVITY · OLDEST FIRST</div>
      <div style={{ position:'relative', paddingLeft:30 }}>
        <div style={{ position:'absolute', left:9, top:8, bottom:8, width:1, background:'var(--hair-strong)' }}/>
        {log.map((e, i) => (
          <div key={i} style={{ position:'relative', padding:'10px 0 22px' }}>
            <div style={{
              position:'absolute', left:-26, top:14,
              width:11, height:11, borderRadius:999,
              background:'var(--paper)', border:'2px solid var(--ink)',
            }}/>
            <div className="mono" style={{ fontSize:9, letterSpacing:'.18em', color:'var(--t-4)' }}>{e.ts.toUpperCase()}</div>
            <div style={{ fontFamily:'var(--serif)', fontSize:16, marginTop:4, letterSpacing:'-0.005em' }}>
              <em>{e.actor}</em> <span style={{ color:'var(--t-3)' }}>· {e.verb}</span>
            </div>
            <div style={{ fontFamily:'var(--serif)', fontStyle:'italic', fontSize:14, color:'var(--t-3)', marginTop:3 }}>{e.detail}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
