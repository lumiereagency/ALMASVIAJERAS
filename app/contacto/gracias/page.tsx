import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteFooter, SiteHeader } from '@/components/marketing/SiteChrome';
import { ArrowRight } from '@/components/ui/icons';
import { WhatsAppButton } from './WhatsAppButton';

export const metadata: Metadata = { title: 'Solicitud recibida', robots: { index: false } };

export default async function Page({ searchParams }: { searchParams: Promise<{ code?: string; exp?: string }> }) {
  const { code, exp } = await searchParams;
  const safeCode = /^[A-F0-9]{8}$/.test(code ?? '') ? code : undefined;
  const number = (process.env.WHATSAPP_NUMBER ?? '').replace(/\D/g, '');
  const text = `Hola, Almas Viajeras. Acabo de dejar mis datos en el sitio${safeCode ? ` (código ${safeCode})` : ''}${exp ? ` y me interesa ${exp.replace(/-/g, ' ')}` : ''}.`;
  return (
    <>
      <SiteHeader />
      <main id="contenido" className="container auth">
        <p className="eyebrow">Solicitud recibida</p>
        <h1 className="display-md">¡Gracias! Ya tenemos tus datos</h1>
        <p className="lead">Un asesor te escribirá muy pronto. Si prefieres, puedes adelantar la conversación ahora mismo.</p>
        {safeCode && (
          <p className="hint">
            Tu código de solicitud: <strong>{safeCode}</strong>
          </p>
        )}
        {number ? (
          <WhatsAppButton href={`https://wa.me/${number}?text=${encodeURIComponent(text)}`} />
        ) : (
          <p className="muted">Te contactaremos por el número que nos dejaste.</p>
        )}
        <Link href="/experiencias" className="link-arrow">
          Seguir explorando experiencias <ArrowRight width={16} height={16} />
        </Link>
      </main>
      <SiteFooter />
    </>
  );
}
