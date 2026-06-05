/* Mock data for wardn Operations Console */

const NOW = new Date('2026-04-29T11:13:00Z');

const CHAINS = [
  { id: 'og',       name: 'Auth Service',  type: 'production',  cssVar: '--c-og',       block: 31840308, blockDelta: '+12.4k',  status: 'healthy',  rps: 84.1, rpsWow: '+3.3%',   p95: 142, slo: 99.94, vote: 99.92, voteWow: '+0.01%', delegation: 4_812_000, delegationWow: '+1.4%', commission: 5,  missed: 2,   cost: 4820,  costWow: '+1.2%',  alerts: 0 },
  { id: 'somnia',   name: 'Edge Gateway',    type: 'production',  cssVar: '--c-somnia',   block: 293745449, blockDelta: '+359', status: 'healthy',  rps: 282.8, rpsWow: '+282.8%', p95: 96,  slo: 99.99, vote: 99.98, voteWow: '+0.00%', delegation: 1_240_500, delegationWow: '+12.6%',commission: 4,  missed: 0,   cost: 3210,  costWow: '+8.4%',  alerts: 0 },
  { id: 'starknet', name: 'Ingest',  type: 'production',  cssVar: '--c-starknet', block: 9282079,  blockDelta: '+1.6k',  status: 'healthy',  rps: 41.2, rpsWow: '-3.8%',   p95: 188, slo: 99.91, vote: 99.85, voteWow: '-0.04%', delegation: 8_640_300, delegationWow: '+0.2%', commission: 5,  missed: 7,   cost: 2980,  costWow: '-2.1%',  alerts: 1 },
  { id: 'solana',   name: 'Search',    type: 'production',  cssVar: '--c-solana',   block: null,     blockDelta: null,     status: 'degraded', rps: 69.0, rpsWow: '-13.0%',  p95: 412, slo: 98.41, vote: 87.26, voteWow: '-12.7%', delegation: 71_709,    delegationWow: '+2.7%', commission: 5,  missed: 412, cost: 6940,  costWow: '+18.6%', alerts: 3 },
  { id: 'monad',    name: 'Payments',     type: 'production',  cssVar: '--c-monad',    block: 71309741, blockDelta: '0',      status: 'down',     rps: 0,    rpsWow: '-100%',   p95: null, slo: 89.20, vote: 0,     voteWow: '-100%',  delegation: 14_204_900,delegationWow: '0%',    commission: 5,  missed: 980, cost: 1620,  costWow: '+4.1%',  alerts: 4 },
  { id: 'espresso', name: 'Log Pipeline',  type: 'staging',  cssVar: '--c-espresso', block: null,     blockDelta: null,     status: 'degraded', rps: 12.4, rpsWow: '-44.2%',  p95: 304, slo: 96.10, vote: 96.10, voteWow: '-3.1%',  delegation: 0,         delegationWow: '0%',    commission: 0,  missed: 144, cost: 880,   costWow: '-6.8%',  alerts: 2 },
  { id: 'base',     name: 'Media CDN',      type: 'production',  cssVar: '--c-base',     block: 27432198, blockDelta: '+8.2k',  status: 'healthy',  rps: 488.1, rpsWow: '+3.3%',  p95: 76,  slo: 99.98, vote: 99.99, voteWow: '+0.01%', delegation: 12_490_000,delegationWow: '+0.6%', commission: 4,  missed: 1,   cost: 5410,  costWow: '+0.8%',  alerts: 0 },
  { id: 'eth',      name: 'Core API',  type: 'production',  cssVar: '--c-eth',      block: 21384921, blockDelta: '+115',   status: 'healthy',  rps: 91.4, rpsWow: '-9.9%',   p95: 132, slo: 99.97, vote: 99.96, voteWow: '0.00%',  delegation: 32_768,    delegationWow: '+0.0%', commission: 7,  missed: 3,   cost: 7240,  costWow: '+2.4%',  alerts: 0 },
];

/* generate sparkline data: array of numbers */
function gen(seed, n, base, vol, trend = 0, anomalyIdx = -1) {
  const out = [];
  let v = base;
  let s = seed;
  for (let i = 0; i < n; i++) {
    s = (s * 9301 + 49297) % 233280;
    const r = (s / 233280 - 0.5) * vol;
    v = v * (1 + r) + trend;
    if (i === anomalyIdx) v = v * 0.45;
    out.push(Math.max(0, v));
  }
  return out;
}

const ANOMALIES = [
  {
    id: 'a1',
    sev: 'crit',
    chain: 'monad',
    svc: 'payments-api',
    tag: 'INCIDENT',
    headline: 'payments-api stopped responding — 0 healthy nodes',
    delta: '-100% availability',
    since: '00:48 UTC',
    spark: gen(11, 30, 1.0, 0.06, 0, 22),
    cause: 'Quorum lost · 4/5 instances unreachable',
  },
  {
    id: 'a2',
    sev: 'warn',
    chain: 'solana',
    svc: 'search-svc',
    tag: 'REGRESSION',
    headline: 'search-svc p95 latency 412ms · 2.4× weekly avg',
    delta: '+143% vs 7d',
    since: '08:22 UTC',
    spark: gen(7, 30, 170, 0.12, 4),
    cause: 'Upstream gateway 404s on us-west-2',
  },
  {
    id: 'a3',
    sev: 'warn',
    chain: 'espresso',
    svc: 'log-pipeline',
    tag: 'COST DRIFT',
    headline: 'Datadog ingest spend +37% week-over-week',
    delta: '+$1,840 wk',
    since: '3 days ago',
    spark: gen(31, 30, 60, 0.05, 1.6),
    cause: 'Custom metrics from new edge-gateway pods',
  },
  {
    id: 'a4',
    sev: 'info',
    chain: 'somnia',
    svc: 'edge-gateway',
    tag: 'OPPORTUNITY',
    headline: 'edge-gateway traffic 4× — opportunity to scale up',
    delta: '+282% req/s',
    since: '6 hours ago',
    spark: gen(13, 30, 50, 0.08, 7),
    cause: 'Sustained growth, no errors',
  },
];

const SLOS = [
  { id: 's1', name: 'API availability',   target: '99.95%', value: 99.97, state: 'ok',   budget: 0.62, scope: 'all services' },
  { id: 's2', name: 'Service uptime',     target: '99.90%', value: 99.42, state: 'warn', budget: 0.18, scope: '6 services' },
  { id: 's3', name: 'Sync latency', target: '< 2s',   value: 96.14, state: 'bad',  budget: 0.04, scope: 'all services' },
];

