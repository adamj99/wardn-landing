/* Settings page — Profile, Models, Skills, Integrations, Workspaces (Networks/Ops/Customer), Performance */

const { useState: useStateS, useMemo: useMemoS } = React;
const DS = window.DATA;

const SETTINGS_NAV = [
  { group: 'Personal', items: [
    { id: 'profile',    label: 'Profile',     icon: 'home' },
    { id: 'models',     label: 'Models',      icon: 'sparkles' },
    { id: 'skills',     label: 'Skills',      icon: 'briefing' },
  ]},
  { group: 'Organization', items: [
    { id: 'integrations', label: 'Integrations', icon: 'plug' },
    { id: 'workspaces',   label: 'Workspaces',   icon: 'grid' },
    { id: 'performance',  label: 'Performance',  icon: 'activity' },
  ]},
];

function SettingsPage() {
  const [section, setSection] = useStateS('integrations');
  const [search, setSearch] = useStateS('');

  const sectionLabel = SETTINGS_NAV.flatMap(g => g.items).find(i => i.id === section)?.label || 'Settings';

  return (
    <div className="settings-shell">
      {/* Sub-rail */}
      <aside className="settings-rail">
        <div className="settings-search">
          <Icon name="search" size={12}/>
          <input placeholder="Search settings…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        {SETTINGS_NAV.map(group => (
          <div key={group.group} className="settings-nav-group">
            <div className="settings-nav-label">{group.group}</div>
            {group.items
              .filter(i => !search || i.label.toLowerCase().includes(search.toLowerCase()))
              .map(item => (
              <button
                key={item.id}
                className="settings-nav-item"
                data-on={section === item.id ? 'true' : 'false'}
                onClick={() => setSection(item.id)}
              >
                <Icon name={item.icon} size={13}/>
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        ))}
      </aside>

      {/* Content */}
      <div className="settings-body">
        <div className="settings-header">
          <div>
            <div className="settings-crumb">Settings · <span>{sectionLabel}</span></div>
            <h2 className="settings-title">{sectionLabel}</h2>
          </div>
        </div>

        {section === 'integrations' && <IntegrationsPanel/>}
        {section === 'workspaces'   && <WorkspacesSettingsPanel/>}
        {section === 'profile'      && <ProfilePanel/>}
        {section === 'models'       && <ModelsPanel/>}
        {section === 'skills'       && <SkillsPanel/>}
        {section === 'performance'  && <PerformancePanel/>}
      </div>
    </div>
  );
}

