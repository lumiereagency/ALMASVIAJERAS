'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { parseAnswers } from '@/domain/recommendations/options';
import { POLICY_VERSION } from '@/lib/legal';
import { createAnonClient } from '@/lib/supabase/anon';

export interface LeadState {
  error?: string;
  fields?: Record<string, string>;
}

const schema = z.object({
  name: z.string().trim().min(2, 'Escribe tu nombre.').max(120),
  phone: z.string().trim().regex(/^[+\d][\d\s().-]{7,20}$/, 'Revisa tu número de WhatsApp (con código de país).'),
  email: z.union([z.literal(''), z.email('Revisa tu correo.')]),
  country: z.string().trim().max(60),
  city: z.string().trim().max(60),
  consent: z.literal('on', 'Necesitamos tu autorización para contactarte.'),
});

const RPC_ERRORS: Record<string, string> = {
  invalid_name: 'Escribe tu nombre completo.',
  invalid_phone: 'Revisa tu número de WhatsApp (con código de país).',
  invalid_email: 'Revisa tu correo.',
  consent_required: 'Necesitamos tu autorización para contactarte.',
  rate_limited: 'Recibimos varias solicitudes seguidas. Inténtalo de nuevo en una hora.',
};

export async function createLead(_: LeadState, form: FormData): Promise<LeadState> {
  const get = (k: string) => String(form.get(k) ?? '');
  const fields = { name: get('name'), phone: get('phone'), email: get('email'), country: get('country'), city: get('city') };
  const exp = get('exp').slice(0, 80);

  // Honeypot: los bots rellenan este campo; fingimos éxito sin guardar nada.
  if (get('website')) redirect('/contacto/gracias');

  const parsed = schema.safeParse({ ...fields, consent: get('consent') });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Revisa los datos.', fields };

  const db = createAnonClient();
  if (!db) return { error: 'El servicio no está disponible por ahora. Inténtalo más tarde.', fields };

  const jar = await cookies();
  const quiz = parseAnswers(new URLSearchParams(get('quiz')));
  const { data, error } = await db.rpc('create_lead', {
    p_name: parsed.data.name,
    p_phone: parsed.data.phone,
    p_email: parsed.data.email || null,
    p_country: parsed.data.country || null,
    p_city: parsed.data.city || null,
    p_experience_slug: exp || null,
    p_quiz: quiz,
    p_source: get('src') || 'web',
    p_visitor: jar.get('av_vid')?.value ?? null,
    p_ref: jar.get('av_ref')?.value ?? null,
    p_policy_version: POLICY_VERSION,
    p_marketing: get('marketing') === 'on',
  });
  if (error) {
    const key = Object.keys(RPC_ERRORS).find((k) => error.message.includes(k));
    return { error: key ? RPC_ERRORS[key] : 'No pudimos registrar tu solicitud. Inténtalo de nuevo.', fields };
  }
  const code = (data as { code: string }).code;
  redirect(`/contacto/gracias?code=${encodeURIComponent(code)}${exp ? `&exp=${encodeURIComponent(exp)}` : ''}`);
}
