import type { Metadata } from 'next';
import { PrivateHome } from '@/components/ui/PrivateHome';

export const metadata: Metadata = { title: 'Enviajador', robots: { index: false } };
export const dynamic = 'force-dynamic';

export default function Page() {
  return <PrivateHome path="/enviajador" title="Enviajador" description="Panel, vitrina, enlaces y comisiones llegarán aquí." />;
}
