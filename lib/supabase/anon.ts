import { createClient } from '@supabase/supabase-js';
import { supabaseEnv } from './env';

/** Cliente sem sessão, só com a chave pública: para RPCs abertas (lead, evento, toque de atribuição). */
export function createAnonClient() {
  const env = supabaseEnv();
  if (!env) return null;
  return createClient(env.url, env.anonKey, { auth: { persistSession: false, autoRefreshToken: false } });
}
