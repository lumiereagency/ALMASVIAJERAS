import type { Metadata } from 'next';
import { PrivateHome } from '@/components/ui/PrivateHome';

export const metadata: Metadata = { title: 'Administración', robots: { index: false } };
export const dynamic = 'force-dynamic';

export default function Page() {
  return <PrivateHome path="/admin" title="Administración" description="Catálogo, usuarios, leads, ventas y comisiones llegarán aquí." />;
}
