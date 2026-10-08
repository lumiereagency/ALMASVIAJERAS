/**
 * Conteúdo da landing. Itens marcados SAMPLE vêm do mockup aprovado e NÃO são dados reais:
 * substituir por catálogo (tabela `experiences`) e depoimentos verificados antes de publicar.
 * `photo: null` = usa o fundo de reserva até existir fotografia em /public/photos.
 */
export interface Slot {
  photo: string | null;
  alt: string;
  tone: 'sea' | 'sunset' | 'forest' | 'sakura' | 'dusk';
}

export const HERO: Slot & { place: string; caption: string } = {
  photo: null,
  alt: 'Viajera frente a un mar turquesa en la Riviera Maya',
  tone: 'sea',
  place: 'Riviera Maya, México',
  caption: 'Aguas turquesa, historias que se quedan contigo.',
};

// SAMPLE
export const FEATURED = [
  { slug: 'cenotes-alma-caribena', badge: 'Naturaleza · Bienestar', place: 'Riviera Maya, México', title: 'Cenotes sagrados y alma caribeña', days: 5, nights: 4, price: '$18,900 MXN', photo: null, alt: 'Nadadora en un cenote iluminado por rayos de sol', tone: 'forest' },
  { slug: 'grecia-islas-mediterraneo', badge: 'Cultura · Exploración', place: 'Grecia', title: 'Islas, historia y vida mediterránea', days: 8, nights: 7, price: '$32,400 MXN', photo: null, alt: 'Pueblo blanco con cúpulas azules al atardecer', tone: 'sunset' },
  { slug: 'peru-montanas-proposito', badge: 'Conexión · Aventura', place: 'Perú', title: 'Montañas, cultura y propósito', days: 7, nights: 6, price: '$24,800 MXN', photo: null, alt: 'Machu Picchu entre nubes', tone: 'dusk' },
] as const;

// SAMPLE
export const DESTINATIONS = [
  { name: 'México', line: 'Naturaleza, cultura y alma caribeña', photo: null, alt: 'Playa con palmeras', tone: 'sea' },
  { name: 'Grecia', line: 'Historia, islas y vida mediterránea', photo: null, alt: 'Santorini', tone: 'sunset' },
  { name: 'Perú', line: 'Aventura, cultura y propósito', photo: null, alt: 'Machu Picchu', tone: 'forest' },
  { name: 'Japón', line: 'Tradición, equilibrio y asombro', photo: null, alt: 'Monte Fuji y cerezos', tone: 'sakura' },
] as const;

export const VIP = {
  title: 'Más que un viaje, una experiencia sin límites',
  perks: [
    { icon: 'crown', label: 'Atención personalizada' },
    { icon: 'star', label: 'Experiencias exclusivas' },
    { icon: 'diamond', label: 'Beneficios en aliados' },
    { icon: 'heart', label: 'Comunidad de Enviajadores' },
  ],
  story: { title: 'Mira cómo nuestros viajes transforman vidas', photo: null as string | null, alt: 'Tortuga marina nadando', tone: 'sea' as const },
  /** Sin video real no se muestra botón de reproducir. */
  videoUrl: null as string | null,
};

// SAMPLE: reemplazar por testimonio real y autorizado
export const TESTIMONIAL = {
  quote: 'Almas Viajeras me regaló un viaje que cambió mi forma de ver el mundo. Conocí lugares increíbles, pero sobre todo, personas que hoy son parte de mi vida.',
  name: 'Mariana López',
  role: 'Enviajadora desde 2022',
  photo: null as string | null,
  alt: 'Viajero sentado frente a un atardecer sobre el mar',
  tone: 'dusk' as const,
};

export const SOCIAL = [{ label: 'Instagram', href: 'https://instagram.com/almasviajerasmx' }];
