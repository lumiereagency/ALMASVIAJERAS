import type { Currency } from '@/domain/money';

/**
 * Catálogo inicial: tours do site atual (almasviajeras.com.mx), preços "Desde" por pessoa em USD
 * (confirmado pelo proprietário em 08/10/2026). Serve de fallback em desenvolvimento e de fonte do
 * seed do banco. Em produção a fonte única é a tabela `experiences`.
 * regions/intents/companions são critérios editoriais do Alma Nawi, sujeitos a revisão da equipe.
 */
export interface SeedExperience {
  slug: string;
  title: string;
  place: string;
  category: string;
  summary: string;
  regions: string[];
  intents: string[];
  companions: string[];
  durationDays: number;
  price: { amount: number; currency: Currency };
  photo: string;
  alt: string;
  position: string;
}

/** Moeda dos preços do catálogo inicial (USD, confirmado pelo proprietário em 08/10/2026). */
export const SEED_CURRENCY: Currency = 'USD';

const ALL = ['solo', 'pareja', 'amigos', 'familia'];

export const SEED_EXPERIENCES: SeedExperience[] = [
  { slug: 'bacalar', title: 'Bacalar, la laguna de los siete colores', place: 'Quintana Roo', category: 'Naturaleza · Descanso', summary: 'Un día entre azules imposibles, para bajar el ritmo.', regions: ['caribe-mexicano'], intents: ['descanso', 'conexion'], companions: ALL, durationDays: 1, price: { amount: 949, currency: SEED_CURRENCY }, photo: '/photos/bacalar.webp', alt: 'Palapa sobre la laguna de Bacalar', position: '50% 40%' },
  { slug: 'chichen-itza', title: 'Chichén Itzá, maravilla del mundo maya', place: 'Yucatán', category: 'Cultura · Historia', summary: 'Historia viva frente a una de las nuevas maravillas del mundo.', regions: ['yucatan'], intents: ['descubrir'], companions: ALL, durationDays: 1, price: { amount: 699, currency: SEED_CURRENCY }, photo: '/photos/chichen-itza.webp', alt: 'Pirámide de Kukulcán en Chichén Itzá', position: '50% 35%' },
  { slug: 'tulum', title: 'Tulum: selva, mar y cenotes', place: 'Quintana Roo', category: 'Cultura · Mar', summary: 'Ruinas frente al Caribe, selva y agua dulce.', regions: ['caribe-mexicano'], intents: ['descubrir', 'descanso'], companions: ALL, durationDays: 1, price: { amount: 1199, currency: SEED_CURRENCY }, photo: '/photos/tulum.webp', alt: 'Ruinas mayas de Tulum frente al Caribe', position: '50% 55%' },
  { slug: 'holbox', title: 'Holbox, la isla del fin del mundo', place: 'Quintana Roo', category: 'Naturaleza · Calma', summary: 'Arena, aves y un ritmo que se siente en el cuerpo.', regions: ['caribe-mexicano'], intents: ['descanso', 'conexion'], companions: ['solo', 'pareja', 'amigos'], durationDays: 1, price: { amount: 1249, currency: SEED_CURRENCY }, photo: '/photos/holbox.webp', alt: 'Garza sobre una barca en Holbox', position: '50% 60%' },
  { slug: 'isla-mujeres', title: 'Isla Mujeres, la joya del Caribe', place: 'Quintana Roo', category: 'Mar · Descanso', summary: 'Aguas turquesa y tiempo para ti.', regions: ['caribe-mexicano'], intents: ['descanso', 'aventura'], companions: ALL, durationDays: 1, price: { amount: 649, currency: SEED_CURRENCY }, photo: '/photos/isla-mujeres.webp', alt: 'Viajera sobre aguas turquesa de Isla Mujeres', position: '50% 35%' },
  { slug: 'cozumel', title: 'Cozumel: arrecife, snorkel y VIP', place: 'Quintana Roo', category: 'Aventura · Mar', summary: 'Arrecife vivo y agua cristalina; opción VIP disponible.', regions: ['caribe-mexicano'], intents: ['aventura', 'descanso'], companions: ALL, durationDays: 1, price: { amount: 849, currency: SEED_CURRENCY }, photo: '/photos/cozumel.webp', alt: 'Mujer flotando en aguas cristalinas de Cozumel', position: '50% 40%' },
  { slug: 'las-coloradas', title: 'Las Coloradas, el mar rosa de México', place: 'Yucatán', category: 'Aventura · Único', summary: 'Un paisaje que no se parece a ningún otro.', regions: ['yucatan'], intents: ['descubrir', 'aventura'], companions: ['pareja', 'amigos', 'familia'], durationDays: 1, price: { amount: 1599, currency: SEED_CURRENCY }, photo: '/photos/las-coloradas.webp', alt: 'Laguna rosa de Las Coloradas', position: '50% 60%' },
  { slug: 'xcaret', title: 'Xcaret: parque, cultura y naturaleza', place: 'Riviera Maya', category: 'Experiencia total', summary: 'Un día completo de naturaleza y cultura para todos.', regions: ['caribe-mexicano'], intents: ['aventura', 'conexion'], companions: ['amigos', 'familia', 'pareja'], durationDays: 1, price: { amount: 2849, currency: SEED_CURRENCY }, photo: '/photos/xcaret.webp', alt: 'Viajeras nadando en un río de Xcaret', position: '50% 70%' },
];

export const seedBySlug = (slug: string) => SEED_EXPERIENCES.find((e) => e.slug === slug);
