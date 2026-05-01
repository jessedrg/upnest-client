'use client';

// Client shell — "company admin" portal (e.g. Ramp's view).
// Distinct from admin: PAPER background w/ PLUM accent nav, instead of ink+gold.

import * as React from 'react';

export type ClientNavKey = 'overview' | 'roles' | 'candidates' | 'recruiters' | 'stats' | 'billing';

export function ClientNav({
  current,
  onNavigate,
  onExitClient,
  orgName = 'Ramp',
  orgLogo = 'R',
  userName = 'Catherine Hughes',
}: {
  current: ClientNavKey;
  onNavigate?: (k: ClientNavKey) => void;
  onExitClient?: () => void;
  orgName?: string;
  orgLogo?: string;
  userName?: string;
}) {
  const items: { key: ClientNavKey; label: string }[] = [
    { key: 'overview',   label: 'Overview' },
    { key: 'roles',      label: 'Roles' },
    { key: 'candidates', label: 'Candidates' },
    { key: 'recruiters', label: 'Recruiters' },
    { key: 'stats',      label: 'Stats' },
    { key: 'billing',    label: 'Billing' },
  ];

  const [collapsed, setCollapsed] = React.useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    try { return localStorage.getItem('upnest:client-nav:collapsed') === '1'; } catch { return false; }
  });
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState<boolean>(() =>
    typeof window !== 'undefined' && window.innerWidth <= 860
  );

  React.useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 860);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);
  React.useEffect(() => { if (!isMobile) setMobileOpen(false); }, [isMobile]);
  React.useEffect(() => {
    try { localStorage.setItem('upnest:client-nav:collapsed', collapsed ? '1' : '0'); } catch {}
  }, [collapsed]);

  const navigate = (k: ClientNavKey) => { onNavigate && onNavigate(k); setMobileOpen(false); };
  const width = isMobile ? 260 : (collapsed ? 64 : 220);

  const accent = 'var(--plum-600)';
  const paper = 'var(--paper)';

  const railContent = (
    <React.Fragment>
      {/* wordmark + org */}
      <div style={{ marginBottom: 28, display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:8 }}>
        {!collapsed || isMobile ? (
          <div style={{ minWidth:0, flex:1 }}>
            <div style={{ display:'flex', alignItems:'baseline', gap:6, flexWrap:'nowrap' }}>
              <div className="serif" style={{ fontSize:26, letterSpacing:'-0.03em', lineHeight:1, fontStyle:'italic', color:'var(--ink)' }}>upnest</div>
              <div className="mono" style={{ fontSize:9, letterSpacing:'.18em', color:'var(--t-4)', whiteSpace:'nowrap' }}>/CLIENT</div>
            </div>
            <div className="mono" style={{ fontSize:9, letterSpacing:'.18em', color:'var(--t-4)', marginTop:6 }}>COMPANY CONSOLE</div>
          </div>
        ) : (
          <div className="serif" style={{ fontSize:22, fontStyle:'italic', color:'var(--ink)' }}>u</div>
        )}
        {!isMobile && (
          <button
            onClick={()=>setCollapsed(c=>!c)}
            aria-label={collapsed ? 'Expand' : 'Collapse'}
            style={{
              appearance:'none', border:'1px solid var(--hair)', background:'transparent',
              width:22, height:22, borderRadius:6, cursor:'pointer',
              color: 'var(--t-3)', display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:11, flexShrink:0,
            }}
          >{collapsed ? '›' : '‹'}</button>
        )}
        {isMobile && (
          <button onClick={()=>setMobileOpen(false)} aria-label="Close"
            style={{ appearance:'none', border:0, background:'transparent', width:32, height:32, cursor:'pointer', fontSize:18, color:'var(--t-3)' }}
          >✕</button>
        )}
      </div>

      {/* org chip */}
      {(!collapsed || isMobile) && (
        <div style={{
          display:'flex', alignItems:'center', gap:10, padding:'12px 14px',
          border:'1px solid var(--hair)', borderRadius:10, marginBottom:24,
          background:'color-mix(in oklch, var(--plum-600) 4%, var(--paper))',
        }}>
          <div style={{
            width:32, height:32, borderRadius:6,
            background:'linear-gradient(135deg, var(--plum-600), color-mix(in oklch, var(--plum-600) 60%, #0A0A0B))',
            color:'#fff', fontFamily:'var(--serif)', fontSize:15, fontStyle:'italic',
            display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
          }}>{orgLogo}</div>
          <div style={{ minWidth:0, flex:1 }}>
            <div style={{ fontFamily:'var(--serif)', fontSize:15, fontStyle:'italic', letterSpacing:'-0.01em', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{orgName}</div>
            <div className="mono" style={{ fontSize:9, letterSpacing:'.14em', color:'var(--t-4)' }}>ENTERPRISE · 42 SEATS</div>
          </div>
        </div>
      )}

      {/* items */}
      <nav style={{ flex:1, overflow:'hidden auto', display:'flex', flexDirection:'column', gap:2 }}>
        {items.map(item => {
          const Active = current === item.key;
          const showLabel = !collapsed || isMobile;
          return (
            <button key={item.key} onClick={()=>navigate(item.key)}
                    title={!showLabel ? item.label : undefined}
                    style={{
                      position:'relative', appearance:'none', border:0,
                      background: 'transparent',
                      color: Active ? 'var(--ink)' : 'var(--t-3)',
                      padding: showLabel ? '7px 0' : '9px 0',
                      textAlign: showLabel ? 'left' : 'center',
                      cursor:'pointer',
                      fontFamily: 'var(--serif)',
                      fontSize: showLabel ? 17 : 15,
                      letterSpacing:'-0.01em',
                      fontStyle: Active ? 'italic' : 'normal',
                      transition:'color .15s',
                    }}
                    onMouseEnter={e=>{ if(!Active) (e.currentTarget as HTMLElement).style.color = 'var(--ink)'; }}
                    onMouseLeave={e=>{ if(!Active) (e.currentTarget as HTMLElement).style.color = 'var(--t-3)'; }}>
              {Active && showLabel && <span style={{
                position:'absolute', left:-22, top:'50%', transform:'translateY(-50%)',
                width:3, height:18, background: accent,
              }}/>}
              {Active && !showLabel && <span style={{
                position:'absolute', left:4, top:'50%', transform:'translateY(-50%)',
                width:3, height:16, background: accent,
              }}/>}
              {showLabel ? item.label : item.label[0]}
            </button>
          );
        })}
      </nav>

      {/* footer: exit */}
      <div style={{ paddingTop:16, marginTop:16, borderTop:'1px solid var(--hair)', display:'flex', flexDirection:'column', gap:2 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, padding:'4px 0 12px' }}>
          <div style={{
            width:26, height:26, borderRadius:999,
            background:'var(--ink)', color:'var(--paper)',
            fontFamily:'var(--serif)', fontSize:12, fontStyle:'italic',
            display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
          }}>{userName.split(' ').map(s=>s[0]).slice(0,2).join('')}</div>
          {(!collapsed || isMobile) && (
            <div style={{ minWidth:0, flex:1 }}>
              <div style={{ fontSize:12, color:'var(--ink)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{userName}</div>
              <div className="mono" style={{ fontSize:9, letterSpacing:'.12em', color:'var(--t-4)' }}>HEAD OF TALENT</div>
            </div>
          )}
        </div>

        {(!collapsed || isMobile) && (
          <button onClick={onExitClient} style={{
            appearance:'none', border:0, background:'transparent',
            color:'var(--t-3)', padding:'6px 0', textAlign:'left', cursor:'pointer',
            fontFamily:'var(--serif)', fontSize:15, letterSpacing:'-0.01em',
          }}
          onMouseEnter={e=> (e.currentTarget as HTMLElement).style.color = 'var(--ink)'}
          onMouseLeave={e=> (e.currentTarget as HTMLElement).style.color = 'var(--t-3)'}>
            ← Exit client
          </button>
        )}
      </div>
    </React.Fragment>
  );

  if (isMobile) {
    return (
      <React.Fragment>
        <div style={{
          position:'sticky', top:0, zIndex:80,
          background: paper, borderBottom:'1px solid var(--hair)',
          display:'flex', alignItems:'center', justifyContent:'space-between',
          padding:'12px 16px',
        }}>
          <button onClick={()=>setMobileOpen(true)} aria-label="Open menu"
            style={{ appearance:'none', border:'1px solid var(--hair)', background:'transparent',
              width:36, height:36, borderRadius:8, cursor:'pointer',
              display:'flex', alignItems:'center', justifyContent:'center', color:'var(--ink)', padding:0,
            }}>
            <svg width="16" height="12" viewBox="0 0 16 12" fill="none"><path d="M1 1h14M1 6h14M1 11h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
          </button>
          <div style={{ display:'flex', alignItems:'baseline', gap:6 }}>
            <div className="serif" style={{ fontSize:22, fontStyle:'italic', letterSpacing:'-0.03em' }}>upnest</div>
            <div className="mono" style={{ fontSize:9, letterSpacing:'.18em', color:'var(--t-4)' }}>/CLIENT</div>
          </div>
          <div style={{ width:36 }}/>
        </div>
        {mobileOpen && (
          <div onClick={()=>setMobileOpen(false)} style={{
            position:'fixed', inset:0, background:'rgba(0,0,0,.3)', zIndex:90, animation:'scrimIn .22s var(--ease) both',
          }}/>
        )}
        <aside style={{
          position:'fixed', top:0, left:0, bottom:0, width: 260,
          background: paper, borderRight:'1px solid var(--hair)',
          display:'flex', flexDirection:'column', padding:'20px 22px 22px',
          zIndex:100,
          transform: mobileOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition:'transform .28s var(--ease)',
        }}>
          {railContent}
        </aside>
      </React.Fragment>
    );
  }

  return (
    <aside style={{
      width, flexShrink: 0, height: '100vh',
      background: paper,
      color: 'var(--ink)',
      display:'flex', flexDirection:'column',
      padding: collapsed ? '28px 10px 22px' : '28px 22px 22px',
      position:'sticky', top:0,
      borderRight: '1px solid var(--hair)',
      transition:'width .22s var(--ease), padding .22s var(--ease)',
    }}>
      {railContent}
    </aside>
  );
}

// Top bar — breadcrumb style
export function ClientTopBar({ title, subtitle, right }: {
  title: React.ReactNode; subtitle?: React.ReactNode; right?: React.ReactNode;
}) {
  return (
    <div style={{
      padding:'16px 28px',
      borderBottom:'1px solid var(--hair)',
      background:'var(--paper)',
      position:'sticky', top:0, zIndex:10,
      display:'flex', alignItems:'center', justifyContent:'space-between', gap:16,
    }}>
      <div style={{ display:'flex', alignItems:'center', gap:14, minWidth:0 }}>
        <span className="mono" style={{ fontSize:10, letterSpacing:'.18em', color:'var(--t-4)' }}>RAMP /</span>
        <div style={{ minWidth:0 }}>
          <div className="serif" style={{ fontSize:18, fontStyle:'italic', letterSpacing:'-0.01em', lineHeight:1.1, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{title}</div>
          {subtitle && <div className="mono" style={{ fontSize:10, letterSpacing:'.14em', color:'var(--t-4)', marginTop:3 }}>{subtitle}</div>}
        </div>
      </div>
      <div style={{ display:'flex', alignItems:'center', gap:12 }}>
        {right}
      </div>
    </div>
  );
}
