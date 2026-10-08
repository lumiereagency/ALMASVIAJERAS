'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Compass, Home, Heart, Minus, Palm, People, Pin, Plus, Sparkle, User, Waves, Mountain } from '@/components/ui/icons';
import { BUDGET_PRESETS, COMPANIONS, DURATIONS, INTENTS, REGIONS, serializeAnswers, type Answers } from '@/domain/recommendations/options';
import { formatMoney } from '@/domain/catalog';
import { CURRENCIES, type Currency } from '@/domain/money';
import { track } from '@/lib/track';

const TOTAL = 6;
const VISUALS = ['/photos/isla-mujeres.webp', '/photos/bacalar.webp', '/photos/tulum.webp', '/photos/holbox.webp', '/photos/cozumel.webp', '/photos/las-coloradas.webp'];

const COMPANION_ICON = { solo: User, pareja: Heart, amigos: People, familia: Home } as const;
const INTENT_ICON = { descanso: Palm, descubrir: Compass, conexion: People, aventura: Waves } as const;

type Draft = {
  c?: Answers['c'];
  i: Answers['i'];
  r?: Answers['r'];
  d?: Answers['d'];
  a: number;
  m: number;
  cur: Currency;
  b?: number;
};

const STEPS = [
  { title: '¿Con quién viajas?', sub: 'Así pensamos el ritmo y los espacios.' },
  { title: '¿Qué quieres vivir?', sub: 'Elige hasta dos. Alma Nawi buscará lo que te mueve.' },
  { title: '¿A dónde te imaginas?', sub: 'Una región o ninguna: tú decides qué tan abierto estás.' },
  { title: '¿Cuánto tiempo tienes?', sub: 'Buscamos experiencias que quepan en tu calendario.' },
  { title: '¿Cuántas personas viajan?', sub: 'Lo usamos para calcular el costo real del grupo.' },
  { title: '¿Cuál es tu presupuesto total?', sub: 'Para todo el grupo. Elige la moneda que prefieras.' },
] as const;

