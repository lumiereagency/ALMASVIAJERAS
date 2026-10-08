import { describe, expect, it } from 'vitest';
import { convert, type FxRate } from '@/domain/money';
import { rankExperiences, type ExperienceCriteria, type QuizAnswers } from '@/domain/recommendations/rank';
import { resolveAttribution, signRef, verifyRef } from '@/domain/attribution';
import { validateTransition } from '@/domain/leads/transitions';
import { calculateCommission, canTransitionCommission, pickRule, type CommissionRule } from '@/domain/commissions';

const rates: FxRate[] = [
  { from: 'USD', to: 'MXN', rate: 17, effectiveOn: '2026-09-01' },
  { from: 'USD', to: 'MXN', rate: 20, effectiveOn: '2026-10-01' },
];

describe('money.convert', () => {
  it('usa a taxa mais recente vigente na data', () => {
    expect(convert(100, 'USD', 'MXN', rates, '2026-10-05').amount).toBe(2000);
    expect(convert(100, 'USD', 'MXN', rates, '2026-09-15').amount).toBe(1700);
  });
  it('aceita taxa inversa e registra taxa e data', () => {
    const c = convert(2000, 'MXN', 'USD', rates, '2026-10-05');
    expect(c.amount).toBe(100);
    expect(c.rateDate).toBe('2026-10-01');
  });
  it('mesma moeda não converte', () => {
    expect(convert(50, 'MXN', 'MXN', [], '2026-10-05').rate).toBeNull();
  });
  it('sem taxa lança erro, nunca assume 1:1', () => {
    expect(() => convert(1, 'EUR', 'MXN', rates, '2026-10-05')).toThrow();
    expect(() => convert(1, 'USD', 'MXN', rates, '2026-01-01')).toThrow();
  });
});

const exp = (o: Partial<ExperienceCriteria> & { id: string }): ExperienceCriteria => ({
  regions: ['oaxaca'], intents: ['descanso'], companions: ['pareja'],
  durationDays: 5, pricePerPerson: 10000, currency: 'MXN', ...o,
});
const ans: QuizAnswers = {
  companion: 'pareja', intents: ['descanso'], region: 'oaxaca',
  durationMin: 4, durationMax: 6, adults: 2, minors: 0, budgetTotal: 25000, currency: 'MXN',
};

describe('rankExperiences', () => {
  it('compatível em tudo é primária e explica o motivo', () => {
    const [r] = rankExperiences([exp({ id: 'a' })], ans, [], '2026-10-08');
    expect(r!.tier).toBe('primary');
    expect(r!.reasons.length).toBeGreaterThan(0);
  });
  it('orçamento considera número de pessoas', () => {
    const [r] = rankExperiences([exp({ id: 'a' })], { ...ans, adults: 2, minors: 2 }, [], '2026-10-08');
    expect(r!.totalCost).toBe(40000);
    expect(r!.tier).toBe('excluded');
  });
  it('levemente acima do orçamento vira alternativa com aviso, nunca primária', () => {
    const [r] = rankExperiences([exp({ id: 'a', pricePerPerson: 13000 })], ans, [], '2026-10-08');
    expect(r!.tier).toBe('alternative');
    expect(r!.warnings.length).toBeGreaterThan(0);
  });
  it('duração incompatível é excluída; 1 dia fora é alternativa', () => {
    const out = rankExperiences([exp({ id: 'long', durationDays: 12 }), exp({ id: 'near', durationDays: 7 })], ans, [], '2026-10-08');
    expect(out.find((r) => r.experienceId === 'long')!.tier).toBe('excluded');
    expect(out.find((r) => r.experienceId === 'near')!.tier).toBe('alternative');
  });
  it('converte moedas diferentes registrando taxa', () => {
    const [r] = rankExperiences([exp({ id: 'u', pricePerPerson: 500, currency: 'USD' })], ans, rates, '2026-10-08');
    expect(r!.totalCost).toBe(20000);
    expect(r!.fxRate).toBe(20);
    expect(r!.tier).toBe('primary');
  });
  it('primárias vêm antes de alternativas e excluídas', () => {
    const out = rankExperiences(
      [exp({ id: 'x', durationDays: 20 }), exp({ id: 'y', pricePerPerson: 13000 }), exp({ id: 'z' })],
      ans, [], '2026-10-08',
    );
    expect(out.map((r) => r.experienceId)).toEqual(['z', 'y', 'x']);
  });
});

