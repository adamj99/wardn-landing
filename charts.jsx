/* Reusable chart primitives — pure SVG, react functional components */

function Sparkline({ values, color = "currentColor", height = 24, area = true, anomalyAt = -1, strokeWidth = 1.5 }) {
  if (!values || !values.length) return null;
  const w = 100;
  const h = height;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  const step = w / (values.length - 1);
  const pts = values.map((v, i) => [i * step, h - ((v - min) / range) * (h - 4) - 2]);
  const d = pts.map((p, i) => (i ? "L" : "M") + p[0].toFixed(2) + "," + p[1].toFixed(2)).join(" ");
  const dArea = d + ` L${w},${h} L0,${h} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ width: '100%', height }}>
      {area && <path d={dArea} className="line-area" style={{ '--c': color }} />}
      <path d={d} className="line-stroke" style={{ '--c': color }} strokeWidth={strokeWidth} />
      {anomalyAt >= 0 && pts[anomalyAt] && (
        <circle cx={pts[anomalyAt][0]} cy={pts[anomalyAt][1]} r="2.5" className="line-anom" />
      )}
    </svg>
  );
}

function MicroBars({ values, height = 24, posColor = 'var(--ok)', negColor = 'var(--bad)' }) {
  if (!values || !values.length) return null;
  const w = 100;
  const h = height;
  const max = Math.max(...values.map(Math.abs));
  const step = w / values.length;
  const mid = h / 2;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ width: '100%', height }}>
      {values.map((v, i) => {
        const bh = (Math.abs(v) / max) * (h / 2 - 1);
        const x = i * step + 0.5;
        const y = v >= 0 ? mid - bh : mid;
        return <rect key={i} x={x} y={y} width={step - 1} height={bh} fill={v >= 0 ? posColor : negColor} rx="0.5" />;
      })}
      <line x1="0" x2={w} y1={mid} y2={mid} stroke="var(--line)" strokeWidth="0.5" />
    </svg>
  );
}

function Donut({ value, max = 100, size = 64, thickness = 6, color = 'var(--accent)', label }) {
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  const off = c * (1 - value / max);
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size/2} cy={size/2} r={r} stroke="var(--bg-sunken)" strokeWidth={thickness} fill="none" />
      <circle cx={size/2} cy={size/2} r={r} stroke={color} strokeWidth={thickness} fill="none"
              strokeDasharray={c} strokeDashoffset={off} strokeLinecap="round"
              transform={`rotate(-90 ${size/2} ${size/2})`} />
      {label && (
        <text x="50%" y="50%" dominantBaseline="central" textAnchor="middle"
              style={{ fontFamily: 'var(--font-mono)', fontSize: size * 0.22, fill: 'var(--text)', fontWeight: 500 }}>
          {label}
        </text>
      )}
    </svg>
  );
}

function StackedBars({ rows, max, height = 80 }) {
  // rows: [{ label, segments: [{ color, value }] }]
  const w = 100;
  const h = height;
  const colW = w / rows.length;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ width: '100%', height }}>
      {rows.map((row, i) => {
        const total = row.segments.reduce((s, x) => s + x.value, 0);
        const totalH = (total / max) * (h - 4);
        let cy = h - 2;
        return (
          <g key={i}>
            {row.segments.map((seg, j) => {
              const sh = (seg.value / max) * (h - 4);
              cy -= sh;
              return <rect key={j} x={i * colW + 1.5} y={cy} width={colW - 3} height={sh} fill={seg.color} rx="0.4" />;
            })}
          </g>
        );
      })}
    </svg>
  );
}

/* Subtle multi-line chart for drill-in */
function MultiLine({ series, height = 160, labels }) {
  const w = 600;
  const h = height;
  const all = series.flatMap(s => s.values);
  const max = Math.max(...all);
  const min = 0;
  const range = max - min || 1;
  const padL = 38, padR = 8, padT = 10, padB = 22;
  const innerW = w - padL - padR;
  const innerH = h - padT - padB;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', height }}>
      {/* gridlines */}
      {[0, 0.25, 0.5, 0.75, 1].map(t => {
        const y = padT + innerH * t;
        return <line key={t} x1={padL} x2={w-padR} y1={y} y2={y} stroke="var(--line-soft)" strokeWidth="0.5" />;
      })}
      {/* y labels */}
      {[0, 0.5, 1].map(t => {
        const y = padT + innerH * t;
        const v = max - (max - min) * t;
        return (
          <text key={t} x={padL - 6} y={y + 3} textAnchor="end"
                style={{ fontFamily: 'var(--font-mono)', fontSize: 9, fill: 'var(--text-3)' }}>
            {v >= 1000 ? (v/1000).toFixed(1) + 'k' : v.toFixed(0)}
          </text>
        );
      })}
      {/* series */}
      {series.map((s, k) => {
        const step = innerW / (s.values.length - 1);
        const pts = s.values.map((v, i) => [padL + i * step, padT + innerH - ((v - min) / range) * innerH]);
        const d = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(2) + ',' + p[1].toFixed(2)).join(' ');
        return <path key={k} d={d} fill="none" stroke={s.color} strokeWidth="1.4" vectorEffect="non-scaling-stroke" />;
      })}
      {/* x labels */}
      {labels && labels.map((l, i) => (
        <text key={i} x={padL + (innerW / (labels.length - 1)) * i} y={h - 6}
              textAnchor={i === 0 ? 'start' : i === labels.length - 1 ? 'end' : 'middle'}
              style={{ fontFamily: 'var(--font-mono)', fontSize: 9, fill: 'var(--text-3)' }}>
          {l}
        </text>
      ))}
    </svg>
  );
}

Object.assign(window, { Sparkline, MicroBars, Donut, StackedBars, MultiLine });
