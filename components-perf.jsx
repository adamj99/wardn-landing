/* Comparison rail, SLO, Predict, Cost rows */

const { useState: useStateB, useMemo: useMemoB } = React;
const DB = window.DATA;

/* ---------- Compare rail ---------- */
function CompareRail() {
  const [picked, setPicked] = useStateB(['solana', 'base', 'eth', 'somnia']);
  const all = DB.CHAINS;
  const toggle = id => setPicked(p => p.includes(id) ? p.filter(x => x !== id) : p.length < 6 ? [...p, id] : p);
  const cols = picked.map(id => all.find(c => c.id === id)).filter(Boolean);

  const rows = [
    { lbl: 'Status', get: c => <span className="pill" style={{
        background: c.status === 'healthy' ? 'var(--ok-bg)' : c.status === 'degraded' ? 'var(--warn-bg)' : 'var(--bad-bg)',
        color:      c.status === 'healthy' ? 'var(--ok)'    : c.status === 'degraded' ? 'var(--warn)'    : 'var(--bad)',
        fontFamily: 'var(--font-mono)', fontSize: 10, padding: '2px 6px', borderRadius: 4, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600
      }}>{c.status}</span> },
    { lbl: 'Success rate', get: c => <span style={{
        color: c.vote >= 99.5 ? 'var(--ok)' : c.vote >= 95 ? 'var(--warn)' : 'var(--bad)'
      }}>{c.vote != null ? c.vote.toFixed(2) + '%' : '—'}</span> },
    { lbl: 'Delegation', get: c => {
        const max = Math.max(...cols.map(x => x.delegation || 0));
        return (
          <div className="bar-cell" style={{ '--c': `var(${c.cssVar})` }}>
            <div className="bar"><span style={{ width: `${max ? (c.delegation/max)*100 : 0}%` }}/></div>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-3)', minWidth: 56, textAlign: 'right' }}>
              {fmtDelegation(c.delegation)}
            </span>
          </div>
        );
    } },
    { lbl: 'Commission', get: c => c.commission + '%' },
    { lbl: 'Missed 24h', get: c => <span style={{
        color: c.missed === 0 ? 'var(--text-3)' : c.missed < 10 ? 'var(--warn)' : 'var(--bad)'
      }}>{c.missed}</span> },
    { lbl: 'Cost (mtd)', get: c => <span>${c.cost.toLocaleString()} <span className={c.costWow.startsWith('-') ? 'up' : c.costWow.startsWith('+0') ? 'flat' : 'down'} style={{ fontSize: 11, marginLeft: 6 }}>{c.costWow}</span></span> },
    { lbl: 'Open alerts', get: c => <span style={{ color: c.alerts > 0 ? 'var(--bad)' : 'var(--text-3)' }}>{c.alerts}</span> },
  ];

  return (
    <>
      <div className="section-h">
        <h2>Side-by-side compare · pick up to 6</h2>
        <button className="btn ghost"><Icon name="sparkles" size={12}/> Why is search-svc different?</button>
      </div>
      <div className="compare">
        <div className="compare-h">
          <h3>Services</h3>
          <div className="chip-row">
            {all.map(c => (
              <button key={c.id} className="chip" data-on={picked.includes(c.id)}
                      style={{ '--c': `var(${c.cssVar})` }}
                      onClick={() => toggle(c.id)}>
                <span className="swatch" />{c.name}
              </button>
            ))}
          </div>
        </div>
        <div className="compare-grid" style={{ '--n': cols.length }}>
          <div className="head">Metric</div>
          {cols.map(c => (
            <div className="head" key={c.id}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: 99, background: `var(${c.cssVar})` }} />
                {c.name}
              </span>
            </div>
          ))}
          {rows.map((r, i) => (
            <React.Fragment key={r.lbl}>
              <div className={'label' + (i === rows.length - 1 ? ' last' : '')}>{r.lbl}</div>
              {cols.map(c => (
                <div className="val" key={c.id + r.lbl} style={{ '--c': `var(${c.cssVar})` }}>{r.get(c)}</div>
              ))}
            </React.Fragment>
          ))}
        </div>
      </div>
    </>
  );
}

