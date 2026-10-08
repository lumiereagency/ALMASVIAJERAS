export type IconKey = 'grid' | 'inbox' | 'wallet' | 'card' | 'trending' | 'users' | 'shield' | 'settings' | 'link' | 'home';
export interface NavItem {
  href: string;
  label: string;
  icon: IconKey;
}
export type Area = 'admin' | 'equipe' | 'enviajador' | 'viajante';

const SETTINGS: NavItem = { href: '/ajustes', label: 'Ajustes', icon: 'settings' };

export const AREA_LABEL: Record<Area, string> = {
  admin: 'Administración',
  equipe: 'Equipo',
  enviajador: 'Enviajador',
  viajante: 'Viajero',
};

export function navFor(area: Area, isAdmin = false): NavItem[] {
  switch (area) {
    case 'admin':
      return [
        { href: '/admin', label: 'Resumen', icon: 'grid' },
        { href: '/equipe', label: 'Leads', icon: 'inbox' },
        { href: '/admin/finanzas', label: 'Finanzas', icon: 'wallet' },
        { href: '/admin/pagos', label: 'Pagos', icon: 'card' },
        { href: '/admin/comisiones', label: 'Comisiones', icon: 'trending' },
        { href: '/admin/enviajadores', label: 'Enviajadores', icon: 'link' },
        { href: '/admin/usuarios', label: 'Usuarios', icon: 'shield' },
        SETTINGS,
      ];
    case 'equipe':
      return [{ href: '/equipe', label: 'Leads', icon: 'inbox' }, ...(isAdmin ? [{ href: '/admin', label: 'Admin', icon: 'grid' as IconKey }] : []), SETTINGS];
    case 'enviajador':
      return [{ href: '/enviajador', label: 'Panel', icon: 'grid' }, SETTINGS];
    default:
      return [{ href: '/viajante', label: 'Inicio', icon: 'home' }, SETTINGS];
  }
}

/** Área de entrada de cada papel (para /ajustes, comum a todos). */
export function areaOf(roles: string[]): Area {
  if (roles.includes('admin')) return 'admin';
  if (roles.includes('staff')) return 'equipe';
  if (roles.includes('enviajador')) return 'enviajador';
  return 'viajante';
}
