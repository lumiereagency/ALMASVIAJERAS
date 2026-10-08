'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import { canAccess, homeFor, safeNext, type Role } from '@/lib/auth/access';
import { createClient } from '@/lib/supabase/server';

export interface FormState {
  error?: string;
  ok?: string;
}

const email = z.string().trim().toLowerCase().pipe(z.email());
const loginSchema = z.object({ email, password: z.string().min(8).max(128) });
// Mensagem única para qualquer falha de credencial: evita enumeração de contas.
const GENERIC = 'Correo o contraseña incorrectos.';

export async function signIn(_: FormState, form: FormData): Promise<FormState> {
  const parsed = loginSchema.safeParse({ email: form.get('email'), password: form.get('password') });
  if (!parsed.success) return { error: GENERIC };

  const supabase = await createClient();
  if (!supabase) return { error: 'El servicio no está disponible por ahora.' };

  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error || !data.user) return { error: GENERIC };

  const { data: rows } = await supabase.from('user_roles').select('role').eq('user_id', data.user.id);
  const roles = (rows ?? []).map((r) => r.role as Role);
  const next = safeNext(String(form.get('next') ?? ''));
  redirect(next && canAccess(roles, next) ? next : homeFor(roles));
}

export async function requestPasswordReset(_: FormState, form: FormData): Promise<FormState> {
  const parsed = z.object({ email }).safeParse({ email: form.get('email') });
  const supabase = await createClient();
  if (parsed.success && supabase) {
    await supabase.auth.resetPasswordForEmail(parsed.data.email, {
      redirectTo: `${process.env.SITE_URL ?? 'http://localhost:3000'}/entrar`,
    });
  }
  // Resposta idêntica exista ou não a conta.
  return { ok: 'Si el correo está registrado, recibirás un enlace para restablecer tu contraseña.' };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase?.auth.signOut();
  redirect('/');
}
