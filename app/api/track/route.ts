import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase/admin';
import { EVENT_NAMES } from '@/lib/track';

export const dynamic = 'force-dynamic';

const schema = z.object({
  name: z.enum(EVENT_NAMES),
  visitorId: z.string().min(1).max(64),
  // Apenas escalares curtos: impede que o cliente grave texto livre/PII por engano.
  props: z.record(z.string().max(40), z.union([z.string().max(60), z.number(), z.boolean()])).refine((o) => Object.keys(o).length <= 12),
});

export async function POST(request: Request) {
  const raw = await request.text();
  if (raw.length > 2048) return new Response(null, { status: 413 });
  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    return new Response(null, { status: 400 });
  }
  const parsed = schema.safeParse(json);
  if (!parsed.success) return new Response(null, { status: 400 });

  const db = createAdminClient();
  if (db) {
    const { name, visitorId, props } = parsed.data;
    await db.from('analytics_events').insert({ name, visitor_id: visitorId, props });
  }
  return new Response(null, { status: 204 });
}
