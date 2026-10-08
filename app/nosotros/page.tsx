import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteFooter, SiteHeader } from '@/components/marketing/SiteChrome';
import { Photo } from '@/components/ui/Photo';
import { PHILOSOPHY, STATS } from '@/content/landing';

export const metadata: Metadata = { title: 'Nosotros', description: 'Agencia mexicana de viajes que acompaña personas, antes, durante y después de cada experiencia.' };

export default function Page() {
  return (
    <>
      <SiteHeader />
      <main id="contenido">
        <section className="container section--tight about">
          <div className="about__copy">
            <p className="eyebrow">Nuestra esencia</p>
            <h1 className="display-md">{PHILOSOPHY.motto}</h1>
            <p className="lead">{PHILOSOPHY.quote}</p>
            <p className="muted">
              {PHILOSOPHY.name} · {PHILOSOPHY.role}
            </p>
            <Link href="/alma-nawi" className="btn btn--gradient btn--lg" style={{ alignSelf: 'flex-start' }}>
              Diseña tu viaje
            </Link>
          </div>
          <div className="about__photo">
            <Photo src={PHILOSOPHY.photo} alt={PHILOSOPHY.alt} tone={PHILOSOPHY.tone} position={PHILOSOPHY.position} sizes="(max-width: 860px) 100vw, 45vw" />
          </div>
        </section>
        <section className="container">
          <ul className="stats">
            {STATS.map((s) => (
              <li key={s.label}>
                <strong>{s.value}</strong>
                <span>{s.label}</span>
              </li>
            ))}
          </ul>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
