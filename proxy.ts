import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { canAccess, isPrivatePath, type Role } from '@/lib/auth/access';
import { supabaseEnv } from '@/lib/supabase/env';

export async function proxy(request: NextRequest) {
  const env = supabaseEnv();
  const { pathname } = request.nextUrl;
  if (!env) return NextResponse.next();

  let response = NextResponse.next({ request });
  const supabase = createServerClient(env.url, env.anonKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (list) => {
        list.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        list.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  // Renova a sessão em toda requisição.
  const { data } = await supabase.auth.getUser();

  if (isPrivatePath(pathname)) {
    const login = (error?: string) => {
      const url = request.nextUrl.clone();
      url.pathname = '/entrar';
      url.search = '';
      url.searchParams.set('next', pathname);
      if (error) url.searchParams.set('error', error);
      return NextResponse.redirect(url);
    };
    if (!data.user) return login();
    const { data: rows } = await supabase.from('user_roles').select('role').eq('user_id', data.user.id);
    const roles = (rows ?? []).map((r) => r.role as Role);
    if (!canAccess(roles, pathname)) return login('forbidden');
  }
  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|brand/|favicon.ico|api/health).*)'],
};
