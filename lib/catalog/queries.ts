import { currentPrice } from '@/domain/catalog';
import type { Currency } from '@/domain/money';
import { SEED_EXPERIENCES, type SeedExperience } from '@/content/catalog-seed';
import { createClient } from '@/lib/supabase/server';

/** Fonte única do catálogo: usada por vitrine, quiz e painel do Enviajador. */
export interface CatalogExperience {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  description: string | null;
  category: string;
  regions: string[];
  intents: string[];
  companions: string[];
  durationDays: number;
  faq: { q: string; a: string }[];
  price: { amount: number; currency: Currency } | null;
  coverPath: string | null;
  coverAlt: string | null;
  departures: { startsOn: string; endsOn: string | null }[];
}

interface Row {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  description: string | null;
  category: string;
  regions: string[];
  intents: string[];
  companions: string[];
  duration_days: number;
  faq: { q: string; a: string }[] | null;
  experience_prices: { amount: number; currency: Currency; valid_from: string }[];
  experience_media: { storage_path: string; alt: string; is_cover: boolean; position: number }[];
  experience_departures: { starts_on: string; ends_on: string | null; available: boolean }[];
}

const SELECT =
  'id, slug, title, summary, description, category, regions, intents, companions, duration_days, faq,' +
  ' experience_prices(amount, currency, valid_from), experience_media(storage_path, alt, is_cover, position),' +
  ' experience_departures(starts_on, ends_on, available)';

export function toCatalogExperience(r: Row, today: string): CatalogExperience {
  const price = currentPrice(
    r.experience_prices.map((p) => ({ amount: Number(p.amount), currency: p.currency, validFrom: p.valid_from })),
    today,
  );
  const cover = [...r.experience_media].sort((a, b) => Number(b.is_cover) - Number(a.is_cover) || a.position - b.position)[0];
  return {
    id: r.id,
    slug: r.slug,
    title: r.title,
    summary: r.summary,
    description: r.description,
    category: r.category,
    regions: r.regions,
    intents: r.intents,
    companions: r.companions,
    durationDays: r.duration_days,
    faq: r.faq ?? [],
    price: price && { amount: price.amount, currency: price.currency },
    coverPath: cover?.storage_path ?? null,
    coverAlt: cover?.alt ?? null,
    departures: r.experience_departures
      .filter((d) => d.available && d.starts_on >= today)
      .sort((a, b) => a.starts_on.localeCompare(b.starts_on))
      .map((d) => ({ startsOn: d.starts_on, endsOn: d.ends_on })),
  };
}

/** Sem banco configurado (desenvolvimento), usa o seed no mesmo formato. */
function fromSeed(s: SeedExperience): CatalogExperience {
  return {
    id: s.slug,
    slug: s.slug,
    title: s.title,
    summary: s.summary,
    description: null,
    category: s.category,
    regions: s.regions,
    intents: s.intents,
    companions: s.companions,
    durationDays: s.durationDays,
    faq: [],
    price: s.price,
    coverPath: s.photo,
    coverAlt: s.alt,
    departures: [],
  };
}

const todayISO = () => new Date().toISOString().slice(0, 10);

export async function listPublishedExperiences(): Promise<CatalogExperience[]> {
  const supabase = await createClient();
  if (!supabase) return SEED_EXPERIENCES.map(fromSeed);
  const { data, error } = await supabase.from('experiences').select(SELECT).eq('status', 'published').order('title');
  if (error) throw new Error(`Catálogo indisponible: ${error.message}`);
  return ((data ?? []) as unknown as Row[]).map((r) => toCatalogExperience(r, todayISO()));
}

export async function getPublishedExperience(slug: string): Promise<CatalogExperience | null> {
  const supabase = await createClient();
  if (!supabase) {
    const s = SEED_EXPERIENCES.find((e) => e.slug === slug);
    return s ? fromSeed(s) : null;
  }
  const { data, error } = await supabase.from('experiences').select(SELECT).eq('slug', slug).eq('status', 'published').maybeSingle();
  if (error) throw new Error(`Catálogo indisponible: ${error.message}`);
  return data ? toCatalogExperience(data as unknown as Row, todayISO()) : null;
}
