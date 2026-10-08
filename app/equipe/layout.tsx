import { Frame } from '@/components/app/Frame';
import { requireRole } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

export default async function Layout({ children }: { children: React.ReactNode }) {
  const s = await requireRole('/equipe');
  return <Frame area={s.roles.includes('admin') ? 'admin' : 'equipe'}>{children}</Frame>;
}