describe('atribuição', () => {
  const now = new Date('2026-10-08T12:00:00Z');
  it('assina e verifica; rejeita adulteração e expiração', () => {
    const t = signRef('maria', 's3cret', now);
    expect(verifyRef(t, 's3cret', now, 30)?.slug).toBe('maria');
    expect(verifyRef(t, 'outro', now, 30)).toBeNull();
    expect(verifyRef(t.replace(/.$/, 'x'), 's3cret', now, 30)).toBeNull();
    expect(verifyRef(t, 's3cret', new Date('2026-12-01T00:00:00Z'), 30)).toBeNull();
  });
  it('vence o último toque válido na janela; guarda o primeiro', () => {
    const s = resolveAttribution(
      [
        { enviajadorId: 'A', at: '2026-08-01T00:00:00Z' }, // fora da janela
        { enviajadorId: 'B', at: '2026-09-20T00:00:00Z' },
        { enviajadorId: 'C', at: '2026-10-05T00:00:00Z' },
      ],
      now,
    );
    expect(s.first?.enviajadorId).toBe('B');
    expect(s.winner?.enviajadorId).toBe('C');
  });
  it('ignora autovisita e toques posteriores ao lead', () => {
    const s = resolveAttribution(
      [
        { enviajadorId: 'B', at: '2026-10-01T00:00:00Z' },
        { enviajadorId: 'ADMIN', at: '2026-10-06T00:00:00Z' },
        { enviajadorId: 'D', at: '2026-10-09T00:00:00Z' },
      ],
      now, 30, ['ADMIN'],
    );
    expect(s.winner?.enviajadorId).toBe('B');
  });
  it('sem toques não há vencedor', () => {
    expect(resolveAttribution([], now).winner).toBeNull();
  });
});

describe('funil', () => {
  it('bloqueia saltos e exige motivo de perda', () => {
    expect(validateTransition('new', 'sale_confirmed')).not.toBeNull();
    expect(validateTransition('in_service', 'lost')).toMatch(/Motivo/);
    expect(validateTransition('in_service', 'lost', 'sem orçamento')).toBeNull();
    expect(validateTransition('cancelled', 'in_service')).not.toBeNull();
  });
});

describe('comissões', () => {
  const rules: CommissionRule[] = [
    { id: 'g', kind: 'percent', value: 5, currency: 'MXN', scope: 'global', active: true },
    { id: 'c', kind: 'percent', value: 8, currency: 'MXN', scope: 'category', category: 'grupal', active: true },
    { id: 'e', kind: 'fixed', value: 500, currency: 'MXN', scope: 'experience', experienceId: 'x1', active: true },
  ];
  it('prioriza experiência > categoria > global e ignora inativas', () => {
    expect(pickRule(rules, 'x1', 'grupal')!.id).toBe('e');
    expect(pickRule(rules, 'x2', 'grupal')!.id).toBe('c');
    expect(pickRule(rules, 'x2', 'otra')!.id).toBe('g');
    expect(pickRule(rules.map((r) => ({ ...r, active: false })), 'x1')).toBeNull();
  });
  it('calcula percentual e fixo com arredondamento', () => {
    expect(calculateCommission(rules[0]!, 12345.67, 'MXN').commission).toBe(617.28);
    expect(calculateCommission(rules[2]!, 99999, 'MXN').commission).toBe(500);
  });
  it('fixo em moeda diferente é rejeitado', () => {
    expect(() => calculateCommission(rules[2]!, 100, 'USD')).toThrow();
  });
  it('estados: paga não volta a aprovada; cancelada é terminal', () => {
    expect(canTransitionCommission('paid', 'approved')).toBe(false);
    expect(canTransitionCommission('cancelled', 'approved')).toBe(false);
    expect(canTransitionCommission('approved', 'scheduled')).toBe(true);
  });
});
