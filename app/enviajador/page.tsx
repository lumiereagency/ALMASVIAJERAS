import type { Metadata } from 'next';
import Link from 'next/link';
import { formatMoney } from '@/domain/catalog';
import { listPublishedExperiences } from '@/lib/catalog/queries';
import { COMMISSION_STATUS_LABEL, ENVIAJADOR_STATUS_LABEL, LEAD_STATUS_LABEL } from '@/lib/labels';
import { createClient } from '@/lib/supabase/server';
import { LinkList } from './LinkList';

export const metadata: Metadata = { title: 'Mi panel', robots: { index: false } };
export const dynamic = 'force-dynamic';

interface Stats {
  visits: number;
  leads: number;
  in_service: number;
  reserved: number;
  sales: number;
  commissions: { status: string; currency: 'USD'; count: number; total: number }[];
}

export default async function Page() {
  const db = (await createClient())!;
  const { data: me } = await db.from('enviajador_profiles').select('id, slug, display_name, status').maybeSingle();
  if (!me) {
    return (
      <>
        <h1 className="h2">Completa tu perfil</h1>
        <p className="muted">Todavía no activaste tu perfil de Enviajador.</p>
        <Link href="/registro-enviajador" className="btn btn--gradient">Completar perfil</Link>
      </>
    );
  }
  const base = process.env.SITE_URL ?? 'http://localhost:3000';
  const [{ data: stats }, { data: token }, experiences, { data: leads }, { data: comms }] = await Promise.all([
    db.rpc('enviajador_stats'),
    db.rpc('sign_ref', { p_slug: me.slug }),
    listPublishedExperiences(),
    db.from('enviajador_leads').select('id, first_name, status, created_at, experience_id').order('created_at', { ascending: false }).limit(50),
    db.from('commissions').select('id, status, commission_amount, currency, created_at').order('created_at', { ascending: false }),
  ]);
  const s = (stats ?? { visits: 0, leads: 0, in_service: 0, reserved: 0, sales: 0, commissions: [] }) as Stats;
  const sum = (pred: (st: string) => boolean) => {
    const m = new Map<string, number>();
    s.commissions.filter((c) => pred(c.status)).forEach((c) => m.set(c.currency, (m.get(c.currency) ?? 0) + Number(c.total)));
    return m.size ? [...m].map(([c, v]) => formatMoney(v, c as 'USD')).join(' · ') : '—';
  };
  const items = [
    { label: 'Mi vitrina', url: `${base}/e/${me.slug}?r=${token}`, title: 'Mi selección de viajes' },
    ...experiences.map((x) => ({ label: x.title, url: `${base}/experiencias/${x.slug}?r=${token}`, title: x.title })),
  ];
  const titleById = new Map(experiences.map((x) => [x.id, x.title]));

  return (
    <>
      <p className="eyebrow">Enviajador</p>
      <h1 className="h2">Hola, {me.display_name}</h1>
      {me.status !== 'active' && (
        <p className="notice">
          Tu perfil está <strong>{ENVIAJADOR_STATUS_LABEL[me.status]?.toLowerCase()}</strong>. Tus enlaces empiezan a atribuir cuando el equipo apruebe tu cuenta.
        </p>
      )}
      <div className="kpis">
        <div className="kpi"><span>Visitas válidas</span><strong>{s.visits}</strong></div>
        <div className="kpi"><span>Solicitudes</span><strong>{s.leads}</strong></div>
        <div className="kpi"><span>En atención</span><strong>{s.in_service}</strong></div>
        <div className="kpi"><span>Apartados</span><strong>{s.reserved}</strong></div>
        <div className="kpi"><span>Ventas</span><strong>{s.sales}</strong></div>
        <div className="kpi"><span>Comisión pagada</span><strong>{sum((st) => st === 'paid')}</strong></div>
        <div className="kpi"><span>Comisión por cobrar</span><strong>{sum((st) => ['awaiting_confirmation', 'approved', 'scheduled'].includes(st))}</strong></div>
      </div>

      <section className="panel">
        <h2 className="h3">Mis enlaces</h2>
        <p className="hint">Cada enlace lleva tu firma personal: la atribución dura 30 días y no depende de parámetros que se puedan falsificar.</p>
        <LinkList items={items} />
      </section>

      <section className="panel">
        <h2 className="h3">Solicitudes atribuidas</h2>
        <p className="hint">Por privacidad solo ves el primer nombre y el estado.</p>
        {(leads ?? []).length === 0 ? (
          <p className="muted">Aún no hay solicitudes. Comparte tu enlace para empezar.</p>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>Viajero</th><th>Experiencia</th><th>Estado</th><th>Fecha</th></tr></thead>
              <tbody>
                {(leads ?? []).map((l) => (
                  <tr key={l.id}>
                    <td>{l.first_name}</td>
                    <td>{(l.experience_id && titleById.get(l.experience_id)) || '—'}</td>
                    <td><span className={`status status--${l.status}`}>{LEAD_STATUS_LABEL[l.status]}</span></td>
                    <td>{new Date(l.created_at).toLocaleDateString('es-MX')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="panel">
        <h2 className="h3">Mis comisiones</h2>
        {(comms ?? []).length === 0 ? (
          <p className="muted">Aún no tienes comisiones. Se generan cuando una venta atribuida a ti se confirma.</p>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>Fecha</th><th>Monto</th><th>Estado</th></tr></thead>
              <tbody>
                {(comms ?? []).map((c) => (
                  <tr key={c.id}>
                    <td>{new Date(c.created_at).toLocaleDateString('es-MX')}</td>
                    <td>{formatMoney(Number(c.commission_amount), c.currency)}</td>
                    <td><span className={`status status--${c.status}`}>{COMMISSION_STATUS_LABEL[c.status]}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
