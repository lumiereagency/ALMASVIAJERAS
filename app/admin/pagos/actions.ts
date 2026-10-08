'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { friendlyError } from '@/lib/labels';
import { createClient } from '@/lib/supabase/server';

const back = (msg: string, ok: boolean) => redirect(`/admin/pagos?${ok ? 'ok' : 'err'}=${encodeURIComponent(msg)}`);
const PAY_ERRORS: Record<string, string> = {
  provider_disabled: 'Ese método de cobro está desactivado.',
  exceeds_balance: 'El monto supera el saldo pendiente de la venta.',
  invalid_mode: 'Modo inválido.',
};
const msgOf = (m: string) => PAY_ERRORS[Object.keys(PAY_ERRORS).find((k) => m.includes(k)) ?? ''] ?? friendlyError(m);

export async function createPayment(form: FormData) {
  const p = z.object({ sale: z.uuid(), amount: z.coerce.number().positive().max(10_000_000), provider: z.enum(['manual', 'stripe', 'mercadopago', 'paypal']), method: z.string().max(40).optional() }).safeParse(Object.fromEntries(form));
  if (!p.success) return back('Revisa los datos del cobro.', false);
  const db = (await createClient())!;
  const { error } = await db.rpc('create_payment', { p_sale: p.data.sale, p_amount: p.data.amount, p_provider: p.data.provider, p_method: p.data.method || null });
  revalidatePath('/admin/pagos');
  return back(error ? msgOf(error.message) : 'Cobro registrado como pendiente.', !error);
}

export async function setPaymentStatus(form: FormData) {
  const p = z.object({ id: z.uuid(), to: z.enum(['paid', 'failed', 'cancelled', 'refunded']), ref: z.string().max(80).optional() }).safeParse(Object.fromEntries(form));
  if (!p.success) return back('Datos inválidos.', false);
  const db = (await createClient())!;
  const { error } = await db.rpc('set_payment_status', { p_id: p.data.id, p_to: p.data.to, p_ref: p.data.ref || null });
  revalidatePath('/admin/pagos');
  return back(error ? msgOf(error.message) : 'Cobro actualizado.', !error);
}

export async function setProvider(form: FormData) {
  const p = z.object({ provider: z.enum(['manual', 'stripe', 'mercadopago', 'paypal']), mode: z.enum(['test', 'live']) }).safeParse(Object.fromEntries(form));
  if (!p.success) return back('Datos inválidos.', false);
  const db = (await createClient())!;
  const { error } = await db.rpc('set_payment_provider', { p_provider: p.data.provider, p_enabled: form.get('enabled') === 'on', p_mode: p.data.mode });
  revalidatePath('/admin/pagos');
  return back(error ? msgOf(error.message) : 'Método de cobro actualizado.', !error);
}
