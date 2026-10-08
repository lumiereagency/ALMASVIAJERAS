import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ExperienceCard } from '@/components/catalog/ExperienceCard';
import { SiteFooter, SiteHeader } from '@/components/marketing/SiteChrome';
import { ArrowRight } from '@/components/ui/icons';
import { listPublishedExperiences } from '@/lib/catalog/queries';
import { createAnonClient } from '@/lib/supabase/anon';

export const dynamic = 'force-dynamic';
type Props = { params: Promise<{ slug: string }> };

async function getEnviajador(slug: string) {
  const db = createAnonClient();
  if (!db) return null;
  const { data } = await db.from('public_enviajadores').select('slug, display_name, bio').eq('slug', slug).maybeSingle();
  return data as { slug: string; display_name: string; bio: string | null } | null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const e = await getEnviajador((await params).slug);
  return e ? { title: `${e.display_name} · Enviajador`, description: e.bio ?? undefined } : {};
}

export default async function Page({ params }: Props) {
  const e = await getEnviajador((await params).slug);
  if (!e) notFound();
  const experiences = await listPublishedExperiences();
  return (
    <>
      <SiteHeader />
      <main id="contenido" className="container section--tight">
        <div className="vitrine">
          <span className="vitrine__avatar" aria-hidden="true">
            {e.display_name.charAt(0).toUpperCase()}
          </span>
          <div>
            <p className="eyebrow">Enviajador</p>
            <h1 className="display-md">{e.display_name} te recomienda estos viajes</h1>
            {e.bio && <p className="lead">{e.bio}</p>}
          </div>
        </div>
        <div className="card-grid" style={{ marginTop: 32 }}>
          {experiences.map((x, i) => (
            <ExperienceCard key={x.id} e={x} index={i} />
          ))}
        </div>
        <p style={{ marginTop: 32 }}>
          <Link href="/alma-nawi" className="btn btn--gradient btn--lg">
            Encuentra tu viaje ideal <ArrowRight width={18} height={18} />
          </Link>
        </p>
      </main>
      <SiteFooter />
    </>
  );
}
