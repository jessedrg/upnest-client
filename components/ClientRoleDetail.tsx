'use client';

// ClientRoleDetail — TSX port. Drag pipeline + recruiters working + activity.

import * as React from 'react';
import { ADMIN_DATA, type Candidate, type Recruiter, type RoleRow } from './AdminData';
import { Chip, SectionTitle, Hairline } from './AdminShared';
import { emitToast } from './Toast';

const STAGES = ['New', 'Screening', 'Phone', 'Technical', 'Sent to Client', 'On-site', 'Offer', 'Hired'] as const;
type Stage = typeof STAGES[number];
type Pipeline = Record<Stage, Candidate[]>;

export function ClientRoleDetail({ role, onBack, onCandidate }: {
  role: RoleRow | undefined;
  onBack: () => void;
  onCandidate?: (c: Candidate) => void;
}) {
  if (!role || !role.id) {
    return (
      <div style={{ padding: '80px 48px', textAlign: 'center' }}>
        <div className="mono" style={{ fontSize: 10, letterSpacing: '.22em', color: 'var(--t-4)', marginBottom: 18 }}>
          ROLE NOT FOUND
        </div>
        <h1 className="serif" style={{
          fontSize: 'clamp(36px, 4vw, 52px)', fontStyle: 'italic',
          letterSpacing: '-0.02em', margin: 0,
        }}>
          That role isn&rsquo;t<br/>here anymore.
        </h1>
        <p style={{
          marginTop: 18, color: 'var(--t-3)', fontSize: 14,
          fontFamily: 'var(--serif)', fontStyle: 'italic',
        }}>
          It may have been closed, withdrawn, or you arrived via a stale link.
        </p>
        <button onClick={onBack} style={{
          marginTop: 28, padding: '10px 22px', borderRadius: 999,
          background: 'var(--ink)', color: 'var(--paper)',
          border: 'none', fontFamily: 'var(--mono)', fontSize: 11,
          letterSpacing: '.18em', cursor: 'pointer',
        }}>← BACK TO ROLES</button>
      </div>
    );
  }

  const [r, setR] = React.useState<RoleRow>(role);
  const [pipeline, setPipeline] = React.useState<Pipeline>(() => {
    const cands = ADMIN_DATA.candidates.filter(c => c.roleId === role.id);
    const cols = Object.fromEntries(STAGES.map(s => [s, [] as Candidate[]])) as Pipeline;
    cands.forEach(c => {
      const s = c.stage as Stage;
      if (cols[s]) cols[s].push(c);
    });
    return cols;
  });

  const [dragId, setDragId] = React.useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = React.useState<Stage | null>(null);

  const onDragStart = (c: Candidate) => setDragId(c.id);
  const onDragOver = (e: React.DragEvent, stage: Stage) => { e.preventDefault(); setDragOverCol(stage); };
  const onDragLeave = () => setDragOverCol(null);
  const onDrop = (stage: Stage) => {
    setPipeline(prev => {
      const next: Pipeline = { ...prev };
      let moved: Candidate | null = null;
      for (const k of Object.keys(next) as Stage[]) {
        const i = next[k].findIndex(c => c.id === dragId);
        if (i >= 0) {
          moved = next[k][i];
          next[k] = [...next[k].slice(0, i), ...next[k].slice(i + 1)];
          break;
        }
      }
      if (moved) {
        next[stage] = [...next[stage], { ...moved, stage }];
        emitToast({ kind: 'info', title: `${moved.name} → ${stage}` });
      }
      return next;
    });
    setDragId(null); setDragOverCol(null);
  };

  const holdRole = () => {
    setR(prev => ({ ...prev, status: prev.status === 'paused' ? 'open' : 'paused' }));
    emitToast({ kind: 'info', title: r.status === 'paused' ? 'Role reopened' : 'Role placed on hold' });
  };
  const publishRole = () => {
    emitToast({ kind: 'success', title: 'Role broadcast', body: 'Sent to 4 agencies' });
  };
  const prioritize = () => {
    setR(prev => ({ ...prev, focused: !prev.focused }));
    emitToast({ kind: 'info', title: r.focused ? 'Removed from focused' : 'Added to focused' });
  };

  return (
    <div style={{ padding: '0 0 80px', background: 'var(--paper)' }}>
      {/* masthead */}
      <div style={{ padding: '32px 48px 24px', borderBottom: '1px solid var(--hair)' }}>
        <button onClick={onBack} className="mono" style={{
          appearance: 'none', border: 0, background: 'transparent', cursor: 'pointer',
          fontSize: 10, letterSpacing: '.18em', color: 'var(--t-4)', padding: 0, marginBottom: 14,
        }}>← ROLES</button>

        <div style={{
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
          gap: 32, flexWrap: 'wrap',
        }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div className="mono" style={{ fontSize: 10, letterSpacing: '.18em', color: 'var(--t-4)' }}>
              {r.num} · {r.org.toUpperCase()}
            </div>
            <h1 className="serif" style={{
              fontSize: 'clamp(40px, 5vw, 56px)', fontStyle: 'italic',
              lineHeight: 1.02, letterSpacing: '-0.03em', marginTop: 8,
            }}>{r.title}</h1>
            <div style={{
              display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 14, alignItems: 'center',
            }}>
              <Chip tone="paper">{r.location.toUpperCase()}</Chip>
              <Chip tone="paper">{r.workMode.toUpperCase()}</Chip>
              <Chip tone="paper">{r.salary}</Chip>
              <Chip tone="paper">FEE {r.fee}</Chip>
              {r.focused && <Chip tone="plum">FOCUSED</Chip>}
              {r.priority === 'high' && <Chip tone="warn">HIGH PRIORITY</Chip>}
              {r.confidential && <Chip tone="paper">CONFIDENTIAL</Chip>}
              {r.status === 'paused' && <Chip tone="err">ON HOLD</Chip>}
              <span className="mono" style={{
                fontSize: 10, letterSpacing: '.14em', color: 'var(--t-4)', marginLeft: 6,
              }}>OPENED {r.opened.toUpperCase()}</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button className="btn btn-ghost" onClick={prioritize} style={{ padding: '10px 16px' }}>
              {r.focused ? '★ Unfocus' : '☆ Mark focused'}
            </button>
            <button className="btn btn-ghost" onClick={holdRole} style={{ padding: '10px 16px' }}>
              {r.status === 'paused' ? 'Resume' : 'Hold'}
            </button>
            <button className="btn btn-primary" onClick={publishRole} style={{ padding: '10px 18px' }}>
              Broadcast
            </button>
          </div>
        </div>
      </div>

      {/* stats strip */}
      <div className="stat-strip" style={{ display: 'flex', borderBottom: '1px solid var(--hair)' }}>
        <KpiTileCompact label="CANDIDATES" value={r.candidates}/>
        <KpiTileCompact label="RECRUITERS" value={r.recruiters}/>
        <KpiTileCompact label="AVG TTA" value={r.tta}/>
        <KpiTileCompact label="AGE" value={r.age + 'd'}/>
        <KpiTileCompact label="OFFERS" value={(pipeline['Offer'] || []).length}/>
        <KpiTileCompact label="HIRED" value={(pipeline['Hired'] || []).length}/>
      </div>

      {/* kanban */}
      <div style={{ padding: '32px 32px 24px' }}>
        <SectionTitle num="§ 01" title="Pipeline" sub="DRAG TO MOVE CANDIDATES BETWEEN STAGES"/>
        <Hairline/>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(8, minmax(220px, 1fr))',
          gap: 12, overflowX: 'auto', paddingBottom: 8,
        }}>
          {STAGES.map(stage => {
            const col = pipeline[stage] || [];
            const isOver = dragOverCol === stage;
            return (
              <div
                key={stage}
                onDragOver={e => onDragOver(e, stage)}
                onDragLeave={onDragLeave}
                onDrop={() => onDrop(stage)}
                style={{
                  background: isOver
                    ? 'color-mix(in oklch, var(--plum-600) 8%, var(--paper))' : '#fff',
                  border: '1px solid',
                  borderColor: isOver ? 'var(--plum-600)' : 'var(--hair)',
                  borderRadius: 4, minHeight: 300,
                  display: 'flex', flexDirection: 'column',
                  transition: 'background .15s, border-color .15s',
                }}
              >
                <div style={{
                  padding: '14px 14px 10px', borderBottom: '1px solid var(--hair)',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <div className="mono" style={{
                    fontSize: 10, letterSpacing: '.16em', color: 'var(--t-3)',
                  }}>{stage.toUpperCase()}</div>
                  <div className="mono" style={{
                    fontSize: 10, letterSpacing: '.12em', color: 'var(--t-4)',
                  }}>{col.length}</div>
                </div>
                <div style={{ padding: 8, display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
                  {col.length === 0 && (
                    <div style={{
                      padding: '24px 8px', textAlign: 'center', color: 'var(--t-4)',
                      fontSize: 11, fontFamily: 'var(--mono)', letterSpacing: '.14em',
                    }}>—</div>
                  )}
                  {col.map(c => (
                    <div
                      key={c.id}
                      draggable
                      onDragStart={() => onDragStart(c)}
                      onClick={() => onCandidate && onCandidate(c)}
                      style={{
                        background: 'var(--paper)', border: '1px solid var(--hair)',
                        padding: '10px 12px', cursor: 'grab',
                        opacity: dragId === c.id ? 0.3 : 1, transition: 'opacity .15s',
                      }}
                    >
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <div style={{
                          width: 24, height: 24, borderRadius: 999,
                          background: 'var(--ink)', color: 'var(--paper)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontFamily: 'var(--serif)', fontStyle: 'italic',
                          fontSize: 10, flexShrink: 0,
                        }}>{c.initials}</div>
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div style={{
                            fontFamily: 'var(--serif)', fontStyle: 'italic',
                            fontSize: 14, letterSpacing: '-0.01em',
                            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                          }}>{c.name}</div>
                          <div className="mono" style={{
                            fontSize: 9, letterSpacing: '.12em', color: 'var(--t-4)', marginTop: 1,
                          }}>{c.current.toUpperCase()}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* recruiters working */}
      <div style={{ padding: '24px 48px' }}>
        <SectionTitle num="§ 02" title="Recruiters working this role"/>
        <Hairline/>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {ADMIN_DATA.recruiters
            .filter((rc: Recruiter) => rc.status === 'active')
            .slice(0, r.recruiters)
            .map(rc => (
              <div key={rc.id} style={{
                display: 'grid',
                gridTemplateColumns: '44px 1fr auto auto auto auto',
                gap: 18, alignItems: 'center',
                padding: '14px 0', borderBottom: '1px solid var(--hair)',
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 999,
                  background: 'var(--ink)', color: 'var(--paper)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 14,
                }}>
                  {rc.name.split(' ').map(s => s[0]).slice(0, 2).join('')}
                </div>
                <div>
                  <div style={{
                    fontFamily: 'var(--serif)', fontSize: 17, fontStyle: 'italic', letterSpacing: '-0.01em',
                  }}>{rc.name}</div>
                  <div className="mono" style={{
                    fontSize: 10, letterSpacing: '.14em', color: 'var(--t-4)', marginTop: 2,
                  }}>{rc.org.toUpperCase()} · {rc.tier.toUpperCase()}</div>
                </div>
                <div className="mono" style={{
                  fontSize: 11, letterSpacing: '.12em', color: 'var(--t-2)',
                }}>
                  {Math.max(1, rc.submitted - 10)} <span style={{ color: 'var(--t-4)' }}>CANDS</span>
                </div>
                <div className="mono" style={{
                  fontSize: 11, letterSpacing: '.12em', color: 'var(--t-2)',
                }}>
                  {rc.placed} <span style={{ color: 'var(--t-4)' }}>PLACED</span>
                </div>
                <button
                  className="btn btn-ghost"
                  style={{ padding: '6px 12px', fontSize: 11 }}
                  onClick={() => emitToast({ kind: 'info', title: 'Message sent to ' + rc.name })}
                >Message</button>
                <button
                  className="btn btn-ghost"
                  style={{ padding: '6px 12px', fontSize: 11 }}
                  onClick={() => emitToast({ kind: 'info', title: 'Recruiter paused on this role' })}
                >Pause</button>
              </div>
            ))}
        </div>
      </div>

      {/* activity */}
      <div style={{ padding: '24px 48px' }}>
        <SectionTitle num="§ 03" title="Role activity"/>
        <Hairline/>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {[
            { at: '14 min ago', actor: 'Jesse Dragstra', verb: 'submitted', target: 'Adrien Novak' },
            { at: '1h ago',     actor: 'You',             verb: 'moved',    target: 'Priya Ramanathan → Technical' },
            { at: '3h ago',     actor: 'Mira Holt',       verb: 'commented', target: '"Strong signal on systems design."' },
            { at: 'yesterday',  actor: 'You',             verb: 'changed fee to', target: '22% (was 20%)' },
            { at: '2d ago',     actor: 'Jesse Dragstra', verb: 'advanced', target: 'Kai Beltran → On-site' },
          ].map((a, i) => (
            <div key={i} style={{
              padding: '12px 0', borderBottom: '1px solid var(--hair)',
              display: 'flex', justifyContent: 'space-between', gap: 14,
            }}>
              <div>
                <span style={{ fontFamily: 'var(--serif)', fontSize: 15, letterSpacing: '-0.01em' }}>{a.actor}</span>
                <span style={{ color: 'var(--t-4)', margin: '0 6px' }}>·</span>
                <span style={{ color: 'var(--t-3)', fontSize: 14 }}>{a.verb}</span>
                <span style={{ color: 'var(--t-4)', margin: '0 6px' }}>·</span>
                <span style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 15 }}>{a.target}</span>
              </div>
              <span className="mono" style={{
                fontSize: 9, letterSpacing: '.14em', color: 'var(--t-4)', whiteSpace: 'nowrap',
              }}>{a.at.toUpperCase()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function KpiTileCompact({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ padding: '16px 22px', borderRight: '1px solid var(--hair)', flex: 1, minWidth: 120 }}>
      <div className="mono" style={{ fontSize: 10, letterSpacing: '.16em', color: 'var(--t-4)' }}>{label}</div>
      <div className="serif" style={{
        fontSize: 30, lineHeight: 1, marginTop: 6, fontStyle: 'italic', letterSpacing: '-0.02em',
      }}>{value}</div>
    </div>
  );
}
