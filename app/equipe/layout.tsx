import { AppShell } from '@/components/ui/AppShell';
import { requireRole } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

export default async function Layout({ children }: { children: React.ReactNode }) {
  const s = await requireRole('/equipe');
  return (
    <AppShell
      area="Equipo"
      nav={[{ href: '/equipe', label: 'Leads' }, ...(s.roles.includes('admin') ? [{ href: '/admin', label: 'Administración' }] : [])]}
    >
      {children}
    </AppShell>
  );
}
