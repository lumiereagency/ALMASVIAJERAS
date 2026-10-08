import Image from 'next/image';
import Link from 'next/link';
import { signOut } from '@/app/(auth)/actions';
import { markAllRead } from '@/app/ajustes/actions';
import { Bell, LogOut } from '@/components/ui/icons';
import { AREA_LABEL, navFor, type Area } from '@/lib/app-nav';
import { getSession } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';
import { ageMs } from '@/lib/time';
import { AppNav } from './AppNav';

const ago = (iso: string) => {
  const m = Math.round(ageMs(iso) / 60000);
  if (m < 1) return 'ahora';
  if (m < 60) return `hace ${m} min`;
  if (m < 1440) return `hace ${Math.round(m / 60)} h`;
  return new Date(iso).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });
};

export interface Notif {
  id: string;
  title: string;
  body: string | null;
  url: string | null;
  read_at: string | null;
  created_at: string;
}

/** Marco premium das áreas privadas: trilho escuro de navegação, topo com saudação, sino e perfil. */
export async function Frame({ area, children }: { area: Area; children: React.ReactNode }) {
  const session = (await getSession())!;
  const db = (await createClient())!;
  const [{ data: prof }, { data: notifs }, { count }] = await Promise.all([
    db.from('profiles').select('full_name').eq('id', session.userId).maybeSingle(),
    db.from('notifications').select('id, title, body, url, read_at, created_at').order('created_at', { ascending: false }).limit(8),
    db.from('notifications').select('id', { count: 'exact', head: true }).is('read_at', null),
  ]);
  const name = prof?.full_name || session.email?.split('@')[0] || 'Hola';
  return (
    <FrameView area={area} name={name} email={session.email ?? ''} isAdmin={session.roles.includes('admin')} unread={count ?? 0} notifs={(notifs ?? []) as Notif[]}>
      {children}
    </FrameView>
  );
}

/** Parte visual do marco (sem acesso a dados): permite pré-visualizar o design com dados de exemplo. */
export function FrameView({ area, name, email, isAdmin, unread, notifs, children }: { area: Area; name: string; email: string; isAdmin: boolean; unread: number; notifs: Notif[]; children: React.ReactNode }) {
  const first = name.split(' ')[0]!;
  return (
    <div className="app">
      <div className="app__frame">
        <aside className="rail">
          <Link href="/" className="rail__brand" aria-label="Almas Viajeras, inicio">
            <Image src="/brand/simbolo-gradiente-transparente.png" alt="" width={34} height={34} />
          </Link>
          <AppNav items={navFor(area, isAdmin)} />
          <form action={signOut} className="rail__out">
            <button type="submit" aria-label="Cerrar sesión" title="Cerrar sesión">
              <LogOut width={20} height={20} />
            </button>
          </form>
        </aside>

        <div className="app__body">
          <header className="topbar">
            <div>
              <p className="topbar__hello">Hola, {first}</p>
              <p className="topbar__area">{AREA_LABEL[area]} · Almas Viajeras</p>
            </div>
            <div className="topbar__actions">
              <details className="notif">
                <summary aria-label={`Notificaciones${unread ? `, ${unread} sin leer` : ''}`}>
                  <Bell width={21} height={21} />
                  {unread > 0 && <b>{unread > 9 ? '9+' : unread}</b>}
                </summary>
                <div className="notif__panel">
                  <header>
                    <strong>Notificaciones</strong>
                    {unread > 0 && (
                      <form action={markAllRead}>
                        <button type="submit" className="link-arrow">Marcar leídas</button>
                      </form>
                    )}
                  </header>
                  {notifs.length === 0 ? (
                    <p className="muted">Sin novedades por ahora.</p>
                  ) : (
                    <ul>
                      {notifs.map((n) => (
                        <li key={n.id} className={n.read_at ? '' : 'is-new'}>
                          <Link href={n.url || '#'}>
                            <strong>{n.title}</strong>
                            {n.body && <span>{n.body}</span>}
                            <small>{ago(n.created_at)}</small>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </details>
              <span className="chip-user" title={email}>
                <i>{first.charAt(0).toUpperCase()}</i>
                <span>{name}</span>
              </span>
            </div>
          </header>
          <main id="contenido" className="app__main">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
