'use client';

import { track } from '@/lib/track';

export function WhatsAppButton({ href }: { href: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="btn btn--primary btn--lg" onClick={() => track('contact_clicked', { channel: 'whatsapp' })}>
      Continuar por WhatsApp
    </a>
  );
}
