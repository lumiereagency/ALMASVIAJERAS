import type { Metadata } from 'next';
import Link from 'next/link';
import { formatMoney } from '@/domain/catalog';
import { LEAD_STATUS_LABEL } from '@/lib/labels';
import { createClient } from '@/lib/supabase/server';

export const metadata: Metadata = { title: 'Resumen', robots: { index: false } };
export const dynamic = 'force-dynamic';

export default async function Page() {
  const db = (await createClient())!;
  const [{ data: leads }, { data: sales }, { data: comms }, { count: pendingEnv }] = await Promise.all([
    db.from('leads').select('status'),
    db.from('sales').select('amount, currency'),
    db.from('commissions').select('status, commission_amount, currency'),
    db.from('enviajador_profiles').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
  ]);
  const byStatus = new Map<string, number>();
  (leads ?? []).forEach((l) => byStatus.set(l.status, (byStatus.get(l.status) ?? 0) + 1));
  const revenue = new Map<string, number>();
  (sales ?? []).forEach((s) => revenue.set(s.currency, (revenue.get(s.currency) ?? 0) + Number(s.amount)));
  const owed = new Map<string, number>();
  (comms ?? []).filter((c) => !['paid', 'cancelled'].includes(c.status)).forEach((c) => owed.set(c.currency, (owed.get(c.currency) ?? 0) + Number(c.commission_amount)));
  const fmt = (m: Map<string, number>) => (m.size ? [...m].map(([c, v]) => formatMoney(v, c as 'USD')).join(' · ') : '—');

  return (
    <>
      <h1 className="h2">Resumen operativo</h1>
      <div className="kpis">
        <div className="kpi"><span>Leads</span><strong>{leads?.length ?? 0}</strong></div>
        <div className="kpi"><span>Nuevos sin atender</span><strong>{byStatus.get('new') ?? 0}</strong></div>
        <div className="kpi"><span>Ventas confirmadas</span><strong>{byStatus.get('sale_confirmed') ?? 0}</strong></div>
        <div className="kpi"><span>Ingresos</span><strong>{fmt(revenue)}</strong></div>
        <div className="kpi"><span>Comisiones por pagar</span><strong>{fmt(owed)}</strong></div>
        <div className="kpi"><span>Enviajadores pendientes</span><strong>{pendingEnv ?? 0}</strong></div>
      </div>
      <section className="panel">
        <h2 className="h3">Embudo</h2>
        <ul className="funnel">
          {Object.entries(LEAD_STATUS_LABEL).map(([k, v]) => (
            <li key={k}>
              <Link href={`/equipe?status=${k}`}>{v}</Link>
              <strong>{byStatus.get(k) ?? 0}</strong>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
