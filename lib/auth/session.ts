import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { canAccess, type Role } from './access';

export interface Session {
  userId: string;
  email: string | undefined;
  roles: Role[];
}

export async function getSession(): Promise<Session | null> {
  const supabase = await createClient();
  if (!supabase) return null;
  const { data } = await supabase.auth.getUser();
  if (!data.user) return null;
  const { data: rows } = await supabase.from('user_roles').select('role').eq('user_id', data.user.id);
  return { userId: data.user.id, email: data.user.email, roles: (rows ?? []).map((r) => r.role as Role) };
}

/** Defesa em profundidade: a autorização real também é feita por RLS; o proxy só refina a UX. */
export async function requireRole(pathname: string): Promise<Session> {
  const session = await getSession();
  if (!session) redirect(`/entrar?next=${encodeURIComponent(pathname)}`);
  if (!canAccess(session.roles, pathname)) redirect('/entrar?error=forbidden');
  return session;
}
