'use client';

import { useActionState } from 'react';
import { completeProfile, signUpEnviajador, type RegState } from './actions';

const init: RegState = {};

function Messages({ state }: { state: RegState }) {
  return (
    <>
      {state.error && (
        <p role="alert" className="form-error">
          {state.error}
        </p>
      )}
      {state.ok && (
        <p role="status" className="form-ok">
          {state.ok}
        </p>
      )}
    </>
  );
}

export function SignupForm() {
  const [state, action, pending] = useActionState(signUpEnviajador, init);
  return (
    <form action={action} className="form" noValidate>
      <div className="field">
        <label htmlFor="name">Tu nombre</label>
        <input id="name" name="name" autoComplete="name" required />
      </div>
      <div className="field">
        <label htmlFor="slug">Tu enlace personal</label>
        <input id="slug" name="slug" autoComplete="off" required placeholder="maria-viajera" pattern="[a-z0-9-]{3,40}" />
        <span className="hint">Será almasviajeras.com.mx/e/tu-enlace. Solo minúsculas, números y guiones.</span>
      </div>
      <div className="field">
        <label htmlFor="email">Correo electrónico</label>
        <input id="email" name="email" type="email" autoComplete="email" required />
      </div>
      <div className="field">
        <label htmlFor="password">Contraseña</label>
        <input id="password" name="password" type="password" autoComplete="new-password" minLength={8} required />
        <span className="hint">Mínimo 8 caracteres.</span>
      </div>
      <Messages state={state} />
      <button className="btn btn--gradient btn--lg" type="submit" disabled={pending}>
        {pending ? 'Creando…' : 'Crear mi cuenta'}
      </button>
    </form>
  );
}

export function ProfileForm({ name, slug }: { name?: string; slug?: string }) {
  const [state, action, pending] = useActionState(completeProfile, init);
  return (
    <form action={action} className="form" noValidate>
      <div className="field">
        <label htmlFor="name">Tu nombre</label>
        <input id="name" name="name" autoComplete="name" required defaultValue={name} />
      </div>
      <div className="field">
        <label htmlFor="slug">Tu enlace personal</label>
        <input id="slug" name="slug" autoComplete="off" required defaultValue={slug} pattern="[a-z0-9-]{3,40}" />
      </div>
      <div className="field">
        <label htmlFor="bio">Tu historia en una frase (opcional)</label>
        <input id="bio" name="bio" maxLength={500} />
      </div>
      <Messages state={state} />
      <button className="btn btn--gradient btn--lg" type="submit" disabled={pending}>
        {pending ? 'Guardando…' : 'Activar mi perfil'}
      </button>
    </form>
  );
}
