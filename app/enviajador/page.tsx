import type { Metadata } from 'next';
import Link from 'next/link';
import { AreaChart } from '@/components/app/charts';
import { InstallCard, NotificationsCard } from '@/components/app/PwaCards';
import { Banner, Card, Stat } from '@/components/app/widgets';
import { Inbox, Trending, Users, Wallet } from '@/components/ui/icons';
import { formatMoney } from '@/domain/catalog';
import { listPublishedExperiences } from '@/lib/catalog/queries';
import { COMMISSION_STATUS_LABEL, ENVIAJADOR_STATUS_LABEL, LEAD_STATUS_LABEL } from '@/lib/labels';
import { lastDays, sum, trend } from '@/lib/series';
import { createClient } from '@/lib/supabase/server';
import { daysAgoISO } from '@/lib/time';
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
        <Banner eyebrow="Programa Enviajadores" title="Activa tu perfil" text="Elige tu enlace personal y empieza a recomendar viajes." cta={{ href: '/registro-enviajador', label: 'Completar perfil' }} />
      </>
    );
  }
  const base = process.env.SITE_URL ?? 'http://localhost:3000';
  const since = daysAgoISO(30);
  const [{ data: stats }, { data: token }, experiences, { data: leads }, { data: comms }, { data: touches }] = await Promise.all([
    db.rpc('enviajador_stats'),
    db.rpc('sign_ref', { p_slug: me.slug }),
    listPublishedExperiences(),
    db.from('enviajador_leads').select('id, first_name, status, created_at, experience_id').order('created_at', { ascending: false }).limit(200),
    db.from('commissions').select('id, status, commission_amount, currency, created_at').order('created_at', { ascending: false }),
    db.from('attribution_events').select('touched_at').eq('enviajador_id', me.id).eq('is_self_visit', false).gte('touched_at', since).limit(2000),
  ]);
  const s = (stats ?? { visits: 0, leads: 0, in_service: 0, reserved: 0, sales: 0, commissions: [] }) as Stats;
  const money = (pred: (st: string) => boolean) => {
    const m = new Map<string, number>();
    s.commissions.filter((c) => pred(c.status)).forEach((c) => m.set(c.currency, (m.get(c.currency) ?? 0) + Number(c.total)));
    return m.size ? [...m].map(([c, v]) => formatMoney(v, c as 'USD')).join(' · ') : '—';
  };
  const visits30 = lastDays((touches ?? []).map((t) => ({ at: t.touched_at })), 30);
  const leads30 = lastDays((leads ?? []).map((l) => ({ at: l.created_at })), 30);
  const items = [
    { label: 'Mi vitrina', url: `${base}/e/${me.slug}?r=${token}`, title: 'Mi selección de viajes' },
    ...experiences.map((x) => ({ label: x.title, url: `${base}/experiencias/${x.slug}?r=${token}`, title: x.title })),
  ];
  const titleById = new Map(experiences.map((x) => [x.id, x.title]));

  return (
    <>
      <Banner
        eyebrow="Programa Enviajadores"
        title={me.status === 'active' ? 'Recomienda, comparte y gana con transparencia' : 'Tu cuenta está en revisión'}
        text={me.status === 'active' ? 'Tu enlace personal atribuye cada solicitud a tu recomendación durante 30 días.' : `Estado: ${ENVIAJADOR_STATUS_LABEL[me.status]}. Tus enlaces empiezan a atribuir cuando el equipo apruebe tu cuenta.`}
        cta={{ href: `/e/${me.slug}`, label: 'Ver mi vitrina' }}
      />
      <div className="bento">
        <div className="span-3"><Stat id="e1" label="Visitas válidas (30 días)" value={String(sum(visits30))} delta={trend(visits30)} data={visits30.slice(-14).map((p) => p.value)} icon={<Users width={21} height={21} />} /></div>
        <div className="span-3"><Stat id="e2" label="Solicitudes" value={String(s.leads)} delta={trend(leads30)} data={leads30.slice(-14).map((p) => p.value)} icon={<Inbox width={21} height={21} />} /></div>
        <div className="span-3"><Stat id="e3" label="Ventas" value={String(s.sales)} icon={<Trending width={21} height={21} />} /></div>
        <div className="span-3"><Stat id="e4" label="Comisión por cobrar" value={money((st) => ['awaiting_confirmation', 'approved', 'scheduled'].includes(st))} icon={<Wallet width={21} height={21} />} /></div>

        <div className="span-8">
          <Card title="Visitas y solicitudes · 30 días">
            <AreaChart id="env" labels={visits30.map((p) => p.label)} series={[{ name: 'Visitas', values: visits30.map((p) => p.value), color: '#20b8f5' }, { name: 'Solicitudes', values: leads30.map((p) => p.value), color: '#eb00d7' }]} />
            <div className="legend legend--row"><span><i style={{ background: '#20b8f5' }} /> Visitas</span><span><i style={{ background: '#eb00d7' }} /> Solicitudes</span></div>
          </Card>
        </div>
        <div className="span-4">
          <Card title="Resumen">
            <dl className="kv">
              <dt>En atención</dt><dd><strong>{s.in_service}</strong></dd>
              <dt>Apartados</dt><dd><strong>{s.reserved}</strong></dd>
              <dt>Comisión pagada</dt><dd><strong>{money((st) => st === 'paid')}</strong></dd>
            </dl>
            <p className="hint">Por privacidad no ves datos de contacto de los viajeros.</p>
          </Card>
        </div>

        <div className="span-12">
          <Card title="Mis enlaces">
            <p className="hint">Cada enlace lleva tu firma personal: la atribución dura 30 días y no depende de parámetros falsificables.</p>
            <LinkList items={items} />
          </Card>
        </div>

        <div className="span-6">
          <Card title="Solicitudes atribuidas">
            {(leads ?? []).length === 0 ? <p className="muted">Aún no hay solicitudes. Comparte tu enlace para empezar.</p> : (
              <ul className="feed">
                {(leads ?? []).slice(0, 8).map((l) => (
                  <li key={l.id}>
                    <span className="feed__dot">{l.first_name.charAt(0)}</span>
                    <span className="feed__main"><strong>{l.first_name}</strong><span>{(l.experience_id && titleById.get(l.experience_id)) || 'Consulta general'}</span></span>
                    <span className={`status status--${l.status}`}>{LEAD_STATUS_LABEL[l.status]}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
        <div className="span-6">
          <Card title="Mis comisiones" aside={<Link href="/ajustes" className="link-arrow">Alertas</Link>}>
            {(comms ?? []).length === 0 ? <p className="muted">Se generan cuando una venta atribuida a ti se confirma.</p> : (
              <ul className="feed">
                {(comms ?? []).slice(0, 8).map((c) => (
                  <li key={c.id}>
                    <span className="feed__dot"><Wallet width={18} height={18} /></span>
                    <span className="feed__main"><strong>{formatMoney(Number(c.commission_amount), c.currency)}</strong><span>{new Date(c.created_at).toLocaleDateString('es-MX')}</span></span>
                    <span className={`status status--${c.status}`}>{COMMISSION_STATUS_LABEL[c.status]}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
        <div className="span-6"><InstallCard /></div>
        <div className="span-6"><NotificationsCard /></div>
      </div>
    </>
  );
}
