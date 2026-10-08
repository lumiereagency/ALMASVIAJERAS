import type { Metadata } from 'next';
import { Banner, Card } from '@/components/app/widgets';
import { formatMoney } from '@/domain/catalog';
import { createClient } from '@/lib/supabase/server';
import { createPayment, setPaymentStatus, setProvider } from './actions';

export const metadata: Metadata = { title: 'Pagos', robots: { index: false } };
export const dynamic = 'force-dynamic';

/** Variáveis de ambiente do SERVIDOR que cada gateway exige (segredos nunca ficam no banco nem no cliente). */
const GATEWAYS: Record<string, { envs: string[]; hook: string; note: string }> = {
  manual: { envs: [], hook: '', note: 'Registra cobros recibidos por transferencia, efectivo o terminal. No requiere integración.' },
  stripe: { envs: ['STRIPE_SECRET_KEY', 'STRIPE_WEBHOOK_SECRET'], hook: '/api/webhooks/stripe', note: 'Cobro con tarjeta en USD/MXN/EUR mediante Stripe Checkout.' },
  mercadopago: { envs: ['MERCADOPAGO_ACCESS_TOKEN', 'MERCADOPAGO_WEBHOOK_SECRET'], hook: '/api/webhooks/mercadopago', note: 'Tarjetas, OXXO y transferencias SPEI en México.' },
  paypal: { envs: ['PAYPAL_CLIENT_ID', 'PAYPAL_CLIENT_SECRET', 'PAYPAL_WEBHOOK_ID'], hook: '/api/webhooks/paypal', note: 'Cobros internacionales con PayPal.' },
};
const STATUS: Record<string, string> = { pending: 'Pendiente', paid: 'Pagado', failed: 'Fallido', refunded: 'Reembolsado', cancelled: 'Cancelado' };

interface Prov { provider: string; display_name: string; enabled: boolean; mode: string }
interface Pay { id: string; provider: string; provider_ref: string | null; amount: number; currency: 'USD'; status: string; method: string | null; created_at: string; leads: { full_name: string } | null }
interface Sale { id: string; amount: number; currency: 'USD'; leads: { full_name: string } | null }

