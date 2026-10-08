import { convert, type Currency, type FxRate } from '../money';

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
  if (a.adults < 1) throw new Error('É necessário ao menos 1 adulto');

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
      reasons.push(`Cabe no orçamento: ${cost} ${a.currency} para ${a.adults + a.minors} pessoa(s)`);
      score += 15 * (0.5 + 0.5 * (cost / a.budgetTotal)); // aproveitar o orçamento pontua um pouco mais
    } else if (cost <= a.budgetTotal * (1 + BUDGET_TOLERANCE)) {
      soft = true;
      warnings.push(`Acima do orçamento em ${round(cost - a.budgetTotal)} ${a.currency}`);
    } else {
      excluded = true;
      warnings.push(`Excede o orçamento (${cost} ${a.currency} > ${a.budgetTotal} ${a.currency})`);
    }

    // Duração
    if (e.durationDays >= a.durationMin && e.durationDays <= a.durationMax) {
      reasons.push(`Duração de ${e.durationDays} dias dentro do desejado`);
      score += 10;
    } else {
      const gap = e.durationDays < a.durationMin ? a.durationMin - e.durationDays : e.durationDays - a.durationMax;
      if (gap <= DURATION_TOLERANCE_DAYS) {
        soft = true;
        warnings.push(`Duração de ${e.durationDays} dias fica ${gap} dia fora do intervalo escolhido`);
      } else {
        excluded = true;
        warnings.push(`Duração de ${e.durationDays} dias incompatível com ${a.durationMin}-${a.durationMax}`);
      }
    }

    // Intenções
    const overlap = a.intents.filter((i) => e.intents.includes(i));
    if (overlap.length) {
      reasons.push(`Combina com: ${overlap.join(', ')}`);
      score += 40 * (overlap.length / a.intents.length);
    }

    // Região
    if (a.region === 'open') score += 10;
    else if (e.regions.includes(a.region)) {
      reasons.push(`Destino na região escolhida (${a.region})`);
      score += 20;
    } else {
      soft = true;
      warnings.push(`Fora da região escolhida (${a.region})`);
    }

    // Companhia
    if (e.companions.includes(a.companion)) {
      reasons.push(`Indicada para viajar ${a.companion}`);
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
