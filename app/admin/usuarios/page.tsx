import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { grantRole } from '../actions';

export const metadata: Metadata = { title: 'Usuarios', robots: { index: false } };
export const dynamic = 'force-dynamic';

export default async function Page({ searchParams }: { searchParams: Promise<{ ok?: string; err?: string }> }) {
  const sp = await searchParams;
  const db = (await createClient())!;
  const { data } = await db.from('user_roles').select('user_id, role, created_at, profiles(full_name)').order('created_at', { ascending: false });
  return (
    <>
      <h1 className="h2">Usuarios y roles</h1>
      {sp.ok && <p role="status" className="form-ok">{sp.ok}</p>}
      {sp.err && <p role="alert" className="form-error">{sp.err}</p>}
      <section className="panel">
        <h2 className="h3">Asignar rol</h2>
        <p className="hint">La persona debe haberse registrado antes (por ejemplo en «Entrar» o como Enviajador).</p>
        <form action={grantRole} className="form">
          <div className="field">
            <label htmlFor="email">Correo del usuario</label>
            <input id="email" name="email" type="email" required />
          </div>
          <div className="field">
            <label htmlFor="role">Rol</label>
            <select id="role" name="role" defaultValue="staff">
              <option value="staff">Equipo (consultor)</option>
              <option value="admin">Administrador</option>
              <option value="enviajador">Enviajador</option>
              <option value="traveler">Viajero</option>
            </select>
          </div>
          <button className="btn btn--primary" type="submit">Asignar</button>
        </form>
      </section>
      <div className="table-wrap">
        <table className="table">
          <thead><tr><th>Nombre</th><th>Rol</th><th>Desde</th></tr></thead>
          <tbody>
            {(data ?? []).map((r) => (
              <tr key={`${r.user_id}-${r.role}`}>
                <td>{(r.profiles as unknown as { full_name: string } | null)?.full_name ?? r.user_id.slice(0, 8)}</td>
                <td>{r.role}</td>
                <td>{new Date(r.created_at).toLocaleDateString('es-MX')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
