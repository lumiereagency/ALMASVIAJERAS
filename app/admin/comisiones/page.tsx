import type { Metadata } from 'next';
import { formatMoney } from '@/domain/catalog';
import { COMMISSION_NEXT, COMMISSION_STATUS_LABEL } from '@/lib/labels';
import { createClient } from '@/lib/supabase/server';
import { adjustCommission, setCommissionStatus } from '../actions';

export const metadata: Metadata = { title: 'Comisiones', robots: { index: false } };
export const dynamic = 'force-dynamic';

interface Row {
  id: string;
  status: string;
  eligible_amount: number;
  commission_amount: number;
  currency: 'USD';
  rule_snapshot: { kind: string; value: number; scope: string };
  created_at: string;
  enviajador_profiles: { display_name: string } | null;
  experiences: { title: string } | null;
}

export default async function Page({ searchParams }: { searchParams: Promise<{ ok?: string; err?: string }> }) {
  const sp = await searchParams;
  const db = (await createClient())!;
  const { data } = await db
    .from('commissions')
    .select('id, status, eligible_amount, commission_amount, currency, rule_snapshot, created_at, enviajador_profiles(display_name), experiences(title)')
    .order('created_at', { ascending: false });
  const rows = (data ?? []) as unknown as Row[];
  return (
    <>
      <h1 className="h2">Comisiones</h1>
      {sp.ok && <p role="status" className="form-ok">{sp.ok}</p>}
      {sp.err && <p role="alert" className="form-error">{sp.err}</p>}
      <p className="hint">Cada cambio queda en el historial de auditoría. Las comisiones no se borran: se cancelan o se ajustan con motivo.</p>
      {rows.length === 0 ? (
        <p className="muted">Aún no hay comisiones. Se generan al confirmar una venta atribuida a un Enviajador.</p>
      ) : (
        <div className="stack">
          {rows.map((c) => (
            <article key={c.id} className="panel">
              <header className="panel__head">
                <div>
                  <h2 className="h3">{c.enviajador_profiles?.display_name ?? '—'}</h2>
                  <p className="muted">{c.experiences?.title ?? 'Venta'} · {new Date(c.created_at).toLocaleDateString('es-MX')}</p>
                </div>
                <span className={`status status--${c.status}`}>{COMMISSION_STATUS_LABEL[c.status]}</span>
              </header>
              <dl className="kv">
                <dt>Base elegible</dt><dd>{formatMoney(Number(c.eligible_amount), c.currency)}</dd>
                <dt>Regla aplicada</dt><dd>{c.rule_snapshot.scope} · {c.rule_snapshot.kind === 'percent' ? `${c.rule_snapshot.value}%` : formatMoney(c.rule_snapshot.value, c.currency)}</dd>
                <dt>Comisión</dt><dd><strong>{formatMoney(Number(c.commission_amount), c.currency)}</strong></dd>
              </dl>
              <div className="row-actions">
                {(COMMISSION_NEXT[c.status] ?? []).map((to) => (
                  <form key={to} action={setCommissionStatus} className="inline-form">
                    <input type="hidden" name="id" value={c.id} />
                    <input type="hidden" name="to" value={to} />
                    {(to === 'cancelled' || to === 'disputed') && <input name="reason" placeholder="Motivo" required aria-label="Motivo" />}
                    <button className="btn btn--secondary btn--sm">{COMMISSION_STATUS_LABEL[to]}</button>
                  </form>
                ))}
                {c.status !== 'cancelled' && (
                  <form action={adjustCommission} className="inline-form">
                    <input type="hidden" name="id" value={c.id} />
                    <input name="delta" type="number" step="0.01" placeholder="± monto" required aria-label="Monto del ajuste" />
                    <input name="reason" placeholder="Motivo del ajuste" required aria-label="Motivo del ajuste" />
                    <button className="btn btn--secondary btn--sm">Ajustar</button>
                  </form>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
