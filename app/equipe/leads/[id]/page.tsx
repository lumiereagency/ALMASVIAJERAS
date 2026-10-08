import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { formatMoney } from '@/domain/catalog';
import { COMPANIONS, DURATIONS, INTENTS, REGIONS } from '@/domain/recommendations/options';
import { LEAD_NEXT, LEAD_STATUS_LABEL } from '@/lib/labels';
import { createClient } from '@/lib/supabase/server';
import { addNote, changeStatus, confirmSale } from '../actions';

export const metadata: Metadata = { title: 'Lead', robots: { index: false } };
export const dynamic = 'force-dynamic';

type Ans = Record<string, unknown>;
const lab = (list: readonly { value: string; label: string }[], v: unknown) => list.find((o) => o.value === v)?.label ?? String(v ?? '—');

export default async function Page({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ ok?: string; err?: string }> }) {
  const { id } = await params;
  const sp = await searchParams;
  const db = (await createClient())!;
  const { data: lead } = await db
    .from('leads')
    .select('*, experiences(title), enviajador_profiles:attributed_enviajador_id(display_name, slug)')
    .eq('id', id)
    .maybeSingle();
  if (!lead) notFound();

  const [{ data: history }, { data: notes }, { data: consents }, { data: answers }, { data: sale }] = await Promise.all([
    db.from('lead_status_history').select('from_status, to_status, created_at').eq('lead_id', id).order('created_at'),
    db.from('lead_notes').select('body, created_at').eq('lead_id', id).order('created_at', { ascending: false }),
    db.from('consents').select('kind, granted, policy_version, created_at').eq('lead_id', id),
    lead.quiz_session_id ? db.from('quiz_answers').select('step, answer').eq('session_id', lead.quiz_session_id).order('step') : Promise.resolve({ data: [] }),
    db.from('sales').select('amount, currency, confirmed_at').eq('lead_id', id).maybeSingle(),
  ]);

  const a = Object.assign({}, ...((answers ?? []) as { answer: Ans }[]).map((x) => x.answer)) as Ans;
  const next = LEAD_NEXT[lead.status as string] ?? [];
  const exp = lead.experiences as { title: string } | null;
  const env = lead.enviajador_profiles as { display_name: string; slug: string } | null;

  return (
    <>
      <p>
        <Link href="/equipe" className="link-arrow">
          ← Volver a leads
        </Link>
      </p>
      <h1 className="h2">{lead.full_name}</h1>
      <p>
        <span className={`status status--${lead.status}`}>{LEAD_STATUS_LABEL[lead.status as string]}</span>
      </p>
      {sp.ok && <p role="status" className="form-ok">{sp.ok}</p>}
      {sp.err && <p role="alert" className="form-error">{sp.err}</p>}

      <div className="grid-2">
        <section className="panel">
          <h2 className="h3">Contacto</h2>
          <dl className="kv">
            <dt>WhatsApp</dt>
            <dd>
              <a href={`https://wa.me/${String(lead.phone).replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer">
                {lead.phone}
              </a>
            </dd>
            <dt>Correo</dt>
            <dd>{lead.email ?? '—'}</dd>
            <dt>Ubicación</dt>
            <dd>{[lead.city, lead.country].filter(Boolean).join(', ') || '—'}</dd>
            <dt>Interés</dt>
            <dd>{exp?.title ?? '—'}</dd>
            <dt>Origen</dt>
            <dd>{lead.source ?? '—'}</dd>
            <dt>Enviajador</dt>
            <dd>{env ? `${env.display_name} (${env.slug})` : '—'}</dd>
            <dt>Consentimientos</dt>
            <dd>{(consents ?? []).map((c) => `${c.kind}: ${c.granted ? 'sí' : 'no'}`).join(' · ') || '—'}</dd>
          </dl>
        </section>
        <section className="panel">
          <h2 className="h3">Alma Nawi</h2>
          {Object.keys(a).length === 0 ? (
            <p className="muted">Este lead no pasó por el quiz.</p>
          ) : (
            <dl className="kv">
              <dt>Compañía</dt>
              <dd>{lab(COMPANIONS, a.companion)}</dd>
              <dt>Quiere vivir</dt>
              <dd>{((a.intents as string[]) ?? []).map((i) => lab(INTENTS, i)).join(' + ')}</dd>
              <dt>Región</dt>
              <dd>{lab(REGIONS, a.region)}</dd>
              <dt>Duración</dt>
              <dd>{lab(DURATIONS, a.duration)}</dd>
              <dt>Personas</dt>
              <dd>
                {String(a.adults)} adultos, {String(a.minors)} menores
              </dd>
              <dt>Presupuesto</dt>
              <dd>{typeof a.budget === 'number' ? formatMoney(a.budget, a.currency as 'USD') : '—'}</dd>
            </dl>
          )}
        </section>
      </div>

      <div className="grid-2">
        <section className="panel">
          <h2 className="h3">Cambiar estado</h2>
          {next.length === 0 && lead.status !== 'reserved' ? (
            <p className="muted">No hay más cambios disponibles.</p>
          ) : (
            <form action={changeStatus} className="form">
              <input type="hidden" name="id" value={id} />
              <div className="field">
                <label htmlFor="to">Nuevo estado</label>
                <select id="to" name="to" required>
                  {next.map((s) => (
                    <option key={s} value={s}>
                      {LEAD_STATUS_LABEL[s]}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label htmlFor="reason">Motivo (obligatorio si se pierde)</label>
                <input id="reason" name="reason" maxLength={200} />
              </div>
              <button className="btn btn--primary" type="submit">
                Actualizar
              </button>
            </form>
          )}
        </section>
        <section className="panel">
          <h2 className="h3">Venta</h2>
          {sale ? (
            <p>
              Venta confirmada por <strong>{formatMoney(Number(sale.amount), sale.currency as 'USD')}</strong> el {new Date(sale.confirmed_at).toLocaleDateString('es-MX')}.
            </p>
          ) : lead.status === 'reserved' ? (
            <form action={confirmSale} className="form">
              <input type="hidden" name="id" value={id} />
              <div className="field">
                <label htmlFor="amount">Monto total vendido</label>
                <input id="amount" name="amount" type="number" min="0" step="0.01" required />
              </div>
              <div className="field">
                <label htmlFor="currency">Moneda</label>
                <select id="currency" name="currency" defaultValue="USD">
                  <option>USD</option>
                  <option>MXN</option>
                  <option>EUR</option>
                </select>
              </div>
              <button className="btn btn--gradient" type="submit">
                Confirmar venta
              </button>
            </form>
          ) : (
            <p className="muted">Disponible cuando el lead esté en «Apartado».</p>
          )}
        </section>
      </div>

      <div className="grid-2">
        <section className="panel">
          <h2 className="h3">Notas internas</h2>
          <form action={addNote} className="form">
            <input type="hidden" name="id" value={id} />
            <div className="field">
              <label htmlFor="body">Nueva nota</label>
              <input id="body" name="body" maxLength={2000} required />
            </div>
            <button className="btn btn--secondary" type="submit">
              Guardar nota
            </button>
          </form>
          <ul className="log">
            {(notes ?? []).map((n) => (
              <li key={n.created_at}>
                <span className="muted">{new Date(n.created_at).toLocaleString('es-MX')}</span>
                <p>{n.body}</p>
              </li>
            ))}
          </ul>
        </section>
        <section className="panel">
          <h2 className="h3">Historial</h2>
          <ul className="log">
            {(history ?? []).map((h) => (
              <li key={h.created_at}>
                <span className="muted">{new Date(h.created_at).toLocaleString('es-MX')}</span>
                <p>
                  {h.from_status ? `${LEAD_STATUS_LABEL[h.from_status]} → ` : ''}
                  {LEAD_STATUS_LABEL[h.to_status]}
                </p>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}
