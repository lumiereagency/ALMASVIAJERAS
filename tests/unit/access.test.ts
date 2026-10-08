import { describe, expect, it } from 'vitest';
import { canAccess, homeFor, isPrivatePath, requiredRolesFor, safeNext } from '@/lib/auth/access';
import { currentPrice, formatMoney, nightsLabel } from '@/domain/catalog';

describe('controle de acesso por rota', () => {
  it('rotas públicas não exigem papel', () => {
    for (const p of ['/', '/experiencias', '/experiencias/x', '/enviajadores', '/entrar']) expect(isPrivatePath(p)).toBe(false);
  });
  it('/enviajador é privado mas /enviajadores (landing) não', () => {
    expect(isPrivatePath('/enviajador')).toBe(true);
    expect(isPrivatePath('/enviajador/leads')).toBe(true);
    expect(requiredRolesFor('/enviajadores')).toBeNull();
  });
  it('cada área aceita só os papéis corretos', () => {
    expect(canAccess(['staff'], '/admin')).toBe(false);
    expect(canAccess(['admin'], '/admin/usuarios')).toBe(true);
    expect(canAccess(['staff'], '/equipe')).toBe(true);
    expect(canAccess(['enviajador'], '/equipe')).toBe(false);
    expect(canAccess(['traveler'], '/enviajador')).toBe(false);
    expect(canAccess([], '/viajante')).toBe(false);
  });
  it('destino pós-login segue o papel mais alto', () => {
    expect(homeFor(['staff', 'admin'])).toBe('/admin');
    expect(homeFor(['enviajador'])).toBe('/enviajador');
    expect(homeFor([])).toBe('/');
  });
  it('safeNext bloqueia open redirect', () => {
    expect(safeNext('/equipe')).toBe('/equipe');
    for (const bad of ['https://evil.com', '//evil.com', '/\\evil.com', '', null, undefined]) expect(safeNext(bad)).toBeNull();
  });
});

describe('catálogo', () => {
  it('preço vigente é o mais recente não futuro', () => {
    const prices = [
      { amount: 100, currency: 'MXN' as const, validFrom: '2026-01-01' },
      { amount: 120, currency: 'MXN' as const, validFrom: '2026-09-01' },
      { amount: 150, currency: 'MXN' as const, validFrom: '2027-01-01' },
    ];
    expect(currentPrice(prices, '2026-10-08')?.amount).toBe(120);
    expect(currentPrice(prices, '2025-01-01')).toBeNull();
  });
  it('moeda sempre explícita', () => {
    expect(formatMoney(18900, 'MXN')).toBe('$18,900 MXN');
    expect(formatMoney(1200.5, 'EUR')).toBe('€1,200.5 EUR');
  });
  it('rótulo de duração', () => expect(nightsLabel(5)).toBe('5 días · 4 noches'));
});
