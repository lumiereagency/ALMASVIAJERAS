import type { Metadata } from 'next';
import { SiteFooter, SiteHeader } from '@/components/marketing/SiteChrome';

export const metadata: Metadata = { title: 'Términos y condiciones' };

export default function Page() {
  return (
    <>
      <SiteHeader />
      <main id="contenido" className="container prose">
        <p className="notice">BORRADOR pendiente de revisión legal. Reemplazar por los términos oficiales antes de publicar.</p>
        <h1 className="display-md">Términos y condiciones</h1>
        <p>Este sitio ofrece información y solicitudes de atención sobre viajes. Las propuestas, precios y disponibilidad se confirman con un asesor y pueden cambiar sin previo aviso. Los precios publicados son referenciales, por persona y se indican con su moneda.</p>
        <h2 className="h3">Programa Enviajadores</h2>
        <p>Las comisiones se generan solo sobre ventas confirmadas atribuidas al Enviajador, según la regla vigente. Cada comisión pasa por aprobación y queda registrada con su historial. Las condiciones detalladas se publicarán en el reglamento del programa.</p>
      </main>
      <SiteFooter />
    </>
  );
}
