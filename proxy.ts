import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { canAccess, isPrivatePath, type Role } from '@/lib/auth/access';
import { supabaseEnv } from '@/lib/supabase/env';

const REF = /^[a-z0-9](?:[a-z0-9-]{1,38})[a-z0-9]\.[a-f0-9]{20}$/;
const THIRTY_DAYS = 60 * 60 * 24 * 30;

export async function proxy(request: NextRequest) {
  const env = supabaseEnv();
  const { pathname } = request.nextUrl;
  let response = NextResponse.next({ request });

  // Visitante anônimo (atribuição) e link de Enviajador: só cookies, sem consultar sessão em páginas públicas.
  let vid = request.cookies.get('av_vid')?.value;
  if (!vid) {
    vid = crypto.randomUUID();
    response.cookies.set('av_vid', vid, { httpOnly: true, sameSite: 'lax', secure: request.nextUrl.protocol === 'https:', maxAge: 60 * 60 * 24 * 365, path: '/' });
  }
  const ref = request.nextUrl.searchParams.get('r');
  if (env && ref && REF.test(ref)) {
    response.cookies.set('av_ref', ref, { httpOnly: true, sameSite: 'lax', secure: request.nextUrl.protocol === 'https:', maxAge: THIRTY_DAYS, path: '/' });
    // Registra a visita (a função valida a assinatura; token inválido é ignorado).
    void fetch(`${env.url}/rest/v1/rpc/record_touch`, {
      method: 'POST',
      headers: { apikey: env.anonKey, authorization: `Bearer ${env.anonKey}`, 'content-type': 'application/json' },
      body: JSON.stringify({ p_token: ref, p_visitor: vid }),
    }).catch(() => undefined);
  }

  if (!env || !isPrivatePath(pathname)) return response;

  const supabase = createServerClient(env.url, env.anonKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (list) => {
        list.forEach(({ name, value }) => request.cookies.set(name, value));
        const prev = response.cookies.getAll();
        response = NextResponse.next({ request });
        prev.forEach((c) => response.cookies.set(c));
        list.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });
  const { data } = await supabase.auth.getUser();
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
  if (!canAccess((rows ?? []).map((r) => r.role as Role), pathname)) return login('forbidden');
  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|brand/|photos/|favicon.ico|api/health|api/track).*)'],
};
