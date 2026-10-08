'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { friendlyError } from '@/lib/labels';
import { createClient } from '@/lib/supabase/server';

const id = z.uuid();
const back = (leadId: string, msg: string, ok = false) => redirect(`/equipe/leads/${leadId}?${ok ? 'ok' : 'err'}=${encodeURIComponent(msg)}`);

export async function changeStatus(form: FormData) {
  const leadId = id.parse(form.get('id'));
  const to = z.enum(['contact_attempt', 'in_service', 'proposal_sent', 'reserved', 'lost', 'cancelled']).safeParse(form.get('to'));
  if (!to.success) return back(leadId, 'Elige un estado.');
  const db = (await createClient())!;
  const { error } = await db.rpc('set_lead_status', { p_lead: leadId, p_to: to.data, p_reason: String(form.get('reason') ?? '') || null });
  revalidatePath(`/equipe/leads/${leadId}`);
  return back(leadId, error ? friendlyError(error.message) : 'Estado actualizado.', !error);
}

export async function addNote(form: FormData) {
  const leadId = id.parse(form.get('id'));
  const body = z.string().trim().min(1).max(2000).safeParse(form.get('body'));
  if (!body.success) return back(leadId, 'Escribe una nota.');
  const db = (await createClient())!;
  const { error } = await db.from('lead_notes').insert({ lead_id: leadId, body: body.data });
  revalidatePath(`/equipe/leads/${leadId}`);
  return back(leadId, error ? friendlyError(error.message) : 'Nota guardada.', !error);
}

export async function confirmSale(form: FormData) {
  const leadId = id.parse(form.get('id'));
  const parsed = z.object({ amount: z.coerce.number().min(0).max(10_000_000), currency: z.enum(['MXN', 'USD', 'EUR']) }).safeParse(Object.fromEntries(form));
  if (!parsed.success) return back(leadId, 'Revisa el monto y la moneda.');
  const db = (await createClient())!;
  const { error } = await db.rpc('confirm_sale', { p_lead: leadId, p_amount: parsed.data.amount, p_currency: parsed.data.currency });
  revalidatePath(`/equipe/leads/${leadId}`);
  return back(leadId, error ? friendlyError(error.message) : 'Venta confirmada. Si hay Enviajador atribuido, se generó su comisión.', !error);
}
