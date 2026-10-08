import Link from 'next/link';
import { Sun, Tag, ArrowRight } from '@/components/ui/icons';
import { Photo, type Tone } from '@/components/ui/Photo';
import { formatMoney } from '@/domain/catalog';
import type { CatalogExperience } from '@/lib/catalog/queries';

const TONES: Tone[] = ['forest', 'sunset', 'dusk', 'sea', 'sakura'];

export function ExperienceCard({ e, index = 0 }: { e: CatalogExperience; index?: number }) {
  return (
    <Link href={`/experiencias/${e.slug}`} className="exp-card" style={{ minHeight: 400 }}>
      <Photo src={e.coverPath} alt={e.coverAlt ?? e.title} tone={TONES[index % TONES.length]!} sizes="(max-width: 700px) 100vw, 33vw" />
      <span className="pill">{e.category}</span>
      <div className="exp-card__body">
        <h3 className="h3">{e.title}</h3>
        <p className="meta">
          <span>
            <Sun width={16} height={16} /> {e.durationDays} días · {Math.max(e.durationDays - 1, 0)} noches
          </span>
          <span>
            <Tag width={16} height={16} /> {e.price ? `Desde ${formatMoney(e.price.amount, e.price.currency)}` : 'Precio a consultar'}
          </span>
        </p>
      </div>
      <span className="round-btn" aria-hidden="true">
        <ArrowRight width={18} height={18} />
      </span>
    </Link>
  );
}
