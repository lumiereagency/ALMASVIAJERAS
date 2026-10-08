import { formatMoney } from '../catalog';
import { convert, type Currency, type FxRate } from '../money';
import { COMPANIONS, INTENTS, REGIONS } from './options';

const label = (list: readonly { value: string; label: string }[], v: string) => list.find((o) => o.value === v)?.label ?? v;
const days = (n: number) => (n === 1 ? '1 día' : `${n} días`);

export interface ExperienceCriteria {
  id: string;
  regions: string[];
  intents: string[];
  companions: string[];
  durationDays: number;
  pricePerPerson: number;
  currency: Currency;
}

export interface QuizAnswers {
  companion: string;
  intents: string[];
  /** Código da região ou 'open' para abertura de destino. */
  region: string;
  durationMin: number;
  durationMax: number;
  adults: number;
  minors: number;
  budgetTotal: number;
  currency: Currency;
}

export type Tier = 'primary' | 'alternative' | 'excluded';

export interface Recommendation {
  experienceId: string;
  tier: Tier;
  score: number;
  totalCost: number;
  currency: Currency;
  fxRate: number | null;
  fxRateDate: string | null;
  reasons: string[];
  warnings: string[];
}

/** Tolerâncias do MVP (documentadas em docs/recommendations.md). */
export const BUDGET_TOLERANCE = 0.15; // até 15% acima = alternativa com aviso; acima = excluída
export const DURATION_TOLERANCE_DAYS = 1; // até 1 dia fora = alternativa com aviso
/** Menores pagam o preço integral no MVP; ajustável quando houver regra comercial. */
export const MINOR_PRICE_FACTOR = 1;

export function rankExperiences(
  experiences: ExperienceCriteria[],
  a: QuizAnswers,
  rates: FxRate[],
  asOf: string,
): Recommendation[] {
  const people = a.adults + a.minors * MINOR_PRICE_FACTOR;
  if (a.adults < 1) throw new Error('Se necesita al menos 1 adulto');

  const out = experiences.map((e): Recommendation => {
    const reasons: string[] = [];
    const warnings: string[] = [];
    let excluded = false;
    let soft = false;
    let score = 0;

    const fx = convert(e.pricePerPerson * people, e.currency, a.currency, rates, asOf);
    const cost = fx.amount;

    // Orçamento
    if (cost <= a.budgetTotal) {
      reasons.push(`Cabe en tu presupuesto: ${formatMoney(cost, a.currency)} para ${a.adults + a.minors} ${a.adults + a.minors === 1 ? 'persona' : 'personas'}`);
      score += 15 * (0.5 + 0.5 * (cost / a.budgetTotal)); // aproveitar o orçamento pontua um pouco mais
    } else if (cost <= a.budgetTotal * (1 + BUDGET_TOLERANCE)) {
      soft = true;
      warnings.push(`Supera tu presupuesto por ${formatMoney(round(cost - a.budgetTotal), a.currency)}`);
    } else {
      excluded = true;
      warnings.push(`Excede tu presupuesto (${formatMoney(cost, a.currency)} frente a ${formatMoney(a.budgetTotal, a.currency)})`);
    }

    // Duração
    if (e.durationDays >= a.durationMin && e.durationDays <= a.durationMax) {
      reasons.push(`Dura ${days(e.durationDays)}, dentro de lo que buscas`);
      score += 10;
    } else {
      const gap = e.durationDays < a.durationMin ? a.durationMin - e.durationDays : e.durationDays - a.durationMax;
      if (gap <= DURATION_TOLERANCE_DAYS) {
        soft = true;
        warnings.push(`Dura ${days(e.durationDays)}: ${days(gap)} fuera del rango que elegiste`);
      } else {
        excluded = true;
        warnings.push(`Dura ${days(e.durationDays)}, fuera de tu rango de ${a.durationMin === a.durationMax ? days(a.durationMin) : `${a.durationMin} a ${a.durationMax} días`}`);
      }
    }

    // Intenções
    const overlap = a.intents.filter((i) => e.intents.includes(i));
    if (overlap.length) {
      reasons.push(`Combina con lo que quieres vivir: ${overlap.map((i) => label(INTENTS, i)).join(' y ').toLowerCase()}`);
      score += 40 * (overlap.length / a.intents.length);
    } else {
      soft = true;
      warnings.push('No coincide con lo que quieres vivir');
    }

    // Região
    if (a.region === 'open') score += 10;
    else if (e.regions.includes(a.region)) {
      reasons.push(`Está en la región que elegiste: ${label(REGIONS, a.region)}`);
      score += 20;
    } else {
      soft = true;
      warnings.push(`Está fuera de la región que elegiste (${label(REGIONS, a.region)})`);
    }

    // Companhia
    if (e.companions.includes(a.companion)) {
      reasons.push(`Pensada para viajar ${label(COMPANIONS, a.companion).toLowerCase()}`);
      score += 15;
    }

    const tier: Tier = excluded ? 'excluded' : soft ? 'alternative' : 'primary';
    return {
      experienceId: e.id,
      tier,
      score: round(score),
      totalCost: cost,
      currency: a.currency,
      fxRate: fx.rate,
      fxRateDate: fx.rateDate,
      reasons,
      warnings,
    };
  });

  const order: Record<Tier, number> = { primary: 0, alternative: 1, excluded: 2 };
  return out.sort(
    (x, y) => order[x.tier] - order[y.tier] || y.score - x.score || x.experienceId.localeCompare(y.experienceId),
  );
}

const round = (n: number) => Math.round(n * 100) / 100;
