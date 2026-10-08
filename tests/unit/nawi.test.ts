import { describe, expect, it } from 'vitest';
import { answersSchema, parseAnswers, serializeAnswers, toQuizAnswers } from '@/domain/recommendations/options';
import { rankExperiences, type ExperienceCriteria } from '@/domain/recommendations/rank';
import { SEED_EXPERIENCES } from '@/content/catalog-seed';
import { FALLBACK_RATES } from '@/lib/fx';

const ok = { c: 'pareja', i: ['descanso', 'conexion'], r: 'caribe-mexicano', d: '1', a: 2, m: 1, b: 1500, cur: 'USD' } as const;

describe('Alma Nawi: respostas', () => {
  it('serializa e reconhece o mesmo conjunto de respostas (ida e volta)', () => {
    expect(parseAnswers(new URLSearchParams(serializeAnswers(answersSchema.parse(ok))))).toEqual(ok);
  });
  it('rejeita valores fora do permitido', () => {
    expect(parseAnswers(new URLSearchParams('c=alien&i=x&r=y&d=z&a=0&m=0&b=1&cur=BRL'))).toBeNull();
    expect(parseAnswers(new URLSearchParams('c=solo&i=descanso,conexion,aventura&r=open&d=1&a=1&m=0&b=500&cur=USD'))).toBeNull();
  });
  it('converte duração em intervalo e mantém a moeda', () => {
    const q = toQuizAnswers(answersSchema.parse(ok));
    expect([q.durationMin, q.durationMax, q.currency, q.adults, q.minors]).toEqual([1, 1, 'USD', 2, 1]);
  });
});

describe('Alma Nawi: ranking com o catálogo real', () => {
  const criteria: ExperienceCriteria[] = SEED_EXPERIENCES.map((e) => ({
    id: e.slug, regions: e.regions, intents: e.intents, companions: e.companions,
    durationDays: e.durationDays, pricePerPerson: e.price.amount, currency: e.price.currency,
  }));
  const run = (over: Record<string, unknown> = {}) =>
    rankExperiences(criteria, toQuizAnswers(answersSchema.parse({ ...ok, ...over })), FALLBACK_RATES, '2026-10-08');

  it('sem intenção em comum a experiência nunca é principal', () => {
    const e: ExperienceCriteria = { id: 'x', regions: ['caribe-mexicano'], intents: ['aventura'], companions: ['pareja'], durationDays: 1, pricePerPerson: 100, currency: 'USD' };
    const [r] = rankExperiences([e], { ...toQuizAnswers(answersSchema.parse(ok)), intents: ['descanso'] }, [], '2026-10-08');
    expect(r!.tier).toBe('alternative');
    expect(r!.warnings.join(' ')).toMatch(/No coincide/);
  });
  it('casal com US$4.000: toda recomendação principal cabe no orçamento', () => {
    const primaries = run({ a: 2, m: 0, b: 4000 }).filter((r) => r.tier === 'primary');
    expect(primaries.length).toBeGreaterThan(0);
    for (const p of primaries) expect(p.totalCost).toBeLessThanOrEqual(4000);
  });
  it('orçamento baixo exclui as caras (Xcaret não é principal com US$300)', () => {
    const x = run({ b: 300 }).find((r) => r.experienceId === 'xcaret')!;
    expect(x.tier).toBe('excluded');
  });
  it('duração de 5 a 8 dias exclui todos os tours de 1 dia (nada principal nem alternativo)', () => {
    const r = run({ d: '5-8' });
    expect(r.every((x) => x.tier === 'excluded')).toBe(true);
  });
  it('moeda MXN converte com taxa registrada', () => {
    const r = run({ cur: 'MXN', b: 60000 }).find((x) => x.experienceId === 'bacalar')!;
    expect(r.fxRate).toBe(18);
    expect(r.currency).toBe('MXN');
  });
  it('os motivos estão em espanhol e usam nomes legíveis, nunca códigos internos', () => {
    const text = run({ a: 2, m: 0, b: 4000 }).flatMap((r) => [...r.reasons, ...r.warnings]).join(' | ');
    expect(text).not.toMatch(/caribe-mexicano|conexion|orçamento|Duração|região/);
    expect(text).toMatch(/Cabe en tu presupuesto/);
    expect(text).toMatch(/Dura 1 día/);
  });
  it('resultado é determinístico', () => {
    expect(run()).toEqual(run());
  });
});
