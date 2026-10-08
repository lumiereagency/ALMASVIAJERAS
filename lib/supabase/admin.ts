import { createClient } from '@supabase/supabase-js';

/**
 * Cliente com service role: ignora RLS. Uso EXCLUSIVO em código de servidor (route handlers, server actions)
 * para escritas públicas validadas (eventos, leads). Nunca importar em componentes de cliente.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}