/* Request volume by service — last 7 days, daily counts (millions) */
const RPC_VOLUME = [
  { chain: 'eth',      total: 488.1, wow: '+3.3%',   daily: [62.4, 65.1, 68.0, 71.2, 73.5, 74.8, 73.1] },
  { chain: 'base',     total: 457.0, wow: '-1.6%',   daily: [70.2, 68.4, 66.5, 64.0, 64.8, 62.1, 61.0] },
  { chain: 'solana',   total: 144.9, wow: '+115.8%', daily: [9.0, 12.2, 15.8, 22.4, 26.1, 28.4, 31.0] },
  { chain: 'somnia',   total: 119.0, wow: '+282.8%', daily: [4.2, 8.4, 12.6, 16.8, 22.0, 26.2, 28.8] },
  { chain: 'starknet', total: 91.9,  wow: '-9.9%',   daily: [15.1, 14.8, 14.2, 13.6, 12.4, 11.0, 10.8] },
  { chain: 'og',       total: 84.1,  wow: '+4.1%',   daily: [10.2, 11.0, 11.8, 12.4, 12.8, 12.6, 13.3] },
  { chain: 'monad',    total: 75.0,  wow: '+5.2%',   daily: [9.8, 10.4, 10.8, 11.2, 11.6, 10.9, 10.3] },
  { chain: 'espresso', total: 12.4,  wow: '-44.2%',  daily: [3.1, 2.8, 2.0, 1.6, 1.2, 0.9, 0.8] },
];

/* Datadog alert feed */
const ALERTS_FEED = [
  { id: 'al1', sev: 'P1', title: 'Metric not increasing on payments-api · us-east-1',          chain: 'base',     at: '00:48 UTC', open: true,  ack: false, dur: '4h 12m' },
  { id: 'al2', sev: 'P1', title: 'Persistent volume claim running low on storage',               chain: 'eth',      at: '01:14 UTC', open: true,  ack: true,  dur: '3h 46m' },
  { id: 'al3', sev: 'P1', title: 'All nodes unhealthy on payments-api · us-east-1',              chain: 'monad',    at: '00:48 UTC', open: true,  ack: false, dur: '4h 12m' },
  { id: 'al4', sev: 'P1', title: 'Processing backlog growing on ingest-worker',                  chain: 'starknet', at: '02:00 UTC', open: true,  ack: false, dur: '3h 00m' },
  { id: 'al5', sev: 'P2', title: 'Processing backlog growing on report-builder',                 chain: 'eth',      at: '02:30 UTC', open: true,  ack: true,  dur: '2h 30m' },
  { id: 'al6', sev: 'P1', title: 'Metric not increasing on ingest-worker · eu-west-1',           chain: 'starknet', at: '03:14 UTC', open: false, ack: false, dur: '14m', resolved: '03:28 UTC' },
  { id: 'al7', sev: 'P1', title: 'Replica lag exceeding threshold on primary-db',                chain: 'eth',      at: '03:42 UTC', open: true,  ack: true,  dur: '1h 18m' },
  { id: 'al8', sev: 'P2', title: 'Health check failing on edge-gateway · eu-west-1',             chain: 'somnia',   at: '04:00 UTC', open: true,  ack: false, dur: '1h 00m' },
  { id: 'al9', sev: 'P3', title: 'Upstream 404 errors elevated on search-svc · us-west-2',       chain: 'solana',   at: '08:22 UTC', open: true,  ack: false, dur: '2h 51m' },
  { id: 'al10', sev: 'P3', title: 'Log ingestion spend +37% week-over-week',                          chain: 'espresso', at: '3 days ago', open: true, ack: true,  dur: '3d' },
];

/* Cost detail */
const COST_DETAIL = {
  total: 33100,
  prevTotal: 31800,
  byCategory: [
    { name: 'AWS Compute',    value: 14820, prev: 13900, share: 0.45 },
    { name: 'Datadog',        value: 8420,  prev: 6790,  share: 0.25 },
    { name: 'AWS Storage',    value: 4960,  prev: 4810,  share: 0.15 },
    { name: 'AWS Network',    value: 2810,  prev: 3120,  share: 0.085 },
    { name: 'Other SaaS',     value: 2090,  prev: 3180,  share: 0.063 },
  ],
  ddLineItems: [
    { name: 'Infra Hosts',      val: '248.9k', wow: '+24.4%' },
    { name: 'AWS Hosts',        val: '2.1k',    wow: '+66.2%' },
    { name: 'Containers',       val: '2.0M',    wow: '+42.8%' },
    { name: 'Logs Indexed',     val: '683.3M',  wow: '+81.2%' },
    { name: 'Custom Metrics',   val: '94.4k',   wow: '+31.3%' },
    { name: 'APM Hosts',        val: '34.2k',   wow: '+1.2%' },
  ],
};

/* Automations */
const AUTOMATIONS = [
  {
    id: 'auto-1', name: 'Daily Infrastructure Briefing', icon: 'sparkles', accent: 'var(--accent)',
    status: 'active', schedule: 'At 9:00 AM, Mon–Fri', cron: '0 9 * * 1-5', scheduleNl: 'Weekdays at 9 AM UTC',
    nextRun: 'tomorrow 9:00 AM', lastRun: '6h ago',
    successRate: 0.93, runs7d: [1,1,1,1,1,1,1], runs30d: 22, failures30d: 2,
    lastOutputTitle: '7 services healthy · Search p95 412ms · 2 deploys overnight',
    destinations: ['slack:#ops-briefing', 'in-app'],
    instruction: '/morning',
    avgDuration: '8m 42s',
    runsHistory: [
      { status: 'completed', thread: '981fcd1d…', when: 'Apr 29 12:13 PM', dur: '7m 24s', err: null },
      { status: 'completed', thread: '318f3066…', when: 'Apr 29 11:50 AM', dur: '9m 2s',  err: null },
      { status: 'completed', thread: '6a23010d…', when: 'Apr 29 10:00 AM', dur: '9m 13s', err: null },
      { status: 'completed', thread: '899a5b1f…', when: 'Apr 29 9:29 AM',  dur: '9m 40s', err: null },
      { status: 'completed', thread: '2128b22d…', when: 'Apr 28 10:30 AM', dur: '15m 47s', err: null },
      { status: 'completed', thread: 'b3987013…', when: 'Apr 27 10:00 AM', dur: '12m 26s', err: null },
      { status: 'completed', thread: 'a5b3ed6a…', when: 'Apr 26 7:47 PM',  dur: '757ms',   err: null },
      { status: 'failed',    thread: 'ccc80cdc…', when: 'Apr 26 5:55 PM',  dur: '4m 52s',  err: 'Server restarted during execution' },
      { status: 'completed', thread: '2bf8ab1…',  when: 'Apr 25 8:50 AM',  dur: '15m 50s', err: null },
      { status: 'completed', thread: '0c8a244c…', when: 'Apr 24 8:36 PM',  dur: '9m 14s',  err: null },
      { status: 'failed',    thread: 'a771c7f3…', when: 'Apr 24 8:05 PM',  dur: '8m 54s',  err: 'Server restarted during execution' },
      { status: 'failed',    thread: 'a73bb26c…', when: 'Apr 24 7:50 PM',  dur: '13m 5s',  err: 'Server restarted during execution' },
    ],
  },
  {
    id: 'auto-2', name: 'Daily Datadog Log Ingestion Report', icon: 'sparkles', accent: '#a855f7',
    status: 'active', schedule: 'Daily at 9:00 AM', cron: '0 9 * * *', scheduleNl: 'Every day at 9 AM UTC',
    nextRun: 'tomorrow 9:00 AM', lastRun: '6h ago',
    successRate: 1.0, runs7d: [1,1,1,1,1,1,1], runs30d: 30, failures30d: 0,
    lastOutputTitle: 'Ingest: 683M lines · +81% WoW · top driver: espresso pods',
    destinations: ['slack:#cost-watch', 'notion:Cost Reports'],
    instruction: 'Summarize Datadog ingest volume by source. Flag any sources with >25% WoW growth.',
    avgDuration: '4m 18s',
    runsHistory: [],
  },
  {
    id: 'auto-3', name: 'Search-svc Health Check', icon: 'activity', accent: 'var(--c-starknet)',
    status: 'paused', schedule: 'Daily at 10:15 AM', cron: '15 10 * * *', scheduleNl: 'Every day at 10:15 AM',
    nextRun: '—', lastRun: 'last month',
    successRate: 0.74, runs7d: [0,0,0,0,0,0,0], runs30d: 0, failures30d: 0,
    lastOutputTitle: 'Last run Apr 11 · service backlog at 1.6k jobs',
    destinations: ['linear:OPS'],
    instruction: 'Check search-svc queue depth and failed jobs over last 24h.',
    avgDuration: '2m 4s',
    runsHistory: [],
  },
  {
    id: 'auto-4', name: 'edge-gateway check', icon: 'activity', accent: 'var(--c-og)',
    status: 'paused', schedule: 'Every hour at :30', cron: '30 * * * *', scheduleNl: 'Hourly at :30',
    nextRun: '—', lastRun: 'last month',
    successRate: 0.88, runs7d: [0,0,0,0,0,0,0], runs30d: 0, failures30d: 0,
    lastOutputTitle: 'Paused · low value, runs were too noisy',
    destinations: ['in-app'],
    instruction: 'Check edge-gateway status and uptime.',
    avgDuration: '1m 12s',
    runsHistory: [],
  },
  {
    id: 'auto-5', name: 'media-cdn Capacity Tracking', icon: 'activity', accent: 'var(--c-solana)',
    status: 'paused', schedule: 'Daily at 12:00 AM', cron: '0 0 * * *', scheduleNl: 'Every day at midnight',
    nextRun: '—', lastRun: 'last month',
    successRate: 0.82, runs7d: [0,0,0,0,0,0,0], runs30d: 0, failures30d: 0,
    lastOutputTitle: 'Paused · tracking moved to Performance dashboard',
    destinations: ['in-app'],
    instruction: 'Track media-cdn cache hit rate and flag any drop >5%.',
    avgDuration: '3m 0s',
    runsHistory: [],
  },
];

