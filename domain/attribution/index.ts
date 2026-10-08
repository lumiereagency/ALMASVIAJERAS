import { createHmac, timingSafeEqual } from 'node:crypto';

export interface Touch {
  enviajadorId: string;
  referralLinkId?: string;
  /** ISO 8601 */
  at: string;
}

export interface AttributionSnapshot {
  first: Touch | null;
  last: Touch | null;
  winner: Touch | null;
  rule: 'last_valid_touch';
  windowDays: number;
  computedAt: string;
}

/** Formato: base64url(payload).base64url(hmac). payload = slug|issuedAtMs */
export function signRef(slug: string, secret: string, issuedAt: Date): string {
  const payload = Buffer.from(`${slug}|${issuedAt.getTime()}`).toString('base64url');
  const mac = createHmac('sha256', secret).update(payload).digest('base64url');
  return `${payload}.${mac}`;
}

export function verifyRef(
  token: string,
  secret: string,
  now: Date,
  maxAgeDays: number,
): { slug: string; issuedAt: Date } | null {
  const [payload, mac] = token.split('.');
  if (!payload || !mac) return null;
  const expected = createHmac('sha256', secret).update(payload).digest('base64url');
  const a = Buffer.from(mac);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  const [slug, ts] = Buffer.from(payload, 'base64url').toString().split('|');
  const issued = Number(ts);
  if (!slug || !Number.isFinite(issued)) return null;
  const age = now.getTime() - issued;
  if (age < 0 || age > maxAgeDays * 86_400_000) return null;
  return { slug, issuedAt: new Date(issued) };
}

/**
 * Regra do MVP: último Enviajador válido antes da criação do lead, dentro da janela.
 * `excludedIds` remove autovisitas (o próprio Enviajador/admin).
 */
export function resolveAttribution(
  touches: Touch[],
  leadCreatedAt: Date,
  windowDays = 30,
  excludedIds: string[] = [],
): AttributionSnapshot {
  const limit = leadCreatedAt.getTime();
  const from = limit - windowDays * 86_400_000;
  const valid = touches
    .filter((t) => !excludedIds.includes(t.enviajadorId))
    .filter((t) => {
      const ts = Date.parse(t.at);
      return ts <= limit && ts >= from;
    })
    .sort((a, b) => Date.parse(a.at) - Date.parse(b.at));

  const first = valid[0] ?? null;
  const last = valid[valid.length - 1] ?? null;
  return {
    first,
    last,
    winner: last,
    rule: 'last_valid_touch',
    windowDays,
    computedAt: leadCreatedAt.toISOString(),
  };
}
