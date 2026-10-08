import type { Metadata } from 'next';
import { InstallCard, NotificationsCard } from '@/components/app/PwaCards';
import { Banner, Card } from '@/components/app/widgets';
import { AREA_LABEL, areaOf } from '@/lib/app-nav';
import { getSession } from '@/lib/auth/session';

export const metadata: Metadata = { title: 'Ajustes', robots: { index: false } };
export const dynamic = 'force-dynamic';

export default async function Page() {
  const s = (await getSession())!;
  return (
    <>
      <Banner eyebrow="Ajustes" title="Tu app, a tu manera" text="Instala Almas Viajeras en tu pantalla de inicio y elige cómo quieres enterarte de lo importante." />
      <div className="bento">
        <div className="span-6"><InstallCard /></div>
        <div className="span-6"><NotificationsCard /></div>
        <div className="span-12">
          <Card title="Tu cuenta">
            <dl className="kv">
              <dt>Correo</dt>
              <dd>{s.email}</dd>
              <dt>Perfil</dt>
              <dd>{AREA_LABEL[areaOf(s.roles)]}</dd>
            </dl>
          </Card>
        </div>
      </div>
    </>
  );
}
