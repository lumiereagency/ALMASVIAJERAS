import type { Metadata } from 'next';
import Link from 'next/link';
import { Banner, Card } from '@/components/app/widgets';
import { InstallCard, NotificationsCard } from '@/components/app/PwaCards';
import { ArrowRight, Compass, Heart, Sparkle } from '@/components/ui/icons';

export const metadata: Metadata = { title: 'Mi espacio', robots: { index: false } };

export default function Page() {
  return (
    <>
      <Banner eyebrow="Tu espacio" title="Tu próximo viaje empieza aquí" text="Descubre experiencias hechas para tu momento y habla con una persona real cuando quieras." cta={{ href: '/alma-nawi', label: 'Encontrar mi viaje' }} />
      <div className="bento">
        {[
          { href: '/alma-nawi', t: 'Alma Nawi', d: 'Responde seis preguntas y recibe recomendaciones explicadas.', I: Sparkle },
          { href: '/experiencias', t: 'Experiencias', d: 'Explora los viajes disponibles con precio y duración claros.', I: Compass },
          { href: '/contacto', t: 'Habla con un asesor', d: 'Cuéntanos tu idea y te escribimos por WhatsApp.', I: Heart },
        ].map(({ href, t, d, I }) => (
          <Link key={href} href={href} className="span-4 card card--link">
            <span className="stat__icon"><I width={22} height={22} /></span>
            <h2>{t}</h2>
            <p className="muted">{d}</p>
            <span className="link-arrow">Abrir <ArrowRight width={16} height={16} /></span>
          </Link>
        ))}
        <div className="span-6"><InstallCard /></div>
        <div className="span-6"><NotificationsCard /></div>
      </div>
      <Card title="Tus solicitudes">
        <p className="muted">Cuando dejes tus datos con un asesor, aquí verás el seguimiento de tu solicitud.</p>
      </Card>
    </>
  );
}
