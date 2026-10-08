import { getSession } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

const esc = (v: unknown) => {
  let s = String(v ?? '');
  if (/^[=+\-@]/.test(s)) s = `'${s}`; // evita injeção de fórmulas ao abrir no Excel
  return `"${s.replace(/"/g, '""')}"`;
};

export async function GET(request: Request) {
  const session = await getSession();
  if (!session?.roles.includes('admin')) return new Response('Forbidden', { status: 403 });
  const cur = new URL(request.url).searchParams.get('cur') ?? 'USD';
  const db = (await createClient())!;
  const { data } = await db
    .from('sales')
    .select('id, amount, currency, confirmed_at, leads(full_name), experiences(title)')
    .eq('currency', ['USD', 'MXN', 'EUR'].includes(cur) ? cur : 'USD')
    .order('confirmed_at', { ascending: false })
    .limit(5000);
  const rows = (data ?? []) as unknown as { id: string; amount: number; currency: string; confirmed_at: string; leads: { full_name: string } | null; experiences: { title: string } | null }[];
  const csv = ['id,fecha,cliente,experiencia,monto,moneda', ...rows.map((r) => [r.id, r.confirmed_at, r.leads?.full_name, r.experiences?.title, r.amount, r.currency].map(esc).join(','))].join('\n');
  return new Response('﻿' + csv, { headers: { 'content-type': 'text/csv; charset=utf-8', 'content-disposition': `attachment; filename="ventas-${cur}.csv"` } });
}
