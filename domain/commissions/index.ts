import { round2, type Currency } from '../money';

export const COMMISSION_STATUSES = [
  'estimated',
  'awaiting_confirmation',
  'approved',
  'scheduled',
  'paid',
  'cancelled',
  'disputed',
] as const;
export type CommissionStatus = (typeof COMMISSION_STATUSES)[number];

export interface CommissionRule {
  id: string;
  kind: 'percent' | 'fixed';
  /** percent: 0-100. fixed: valor na moeda da regra. */
  value: number;
  currency: Currency;
  /** Especificidade: experiência > categoria > global. */
  scope: 'experience' | 'category' | 'global';
  experienceId?: string;
  category?: string;
  active: boolean;
}

export interface CommissionCalc {
  ruleId: string;
  eligibleAmount: number;
  commission: number;
  currency: Currency;
}

export function pickRule(rules: CommissionRule[], experienceId: string, category?: string): CommissionRule | null {
  const active = rules.filter((r) => r.active);
  return (
    active.find((r) => r.scope === 'experience' && r.experienceId === experienceId) ??
    active.find((r) => r.scope === 'category' && category !== undefined && r.category === category) ??
    active.find((r) => r.scope === 'global') ??
    null
  );
}

/** Calcula só no servidor. Fixed exige que a moeda da venda seja a da regra. */
export function calculateCommission(rule: CommissionRule, eligibleAmount: number, saleCurrency: Currency): CommissionCalc {
  if (eligibleAmount < 0) throw new Error('Valor elegível negativo');
  if (rule.kind === 'percent') {
    if (rule.value < 0 || rule.value > 100) throw new Error('Percentual inválido');
    return { ruleId: rule.id, eligibleAmount, commission: round2((eligibleAmount * rule.value) / 100), currency: saleCurrency };
  }
  if (rule.currency !== saleCurrency) throw new Error('Moeda da regra fixa difere da moeda da venda');
  return { ruleId: rule.id, eligibleAmount, commission: round2(rule.value), currency: rule.currency };
}

const T: Record<CommissionStatus, CommissionStatus[]> = {
  estimated: ['awaiting_confirmation', 'cancelled'],
  awaiting_confirmation: ['approved', 'cancelled', 'disputed'],
  approved: ['scheduled', 'cancelled', 'disputed'],
  scheduled: ['paid', 'cancelled', 'disputed'],
  paid: ['disputed'],
  cancelled: [],
  disputed: ['approved', 'cancelled'],
};

export const canTransitionCommission = (from: CommissionStatus, to: CommissionStatus) => T[from].includes(to);
