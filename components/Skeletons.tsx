'use client';

import * as React from 'react';

type SkeletonProps = {
  w?: string | number;
  h?: string | number;
  radius?: number;
  block?: boolean;
  style?: React.CSSProperties;
  className?: string;
};

export function Skeleton({ w='100%', h=12, radius=3, block=false, style={}, className='' }: SkeletonProps) {
  return (
    <span className={`skel ${className}`} style={{
      display: block ? 'block' : 'inline-block',
      width: typeof w==='number' ? `${w}px` : w,
      height: typeof h==='number' ? `${h}px` : h,
      borderRadius: radius,
      background: 'linear-gradient(90deg, rgba(20,10,40,.04) 0%, rgba(20,10,40,.09) 45%, rgba(20,10,40,.04) 100%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.4s linear infinite',
      verticalAlign:'middle',
      ...style,
    }}/>
  );
}

export function SkeletonCircle({ size=32, style={} }: { size?: number; style?: React.CSSProperties }) {
  return (
    <span style={{
      display:'inline-block', width:size, height:size, borderRadius:999,
      background:'linear-gradient(135deg, rgba(20,10,40,.08), rgba(20,10,40,.04))',
      flexShrink:0,
      animation:'pulseBg 1.6s ease-in-out infinite',
      ...style,
    }}/>
  );
}

type Col = { w?: string; lines?: 1 | 2; head?: number | string; avatar?: boolean; w1?: string; w2?: string };

export function TableSkeleton({ rows=6, colTmpl, columns, showHeader=true }: { rows?: number; colTmpl: string; columns: Col[]; showHeader?: boolean }) {
  return (
    <section style={{ border:'1px solid var(--hair)', borderRadius:14, background:'#fff', overflow:'hidden' }}>
      {showHeader && (
        <div style={{
          display:'grid', gridTemplateColumns: colTmpl, gap:16,
          padding:'10px 20px', borderBottom:'1px solid var(--hair)',
          background:'var(--paper-2)',
        }}>
          {columns.map((c,i)=>(
            <Skeleton key={i} h={8} w={c.head || 80} radius={2}/>
          ))}
        </div>
      )}
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} style={{
          display:'grid', gridTemplateColumns: colTmpl, gap:16,
          padding:'14px 20px', alignItems:'center',
          borderBottom: r < rows-1 ? '1px solid var(--hair)' : 'none',
          animationDelay: `${r * 60}ms`,
          opacity: 0, animation: `fadeUp .4s var(--ease) ${r * 60}ms both`,
        }}>
          {columns.map((c,i)=>(
            <div key={i} style={{ display:'flex', alignItems:'center', gap:10 }}>
              {c.avatar && <SkeletonCircle size={32}/>}
              <div style={{ flex:1, minWidth:0 }}>
                <Skeleton w={c.w1 || '70%'} h={10} block/>
                {c.lines === 2 && <Skeleton w={c.w2 || '45%'} h={7} block style={{ marginTop:6 }}/>}
              </div>
            </div>
          ))}
        </div>
      ))}
    </section>
  );
}

export function KPIStripSkeleton({ count=5 }: { count?: number }) {
  return (
    <section style={{
      display:'flex', border:'1px solid var(--hair)', borderRadius:14,
      background:'#fff', overflow:'hidden',
    }}>
      {Array.from({ length: count }).map((_,i)=>(
        <div key={i} style={{
          flex:1, padding:'16px 18px',
          borderRight: i < count-1 ? '1px solid var(--hair)' : 'none',
          animationDelay: `${i * 80}ms`,
          opacity:0, animation:`fadeUp .4s var(--ease) ${i*80}ms both`,
        }}>
          <Skeleton h={8} w={70} block/>
          <Skeleton h={22} w="60%" block style={{ marginTop:10 }}/>
          <Skeleton h={7} w={50} block style={{ marginTop:8 }}/>
        </div>
      ))}
    </section>
  );
}

export function CardSkeleton({ height=160, lines=3 }: { height?: number; lines?: number }) {
  return (
    <div style={{
      border:'1px solid var(--hair)', borderRadius:14, background:'#fff',
      padding:'18px 20px', minHeight: height,
      display:'flex', flexDirection:'column', gap:10,
    }}>
      <Skeleton h={8} w={60} block/>
      <Skeleton h={18} w="80%" block/>
      {Array.from({ length: lines }).map((_,i)=>(
        <Skeleton key={i} h={9} w={`${60 + Math.random()*35}%`} block/>
      ))}
    </div>
  );
}

