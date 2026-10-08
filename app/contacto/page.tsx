import type { Metadata } from 'next';
import { SiteFooter, SiteHeader } from '@/components/marketing/SiteChrome';
import { parseAnswers, serializeAnswers } from '@/domain/recommendations/options';
import { getPublishedExperience } from '@/lib/catalog/queries';
import { LeadForm } from './LeadForm';

export const metadata: Metadata = { title: 'Habla con un asesor', description: 'Cuéntanos qué quieres vivir y un asesor te escribe por WhatsApp. Sin compromiso.' };
export const dynamic = 'force-dynamic';

export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const slug = typeof sp.exp === 'string' ? sp.exp : undefined;
  const exp = slug ? await getPublishedExperience(slug) : null;
  const answers = parseAnswers(sp);
  return (
    <>
      <SiteHeader />
      <main id="contenido" className="container auth">
        <p className="eyebrow">Atención personalizada</p>
        <h1 className="display-md">Hablemos de tu viaje</h1>
        <p className="lead">Déjanos tus datos y un asesor te escribe por WhatsApp. Sin compromiso y sin costo.</p>
        <LeadForm exp={exp?.slug} expTitle={exp?.title} quiz={answers ? serializeAnswers(answers) : undefined} />
      </main>
      <SiteFooter />
    </>
  );
}