export function Quiz({ initial }: { initial?: Answers }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [d, setD] = useState<Draft>(
    initial ? { c: initial.c, i: initial.i, r: initial.r, d: initial.d, a: initial.a, m: initial.m, cur: initial.cur, b: initial.b } : { i: [], a: 2, m: 0, cur: 'USD' },
  );
  const [budgetText, setBudgetText] = useState(initial ? String(initial.b) : '');
  const heading = useRef<HTMLHeadingElement>(null);
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    track('quiz_started', initial ? { edit: true } : {});
  }, [initial]);
  useEffect(() => {
    heading.current?.focus({ preventScroll: true });
  }, [step]);
  useEffect(() => () => void (advanceTimer.current && clearTimeout(advanceTimer.current)), []);

  const people = d.a + d.m;
  const budget = d.b ?? 0;
  const valid = [!!d.c, d.i.length >= 1, !!d.r, !!d.d, d.a >= 1, budget >= 50][step]!;

  function next(draft: Draft = d) {
    track('quiz_step_completed', { step: step + 1 });
    if (step < TOTAL - 1) return setStep(step + 1);
    const done = draft as Required<Draft>;
    track('quiz_completed', { people: done.a + done.m, currency: done.cur });
    const answers: Answers = { c: done.c, i: done.i, r: done.r, d: done.d, a: done.a, m: done.m, b: done.b, cur: done.cur };
    router.push(`/alma-nawi/resultado?${serializeAnswers(answers)}`);
  }

  /** Escolha única: marca e avança suavemente (o botão Continuar segue disponível). */
  function pick(patch: Partial<Draft>) {
    setD((p) => ({ ...p, ...patch }));
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
    advanceTimer.current = setTimeout(() => {
      track('quiz_step_completed', { step: step + 1 });
      setStep((s) => Math.min(s + 1, TOTAL - 1));
    }, 320);
  }

  function toggleIntent(v: Answers['i'][number]) {
    setD((p) => ({ ...p, i: p.i.includes(v) ? p.i.filter((x) => x !== v) : p.i.length >= 2 ? [p.i[1]!, v] : [...p.i, v] }));
  }

  return (
    <div className="nawi">
      <div className="nawi__panel">
        <header className="nawi__top">
          <Link href="/" className="nawi__exit" aria-label="Salir del quiz">
            <ArrowLeft width={18} height={18} /> Salir
          </Link>
          <p className="nawi__count" aria-live="polite">
            Paso {step + 1} de {TOTAL}
          </p>
        </header>
        <div className="progress" role="progressbar" aria-valuemin={1} aria-valuemax={TOTAL} aria-valuenow={step + 1} aria-label="Progreso del quiz">
          <span style={{ width: `${((step + 1) / TOTAL) * 100}%` }} />
        </div>

        <section className="nawi__body" key={step} aria-labelledby="q-title">
          <p className="eyebrow nawi__brand">
            <Sparkle width={14} height={14} /> Alma Nawi
          </p>
          <h1 id="q-title" ref={heading} tabIndex={-1} className="display-md">
            {STEPS[step]!.title}
          </h1>
          <p className="lead">{STEPS[step]!.sub}</p>

          {step === 0 && (
            <div className="options" role="radiogroup" aria-labelledby="q-title">
              {COMPANIONS.map((o) => {
                const I = COMPANION_ICON[o.value];
                return (
                  <button key={o.value} type="button" role="radio" aria-checked={d.c === o.value} className="option" onClick={() => pick({ c: o.value })}>
                    <I width={26} height={26} />
                    <span className="option__label">{o.label}</span>
                    <span className="option__hint">{o.hint}</span>
                    <Check className="option__check" width={18} height={18} />
                  </button>
                );
              })}
            </div>
          )}

          {step === 1 && (
            <div className="options" role="group" aria-labelledby="q-title">
              {INTENTS.map((o) => {
                const I = INTENT_ICON[o.value];
                const on = d.i.includes(o.value);
                return (
                  <button key={o.value} type="button" aria-pressed={on} className="option" onClick={() => toggleIntent(o.value)}>
                    <I width={26} height={26} />
                    <span className="option__label">{o.label}</span>
                    <span className="option__hint">{o.hint}</span>
                    <Check className="option__check" width={18} height={18} />
                  </button>
                );
              })}
            </div>
          )}

          {step === 2 && (
            <div className="options" role="radiogroup" aria-labelledby="q-title">
              {REGIONS.map((o) => (
                <button key={o.value} type="button" role="radio" aria-checked={d.r === o.value} className="option" onClick={() => pick({ r: o.value })}>
                  {o.value === 'open' ? <Mountain width={26} height={26} /> : <Pin width={26} height={26} />}
                  <span className="option__label">{o.label}</span>
                  <span className="option__hint">{o.hint}</span>
                  <Check className="option__check" width={18} height={18} />
                </button>
              ))}
            </div>
          )}

          {step === 3 && (
            <div className="options" role="radiogroup" aria-labelledby="q-title">
              {DURATIONS.map((o) => (
                <button key={o.value} type="button" role="radio" aria-checked={d.d === o.value} className="option" onClick={() => pick({ d: o.value })}>
                  <span className="option__label option__label--xl">{o.label}</span>
                  <span className="option__hint">{o.hint}</span>
                  <Check className="option__check" width={18} height={18} />
                </button>
              ))}
            </div>
          )}

          {step === 4 && (
            <div className="steppers">
              <Stepper label="Adultos" hint="Desde 18 años" value={d.a} min={1} max={12} onChange={(a) => setD((p) => ({ ...p, a }))} />
              <Stepper label="Menores" hint="Hasta 17 años" value={d.m} min={0} max={12} onChange={(m) => setD((p) => ({ ...p, m }))} />
            </div>
          )}

          {step === 5 && (
            <div className="budget">
              <div className="segmented" role="radiogroup" aria-label="Moneda">
                {CURRENCIES.map((c) => (
                  <button
                    key={c}
                    type="button"
                    role="radio"
                    aria-checked={d.cur === c}
                    onClick={() => {
                      setD((p) => ({ ...p, cur: c, b: undefined }));
                      setBudgetText('');
                    }}
                  >
                    {c}
                  </button>
                ))}
              </div>
              <div className="chips">
                {BUDGET_PRESETS[d.cur].map((v) => (
                  <button
                    key={v}
                    type="button"
                    className="chip"
                    aria-pressed={d.b === v}
                    onClick={() => {
                      setD((p) => ({ ...p, b: v }));
                      setBudgetText(String(v));
                    }}
                  >
                    {formatMoney(v, d.cur)}
                  </button>
                ))}
              </div>
              <div className="field">
                <label htmlFor="budget">Presupuesto total del grupo ({d.cur})</label>
                <input
                  id="budget"
                  inputMode="numeric"
                  autoComplete="off"
                  value={budgetText}
                  placeholder="Por ejemplo, 1500"
                  onChange={(e) => {
                    const t = e.target.value.replace(/[^\d]/g, '').slice(0, 7);
                    setBudgetText(t);
                    setD((p) => ({ ...p, b: t ? Number(t) : undefined }));
                  }}
                />
                <span className="hint">
                  {budget >= 50 ? `≈ ${formatMoney(Math.round(budget / people), d.cur)} por persona (${people} ${people === 1 ? 'persona' : 'personas'})` : 'Mínimo 50. Puedes ajustarlo después.'}
                </span>
              </div>
            </div>
          )}
        </section>

        <footer className="nawi__nav">
          <button type="button" className="btn btn--secondary" onClick={() => setStep((s) => Math.max(s - 1, 0))} disabled={step === 0}>
            <ArrowLeft width={18} height={18} /> Atrás
          </button>
          <button type="button" className="btn btn--gradient btn--lg" disabled={!valid} onClick={() => next()}>
            {step === TOTAL - 1 ? 'Ver mis recomendaciones' : 'Continuar'} <ArrowRight width={18} height={18} />
          </button>
        </footer>
      </div>

      <aside className="nawi__visual" aria-hidden="true">
        <Image key={step} src={VISUALS[step]!} alt="" fill sizes="45vw" priority={step === 0} style={{ objectFit: 'cover' }} />
        <div className="nawi__visual-shade" />
      </aside>
    </div>
  );
}

function Stepper({ label, hint, value, min, max, onChange }: { label: string; hint: string; value: number; min: number; max: number; onChange: (n: number) => void }) {
  return (
    <div className="stepper" role="group" aria-label={label}>
      <div>
        <p className="stepper__label">{label}</p>
        <p className="hint">{hint}</p>
      </div>
      <div className="stepper__ctrl">
        <button type="button" aria-label={`Menos ${label.toLowerCase()}`} disabled={value <= min} onClick={() => onChange(value - 1)}>
          <Minus width={18} height={18} />
        </button>
        <output aria-live="polite">{value}</output>
        <button type="button" aria-label={`Más ${label.toLowerCase()}`} disabled={value >= max} onClick={() => onChange(value + 1)}>
          <Plus width={18} height={18} />
        </button>
      </div>
    </div>
  );
}
