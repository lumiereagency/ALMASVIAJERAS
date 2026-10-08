'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { ArrowRight } from '@/components/ui/icons';
import { createLead, type LeadState } from './actions';

export function LeadForm({ exp, quiz, expTitle }: { exp?: string; quiz?: string; expTitle?: string }) {
  const [state, action, pending] = useActionState<LeadState, FormData>(createLead, {});
  const f = state.fields ?? {};
  return (
    <form action={action} className="form" noValidate>
      {exp && <input type="hidden" name="exp" value={exp} />}
      {quiz && <input type="hidden" name="quiz" value={quiz} />}
      <input type="hidden" name="src" value={quiz ? 'alma-nawi' : exp ? 'experiencia' : 'contacto'} />
      {/* Honeypot: invisible para personas */}
      <div aria-hidden="true" className="hp">
        <label htmlFor="website">No rellenar</label>
        <input id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>
      {expTitle && (
        <p className="form-context">
          Te interesa: <strong>{expTitle}</strong>
        </p>
      )}
      <div className="field">
        <label htmlFor="name">Nombre completo</label>
        <input id="name" name="name" autoComplete="name" required defaultValue={f.name} />
      </div>
      <div className="field">
        <label htmlFor="phone">WhatsApp</label>
        <input id="phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" required placeholder="+52 998 123 4567" defaultValue={f.phone} />
        <span className="hint">Con código de país. Es por donde te escribiremos.</span>
      </div>
      <div className="field">
        <label htmlFor="email">Correo (opcional)</label>
        <input id="email" name="email" type="email" autoComplete="email" defaultValue={f.email} />
      </div>
      <div className="field-row">
        <div className="field">
          <label htmlFor="country">País (opcional)</label>
          <input id="country" name="country" autoComplete="country-name" defaultValue={f.country} />
        </div>
        <div className="field">
          <label htmlFor="city">Ciudad (opcional)</label>
          <input id="city" name="city" autoComplete="address-level2" defaultValue={f.city} />
        </div>
      </div>
      <label className="check">
        <input type="checkbox" name="consent" required />
        <span>
          Autorizo que Almas Viajeras me contacte por WhatsApp o correo sobre mi solicitud. He leído el <Link href="/privacidad">aviso de privacidad</Link>.
        </span>
      </label>
      <label className="check">
        <input type="checkbox" name="marketing" />
        <span>Quiero recibir ideas y ofertas de viaje (opcional, puedo cancelarlo cuando quiera).</span>
      </label>
      {state.error && (
        <p role="alert" className="form-error">
          {state.error}
        </p>
      )}
      <button className="btn btn--gradient btn--lg" type="submit" disabled={pending}>
        {pending ? 'Enviando…' : 'Hablar con un asesor'} <ArrowRight width={18} height={18} />
      </button>
    </form>
  );
}
