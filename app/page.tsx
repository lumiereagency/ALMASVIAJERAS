import Link from 'next/link';
import { SiteFooter, SiteHeader } from '@/components/marketing/SiteChrome';

/**
 * ATENÇÃO: conteúdo de EXEMPLO tirado da direção visual aprovada.
 * Fotografias, preços e destinos serão substituídos por dados do catálogo (tabela `experiences`).
 */
const SAMPLE = [
  { slug: 'cenotes', badge: 'Naturaleza · Bienestar', place: 'Riviera Maya, México', title: 'Cenotes sagrados y alma caribeña', days: '5 días · 4 noches', price: '$18,900 MXN', ph: 'media--ph-1' },
  { slug: 'grecia', badge: 'Cultura · Exploración', place: 'Grecia', title: 'Islas, historia y vida mediterránea', days: '8 días · 7 noches', price: '$32,400 MXN', ph: 'media--ph-2' },
  { slug: 'peru', badge: 'Conexión · Aventura', place: 'Perú', title: 'Montañas, cultura y propósito', days: '7 días · 6 noches', price: '$24,800 MXN', ph: 'media--ph-3' },
] as const;

const INTENTS = ['Descansar', 'Descubrir', 'Conectar'];

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main id="contenido">
        <section className="container hero" aria-labelledby="hero-title">
          <div className="hero__copy">
            <p className="eyebrow">Viajes que te transforman</p>
            <h1 id="hero-title" className="display">
              Tu manera de viajar también merece un destino
            </h1>
            <p className="lead">
              Diseñamos viajes personalizados que combinan experiencias auténticas, bienestar y conexión humana en los destinos más
              extraordinarios del mundo.
            </p>
            <div className="hero__actions">
              <Link href="/alma-nawi" className="btn btn--gradient">
                Diseña tu viaje →
              </Link>
              <Link href="/nosotros" className="btn btn--secondary">
                Conoce nuestra esencia
              </Link>
            </div>
            <div>
              <p className="eyebrow" style={{ marginBottom: 12 }}>
                ¿Qué quieres vivir?
              </p>
              <div className="chips">
                {INTENTS.map((i) => (
                  <Link key={i} href={`/alma-nawi?intencion=${i.toLowerCase()}`} className="chip">
                    {i}
                  </Link>
                ))}
              </div>
            </div>
          </div>
          <div className="media media--ph-1 hero__media" role="img" aria-label="Espacio reservado para fotografía principal">
            <div className="media__caption">
              <span className="eyebrow" style={{ color: 'rgba(255,255,255,.8)' }}>
                Riviera Maya, México
              </span>
              <span className="h3">Aguas turquesa, historias que se quedan contigo.</span>
            </div>
          </div>
        </section>

        <section className="container section--tight" aria-labelledby="exp-title">
          <div className="section-head">
            <div>
              <p className="eyebrow">Experiencias curadas</p>
              <h2 id="exp-title" className="h2">
                Viajes diseñados para lo que hoy te mueve
              </h2>
            </div>
            <div style={{ maxWidth: 380 }}>
              <p className="muted">Más que destinos, creamos experiencias que transforman. Cada viaje combina cultura, naturaleza, bienestar y conexiones auténticas.</p>
              <Link href="/experiencias" className="link-arrow">
                Ver todas las experiencias →
              </Link>
            </div>
          </div>
          <div className="exp-grid">
            {SAMPLE.map((e) => (
              <Link key={e.slug} href={`/experiencias/${e.slug}`} className={`media exp-card ${e.ph}`}>
                <span className="badge">{e.badge}</span>
                <div className="media__caption">
                  <span className="eyebrow" style={{ color: 'rgba(255,255,255,.8)' }}>
                    {e.place}
                  </span>
                  <span className="h3">{e.title}</span>
                  <span className="meta">
                    <span>{e.days}</span>
                    <span>Desde {e.price}</span>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="container section--tight" aria-labelledby="trust-title">
          <div className="band">
            <div>
              <p className="eyebrow" style={{ color: 'rgba(255,255,255,.7)' }}>
                Personas reales, cuidando tu viaje
              </p>
              <h2 id="trust-title" className="h2" style={{ marginTop: 12 }}>
                Antes, durante y después de cada experiencia
              </h2>
              <ul className="band__list">
                <li><strong>Atención personalizada</strong>Un asesor humano te acompaña.</li>
                <li><strong>Agencia mexicana</strong>Registro Nacional de Turismo.</li>
                <li><strong>Comunidad Enviajadores</strong>Recomendaciones de viajeros reales.</li>
                <li><strong>Precios claros</strong>Moneda, duración y precio siempre visibles.</li>
              </ul>
            </div>
            <p className="lead">Las cifras de confianza (viajeros atendidos, años de experiencia) se publicarán tras validación documental.</p>
          </div>
        </section>

        <section className="container section" aria-labelledby="cta-title">
          <div className="cta">
            <div>
              <p className="eyebrow">Es momento de tu propia historia</p>
              <h2 id="cta-title" className="h2" style={{ marginTop: 12 }}>
                Diseñemos juntos un viaje que te transforme
              </h2>
            </div>
            <div>
              <Link href="/alma-nawi" className="btn btn--gradient">
                Diseña tu viaje →
              </Link>
              <p className="muted" style={{ fontSize: '.8125rem', marginTop: 8 }}>
                Asesoría personalizada, sin costo.
              </p>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
