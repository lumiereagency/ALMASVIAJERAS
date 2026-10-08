/** Eventos mínimos do escopo (módulo 10). Nunca enviar dados pessoais em `props`. */
export const EVENT_NAMES = [
  'landing_viewed',
  'quiz_started',
  'quiz_step_completed',
  'quiz_completed',
  'recommendation_viewed',
  'experience_viewed',
  'contact_clicked',
] as const;
export type EventName = (typeof EVENT_NAMES)[number];

const KEY = 'av_visitor';

/** Identificador anônimo do navegador (sem PII). */
export function visitorId(): string {
  try {
    let id = localStorage.getItem(KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(KEY, id);
    }
    return id;
  } catch {
    return 'anon';
  }
}

export function track(name: EventName, props: Record<string, string | number | boolean> = {}): void {
  try {
    const body = JSON.stringify({ name, visitorId: visitorId(), props });
    if (navigator.sendBeacon) navigator.sendBeacon('/api/track', new Blob([body], { type: 'application/json' }));
    else void fetch('/api/track', { method: 'POST', body, keepalive: true, headers: { 'content-type': 'application/json' } });
  } catch {
    // Métricas nunca devem quebrar a experiência.
  }
}
