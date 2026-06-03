/* Components for ValidOps Operations Console */

const { useState, useEffect, useMemo, useRef } = React;

const D = window.DATA;

function chainColor(id) {
  const c = D.CHAINS.find(x => x.id === id);
  return c ? `var(${c.cssVar})` : 'var(--text-3)';
}
function chainName(id) {
  const c = D.CHAINS.find(x => x.id === id);
  return c ? c.name : id;
}

/* ---------- Top chrome ---------- */
function Rail({ active, setActive }) {
  const items = [
    { id: 'overview', icon: 'home', alert: false, label: 'Overview' },
    { id: 'workspaces', icon: 'chat', alert: false, label: 'Workspaces' },
    { id: 'automations', icon: 'activity', alert: true, label: 'Automations' },
  ];
  return (
    <aside className="rail">
      <div className="logo">w</div>
      {items.map(it => (
        <button key={it.id} className="rail-btn" data-active={active === it.id}
                onClick={() => setActive(it.id)} title={it.label}>
          <Icon name={it.icon} />
          {it.alert && <span className="dot" />}
        </button>
      ))}
      <div className="rail-spacer" />
      <button className="rail-btn" data-active={active === 'settings'}
              onClick={() => setActive('settings')} title="Settings"><Icon name="settings" /></button>
    </aside>
  );
}

function Topbar({ now }) {
  const t = now.toUTCString().slice(17, 22);
  return (
    <div className="topbar">
      <div className="crumb">
        <b>wardn</b>
      </div>
      <div className="topbar-spacer" />
      <div className="search">
        <Icon name="search" size={14} />
        <input placeholder="Jump to a service, metric, or alert…" />
        <span className="kbd">⌘K</span>
      </div>
      <button className="btn"><Icon name="bell" size={13}/> 4</button>
      <button className="btn primary"><Icon name="briefing" size={13}/> Morning briefing</button>
    </div>
  );
}

function Icon({ name, size = 16 }) {
  const s = size;
  const stroke = 'currentColor';
  const sw = 1.6;
  const props = { width: s, height: s, viewBox: '0 0 24 24', fill: 'none', stroke, strokeWidth: sw, strokeLinecap: 'round', strokeLinejoin: 'round' };
  switch (name) {
    case 'home':     return <svg {...props}><path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-7h-6v7H4a1 1 0 0 1-1-1z"/></svg>;
    case 'activity':return <svg {...props}><path d="M3 12h4l3-8 4 16 3-8h4"/></svg>;
    case 'chat':    return <svg {...props}><path d="M21 12c0 4.4-4 8-9 8a10 10 0 0 1-3.5-.6L3 21l1.6-4.5A8 8 0 0 1 3 12c0-4.4 4-8 9-8s9 3.6 9 8z"/></svg>;
    case 'pulse':   return <svg {...props}><path d="M3 12h4l2-4 4 8 2-4h6"/></svg>;
    case 'settings':return <svg {...props}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5"/></svg>;
    case 'chev':    return <svg {...props}><path d="M9 6l6 6-6 6"/></svg>;
    case 'search':  return <svg {...props}><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>;
    case 'bell':    return <svg {...props}><path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10 21a2 2 0 0 0 4 0"/></svg>;
    case 'briefing':return <svg {...props}><path d="M3 5h18v14H3z"/><path d="M7 9h10M7 13h7"/></svg>;
    case 'plus':    return <svg {...props}><path d="M12 5v14M5 12h14"/></svg>;
    case 'send':    return <svg {...props}><path d="M5 12h14M13 6l6 6-6 6"/></svg>;
    case 'sparkles':return <svg {...props}><path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8"/></svg>;
    case 'close':   return <svg {...props}><path d="M6 6l12 12M18 6 6 18"/></svg>;
    case 'arrow':   return <svg {...props}><path d="M5 12h14M13 6l6 6-6 6"/></svg>;
    case 'arrow-up':return <svg {...props}><path d="M12 5v14M5 12l7-7 7 7"/></svg>;
    case 'arrow-dn':return <svg {...props}><path d="M12 5v14M5 12l7 7 7-7"/></svg>;
    case 'plug':    return <svg {...props}><path d="M9 2v6M15 2v6M6 8h12v4a6 6 0 0 1-12 0z"/><path d="M12 18v4"/></svg>;
    case 'shield':  return <svg {...props}><path d="M12 3l8 4v6c0 5-4 8-8 8s-8-3-8-8V7z"/></svg>;
    case 'clock':   return <svg {...props}><path d="M12 7v5l3 2"/><circle cx="12" cy="12" r="9"/></svg>;
    case 'grid':    return <svg {...props}><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>;
    case 'download':return <svg {...props}><path d="M12 4v12M6 12l6 6 6-6M4 20h16"/></svg>;
    case 'link':    return <svg {...props}><path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1"/><path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1"/></svg>;
    case 'link-off':return <svg {...props}><path d="M9 17l-2 2a5 5 0 0 1-7-7l2-2"/><path d="M15 7l2-2a5 5 0 0 1 7 7l-2 2"/><path d="M3 3l18 18"/></svg>;
    case 'copy':    return <svg {...props}><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>;
    case 'edit':    return <svg {...props}><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>;
    case 'logout':  return <svg {...props}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5M21 12H9"/></svg>;
    case 'trash':   return <svg {...props}><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/></svg>;
    case 'users':   return <svg {...props}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.9"/><path d="M16 3.1a4 4 0 0 1 0 7.8"/></svg>;
    default: return null;
  }
}

