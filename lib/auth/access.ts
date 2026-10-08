export type Role = 'traveler' | 'enviajador' | 'staff' | 'admin';

/** Prefixo privado → papéis aceitos. Casa por segmento: /enviajador ≠ /enviajadores (landing pública). */
const PRIVATE: { prefix: string; roles: Role[] }[] = [
  { prefix: '/admin', roles: ['admin'] },
  { prefix: '/equipe', roles: ['staff', 'admin'] },
  { prefix: '/enviajador', roles: ['enviajador'] },
  { prefix: '/viajante', roles: ['traveler'] },
  { prefix: '/ajustes', roles: ['traveler', 'enviajador', 'staff', 'admin'] },
];

const matches = (pathname: string, prefix: string) => pathname === prefix || pathname.startsWith(prefix + '/');

export function requiredRolesFor(pathname: string): Role[] | null {
  return PRIVATE.find((p) => matches(pathname, p.prefix))?.roles ?? null;
}

export function isPrivatePath(pathname: string): boolean {
  return requiredRolesFor(pathname) !== null;
}

export function canAccess(roles: Role[], pathname: string): boolean {
  const required = requiredRolesFor(pathname);
  return required === null || required.some((r) => roles.includes(r));
}

/** Destino após login, do papel mais poderoso para o menos. */
export function homeFor(roles: Role[]): string {
  if (roles.includes('admin')) return '/admin';
  if (roles.includes('staff')) return '/equipe';
  if (roles.includes('enviajador')) return '/enviajador';
  if (roles.includes('traveler')) return '/viajante';
  return '/';
}

/** Aceita apenas caminhos internos, evitando open redirect via ?next=. */
export function safeNext(next: string | null | undefined): string | null {
  if (!next || !next.startsWith('/') || next.startsWith('//') || next.includes('\\')) return null;
  return next;
}
