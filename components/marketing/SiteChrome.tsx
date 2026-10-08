import Image from 'next/image';
import Link from 'next/link';
import { SOCIAL } from '@/content/landing';
import { Instagram, Menu, Search } from '@/components/ui/icons';

export const NAV = [
  { href: '/experiencias', label: 'Experiencias' },
  { href: '/destinos', label: 'Destinos' },
  { href: '/alma-nawi', label: 'Alma Nawi' },
  { href: '/enviajadores', label: 'Enviajadores' },
  { href: '/nosotros', label: 'Nosotros' },
] as const;

function Brand({ size = 38 }: { size?: number }) {
  return (
    <Link href="/" className="brand" aria-label="Almas Viajeras, inicio">
      <Image src="/brand/simbolo-gradiente-transparente.png" alt="" width={size} height={size} priority />
      <span>Almas Viajeras</span>
    </Link>
  );
}

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Brand />
        <nav className="nav" aria-label="Principal">
          {NAV.map((i) => (
            <Link key={i.href} href={i.href}>
              {i.label}
            </Link>
          ))}
        </nav>
        <div className="header-actions">
          <Link href="/experiencias" className="icon-btn" aria-label="Buscar experiencias">
            <Search width={20} height={20} />
          </Link>
          <Link href="/entrar" className="btn btn--outline btn--sm hide-sm">
            Soy Enviajador
          </Link>
          <Link href="/alma-nawi" className="btn btn--primary btn--sm">
            Diseña tu viaje
          </Link>
          <details className="mobile-menu">
            <summary aria-label="Abrir menú">
              <Menu />
            </summary>
            <nav className="mobile-menu__panel" aria-label="Menú móvil">
              {NAV.map((i) => (
                <Link key={i.href} href={i.href}>
                  {i.label}
                </Link>
              ))}
              <Link href="/entrar">Soy Enviajador</Link>
              <Link href="/alma-nawi" className="mobile-cta">
                Diseña tu viaje
              </Link>
            </nav>
          </details>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="site-footer__grid">
          <div className="site-footer__brand">
            <Brand size={44} />
            <p>Viajes que te transforman por dentro. Experiencias auténticas, bienestar, conexión humana y destinos extraordinarios.</p>
          </div>
          <nav className="footer-links" aria-label="Pie de página">
            {NAV.map((i) => (
              <Link key={i.href} href={i.href}>
                {i.label}
              </Link>
            ))}
          </nav>
          <div className="footer-social">
            <span className="footer-social__label">Síguenos</span>
            <div>
              {SOCIAL.map((s) => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label} className="icon-btn icon-btn--light">
                  <Instagram width={20} height={20} />
                </a>
              ))}
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Almas Viajeras. Todos los derechos reservados.</span>
          <nav aria-label="Legal">
            <Link href="/privacidad">Aviso de privacidad</Link>
            <Link href="/terminos">Términos y condiciones</Link>
            <Link href="/contacto">Contacto</Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
