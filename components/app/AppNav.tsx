'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CreditCard, Grid, Home, Inbox, LinkIcon, Settings, Shield, Trending, Users, Wallet } from '@/components/ui/icons';
import type { IconKey, NavItem } from '@/lib/app-nav';

const ICONS: Record<IconKey, typeof Grid> = { grid: Grid, inbox: Inbox, wallet: Wallet, card: CreditCard, trending: Trending, users: Users, shield: Shield, settings: Settings, link: LinkIcon, home: Home };

export function AppNav({ items }: { items: NavItem[] }) {
  const path = usePathname();
  // O item mais específico que casa com a rota atual fica ativo.
  const active = [...items].sort((a, b) => b.href.length - a.href.length).find((i) => path === i.href || path.startsWith(i.href + '/'))?.href;
  return (
    <nav className="rail__nav" aria-label="Navegación principal">
      {items.map((i) => {
        const I = ICONS[i.icon];
        return (
          <Link key={i.href} href={i.href} className={`rail__item ${active === i.href ? 'is-active' : ''}`} aria-current={active === i.href ? 'page' : undefined} title={i.label}>
            <I width={22} height={22} />
            <span>{i.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
