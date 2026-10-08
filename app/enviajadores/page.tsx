import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteFooter, SiteHeader } from '@/components/marketing/SiteChrome';
import { ArrowRight } from '@/components/ui/icons';

export const metadata: Metadata = { title: 'Enviajadores', description: 'Recomienda viajes, comparte tu enlace y acompaña tus resultados con transparencia.' };

const STEPS = [
  { n: '01', t: 'Crea tu perfil', d: 'Regístrate y personaliza tu vitrina con tu nombre y tu historia.' },
  { n: '02', t: 'Elige y comparte', d: 'Selecciona experiencias y comparte tu enlace personal, general o por viaje.' },
  { n: '03', t: 'Acompaña resultados', d: 'Ve visitas, solicitudes y ventas atribuidas a tu recomendación.' },
  { n: '04', t: 'Gana con transparencia', d: 'Cada comisión tiene origen, regla aplicada y estado visibles.' },
];

export default function Page() {
  return (
    <>
      <SiteHeader />
      <main id="contenido">
        <section className="container section--tight">
          <p className="eyebrow">Programa Enviajadores</p>
          <h1 className="display" style={{ marginBlock: 12 }}>
            Recomienda experiencias. Acompaña resultados. Gana con transparencia.
          </h1>
          <p className="lead">Pensado para viajeros, creadores y comunidades que ya inspiran a otros a viajar.</p>
          <div className="hero__actions">
            <Link href="/registro-enviajador" className="btn btn--gradient btn--lg">
              Quiero ser Enviajador <ArrowRight width={18} height={18} />
            </Link>
            <Link href="/entrar" className="btn btn--secondary btn--lg">
              Ya tengo cuenta
            </Link>
          </div>
        </section>
        <section className="container section--tight">
          <ol className="steps">
            {STEPS.map((s) => (
              <li key={s.n}>
                <span className="steps__n">{s.n}</span>
                <h2 className="h3">{s.t}</h2>
                <p className="muted">{s.d}</p>
              </li>
            ))}
          </ol>
          <p className="hint" style={{ marginTop: 24 }}>
            Tu enlace guarda la atribución por 30 días. Los Enviajadores no ven datos de contacto de los viajeros.
          </p>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
