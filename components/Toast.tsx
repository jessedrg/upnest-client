'use client';

import * as React from 'react';

export type ToastKind = 'success' | 'error' | 'info' | 'warn';
export type ToastDetail = { kind?: ToastKind; title: string; body?: string; ttl?: number };
type ToastItem = ToastDetail & { id: string; kind: ToastKind; ttl: number; leaving?: boolean };

declare global {
  interface Window {
    toast?: (detail: ToastDetail) => void;
  }
}

export function ToastHost() {
  const [items, setItems] = React.useState<ToastItem[]>([]);

  React.useEffect(() => {
    const on = (e: Event) => {
      const detail = (e as CustomEvent<ToastDetail>).detail;
      const id = Math.random().toString(36).slice(2);
      const item: ToastItem = { id, kind: 'info', ttl: 4200, ...detail };
      setItems(prev => [...prev, item]);
      setTimeout(() => {
        setItems(prev => prev.map(x => x.id === id ? { ...x, leaving: true } : x));
        setTimeout(() => setItems(prev => prev.filter(x => x.id !== id)), 260);
      }, item.ttl);
    };
    window.addEventListener('toast', on as EventListener);
    window.toast = (detail: ToastDetail) => window.dispatchEvent(new CustomEvent('toast', { detail }));
    return () => window.removeEventListener('toast', on as EventListener);
  }, []);

  const dismiss = (id: string) => {
    setItems(prev => prev.map(x => x.id === id ? { ...x, leaving: true } : x));
    setTimeout(() => setItems(prev => prev.filter(x => x.id !== id)), 260);
  };

  return (
    <div style={{
      position:'fixed', right:24, bottom:24, zIndex:400,
      display:'flex', flexDirection:'column', gap:10,
      pointerEvents:'none', maxWidth:'calc(100vw - 48px)',
    }}>
      {items.map(t => {
        const accent = t.kind==='success' ? 'var(--ok)'
          : t.kind==='error' ? 'var(--err)'
          : t.kind==='warn' ? 'var(--warn)'
          : 'var(--plum-700)';
        const glyph = t.kind==='success' ? '✓'
          : t.kind==='error' ? '✕'
          : t.kind==='warn' ? '!'
          : '—';
        return (
          <div key={t.id} className={t.leaving ? 'toast-out' : 'toast-in'} style={{
            pointerEvents:'auto',
            display:'flex', alignItems:'flex-start', gap:12,
            background:'var(--ink)', color:'var(--paper)',
            border:'1px solid rgba(255,255,255,.08)',
            borderLeft:`3px solid ${accent}`,
            borderRadius:10, padding:'13px 16px 13px 14px',
            minWidth:260, maxWidth:380,
            boxShadow:'0 10px 30px rgba(0,0,0,.25), 0 2px 6px rgba(0,0,0,.15)',
          }}>
            <span style={{
              width:18, height:18, borderRadius:999, flexShrink:0, marginTop:1,
              display:'inline-flex', alignItems:'center', justifyContent:'center',
              background:accent, color:'var(--ink)', fontSize:11, fontWeight:700,
            }}>{glyph}</span>
            <div style={{ flex:1, minWidth:0 }}>
              <div className="serif" style={{ fontSize:15, letterSpacing:'-0.005em', lineHeight:1.2 }}>
                {t.title}
              </div>
              {t.body && (
                <div style={{ fontSize:12, color:'rgba(250,250,247,.65)', marginTop:3, lineHeight:1.4 }}>
                  {t.body}
                </div>
              )}
            </div>
            <button onClick={()=>dismiss(t.id)} aria-label="Dismiss" style={{
              appearance:'none', border:0, background:'transparent',
              color:'rgba(250,250,247,.55)', cursor:'pointer',
              fontSize:14, padding:2, lineHeight:1,
            }}>✕</button>
          </div>
        );
      })}
    </div>
  );
}

export function emitToast(detail: ToastDetail) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('toast', { detail }));
  }
}
