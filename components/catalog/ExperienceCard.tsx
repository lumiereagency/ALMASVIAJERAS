import Link from 'next/link';
import { formatMoney, nightsLabel } from '@/domain/catalog';
import type { CatalogExperience } from '@/lib/catalog/queries';

const PLACEHOLDERS = ['media--ph-1', 'media--ph-2', 'media--ph-3'];

export function ExperienceCard({ e, index = 0 }: { e: CatalogExperience; index?: number }) {
  return (
    <Link href={`/experiencias/${e.slug}`} className={`media exp-card ${PLACEHOLDERS[index % PLACEHOLDERS.length]}`} style={{ minHeight: 360 }}>
      <span className="badge">{e.category}</span>
      <div className="media__caption">
        <span className="h3">{e.title}</span>
        <span className="meta">
          <span>{nightsLabel(e.durationDays)}</span>
          <span>{e.price ? `Desde ${formatMoney(e.price.amount, e.price.currency)}` : 'Precio a consultar'}</span>
        </span>
      </div>
    </Link>
  );
}