/* AI suggested automations — inferred from user activity */
const AUTO_SUGGESTIONS = [
  {
    id: 'sug-1',
    title: 'Search 404 watcher',
    why: "You've asked Claude about Search 404s 6× this week. Auto-detect & post to #ops.",
    schedule: 'Every 15 min · or on alert',
    confidence: 0.94,
    source: 'chat patterns',
    destinations: ['slack:#ops', 'incidents'],
  },
  {
    id: 'sug-2',
    title: 'Pre-deploy health gate',
    why: 'Detected 3 deploys this week without checking metrics first. Block deploy if p95 > 300ms.',
    schedule: 'Triggered by GitHub deploy webhook',
    confidence: 0.88,
    source: 'deploy log',
    destinations: ['slack:#deploys', 'github:checks'],
  },
  {
    id: 'sug-3',
    title: 'Weekly cost spike digest',
    why: 'Datadog cost +24% MoM. Weekly digest of top 5 ingest drivers + actions taken.',
    schedule: 'Mondays at 9:00 AM',
    confidence: 0.81,
    source: 'cost trend',
    destinations: ['notion:Cost Reports', 'slack:#finops'],
  },
  {
    id: 'sug-4',
    title: 'On-call handover doc',
    why: 'Both engineers manually wrote handovers last 5 shifts. Auto-generate from incidents + alerts + Linear.',
    schedule: 'Daily at 6:00 PM',
    confidence: 0.92,
    source: 'chat patterns',
    destinations: ['notion:Runbooks', 'slack DM'],
  },
];

/* Failure clusters — grouped errors across all automations */
const FAILURE_CLUSTERS = [
  { id: 'fc-1', err: 'Server restarted during execution',     count: 4,  span: 'Apr 24 – Apr 26', autos: ['Daily Infrastructure Briefing'], lastSeen: '3d ago', cause: 'inferred',   suggestion: 'Add retry-on-restart' },
  { id: 'fc-2', err: 'ValueError: Workspace 81…f4… not found', count: 1,  span: 'Apr 24',          autos: ['Daily Infrastructure Briefing'], lastSeen: '5d ago', cause: 'config',     suggestion: 'Workspace was deleted — update config' },
  { id: 'fc-3', err: 'Datadog API rate limit (429)',           count: 2,  span: 'Apr 22 – Apr 23', autos: ['Daily Datadog Log Ingestion Report'], lastSeen: '6d ago', cause: 'transient', suggestion: 'Already auto-retried · no action' },
];
const LINEAR_TICKETS = [
  { id: 'OPS-412', title: 'Investigate payments-api outage — restart pods', status: 'In Progress', priority: 'Urgent', assignee: 'a.kim',   chain: 'monad',    updated: '12m ago',  estimate: 3, project: 'Incident response' },
  { id: 'OPS-411', title: 'Right-size ingest-worker hosts (cost optimization)', status: 'Todo',       priority: 'High',   assignee: 'm.patel', chain: 'starknet', updated: '1h ago',   estimate: 2, project: 'Cost optimization' },
  { id: 'OPS-409', title: 'Search upstream 404 root cause analysis',           status: 'In Review',  priority: 'High',   assignee: 'j.lee',   chain: 'solana',   updated: '2h ago',   estimate: 5, project: 'Incident response' },
  { id: 'OPS-408', title: 'Drop debug log volume from log-pipeline pods',             status: 'In Progress', priority: 'Medium', assignee: 'm.patel', chain: 'espresso', updated: '4h ago',   estimate: 1, project: 'Cost optimization' },
  { id: 'OPS-407', title: 'Add p99 latency SLO + alerting for Core API',           status: 'Todo',       priority: 'Medium', assignee: 'a.kim',   chain: 'eth',      updated: 'yesterday', estimate: 3, project: 'Observability' },
  { id: 'OPS-405', title: 'Edge Gateway capacity planning — RPS up 282% WoW',           status: 'Todo',       priority: 'High',   assignee: 'j.lee',   chain: 'somnia',   updated: 'yesterday', estimate: 5, project: 'Capacity' },
  { id: 'OPS-404', title: 'Datadog ingest budget alerts (per-service caps)',        status: 'Backlog',    priority: 'Medium', assignee: null,      chain: null,        updated: '3d ago',   estimate: 2, project: 'Cost optimization' },
  { id: 'OPS-401', title: 'Document monad runbook · halt recovery procedure',     status: 'Done',       priority: 'Low',    assignee: 'a.kim',   chain: 'monad',    updated: '5d ago',   estimate: 1, project: 'Runbooks' },
];
const INCIDENTS = [
  { id: 'INC-2419', title: 'Payments outage — quorum lost', sev: 'SEV-1', status: 'investigating', chain: 'monad', opened: '00:48 UTC',  by: 'a.kim',  attached: 12, mttr: null },
  { id: 'INC-2418', title: 'Search upstream 404 errors', sev: 'SEV-2', status: 'mitigating',    chain: 'solana', opened: '08:22 UTC',  by: 'j.lee',  attached: 8,  mttr: null },
  { id: 'INC-2417', title: 'Datadog ingest cost drift on log-pipeline pods', sev: 'SEV-3', status: 'monitoring', chain: 'espresso', opened: '3d ago', by: 'm.patel', attached: 4, mttr: null },
  { id: 'INC-2416', title: 'Ingest worker disk pressure',  sev: 'SEV-3', status: 'resolved',  chain: 'starknet', opened: '5d ago', by: 'argo-bot', attached: 2, mttr: '1h 24m' },
  { id: 'INC-2415', title: 'Core API replica desync — 7 rows',  sev: 'SEV-2', status: 'resolved',  chain: 'eth',      opened: '6d ago', by: 'a.kim',  attached: 6,  mttr: '24m' },
  { id: 'INC-2414', title: 'Media CDN CPU saturation us-west-2',   sev: 'SEV-2', status: 'resolved',  chain: 'base',     opened: '8d ago', by: 'j.lee',  attached: 5,  mttr: '52m' },
];

