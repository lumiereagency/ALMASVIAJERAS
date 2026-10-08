import type { Point } from '@/lib/series';

/** Gráficos em SVG puro (sem dependências, renderizados no servidor). Paleta da marca. */
const smooth = (pts: [number, number][]) => {
  if (pts.length < 2) return '';
  let d = `M${pts[0]![0]},${pts[0]![1]}`;
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1]!;
    const [x1, y1] = pts[i]!;
    const cx = (x0 + x1) / 2;
    d += ` C${cx},${y0} ${cx},${y1} ${x1},${y1}`;
  }
  return d;
};

export function Sparkline({ data, id, w = 120, h = 40 }: { data: number[]; id: string; w?: number; h?: number }) {
  const max = Math.max(...data, 1);
  const pts = data.map((v, i): [number, number] => [(i / Math.max(data.length - 1, 1)) * w, h - 4 - (v / max) * (h - 8)]);
  const line = smooth(pts);
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h} role="img" aria-label="Tendencia" className="spark">
      <defs>
        <linearGradient id={`sg-${id}`} x1="0" x2="1">
          <stop offset="0" stopColor="#20b8f5" />
          <stop offset="0.55" stopColor="#7357f6" />
          <stop offset="1" stopColor="#eb00d7" />
        </linearGradient>
        <linearGradient id={`sf-${id}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#7357f6" stopOpacity="0.22" />
          <stop offset="1" stopColor="#7357f6" stopOpacity="0" />
        </linearGradient>
      </defs>
      {line && <path d={`${line} L${w},${h} L0,${h} Z`} fill={`url(#sf-${id})`} />}
      {line && <path d={line} fill="none" stroke={`url(#sg-${id})`} strokeWidth="2.2" strokeLinecap="round" />}
    </svg>
  );
}

export function AreaChart({ id, labels, series, height = 230 }: { id: string; labels: string[]; series: { name: string; values: number[]; color: string }[]; height?: number }) {
  const W = 640;
  const H = height;
  const pad = { l: 36, r: 12, t: 14, b: 30 };
  const max = Math.max(...series.flatMap((s) => s.values), 1);
  const nice = Math.max(Math.ceil(max / 4) * 4, 4);
  const x = (i: number) => pad.l + (i / Math.max(labels.length - 1, 1)) * (W - pad.l - pad.r);
  const y = (v: number) => pad.t + (1 - v / nice) * (H - pad.t - pad.b);
  const step = Math.max(Math.ceil(labels.length / 6), 1);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="chart" role="img" aria-label={series.map((s) => s.name).join(' y ')}>
      <defs>
        {series.map((s, k) => (
          <linearGradient key={s.name} id={`af-${id}-${k}`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor={s.color} stopOpacity="0.28" />
            <stop offset="1" stopColor={s.color} stopOpacity="0" />
          </linearGradient>
        ))}
      </defs>
      {[0, 1, 2, 3, 4].map((g) => {
        const v = (nice / 4) * g;
        return (
          <g key={g}>
            <line x1={pad.l} x2={W - pad.r} y1={y(v)} y2={y(v)} stroke="#e7e4f2" strokeDasharray={g === 0 ? undefined : '3 5'} />
            <text x={pad.l - 8} y={y(v) + 4} textAnchor="end" fontSize="11" fill="#6d7384">
              {Math.round(v)}
            </text>
          </g>
        );
      })}
      {series.map((s, k) => {
        const pts = s.values.map((v, i): [number, number] => [x(i), y(v)]);
        const d = smooth(pts);
        return (
          <g key={s.name}>
            {d && <path d={`${d} L${x(s.values.length - 1)},${y(0)} L${x(0)},${y(0)} Z`} fill={`url(#af-${id}-${k})`} />}
            {d && <path d={d} fill="none" stroke={s.color} strokeWidth="2.6" strokeLinecap="round" />}
          </g>
        );
      })}
      {labels.map((l, i) =>
        i % step === 0 ? (
          <text key={l + i} x={x(i)} y={H - 8} textAnchor="middle" fontSize="11" fill="#6d7384">
            {l}
          </text>
        ) : null,
      )}
    </svg>
  );
}

export function Bars({ data, id, height = 170, format = (n: number) => String(n) }: { data: Point[]; id: string; height?: number; format?: (n: number) => string }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  const W = 520;
  const bw = Math.min(40, (W / data.length) * 0.55);
  const last = data.length - 1;
  return (
    <svg viewBox={`0 0 ${W} ${height}`} className="chart" role="img" aria-label="Barras por periodo">
      <defs>
        <linearGradient id={`bg-${id}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#7357f6" />
          <stop offset="1" stopColor="#eb00d7" />
        </linearGradient>
      </defs>
      {data.map((d, i) => {
        const cx = (i + 0.5) * (W / data.length);
        const h = Math.max((d.value / max) * (height - 46), d.value > 0 ? 6 : 3);
        return (
          <g key={d.key}>
            <rect x={cx - bw / 2} y={height - 26 - h} width={bw} height={h} rx={bw / 2.4} fill={i === last ? `url(#bg-${id})` : '#e3dcf8'} />
            {i === last && (
              <text x={cx} y={height - 32 - h} textAnchor="middle" fontSize="11" fontWeight="600" fill="#061633">
                {format(d.value)}
              </text>
            )}
            <text x={cx} y={height - 8} textAnchor="middle" fontSize="11" fill="#6d7384">
              {d.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export function Donut({ items, center, sub }: { items: { label: string; value: number; color: string }[]; center: string; sub: string }) {
  const total = items.reduce((a, b) => a + b.value, 0);
  const r = 62;
  const c = 2 * Math.PI * r;
  let acc = 0;
  return (
    <div className="donut">
      <svg viewBox="0 0 160 160" width="160" height="160" role="img" aria-label="Distribucion">
        <circle cx="80" cy="80" r={r} fill="none" stroke="#efecf8" strokeWidth="18" />
        {total > 0 &&
          items.map((it) => {
            const len = (it.value / total) * c;
            const el = <circle key={it.label} cx="80" cy="80" r={r} fill="none" stroke={it.color} strokeWidth="18" strokeDasharray={`${Math.max(len - 3, 0)} ${c}`} strokeDashoffset={-acc} strokeLinecap="round" transform="rotate(-90 80 80)" />;
            acc += len;
            return el;
          })}
        <text x="80" y="78" textAnchor="middle" fontSize="26" fontWeight="600" fill="#061633" fontFamily="var(--font-sora)">
          {center}
        </text>
        <text x="80" y="98" textAnchor="middle" fontSize="11" fill="#6d7384">
          {sub}
        </text>
      </svg>
      <ul className="legend">
        {items.map((it) => (
          <li key={it.label}>
            <i style={{ background: it.color }} />
            <span>{it.label}</span>
            <strong>{it.value}</strong>
          </li>
        ))}
      </ul>
    </div>
  );
}
