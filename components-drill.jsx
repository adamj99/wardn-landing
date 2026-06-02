/* Drill-in drawer + composer dock */

const { useState: useStateD, useMemo: useMemoD, useEffect: useEffectD } = React;
const DD = window.DATA;

function Drawer({ chainId, onClose }) {
  const open = !!chainId;
  const c = open ? DD.CHAINS.find(x => x.id === chainId) : null;

  // stop scroll
  useEffectD(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const series = useMemoD(() => {
    if (!c) return [];
    let s1 = 17, s2 = 91; const a = [], b = [];
    let v1 = c.vote || 99.8, v2 = (c.commission != null ? 100 - c.commission : 95);
    for (let i = 0; i < 60; i++) {
      s1 = (s1*9301+49297)%233280; s2 = (s2*9301+49297)%233280;
      v1 = Math.max(0, Math.min(100, v1 + (s1/233280-0.5)*0.3));
      v2 = Math.max(0, Math.min(100, v2 + (s2/233280-0.5)*0.15));
      if (c.status === 'down' && i > 50) v1 = 0;
      if (c.status === 'degraded' && i > 45) v1 = Math.max(85, v1 - 0.5);
      a.push(v1); b.push(v2);
    }
    return [
      { name: 'Vote %',    values: a, color: chainColor(c.id) },
      { name: 'Skip rate', values: b, color: 'var(--text-3)' },
    ];
  }, [chainId]);

  return (
    <>
      <div className="drawer-bg" data-open={open} onClick={onClose} />
      <aside className="drawer" data-open={open}>
        {c && (
          <>
            <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ width: 12, height: 12, borderRadius: 99, background: `var(${c.cssVar})`, boxShadow: `0 0 0 4px color-mix(in oklab, var(${c.cssVar}) 18%, transparent)` }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 16 }}>{c.name}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {c.type} · {c.status} · {c.alerts} alerts
                </div>
              </div>
              <button className="btn"><Icon name="sparkles" size={12}/> Investigate</button>
              <button className="btn ghost" onClick={onClose}><Icon name="close" size={14} /></button>
            </div>

            <div style={{ padding: 22, display: 'grid', gap: 16 }}>
              {/* KPI strip */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
                {[
                  ['Delegation', fmtDelegation(c.delegation), c.delegationWow],
                  ['Commission', c.commission + '%', ''],
                  ['Vote perf', c.vote != null ? c.vote.toFixed(2) + '%' : '—', c.voteWow || ''],
                  ['Missed 24h', String(c.missed ?? '—'), ''],
                ].map(([l, v, d], i) => (
                  <div key={i} style={{ background: 'var(--bg-card)', border: '1px solid var(--line)', borderRadius: 10, padding: 12 }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{l}</div>
                    <div className="num" style={{ fontSize: 22, marginTop: 4 }}>{v}</div>
                    {d && <div className="num" style={{ fontSize: 11, color: d.startsWith('-') ? 'var(--bad)' : d.startsWith('+0') ? 'var(--text-3)' : 'var(--ok)' }}>{d}</div>}
                  </div>
                ))}
              </div>

              {/* Big chart */}
              <div className="card">
                <div className="card-h">
                  <h3>Vote performance · 60 epochs</h3>
                  <div className="tabs">
                    <button data-on="true">1h</button>
                    <button>6h</button>
                    <button>24h</button>
                    <button>7d</button>
                  </div>
                </div>
                <MultiLine series={series} height={180}
                           labels={['-60','-45','-30','-15','now']} />
              </div>

              {/* Validators */}
              <div className="card">
                <div className="card-h">
                  <h3>Instances · 5 nodes</h3>
                  <span className="meta">us-east-1, us-west-2, eu-central-1</span>
                </div>
                {[
                  { name: c.id+'-val-01', region: 'us-east-1',    state: 'healthy', stake: '14,210', up: 99.99 },
                  { name: c.id+'-val-02', region: 'us-east-1',    state: 'healthy', stake: '14,210', up: 99.97 },
                  { name: c.id+'-val-03', region: 'us-west-2',    state: c.status === 'down' ? 'down' : 'healthy', stake: '14,210', up: c.status === 'down' ? 91.20 : 99.95 },
                  { name: c.id+'-val-04', region: 'us-west-2',    state: c.status === 'down' ? 'down' : c.status === 'degraded' ? 'degraded' : 'healthy', stake: '14,210', up: c.status === 'down' ? 88.40 : 99.42 },
                  { name: c.id+'-val-05', region: 'eu-central-1', state: 'healthy', stake: '14,179', up: 99.94 },
                ].map((v, i) => (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr 0.6fr 0.6fr 0.6fr', gap: 10, alignItems: 'center', padding: '8px 0', borderBottom: '1px dashed var(--line)', fontSize: 13 }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{v.name}</span>
                    <span style={{ color: 'var(--text-3)', fontSize: 12 }}>{v.region}</span>
                    <span style={{
                      fontFamily: 'var(--font-mono)', fontSize: 10, padding: '2px 6px', borderRadius: 4,
                      width: 'fit-content',
                      background: v.state === 'healthy' ? 'var(--ok-bg)' : v.state === 'degraded' ? 'var(--warn-bg)' : 'var(--bad-bg)',
                      color:      v.state === 'healthy' ? 'var(--ok)'    : v.state === 'degraded' ? 'var(--warn)'    : 'var(--bad)',
                      textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600
                    }}>{v.state}</span>
                    <span className="num" style={{ textAlign: 'right' }}>{v.stake}</span>
                    <span className="num" style={{ textAlign: 'right', color: v.up >= 99.9 ? 'var(--ok)' : v.up >= 99 ? 'var(--warn)' : 'var(--bad)' }}>{v.up.toFixed(2)}%</span>
                  </div>
                ))}
              </div>

              {/* AI summary */}
              <div className="card" style={{ background: 'var(--accent-soft)', borderColor: 'color-mix(in oklab, var(--accent) 30%, var(--line))' }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <Icon name="sparkles" size={14} />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>Claude summary</div>
                    <div style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.5 }}>
                      {c.status === 'down'
                        ? `${c.name} stopped responding at 00:48 UTC. 4/5 instances are unreachable in us-west-2; quorum is lost. Recommended action: roll the affected pods and verify peer connectivity. ETA ~15 min.`
                        : c.status === 'degraded'
                          ? `${c.name} p95 latency has been elevated since 08:22 UTC. The signal correlates with RPC sidecar 404 errors on the us-west-2 cluster. Likely the same incident referenced in INFRA-2419.`
                          : `${c.name} is healthy across all 5 instances. No anomalies in the last 24h. Throughput is ${c.rpsWow} week-over-week.`}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </aside>
    </>
  );
}

function ComposerDock() {
  return (
    <div className="composer-dock">
      <div className="composer">
        <span className="pre"><Icon name="sparkles" size={10} /> Flash</span>
        <input placeholder="Ask about a service, metric, alert, or cost spike — / for skills, @ for files" />
        <span className="meta">Haiku 4.5 OAuth ▾</span>
        <button className="send"><Icon name="arrow" size={14} /></button>
      </div>
    </div>
  );
}

Object.assign(window, { Drawer, ComposerDock });
