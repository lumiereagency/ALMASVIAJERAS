import Image from 'next/image';

export type Tone = 'sea' | 'sunset' | 'forest' | 'sakura' | 'dusk';

/**
 * Preenche o contêiner pai (position: relative). Com `src` usa a fotografia otimizada;
 * sem ela, mostra um fundo de reserva com luz e grão, nunca um bloco liso.
 */
export function Photo({ src, alt, tone, sizes, priority }: { src: string | null; alt: string; tone: Tone; sizes: string; priority?: boolean }) {
  if (src) return <Image src={src} alt={alt} fill sizes={sizes} priority={priority} style={{ objectFit: 'cover' }} />;
  return <div className={`photo-fallback photo-fallback--${tone}`} role="img" aria-label={alt} />;
}