const PREDICT = [
  { id: 'p1', chain: 'solana',   risk: 0.78, eta: '~6h',  conf: 0.84, why: 'p95 latency trending up + memory pressure on relay pods' },
  { id: 'p2', chain: 'espresso', risk: 0.61, eta: '~24h', conf: 0.71, why: 'DNS resolution flaps · 3 in 24h' },
  { id: 'p3', chain: 'starknet', risk: 0.34, eta: '~3d',  conf: 0.58, why: 'Disk usage 71% on indexer-2' },
  { id: 'p4', chain: 'eth',      risk: 0.18, eta: '~7d',  conf: 0.42, why: 'No active signals — normal range' },
];

const COSTS_BY_CHAIN = [
  { chain: 'eth',      m: 7240, prev: 7068 },
  { chain: 'solana',   m: 6940, prev: 5851 },
  { chain: 'base',     m: 5410, prev: 5366 },
  { chain: 'og',       m: 4820, prev: 4762 },
  { chain: 'somnia',   m: 3210, prev: 2962 },
  { chain: 'starknet', m: 2980, prev: 3043 },
  { chain: 'monad',    m: 1620, prev: 1556 },
  { chain: 'espresso', m: 880,  prev: 944  },
];

const DEPLOYMENTS = [
  { id: 'e2bad5b6-1', service: 'media-cdn-prd-eu-west-1-edge-nodes', region: 'eu-west-1', sha: 'e2bad5b6', source: 'ArgoCD', status: 'success',  ago: '20m', chain: 'base',     by: 'argo-bot', diff: '+12 −3' },
  { id: 'e2bad5b6-2', service: 'media-cdn-prd-us-west-2-edge-nodes', region: 'us-west-2', sha: 'e2bad5b6', source: 'ArgoCD', status: 'success',  ago: '1h',  chain: 'base',     by: 'argo-bot', diff: '+12 −3' },
  { id: 'e2bad5b6-3', service: 'core-api-prd-eu-west-1',            region: 'eu-west-1', sha: 'e2bad5b6', source: 'ArgoCD', status: 'rolling',  ago: '2h',  chain: 'eth',      by: 'argo-bot', diff: '+8 −1' },
  { id: 'e2bad5b6-4', service: 'search-svc-prd-us-west-2',           region: 'us-west-2', sha: 'e2bad5b6', source: 'ArgoCD', status: 'success',  ago: '3h',  chain: 'base',     by: 'argo-bot', diff: '+8 −1' },
  { id: 'h2c19f1-5',  service: 'search-svc-prd-relay-worker',           region: 'us-west-2', sha: 'h2c19f1', source: 'ArgoCD', status: 'failed',   ago: '4h',  chain: 'solana',   by: 'a.kim',    diff: '+44 −19' },
  { id: 'k7d932c-6',  service: 'payments-api-prd-us-west-2-2',                region: 'us-west-2', sha: 'k7d932c', source: 'manual',  status: 'rolled-back', ago: '5h', chain: 'monad', by: 'j.lee',  diff: '−' },
  { id: 'e2bad5b6-7', service: 'core-api-prd-eu-central-2',  region: 'eu-central-2', sha: 'e2bad5b6', source: 'ArgoCD', status: 'success', ago: '6h', chain: 'eth',  by: 'argo-bot', diff: '+8 −1' },
  { id: 'e2bad5b6-8', service: 'core-api-archive-prd-eu-central-2', region: 'eu-central-2', sha: 'e2bad5b6', source: 'ArgoCD', status: 'success', ago: '7h', chain: 'eth', by: 'argo-bot', diff: '+8 −1' },
];

/* API Traffic — weekly stacked + top movers (4 weeks ending 2026-04-24) */
const RPC_TRAFFIC = {
  weeks: ['2026-04-03', '2026-04-10', '2026-04-17', '2026-04-24'],
  totalLatest: 2.4e9,
  totalWow: '-0.6%',
  // Weekly request volume per service across 4 weeks (in millions)
  byChain: [
    { id: 'auth-svc',        weekly: [528, 522, 510, 461.1], wow: -12.6 },
    { id: 'core-api',        weekly: [468, 462, 467, 455.4], wow: -2.6  },
    { id: 'checkout-svc',    weekly: [78,  92,  108, 149.8], wow: +60.5 },
    { id: 'media-cdn',       weekly: [96, 105, 114, 124.0],  wow: +8.5  },
    { id: 'recommendations', weekly: [60,  68,  74,  93.3],  wow: +25.0 },
    { id: 'inventory-svc',   weekly: [105, 100, 101, 88.0],  wow: -13.0 },
    { id: 'notifications',   weekly: [88,  90,  91,  85.4],  wow: -6.6  },
    { id: 'profile-svc',     weekly: [85,  84,  86,  82.2],  wow: -4.0  },
    { id: 'pricing-svc',     weekly: [70,  72,  73,  78.2],  wow: +7.7  },
    { id: 'analytics-api',   weekly: [38,  44,  56,  72.3],  wow: +94.3 },
  ],
  // Top movers by week-over-week change
  topMovers: [
    { id: 'reporting-svc',   delta: +43.1 },
    { id: 'checkout-svc',    delta: +60.5 },
    { id: 'legacy-export',   delta: -61.6 },
    { id: 'feature-flags',   delta: +71.9 },
    { id: 'batch-jobs',      delta: -79.7 },
    { id: 'analytics-api',   delta: +94.3 },
    { id: 'sync-worker',     delta: -99.2 },
    { id: 'staging-mirror',  delta: -100.0 },
    { id: 'edge-gateway',    delta: +249.7 },
    { id: 'search-svc',      delta: +406.8 },
  ],
};

