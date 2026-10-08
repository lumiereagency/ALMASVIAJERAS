import type { Metadata } from 'next';
import Link from 'next/link';
import { LEAD_STATUS_LABEL } from '@/lib/labels';
import { createClient } from '@/lib/supabase/server';

export const metadata: Metadata = { title: 'Leads', robots: { index: false } };
export const dynamic = 'force-dynamic';

interface Row {
  id: string;
  full_name: string;
  status: string;
  created_at: string;
  experiences: { title: string } | null;
  enviajador_profiles: { display_name: string } | null;
}

export default async function Page({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams;
  const db = (await createClient())!;
  let q = db
    .from('leads')
    .select('id, full_name, status, created_at, experiences(title), enviajador_profiles:attributed_enviajador_id(display_name)')
    .order('created_at', { ascending: false })
    .limit(200);
  if (status && LEAD_STATUS_LABEL[status]) q = q.eq('status', status);
  const { data } = await q;
  const rows = (data ?? []) as unknown as Row[];
  return (
    <>
      <h1 className="h2">Leads</h1>
      <div className="toolbar" role="navigation" aria-label="Filtrar por estado">
        <Link href="/equipe" className={!status ? 'on' : ''}>
          Todos
        </Link>
        {Object.entries(LEAD_STATUS_LABEL).map(([k, v]) => (
          <Link key={k} href={`/equipe?status=${k}`} className={status === k ? 'on' : ''}>
            {v}
          </Link>
        ))}
      </div>
      {rows.length === 0 ? (
        <p className="muted">No hay leads en este filtro.</p>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Experiencia</th>
                <th>Estado</th>
                <th>Enviajador</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td>
                    <Link href={`/equipe/leads/${r.id}`} className="link-arrow">
                      {r.full_name}
                    </Link>
                  </td>
                  <td>{r.experiences?.title ?? '—'}</td>
                  <td>
                    <span className={`status status--${r.status}`}>{LEAD_STATUS_LABEL[r.status]}</span>
                  </td>
                  <td>{r.enviajador_profiles?.display_name ?? '—'}</td>
                  <td>{new Date(r.created_at).toLocaleDateString('es-MX')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
