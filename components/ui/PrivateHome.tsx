import { signOut } from '@/app/(auth)/actions';
import { requireRole } from '@/lib/auth/session';

/** Esqueleto das áreas privadas até os módulos reais existirem. */
export async function PrivateHome({ path, title, description }: { path: string; title: string; description: string }) {
  const session = await requireRole(path);
  return (
    <main id="contenido" className="container auth">
      <p className="eyebrow">{title}</p>
      <h1 className="h2">Hola, {session.email}</h1>
      <p className="muted">{description}</p>
      <form action={signOut}>
        <button className="btn btn--secondary" type="submit">
          Cerrar sesión
        </button>
      </form>
    </main>
  );
}
