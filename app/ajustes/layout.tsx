import { Frame } from '@/components/app/Frame';
import { areaOf } from '@/lib/app-nav';
import { requireRole } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

export default async function Layout({ children }: { children: React.ReactNode }) {
  const s = await requireRole('/ajustes');
  return <Frame area={areaOf(s.roles)}>{children}</Frame>;
}
