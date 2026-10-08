import { AppShell } from '@/components/ui/AppShell';
import { requireRole } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

export default async function Layout({ children }: { children: React.ReactNode }) {
  await requireRole('/admin');
  return (
    <AppShell
      area="Administración"
      nav={[
        { href: '/admin', label: 'Resumen' },
        { href: '/equipe', label: 'Leads' },
        { href: '/admin/enviajadores', label: 'Enviajadores' },
        { href: '/admin/comisiones', label: 'Comisiones' },
        { href: '/admin/usuarios', label: 'Usuarios' },
      ]}
    >
      {children}
    </AppShell>
  );
}
