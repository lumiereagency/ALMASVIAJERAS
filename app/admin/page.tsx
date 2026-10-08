import type { Metadata } from 'next';
import Link from 'next/link';
import { AreaChart, Donut } from '@/components/app/charts';
import { AvatarStack, Banner, CalendarCard, Card, Stat } from '@/components/app/widgets';
import { Inbox, Trending, Users, Wallet } from '@/components/ui/icons';
import { formatMoney } from '@/domain/catalog';
import { LEAD_STATUS_LABEL } from '@/lib/labels';
import { lastDays, sum, trend } from '@/lib/series';
import { createClient } from '@/lib/supabase/server';
import { ageMs, daysAgoISO, isWithinDays } from '@/lib/time';

export const metadata: Metadata = { title: 'Resumen', robots: { index: false } };
export const dynamic = 'force-dynamic';

interface L {
  id: string;
  full_name: string;
  status: string;
  created_at: string;
  experiences: { title: string } | null;
  enviajador_profiles: { display_name: string } | null;
}

const fmt = (m: Map<string, number>) => (m.size ? [...m].map(([c, v]) => formatMoney(v, c as 'USD')).join(' · ') : '—');
const ago = (iso: string) => {
  const m = Math.round(ageMs(iso) / 60000);
  return m < 60 ? `hace ${Math.max(m, 1)} min` : m < 1440 ? `hace ${Math.round(m / 60)} h` : new Date(iso).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });
};

