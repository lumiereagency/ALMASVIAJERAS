import type { Metadata } from 'next';
import { SiteFooter, SiteHeader } from '@/components/marketing/SiteChrome';
import { RecoverForm } from '../LoginForm';

export const metadata: Metadata = { title: 'Recuperar contraseña', robots: { index: false } };

export default function Page() {
  return (
    <>
      <SiteHeader />
      <main id="contenido" className="container auth">
        <h1 className="h2">Recuperar contraseña</h1>
        <RecoverForm />
      </main>
      <SiteFooter />
    </>
  );
}
