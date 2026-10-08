import type { Metadata } from 'next';
import { PrivateHome } from '@/components/ui/PrivateHome';

export const metadata: Metadata = { title: 'Viajero', robots: { index: false } };
export const dynamic = 'force-dynamic';

export default function Page() {
  return <PrivateHome path="/viajante" title="Viajero" description="Tu perfil y solicitudes llegarán aquí." />;
}
