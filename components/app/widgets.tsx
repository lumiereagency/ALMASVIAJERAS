import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ChevronLeft, ChevronRight } from '@/components/ui/icons';
import { Sparkline } from './charts';

/** Faixa de boas-vindas com a marca em evidência (gradiente atmosférico + símbolo como marca d'água). */
export function Banner({ eyebrow, title, text, cta }: { eyebrow: string; title: string; text: string; cta?: { href: string; label: string } }) {
  return (
    <section className="banner">
      <Image src="/brand/simbolo-gradiente-transparente.png" alt="" width={360} height={360} className="banner__mark" aria-hidden="true" />
      <div className="banner__copy">
        <p className="banner__eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p>{text}</p>
        {cta && (
          <Link href={cta.href} className="btn btn--primary btn--sm banner__cta">
            {cta.label} <ArrowRight width={16} height={16} />
          </Link>
        )}
      </div>
    </section>
  );
}

export function Stat({ id, label, value, delta, data, icon }: { id: string; label: string; value: string; delta?: number | null; data?: number[]; icon?: React.ReactNode }) {
  return (
    <div className="stat">
      <div className="stat__top">
        <span className="stat__icon">{icon}</span>
        {delta !== undefined && delta !== null && (
          <span className={`delta ${delta >= 0 ? 'delta--up' : 'delta--down'}`}>
            {delta >= 0 ? '+' : ''}
            {delta}%
          </span>
        )}
      </div>
      <p className="stat__label">{label}</p>
      <p className="stat__value">{value}</p>
      {data && <Sparkline data={data} id={id} w={150} h={38} />}
    </div>
  );
}

export function Card({ title, aside, children, className = '' }: { title?: string; aside?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={`card ${className}`}>
      {(title || aside) && (
        <header className="card__head">
          {title && <h2>{title}</h2>}
          {aside}
        </header>
      )}
      {children}
    </section>
  );
}

export function AvatarStack({ names }: { names: string[] }) {
  return (
    <div className="avatars" aria-label={`${names.length} personas`}>
      {names.slice(0, 5).map((n, i) => (
        <span key={n + i} className={`avatar avatar--${i % 5}`}>
          {n.charAt(0).toUpperCase()}
        </span>
      ))}
      {names.length > 5 && <span className="avatar avatar--more">+{names.length - 5}</span>}
    </div>
  );
}

/** Calendário do mês com pontos nos dias que tiveram atividade. */
export function CalendarCard({ title = 'Actividad del mes', counts, now = new Date() }: { title?: string; counts: Record<string, number>; now?: Date }) {
  const y = now.getUTCFullYear();
  const m = now.getUTCMonth();
  const first = new Date(Date.UTC(y, m, 1));
  const offset = (first.getUTCDay() + 6) % 7; // semana começa na segunda
  const days = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
  const today = now.getUTCDate();
  const cells: (number | null)[] = [...Array(offset).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)];
  const monthName = first.toLocaleDateString('es-MX', { month: 'long', year: 'numeric', timeZone: 'UTC' });
  return (
    <Card
      title={title}
      aside={
        <span className="cal__nav" aria-hidden="true">
          <ChevronLeft width={16} height={16} />
          <ChevronRight width={16} height={16} />
        </span>
      }
    >
      <p className="cal__month">{monthName}</p>
      <div className="cal" role="grid" aria-label={monthName}>
        {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, i) => (
          <span key={d + i} className="cal__dow">
            {d}
          </span>
        ))}
        {cells.map((d, i) => {
          if (!d) return <span key={`e${i}`} />;
          const key = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
          const c = counts[key] ?? 0;
          return (
            <span key={key} className={`cal__day ${d === today ? 'is-today' : ''} ${c ? 'has' : ''}`} title={c ? `${c} nuevos` : undefined}>
              {d}
              {c > 0 && <i />}
            </span>
          );
        })}
      </div>
    </Card>
  );
}
