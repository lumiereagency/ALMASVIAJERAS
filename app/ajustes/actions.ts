'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

const sub = z.object({ endpoint: z.url().max(600), keys: z.object({ p256dh: z.string().max(200), auth: z.string().max(100) }) });

export async function savePush(input: unknown) {
  const p = sub.safeParse(input);
  if (!p.success) return { ok: false };
  const db = await createClient();
  const { error } = await db!.rpc('save_push_subscription', { p_endpoint: p.data.endpoint, p_p256dh: p.data.keys.p256dh, p_auth: p.data.keys.auth, p_ua: null });
  return { ok: !error };
}

export async function removePush(endpoint: string) {
  const db = await createClient();
  await db!.rpc('remove_push_subscription', { p_endpoint: String(endpoint).slice(0, 600) });
}

export async function markAllRead() {
  const db = await createClient();
  await db!.rpc('mark_notifications_read');
  revalidatePath('/', 'layout');
}
