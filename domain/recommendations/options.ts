import { z } from 'zod';
import { CURRENCIES, type Currency } from '../money';
import type { QuizAnswers } from './rank';

/** Opções do Alma Nawi: fonte única para UI, validação e ranking. */
export const COMPANIONS = [
  { value: 'solo', label: 'Solo/a', hint: 'Un viaje contigo' },
  { value: 'pareja', label: 'En pareja', hint: 'Para compartir y celebrar' },
  { value: 'amigos', label: 'Con amigos', hint: 'Risas, planes y recuerdos' },
  { value: 'familia', label: 'En familia', hint: 'Todos disfrutan' },
] as const;

export const INTENTS = [
  { value: 'descanso', label: 'Descansar', hint: 'Desconectar, respirar y recargar' },
  { value: 'descubrir', label: 'Descubrir', hint: 'Cultura, historia y asombro' },
  { value: 'conexion', label: 'Conectar', hint: 'Personas, comunidad y momentos reales' },
  { value: 'aventura', label: 'Vivir aventura', hint: 'Agua, naturaleza y adrenalina' },
] as const;

export const REGIONS = [
  { value: 'caribe-mexicano', label: 'Caribe Mexicano', hint: 'Bacalar, Holbox, Tulum, Cozumel…' },
  { value: 'yucatan', label: 'Yucatán', hint: 'Chichén Itzá, Las Coloradas…' },
  { value: 'otro', label: 'Otro destino', hint: 'México o el mundo: lo diseñamos contigo' },
  { value: 'open', label: 'Me abro a sugerencias', hint: 'Sorpréndeme' },
] as const;

export const DURATIONS = [
  { value: '1', label: 'Un día', hint: 'Una escapada', min: 1, max: 1 },
  { value: '2-4', label: '2 a 4 días', hint: 'Fin de semana largo', min: 2, max: 4 },
  { value: '5-8', label: '5 a 8 días', hint: 'Una semana', min: 5, max: 8 },
  { value: '9+', label: '9 días o más', hint: 'Un viaje profundo', min: 9, max: 60 },
] as const;

export const BUDGET_PRESETS: Record<Currency, number[]> = {
  USD: [300, 800, 1500, 3000],
  MXN: [5000, 15000, 30000, 60000],
  EUR: [300, 800, 1500, 3000],
};

const values = <T extends readonly { value: string }[]>(o: T) => o.map((x) => x.value) as [T[number]['value'], ...T[number]['value'][]];

export const answersSchema = z.object({
  c: z.enum(values(COMPANIONS)),
  i: z.array(z.enum(values(INTENTS))).min(1).max(2),
  r: z.enum(values(REGIONS)),
  d: z.enum(values(DURATIONS)),
  a: z.coerce.number().int().min(1).max(12),
  m: z.coerce.number().int().min(0).max(12),
  b: z.coerce.number().min(50).max(1_000_000),
  cur: z.enum(CURRENCIES),
});
export type Answers = z.infer<typeof answersSchema>;

export function serializeAnswers(a: Answers): string {
  const p = new URLSearchParams({ c: a.c, i: a.i.join(','), r: a.r, d: a.d, a: String(a.a), m: String(a.m), b: String(a.b), cur: a.cur });
  return p.toString();
}

export function parseAnswers(sp: Record<string, string | string[] | undefined> | URLSearchParams): Answers | null {
  const get = (k: string) => {
    const v = sp instanceof URLSearchParams ? sp.get(k) : sp[k];
    return Array.isArray(v) ? v[0] : (v ?? undefined);
  };
  const parsed = answersSchema.safeParse({
    c: get('c'),
    i: get('i')?.split(',').filter(Boolean),
    r: get('r'),
    d: get('d'),
    a: get('a'),
    m: get('m'),
    b: get('b'),
    cur: get('cur'),
  });
  return parsed.success ? parsed.data : null;
}

export function toQuizAnswers(a: Answers): QuizAnswers {
  const dur = DURATIONS.find((d) => d.value === a.d)!;
  return {
    companion: a.c,
    intents: a.i,
    region: a.r,
    durationMin: dur.min,
    durationMax: dur.max,
    adults: a.a,
    minors: a.m,
    budgetTotal: a.b,
    currency: a.cur,
  };
}
