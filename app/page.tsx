import Link from 'next/link';
import { SiteFooter, SiteHeader } from '@/components/marketing/SiteChrome';
import { ArrowRight, Crown, Diamond, Heart, Mountain, Palm, People, Play, Star, Sun, Tag } from '@/components/ui/icons';
import { Photo } from '@/components/ui/Photo';
import { DESTINATIONS, FEATURED, HERO, PHILOSOPHY, VIP } from '@/content/landing';

const INTENTS = [
  { label: 'Descansar', key: 'descanso', Icon: Palm },
  { label: 'Descubrir', key: 'descubrir', Icon: Mountain },
  { label: 'Conectar', key: 'conexion', Icon: People },
];
const PERK_ICON = { crown: Crown, star: Star, diamond: Diamond, heart: Heart } as const;

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main id="contenido">
        {/* 1 · Hero */}
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero__copy">
            <p className="eyebrow">Viajes que te transforman</p>
            <h1 id="hero-title" className="display">
              Tu manera de viajar también merece un destino
            </h1>
            <p className="lead">
              Diseñamos viajes personalizados que combinan experiencias auténticas, bienestar y conexión humana en los destinos más extraordinarios del mundo.
            </p>
            <div className="hero__actions">
              <Link href="/alma-nawi" className="btn btn--gradient btn--lg">
                Diseña tu viaje <ArrowRight width={18} height={18} />
              </Link>
              <Link href="/nosotros" className="link-play">
                <span className="link-play__icon">
                  <Play width={14} height={14} />
                </span>
                <span>
                  Conoce
                  <br />
                  nuestra esencia
                </span>
              </Link>
            </div>
            <div className="intents">
              <p className="eyebrow">¿Qué quieres vivir?</p>
              <div className="chips">
                {INTENTS.map(({ label, key, Icon }) => (
                  <Link key={key} href={`/alma-nawi?intencion=${key}`} className="chip">
                    <Icon width={20} height={20} /> {label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
          <div className="hero__media">
            <Photo src={HERO.photo} alt={HERO.alt} tone={HERO.tone} position={HERO.position} sizes="(max-width: 960px) 100vw, 50vw" priority />
            <div className="hero__caption">
              <div>
                <span className="eyebrow">{HERO.place}</span>
                <p>{HERO.caption}</p>
              </div>
              <span className="pager" aria-hidden="true">
                01 <i /> 03
              </span>
            </div>
          </div>
        </section>

        {/* 2 · Experiencias curadas */}
        <section className="container section" aria-labelledby="exp-title">
          <div className="section-head">
            <div>
              <p className="eyebrow">Experiencias curadas</p>
              <h2 id="exp-title" className="h2">
                Viajes diseñados para lo que hoy te mueve
              </h2>
            </div>
            <div className="section-head__aside">
              <p>Más que destinos, creamos experiencias que transforman. Cada viaje combina cultura, naturaleza, bienestar y conexiones auténticas.</p>
              <Link href="/experiencias" className="link-arrow">
                Ver todas las experiencias <ArrowRight width={16} height={16} />
              </Link>
            </div>
          </div>
          <div className="exp-grid">
            {FEATURED.map((e, i) => (
              <Link key={e.slug} href={`/experiencias/${e.slug}`} className={`exp-card ${i === 0 ? 'exp-card--lead' : ''}`}>
                <Photo src={e.photo} alt={e.alt} tone={e.tone} position={e.position} sizes={i === 0 ? '(max-width: 860px) 100vw, 55vw' : '(max-width: 860px) 100vw, 40vw'} />
                <span className="pill">{e.badge}</span>
                <div className="exp-card__body">
                  <span className="exp-card__place">{e.place}</span>
                  <h3 className="h3">{e.title}</h3>
                  <p className="meta">
                    <span>
                      <Sun width={16} height={16} /> {e.days === 1 ? '1 día' : e.days + ' días'}
                    </span>
                    <span>
                      <Tag width={16} height={16} /> {e.price}
                    </span>
                  </p>
                </div>
                <span className="round-btn" aria-hidden="true">
                  <ArrowRight width={18} height={18} />
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* 3 · VIP */}
        <section className="container" aria-labelledby="vip-title">
          <div className="vip">
            <div className="vip__copy">
              <p className="eyebrow">Almas Viajeras VIP</p>
              <h2 id="vip-title" className="h2">
                {VIP.title}
              </h2>
              <ul className="perks">
                {VIP.perks.map((p) => {
                  const I = PERK_ICON[p.icon as keyof typeof PERK_ICON];
                  return (
                    <li key={p.label}>
                      <I width={28} height={28} />
                      <span>{p.label}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
            <div className="vip__story">
              <div className="vip__thumb">
                <Photo src={VIP.story.photo} alt={VIP.story.alt} tone={VIP.story.tone} position={VIP.story.position} sizes="(max-width: 860px) 100vw, 30vw" />
                {VIP.videoUrl && (
                  <a href={VIP.videoUrl} className="play-btn" aria-label="Reproducir video">
                    <Play width={20} height={20} />
                  </a>
                )}
              </div>
              <p className="eyebrow">Historias que inspiran</p>
              <p className="vip__story-title">{VIP.story.title}</p>
            </div>
          </div>
        </section>

        {/* 4 · Destinos */}
        <section className="container section" aria-labelledby="dest-title">
          <div className="section-head">
            <div>
              <p className="eyebrow">Destinos que despiertan otra versión de ti</p>
              <h2 id="dest-title" className="h2">
                Inspiración para tu próximo viaje
              </h2>
            </div>
            <div className="section-head__aside">
              <p>Desde playas paradisíacas hasta culturas milenarias, cada destino está pensado para que vivas algo real, profundo e inolvidable.</p>
              <Link href="/destinos" className="link-arrow">
                Explora más destinos <ArrowRight width={16} height={16} />
              </Link>
            </div>
          </div>
          <ul className="dest-grid">
            {DESTINATIONS.map((d) => (
              <li key={d.name}>
                <Link href={`/destinos/${d.slug}`} className="dest">
                  <span className="dest__img">
                    <Photo src={d.photo} alt={d.alt} tone={d.tone} position={d.position} sizes="(max-width: 700px) 50vw, 25vw" />
                  </span>
                  <strong>{d.name}</strong>
                  <span>{d.line}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* 5 · Comunidad */}
        <section className="community" aria-labelledby="com-title">
          <Photo src={PHILOSOPHY.photo} alt={PHILOSOPHY.alt} tone={PHILOSOPHY.tone} position={PHILOSOPHY.position} sizes="100vw" />
          <div className="container community__inner">
            <p className="eyebrow">Nuestra filosofía</p>
            <h2 id="com-title" className="h1-lg">
              {PHILOSOPHY.motto}
            </h2>
            <blockquote>“{PHILOSOPHY.quote}”</blockquote>
            <p className="community__who">
              <strong>{PHILOSOPHY.name}</strong>
              <span>{PHILOSOPHY.role}</span>
            </p>
          </div>
        </section>

        {/* 6 · CTA final */}
        <section className="container section" aria-labelledby="cta-title">
          <div className="cta">
            <div>
              <p className="eyebrow">Es momento de tu propia historia</p>
              <h2 id="cta-title" className="h2">
                Diseñemos juntos un viaje que te transforme
              </h2>
            </div>
            <div className="cta__action">
              <Link href="/alma-nawi" className="btn btn--gradient btn--lg">
                Diseña tu viaje <ArrowRight width={18} height={18} />
              </Link>
              <p>Asesoría personalizada, sin costo.</p>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
