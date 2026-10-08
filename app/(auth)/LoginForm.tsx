'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { requestPasswordReset, signIn, type FormState } from './actions';

const initial: FormState = {};

export function LoginForm({ next, notice }: { next?: string; notice?: string }) {
  const [state, action, pending] = useActionState(signIn, initial);
  const message = state.error ?? notice;
  return (
    <form action={action} className="form" noValidate>
      {next && <input type="hidden" name="next" value={next} />}
      <div className="field">
        <label htmlFor="email">Correo electrónico</label>
        <input id="email" name="email" type="email" autoComplete="email" required placeholder="nombre@correo.com" />
      </div>
      <div className="field">
        <label htmlFor="password">Contraseña</label>
        <input id="password" name="password" type="password" autoComplete="current-password" required minLength={8} />
      </div>
      {message && (
        <p role="alert" className="form-error">
          {message}
        </p>
      )}
      <button className="btn btn--primary" type="submit" disabled={pending}>
        {pending ? 'Entrando…' : 'Entrar'}
      </button>
      <Link href="/recuperar" className="link-arrow">
        Olvidé mi contraseña
      </Link>
    </form>
  );
}

export function RecoverForm() {
  const [state, action, pending] = useActionState(requestPasswordReset, initial);
  return (
    <form action={action} className="form" noValidate>
      <div className="field">
        <label htmlFor="email">Correo electrónico</label>
        <input id="email" name="email" type="email" autoComplete="email" required />
        <span className="hint">Te enviaremos un enlace para crear una nueva contraseña.</span>
      </div>
      {state.ok && (
        <p role="status" className="form-ok">
          {state.ok}
        </p>
      )}
      <button className="btn btn--primary" type="submit" disabled={pending}>
        {pending ? 'Enviando…' : 'Enviar enlace'}
      </button>
      <Link href="/entrar" className="link-arrow">
        Volver a entrar
      </Link>
    </form>
  );
}
