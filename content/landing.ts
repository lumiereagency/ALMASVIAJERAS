/**
 * Conteúdo da landing, tomado do site atual (almasviajeras.com.mx, com autorização do proprietário).
 * Fotografias em /public/photos (WebP, sem EXIF). Os tours viram registros de `experiences` quando o
 * catálogo existir no banco; até lá esta é a fonte.
 *
 * ATENÇÃO: o site atual exibe preços como "$949" sem moeda. Assumimos MXN (agência mexicana); confirmar.
 */
export type Tone = 'sea' | 'sunset' | 'forest' | 'sakura' | 'dusk';

export interface Slot {
  photo: string | null;
  alt: string;
  tone: Tone;
  /** object-position da fotografia (ponto focal). */
  position?: string;
}

export const HERO: Slot & { place: string; caption: string } = {
  photo: '/photos/isla-mujeres.webp',
  alt: 'Viajera caminando de la mano sobre aguas turquesa de Isla Mujeres',
  tone: 'sea',
  position: '50% 35%',
  place: 'Isla Mujeres, Quintana Roo',
  caption: 'Aguas turquesa, historias que se quedan contigo.',
};

export const FEATURED = [
  { slug: 'bacalar', badge: 'Naturaleza · Descanso', place: 'Quintana Roo', title: 'Bacalar, la laguna de los siete colores', days: 1, price: 'Desde $949 MXN', photo: '/photos/bacalar.webp', alt: 'Palapa sobre la laguna de Bacalar', tone: 'sea', position: '50% 40%' },
  { slug: 'tulum', badge: 'Cultura · Mar', place: 'Quintana Roo', title: 'Tulum: selva, mar y cenotes', days: 1, price: 'Desde $1,199 MXN', photo: '/photos/tulum.webp', alt: 'Ruinas mayas de Tulum frente al Caribe', tone: 'sea', position: '50% 55%' },
  { slug: 'las-coloradas', badge: 'Aventura · Único', place: 'Yucatán', title: 'Las Coloradas, el mar rosa de México', days: 1, price: 'Desde $1,599 MXN', photo: '/photos/las-coloradas.webp', alt: 'Laguna rosa de Las Coloradas', tone: 'sunset', position: '50% 60%' },
] as const;

export const DESTINATIONS = [
  { slug: 'cozumel', name: 'Cozumel', line: 'Arrecife, snorkel y experiencias VIP', photo: '/photos/cozumel.webp', alt: 'Mujer flotando en aguas cristalinas de Cozumel', tone: 'sea', position: '50% 40%' },
  { slug: 'holbox', name: 'Holbox', line: 'La isla del fin del mundo', photo: '/photos/holbox.webp', alt: 'Garza sobre una barca en Holbox', tone: 'sea', position: '50% 60%' },
  { slug: 'chichen-itza', name: 'Chichén Itzá', line: 'Maravilla del mundo maya', photo: '/photos/chichen-itza.webp', alt: 'Pirámide de Kukulcán en Chichén Itzá', tone: 'forest', position: '50% 35%' },
  { slug: 'xcaret', name: 'Xcaret', line: 'Parque, cultura y naturaleza', photo: '/photos/xcaret.webp', alt: 'Viajeras nadando en un río de Xcaret', tone: 'forest', position: '50% 70%' },
] as const;

export const VIP = {
  title: 'Más que un viaje, una experiencia sin límites',
  perks: [
    { icon: 'crown', label: 'Atención personalizada' },
    { icon: 'star', label: 'Experiencias exclusivas' },
    { icon: 'diamond', label: 'Beneficios en aliados' },
    { icon: 'heart', label: 'Comunidad de Enviajadores' },
  ],
  story: { title: 'Acompañamiento humano antes, durante y después de tu viaje', photo: '/photos/experiencias-tours.webp', alt: 'Grupo de viajeros en Chichén Itzá', tone: 'sea' as Tone, position: '50% 55%' },
  /** Sin video real no se muestra botón de reproducir. */
  videoUrl: null as string | null,
};

/** Filosofía publicada por la agencia en su sitio actual. */
export const PHILOSOPHY = {
  quote: 'Creemos que viajar no es escapar de tu vida, sino encontrarte con ella. Cada tour, cada viaje grupal, cada itinerario personalizado está diseñado para que regreses diferente: más libre, más conectado, más tú.',
  motto: 'No vendemos vuelos. Acompañamos almas.',
  name: 'Jesús Ibarra, “Chuy Mochilero”',
  role: 'Fundador de Almas Viajeras',
  photo: '/photos/viajes-personalizados.webp',
  alt: 'Viajero contemplando el atardecer sobre el mar en un pueblo blanco del Mediterráneo',
  tone: 'dusk' as Tone,
  position: '60% 55%',
};

export const SOCIAL = [{ label: 'Instagram', href: 'https://instagram.com/almasviajerasmx' }];