export function MastheadSkeleton({ showSubtitle=true }: { showSubtitle?: boolean }) {
  return (
    <section style={{ paddingBottom:20, borderBottom:'1px solid var(--hair)' }}>
      <Skeleton h={8} w={110} block style={{ marginBottom:14 }}/>
      <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', gap:24, flexWrap:'wrap' }}>
        <div style={{ flex:'1 1 360px' }}>
          <Skeleton h={38} w="85%" block/>
          <Skeleton h={38} w="55%" block style={{ marginTop:6 }}/>
        </div>
        {showSubtitle && (
          <div style={{ flex:'0 1 260px', textAlign:'right' }}>
            <Skeleton h={10} w="100%" block/>
            <Skeleton h={10} w="70%" block style={{ marginTop:6, marginLeft:'auto' }}/>
          </div>
        )}
      </div>
    </section>
  );
}

export function TopProgress({ active }: { active: boolean }) {
  const [progress, setProgress] = React.useState(0);
  React.useEffect(() => {
    if (!active) { setProgress(0); return; }
    setProgress(0);
    const t1 = setTimeout(()=> setProgress(35), 20);
    const t2 = setTimeout(()=> setProgress(68), 180);
    const t3 = setTimeout(()=> setProgress(92), 420);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [active]);

  return (
    <div style={{
      position:'fixed', top:0, left:0, right:0, height:2, zIndex:300,
      pointerEvents:'none',
    }}>
      <div style={{
        height:'100%', width: `${progress}%`,
        background:'var(--plum-700)',
        transition:'width .3s var(--ease), opacity .3s',
        opacity: active ? 1 : 0,
        boxShadow:'0 0 10px rgba(59,30,94,.5)',
      }}/>
    </div>
  );
}

export function useInitialLoad(ms = 900) {
  const [loading, setLoading] = React.useState(true);
  React.useEffect(() => {
    const t = setTimeout(() => setLoading(false), ms);
    return () => clearTimeout(t);
  }, [ms]);
  return loading;
}

type Variant = 'kpi-table' | 'kpi-cards' | 'simple' | 'compose' | 'cards' | 'form' | 'detail';

export function PageSkeleton({ variant='kpi-table', padded=true }: { variant?: Variant; padded?: boolean }) {
  const padding = padded ? '36px 36px 80px' : '0';
  const G = ({ children, gap=24 }: { children: React.ReactNode; gap?: number }) => (
    <div style={{ padding, display:'flex', flexDirection:'column', gap }}>{children}</div>
  );
  if (variant === 'kpi-table') {
    return (
      <G>
        <MastheadSkeleton/>
        <KPIStripSkeleton count={5}/>
        <div style={{ display:'flex', gap:8, marginTop:4 }}>
          <Skeleton h={32} w={110} radius={8}/>
          <Skeleton h={32} w={110} radius={8}/>
          <Skeleton h={32} w={110} radius={8}/>
        </div>
        <TableSkeleton rows={7} colTmpl="minmax(0, 2fr) 1.4fr 130px 130px 110px 60px"
          columns={[
            { avatar:true, lines:2, w1:'70%', w2:'45%', head:60 },
            { lines:2, w1:'80%', w2:'55%', head:60 },
            { lines:1, w1:'70%', head:50 },
            { lines:1, w1:'60%', head:50 },
            { lines:1, w1:'50%', head:50 },
            { lines:1, w1:'40%', head:30 },
          ]}/>
      </G>
    );
  }
  if (variant === 'kpi-cards') {
    return (
      <G>
        <MastheadSkeleton/>
        <KPIStripSkeleton count={4}/>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap:16 }}>
          {Array.from({ length:6 }).map((_,i)=> (
            <CardSkeleton key={i} height={170} lines={3}/>
          ))}
        </div>
      </G>
    );
  }
  if (variant === 'simple') {
    return (
      <G>
        <MastheadSkeleton/>
        <TableSkeleton rows={6} colTmpl="minmax(0, 2fr) 1.4fr 130px 110px 60px"
          columns={[
            { avatar:true, lines:2, w1:'70%', w2:'45%', head:60 },
            { lines:2, w1:'80%', w2:'55%', head:60 },
            { lines:1, w1:'70%', head:50 },
            { lines:1, w1:'50%', head:50 },
            { lines:1, w1:'40%', head:30 },
          ]}/>
      </G>
    );
  }
  if (variant === 'compose') {
    return (
      <G>
        <MastheadSkeleton/>
        <div style={{ display:'grid', gridTemplateColumns:'minmax(260px, 320px) minmax(0, 1fr)', gap:24 }}>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {Array.from({ length:8 }).map((_,i)=> (
              <div key={i} style={{ display:'flex', gap:10, alignItems:'center', padding:'10px 0', borderBottom:'1px solid var(--hair)' }}>
                <SkeletonCircle size={28}/>
                <div style={{ flex:1 }}>
                  <Skeleton h={10} w="70%" block/>
                  <Skeleton h={7} w="50%" block style={{ marginTop:6 }}/>
                </div>
              </div>
            ))}
          </div>
          <div style={{ border:'1px solid var(--hair)', borderRadius:14, background:'#fff', padding:'22px 26px', display:'flex', flexDirection:'column', gap:14 }}>
            <Skeleton h={9} w={80} block/>
            <Skeleton h={32} w="100%" radius={8}/>
            <Skeleton h={9} w={80} block style={{ marginTop:6 }}/>
            <Skeleton h={32} w="100%" radius={8}/>
            <Skeleton h={9} w={80} block style={{ marginTop:6 }}/>
            <div style={{ height:200, borderRadius:8, background:'var(--paper-2)', position:'relative', overflow:'hidden' }}>
              <div style={{ padding:'14px 16px' }}>
                <Skeleton h={9} w="80%" block/>
                <Skeleton h={9} w="65%" block style={{ marginTop:8 }}/>
                <Skeleton h={9} w="70%" block style={{ marginTop:8 }}/>
                <Skeleton h={9} w="55%" block style={{ marginTop:8 }}/>
              </div>
            </div>
          </div>
        </div>
      </G>
    );
  }
  if (variant === 'cards') {
    return (
      <G>
        <MastheadSkeleton/>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(320px, 1fr))', gap:18 }}>
          {Array.from({ length:6 }).map((_,i)=> (
            <CardSkeleton key={i} height={200} lines={4}/>
          ))}
        </div>
      </G>
    );
  }
  if (variant === 'form') {
    return (
      <G>
        <MastheadSkeleton showSubtitle={false}/>
        <div style={{ display:'flex', flexDirection:'column', gap:18, maxWidth: 720 }}>
          {Array.from({ length:6 }).map((_,i)=> (
            <div key={i} style={{ display:'flex', flexDirection:'column', gap:8 }}>
              <Skeleton h={9} w={110} block/>
              <Skeleton h={40} w="100%" radius={10}/>
            </div>
          ))}
          <div style={{ display:'flex', gap:10, marginTop:8 }}>
            <Skeleton h={42} w={140} radius={10}/>
            <Skeleton h={42} w={120} radius={10}/>
          </div>
        </div>
      </G>
    );
  }
  if (variant === 'detail') {
    return (
      <G gap={28}>
        <KPIStripSkeleton count={6}/>
        <MastheadSkeleton/>
        <div style={{ display:'grid', gridTemplateColumns:'minmax(0, 1fr) 320px', gap:28 }}>
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <Skeleton h={9} w={90} block/>
            <Skeleton h={11} w="92%" block/>
            <Skeleton h={11} w="88%" block/>
            <Skeleton h={11} w="78%" block/>
            <Skeleton h={11} w="60%" block/>
            <div style={{ height:8 }}/>
            <Skeleton h={9} w={120} block/>
            <Skeleton h={11} w="90%" block/>
            <Skeleton h={11} w="82%" block/>
            <Skeleton h={11} w="74%" block/>
            <div style={{ height:14 }}/>
            <CardSkeleton height={160} lines={3}/>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <CardSkeleton height={120} lines={2}/>
            <CardSkeleton height={120} lines={2}/>
            <CardSkeleton height={140} lines={3}/>
          </div>
        </div>
      </G>
    );
  }
  return <G><MastheadSkeleton/></G>;
}

export function LoadingFrame({ keyDep, delay=650, variant='kpi-table', children }: { keyDep: unknown; delay?: number; variant?: Variant; children: React.ReactNode }) {
  const [loading, setLoading] = React.useState(true);
  React.useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => setLoading(false), delay);
    return () => clearTimeout(t);
  }, [keyDep, delay]);
  return (
    <React.Fragment>
      <TopProgress active={loading}/>
      {loading ? <PageSkeleton variant={variant}/> : children}
    </React.Fragment>
  );
}
