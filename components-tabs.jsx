/* Tab pages: Performance, Cost, Incidents */

const { useState: useStateT } = React;
const DT = window.DATA;

/* ---------- PERFORMANCE TAB ---------- */
function PerformancePage() {
  const totalRPS = DT.CHAINS.reduce((s, c) => s + c.rps, 0);
  const validP95 = DT.CHAINS.filter(c => c.p95 != null);
  const avgP95 = Math.round(validP95.reduce((s, c) => s + c.p95, 0) / validP95.length);
  const errAvg = '0.32';

  return (
    <>
      <div className="kpi-strip">
        <div className="kpi"><div className="lbl">Aggregate RPS</div><div className="val">{(totalRPS/1000).toFixed(1)}k</div><div className="sub up">+4.7% WoW</div></div>
        <div className="kpi"><div className="lbl">p95 latency</div><div className="val">{avgP95}<span className="u">ms</span></div><div className="sub up">+8ms WoW</div></div>
        <div className="kpi"><div className="lbl">Error rate</div><div className="val">{errAvg}<span className="u">%</span></div><div className="sub down">-0.04% WoW</div></div>
        <div className="kpi"><div className="lbl">Saturation</div><div className="val">62<span className="u">%</span></div><div className="sub">2 hosts &gt; 90%</div></div>
      </div>

      <div className="section-h" style={{ marginTop: 8 }}>
        <h2>API Traffic</h2>
        <div className="actions">
          <span style={{ fontSize: 12, color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>4 weeks · all services</span>
        </div>
      </div>
      <RPCTrafficRow />

      <div className="section-h">
        <h2>Latency &amp; throughput by service</h2>
        <div className="actions">
          <div className="tabs">
            <button>1h</button>
            <button data-on="true">24h</button>
            <button>7d</button>
            <button>30d</button>
          </div>
          <button className="btn ghost"><Icon name="download" size={12}/> Export</button>
        </div>
      </div>
      <div className="card">
        <div className="perf-table perf-th">
          <div>Service</div>
          <div style={{ textAlign: 'right' }}>RPS</div>
          <div style={{ textAlign: 'right' }}>p50</div>
          <div style={{ textAlign: 'right' }}>p95</div>
          <div style={{ textAlign: 'right' }}>p99</div>
          <div style={{ textAlign: 'right' }}>Err %</div>
          <div>p95 trend · 24h</div>
        </div>
        {DT.CHAINS.map(c => {
          // synth deterministic 24-pt trend from rps + p95 + chain id
          let s = c.id.charCodeAt(0) * 7 + (c.p95 || 100);
          const trend = [];
          for (let i = 0; i < 24; i++) { s = (s * 9301 + 49297) % 233280; trend.push((c.p95 || 50) * (0.7 + (s / 233280) * 0.6)); }
          const errors = c.status === 'down' ? 8.2 : c.status === 'degraded' ? 1.4 : c.id === 'espresso' ? 0.8 : Math.max(0.02, ((c.p95 || 100) - 80) / 800);
          return (
            <div key={c.id} className="perf-table">
              <div className="rpc-name">
                <span style={{ width: 8, height: 8, borderRadius: 99, background: chainColor(c.id) }} />
                <span style={{ fontWeight: 500 }}>{c.name}</span>
              </div>
              <div className="num" style={{ textAlign: 'right' }}>{c.rps.toLocaleString()}</div>
              <div className="num" style={{ textAlign: 'right' }}>{c.p95 ? Math.round(c.p95 * 0.45) : '—'}<span style={{ color: 'var(--text-3)' }}>{c.p95 ? 'ms' : ''}</span></div>
              <div className="num" style={{ textAlign: 'right', fontWeight: 500, color: c.p95 > 350 ? 'var(--bad)' : c.p95 > 200 ? 'var(--warn)' : 'var(--text)' }}>
                {c.p95 != null ? c.p95 : '—'}<span style={{ color: 'var(--text-3)' }}>{c.p95 ? 'ms' : ''}</span>
              </div>
              <div className="num" style={{ textAlign: 'right' }}>{c.p95 ? Math.round(c.p95 * 1.8) : '—'}<span style={{ color: 'var(--text-3)' }}>{c.p95 ? 'ms' : ''}</span></div>
              <div className="num" style={{ textAlign: 'right', color: errors > 1 ? 'var(--bad)' : errors > 0.5 ? 'var(--warn)' : 'var(--text-2)' }}>{errors.toFixed(2)}</div>
              <div><Sparkline values={trend} color={chainColor(c.id)} height={26} /></div>
            </div>
          );
        })}
      </div>

      <div className="perf-grid" style={{ marginTop: 'var(--gap)' }}>
        <div>
          <div className="section-h"><h2>Latency heatmap · ETH p95 · 24h</h2><div className="actions"><div style={{ fontSize: 12, color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>cool=fast · hot=slow</div></div></div>
          <div className="card">
            <div className="heat">
              {Array.from({ length: 24 * 6 }).map((_, i) => {
                const hr = i % 24;
                const v = Math.max(0, Math.min(1, 0.2 + 0.4 * Math.sin(i / 7) + (hr === 14 || hr === 15 ? 0.45 : 0) + Math.random() * 0.15));
                const color = `oklch(${88 - v * 30}% ${0.04 + v * 0.18} ${v > 0.6 ? '20' : '180'})`;
                return <div key={i} className="heat-cell" style={{ background: color }} />;
              })}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-3)' }}>
              <span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>now</span>
            </div>
          </div>
        </div>
        <div>
          <div className="section-h"><h2>Top slow endpoints</h2></div>
          <div className="card">
            {[
              { ep: 'GET /v2/orders', p95: 980, share: '12.4%', d: '+18%' },
              { ep: 'POST /v2/checkout', p95: 412, share: '8.1%', d: '+4%' },
              { ep: 'GET /v2/search', p95: 287, share: '6.0%', d: '-2%' },
              { ep: 'POST /v2/pricing', p95: 264, share: '4.2%', d: '+11%' },
              { ep: 'GET /v2/profile', p95: 198, share: '3.8%', d: '0%' },
            ].map((r, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 70px 70px', gap: 12, padding: '10px 0', borderTop: i ? '1px dashed var(--line)' : 0, alignItems: 'center', fontSize: 13 }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{r.ep}</div>
                <div className="num" style={{ textAlign: 'right' }}>{r.p95}<span style={{ color: 'var(--text-3)' }}>ms</span></div>
                <div className={'num delta ' + (r.d.startsWith('+') ? 'up' : r.d.startsWith('-') ? 'down' : 'flat')} style={{ textAlign: 'right', fontSize: 12 }}>{r.d}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

/* ---------- COST TAB ---------- */
function CostPage() {
  const c = DT.COST_DETAIL;
  const wow = (((c.total - c.prevTotal) / c.prevTotal) * 100).toFixed(1);
  const projection = Math.round(c.total * 30 / 7);
  const palette = ['#3b82f6', '#a855f7', '#f59e0b', '#10b981', '#64748b'];

  return (
    <>
      <div className="kpi-strip">
        <div className="kpi"><div className="lbl">7-day spend</div><div className="val">${(c.total/1000).toFixed(1)}k</div><div className="sub up">+{wow}% WoW</div></div>
        <div className="kpi"><div className="lbl">30-day projection</div><div className="val">${(projection/1000).toFixed(0)}k</div><div className="sub">vs ${(c.prevTotal*30/7/1000).toFixed(0)}k last cycle</div></div>
        <div className="kpi"><div className="lbl">Cost per 1M req</div><div className="val">$23<span className="u">.40</span></div><div className="sub down">-2.1% WoW</div></div>
        <div className="kpi"><div className="lbl">Top driver</div><div className="val" style={{ fontSize: 18 }}>Datadog</div><div className="sub up">+24% WoW</div></div>
      </div>

      <div className="section-h">
        <h2>Spend breakdown · 7 days</h2>
        <div className="actions">
          <div className="tabs">
            <button>By service</button>
            <button data-on="true">By category</button>
            <button>By region</button>
          </div>
        </div>
      </div>
      <div className="card">
        <div className="cost-stack">
          {c.byCategory.map((cat, i) => (
            <div key={cat.name} style={{ width: `${cat.share * 100}%`, background: palette[i] }}>
              {cat.share > 0.07 ? `${(cat.share * 100).toFixed(0)}%` : ''}
            </div>
          ))}
        </div>
        {c.byCategory.map((cat, i) => {
          const wowCat = (((cat.value - cat.prev) / cat.prev) * 100).toFixed(1);
          const dir = wowCat > 0 ? 'up' : 'down';
          return (
            <div key={cat.name} className="cost-cat">
              <div className="swatch" style={{ background: palette[i] }} />
              <div style={{ fontWeight: 500 }}>{cat.name}</div>
              <div className="cost-cat-bar"><span style={{ width: `${cat.share * 100}%`, '--c': palette[i] }} /></div>
              <div className="num" style={{ textAlign: 'right' }}>${(cat.value/1000).toFixed(2)}k</div>
              <div className={'num delta ' + dir} style={{ textAlign: 'right', fontSize: 12 }}>{wowCat > 0 ? '+' : ''}{wowCat}%</div>
            </div>
          );
        })}
      </div>

      <div className="perf-grid" style={{ marginTop: 'var(--gap)' }}>
        <div>
          <div className="section-h">
            <h2>Datadog ingest · top line items</h2>
            <div className="actions"><span className="badge warn"><span className="dot" /> +24% MoM</span></div>
          </div>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="dd-grid">
              {c.ddLineItems.map(it => {
                const dir = it.wow.startsWith('+') ? 'up' : 'down';
                return (
                  <div key={it.name} className="dd-item">
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-3)' }}>{it.name}</div>
                    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: 4 }}>
                      <div className="num" style={{ fontSize: 18, fontWeight: 500 }}>{it.val}</div>
                      <div className={'num delta ' + dir} style={{ fontSize: 12 }}>{it.wow}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <div>
          <div className="section-h"><h2>Cost-saving opportunities</h2></div>
          <div className="card">
            {[
              { t: 'Drop debug logs from log-pipeline pods', s: '$420/mo', conf: 0.92, e: 'Logs Indexed +81% but error rate flat' },
              { t: 'Right-size ingest-worker hosts', s: '$310/mo', conf: 0.84, e: 'CPU avg 18% across 4 nodes' },
              { t: 'Move cold object storage to S3-IA', s: '$180/mo', conf: 0.78, e: 'Read freq < 1/day for objects &gt; 30d' },
              { t: 'Consolidate APM custom metrics', s: '$140/mo', conf: 0.71, e: '94k metrics, 38% with no dashboards' },
            ].map((o, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 80px 70px', gap: 12, padding: '12px 0', borderTop: i ? '1px dashed var(--line)' : 0, alignItems: 'start' }}>
                <div>
                  <div style={{ fontWeight: 500, fontSize: 13, marginBottom: 2 }}>{o.t}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-3)' }}>{o.e}</div>
                </div>
                <div className="num" style={{ textAlign: 'right', color: 'var(--ok)', fontWeight: 500 }}>{o.s}</div>
                <div style={{ textAlign: 'right', fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-3)' }}>{(o.conf*100).toFixed(0)}% conf</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

/* ---------- INCIDENTS TAB ---------- */
function IncidentsPage() {
  const open = DT.INCIDENTS.filter(i => i.status !== 'resolved');
  const resolved = DT.INCIDENTS.filter(i => i.status === 'resolved');
  const ackCount = DT.ALERTS_FEED.filter(a => a.ack).length;
  const totalAlerts = DT.ALERTS_FEED.filter(a => a.open).length;

  return (
    <>
      <div className="kpi-strip">
        <div className="kpi"><div className="lbl">Open incidents</div><div className="val" style={{ color: 'var(--bad)' }}>{open.length}</div><div className="sub">{open.filter(i => i.sev === 'SEV-1').length} SEV-1</div></div>
        <div className="kpi"><div className="lbl">Active alerts</div><div className="val">{totalAlerts}</div><div className="sub">{ackCount} acknowledged</div></div>
        <div className="kpi"><div className="lbl">MTTR · 30d</div><div className="val">42<span className="u">m</span></div><div className="sub down">-18% MoM</div></div>
        <div className="kpi"><div className="lbl">On-call</div><div className="val" style={{ fontSize: 18 }}>a.kim</div><div className="sub">primary · until 18:00</div></div>
      </div>

      <div className="section-h">
        <h2>Incident log</h2>
        <div className="actions">
          <div className="tabs">
            <button data-on="true">All</button>
            <button>Open</button>
            <button>Resolved</button>
          </div>
          <button className="btn ghost"><Icon name="plus" size={12}/> Declare incident</button>
        </div>
      </div>
      <div className="card">
        <div className="inc-row perf-th" style={{ cursor: 'default' }}>
          <div>ID</div><div>Severity</div><div>Title</div><div>Service</div><div>Status</div><div>Opened</div><div>MTTR</div><div>Alerts</div>
        </div>
        {DT.INCIDENTS.map(inc => (
          <div key={inc.id} className="inc-row">
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-3)' }}>{inc.id}</div>
            <div>
              <span className={'sev-pill ' + (inc.sev === 'SEV-1' ? 'sev-1' : inc.sev === 'SEV-2' ? 'sev-2' : 'sev-3')}>{inc.sev}</span>
            </div>
            <div style={{ fontWeight: 500 }}>{inc.title}</div>
            <div className="rpc-name">
              <span style={{ width: 7, height: 7, borderRadius: 99, background: chainColor(inc.chain) }} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{chainName(inc.chain)}</span>
            </div>
            <div>
              <span className={'badge ' + (inc.status === 'resolved' ? 'ok' : inc.status === 'investigating' ? 'bad' : 'warn')}>
                <span className="dot" /> {inc.status}
              </span>
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-3)' }}>{inc.opened}</div>
            <div className="num" style={{ fontSize: 12 }}>{inc.mttr || '—'}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-3)' }}>{inc.attached}</div>
          </div>
        ))}
      </div>

      <div className="section-h" style={{ marginTop: 'var(--gap)' }}>
        <h2>Datadog alerts · live feed</h2>
        <div className="actions">
          <span className="badge"><span className="dot" style={{ background: 'var(--bad)' }} /> {totalAlerts} firing</span>
          <button className="btn ghost"><Icon name="sparkles" size={12}/> Summarize for standup</button>
        </div>
      </div>
      <div className="card">
        <div className="alert-row perf-th" style={{ cursor: 'default' }}>
          <div>Sev</div><div>Alert</div><div>Service</div><div>Started</div><div>Duration</div>
        </div>
        {DT.ALERTS_FEED.map(a => (
          <div key={a.id} className="alert-row" style={{ opacity: a.open ? 1 : 0.55 }}>
            <div>
              <span className={'sev-pill ' + (a.sev === 'P1' ? 'sev-1' : a.sev === 'P2' ? 'sev-2' : 'sev-3')}>{a.sev}</span>
            </div>
            <div className="alert-title" title={a.title}>
              {a.ack && <span style={{ color: 'var(--text-3)', marginRight: 6, fontSize: 10 }}>[ACK]</span>}
              {a.title}
              {!a.open && <span style={{ color: 'var(--ok)', marginLeft: 8, fontSize: 11 }}>· resolved {a.resolved}</span>}
            </div>
            <div className="rpc-name">
              <span style={{ width: 6, height: 6, borderRadius: 99, background: chainColor(a.chain) }} />
              <span style={{ fontSize: 12 }}>{chainName(a.chain)}</span>
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-3)' }}>{a.at}</div>
            <div className="num" style={{ fontSize: 12 }}>{a.dur}</div>
          </div>
        ))}
      </div>
    </>
  );
}

/* ---------- Open Alerts strip (Overview) ---------- */
function OpenAlertsStrip() {
  const open = DT.ALERTS_FEED.filter(a => a.open);
  const p1 = open.filter(a => a.sev === 'P1');
  const p2 = open.filter(a => a.sev === 'P2');
  const p3 = open.filter(a => a.sev === 'P3');
  const ack = open.filter(a => a.ack).length;
  const top = [...p1, ...p2, ...p3].slice(0, 3);

  return (
    <>
      <div className="section-h">
        <h2>Open alerts</h2>
        <div className="actions">
          <span className="badge bad"><span className="dot" /> {p1.length} P1</span>
          <span className="badge warn"><span className="dot" /> {p2.length} P2</span>
          <span className="badge"><span className="dot" /> {p3.length} P3</span>
          <span style={{ fontSize: 12, color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>· {ack} ACKed</span>
          <button className="btn ghost"><Icon name="sparkles" size={12} /> Summarize</button>
        </div>
      </div>
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', minHeight: 88 }}>
          <div style={{ padding: '14px 18px', borderRight: '1px solid var(--line)', background: 'var(--bg-sunken)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-3)', fontWeight: 600 }}>Firing now</div>
            <div className="num" style={{ fontSize: 32, fontWeight: 500, letterSpacing: '-0.02em', lineHeight: 1.1, marginTop: 4 }}>{open.length}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>{open.length - ack} unacked</div>
          </div>
          <div style={{ padding: '6px 0' }}>
            {top.map(a => (
              <div key={a.id} className="alert-row" style={{ padding: '10px 18px', borderTop: '1px dashed var(--line)' }}>
                <div>
                  <span className={'sev-pill ' + (a.sev === 'P1' ? 'sev-1' : a.sev === 'P2' ? 'sev-2' : 'sev-3')}>{a.sev}</span>
                </div>
                <div className="alert-title" title={a.title}>
                  {a.ack && <span style={{ color: 'var(--text-3)', marginRight: 6, fontSize: 10 }}>[ACK]</span>}
                  {a.title}
                </div>
                <div className="rpc-name">
                  <span style={{ width: 6, height: 6, borderRadius: 99, background: chainColor(a.chain) }} />
                  <span style={{ fontSize: 12 }}>{chainName(a.chain)}</span>
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-3)' }}>{a.at}</div>
                <div className="num" style={{ fontSize: 12 }}>{a.dur}</div>
              </div>
            ))}
            {open.length > top.length && (
              <div style={{ padding: '8px 18px', borderTop: '1px dashed var(--line)', fontSize: 12, color: 'var(--text-3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>{open.length - top.length} more open · oldest started {open[open.length-1].at}</span>
                <button className="btn ghost" style={{ fontSize: 11 }}>View all in Incidents →</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

/* ---------- Validators tab ---------- */
function ValidatorsPage() {
  const totalDelegation = DT.CHAINS.reduce((s, c) => s + (c.delegation || 0), 0);
  const totalRewards = DT.CHAINS.reduce((s, c) => s + (c.rewardsDay || 0), 0);
  const avgVote = (DT.CHAINS.filter(c => c.vote != null).reduce((s, c) => s + c.vote, 0) / DT.CHAINS.filter(c => c.vote != null).length).toFixed(2);
  const slashEvents = 0;

  const sortedByDelegation = [...DT.CHAINS].sort((a, b) => (b.delegation || 0) - (a.delegation || 0));
  const maxDel = Math.max(...DT.CHAINS.map(c => c.delegation || 0));

  return (
    <>
      <div className="kpi-strip">
        <div className="kpi"><div className="lbl">Total delegation</div><div className="val">${(totalDelegation/1_000_000).toFixed(1)}<span className="u">M</span></div><div className="sub up">+$2.1M WoW</div></div>
        <div className="kpi"><div className="lbl">Daily rewards</div><div className="val">${totalRewards ? (totalRewards/1000).toFixed(1) : '12.4'}<span className="u">k</span></div><div className="sub up">+3.8% WoW</div></div>
        <div className="kpi"><div className="lbl">Avg vote perf</div><div className="val">{avgVote}<span className="u">%</span></div><div className="sub down">-0.4% MoM</div></div>
        <div className="kpi"><div className="lbl">Slashing events</div><div className="val" style={{ color: slashEvents ? 'var(--bad)' : 'var(--text)' }}>{slashEvents}</div><div className="sub">last 30d</div></div>
      </div>

      <div className="section-h">
        <h2>Validator Fleet · {DT.CHAINS.length} networks</h2>
        <div className="actions">
          <div className="tabs">
            <button data-on="true">Cards</button>
            <button>Table</button>
          </div>
          <button className="btn ghost"><Icon name="download" size={12}/> Export</button>
        </div>
      </div>
      <FleetGrid headerless />

      <CompareRail />

      <div className="section-h" style={{ marginTop: 'var(--gap)' }}>
        <h2>Delegation by network</h2>
        <div className="actions">
          <div className="tabs"><button data-on="true">USD</button><button>Native</button></div>
        </div>
      </div>
      <div className="card">
        {sortedByDelegation.map((c, i) => {
          const dwowDir = c.delegationWow && c.delegationWow.startsWith('-') ? 'down' : c.delegationWow && c.delegationWow.startsWith('+') ? 'up' : 'flat';
          return (
            <div key={c.id} style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr 100px 80px 90px', gap: 16, alignItems: 'center', padding: '11px 0', borderTop: i ? '1px dashed var(--line)' : 0, fontSize: 13 }}>
              <div className="rpc-name">
                <span style={{ width: 8, height: 8, borderRadius: 99, background: chainColor(c.id) }} />
                <span style={{ fontWeight: 500 }}>{c.name}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{c.type}</span>
              </div>
              <div className="rpc-bar">
                <div className="bar-cell" style={{ '--c': chainColor(c.id) }}>
                  <div className="bar"><span style={{ width: `${((c.delegation || 0) / maxDel) * 100}%` }}/></div>
                </div>
              </div>
              <div className="num" style={{ textAlign: 'right' }}>${fmtDelegation(c.delegation)}</div>
              <div className={'num delta ' + dwowDir} style={{ textAlign: 'right', fontSize: 12 }}>{c.delegationWow || '—'}</div>
              <div className="num" style={{ textAlign: 'right', color: c.vote >= 99.5 ? 'var(--ok)' : c.vote >= 95 ? 'var(--warn)' : 'var(--bad)' }}>
                {c.vote != null ? c.vote.toFixed(2) + '%' : '—'}
              </div>
            </div>
          );
        })}
      </div>

      <div className="perf-grid" style={{ marginTop: 'var(--gap)' }}>
        <div>
          <div className="section-h"><h2>Stake flows · 7 days</h2></div>
          <div className="card">
            {[
              { c: 'somnia',   t: 'Inflow',  amt: '+$1.84M', ev: '12 new delegators · top: 0x4f...8a' },
              { c: 'eth',      t: 'Inflow',  amt: '+$620k',  ev: 'Existing delegator topped up' },
              { c: 'solana',   t: 'Outflow', amt: '-$340k',  ev: '4 delegators · likely vote-perf related' },
              { c: 'monad',    t: 'Outflow', amt: '-$110k',  ev: 'Halt-driven · 2 delegators' },
              { c: 'starknet', t: 'Inflow',  amt: '+$48k',   ev: 'Steady accumulation' },
            ].map((f, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '110px 60px 1fr 90px', gap: 12, alignItems: 'center', padding: '10px 0', borderTop: i ? '1px dashed var(--line)' : 0, fontSize: 13 }}>
                <div className="rpc-name">
                  <span style={{ width: 7, height: 7, borderRadius: 99, background: chainColor(f.c) }} />
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{chainName(f.c)}</span>
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em', color: f.t === 'Inflow' ? 'var(--ok)' : 'var(--bad)', fontWeight: 600 }}>{f.t}</div>
                <div style={{ fontSize: 12, color: 'var(--text-3)' }}>{f.ev}</div>
                <div className="num" style={{ textAlign: 'right', fontWeight: 500, color: f.amt.startsWith('+') ? 'var(--ok)' : 'var(--bad)' }}>{f.amt}</div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="section-h"><h2>Vote performance · 24h</h2></div>
          <div className="card">
            {DT.CHAINS.filter(c => c.vote != null).sort((a, b) => b.vote - a.vote).map((c, i, arr) => (
              <div key={c.id} style={{ display: 'grid', gridTemplateColumns: '1.4fr 2fr 70px', gap: 12, alignItems: 'center', padding: '9px 0', borderTop: i ? '1px dashed var(--line)' : 0, fontSize: 13 }}>
                <div className="rpc-name">
                  <span style={{ width: 7, height: 7, borderRadius: 99, background: chainColor(c.id) }} />
                  <span>{c.name}</span>
                </div>
                <div className="rpc-bar">
                  <div className="bar-cell" style={{ '--c': c.vote >= 99.5 ? 'var(--ok)' : c.vote >= 95 ? 'var(--warn)' : 'var(--bad)' }}>
                    <div className="bar"><span style={{ width: `${c.vote}%` }} /></div>
                  </div>
                </div>
                <div className="num" style={{ textAlign: 'right', fontSize: 12, color: c.vote >= 99.5 ? 'var(--ok)' : c.vote >= 95 ? 'var(--warn)' : 'var(--bad)' }}>
                  {c.vote.toFixed(2)}%
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

/* ---------- Linear tickets (Overview) ---------- */
function LinearTickets() {
  const tickets = DT.LINEAR_TICKETS;
  const open = tickets.filter(t => t.status !== 'Done');
  const inProgress = tickets.filter(t => t.status === 'In Progress').length;
  const inReview = tickets.filter(t => t.status === 'In Review').length;
  const todo = tickets.filter(t => t.status === 'Todo').length;
  const myAssigned = tickets.filter(t => t.assignee === 'a.kim' && t.status !== 'Done').length;

  const statusColor = s => s === 'Done' ? 'var(--ok)' : s === 'In Progress' ? 'var(--accent)' : s === 'In Review' ? '#a855f7' : s === 'Backlog' ? 'var(--text-3)' : 'var(--text-2)';
  const prioColor = p => p === 'Urgent' ? 'var(--bad)' : p === 'High' ? 'var(--warn)' : p === 'Medium' ? 'var(--text-2)' : 'var(--text-3)';

  return (
    <>
      <div className="section-h">
        <h2>Linear · OPS team</h2>
        <div className="actions">
          <span className="badge"><span className="dot" style={{ background: 'var(--accent)' }} /> {inProgress} in progress</span>
          <span className="badge"><span className="dot" style={{ background: '#a855f7' }} /> {inReview} in review</span>
          <span className="badge"><span className="dot" style={{ background: 'var(--text-2)' }} /> {todo} todo</span>
          <span style={{ fontSize: 12, color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>· {myAssigned} assigned to you</span>
          <button className="btn ghost"><Icon name="plus" size={12}/> New issue</button>
        </div>
      </div>
      <div className="card">
        <div style={{ display: 'grid', gridTemplateColumns: '70px 110px 1fr 110px 90px 70px 90px', gap: 12, fontFamily: 'var(--font-mono)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-3)', fontWeight: 600, paddingBottom: 8, borderBottom: '1px solid var(--line)' }}>
          <div>ID</div><div>Status</div><div>Title</div><div>Project</div><div>Priority</div><div>Est</div><div>Updated</div>
        </div>
        {open.map((t, i) => (
          <div key={t.id} style={{ display: 'grid', gridTemplateColumns: '70px 110px 1fr 110px 90px 70px 90px', gap: 12, alignItems: 'center', padding: '11px 0', borderTop: i ? '1px dashed var(--line)' : 0, fontSize: 13, cursor: 'pointer' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-3)' }}>{t.id}</div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
              <span style={{ width: 10, height: 10, borderRadius: 99, border: `2px solid ${statusColor(t.status)}`, background: t.status === 'Done' ? statusColor(t.status) : 'transparent' }} />
              {t.status}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 500, minWidth: 0 }}>
              {t.chain && <span style={{ width: 6, height: 6, borderRadius: 99, background: chainColor(t.chain), flexShrink: 0 }} />}
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.title}</span>
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>{t.project}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600, color: prioColor(t.priority), textTransform: 'uppercase', letterSpacing: '0.04em' }}>{t.priority}</div>
            <div className="num" style={{ fontSize: 12, color: 'var(--text-3)' }}>{t.estimate}d</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-3)' }}>{t.updated}</div>
          </div>
        ))}
      </div>
    </>
  );
}

/* ---------- AUTOMATIONS TAB ---------- */
function AutomationsPage() {
  const [openId, setOpenId] = useStateT(null);
  const [scheduleMode, setScheduleMode] = useStateT('nl'); // 'nl' | 'cron' | 'visual'

  const auto = DT.AUTOMATIONS;
  const active = auto.filter(a => a.status === 'active');
  const paused = auto.filter(a => a.status === 'paused');
  const runsToday = active.length;
  const failingNow = DT.FAILURE_CLUSTERS.reduce((s, f) => s + f.count, 0);
  const totalCostMo = '$148';

  const opened = auto.find(a => a.id === openId);

  return (
    <>
      <div className="kpi-strip" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="kpi"><div className="lbl">Active</div><div className="val">{active.length}</div><div className="sub">{runsToday} runs scheduled today</div></div>
        <div className="kpi"><div className="lbl">Paused</div><div className="val" style={{ color: 'var(--text-3)' }}>{paused.length}</div><div className="sub">3 inactive &gt; 14d</div></div>
        <div className="kpi"><div className="lbl">Last run</div><div className="val" style={{ fontSize: 18 }}>6h ago</div><div className="sub">Daily Infra Briefing · completed</div></div>
      </div>

      <div className="section-h">
        <h2>Suggested for you</h2>
        <div className="actions">
          <span className="badge"><span className="dot" style={{ background: 'var(--accent)' }} /> AI</span>
          <span style={{ fontSize: 12, color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>· based on chat patterns &amp; recent activity</span>
          <button className="btn ghost"><Icon name="plus" size={12}/> Custom</button>
        </div>
      </div>
      <div className="suggest-grid">
        {DT.AUTO_SUGGESTIONS.map(s => (
          <div key={s.id} className="suggest-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 6 }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-3)', fontWeight: 600 }}>
                {s.source}
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--accent)', fontWeight: 600 }}>
                {(s.confidence * 100).toFixed(0)}% conf
              </div>
            </div>
            <div style={{ fontWeight: 500, fontSize: 14, lineHeight: 1.3, marginBottom: 4 }}>{s.title}</div>
            <div style={{ fontSize: 12, color: 'var(--text-3)', lineHeight: 1.4, marginBottom: 10 }}>{s.why}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-2)', marginBottom: 12, paddingBottom: 12, borderBottom: '1px dashed var(--line)' }}>
              <Icon name="clock" size={11} /> {s.schedule}
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button className="btn primary" style={{ flex: 1, fontSize: 12 }}>Create</button>
              <button className="btn ghost" style={{ fontSize: 12 }}>Tweak</button>
              <button className="btn ghost" style={{ fontSize: 12 }} title="Dismiss">×</button>
            </div>
          </div>
        ))}
      </div>

      <div className="section-h">
        <h2>Your automations</h2>
        <div className="actions">
          <div className="tabs">
            <button data-on="true">All</button>
            <button>Active ({active.length})</button>
            <button>Paused ({paused.length})</button>
            <button>Failing</button>
          </div>
          <div className="tabs">
            <button data-on={scheduleMode === 'nl' ? 'true' : 'false'} onClick={() => setScheduleMode('nl')}>Natural</button>
            <button data-on={scheduleMode === 'cron' ? 'true' : 'false'} onClick={() => setScheduleMode('cron')}>Cron</button>
            <button data-on={scheduleMode === 'visual' ? 'true' : 'false'} onClick={() => setScheduleMode('visual')}>Visual</button>
          </div>
          <button className="btn ghost"><Icon name="download" size={12}/> Export</button>
        </div>
      </div>
      <div className="card">
        <div className="auto-row auto-th">
          <div>Status</div>
          <div>Name</div>
          <div>Latest output</div>
          <div>Schedule</div>
          <div>Success · 7d</div>
          <div>Next</div>
          <div>Destinations</div>
        </div>
        {auto.map(a => (
          <div key={a.id} className="auto-row" onClick={() => setOpenId(openId === a.id ? null : a.id)} data-open={openId === a.id}>
            <div>
              <span className={'badge ' + (a.status === 'active' ? 'ok' : '')}>
                <span className="dot" /> {a.status}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
              <span style={{ width: 28, height: 28, borderRadius: 7, background: `color-mix(in oklab, ${a.accent} 14%, transparent)`, color: a.accent, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                <Icon name={a.icon} size={14}/>
              </span>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 500, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.name}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-3)' }}>{a.runs30d} runs · 30d · avg {a.avgDuration}</div>
              </div>
            </div>
            <div style={{ fontSize: 12, color: a.status === 'paused' ? 'var(--text-3)' : 'var(--text-2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={a.lastOutputTitle}>
              {a.lastOutputTitle}
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-2)' }}>
              {scheduleMode === 'cron' ? a.cron : scheduleMode === 'visual' ? <VisualSchedule cron={a.cron}/> : a.scheduleNl}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ flex: 1 }}>
                <Sparkline values={a.runs7d.map((v,i) => v + (i === a.runs7d.length-1 && a.failures30d > 0 && a.id === 'auto-1' ? -0.3 : 0))} color={a.successRate > 0.9 ? 'var(--ok)' : a.successRate > 0.7 ? 'var(--warn)' : 'var(--bad)'} height={22} />
              </div>
              <div className="num" style={{ fontSize: 11, color: a.successRate > 0.9 ? 'var(--ok)' : 'var(--warn)', minWidth: 30 }}>{(a.successRate*100).toFixed(0)}%</div>
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-3)' }}>{a.nextRun}</div>
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {a.destinations.slice(0, 2).map(d => <span key={d} className="dest-chip">{d}</span>)}
              {a.destinations.length > 2 && <span className="dest-chip">+{a.destinations.length - 2}</span>}
            </div>
          </div>
        ))}
      </div>

      {opened && <AutomationDetail auto={opened} onClose={() => setOpenId(null)} />}
    </>
  );
}

function VisualSchedule({ cron }) {
  // tiny 7-cell pill row
  const parts = cron.split(' ');
  const dow = parts[4]; // day of week
  const days = ['M','T','W','T','F','S','S'];
  const active = (i) => {
    if (dow === '*') return true;
    if (dow === '1-5') return i < 5;
    if (dow.includes(',')) return dow.split(',').includes(String((i+1) % 7));
    return false;
  };
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {days.map((d, i) => (
        <span key={i} style={{
          width: 14, height: 14, borderRadius: 3, fontSize: 9,
          display: 'grid', placeItems: 'center', fontWeight: 600,
          background: active(i) ? 'var(--accent)' : 'var(--bg-sunken)',
          color: active(i) ? 'var(--bg)' : 'var(--text-3)',
        }}>{d}</span>
      ))}
    </div>
  );
}

function AutomationDetail({ auto: a, onClose }) {
  return (
    <>
      <div className="section-h" style={{ marginTop: 'var(--gap)' }}>
        <h2>{a.name}</h2>
        <div className="actions">
          <span className={'badge ' + (a.status === 'active' ? 'ok' : '')}><span className="dot" /> {a.status}</span>
          <button className="btn ghost">{a.status === 'active' ? 'Pause' : 'Resume'}</button>
          <button className="btn ghost"><Icon name="sparkles" size={12}/> Trigger now</button>
          <button className="btn ghost">Edit</button>
          <button className="btn ghost" onClick={onClose}>×</button>
        </div>
      </div>
      <div className="card">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, background: 'var(--line)', border: '1px solid var(--line)', borderRadius: 8, overflow: 'hidden', marginBottom: 16 }}>
          <div style={{ background: 'var(--bg-card)', padding: '12px 14px' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-3)', fontWeight: 600 }}>Schedule</div>
            <div style={{ fontSize: 14, fontWeight: 500, marginTop: 4 }}>{a.scheduleNl}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>{a.cron} (UTC)</div>
          </div>
          <div style={{ background: 'var(--bg-card)', padding: '12px 14px' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-3)', fontWeight: 600 }}>Next run</div>
            <div style={{ fontSize: 14, fontWeight: 500, marginTop: 4 }}>{a.nextRun}</div>
          </div>
          <div style={{ background: 'var(--bg-card)', padding: '12px 14px' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-3)', fontWeight: 600 }}>Last run</div>
            <div style={{ fontSize: 14, fontWeight: 500, marginTop: 4 }}>{a.lastRun}</div>
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-3)', fontWeight: 600, marginBottom: 6 }}>Instruction</div>
          <div style={{ background: 'var(--bg-sunken)', border: '1px solid var(--line)', borderRadius: 6, padding: '10px 12px', fontFamily: 'var(--font-mono)', fontSize: 12 }}>{a.instruction}</div>
        </div>

        <div style={{ marginBottom: 16, display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-3)', fontWeight: 600, marginRight: 4 }}>Delivers to</div>
          {a.destinations.map(d => <span key={d} className="dest-chip">{d}</span>)}
        </div>

        {a.runsHistory.length > 0 && (
          <>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-3)', fontWeight: 600, marginBottom: 6 }}>Execution history</div>
            <div style={{ display: 'grid', gridTemplateColumns: '110px 130px 170px 100px 1fr', gap: 12, fontFamily: 'var(--font-mono)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-3)', fontWeight: 600, paddingBottom: 6, borderBottom: '1px solid var(--line)' }}>
              <div>Status</div><div>Thread</div><div>Scheduled</div><div>Duration</div><div>Error</div>
            </div>
            {a.runsHistory.map((r, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '110px 130px 170px 100px 1fr', gap: 12, alignItems: 'center', padding: '9px 0', borderTop: i ? '1px dashed var(--line)' : 0, fontSize: 13 }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 6, height: 6, borderRadius: 99, background: r.status === 'completed' ? 'var(--ok)' : 'var(--bad)' }} />
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{r.status}</span>
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--accent)' }}>{r.thread}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-3)' }}>{r.when}</div>
                <div className="num" style={{ fontSize: 12 }}>{r.dur}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: r.err ? 'var(--bad)' : 'var(--text-3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.err || '—'}</div>
              </div>
            ))}
          </>
        )}
      </div>
    </>
  );
}

/* ---------- WORKSPACES TAB ---------- */
function WorkspacesPage() {
  const [query, setQuery] = useStateT('');
  const [sort, setSort] = useStateT('activity');
  const ws = DT.WORKSPACES;
  const totalConvos = ws.reduce((s, w) => s + w.convos, 0);
  const activeMembers = new Set(ws.flatMap(w => w.owner)).size + 5; // mock
  const today = ws.filter(w => w.updated === 'May 5').length;
  const stale = ws.filter(w => /Apr 2[0-7]/.test(w.updated)).length;

  const pinned = ws.filter(w => w.pinned);
  const rest = ws.filter(w => !w.pinned)
    .filter(w => w.name.toLowerCase().includes(query.toLowerCase()) || w.desc.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => {
      if (sort === 'activity') return b.convos - a.convos;
      if (sort === 'recent')   return a.updated < b.updated ? 1 : -1;
      if (sort === 'name')     return a.name.localeCompare(b.name);
      return 0;
    });

  return (
    <>
      <div className="kpi-strip">
        <div className="kpi"><div className="lbl">Workspaces</div><div className="val">{ws.length}</div><div className="sub">{pinned.length} pinned</div></div>
        <div className="kpi"><div className="lbl">Active today</div><div className="val">{today}</div><div className="sub">updated in last 24h</div></div>
        <div className="kpi"><div className="lbl">Stale &gt; 7d</div><div className="val">{stale}</div><div className="sub down">consider archiving</div></div>
        <div className="kpi"><div className="lbl">Pinned</div><div className="val">{pinned.length}</div><div className="sub">across {new Set(pinned.map(p=>p.chain).filter(Boolean)).size || 'multi'} services</div></div>
      </div>

      {/* AI suggestion */}
      <div className="card ai-callout">
        <div className="ai-callout-icon"><Icon name="sparkles" size={14}/></div>
        <div className="ai-callout-body">
          <div className="ai-callout-title"><span className="ai-mark">AI</span> Two workspaces look like duplicates</div>
          <div className="ai-callout-text">
            <b>Tac</b> and <b>TAC</b> were created 4 days apart and reference overlapping services. Consider merging.
          </div>
        </div>
        <div className="ai-callout-actions">
          <button className="btn ghost">Dismiss</button>
          <button className="btn primary">Review &amp; merge</button>
        </div>
      </div>

      {/* Pinned */}
      <div className="section-h" style={{ marginTop: 'var(--gap)' }}>
        <h2>Pinned <span style={{ color: 'var(--text-4)', fontWeight: 400 }}>· {pinned.length}</span></h2>
        <div className="actions">
          <button className="btn primary"><Icon name="plus" size={12}/> New workspace</button>
        </div>
      </div>
      <div className="ws-pinned">
        {pinned.map(w => <PinnedWorkspaceCard key={w.id} w={w} />)}
      </div>
      {/* spacer */}

      {/* All workspaces */}
      <div className="section-h" style={{ marginTop: 'var(--gap)' }}>
        <h2>All workspaces <span style={{ color: 'var(--text-4)', fontWeight: 400 }}>· {rest.length}</span></h2>
        <div className="actions">
          <div className="ws-search">
            <Icon name="search" size={12}/>
            <input placeholder="Search workspaces, descriptions, services…" value={query} onChange={e => setQuery(e.target.value)} />
            {query && <button onClick={() => setQuery('')} className="ws-search-x" aria-label="Clear"><Icon name="close" size={10}/></button>}
          </div>
          <div className="seg">
            <button data-on={sort === 'activity' ? 'true' : 'false'} onClick={() => setSort('activity')}>Activity</button>
            <button data-on={sort === 'recent' ? 'true' : 'false'}   onClick={() => setSort('recent')}>Recent</button>
            <button data-on={sort === 'name' ? 'true' : 'false'}     onClick={() => setSort('name')}>Name</button>
          </div>
        </div>
      </div>

      <div className="card ws-list">
        <div className="ws-row ws-th">
          <div></div>
          <div>Workspace</div>
          <div>Activity · 24h</div>
          <div>Updated</div>
          <div></div>
        </div>
        {rest.map(w => <WorkspaceRow key={w.id} w={w} />)}
      </div>
    </>
  );
}

function PinnedWorkspaceCard({ w }) {
  const accent = w.chain ? chainColor(w.chain) : 'var(--accent)';
  const trend = w.activity;
  const last = trend[trend.length - 1];
  const prev = trend[trend.length - 7] || trend[0];
  const delta = prev > 0 ? Math.round(((last - prev) / prev) * 100) : 0;
  return (
    <div className="ws-card pinned" style={{ '--accent': accent }}>
      <div className="ws-card-head">
        <div className="ws-card-title">
          {w.badge === 'flash' && <span className="ws-badge flash"><Icon name="sparkles" size={10}/> Flash</span>}
          {w.badge === 'incident' && <span className="ws-badge incident">INCIDENT</span>}
          <h3>{w.name}</h3>
        </div>
        <button className="ws-pin" aria-label="Unpin">★</button>
      </div>
      <p className="ws-card-desc">{w.desc}</p>
      <div className="ws-card-stats">
        <div className="ws-stat">
          <div className="ws-stat-lbl">Last update</div>
          <div className="ws-stat-val num" style={{ fontSize: 13 }}>{w.updated}</div>
        </div>
        <div className="ws-stat">
          <div className="ws-stat-lbl">7d trend</div>
          <div className={'ws-stat-val num ' + (delta >= 0 ? 'up' : 'down')}>{delta >= 0 ? '+' : ''}{delta}%</div>
        </div>
      </div>
      <div className="ws-card-spark">
        <Sparkline values={trend} color={accent} height={32} />
      </div>
      <div className="ws-card-foot">
        <span className="ws-foot-meta">{w.chain ? chainName(w.chain) : 'Multi-service'}</span>
        <button className="btn ghost ws-open-btn">Open <Icon name="arrow" size={10}/></button>
      </div>
    </div>
  );
}

function WorkspaceRow({ w }) {
  const accent = w.chain ? chainColor(w.chain) : 'var(--text-3)';
  return (
    <div className="ws-row" data-clickable="true">
      <div><span className="ws-dot" style={{ background: accent }} /></div>
      <div className="ws-name-cell">
        <div className="ws-name">
          {w.badge === 'flash' && <span className="ws-badge flash" style={{ marginRight: 6 }}><Icon name="sparkles" size={10}/></span>}
          {w.name}
        </div>
        <div className="ws-desc">{w.desc}</div>
      </div>
      <div><Sparkline values={w.activity} color={accent} height={24} /></div>
      <div className="ws-updated">
        <span>{w.updated}</span>
      </div>
      <div style={{ textAlign: 'right' }}>
        <button className="btn ghost ws-open-btn">Open <Icon name="arrow" size={10}/></button>
      </div>
    </div>
  );
}

Object.assign(window, { PerformancePage, CostPage, IncidentsPage, ValidatorsPage, OpenAlertsStrip, LinearTickets, AutomationsPage, WorkspacesPage });
