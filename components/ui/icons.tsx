import type { ReactNode, SVGProps } from 'react';

/** Biblioteca única: grade de 24 px, traço 1.75, cantos arredondados (docs/visual-identity.md §11). */
function Icon({ children, ...p }: SVGProps<SVGSVGElement> & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={24}
      height={24}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...p}
    >
      {children}
    </svg>
  );
}
type P = SVGProps<SVGSVGElement>;

export const ArrowRight = (p: P) => (
  <Icon {...p}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </Icon>
);
export const Search = (p: P) => (
  <Icon {...p}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="m20 20-4.2-4.2" />
  </Icon>
);
export const Menu = (p: P) => (
  <Icon {...p}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </Icon>
);
export const Palm = (p: P) => (
  <Icon {...p}>
    <path d="M12 21V11M12 11c-1-3-4-4.5-7-4 2 .3 3.5 1.5 4 3M12 11c1-3 4-4.5 7-4-2 .3-3.5 1.5-4 3M12 11c0-3-1-5.5-3.5-6.5M12 11c0-3 1-5.5 3.5-6.5M7 21h10" />
  </Icon>
);
export const Mountain = (p: P) => (
  <Icon {...p}>
    <path d="m3 19 6.5-11 3.5 6 2-3L21 19H3Z" />
  </Icon>
);
export const People = (p: P) => (
  <Icon {...p}>
    <circle cx="9" cy="8" r="3" />
    <path d="M3.5 19c.5-3 2.7-5 5.5-5s5 2 5.5 5" />
    <circle cx="17" cy="9" r="2.3" />
    <path d="M16.5 14.2c2.2.2 3.6 1.9 4 4.3" />
  </Icon>
);
export const Sun = (p: P) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="3.5" />
    <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6 7 7M17 17l1.4 1.4M18.4 5.6 17 7M7 17l-1.4 1.4" />
  </Icon>
);
export const Tag = (p: P) => (
  <Icon {...p}>
    <path d="M3.5 12.5V4.5h8l9 9-8 8-9-9Z" />
    <circle cx="8" cy="9" r="1.2" />
  </Icon>
);
export const Crown = (p: P) => (
  <Icon {...p}>
    <path d="m3.5 8 4.5 4 4-6 4 6 4.5-4-1.5 10h-14L3.5 8Z" />
  </Icon>
);
export const Star = (p: P) => (
  <Icon {...p}>
    <path d="m12 3.5 2.6 5.4 5.9.8-4.3 4.1 1 5.9-5.2-2.8-5.2 2.8 1-5.9L3.5 9.7l5.9-.8L12 3.5Z" />
  </Icon>
);
export const Diamond = (p: P) => (
  <Icon {...p}>
    <path d="M7 4h10l4 5-9 11L3 9l4-5Z M3 9h18M9.5 4 8 9l4 11 4-11-1.5-5" />
  </Icon>
);
export const Heart = (p: P) => (
  <Icon {...p}>
    <path d="M12 20s-7.5-4.5-7.5-10A4.3 4.3 0 0 1 12 7.6 4.3 4.3 0 0 1 19.5 10c0 5.5-7.5 10-7.5 10Z" />
  </Icon>
);
export const Play = (p: P) => (
  <Icon {...p} fill="currentColor" strokeWidth={0}>
    <path d="M8 5.5v13a1 1 0 0 0 1.5.9l10-6.5a1 1 0 0 0 0-1.8l-10-6.5A1 1 0 0 0 8 5.5Z" />
  </Icon>
);
export const Instagram = (p: P) => (
  <Icon {...p}>
    <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17" cy="7" r=".6" fill="currentColor" />
  </Icon>
);

export const User = (p: P) => (
  <Icon {...p}>
    <circle cx="12" cy="8" r="3.5" />
    <path d="M5 20c.8-3.6 3.5-5.5 7-5.5s6.2 1.9 7 5.5" />
  </Icon>
);
export const Home = (p: P) => (
  <Icon {...p}>
    <path d="m4 11 8-6.5 8 6.5M6 9.5V20h12V9.5" />
    <path d="M10 20v-5h4v5" />
  </Icon>
);
export const Compass = (p: P) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="m15.5 8.5-2 5-5 2 2-5 5-2Z" />
  </Icon>
);
export const Waves = (p: P) => (
  <Icon {...p}>
    <path d="M3 9c2 0 2-1.5 4.5-1.5S10 9 12 9s2.5-1.5 4.5-1.5S19 9 21 9M3 14c2 0 2-1.5 4.5-1.5S10 14 12 14s2.5-1.5 4.5-1.5S19 14 21 14M3 19c2 0 2-1.5 4.5-1.5S10 19 12 19s2.5-1.5 4.5-1.5S19 19 21 19" />
  </Icon>
);
export const Pin = (p: P) => (
  <Icon {...p}>
    <path d="M12 21s6.5-5.6 6.5-11a6.5 6.5 0 0 0-13 0C5.5 15.4 12 21 12 21Z" />
    <circle cx="12" cy="10" r="2.3" />
  </Icon>
);
export const Clock = (p: P) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 2" />
  </Icon>
);
export const Plus = (p: P) => (
  <Icon {...p}>
    <path d="M12 5v14M5 12h14" />
  </Icon>
);
export const Minus = (p: P) => (
  <Icon {...p}>
    <path d="M5 12h14" />
  </Icon>
);
export const Check = (p: P) => (
  <Icon {...p}>
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </Icon>
);
export const Alert = (p: P) => (
  <Icon {...p}>
    <path d="M12 4 2.8 19.5h18.4L12 4Z" />
    <path d="M12 10v4.2M12 17v.01" />
  </Icon>
);
export const ArrowLeft = (p: P) => (
  <Icon {...p}>
    <path d="M19 12H5M11 6l-6 6 6 6" />
  </Icon>
);
export const Sparkle = (p: P) => (
  <Icon {...p}>
    <path d="M12 3.5 13.9 10 20.5 12 13.9 14 12 20.5 10.1 14 3.5 12 10.1 10 12 3.5Z" />
  </Icon>
);