/* ---------- SLO row ---------- */
function SLORow() {
  const strip = (state) => {
    const cells = [];
    for (let i = 0; i < 30; i++) {
      let s = 'ok';
      if (state === 'warn' && (i === 22 || i === 27)) s = 'warn';
      if (state === 'bad' && (i >= 25)) s = 'bad';
      if (state === 'bad' && (i === 18 || i === 21)) s = 'warn';
      cells.push(<i key={i} data-s={s} />);
    }
    return cells;
  };
  return (
    <>
      <div className="section-h">
        <h2>Service Level Objectives · last 30 days</h2>
        <div className="actions">
          <div className="tabs">
            <button>7d</button>
            <button data-on="true">30d</button>
            <button>90d</button>
          </div>
        </div>
      </div>
      <div className="slo-grid">
        {DB.SLOS.map(s => (
          <div className="slo" key={s.id} data-state={s.state}>
            <div className="slo-top">
              <div>
                <div className="slo-name">{s.name}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 2 }}>
                  {s.scope}
                </div>
              </div>
              <div className="slo-target">target {s.target}</div>
            </div>
            <div className="slo-big num" style={{
              color: s.state === 'ok' ? 'var(--text)' : s.state === 'warn' ? 'var(--warn)' : 'var(--bad)'
            }}>
              {typeof s.value === 'number' ? s.value.toFixed(2) + '%' : s.value}
            </div>
            <div className="slo-strip">{strip(s.state)}</div>
            <div className="slo-budget">
              <span>Error budget</span>
              <div className="bar"><span style={{ width: `${s.budget * 100}%` }} /></div>
              <span style={{ minWidth: 36, textAlign: 'right' }}>{(s.budget * 100).toFixed(0)}%</span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

/* ---------- Predict + Cost row ---------- */
function PredictAndCost() {
  return (
    <div className="cost-grid" style={{ marginTop: 12 }}>
      <div className="predict-card">
        <div className="card-h">
          <h3>Predicted degradation · next 7 days</h3>
          <span className="meta"><Icon name="sparkles" size={10}/> Model v0.4 · updated 2m ago</span>
        </div>
        {DB.PREDICT.map(p => (
          <div className="predict-row" key={p.id}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: 99, background: chainColor(p.chain) }} />
              <span style={{ fontWeight: 500 }}>{chainName(p.chain)}</span>
            </div>
            <div>
              <div className="predict-bar" style={{ '--p': `${p.risk * 100}%` }} />
              <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 6 }}>{p.why}</div>
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: p.risk > 0.6 ? 'var(--bad)' : p.risk > 0.4 ? 'var(--warn)' : 'var(--text-2)' }}>
              {(p.risk * 100).toFixed(0)}% · {p.eta}
            </div>
            <div className="predict-confidence">conf {(p.conf * 100).toFixed(0)}%</div>
          </div>
        ))}
      </div>
      <div className="card">
        <div className="card-h">
          <h3>Cost · MTD by service</h3>
          <span className="meta">$33,100 · +4.2% vs last month</span>
        </div>
        {DB.COSTS_BY_CHAIN.map(c => {
          const max = Math.max(...DB.COSTS_BY_CHAIN.map(x => x.m));
          const delta = ((c.m - c.prev) / c.prev) * 100;
          return (
            <div key={c.chain} style={{ display: 'grid', gridTemplateColumns: '90px 1fr 70px 50px', gap: 10, alignItems: 'center', padding: '6px 0', fontSize: 12 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 6, height: 6, borderRadius: 99, background: chainColor(c.chain) }} />
                {chainName(c.chain)}
              </span>
              <div className="bar-cell" style={{ '--c': chainColor(c.chain) }}>
                <div className="bar"><span style={{ width: `${(c.m/max)*100}%` }}/></div>
              </div>
              <span className="num" style={{ textAlign: 'right' }}>${(c.m/1000).toFixed(2)}k</span>
              <span className="num" style={{
                fontSize: 11,
                color: delta > 5 ? 'var(--bad)' : delta < -5 ? 'var(--ok)' : 'var(--text-3)',
                textAlign: 'right'
              }}>{delta >= 0 ? '+' : ''}{delta.toFixed(1)}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------- Cost row (full width, replacing predict + cost) ---------- */
function CostRow() {
  return (
    <div className="card" style={{ marginTop: 12 }}>
      <div className="card-h">
        <h3>Cost · MTD by service</h3>
        <span className="meta">$33,100 · +4.2% vs last month</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', columnGap: 32, rowGap: 4 }}>
        {DB.COSTS_BY_CHAIN.map(c => {
          const max = Math.max(...DB.COSTS_BY_CHAIN.map(x => x.m));
          const delta = ((c.m - c.prev) / c.prev) * 100;
          return (
            <div key={c.chain} style={{ display: 'grid', gridTemplateColumns: '110px 1fr 80px 60px', gap: 12, alignItems: 'center', padding: '8px 0', fontSize: 13, borderBottom: '1px dashed var(--line)' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 6, height: 6, borderRadius: 99, background: chainColor(c.chain) }} />
                {chainName(c.chain)}
              </span>
              <div className="bar-cell" style={{ '--c': chainColor(c.chain) }}>
                <div className="bar"><span style={{ width: `${(c.m/max)*100}%` }}/></div>
              </div>
              <span className="num" style={{ textAlign: 'right' }}>${(c.m/1000).toFixed(2)}k</span>
              <span className="num" style={{
                fontSize: 11,
                color: delta > 5 ? 'var(--bad)' : delta < -5 ? 'var(--ok)' : 'var(--text-3)',
                textAlign: 'right'
              }}>{delta >= 0 ? '+' : ''}{delta.toFixed(1)}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------- Recent Deployments ---------- */
function DeploymentsRow() {
  const statusMeta = {
    'success':     { color: 'var(--ok)',   bg: 'var(--ok-bg)',   label: 'success' },
    'rolling':     { color: 'var(--info)', bg: 'var(--info-bg)', label: 'rolling' },
    'failed':      { color: 'var(--bad)',  bg: 'var(--bad-bg)',  label: 'failed'  },
    'rolled-back': { color: 'var(--warn)', bg: 'var(--warn-bg)', label: 'rolled back' },
  };
  return (
    <div className="card" style={{ marginTop: 12 }}>
      <div className="card-h">
        <h3>Recent deployments · ArgoCD</h3>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span className="meta">last 24h · 8 services</span>
          <button className="btn ghost" style={{ fontSize: 11 }}>View all</button>
        </div>
      </div>
      <div className="deploys">
        <div className="deploys-head">
          <span>Service</span>
          <span>Service</span>
          <span>Region</span>
          <span>SHA</span>
          <span>Status</span>
          <span>By</span>
          <span style={{ textAlign: 'right' }}>When</span>
        </div>
        {DB.DEPLOYMENTS.map(d => {
          const sm = statusMeta[d.status];
          return (
            <div key={d.id} className="deploy-row">
              <span className="deploy-service">
                <span className="deploy-icon">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3"/></svg>
                </span>
                {d.service}
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 6, height: 6, borderRadius: 99, background: chainColor(d.chain) }} />
                {chainName(d.chain)}
              </span>
              <span className="mono" style={{ fontSize: 11, color: 'var(--text-3)' }}>{d.region}</span>
              <span className="mono" style={{ fontSize: 11 }}>{d.sha}</span>
              <span className="deploy-status" style={{ background: sm.bg, color: sm.color }}>
                <span className="dot" />
                {sm.label}
              </span>
              <span style={{ fontSize: 12, color: 'var(--text-2)' }}>{d.by}</span>
              <span className="mono" style={{ fontSize: 11, color: 'var(--text-3)', textAlign: 'right' }}>{d.ago} ago</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------- Request Volume row ---------- */
function RPCVolumeRow() {
  const totalAll = DB.RPC_VOLUME.reduce((s, x) => s + x.total, 0);
  const max = Math.max(...DB.RPC_VOLUME.map(x => x.total));
  const sparkMax = Math.max(...DB.RPC_VOLUME.flatMap(x => x.daily));

  return (
    <>
      <div className="section-h">
        <h2>Request volume · last 7 days</h2>
        <div className="actions">
          <div className="tabs">
            <button>24h</button>
            <button data-on="true">7d</button>
            <button>30d</button>
          </div>
          <button className="btn ghost"><Icon name="sparkles" size={12}/> Why is edge-gateway spiking?</button>
        </div>
      </div>
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14, gap: 14, flexWrap: 'wrap' }}>
          <div>
            <div className="num" style={{ fontSize: 28, fontWeight: 500, letterSpacing: '-0.02em' }}>
              {(totalAll / 1000).toFixed(2)}B <span style={{ fontSize: 13, color: 'var(--text-3)', fontFamily: 'var(--font-sans)' }}>requests</span>
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 2 }}>
              all services · 7d total
            </div>
          </div>
          <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>WoW</div>
              <div className="num up" style={{ fontSize: 16 }}>+4.7%</div>
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Peak/min</div>
              <div className="num" style={{ fontSize: 16 }}>11.4k</div>
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Active services</div>
              <div className="num" style={{ fontSize: 16 }}>{DB.RPC_VOLUME.length}/8</div>
            </div>
          </div>
        </div>
        <div className="rpc-grid">
          {DB.RPC_VOLUME.map(c => {
            const dwowDir = c.wow.startsWith('-') ? 'down' : c.wow.startsWith('+0') ? 'flat' : 'up';
            return (
              <div key={c.chain} className="rpc-row">
                <div className="rpc-name">
                  <span style={{ width: 8, height: 8, borderRadius: 99, background: chainColor(c.chain) }} />
                  <span style={{ fontWeight: 500 }}>{chainName(c.chain)}</span>
                </div>
                <div className="rpc-bar">
                  <div className="bar-cell" style={{ '--c': chainColor(c.chain) }}>
                    <div className="bar"><span style={{ width: `${(c.total/max)*100}%` }}/></div>
                  </div>
                </div>
                <div className="rpc-spark">
                  <Sparkline values={c.daily} color={chainColor(c.chain)} height={28} />
                </div>
                <div className="num" style={{ textAlign: 'right' }}>{c.total.toFixed(1)}M</div>
                <div className={'num delta ' + dwowDir} style={{ textAlign: 'right', fontSize: 12 }}>{c.wow}</div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

/* ---------- API Traffic (weekly stacked + WoW table) + Top Movers ---------- */
function chainHue(id) {
  // hash chain id → hue 0..360
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return h % 360;
}
function chainAccent(id) {
  // prefer existing CSS var if we have one (matches by base name)
  const known = (DB.CHAINS || []).find(c => id.startsWith(c.id) || c.id === id.replace(/-(mainnet|testnet|sepolia)$/, ''));
  if (known) return `var(${known.cssVar})`;
  return `oklch(0.62 0.16 ${chainHue(id)})`;
}
function fmtVolume(m) {
  if (m >= 1e9) return (m / 1e9).toFixed(1).replace(/\.0$/, '') + 'B';
  if (m >= 1000) return (m / 1000).toFixed(2).replace(/\.00$/, '') + 'B';
  if (m >= 100) return m.toFixed(0) + 'M';
  return m.toFixed(1) + 'M';
}
function fmtBigCount(n) {
  if (n >= 1e9) return (n / 1e9).toFixed(2).replace(/\.0+$/, '') + 'B';
  if (n >= 1e6) return (n / 1e6).toFixed(1).replace(/\.0$/, '') + 'M';
  return n.toLocaleString();
}

function RPCTrafficWeekly({ range, setRange }) {
  const t = DB.RPC_TRAFFIC;
  const weekTotals = t.weeks.map((_, wi) => t.byChain.reduce((s, c) => s + c.weekly[wi], 0));
  const max = Math.max(...weekTotals);
  const min = Math.min(...weekTotals);
  const wowNum = parseFloat(t.totalWow);
  const latest = weekTotals[weekTotals.length - 1];

  // Build a smooth area path
  const W = 100, H = 100;
  const xs = weekTotals.map((_, i) => (i / (weekTotals.length - 1)) * W);
  const ys = weekTotals.map(v => H - ((v - min * 0.85) / (max - min * 0.85)) * H * 0.85 - 4);
  const linePath = xs.map((x, i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(2)} ${ys[i].toFixed(2)}`).join(' ');
  const areaPath = `${linePath} L${xs[xs.length-1].toFixed(2)} ${H} L0 ${H} Z`;

  return (
    <div className="card rpc-traffic-card">
      <div className="rpc-tr-head">
        <div className="rpc-tr-title">
          <h3>API Traffic</h3>
          <span className="src-chip">Datadog</span>
        </div>
        <div className="seg">
          {['2w', '4w', '8w'].map(r => (
            <button key={r} data-on={range === r ? 'true' : 'false'} onClick={() => setRange(r)}>{r}</button>
          ))}
        </div>
      </div>

      <div className="rpc-hero">
        <div className="rpc-hero-val">{fmtVolume(latest)}</div>
        <div className="rpc-hero-meta">
          <span className="rpc-hero-lbl">latest week</span>
          <span className={'wow-pill ' + (wowNum < 0 ? 'down' : 'up')}>
            {wowNum < 0 ? '↘' : '↗'} {t.totalWow} WoW
          </span>
        </div>
      </div>

      <svg className="rpc-area" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
        <defs>
          <linearGradient id="rpc-area-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.22"/>
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0"/>
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#rpc-area-fill)" />
        <path d={linePath} fill="none" stroke="var(--accent)" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
        {xs.map((x, i) => (
          <circle key={i} cx={x} cy={ys[i]} r="2" fill="var(--accent)" vectorEffect="non-scaling-stroke" />
        ))}
      </svg>

      <div className="rpc-area-x">
        {t.weeks.map(wk => <span key={wk}>{wk}</span>)}
      </div>

      <div className="rpc-tbl-head">
        <h4>By chain <span className="cnt">latest week</span></h4>
      </div>
      <div className="rpc-tbl simple">
        {[...t.byChain].sort((a, b) => b.weekly[3] - a.weekly[3]).map(c => {
          const cMax = Math.max(...c.weekly);
          return (
            <div key={c.id} className="rpc-srow">
              <div className="rpc-srow-name">
                <span className="dot" style={{ background: chainAccent(c.id) }} />
                {c.id}
              </div>
              <div className="rpc-srow-spark">
                <Sparkline values={c.weekly} color={chainAccent(c.id)} height={20} />
              </div>
              <div className="num rpc-srow-val">{fmtVolume(c.weekly[3])}</div>
              <div className={'num rpc-srow-wow ' + (c.wow < 0 ? 'down' : 'up')}>
                {c.wow >= 0 ? '+' : ''}{c.wow.toFixed(1)}%
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function RPCTrafficMovers({ range, setRange }) {
  const t = DB.RPC_TRAFFIC;
  // Sort by magnitude desc — biggest movers on top, capped at 8 for breathing room
  const movers = [...t.topMovers].sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta)).slice(0, 8);
  const gainers = movers.filter(m => m.delta >= 0).length;
  const losers  = movers.length - gainers;

  return (
    <div className="card rpc-traffic-card">
      <div className="rpc-tr-head">
        <div className="rpc-tr-title">
          <h3>Top Movers</h3>
          <span className="src-chip">Datadog</span>
        </div>
        <div className="seg">
          {['2w', '4w', '8w'].map(r => (
            <button key={r} data-on={range === r ? 'true' : 'false'} onClick={() => setRange(r)}>{r}</button>
          ))}
        </div>
      </div>

      <div className="rpc-mover-summary">
        <span className="mv-stat up">↗ {gainers} gainers</span>
        <span className="mv-sep">·</span>
        <span className="mv-stat down">↘ {losers} losers</span>
      </div>

      <div className="rpc-movers-clean">
        {movers.map((m, i) => {
          const positive = m.delta >= 0;
          return (
            <div key={m.id} className="rpc-mover-clean-row">
              <span className="rpc-mover-rank">{String(i + 1).padStart(2, '0')}</span>
              <span className="rpc-mover-name">{m.id}</span>
              <span className={'rpc-mover-arrow ' + (positive ? 'up' : 'down')}>{positive ? '↗' : '↘'}</span>
              <span className={'rpc-mover-delta num ' + (positive ? 'up' : 'down')}>
                {positive ? '+' : ''}{m.delta.toFixed(1)}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function RPCTrafficRow() {
  const [rangeLeft, setRangeLeft] = useStateB('4w');
  const [rangeRight, setRangeRight] = useStateB('4w');
  return (
    <div className="rpc-traffic-grid">
      <RPCTrafficWeekly range={rangeLeft} setRange={setRangeLeft} />
      <RPCTrafficMovers range={rangeRight} setRange={setRangeRight} />
    </div>
  );
}

Object.assign(window, { CompareRail, SLORow, CostRow, DeploymentsRow, RPCVolumeRow, RPCTrafficRow });
