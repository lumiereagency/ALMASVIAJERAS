import type { Metadata } from 'next';
import { PrivateHome } from '@/components/ui/PrivateHome';

export const metadata: Metadata = { title: 'Equipo', robots: { index: false } };
export const dynamic = 'force-dynamic';

export default function Page() {
  return <PrivateHome path="/equipe" title="Equipo" description="Cola de leads y seguimiento llegarán aquí." />;
}