/* Workspaces */
const WORKSPACES = [
  { id: 'flash',   name: 'Flash',     desc: 'Flash mode conversations · ad-hoc questions, scratchpad', chain: null,        owner: 'You',        members: 1, convos: 38, updated: 'May 5',  pinned: true,  activity: [4,6,5,8,7,9,12,14,11,10,13,15,12,11,9,12,14,16,18,20,17,19,21,24], badge: 'flash' },
  { id: 'mainops', name: 'Main Ops',  desc: 'Infrastructure ops · service monitoring, K8s health, cost analysis, incidents', chain: null,        owner: 'You',        members: 6, convos: 142,updated: 'May 5',  pinned: true,  activity: [12,15,18,16,14,11,13,17,19,22,18,16,15,14,12,16,19,22,24,21,18,17,19,22] },
  { id: 'cost',    name: 'cost',      desc: 'Cost optimization sweeps and Datadog ingest analysis',  chain: null,        owner: 'sara@',     members: 3, convos: 27, updated: 'May 5',  pinned: false, activity: [3,4,5,4,6,7,8,7,9,10,8,7,9,11,10,12,11,13,15,14,12,11,13,15] },
  { id: 'tac',     name: 'Tac',       desc: 'Tac service monitoring',                 chain: 'eth',       owner: 'priya@',    members: 4, convos: 89, updated: 'May 1',  pinned: false, activity: [8,7,9,10,8,11,9,10,12,11,9,10,12,13,11,12,10,11,13,12,10,11,9,10] },
  { id: 'espresso',name: 'edge-gateway', desc: 'Edge gateway + ingress health',                    chain: 'espresso',  owner: 'jordan@',   members: 2, convos: 41, updated: 'Apr 30', pinned: false, activity: [5,4,6,5,7,6,8,7,9,8,6,5,7,6,8,7,5,6,4,5,3,4,2,3] },
  { id: 'TAC',     name: 'TAC',       desc: 'TAC service monitoring',                 chain: 'starknet',  owner: 'priya@',    members: 4, convos: 14, updated: 'Apr 27', pinned: false, activity: [2,3,2,3,4,3,2,3,4,3,2,3,2,1,2,1,2,1,2,1,1,1,0,1] },
  { id: 'solana',  name: 'search-svc', desc: 'search-svc deep-dive · latency, error budget, capacity', chain: 'solana',    owner: 'You',        members: 3, convos: 67, updated: 'Apr 30', pinned: false, activity: [6,8,7,9,11,10,12,14,13,11,10,9,11,13,15,17,14,12,10,9,11,13,12,10] },
  { id: 'somnia',  name: 'somnia',    desc: 'Edge Gateway production operations',                            chain: 'somnia',    owner: 'You',        members: 2, convos: 22, updated: 'May 1',  pinned: false, activity: [3,4,5,4,5,6,5,7,6,5,4,5,6,7,6,5,7,8,7,6,5,7,8,7] },
  { id: 'starknet',name: 'Ingest',  desc: 'Ingest service monitoring',            chain: 'starknet',  owner: 'jordan@',   members: 5, convos: 53, updated: 'Apr 26', pinned: false, activity: [4,5,6,5,7,6,8,7,5,6,4,5,6,7,5,6,4,5,3,4,2,3,1,2] },
  { id: 'og',      name: 'Auth Service', desc: 'Auth Service operations workspace',                        chain: 'og',        owner: 'sara@',     members: 2, convos: 31, updated: 'Apr 28', pinned: false, activity: [3,4,3,5,4,6,5,7,8,6,5,7,6,8,7,5,6,4,5,3,4,2,3,1] },
  { id: 'base-rpc',name: 'Media CDN',  desc: 'Media CDN capacity planning',                   chain: 'base',      owner: 'priya@',    members: 3, convos: 19, updated: 'Apr 24', pinned: false, activity: [2,3,4,3,5,4,6,5,7,6,4,5,3,4,2,3,1,2,3,2,1,2,1,2] },
  { id: 'monad-incident', name: 'Payments halt postmortem', desc: 'Apr 29 outage · root cause + recovery plan', chain: 'monad', owner: 'You', members: 5, convos: 56, updated: 'Apr 29', pinned: true, activity: [0,0,0,2,4,8,12,18,24,28,32,30,26,22,18,15,12,10,9,8,7,6,5,4], badge: 'incident' },
];

