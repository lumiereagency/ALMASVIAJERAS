import { AppShell } from '@/components/ui/AppShell';
import { requireRole } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

export default async function Layout({ children }: { children: React.ReactNode }) {
  await requireRole('/enviajador');
  return <AppShell area="Enviajador" nav={[{ href: '/enviajador', label: 'Panel' }]}>{children}</AppShell>;
}
