'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { friendlyError } from '@/lib/labels';
import { createClient } from '@/lib/supabase/server';

const go = (path: string, msg: string, ok: boolean) => redirect(`${path}?${ok ? 'ok' : 'err'}=${encodeURIComponent(msg)}`);

export async function setEnviajadorStatus(form: FormData) {
  const p = z.object({ id: z.uuid(), status: z.enum(['pending', 'active', 'suspended']) }).safeParse(Object.fromEntries(form));
  if (!p.success) return go('/admin/enviajadores', 'Datos inválidos.', false);
  const db = (await createClient())!;
  const { error } = await db.rpc('set_enviajador_status', { p_id: p.data.id, p_status: p.data.status });
  revalidatePath('/admin/enviajadores');
  return go('/admin/enviajadores', error ? friendlyError(error.message) : 'Enviajador actualizado.', !error);
}

export async function setCommissionStatus(form: FormData) {
  const p = z
    .object({ id: z.uuid(), to: z.enum(['awaiting_confirmation', 'approved', 'scheduled', 'paid', 'cancelled', 'disputed']), reason: z.string().max(300).optional() })
    .safeParse(Object.fromEntries(form));
  if (!p.success) return go('/admin/comisiones', 'Datos inválidos.', false);
  const db = (await createClient())!;
  const { error } = await db.rpc('set_commission_status', { p_id: p.data.id, p_to: p.data.to, p_reason: p.data.reason || null });
  revalidatePath('/admin/comisiones');
  return go('/admin/comisiones', error ? friendlyError(error.message) : 'Comisión actualizada.', !error);
}

export async function adjustCommission(form: FormData) {
  const p = z.object({ id: z.uuid(), delta: z.coerce.number().min(-1_000_000).max(1_000_000), reason: z.string().trim().min(1, 'Indica el motivo.').max(300) }).safeParse(Object.fromEntries(form));
  if (!p.success) return go('/admin/comisiones', p.error.issues[0]?.message ?? 'Datos inválidos.', false);
  const db = (await createClient())!;
  const { error } = await db.rpc('adjust_commission', { p_id: p.data.id, p_delta: p.data.delta, p_reason: p.data.reason });
  revalidatePath('/admin/comisiones');
  return go('/admin/comisiones', error ? friendlyError(error.message) : 'Ajuste registrado.', !error);
}

export async function grantRole(form: FormData) {
  const p = z.object({ email: z.string().trim().toLowerCase().pipe(z.email('Revisa el correo.')), role: z.enum(['staff', 'admin', 'enviajador', 'traveler']) }).safeParse(Object.fromEntries(form));
  if (!p.success) return go('/admin/usuarios', p.error.issues[0]?.message ?? 'Datos inválidos.', false);
  const db = (await createClient())!;
  const { error } = await db.rpc('grant_role_by_email', { p_email: p.data.email, p_role: p.data.role });
  revalidatePath('/admin/usuarios');
  return go('/admin/usuarios', error ? friendlyError(error.message) : 'Rol asignado.', !error);
}