/* Settings */
const MCP_SERVERS = [
  { id: 'datadog',   name: 'Datadog',     category: 'Observability', desc: 'Metrics, logs, APM',                    url: 'https://api.datadoghq.com/mcp',     enabled: true,  status: 'ok',   lastCheck: '2m ago',  reqs24h: 12840, builtin: true,  scopes: ['metrics:read','logs:read','events:write'] },
  { id: 'metabase',  name: 'Metabase',    category: 'Observability', desc: 'BI dashboards & SQL questions',         url: 'https://metabase.wardn.io/mcp', enabled: true,  status: 'ok',   lastCheck: '4m ago',  reqs24h: 421,   builtin: true,  scopes: ['dashboards:read','cards:read'] },
  { id: 'pagerduty', name: 'PagerDuty',   category: 'Observability', desc: 'On-call schedules & incidents',         url: 'https://api.pagerduty.com/mcp',     enabled: true,  status: 'ok',   lastCheck: '1m ago',  reqs24h: 89,    builtin: true,  scopes: ['incidents:read','schedules:read'] },
  { id: 'k8s',       name: 'Kubernetes',  category: 'Infrastructure',desc: 'Cluster state, pods, deployments',      url: 'kubectl-mcp://prod-cluster',         enabled: true,  status: 'ok',   lastCheck: '30s ago', reqs24h: 6204,  builtin: true,  scopes: ['pods:read','deployments:read','events:read'] },
  { id: 'argo',      name: 'ArgoCD',      category: 'Infrastructure',desc: 'GitOps deployment state',                url: 'https://argocd.wardn.io/mcp',    enabled: true,  status: 'warn', lastCheck: '12m ago', reqs24h: 314,   builtin: true,  scopes: ['apps:read','sync:write'] },
  { id: 'aws',       name: 'AWS',         category: 'Infrastructure',desc: 'EC2, S3, CloudWatch, EKS',               url: 'aws-mcp://us-east-1',                enabled: true,  status: 'ok',   lastCheck: '3m ago',  reqs24h: 1980,  builtin: true,  scopes: ['ec2:read','cloudwatch:read'] },
  { id: 'eth',       name: 'Core API',    category: 'Services',      desc: 'Internal service mesh metrics & traces',  url: 'core-api-mcp://infra.wardn.io',     enabled: true,  status: 'ok',   lastCheck: '1m ago',  reqs24h: 8210,  builtin: true,  scopes: ['metrics:read','traces:read'] },
  { id: 'solana',    name: 'Search',      category: 'Services',      desc: 'Search cluster metrics & health',        url: 'search-mcp://infra.wardn.io',       enabled: true,  status: 'bad',  lastCheck: '14m ago', reqs24h: 4280,  builtin: true,  scopes: ['metrics:read'] },
  { id: 'linear',    name: 'Linear',      category: 'Workflow',      desc: 'Issues, sprints, projects',              url: 'https://api.linear.app/mcp',         enabled: true,  status: 'ok',   lastCheck: '2m ago',  reqs24h: 64,    builtin: true,  scopes: ['issues:rw','projects:read'] },
  { id: 'slack',     name: 'Slack',       category: 'Workflow',      desc: 'Channel messages, alerts',                url: 'https://slack.com/api/mcp',         enabled: true,  status: 'ok',   lastCheck: '30s ago', reqs24h: 2104,  builtin: true,  scopes: ['chat:write','channels:read'] },
  { id: 'notion',    name: 'Notion',      category: 'Workflow',      desc: 'Runbooks, postmortems',                   url: 'https://api.notion.com/mcp',        enabled: false, status: 'off',  lastCheck: '—',       reqs24h: 0,     builtin: true,  scopes: ['pages:rw'] },
  { id: 'github',    name: 'GitHub',      category: 'Workflow',      desc: 'Repos, PRs, deploy SHAs',                 url: 'https://api.github.com/mcp',        enabled: true,  status: 'ok',   lastCheck: '1m ago',  reqs24h: 318,   builtin: true,  scopes: ['repos:read','pulls:read'] },
  { id: 'custom-fp', name: 'Stripe',      category: 'Custom',        desc: 'Billing & revenue events',                url: 'https://api.stripe.com/mcp',        enabled: true,  status: 'ok',   lastCheck: '6m ago',  reqs24h: 12,    builtin: false, scopes: ['charges:read','invoices:read'] },
  { id: 'custom-cb', name: 'Snowflake',    category: 'Custom',       desc: 'Data warehouse queries for cost reports', url: 'https://acct.snowflakecomputing.com/mcp', enabled: false, status: 'off',  lastCheck: '—',       reqs24h: 0,     builtin: false, scopes: ['query:read'] },
];
const NETWORK_CONFIGS = [
  { id: 'eth',      name: 'Core API',  type: 'production', cssVar:'--c-eth',      rpc: 'https://eth.wardn.io/rpc',       ws: 'wss://eth.wardn.io/ws',       indexer: 'eth-indexer.us-east-1', validators: 12, addrs: ['0xae2f...8821','0xb19c...30a4','0xc8d2...77ee'], metrics: ['Block height','Vote performance','Missed blocks','Delegation','Commission','Cost / block'], status: 'healthy' },
  { id: 'solana',   name: 'Search',    type: 'production', cssVar:'--c-solana',   rpc: 'https://sol.wardn.io/rpc',       ws: 'wss://sol.wardn.io/ws',       indexer: 'sol-indexer.us-west-2', validators: 8,  addrs: ['7xKX...M3aQ','9zPp...8nvY','4uHj...2dAR'], metrics: ['Vote credits','Skip rate','Delegation','Commission','Stake change'], status: 'degraded' },
  { id: 'base',     name: 'Media CDN',      type: 'production', cssVar:'--c-base',     rpc: 'https://base.wardn.io/rpc',      ws: 'wss://base.wardn.io/ws',      indexer: 'base-indexer.us-east-1',validators: 4, addrs: ['0x441f...adb2'], metrics: ['Block height','RPS','p95 latency'], status: 'healthy' },
  { id: 'starknet', name: 'Ingest',  type: 'production', cssVar:'--c-starknet', rpc: 'https://stark.wardn.io/rpc',     ws: 'wss://stark.wardn.io/ws',     indexer: 'stark-indexer.us-east-1',validators: 6, addrs: ['0x05ab...44c1','0x0f12...8a37'], metrics: ['Block height','Vote performance','Missed blocks'], status: 'healthy' },
  { id: 'monad',    name: 'Payments',     type: 'production', cssVar:'--c-monad',    rpc: 'https://monad.wardn.io/rpc',     ws: 'wss://monad.wardn.io/ws',     indexer: 'monad-indexer.us-east-1',validators: 5, addrs: ['0x2a7f...991e','0xee01...4421'], metrics: ['Block height','Vote performance','Quorum'], status: 'down' },
  { id: 'somnia',   name: 'Edge Gateway',    type: 'production', cssVar:'--c-somnia',   rpc: 'https://somnia.wardn.io/rpc',    ws: 'wss://somnia.wardn.io/ws',    indexer: 'somnia-indexer.us-east-1',validators: 3, addrs: ['0xab12...dd99'], metrics: ['Block height','RPS'], status: 'healthy' },
  { id: 'og',       name: 'Auth Service',  type: 'production', cssVar:'--c-og',       rpc: 'https://og.wardn.io/rpc',        ws: 'wss://og.wardn.io/ws',        indexer: 'og-indexer.us-east-1',validators: 2,    addrs: ['0x7711...0fe3'], metrics: ['Block height','Vote performance'], status: 'healthy' },
  { id: 'espresso', name: 'Log Pipeline',  type: 'staging', cssVar:'--c-espresso', rpc: 'https://espresso.wardn.io/rpc',  ws: 'wss://espresso.wardn.io/ws',  indexer: 'esp-indexer.us-east-1',validators: 4,  addrs: ['0xff1a...92dd','0x32cc...887e'], metrics: ['Block height','Sequencer health','Missed blocks'], status: 'degraded' },
];

/* Models */
const MODEL_OPTIONS = [
  'claude-sonnet-4-6-oauth',
  'claude-haiku-4-5-oauth',
  'claude-opus-4-6-oauth',
  'claude-opus-4-6-oauth-1m',
  'gpt-5-codex',
  'gpt-5-thinking',
  'qwen2.5:7b',
  'deepseek-r1:70b',
];
const MODELS_CFG = {
  primary: 'claude-sonnet-4-6-oauth',
  flash:   'claude-haiku-4-5-oauth',
  quick: ['claude-sonnet-4-6-oauth','claude-haiku-4-5-oauth','claude-opus-4-6-oauth-1m','claude-opus-4-6-oauth','qwen2.5:7b'],
  accounts: [
    { id: 'codex',  name: 'ChatGPT Codex', desc: 'Use Codex models with your ChatGPT subscription', status: 'disconnected' },
    { id: 'claude', name: 'Claude Code',   desc: 'Connected · refreshes in 18d',                    status: 'connected'    },
    { id: 'aws-br', name: 'AWS Bedrock',   desc: 'Use Anthropic models via your AWS account',       status: 'disconnected' },
    { id: 'azure',  name: 'Azure OpenAI',  desc: 'OpenAI models hosted on Azure',                   status: 'disconnected' },
  ],
};

