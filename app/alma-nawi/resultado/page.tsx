import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { SiteFooter, SiteHeader } from '@/components/marketing/SiteChrome';
import { RecommendationCard } from '@/components/quiz/RecommendationCard';
import { ResultTracker } from '@/components/quiz/ResultTracker';
import { formatMoney } from '@/domain/catalog';
import { COMPANIONS, DURATIONS, INTENTS, REGIONS, parseAnswers, serializeAnswers, toQuizAnswers } from '@/domain/recommendations/options';
import { rankExperiences } from '@/domain/recommendations/rank';
import { listPublishedExperiences } from '@/lib/catalog/queries';
import { getRates } from '@/lib/fx';

export const metadata: Metadata = { title: 'Tus recomendaciones · Alma Nawi', robots: { index: false } };
export const dynamic = 'force-dynamic';

export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const answers = parseAnswers(await searchParams);
  if (!answers) redirect('/alma-nawi');

  const [experiences, { rates, reference }] = await Promise.all([listPublishedExperiences(), getRates()]);
  const today = new Date().toISOString().slice(0, 10);
  const ranked = rankExperiences(
    experiences.map((e) => ({ id: e.id, regions: e.regions, intents: e.intents, companions: e.companions, durationDays: e.durationDays, pricePerPerson: e.price?.amount ?? Number.POSITIVE_INFINITY, currency: e.price?.currency ?? 'USD' })),
    toQuizAnswers(answers),
    rates,
    today,
  );
  const byId = new Map(experiences.map((e) => [e.id, e]));
  const primary = ranked.filter((r) => r.tier === 'primary');
  const alternatives = ranked.filter((r) => r.tier === 'alternative');
  const people = answers.a + answers.m;
  const edit = `/alma-nawi?${serializeAnswers(answers)}`;

  const summary = [
    COMPANIONS.find((o) => o.value === answers.c)?.label,
    answers.i.map((v) => INTENTS.find((o) => o.value === v)?.label).join(' + '),
    REGIONS.find((o) => o.value === answers.r)?.label,
    DURATIONS.find((o) => o.value === answers.d)?.label,
    `${people} ${people === 1 ? 'persona' : 'personas'}`,
    `${formatMoney(answers.b, answers.cur)} en total`,
  ];

  return (
    <>
      <SiteHeader />
      <ResultTracker primary={primary.length} alternatives={alternatives.length} />
      <main id="contenido" className="container section--tight results">
        <p className="eyebrow">Alma Nawi</p>
        <h1 className="display-md">{primary.length ? 'Estos caminos combinan contigo' : 'Aún no tenemos el viaje exacto'}</h1>
        <ul className="summary" aria-label="Tus respuestas">
          {summary.map((s) => (
            <li key={s}>{s}</li>
          ))}
          <li>
            <Link href={edit} className="link-arrow">
              Editar respuestas
            </Link>
          </li>
        </ul>

        {primary.map((r, i) => (
          <RecommendationCard key={r.experienceId} exp={byId.get(r.experienceId)!} rec={r} people={people} lead={i === 0} badge={i === 0 ? 'Tu mejor coincidencia' : 'Coincide con tu momento'} referenceRate={reference} />
        ))}

        {alternatives.length > 0 && (
          <>
            <h2 className="h2 results__sub">{primary.length ? 'Otras opciones con un pequeño ajuste' : 'Opciones cercanas a lo que buscas'}</h2>
            <p className="muted">No encajan al 100 %. Te mostramos con claridad en qué se diferencian de lo que pediste.</p>
            {alternatives.map((r) => (
              <RecommendationCard key={r.experienceId} exp={byId.get(r.experienceId)!} rec={r} people={people} badge="Con un ajuste" referenceRate={reference} />
            ))}
          </>
        )}

        {primary.length === 0 && alternatives.length === 0 && (
          <div className="empty">
            <p className="lead">
              Con ese tiempo, presupuesto y destino todavía no tenemos una experiencia lista. Eso no significa que no exista: nuestro equipo puede diseñarla contigo. Prueba ajustar el presupuesto o la duración y vuelve a mirar.
            </p>
          </div>
        )}

        <div className="results__actions">
          <Link href={edit} className="btn btn--secondary">
            Ajustar mis respuestas
          </Link>
          <Link href="/experiencias" className="btn btn--primary">
            Ver todas las experiencias
          </Link>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
