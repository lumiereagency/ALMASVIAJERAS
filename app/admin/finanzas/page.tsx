import type { Metadata } from 'next';
import Link from 'next/link';
import { Bars } from '@/components/app/charts';
import { Banner, Card, Stat } from '@/components/app/widgets';
import { Receipt, Trending, Wallet } from '@/components/ui/icons';
import { formatMoney } from '@/domain/catalog';
import { CURRENCIES, type Currency } from '@/domain/money';
import { lastMonths, trend } from '@/lib/series';
import { createClient } from '@/lib/supabase/server';

export const metadata: Metadata = { title: 'Finanzas', robots: { index: false } };
export const dynamic = 'force-dynamic';

interface Sale { id: string; amount: number; currency: Currency; confirmed_at: string; leads: { full_name: string } | null; experiences: { title: string } | null }
interface Pay { sale_id: string; amount: number; status: string; currency: Currency; paid_at: string | null }
interface Comm { status: string; commission_amount: number; currency: Currency; enviajador_profiles: { display_name: string } | null }

export default async function Page({ searchParams }: { searchParams: Promise<{ cur?: string }> }) {
  const sp = await searchParams;
  const cur: Currency = (CURRENCIES as readonly string[]).includes(sp.cur ?? '') ? (sp.cur as Currency) : 'USD';
  const db = (await createClient())!;
  const [{ data: s }, { data: p }, { data: c }] = await Promise.all([
    db.from('sales').select('id, amount, currency, confirmed_at, leads(full_name), experiences(title)').eq('currency', cur).order('confirmed_at', { ascending: false }).limit(500),
    db.from('payments').select('sale_id, amount, status, currency, paid_at').eq('currency', cur).limit(2000),
    db.from('commissions').select('status, commission_amount, currency, enviajador_profiles(display_name)').eq('currency', cur),
  ]);
  const sales = (s ?? []) as unknown as Sale[];
  const pays = (p ?? []) as Pay[];
  const comms = (c ?? []) as unknown as Comm[];

  const total = sales.reduce((a, x) => a + Number(x.amount), 0);
  const paidBySale = new Map<string, number>();
  pays.filter((x) => x.status === 'paid').forEach((x) => paidBySale.set(x.sale_id, (paidBySale.get(x.sale_id) ?? 0) + Number(x.amount)));
  const collected = [...paidBySale.values()].reduce((a, b) => a + b, 0);
  const payable = comms.filter((x) => ['awaiting_confirmation', 'approved', 'scheduled'].includes(x.status)).reduce((a, x) => a + Number(x.commission_amount), 0);
  const paidOut = comms.filter((x) => x.status === 'paid').reduce((a, x) => a + Number(x.commission_amount), 0);
  const net = total - comms.filter((x) => x.status !== 'cancelled').reduce((a, x) => a + Number(x.commission_amount), 0);

  const months = lastMonths(sales.map((x) => ({ at: x.confirmed_at, amount: Number(x.amount) })), 6);
  const m = (n: number) => formatMoney(n, cur);

  const byEnv = new Map<string, { payable: number; paid: number }>();
  comms.forEach((x) => {
    const k = x.enviajador_profiles?.display_name ?? '—';
    const e = byEnv.get(k) ?? { payable: 0, paid: 0 };
    if (['awaiting_confirmation', 'approved', 'scheduled'].includes(x.status)) e.payable += Number(x.commission_amount);
    if (x.status === 'paid') e.paid += Number(x.commission_amount);
    byEnv.set(k, e);
  });

  return (
    <>
      <Banner eyebrow="Financiero" title="Ingresos, cobros y comisiones" text="Ventas confirmadas, lo ya cobrado y lo que debes pagar a Enviajadores, por moneda." cta={{ href: '/admin/pagos', label: 'Gestionar pagos' }} />
      <div className="toolbar" role="navigation" aria-label="Moneda">
        {CURRENCIES.map((x) => (
          <Link key={x} href={`/admin/finanzas?cur=${x}`} className={cur === x ? 'on' : ''}>{x}</Link>
        ))}
        <a href={`/admin/finanzas/export?cur=${cur}`} className="btn btn--secondary btn--sm" style={{ marginLeft: 'auto' }}>Exportar CSV</a>
      </div>
      <div className="bento">
        <div className="span-3"><Stat id="f1" label="Ventas confirmadas" value={m(total)} delta={trend(months)} data={months.map((x) => x.value)} icon={<Trending width={21} height={21} />} /></div>
        <div className="span-3"><Stat id="f2" label="Cobrado" value={m(collected)} icon={<Wallet width={21} height={21} />} /></div>
        <div className="span-3"><Stat id="f3" label="Por cobrar" value={m(Math.max(total - collected, 0))} icon={<Receipt width={21} height={21} />} /></div>
        <div className="span-3"><Stat id="f4" label="Neto tras comisiones" value={m(net)} icon={<Wallet width={21} height={21} />} /></div>

        <div className="span-8">
          <Card title={`Ventas por mes · ${cur}`}>
            <Bars id="fin" data={months} format={(n) => m(n)} />
          </Card>
        </div>
        <div className="span-4">
          <Card title="Comisiones">
            <dl className="kv"><dt>Por pagar</dt><dd><strong>{m(payable)}</strong></dd><dt>Pagadas</dt><dd><strong>{m(paidOut)}</strong></dd></dl>
            {byEnv.size === 0 ? <p className="muted">Sin comisiones en {cur}.</p> : (
              <ul className="rank">
                {[...byEnv].sort((a, b) => b[1].payable - a[1].payable).slice(0, 5).map(([n, v]) => (
                  <li key={n}><span>{n}</span><strong>{m(v.payable)}</strong></li>
                ))}
              </ul>
            )}
          </Card>
        </div>
        <div className="span-12">
          <Card title="Ventas y cobro">
            {sales.length === 0 ? <p className="muted">Aún no hay ventas confirmadas en {cur}.</p> : (
              <div className="table-wrap">
                <table className="table">
                  <thead><tr><th>Cliente</th><th>Experiencia</th><th>Venta</th><th>Cobrado</th><th>Saldo</th><th>Fecha</th></tr></thead>
                  <tbody>
                    {sales.map((x) => {
                      const got = paidBySale.get(x.id) ?? 0;
                      return (
                        <tr key={x.id}>
                          <td>{x.leads?.full_name ?? '—'}</td>
                          <td>{x.experiences?.title ?? '—'}</td>
                          <td>{m(Number(x.amount))}</td>
                          <td>{m(got)}</td>
                          <td><span className={`status ${Number(x.amount) - got <= 0 ? 'status--paid' : 'status--awaiting_confirmation'}`}>{Number(x.amount) - got <= 0 ? 'Saldado' : m(Number(x.amount) - got)}</span></td>
                          <td>{new Date(x.confirmed_at).toLocaleDateString('es-MX')}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}
