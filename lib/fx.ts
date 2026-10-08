import type { Currency, FxRate } from '@/domain/money';
import { createClient } from '@/lib/supabase/server';

/**
 * Taxas de referência usadas só quando o banco não está configurado (desenvolvimento).
 * VALORES ILUSTRATIVOS: o administrador cadastra as taxas reais em `fx_rates` (com data).
 */
export const FALLBACK_RATES: FxRate[] = [
  { from: 'USD', to: 'MXN', rate: 18, effectiveOn: '2026-10-08' },
  { from: 'EUR', to: 'USD', rate: 1.08, effectiveOn: '2026-10-08' },
];

export async function getRates(): Promise<{ rates: FxRate[]; reference: boolean }> {
  const supabase = await createClient();
  if (!supabase) return { rates: FALLBACK_RATES, reference: true };
  const { data, error } = await supabase.from('fx_rates').select('from_currency, to_currency, rate, effective_on');
  if (error || !data?.length) return { rates: FALLBACK_RATES, reference: true };
  return {
    rates: data.map((r) => ({ from: r.from_currency as Currency, to: r.to_currency as Currency, rate: Number(r.rate), effectiveOn: r.effective_on as string })),
    reference: false,
  };
}