export default async function Page() {
  const db = (await createClient())!;
  const since = daysAgoISO(120);
  const [{ data: leadRows }, { data: saleRows }, { data: commRows }, { data: envRows }] = await Promise.all([
    db.from('leads').select('id, full_name, status, created_at, experiences(title), enviajador_profiles:attributed_enviajador_id(display_name)').gte('created_at', since).order('created_at', { ascending: false }).limit(1500),
    db.from('sales').select('amount, currency, confirmed_at').gte('confirmed_at', since).limit(1500),
    db.from('commissions').select('status, commission_amount, currency'),
    db.from('enviajador_profiles').select('id, status'),
  ]);
  const leads = (leadRows ?? []) as unknown as L[];
  const l14 = lastDays(leads.map((l) => ({ at: l.created_at })), 14);
  const l30 = lastDays(leads.map((l) => ({ at: l.created_at })), 30);
  const s30 = lastDays((saleRows ?? []).map((s) => ({ at: s.confirmed_at })), 30);
  const recent = leads.filter((l) => isWithinDays(l.created_at, 30));
  const won = recent.filter((l) => l.status === 'sale_confirmed').length;
  const conv = recent.length ? Math.round((won / recent.length) * 100) : 0;

  const revenue = new Map<string, number>();
  (saleRows ?? []).filter((s) => isWithinDays(s.confirmed_at, 30)).forEach((s) => revenue.set(s.currency, (revenue.get(s.currency) ?? 0) + Number(s.amount)));
  const owed = new Map<string, number>();
  (commRows ?? []).filter((c) => ['awaiting_confirmation', 'approved', 'scheduled'].includes(c.status)).forEach((c) => owed.set(c.currency, (owed.get(c.currency) ?? 0) + Number(c.commission_amount)));

  const count = (f: (s: string) => boolean) => leads.filter((l) => f(l.status)).length;
  const funnel = [
    { label: 'Nuevos', value: count((s) => s === 'new'), color: '#20b8f5' },
    { label: 'En atención', value: count((s) => ['contact_attempt', 'in_service', 'proposal_sent'].includes(s)), color: '#7357f6' },
    { label: 'Apartados', value: count((s) => s === 'reserved'), color: '#296fe8' },
    { label: 'Ventas', value: count((s) => s === 'sale_confirmed'), color: '#eb00d7' },
    { label: 'Perdidos / cancelados', value: count((s) => ['lost', 'cancelled'].includes(s)), color: '#c9c6d8' },
  ];
  const calCounts: Record<string, number> = {};
  leads.forEach((l) => {
    const k = l.created_at.slice(0, 10);
    calCounts[k] = (calCounts[k] ?? 0) + 1;
  });

  const topEnv = new Map<string, number>();
  recent.forEach((l) => l.enviajador_profiles && topEnv.set(l.enviajador_profiles.display_name, (topEnv.get(l.enviajador_profiles.display_name) ?? 0) + 1));
  const topExp = new Map<string, number>();
  recent.forEach((l) => l.experiences && topExp.set(l.experiences.title, (topExp.get(l.experiences.title) ?? 0) + 1));
  const rank = (m: Map<string, number>) => [...m].sort((a, b) => b[1] - a[1]).slice(0, 5);
  const newCount = count((s) => s === 'new');
  const pendingEnv = (envRows ?? []).filter((e) => e.status === 'pending').length;

  return (
    <>
      <Banner
        eyebrow="Panel de administración"
        title={newCount ? `Tienes ${newCount} ${newCount === 1 ? 'lead nuevo' : 'leads nuevos'} por atender` : 'Todo al día'}
        text={pendingEnv ? `Además, ${pendingEnv} ${pendingEnv === 1 ? 'Enviajador espera' : 'Enviajadores esperan'} tu aprobación.` : 'Sigue el pulso del negocio: leads, ventas, comisiones y cobros en un solo lugar.'}
        cta={{ href: '/equipe?status=new', label: 'Atender leads' }}
      />

      <div className="bento">
        <div className="span-3"><Stat id="leads" label="Leads (30 días)" value={String(sum(l30))} delta={trend(l30)} data={l14.map((p) => p.value)} icon={<Inbox width={21} height={21} />} /></div>
        <div className="span-3"><Stat id="conv" label="Conversión a venta" value={`${conv}%`} delta={null} data={s30.slice(-14).map((p) => p.value)} icon={<Trending width={21} height={21} />} /></div>
        <div className="span-3"><Stat id="rev" label="Ingresos (30 días)" value={fmt(revenue)} delta={trend(s30)} data={s30.slice(-14).map((p) => p.value)} icon={<Wallet width={21} height={21} />} /></div>
        <div className="span-3"><Stat id="comm" label="Comisiones por pagar" value={fmt(owed)} icon={<Users width={21} height={21} />} /></div>

        <div className="span-8">
          <Card title="Leads y ventas · últimos 30 días">
            <AreaChart id="main" labels={l30.map((p) => p.label)} series={[{ name: 'Leads', values: l30.map((p) => p.value), color: '#7357f6' }, { name: 'Ventas', values: s30.map((p) => p.value), color: '#eb00d7' }]} />
            <div className="legend legend--row"><span><i style={{ background: '#7357f6' }} /> Leads</span><span><i style={{ background: '#eb00d7' }} /> Ventas</span></div>
          </Card>
        </div>
        <div className="span-4">
          <Card title="Embudo">
            <Donut items={funnel} center={String(leads.length)} sub="leads" />
          </Card>
        </div>

        <div className="span-4"><CalendarCard counts={calCounts} title="Leads por día" /></div>
        <div className="span-4">
          <Card title="Actividad reciente" aside={<Link href="/equipe" className="link-arrow">Ver todo</Link>}>
            {leads.length === 0 ? (
              <p className="muted">Aún no hay leads. Cuando lleguen, los verás aquí al instante.</p>
            ) : (
              <ul className="feed">
                {leads.slice(0, 6).map((l) => (
                  <li key={l.id}>
                    <span className="feed__dot"><Inbox width={18} height={18} /></span>
                    <Link href={`/equipe/leads/${l.id}`} className="feed__main">
                      <strong>{l.full_name}</strong>
                      <span>{l.experiences?.title ?? 'Consulta general'} · {ago(l.created_at)}</span>
                    </Link>
                    <span className={`status status--${l.status}`}>{LEAD_STATUS_LABEL[l.status]}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
        <div className="span-4">
          <Card title="Lo más pedido" aside={<AvatarStack names={rank(topEnv).map(([n]) => n)} />}>
            <p className="eyebrow">Experiencias</p>
            {rank(topExp).length === 0 ? <p className="muted">Sin datos todavía.</p> : (
              <ul className="rank">
                {rank(topExp).map(([n, v], i, a) => (
                  <li key={n}><span>{n}</span><strong>{v}</strong><span className="rank__bar"><i style={{ width: `${(v / a[0]![1]) * 100}%` }} /></span></li>
                ))}
              </ul>
            )}
            <p className="eyebrow" style={{ marginTop: 8 }}>Enviajadores</p>
            {rank(topEnv).length === 0 ? <p className="muted">Sin referidos todavía.</p> : (
              <ul className="rank">
                {rank(topEnv).map(([n, v], i, a) => (
                  <li key={n}><span>{n}</span><strong>{v}</strong><span className="rank__bar"><i style={{ width: `${(v / a[0]![1]) * 100}%` }} /></span></li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}
