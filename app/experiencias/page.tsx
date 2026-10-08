import type { Metadata } from 'next';
import { ExperienceCard } from '@/components/catalog/ExperienceCard';
import { SiteFooter, SiteHeader } from '@/components/marketing/SiteChrome';
import { listPublishedExperiences } from '@/lib/catalog/queries';

export const metadata: Metadata = {
  title: 'Experiencias',
  description: 'Viajes diseñados para lo que hoy te mueve: naturaleza, cultura, bienestar y conexión.',
};

export const dynamic = 'force-dynamic';

export default async function Page() {
  const experiences = await listPublishedExperiences();
  return (
    <>
      <SiteHeader />
      <main id="contenido" className="container section--tight">
        <div className="section-head">
          <div>
            <p className="eyebrow">Experiencias curadas</p>
            <h1 className="h2">Viajes diseñados para lo que hoy te mueve</h1>
          </div>
        </div>
        {experiences.length === 0 ? (
          <p className="muted">Pronto publicaremos nuestras experiencias. Mientras tanto, cuéntanos qué quieres vivir.</p>
        ) : (
          <div className="card-grid">
            {experiences.map((e, i) => (
              <ExperienceCard key={e.id} e={e} index={i} />
            ))}
          </div>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
