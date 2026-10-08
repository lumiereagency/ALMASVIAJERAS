import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { SiteFooter, SiteHeader } from '@/components/marketing/SiteChrome';
import { getSession } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';
import { ProfileForm, SignupForm } from './RegisterForm';

export const metadata: Metadata = { title: 'Quiero ser Enviajador', robots: { index: false } };
export const dynamic = 'force-dynamic';

export default async function Page() {
  const session = await getSession();
  if (session?.roles.includes('enviajador')) redirect('/enviajador');
  let meta: { full_name?: string; slug?: string } = {};
  if (session) {
    const db = await createClient();
    const { data } = await db!.auth.getUser();
    meta = (data.user?.user_metadata ?? {}) as typeof meta;
  }
  return (
    <>
      <SiteHeader />
      <main id="contenido" className="container auth">
        <p className="eyebrow">Programa Enviajadores</p>
        <h1 className="display-md">{session ? 'Completa tu perfil' : 'Crea tu cuenta'}</h1>
        {session ? (
          <ProfileForm name={meta.full_name} slug={meta.slug} />
        ) : (
          <>
            <SignupForm />
            <p className="hint">
              ¿Ya tienes cuenta? <Link href="/entrar?next=/registro-enviajador">Inicia sesión</Link>
            </p>
          </>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
