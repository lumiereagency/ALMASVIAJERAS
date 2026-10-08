'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import { friendlyError } from '@/lib/labels';
import { createClient } from '@/lib/supabase/server';

export interface RegState {
  error?: string;
  ok?: string;
}

const slug = z.string().trim().toLowerCase().regex(/^[a-z0-9](?:[a-z0-9-]{1,38})[a-z0-9]$/, 'El enlace debe tener 3 a 40 letras minúsculas, números o guiones.');
const name = z.string().trim().min(2, 'Escribe tu nombre.').max(80);

export async function signUpEnviajador(_: RegState, form: FormData): Promise<RegState> {
  const parsed = z
    .object({
      email: z.string().trim().toLowerCase().pipe(z.email('Revisa tu correo.')),
      password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres.').max(128),
      name,
      slug,
    })
    .safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  const db = await createClient();
  if (!db) return { error: 'El servicio no está disponible por ahora.' };
  const { data, error } = await db.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: { data: { full_name: parsed.data.name, slug: parsed.data.slug } },
  });
  if (error) return { error: 'No pudimos crear la cuenta. Revisa tus datos o inicia sesión si ya tienes una.' };

  if (data.session) {
    const { error: e2 } = await db.rpc('register_enviajador', { p_slug: parsed.data.slug, p_name: parsed.data.name, p_bio: null });
    if (e2) return { error: friendlyError(e2.message) };
    redirect('/enviajador');
  }
  // Con confirmación de correo activa (respuesta idéntica exista o no la cuenta: sin enumeración).
  return { ok: 'Casi listo. Revisa tu correo para confirmar tu cuenta; después inicia sesión y completa tu perfil.' };
}

export async function completeProfile(_: RegState, form: FormData): Promise<RegState> {
  const parsed = z.object({ name, slug, bio: z.string().trim().max(500) }).safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  const db = await createClient();
  if (!db) return { error: 'El servicio no está disponible por ahora.' };
  const { error } = await db.rpc('register_enviajador', { p_slug: parsed.data.slug, p_name: parsed.data.name, p_bio: parsed.data.bio || null });
  if (error) return { error: friendlyError(error.message) };
  redirect('/enviajador');
}