/* ---------- What Changed ---------- */
function WhatChanged() {
  return (
    <div className="changed">
      <div className="changed-h">
        <div className="title">
          What changed in the last 12h
          <span className="ai-mark"><Icon name="sparkles" size={10}/> Auto-detected</span>
        </div>
        <div className="summary">
          <b>1 incident</b>, <b>2 regressions</b>, <b>1 opportunity</b>. payments-api unresponsive at 00:48 UTC; search-svc p95 elevated since 08:22 UTC; log ingestion spend drifting up.
        </div>
        <button className="btn ghost"><Icon name="sparkles" size={12}/> Ask Claude to triage</button>
      </div>
      <div className="changed-grid">
        {D.ANOMALIES.map(a => (
          <div key={a.id} className="anomaly" data-sev={a.sev}>
            <div className="anomaly-tag">
              <span className="pip" />
              {a.tag}
              <span style={{ marginLeft: 'auto', color: 'var(--text-3)' }}>{a.since}</span>
            </div>
            <div className="anomaly-headline">{a.headline}</div>
            <div className="anomaly-meta">
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 6, height: 6, borderRadius: 99, background: chainColor(a.chain) }} />
                {a.svc || chainName(a.chain)}
              </span>
              <span>·</span>
              <span style={{ color: a.sev === 'crit' ? 'var(--bad)' : a.sev === 'warn' ? 'var(--warn)' : 'var(--info)' }}>
                {a.delta}
              </span>
            </div>
            <div className="anomaly-spark">
              <Sparkline values={a.spark} color={chainColor(a.chain)}
                         anomalyAt={a.sev === 'crit' ? 22 : -1} />
            </div>
            <div className="anomaly-meta" style={{ color: 'var(--text-3)', fontSize: 11 }}>
              {a.cause}
            </div>
            <div className="anomaly-actions">
              <button className="btn">Investigate</button>
              <button className="btn ghost">Acknowledge</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- Fleet grid ---------- */
function FleetGrid({ onOpen, headerless }) {
  return (
    <>
      {!headerless && (
        <div className="section-h">
          <h2>Service Fleet · 8 networks</h2>
          <div className="actions">
            <div className="tabs">
              <button data-on="true">All</button>
              <button>Mainnet</button>
              <button>Testnet</button>
            </div>
            <button className="btn ghost"><Icon name="plus" size={12}/> Add chain</button>
          </div>
        </div>
      )}
      <div className="fleet">
        {D.CHAINS.map((c, i) => (
          <ChainCard key={c.id} chain={c} onOpen={() => onOpen && onOpen(c.id)} seed={i*7+3} />
        ))}
      </div>
    </>
  );
}

function fmtDelegation(n) {
  if (n == null) return '—';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'k';
  return n.toLocaleString();
}

function ChainCard({ chain: c, onOpen, seed }) {
  const spark = useMemo(() => {
    let s = seed; const out = []; let v = (c.delegation || 1000) / 1000;
    for (let i = 0; i < 24; i++) { s = (s * 9301 + 49297) % 233280;
      const r = (s/233280 - 0.5) * 0.04;
      v = Math.max(0, v * (1 + r) + (c.delegationWow.startsWith('+') ? 0.3 : 0));
      if (c.status === 'down' && i > 18) v = v * 0.985;
      out.push(v);
    }
    return out;
  }, [seed, c.delegation, c.status]);
  const dwowDir = c.delegationWow.startsWith('-') ? 'down' : c.delegationWow.startsWith('+') && c.delegationWow !== '+0.0%' && c.delegationWow !== '+0%' ? 'up' : 'flat';
  const voteState = c.vote >= 99.5 ? 'ok' : c.vote >= 95 ? 'warn' : 'bad';

  return (
    <div className="chain-card" data-status={c.status} onClick={onOpen} style={{ '--c': `var(${c.cssVar})` }}>
      <div className="row1">
        <div className="name">
          <span className="swatch" />
          {c.name}
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{c.type}</span>
        </div>
        <span className="pill">{c.status}</span>
      </div>
      <div className="metrics">
        <div className="metric">
          <div className="lbl">Delegation</div>
          <div className="val num">
            {fmtDelegation(c.delegation)}
            <span className={'delta ' + dwowDir}>{c.delegationWow}</span>
          </div>
        </div>
        <div className="metric">
          <div className="lbl">Commission</div>
          <div className="val num">{c.commission}%</div>
        </div>
        <div className="metric">
          <div className="lbl">Missed 24h</div>
          <div className="val num" style={{
            color: c.missed === 0 ? 'var(--text)' : c.missed < 10 ? 'var(--warn)' : 'var(--bad)'
          }}>{c.missed}</div>
        </div>
      </div>
      <div className="spark-row">
        <div className="metric" style={{ minWidth: 64 }}>
          <div className="lbl">Vote perf</div>
          <div className="val num" style={{
            color: voteState === 'ok' ? 'var(--ok)' : voteState === 'warn' ? 'var(--warn)' : 'var(--bad)'
          }}>{c.vote != null ? c.vote.toFixed(2) + '%' : '—'}</div>
        </div>
        <div className="spark">
          <Sparkline values={spark} color={`var(${c.cssVar})`} />
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { Rail, Topbar, Icon, WhatChanged, FleetGrid, ChainCard, chainColor, chainName, fmtDelegation });