export default async function Page({ searchParams }: { searchParams: Promise<{ ok?: string; err?: string }> }) {
  const sp = await searchParams;
  const db = (await createClient())!;
  const [{ data: pr }, { data: py }, { data: sl }, { data: paid }] = await Promise.all([
    db.from('payment_providers').select('provider, display_name, enabled, mode').order('provider'),
    db.from('payments').select('id, provider, provider_ref, amount, currency, status, method, created_at, leads(full_name)').order('created_at', { ascending: false }).limit(100),
    db.from('sales').select('id, amount, currency, leads(full_name)').order('confirmed_at', { ascending: false }).limit(200),
    db.from('payments').select('sale_id, amount').in('status', ['paid', 'pending']),
  ]);
  const providers = (pr ?? []) as Prov[];
  const payments = (py ?? []) as unknown as Pay[];
  const used = new Map<string, number>();
  (paid ?? []).forEach((x) => used.set(x.sale_id, (used.get(x.sale_id) ?? 0) + Number(x.amount)));
  const open = ((sl ?? []) as unknown as Sale[]).map((s) => ({ ...s, balance: Number(s.amount) - (used.get(s.id) ?? 0) })).filter((s) => s.balance > 0);
  const enabled = providers.filter((p) => p.enabled);

  return (
    <>
      <Banner eyebrow="Pagos" title="Cobra desde tu propia plataforma" text="Activa métodos de cobro, registra pagos y sigue el saldo de cada venta. Los gateways se conectan con claves del servidor." />
      {sp.ok && <p role="status" className="form-ok">{sp.ok}</p>}
      {sp.err && <p role="alert" className="form-error">{sp.err}</p>}

      <div className="bento">
        {providers.map((p) => {
          const g = GATEWAYS[p.provider]!;
          const keys = g.envs.length === 0 ? true : g.envs.every((e) => !!process.env[e]);
          return (
            <div key={p.provider} className="span-6">
              <Card title={p.display_name} aside={<span className={`status ${p.enabled ? 'status--active' : 'status--pending'}`}>{p.enabled ? `Activo · ${p.mode === 'live' ? 'producción' : 'pruebas'}` : 'Inactivo'}</span>}>
                <p className="muted">{g.note}</p>
                {g.envs.length > 0 && (
                  <p className="hint">
                    Claves del servidor: <strong>{keys ? 'configuradas' : 'pendientes'}</strong> ({g.envs.join(', ')}). Webhook: <code>{g.hook}</code>
                  </p>
                )}
                <form action={setProvider} className="inline-form">
                  <input type="hidden" name="provider" value={p.provider} />
                  <label className="check"><input type="checkbox" name="enabled" defaultChecked={p.enabled} /> <span>Activo</span></label>
                  <select name="mode" defaultValue={p.mode} aria-label="Modo">
                    <option value="test">Pruebas</option>
                    <option value="live">Producción</option>
                  </select>
                  <button className="btn btn--secondary btn--sm">Guardar</button>
                </form>
                {p.provider !== 'manual' && p.enabled && !keys && <p className="notice">Activado, pero faltan las claves en el servidor: no se podrá cobrar por este método hasta configurarlas.</p>}
              </Card>
            </div>
          );
        })}

        <div className="span-5">
          <Card title="Registrar cobro">
            {open.length === 0 ? <p className="muted">No hay ventas con saldo pendiente.</p> : (
              <form action={createPayment} className="form">
                <div className="field">
                  <label htmlFor="sale">Venta</label>
                  <select id="sale" name="sale" required>
                    {open.map((s) => <option key={s.id} value={s.id}>{s.leads?.full_name ?? 'Venta'} · saldo {formatMoney(s.balance, s.currency)}</option>)}
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="amount">Monto</label>
                  <input id="amount" name="amount" type="number" min="0.01" step="0.01" required />
                </div>
                <div className="field">
                  <label htmlFor="provider">Método</label>
                  <select id="provider" name="provider">{enabled.map((p) => <option key={p.provider} value={p.provider}>{p.display_name}</option>)}</select>
                </div>
                <div className="field">
                  <label htmlFor="method">Referencia o nota (opcional)</label>
                  <input id="method" name="method" maxLength={40} />
                </div>
                <button className="btn btn--gradient" type="submit">Crear cobro</button>
              </form>
            )}
          </Card>
        </div>
        <div className="span-7">
          <Card title="Cobros recientes">
            {payments.length === 0 ? <p className="muted">Todavía no hay cobros.</p> : (
              <div className="table-wrap">
                <table className="table">
                  <thead><tr><th>Cliente</th><th>Monto</th><th>Método</th><th>Estado</th><th></th></tr></thead>
                  <tbody>
                    {payments.map((x) => (
                      <tr key={x.id}>
                        <td>{x.leads?.full_name ?? '—'}</td>
                        <td>{formatMoney(Number(x.amount), x.currency)}</td>
                        <td>{x.provider}</td>
                        <td><span className={`status status--${x.status === 'paid' ? 'paid' : x.status === 'pending' ? 'pending' : 'cancelled'}`}>{STATUS[x.status]}</span></td>
                        <td>
                          <div className="row-actions">
                            {x.status === 'pending' && (
                              <>
                                <form action={setPaymentStatus} className="inline-form"><input type="hidden" name="id" value={x.id} /><input type="hidden" name="to" value="paid" /><input name="ref" placeholder="Ref." aria-label="Referencia" /><button className="btn btn--primary btn--sm">Marcar pagado</button></form>
                                <form action={setPaymentStatus}><input type="hidden" name="id" value={x.id} /><input type="hidden" name="to" value="cancelled" /><button className="btn btn--secondary btn--sm">Cancelar</button></form>
                              </>
                            )}
                            {x.status === 'paid' && (
                              <form action={setPaymentStatus}><input type="hidden" name="id" value={x.id} /><input type="hidden" name="to" value="refunded" /><button className="btn btn--secondary btn--sm">Reembolsar</button></form>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
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
