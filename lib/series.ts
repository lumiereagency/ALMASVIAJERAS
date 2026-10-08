/** Séries temporais simples para os gráficos do painel (agregação em memória; volume do MVP). */
export interface Point {
  key: string;
  label: string;
  value: number;
}

const dayKey = (d: Date) => d.toISOString().slice(0, 10);

export function lastDays(rows: { at: string | Date; amount?: number }[], n: number, now = new Date()): Point[] {
  const out: Point[] = [];
  const idx = new Map<string, number>();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setUTCDate(d.getUTCDate() - i);
    idx.set(dayKey(d), out.length);
    out.push({ key: dayKey(d), label: d.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', timeZone: 'UTC' }), value: 0 });
  }
  for (const r of rows) {
    const i = idx.get(dayKey(new Date(r.at)));
    if (i !== undefined) out[i]!.value += r.amount ?? 1;
  }
  return out;
}

export function lastMonths(rows: { at: string | Date; amount?: number }[], n: number, now = new Date()): Point[] {
  const out: Point[] = [];
  const idx = new Map<string, number>();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
    const key = d.toISOString().slice(0, 7);
    idx.set(key, out.length);
    out.push({ key, label: d.toLocaleDateString('es-MX', { month: 'short', timeZone: 'UTC' }), value: 0 });
  }
  for (const r of rows) {
    const i = idx.get(new Date(r.at).toISOString().slice(0, 7));
    if (i !== undefined) out[i]!.value += r.amount ?? 1;
  }
  return out;
}

export const sum = (p: Point[]) => p.reduce((a, b) => a + b.value, 0);

/** Variação percentual entre a 1ª e a 2ª metade da série (null se não há base). */
export function trend(p: Point[]): number | null {
  const h = Math.floor(p.length / 2);
  const a = sum(p.slice(0, h));
  const b = sum(p.slice(h));
  if (a === 0) return b > 0 ? 100 : null;
  return Math.round(((b - a) / a) * 100);
}
