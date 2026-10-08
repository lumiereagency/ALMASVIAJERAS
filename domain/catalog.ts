import type { Currency } from './money';

export interface PriceRow {
  amount: number;
  currency: Currency;
  validFrom: string; // YYYY-MM-DD
}

/** Preço vigente: o de maior valid_from não posterior a `asOf`. */
export function currentPrice(prices: PriceRow[], asOf: string): PriceRow | null {
  return prices.filter((p) => p.validFrom <= asOf).sort((a, b) => b.validFrom.localeCompare(a.validFrom))[0] ?? null;
}

const SYMBOL: Record<Currency, string> = { MXN: '$', USD: '$', EUR: '€' };

/** Moeda sempre explícita: "$18,900 MXN". */
export function formatMoney(amount: number, currency: Currency): string {
  const n = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(amount);
  return `${SYMBOL[currency]}${n} ${currency}`;
}

export const nightsLabel = (days: number): string => `${days} días · ${Math.max(days - 1, 0)} noches`;
