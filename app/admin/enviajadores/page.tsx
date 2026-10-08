import type { Metadata } from 'next';
import { ENVIAJADOR_STATUS_LABEL } from '@/lib/labels';
import { createClient } from '@/lib/supabase/server';
import { setEnviajadorStatus } from '../actions';

export const metadata: Metadata = { title: 'Enviajadores', robots: { index: false } };
export const dynamic = 'force-dynamic';

export default async function Page({ searchParams }: { searchParams: Promise<{ ok?: string; err?: string }> }) {
  const sp = await searchParams;
  const db = (await createClient())!;
  const { data } = await db.from('enviajador_profiles').select('id, slug, display_name, status, created_at').order('created_at', { ascending: false });
  return (
    <>
      <h1 className="h2">Enviajadores</h1>
      {sp.ok && <p role="status" className="form-ok">{sp.ok}</p>}
      {sp.err && <p role="alert" className="form-error">{sp.err}</p>}
      {(data ?? []).length === 0 ? (
        <p className="muted">Aún no hay Enviajadores registrados.</p>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr><th>Nombre</th><th>Enlace</th><th>Estado</th><th>Alta</th><th>Acción</th></tr>
            </thead>
            <tbody>
              {(data ?? []).map((e) => (
                <tr key={e.id}>
                  <td>{e.display_name}</td>
                  <td>/e/{e.slug}</td>
                  <td><span className={`status status--${e.status}`}>{ENVIAJADOR_STATUS_LABEL[e.status]}</span></td>
                  <td>{new Date(e.created_at).toLocaleDateString('es-MX')}</td>
                  <td>
                    <div className="row-actions">
                      {e.status !== 'active' && (
                        <form action={setEnviajadorStatus}><input type="hidden" name="id" value={e.id} /><input type="hidden" name="status" value="active" /><button className="btn btn--primary btn--sm">Aprobar</button></form>
                      )}
                      {e.status !== 'suspended' && (
                        <form action={setEnviajadorStatus}><input type="hidden" name="id" value={e.id} /><input type="hidden" name="status" value="suspended" /><button className="btn btn--secondary btn--sm">Suspender</button></form>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