/* ---------- Integrations (unchanged from prior) ---------- */
function IntegrationsPanel() {
  const [filter, setFilter] = useStateS('all');
  const [q, setQ] = useStateS('');
  const [openId, setOpenId] = useStateS(null);

  const all = DS.MCP_SERVERS;
  const cats = ['all', ...new Set(all.map(s => s.category))];
  const filtered = all
    .filter(s => filter === 'all' || s.category === filter)
    .filter(s => !q || s.name.toLowerCase().includes(q.toLowerCase()) || s.desc.toLowerCase().includes(q.toLowerCase()));

  const enabled = all.filter(s => s.enabled).length;
  const failing = all.filter(s => s.status === 'bad').length;
  const warning = all.filter(s => s.status === 'warn').length;
  const totalReqs = all.reduce((a, s) => a + s.reqs24h, 0);

  return (
    <>
      <div className="kpi-strip">
        <div className="kpi"><div className="lbl">Connected</div><div className="val">{enabled}<span className="u">/{all.length}</span></div><div className="sub">{all.filter(s => !s.builtin).length} custom</div></div>
        <div className="kpi"><div className="lbl">Healthy</div><div className="val">{all.length - failing - warning}</div><div className="sub up">last 5m</div></div>
        <div className="kpi"><div className="lbl">Failing</div><div className="val">{failing}</div><div className="sub down">{warning} warning</div></div>
        <div className="kpi"><div className="lbl">Requests · 24h</div><div className="val">{(totalReqs/1000).toFixed(1)}<span className="u">k</span></div><div className="sub">across all servers</div></div>
      </div>

      <div className="section-h" style={{ marginTop: 'var(--gap)' }}>
        <h2>MCP servers</h2>
        <div className="actions">
          <div className="ws-search" style={{ width: 240 }}>
            <Icon name="search" size={12}/>
            <input placeholder="Search servers…" value={q} onChange={e => setQ(e.target.value)} />
          </div>
          <div className="seg">
            {cats.map(c => (
              <button key={c} data-on={filter === c ? 'true' : 'false'} onClick={() => setFilter(c)}>{c === 'all' ? 'All' : c}</button>
            ))}
          </div>
          <button className="btn primary"><Icon name="plus" size={12}/> Add server</button>
        </div>
      </div>

      <div className="card mcp-list">
        <div className="mcp-row mcp-th">
          <div></div>
          <div>Server</div>
          <div>Endpoint</div>
          <div style={{ textAlign: 'right' }}>Reqs · 24h</div>
          <div>Last check</div>
          <div>Enabled</div>
          <div></div>
        </div>
        {filtered.map(s => (
          <React.Fragment key={s.id}>
            <button
              type="button"
              className="mcp-row"
              data-clickable="true"
              data-open={openId === s.id ? 'true' : 'false'}
              onClick={() => setOpenId(openId === s.id ? null : s.id)}
            >
              <div><span className={'status-dot ' + s.status} /></div>
              <div className="mcp-name-cell">
                <div className="mcp-name">{s.name}{!s.builtin && <span className="mcp-tag">Custom</span>}</div>
                <div className="mcp-desc">{s.desc}</div>
              </div>
              <div className="mcp-url num">{s.url}</div>
              <div className="num" style={{ textAlign: 'right' }}>{s.reqs24h ? s.reqs24h.toLocaleString() : '—'}</div>
              <div className="num mcp-time">{s.lastCheck}</div>
              <div onClick={e => e.stopPropagation()}>
                <Switch checked={s.enabled} />
              </div>
              <div><Icon name="chev" size={12} className={'mcp-chev' + (openId === s.id ? ' open' : '')}/></div>
            </button>
            {openId === s.id && (
              <div className="mcp-detail">
                <div className="mcp-detail-grid">
                  <div className="mcp-detail-section">
                    <div className="mcp-detail-h">Connection</div>
                    <div className="mcp-detail-row"><span className="lbl">URL</span><code>{s.url}</code></div>
                    <div className="mcp-detail-row"><span className="lbl">Auth</span><span>OAuth · refreshes in 18d</span></div>
                    <div className="mcp-detail-row"><span className="lbl">Region</span><span>us-east-1, us-west-2</span></div>
                  </div>
                  <div className="mcp-detail-section">
                    <div className="mcp-detail-h">Scopes</div>
                    <div className="mcp-scopes">
                      {s.scopes.map(sc => <span key={sc} className="mcp-scope">{sc}</span>)}
                    </div>
                  </div>
                  <div className="mcp-detail-section">
                    <div className="mcp-detail-h">Activity · 7d</div>
                    <Sparkline values={[12,18,15,20,17,19,22].map(x => x * (s.reqs24h ? 1 : 0))} color="var(--accent)" height={32}/>
                    <div className="mcp-detail-row"><span className="lbl">Avg latency</span><span className="num">82 ms</span></div>
                    <div className="mcp-detail-row"><span className="lbl">Error rate</span><span className="num">{s.status === 'bad' ? '4.2%' : s.status === 'warn' ? '0.8%' : '0.02%'}</span></div>
                  </div>
                </div>
                <div className="mcp-detail-actions">
                  <button className="btn ghost">Test connection</button>
                  <button className="btn ghost">View logs</button>
                  <button className="btn ghost">Edit credentials</button>
                  {!s.builtin && <button className="btn ghost danger">Remove</button>}
                </div>
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </>
  );
}

function Switch({ checked, onChange }) {
  const [on, setOn] = useStateS(checked);
  return (
    <button className={'twk-switch' + (on ? ' on' : '')}
            onClick={() => { const v = !on; setOn(v); onChange && onChange(v); }}
            aria-label="Toggle">
      <span className="twk-switch-thumb" />
    </button>
  );
}

/* ---------- Profile ---------- */
function ProfilePanel() {
  const p = DS.PROFILE;
  const [theme, setTheme] = useStateS(p.theme);
  const [verbosity, setVerbosity] = useStateS(p.logVerbosity);

  return (
    <div className="settings-form">
      <div className="form-card">
        <div className="form-row avatar-row">
          <div className="avatar-circle"><Icon name="home" size={22}/></div>
          <button className="btn ghost-accent">Change Avatar</button>
        </div>

        <FormSection label="Email" hint="Email cannot be changed">
          <input className="form-input lg" type="text" defaultValue={p.email} disabled />
        </FormSection>

        <FormSection label="Name">
          <input className="form-input lg" type="text" defaultValue={p.name} />
        </FormSection>

        <FormSection label="Timezone">
          <select className="form-input lg" defaultValue={p.timezone}>
            <option>GMT (Europe/London)</option>
            <option>EST (America/New_York)</option>
            <option>PST (America/Los_Angeles)</option>
            <option>UTC</option>
            <option>JST (Asia/Tokyo)</option>
          </select>
        </FormSection>

        <FormSection>
          <div className="toggle-row">
            <div>
              <div className="toggle-row-title">Voice Input</div>
              <div className="toggle-row-desc">Enable microphone icon in the chat bar for speech-to-text.</div>
            </div>
            <Switch checked={p.voiceInput} />
          </div>
        </FormSection>

        <FormSection label="Theme">
          <div className="theme-pills">
            {[
              { k: 'dark',  l: 'Dark',  i: 'moon' },
              { k: 'light', l: 'Light', i: 'sun' },
              { k: 'auto',  l: 'Auto',  i: 'desktop' },
            ].map(o => (
              <button key={o.k} className="theme-pill" data-on={theme === o.k ? 'true' : 'false'} onClick={() => setTheme(o.k)}>
                <ThemeIcon name={o.i}/>
                <span>{o.l}</span>
              </button>
            ))}
          </div>
        </FormSection>

        <FormSection label="Frontend log verbosity" hint={<>Controls what the browser console shows. Also available via <code>window.__setLogLevel('debug')</code></>}>
          <div className="verbosity-pills">
            {['silent','error','warn','info','debug','verbose'].map(v => (
              <button key={v} className="verb-pill" data-on={verbosity === v ? 'true' : 'false'} onClick={() => setVerbosity(v)}>
                {v}
              </button>
            ))}
          </div>
        </FormSection>

        <div className="form-actions split">
          <button className="btn ghost danger"><Icon name="logout" size={12}/> Logout</button>
          <button className="btn primary">Save</button>
        </div>
      </div>
    </div>
  );
}

function ThemeIcon({ name }) {
  const props = { width: 13, height: 13, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' };
  if (name === 'moon')    return <svg {...props}><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>;
  if (name === 'sun')     return <svg {...props}><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>;
  if (name === 'desktop') return <svg {...props}><rect x="3" y="4" width="18" height="12" rx="1"/><path d="M8 20h8M12 16v4"/></svg>;
  return null;
}

function FormSection({ label, hint, children }) {
  return (
    <div className="form-section">
      {label && <div className="form-label">{label}</div>}
      {children}
      {hint && <div className="form-hint">{hint}</div>}
    </div>
  );
}

/* ---------- Models ---------- */
function ModelsPanel() {
  const cfg = DS.MODELS_CFG;
  const [primary, setPrimary] = useStateS(cfg.primary);
  const [flash, setFlash] = useStateS(cfg.flash);
  const [quick, setQuick] = useStateS(cfg.quick);
  const [advancedOpen, setAdvancedOpen] = useStateS(false);

  return (
    <div className="settings-form">
      <div className="form-card">
        <FormSection label={<>Primary Model <span className="req">*</span></>} hint="For deep research with code execution and data analysis">
          <select className="form-input lg" value={primary} onChange={e => setPrimary(e.target.value)}>
            {DS.MODEL_OPTIONS.map(m => <option key={m}>{m}</option>)}
          </select>
        </FormSection>

        <FormSection label={<>Flash Model <span className="req">*</span></>} hint="For quick answers without a sandbox">
          <select className="form-input lg" value={flash} onChange={e => setFlash(e.target.value)}>
            {DS.MODEL_OPTIONS.map(m => <option key={m}>{m}</option>)}
          </select>
        </FormSection>

        <button type="button" className="adv-toggle" onClick={() => setAdvancedOpen(!advancedOpen)}>
          <Icon name="chev" size={11} className={advancedOpen ? 'rot' : ''}/> Advanced
        </button>

        {advancedOpen && (
          <div className="adv-block">
            <FormSection label="Reasoning effort" hint="How aggressively the primary model thinks">
              <div className="seg fill">
                {['minimal','low','medium','high'].map(o => (
                  <button key={o} data-on={o === 'medium' ? 'true' : 'false'}>{o}</button>
                ))}
              </div>
            </FormSection>
            <FormSection label="Token budget" hint="Per-task output cap">
              <input className="form-input lg" type="text" defaultValue="8192" />
            </FormSection>
          </div>
        )}

        <FormSection label="Quick-access models" hint="Starred models appear in the chat input for quick switching">
          <div className="model-chips">
            {quick.map(m => (
              <span key={m} className="model-chip">
                {m}
                <button className="model-chip-x" onClick={() => setQuick(quick.filter(x => x !== m))} aria-label="Remove">
                  <Icon name="close" size={10}/>
                </button>
              </span>
            ))}
            <button className="model-chip add" onClick={() => {
              const opts = DS.MODEL_OPTIONS.filter(o => !quick.includes(o));
              if (opts.length) setQuick([...quick, opts[0]]);
            }}>
              <Icon name="plus" size={10}/> Add
            </button>
          </div>
        </FormSection>

        <div className="form-divider"/>

        <FormSection label="Connected Accounts" hint="Connect external accounts to use models through your existing subscriptions.">
          <div className="acct-list">
            {cfg.accounts.map(a => (
              <div key={a.id} className="acct-row">
                <div className={'acct-icon ' + (a.status === 'connected' ? 'on' : '')}>
                  <Icon name="link" size={13}/>
                </div>
                <div className="acct-name-col">
                  <div className="acct-name">{a.name}</div>
                  <div className="acct-desc">{a.desc}</div>
                </div>
                {a.status === 'connected'
                  ? <button className="btn ghost danger sm"><Icon name="link-off" size={11}/> Disconnect</button>
                  : <button className="btn primary sm"><Icon name="link" size={11}/> Connect</button>}
              </div>
            ))}
          </div>
        </FormSection>

        <div className="manage-providers-row">
          <div>
            <div className="acct-name">Manage providers</div>
            <div className="acct-desc">Add or remove API keys, custom providers, and models</div>
          </div>
          <button className="btn ghost-accent sm"><Icon name="settings" size={12}/></button>
        </div>

        <div className="form-actions">
          <button className="btn primary">Save</button>
        </div>
      </div>
    </div>
  );
}

/* ---------- Skills ---------- */
function SkillsPanel() {
  const [selected, setSelected] = useStateS(null);
  const [editing, setEditing] = useStateS(false);
  const [content, setContent] = useStateS(DS.SKILL_DETAIL_SAMPLE);

  return (
    <div className="settings-skills">
      <div className="skills-toolbar">
        <p className="skills-desc">View and edit skill SKILL.md files. System skills are editable on disk. Create custom skills below.</p>
        <button className="btn primary"><Icon name="plus" size={12}/> New skill</button>
      </div>

      <div className="skills-split">
        <div className="skills-list-col">
          <div className="skills-list-head">SYSTEM</div>
          {DS.SKILLS.map(sk => (
            <button
              key={sk.id}
              className="skill-item"
              data-on={selected === sk.id ? 'true' : 'false'}
              onClick={() => { setSelected(sk.id); setEditing(false); }}
            >
              <div className="skill-name">{sk.name}</div>
              <code className="skill-slug">{sk.slug}</code>
            </button>
          ))}
        </div>

        <div className="skills-detail-col">
          {!selected && (
            <div className="skill-empty">
              <div className="skill-empty-icon"><Icon name="briefing" size={22}/></div>
              <div>Select a skill to view and edit its SKILL.md content</div>
            </div>
          )}
          {selected && (() => {
            const sk = DS.SKILLS.find(s => s.id === selected);
            return (
              <div className="skill-detail">
                <div className="skill-detail-head">
                  <div>
                    <h3>{sk.name}</h3>
                    <div className="skill-detail-meta">
                      <code>{sk.slug}</code>
                      <span className="dot-sep">·</span>
                      <span>updated {sk.updated} ago</span>
                      <span className="dot-sep">·</span>
                      {sk.tags.map(t => <span key={t} className="skill-tag">{t}</span>)}
                    </div>
                  </div>
                  <div className="skill-detail-actions">
                    {editing
                      ? <>
                          <button className="btn ghost" onClick={() => setEditing(false)}>Cancel</button>
                          <button className="btn primary" onClick={() => setEditing(false)}>Save</button>
                        </>
                      : <>
                          <button className="btn ghost"><Icon name="copy" size={12}/> Copy path</button>
                          <button className="btn ghost-accent" onClick={() => setEditing(true)}><Icon name="edit" size={12}/> Edit</button>
                        </>}
                  </div>
                </div>
                {editing
                  ? <textarea className="skill-editor" value={content} onChange={e => setContent(e.target.value)} />
                  : <pre className="skill-md">{content}</pre>}
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}

/* ---------- Workspaces (Networks / Ops / Customer) ---------- */
function WorkspacesSettingsPanel() {
  const [tab, setTab] = useStateS('networks');
  return (
    <div className="settings-form">
      <div className="ws-tabs">
        <button data-on={tab === 'networks' ? 'true' : 'false'} onClick={() => setTab('networks')}>
          <Icon name="grid" size={13}/> Networks
        </button>
        <button data-on={tab === 'ops' ? 'true' : 'false'} onClick={() => setTab('ops')}>
          <Icon name="briefing" size={13}/> Ops
        </button>
        <button data-on={tab === 'customer' ? 'true' : 'false'} onClick={() => setTab('customer')}>
          <Icon name="users" size={13}/> Customer
        </button>
      </div>

      {tab === 'networks' && <WSNetworks/>}
      {tab === 'ops' && <WSOps/>}
      {tab === 'customer' && <WSCustomers/>}
    </div>
  );
}

function WSNetworks() {
  const [openId, setOpenId] = useStateS(null);
  const nets = DS.WS_NETWORKS;

  return (
    <>
      <div className="ws-tab-bar">
        <p className="ws-tab-desc">Manage service configurations and endpoint addresses.</p>
        <button className="btn primary"><Icon name="plus" size={12}/> Add Network</button>
      </div>

      <div className="ws-net-list">
        {nets.map(n => (
          <div key={n.id} className="ws-net-row" data-open={openId === n.id ? 'true' : 'false'}>
            <button className="ws-net-head" onClick={() => setOpenId(openId === n.id ? null : n.id)}>
              <Icon name="chev" size={11} className={'ws-net-chev' + (openId === n.id ? ' open' : '')}/>
              <span className="ws-net-name">{n.name}</span>
              <span className="ws-net-kind">{n.kind}</span>
              <span className="ws-net-spacer"/>
              <span className="ws-net-url num">{n.url}</span>
              <span className="ws-net-addrs num">{n.addrs} addr</span>
              <span onClick={e => e.stopPropagation()} className="ws-net-switch">
                <Switch checked={n.enabled}/>
              </span>
              <span className={'status-dot ' + n.status}/>
              <button className="ws-net-del" onClick={e => e.stopPropagation()} aria-label="Remove">
                <Icon name="trash" size={13}/>
              </button>
            </button>
            {openId === n.id && (
              <div className="ws-net-detail">
                <div className="ws-net-grid">
                  <FormSection label="Endpoint URL"><input className="form-input mono" defaultValue={n.url}/></FormSection>
                  <FormSection label="Protocol">
                    <select className="form-input mono" defaultValue={n.kind}>
                      <option>rest</option><option>grpc</option><option>graphql</option><option>websocket</option>
                    </select>
                  </FormSection>
                  <FormSection label="Instance addresses">
                    <div className="addr-mini-list">
                      {Array.from({ length: n.addrs }, (_, i) => (
                        <div key={i} className="addr-mini-row">
                          <code>0x{Math.random().toString(16).slice(2,6)}…{Math.random().toString(16).slice(2,6)}</code>
                          <button aria-label="Remove"><Icon name="close" size={11}/></button>
                        </div>
                      ))}
                      <button className="addr-add-btn"><Icon name="plus" size={11}/> Add address</button>
                    </div>
                  </FormSection>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
}

/* ---- Ops workspaces — pick any combination of ticketing + comms tools ---- */
function WSOps() {
  const [openId, setOpenId] = useStateS('cost');
  const ws = DS.OPS_WORKSPACES;
  const ticketingTools = DS.TICKETING_TOOLS;
  const docsTools = DS.DOCS_TOOLS;
  const commsTools = DS.COMMS_TOOLS;
  return (
    <>
      <div className="ws-tab-bar">
        <p className="ws-tab-desc">Ops workspaces bundle ticketing, documentation, and one or more communication channels. Tools are connected once in <a className="inline-link" href="#integrations">Integrations</a>, then picked per workspace.</p>
        <button className="btn primary"><Icon name="plus" size={12}/> Add Ops Workspace</button>
      </div>
      <div className="ws-net-list">
        {ws.map(w => {
          const open = openId === w.id;
          const tk = w.ticketing ? ticketingTools.find(t => t.id === w.ticketing.tool) : null;
          const dcCount = (w.docs || []).length;
          const totalChannels = (w.comms || []).reduce((n, c) => n + (c.channels?.length || 0), 0);
          return (
            <div key={w.id} className="ws-net-row" data-open={open ? 'true' : 'false'}>
              <button className="ws-net-head ws-ops-head" onClick={() => setOpenId(open ? null : w.id)}>
                <Icon name="chev" size={13} className={'ws-net-chev ' + (open ? 'open' : '')}/>
                <span className="ws-ops-head-name">{w.name}</span>
                <span className="ws-ops-head-desc">{w.desc}</span>
                <span className="ws-ops-head-stats">
                  <span className="ws-ops-stat">
                    {tk
                      ? <span className="ws-ops-stat-v"><span className="ws-ops-stat-dot" style={{ background: tk.color }}/>{tk.name}</span>
                      : <span className="ws-ops-stat-v dim">No ticketing</span>}
                  </span>
                  <span className="sep">·</span>
                  <span className="ws-ops-stat">
                    <span className={'ws-ops-stat-v' + (dcCount === 0 ? ' dim' : '')}>{dcCount} docs</span>
                  </span>
                  <span className="sep">·</span>
                  <span className="ws-ops-stat">
                    <span className={'ws-ops-stat-v' + (totalChannels === 0 ? ' dim' : '')}>{totalChannels} {totalChannels === 1 ? 'channel' : 'channels'}</span>
                  </span>
                  <span className="sep">·</span>
                  <span className="ws-ops-stat">
                    <span className="ws-ops-stat-v">{w.automations} automation{w.automations === 1 ? '' : 's'}</span>
                  </span>
                </span>
                <span className="ws-net-del" role="button" aria-label="Delete"><Icon name="trash" size={13}/></span>
              </button>
              {open && <WSOpsDetail ws={w} ticketingTools={ticketingTools} docsTools={docsTools} commsTools={commsTools}/>}
            </div>
          );
        })}
      </div>
    </>
  );
}

function WSOpsDetail({ ws, ticketingTools, docsTools, commsTools }) {
  const [tkId, setTkId]   = useStateS(ws.ticketing ? ws.ticketing.tool : null);
  const [docIds, setDocIds]   = useStateS((ws.docs || []).map(d => d.tool));
  const [commIds, setCommIds] = useStateS((ws.comms || []).map(c => c.tool));
  return (
    <div className="ws-ops-detail">
      <WSOpsSingleSection
        title="Ticketing"
        sub="One per workspace. Tickets opened from this workspace land here."
        emptyMsg="No ticketing system selected."
        tools={ticketingTools}
        activeId={tkId}
        setActiveId={setTkId}
        storedTool={ws.ticketing?.tool}
        storedValues={ws.ticketing?.values}
      />

      <WSOpsMultiSection
        title="Documentation"
        sub="Post-mortems, runbooks and weekly summaries are written to each destination."
        emptyMsg="No documentation destinations selected."
        tools={docsTools}
        activeIds={docIds}
        setActiveIds={setDocIds}
        stored={ws.docs || []}
      />

      <WSOpsCommsSection
        commsTools={commsTools}
        commIds={commIds}
        setCommIds={setCommIds}
        stored={ws.comms || []}
      />
    </div>
  );
}

function WSOpsMultiSection({ title, sub, emptyMsg, tools, activeIds, setActiveIds, stored }) {
  return (
    <div className="ws-ops-sec">
      <div className="ws-ops-sec-head">
        <div>
          <div className="ws-ops-sec-title">{title}</div>
          <div className="ws-ops-sec-sub">{sub}</div>
        </div>
        <span className="ws-ops-sec-count">{activeIds.length} selected</span>
      </div>
      <div className="ws-ops-toolpicker">
        {tools.map(t => {
          const on = activeIds.includes(t.id);
          return (
            <button key={t.id}
              className="ws-ops-tool"
              data-on={on ? 'true' : 'false'}
              data-disabled={t.connected ? 'false' : 'true'}
              style={{ '--td': t.color }}
              onClick={() => {
                if (!t.connected) return;
                setActiveIds(on ? activeIds.filter(x => x !== t.id) : [...activeIds, t.id]);
              }}>
              <ToolGlyph id={t.id}/>
              <span className="ws-ops-tool-name">{t.name}</span>
              {!t.connected && <span className="ws-ops-tool-status">Not connected</span>}
              {on && <svg className="ws-ops-tool-check" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 6"/></svg>}
            </button>
          );
        })}
      </div>
      {activeIds.length === 0 && <div className="ws-ops-empty"><span>{emptyMsg}</span></div>}
      {activeIds.map(id => {
        const tool = tools.find(t => t.id === id);
        const storedEntry = stored.find(s => s.tool === id);
        return <WSOpsConfigBlock key={id} tool={tool} values={storedEntry?.values || {}}/>;
      })}
    </div>
  );
}

function WSOpsConfigBlock({ tool, values }) {
  return (
    <div className="ws-ops-config">
      <div className="ws-ops-config-head">
        <ToolGlyph id={tool.id}/>
        <span className="ws-ops-config-name">{tool.name}</span>
      </div>
      <div className="ws-ops-fields">
        {tool.fields.map(f => (
          <div key={f.key} className="form-section" data-half={f.half ? 'true' : 'false'}>
            <div className="form-section-label">{f.label}</div>
            {f.type === 'select'
              ? <select className="form-input" defaultValue={values[f.key] || f.options[0]}>
                  {f.options.map(o => <option key={o}>{o}</option>)}
                </select>
              : <input className={'form-input ' + (f.mono ? 'mono' : '')} type="text"
                  placeholder={f.placeholder}
                  defaultValue={values[f.key] || ''}/>}
          </div>
        ))}
      </div>
    </div>
  );
}

function WSOpsCommsSection({ commsTools, commIds, setCommIds, stored }) {
  return (
    <div className="ws-ops-sec">
      <div className="ws-ops-sec-head">
        <div>
          <div className="ws-ops-sec-title">Communication</div>
          <div className="ws-ops-sec-sub">Handovers, alerts and weekly summaries are posted to each channel.</div>
        </div>
        <span className="ws-ops-sec-count">{commIds.length} selected</span>
      </div>
      <div className="ws-ops-toolpicker">
        {commsTools.map(t => {
          const on = commIds.includes(t.id);
          return (
            <button key={t.id}
              className="ws-ops-tool"
              data-on={on ? 'true' : 'false'}
              data-disabled={t.connected ? 'false' : 'true'}
              style={{ '--td': t.color }}
              onClick={() => {
                if (!t.connected) return;
                setCommIds(on ? commIds.filter(x => x !== t.id) : [...commIds, t.id]);
              }}>
              <ToolGlyph id={t.id}/>
              <span className="ws-ops-tool-name">{t.name}</span>
              {!t.connected && <span className="ws-ops-tool-status">Not connected</span>}
              {on && <svg className="ws-ops-tool-check" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 6"/></svg>}
            </button>
          );
        })}
      </div>
      {commIds.length === 0 && <div className="ws-ops-empty"><span>No channels selected.</span></div>}
      {commIds.map(id => {
        const tool = commsTools.find(t => t.id === id);
        const storedEntry = stored.find(s => s.tool === id);
        return <WSCommsBlock key={id} tool={tool} channels={storedEntry?.channels || []}/>;
      })}
    </div>
  );
}

function WSCommsBlock({ tool, channels }) {
  return (
    <div className="ws-ops-comms-block">
      <div className="ws-ops-comms-head">
        <ToolGlyph id={tool.id}/>
        <span className="ws-ops-comms-name">{tool.name}</span>
        <span className="ws-ops-comms-count">{channels.length} {tool.channelLabel}</span>
      </div>
      {channels.length > 0 && (
        <div className="ws-ops-ch-list">
          {channels.map(c => (
            <div key={c.id} className="ws-ops-ch-row">
              <code className="ws-ops-ch-id">{c.id}</code>
              <span className="ws-ops-ch-name">{c.name}</span>
              <span className="ws-ops-ch-purpose">{c.purpose}</span>
              <button className="ws-ops-ch-del" aria-label="Remove"><Icon name="trash" size={12}/></button>
            </div>
          ))}
        </div>
      )}
      <div className="ws-ops-ch-add">
        <input className="form-input mono" placeholder={tool.placeholders.id}/>
        <input className="form-input" placeholder={tool.placeholders.name}/>
        <input className="form-input" placeholder={tool.placeholders.purpose}/>
        <button className="btn primary sm"><Icon name="plus" size={11}/> Add</button>
      </div>
    </div>
  );
}

function WSOpsSingleSection({ title, sub, emptyMsg, tools, activeId, setActiveId, storedTool, storedValues }) {
  const active = activeId ? tools.find(t => t.id === activeId) : null;
  const values = activeId && storedTool === activeId ? (storedValues || {}) : {};
  return (
    <div className="ws-ops-sec">
      <div className="ws-ops-sec-head">
        <div>
          <div className="ws-ops-sec-title">{title}</div>
          <div className="ws-ops-sec-sub">{sub}</div>
        </div>
        <button className="ws-ops-sec-clear" onClick={() => setActiveId(null)} data-show={activeId ? 'true' : 'false'}>Disable</button>
      </div>
      <div className="ws-ops-toolpicker">
        {tools.map(t => (
          <button key={t.id}
            className="ws-ops-tool"
            data-on={activeId === t.id ? 'true' : 'false'}
            data-disabled={t.connected ? 'false' : 'true'}
            style={{ '--td': t.color }}
            onClick={() => t.connected && setActiveId(activeId === t.id ? null : t.id)}>
            <ToolGlyph id={t.id}/>
            <span className="ws-ops-tool-name">{t.name}</span>
            {!t.connected && <span className="ws-ops-tool-status">Not connected</span>}
            {activeId === t.id && <svg className="ws-ops-tool-check" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 6"/></svg>}
          </button>
        ))}
      </div>
      {active && (
        <div className="ws-ops-fields">
          {active.fields.map(f => (
            <div key={f.key} className="form-section" data-half={f.half ? 'true' : 'false'}>
              <div className="form-section-label">{f.label}</div>
              {f.type === 'select'
                ? <select className="form-input lg" defaultValue={values[f.key] || f.options[0]}>
                    {f.options.map(o => <option key={o}>{o}</option>)}
                  </select>
                : <input className={'form-input lg ' + (f.mono ? 'mono' : '')} type="text"
                    placeholder={f.placeholder}
                    defaultValue={values[f.key] || ''}/>}
            </div>
          ))}
          <div className="ws-ops-fields-actions">
            <button className="btn primary sm">Save {active.name} config</button>
          </div>
        </div>
      )}
      {!active && (
        <div className="ws-ops-empty">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 8v4M12 16h.01"/></svg>
          <span>{emptyMsg}</span>
        </div>
      )}
    </div>
  );
}

function ToolGlyph({ id }) {
  /* Brand-tinted square with a 1-letter mark — placeholder for real tool logos */
  const letter = ({ linear: 'L', jira: 'J', github: 'G', asana: 'A', slack: 'S', teams: 'T', discord: 'D', pagerduty: 'P', email: '@', confluence: 'C', notion: 'N', gdocs: 'D', ghwiki: 'W' })[id] || '·';
  return <span className="ws-ops-glyph" data-tool={id}>{letter}</span>;
}

function WSCustomers() {
  return (
    <>
      <div className="ws-tab-bar">
        <p className="ws-tab-desc">Customer accounts using this org's API and service infrastructure.</p>
        <button className="btn primary"><Icon name="plus" size={12}/> Add customer</button>
      </div>
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="ws-cust-table">
          <thead>
            <tr><th>Customer</th><th>Tier</th><th style={{ textAlign: 'right' }}>MAU</th><th style={{ textAlign: 'right' }}>Spend</th><th>SLA</th><th></th></tr>
          </thead>
          <tbody>
            {DS.WS_CUSTOMERS.map(c => (
              <tr key={c.id}>
                <td><div className="cust-name">{c.name}</div></td>
                <td><span className={'tier-pill tier-' + c.tier.toLowerCase()}>{c.tier}</span></td>
                <td className="num" style={{ textAlign: 'right' }}>{c.mau}</td>
                <td className="num" style={{ textAlign: 'right' }}>{c.spend}</td>
                <td className="num">{c.sla}</td>
                <td><button className="btn ghost sm">View</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

/* ---------- Performance stub kept ---------- */
function PerformancePanel() {
  return (
    <div className="settings-form">
      <div className="form-card">
        <FormSection label="Default query window" hint="How far back dashboards look by default">
          <div className="seg fill">
            {['15m','1h','6h','24h','7d'].map(o => (
              <button key={o} data-on={o === '1h' ? 'true' : 'false'}>{o}</button>
            ))}
          </div>
        </FormSection>
        <FormSection label="Cache TTL" hint="How long aggregated metrics are cached">
          <input className="form-input lg" type="text" defaultValue="60s"/>
        </FormSection>
        <FormSection label="Indexer regions" hint="Regions used for indexer reads, in priority order">
          <div className="model-chips">
            {['us-east-1','us-west-2','eu-west-1','ap-northeast-1'].map(r => (
              <span key={r} className="model-chip">{r} <button className="model-chip-x"><Icon name="close" size={10}/></button></span>
            ))}
            <button className="model-chip add"><Icon name="plus" size={10}/> Add</button>
          </div>
        </FormSection>
        <FormSection>
          <div className="toggle-row">
            <div>
              <div className="toggle-row-title">Concurrent indexer reads</div>
              <div className="toggle-row-desc">Fan out reads across regions in parallel; uses more bandwidth</div>
            </div>
            <Switch checked={true}/>
          </div>
        </FormSection>
        <div className="form-actions">
          <button className="btn primary">Save</button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { SettingsPage });
