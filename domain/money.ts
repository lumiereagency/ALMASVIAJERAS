export const CURRENCIES = ['MXN', 'USD', 'EUR'] as const;
export type Currency = (typeof CURRENCIES)[number];

export interface FxRate {
  from: Currency;
  to: Currency;
  rate: number;
  /** ISO date (YYYY-MM-DD) a partir da qual a taxa vale. */
  effectiveOn: string;
}

export interface Conversion {
  amount: number;
  /** null quando não houve conversão (mesma moeda). */
  rate: number | null;
  rateDate: string | null;
}

export const round2 = (n: number): number => Math.round((n + Number.EPSILON) * 100) / 100;

/**
 * Converte usando a taxa mais recente com effectiveOn <= asOf.
 * Aceita taxa direta ou inversa. Lança erro se não houver taxa: nunca assume 1:1.
 */
export function convert(
  amount: number,
  from: Currency,
  to: Currency,
  rates: FxRate[],
  asOf: string,
): Conversion {
  if (from === to) return { amount: round2(amount), rate: null, rateDate: null };

  const valid = rates.filter((r) => r.effectiveOn <= asOf);
  const direct = valid
    .filter((r) => r.from === from && r.to === to)
    .sort((a, b) => b.effectiveOn.localeCompare(a.effectiveOn))[0];
  const inverse = valid
    .filter((r) => r.from === to && r.to === from)
    .sort((a, b) => b.effectiveOn.localeCompare(a.effectiveOn))[0];

  if (direct && (!inverse || direct.effectiveOn >= inverse.effectiveOn)) {
    return { amount: round2(amount * direct.rate), rate: direct.rate, rateDate: direct.effectiveOn };
  }
  if (inverse) {
    const rate = 1 / inverse.rate;
    return { amount: round2(amount * rate), rate, rateDate: inverse.effectiveOn };
  }
  throw new Error(`Sem taxa de câmbio ${from}->${to} válida em ${asOf}`);
}
