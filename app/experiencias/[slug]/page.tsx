import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SiteFooter, SiteHeader } from '@/components/marketing/SiteChrome';
import { formatMoney, nightsLabel } from '@/domain/catalog';
import { getPublishedExperience } from '@/lib/catalog/queries';

export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const e = await getPublishedExperience((await params).slug);
  return e ? { title: e.title, description: e.summary ?? undefined, openGraph: { title: e.title, description: e.summary ?? undefined } } : {};
}

export default async function Page({ params }: Props) {
  const e = await getPublishedExperience((await params).slug);
  if (!e) notFound();
  return (
    <>
      <SiteHeader />
      <main id="contenido" className="container section--tight detail">
        <p className="eyebrow">{e.category}</p>
        <h1 className="display" style={{ fontSize: 'clamp(2rem, 4.2vw, 3.25rem)' }}>
          {e.title}
        </h1>
        {e.summary && <p className="lead">{e.summary}</p>}
        <dl className="facts">
          <div>
            <dt>Duración</dt>
            <dd>{nightsLabel(e.durationDays)}</dd>
          </div>
          <div>
            <dt>Precio por persona</dt>
            <dd>{e.price ? formatMoney(e.price.amount, e.price.currency) : 'A consultar'}</dd>
          </div>
          {e.departures[0] && (
            <div>
              <dt>Próxima salida</dt>
              <dd>{e.departures[0].startsOn}</dd>
            </div>
          )}
        </dl>
        {e.description && <p>{e.description}</p>}
        {e.faq.length > 0 && (
          <section aria-labelledby="faq">
            <h2 id="faq" className="h3">
              Preguntas frecuentes
            </h2>
            {e.faq.map((f) => (
              <details key={f.q}>
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </section>
        )}
        {/* Captura de lead (formulario + consentimiento) llega en la siguiente etapa. */}
        <Link href="/alma-nawi" className="btn btn--gradient" style={{ alignSelf: 'flex-start' }}>
          Quiero esta experiencia →
        </Link>
      </main>
      <SiteFooter />
    </>
  );
}
