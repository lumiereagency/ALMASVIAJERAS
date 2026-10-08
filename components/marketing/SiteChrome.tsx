import Image from 'next/image';
import Link from 'next/link';

export const NAV = [
  { href: '/experiencias', label: 'Experiencias' },
  { href: '/alma-nawi', label: 'Alma Nawi' },
  { href: '/enviajadores', label: 'Enviajadores' },
  { href: '/nosotros', label: 'Nosotros' },
] as const;

function Brand({ size = 36 }: { size?: number }) {
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
      <div className="container site-header__inner">
        <Brand />
        <nav className="nav" aria-label="Principal">
          {NAV.map((i) => (
            <Link key={i.href} href={i.href}>
              {i.label}
            </Link>
          ))}
        </nav>
        <div className="header-actions">
          <Link href="/enviajadores" className="btn btn--secondary btn--sm">
            Soy Enviajador
          </Link>
          <Link href="/alma-nawi" className="btn btn--gradient btn--sm">
            Diseña tu viaje
          </Link>
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
          <div>
            <Brand />
            <p>Viajes que te transforman por dentro. Experiencias auténticas, bienestar, conexión humana y destinos extraordinarios.</p>
          </div>
          <nav className="footer-links" aria-label="Pie de página">
            {NAV.map((i) => (
              <Link key={i.href} href={i.href}>
                {i.label}
              </Link>
            ))}
          </nav>
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