/* Skills */
const SKILLS = [
  { id: 'automate',     name: 'Automation',        slug: 'automate',     desc: 'Auto-remediate common alert patterns when high-confidence', tags: ['runbook','alerts'], updated: '2d' },
  { id: 'cost',         name: 'Cost Analysis',     slug: 'cost',         desc: 'Per-service cost breakdown, anomaly detection, forecasting',   tags: ['cost','forecast'], updated: '5h' },
  { id: 'handover',     name: 'Incident Handover', slug: 'handover',     desc: 'Generate a clean handover doc when on-call rotates',         tags: ['oncall','docs'], updated: '1w' },
  { id: 'investigate',  name: 'Investigate',       slug: 'investigate',  desc: 'Multi-source root-cause workflow across logs, metrics, traces', tags: ['rca','triage'], updated: '3d' },
  { id: 'k8s',          name: 'K8S Incident',      slug: 'k8s',          desc: 'Kubernetes-specific runbook for pod & cluster issues',       tags: ['k8s','runbook'], updated: '6d' },
  { id: 'morning',      name: 'Morning Briefing',  slug: 'morning',      desc: 'Compose the daily 9am briefing with overnight changes',     tags: ['briefing'], updated: '1d' },
  { id: 'health',       name: 'Service Health',    slug: 'health',       desc: 'Per-service health snapshot with sparklines and SLO state',    tags: ['health'], updated: '4d' },
  { id: 'rca',          name: 'Rca',               slug: 'rca',          desc: 'Root cause analysis writeup template',                       tags: ['rca','postmortem'], updated: '2w' },
  { id: 'traffic',      name: 'Traffic Analysis',  slug: 'traffic',      desc: 'API traffic shape, top callers, p95 by region',              tags: ['rpc','traffic'], updated: '8h' },
  { id: 'service',      name: 'Service Deep Dive',  slug: 'service',    desc: 'Deep performance look at a single service',                  tags: ['services'], updated: '2d' },
  { id: 'weekly',       name: 'Weekly Summary',    slug: 'weekly',       desc: 'Weekly ops summary across all services',                     tags: ['briefing'], updated: '6d' },
];
const SKILL_DETAIL_SAMPLE = `# Investigate

When the user reports an alert or anomaly, run a structured investigation.

## Steps

1. Pull the last 30m of metrics for the affected service from \`@datadog\`.
2. Fetch the matching log window from \`@datadog/logs\`, filtered by error level.
3. Cross-reference recent deploys via \`@argo\` and \`@github\`.
4. Compare against the same hour last week — call out delta.
5. Propose 1–3 hypotheses, ranked by confidence, with disconfirming evidence.

## Output

A single Markdown report with:
- TL;DR (one sentence)
- Hypotheses (ranked)
- Suggested next checks
- A draft Slack update for #ops`;

/* Profile */
const PROFILE = {
  email: 'adam@wardn.io',
  name: 'Adam Pearson',
  timezone: 'GMT (Europe/London)',
  voiceInput: true,
  theme: 'light',
  logVerbosity: 'info',
};

/* Workspace networks (denser table view, distinct from NETWORK_CONFIGS sub-tab) */
const WS_NETWORKS = [
  { id: 'espresso', name: 'Log Pipeline', kind: 'grpc',    url: 'https://logs.wardn.io/ingest',      addrs: 2, enabled: true,  status: 'degraded' },
  { id: 'monad',    name: 'Payments',    kind: 'rest',    url: 'https://payments.wardn.io/api',     addrs: 1, enabled: true,  status: 'down'     },
  { id: 'solana',   name: 'Search',   kind: 'grpc',    url: 'https://search.wardn.io/api',       addrs: 1, enabled: true,  status: 'degraded' },
  { id: 'somnia',   name: 'Edge Gateway',   kind: 'rest',    url: 'https://edge.wardn.io/api',         addrs: 1, enabled: true,  status: 'healthy'  },
  { id: 'starknet', name: 'Ingest', kind: 'grpc',    url: 'https://ingest.wardn.io/api',       addrs: 1, enabled: true,  status: 'healthy'  },
  { id: 'tac',      name: 'Tasks',      kind: 'rest',    url: 'https://tasks.wardn.io/api',        addrs: 1, enabled: false, status: 'off'      },
  { id: 'eth',      name: 'Core API', kind: 'rest',    url: 'https://core.wardn.io/api',         addrs: 12,enabled: true,  status: 'healthy'  },
  { id: 'base',     name: 'Media CDN',     kind: 'rest',    url: 'https://cdn.wardn.io/api',          addrs: 4, enabled: true,  status: 'healthy'  },
  { id: 'og',       name: 'Auth Service', kind: 'rest',    url: 'https://auth.wardn.io/api',         addrs: 2, enabled: true,  status: 'healthy'  },
];
/* Tool catalogs — what types of integrations a workspace can pick from */
const TICKETING_TOOLS = [
  { id: 'linear',  name: 'Linear',        connected: true,  color: '#5e6ad2',
    fields: [
      { key: 'teamId',     label: 'Team ID',     placeholder: 'xxxxxxxx-xxxx-…',    mono: true,  half: true },
      { key: 'teamName',   label: 'Team',        placeholder: 'Engineering',         half: true },
      { key: 'projectId',  label: 'Project ID',  placeholder: 'xxxxxxxx-xxxx-…',     mono: true,  half: true },
      { key: 'projectName',label: 'Project',     placeholder: 'Infrastructure',      half: true },
      { key: 'assignee',   label: 'Default assignee', placeholder: 'adam@wardn.io', half: true },
      { key: 'priority',   label: 'Default priority', type: 'select', options: ['No priority','Urgent','High','Medium','Low'], half: true },
    ] },
  { id: 'jira',    name: 'Jira',          connected: true,  color: '#0052cc',
    fields: [
      { key: 'project',    label: 'Project key',   placeholder: 'OPS',                 mono: true,  half: true },
      { key: 'issueType',  label: 'Issue type',    type: 'select', options: ['Task','Bug','Story','Incident'], half: true },
      { key: 'assignee',   label: 'Default assignee', placeholder: 'adam@wardn.io', half: true },
      { key: 'priority',   label: 'Default priority', type: 'select', options: ['Medium','Highest','High','Low','Lowest'], half: true },
      { key: 'labels',     label: 'Default labels (comma-separated)', placeholder: 'ops, incident' },
    ] },
  { id: 'github',  name: 'GitHub Issues', connected: false, color: '#24292f',
    fields: [
      { key: 'repo',       label: 'Repository',  placeholder: 'wardn/infrastructure', mono: true },
      { key: 'labels',     label: 'Default labels', placeholder: 'ops, on-call' },
      { key: 'assignees',  label: 'Default assignees', placeholder: '@adam, @sarah' },
    ] },
  { id: 'asana',   name: 'Asana',         connected: false, color: '#f06a6a',
    fields: [
      { key: 'workspace',  label: 'Workspace ID',  placeholder: 'xxxxxxxx',  mono: true,  half: true },
      { key: 'project',    label: 'Project',       placeholder: 'Ops board', half: true },
    ] },
];

const DOCS_TOOLS = [
  { id: 'confluence', name: 'Confluence',  connected: true,  color: '#172b4d',
    fields: [
      { key: 'space',    label: 'Space key',   placeholder: 'OPS',                 mono: true,  half: true },
      { key: 'parent',   label: 'Parent page', placeholder: 'Runbooks',            half: true },
      { key: 'template', label: 'Page template', type: 'select', options: ['Post-mortem','Runbook','Weekly summary','Blank'], half: true },
      { key: 'labels',   label: 'Default labels', placeholder: 'ops, on-call',     half: true },
    ] },
  { id: 'notion',     name: 'Notion',       connected: true,  color: '#000000',
    fields: [
      { key: 'database', label: 'Database ID', placeholder: 'xxxxxxxx-xxxx-…',     mono: true },
      { key: 'template', label: 'Default template', placeholder: 'Post-mortem v2', half: true },
      { key: 'tag',      label: 'Default tag',      placeholder: 'ops',            half: true },
    ] },
  { id: 'gdocs',      name: 'Google Docs',  connected: true,  color: '#1a73e8',
    fields: [
      { key: 'folder',   label: 'Folder ID',   placeholder: '1A2B3C…',             mono: true,  half: true },
      { key: 'template', label: 'Template doc ID', placeholder: '1Z9Y8X…',         mono: true,  half: true },
      { key: 'share',    label: 'Share with',  placeholder: 'ops@wardn.io' },
    ] },
  { id: 'ghwiki',     name: 'GitHub Wiki',  connected: false, color: '#24292f',
    fields: [
      { key: 'repo',     label: 'Repository',  placeholder: 'wardn/runbooks',   mono: true },
      { key: 'section',  label: 'Section',     placeholder: 'Post-mortems',        half: true },
    ] },
];

