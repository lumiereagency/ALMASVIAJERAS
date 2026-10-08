import Image from 'next/image';
import Link from 'next/link';
import { signOut } from '@/app/(auth)/actions';

/** Marco das áreas privadas: Inter dominante, fundos claros, gradiente só na marca (visual-identity §14). */
export function AppShell({ area, nav, children }: { area: string; nav: { href: string; label: string }[]; children: React.ReactNode }) {
  return (
    <div className="shell">
      <header className="shell__top">
        <Link href="/" className="brand" aria-label="Almas Viajeras, inicio">
          <Image src="/brand/simbolo-gradiente-transparente.png" alt="" width={32} height={32} />
          <span>Almas Viajeras</span>
        </Link>
        <span className="shell__area">{area}</span>
        <nav className="shell__nav" aria-label={area}>
          {nav.map((n) => (
            <Link key={n.href} href={n.href}>
              {n.label}
            </Link>
          ))}
        </nav>
        <form action={signOut}>
          <button className="btn btn--secondary btn--sm" type="submit">
            Cerrar sesión
          </button>
        </form>
      </header>
      <main id="contenido" className="shell__main">
        {children}
      </main>
    </div>
  );
}
