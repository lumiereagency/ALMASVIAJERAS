import { Frame } from '@/components/app/Frame';
import { requireRole } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

export default async function Layout({ children }: { children: React.ReactNode }) {
  await requireRole('/enviajador');
  return <Frame area="enviajador">{children}</Frame>;
}