const COMMS_TOOLS = [
  { id: 'slack',     name: 'Slack',           connected: true,  color: '#4a154b',
    channelLabel: 'channels',
    fields: { id: 'Channel ID', name: 'Name', purpose: 'Purpose (optional)' },
    placeholders: { id: 'C0XXXXXXXXX or U0XXXXXXXXX', name: '#incidents', purpose: 'Incident alerts' } },
  { id: 'teams',     name: 'Microsoft Teams', connected: false, color: '#4b53bc',
    channelLabel: 'channels',
    fields: { id: 'Webhook URL', name: 'Channel name', purpose: 'Purpose (optional)' },
    placeholders: { id: 'https://outlook.office.com/webhook/…', name: 'Engineering', purpose: 'On-call notifications' } },
  { id: 'discord',   name: 'Discord',         connected: false, color: '#5865f2',
    channelLabel: 'channels',
    fields: { id: 'Channel ID', name: 'Channel name', purpose: 'Purpose (optional)' },
    placeholders: { id: '12345678…', name: '#alerts', purpose: 'Real-time alerts' } },
  { id: 'pagerduty', name: 'PagerDuty',       connected: true,  color: '#06ac38',
    channelLabel: 'services',
    fields: { id: 'Service key', name: 'Service name', purpose: 'Escalation policy' },
    placeholders: { id: 'PXXXXXXX', name: 'Infra on-call', purpose: 'P1 incidents' } },
  { id: 'email',     name: 'Email',           connected: true,  color: '#6b7280',
    channelLabel: 'recipients',
    fields: { id: 'Email', name: 'Display name', purpose: 'Purpose (optional)' },
    placeholders: { id: 'oncall@wardn.io', name: 'On-call', purpose: 'Daily digest' } },
];

/* Ops Workspaces — actual workspaces users set up, each with their own tool picks */
const OPS_WORKSPACES = [
  {
    id: 'cost',
    name: 'cost',
    desc: 'Cost & spend reviews — weekly Datadog ingest audits',
    automations: 1,
    ticketing: {
      tool: 'linear',
      values: { teamId: 'eng-2f4a-9c8d', teamName: 'Engineering', projectId: 'infra-7b2e-1c4d', projectName: 'Infrastructure', assignee: 'adam@wardn.io', priority: 'No priority' },
    },
    docs: [
      { tool: 'confluence', values: { space: 'FINOPS', parent: 'Weekly cost reviews', template: 'Weekly summary', labels: 'finops, cost' } },
      { tool: 'gdocs',      values: { folder: 'Drive › Finance › FinOps', template: 'Monthly cost report', sharing: 'Finance team — comment' } },
    ],
    comms: [
      { tool: 'slack', channels: [
        { id: 'C09K4JP2T', name: '#cost-reviews', purpose: 'Weekly cost digest' },
        { id: 'C0AB12N3M', name: '#finops',       purpose: 'Budget alerts' },
      ] },
    ],
  },
  {
    id: 'incidents',
    name: 'incidents',
    desc: 'P1/P2 incident handovers and post-mortems',
    automations: 3,
    ticketing: {
      tool: 'jira',
      values: { project: 'INC', issueType: 'Incident', assignee: 'oncall@wardn.io', priority: 'Highest', labels: 'incident, ops' },
    },
    docs: [
      { tool: 'notion',     values: { database: '8a3f-2b1c-4d5e', template: 'Post-mortem v2', tag: 'incident' } },
      { tool: 'confluence', values: { space: 'SRE', parent: 'Incident archive', template: 'Public summary', labels: 'incident, post-mortem' } },
    ],
    comms: [
      { tool: 'slack', channels: [
        { id: 'C04INC1D2', name: '#incidents',     purpose: 'Active incidents' },
        { id: 'C04PMRTM3', name: '#post-mortems',  purpose: 'Retros & follow-ups' },
        { id: 'C05ESCAL4', name: '#escalations',   purpose: 'Page escalations' },
      ] },
      { tool: 'pagerduty', channels: [
        { id: 'P5W2VNK', name: 'Infra on-call', purpose: 'P1 incidents' },
      ] },
    ],
  },
  {
    id: 'rpc-platform',
    name: 'api-platform',
    desc: 'Public API capacity, rate limits, regional rollouts',
    automations: 2,
    ticketing: null,
    docs: [],
    comms: [
      { tool: 'slack', channels: [
        { id: 'C03RPC123', name: '#api-platform', purpose: 'Team channel' },
      ] },
    ],
  },
];

const WS_OPS_TEAMS = [
  { id: 'sre',     name: 'SRE',          members: 8,  desc: 'Reliability, on-call, incident response' },
  { id: 'rpc',     name: 'API platform', members: 5,  desc: 'Public API capacity & rate limits' },
  { id: 'staking', name: 'Platform',     members: 4,  desc: 'Core platform services' },
  { id: 'bizops',  name: 'BizOps',       members: 3,  desc: 'Customer success & cost reporting' },
];
const WS_CUSTOMERS = [
  { id: 'cust-1', name: 'Northwind Systems',  tier: 'Enterprise', mau: '2.4M', spend: '$48k/mo', sla: '99.95%' },
  { id: 'cust-2', name: 'Brightlayer',        tier: 'Growth',     mau: '1.1M', spend: '$22k/mo', sla: '99.9%'  },
  { id: 'cust-3', name: 'Meridian Labs',      tier: 'Enterprise', mau: '880k', spend: '$31k/mo', sla: '99.95%' },
  { id: 'cust-4', name: 'Acme Cloud',         tier: 'Enterprise', mau: '3.2M', spend: '$62k/mo', sla: '99.95%' },
  { id: 'cust-5', name: 'Fernweh Data',       tier: 'Growth',     mau: '410k', spend: '$9k/mo',  sla: '99.9%'  },
];

const DATA = { CHAINS, ANOMALIES, SLOS, PREDICT, COSTS_BY_CHAIN, DEPLOYMENTS, RPC_VOLUME, RPC_TRAFFIC, ALERTS_FEED, COST_DETAIL, INCIDENTS, LINEAR_TICKETS, AUTOMATIONS, AUTO_SUGGESTIONS, FAILURE_CLUSTERS, WORKSPACES, MCP_SERVERS, NETWORK_CONFIGS, MODEL_OPTIONS, MODELS_CFG, SKILLS, SKILL_DETAIL_SAMPLE, PROFILE, WS_NETWORKS, WS_OPS_TEAMS, WS_CUSTOMERS, TICKETING_TOOLS, DOCS_TOOLS, COMMS_TOOLS, OPS_WORKSPACES, NOW };

window.DATA = DATA;
