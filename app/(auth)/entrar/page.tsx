import type { Metadata } from 'next';
import { safeNext } from '@/lib/auth/access';
import { SiteFooter, SiteHeader } from '@/components/marketing/SiteChrome';
import { LoginForm } from '../LoginForm';

export const metadata: Metadata = { title: 'Entrar', robots: { index: false } };

export default async function Page({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  const sp = await searchParams;
  const notice = sp.error === 'forbidden' ? 'Tu cuenta no tiene acceso a esa sección.' : undefined;
  return (
    <>
      <SiteHeader />
      <main id="contenido" className="container auth">
        <h1 className="h2">Entrar</h1>
        <p className="muted">Accede a tu espacio en Almas Viajeras.</p>
        <LoginForm next={safeNext(sp.next) ?? undefined} notice={notice} />
      </main>
      <SiteFooter />
    </>
  );
}
