import Link from 'next/link';
import { Alert, ArrowRight, Check } from '@/components/ui/icons';
import { Photo } from '@/components/ui/Photo';
import { formatMoney, nightsLabel } from '@/domain/catalog';
import type { Recommendation } from '@/domain/recommendations/rank';
import type { CatalogExperience } from '@/lib/catalog/queries';

function affinity(score: number) {
  return score >= 80 ? 'Afinidad muy alta' : score >= 60 ? 'Afinidad alta' : 'Afinidad media';
}

export function RecommendationCard({
  exp,
  rec,
  people,
  badge,
  referenceRate,
  lead = false,
}: {
  exp: CatalogExperience;
  rec: Recommendation;
  people: number;
  badge: string;
  referenceRate: boolean;
  lead?: boolean;
}) {
  return (
    <article className={`rec ${lead ? 'rec--lead' : ''}`}>
      <Link href={`/experiencias/${exp.slug}`} className="rec__media" aria-label={`Ver ${exp.title}`}>
        <Photo src={exp.coverPath} alt={exp.coverAlt ?? exp.title} tone="sea" sizes="(max-width: 860px) 100vw, 40vw" />
        <span className="pill">{badge}</span>
      </Link>
      <div className="rec__body">
        <p className="eyebrow">
          {exp.category} · {nightsLabel(exp.durationDays)}
        </p>
        <h3 className="h3">{exp.title}</h3>
        <p className="rec__affinity">{affinity(rec.score)}</p>

        <ul className="reasons" aria-label="Por qué te la recomendamos">
          {rec.reasons.map((r) => (
            <li key={r}>
              <Check width={18} height={18} /> {r}
            </li>
          ))}
        </ul>
        {rec.warnings.length > 0 && (
          <ul className="warnings" aria-label="Ten en cuenta">
            {rec.warnings.map((w) => (
              <li key={w}>
                <Alert width={18} height={18} /> {w}
              </li>
            ))}
          </ul>
        )}

        <div className="rec__price">
          <div>
            <span className="muted">Total estimado · {people} {people === 1 ? 'persona' : 'personas'}</span>
            <strong>{formatMoney(rec.totalCost, rec.currency)}</strong>
          </div>
          {exp.price && <span className="muted">Desde {formatMoney(exp.price.amount, exp.price.currency)} por persona</span>}
        </div>
        {rec.fxRate && rec.fxRateDate && (
          <p className="hint">
            Convertido a {rec.currency} con tipo de cambio {rec.fxRate.toFixed(2)} del {rec.fxRateDate}
            {referenceRate ? ' (referencial)' : ''}.
          </p>
        )}
        <Link href={`/experiencias/${exp.slug}`} className="btn btn--primary">
          Ver la experiencia <ArrowRight width={18} height={18} />
        </Link>
      </div>
    </article>
  );
}
