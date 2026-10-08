import type { Metadata } from 'next';
import { SiteFooter, SiteHeader } from '@/components/marketing/SiteChrome';

export const metadata: Metadata = { title: 'Aviso de privacidad' };

export default function Page() {
  return (
    <>
      <SiteHeader />
      <main id="contenido" className="container prose">
        <p className="notice">BORRADOR pendiente de revisión legal. Reemplazar por el aviso oficial antes de publicar.</p>
        <h1 className="display-md">Aviso de privacidad</h1>
        <p>Almas Viajeras es responsable del tratamiento de tus datos personales. Los usamos para contactarte sobre tu solicitud de viaje, preparar propuestas y dar seguimiento a tu atención.</p>
        <h2 className="h3">Qué datos recabamos</h2>
        <p>Nombre, teléfono de WhatsApp, correo (opcional), país y ciudad (opcionales) y las respuestas que das en Alma Nawi (compañía, intereses, destino, duración, personas y presupuesto).</p>
        <h2 className="h3">Para qué los usamos</h2>
        <p>Atender tu solicitud y enviarte propuestas. Solo si lo autorizas aparte, te enviaremos ideas y ofertas de viaje.</p>
        <h2 className="h3">Tus derechos</h2>
        <p>Puedes pedir acceso, corrección, cancelación u oposición al tratamiento (derechos ARCO), o retirar tu consentimiento, escribiendo a hola@almasviajeras.com.mx.</p>
        <h2 className="h3">Enviajadores</h2>
        <p>Si llegas por el enlace de un Enviajador, registramos esa referencia para atribuirle la recomendación. El Enviajador no ve tu teléfono, correo ni conversaciones.</p>
      </main>
      <SiteFooter />
    </>
  );
}
