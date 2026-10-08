import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Almas Viajeras',
    short_name: 'Almas',
    description: 'Viajes que te transforman: descubre, recomienda y gestiona tu experiencia.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#061633',
    theme_color: '#061633',
    lang: 'es',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
    shortcuts: [
      { name: 'Alma Nawi', url: '/alma-nawi' },
      { name: 'Mi panel', url: '/enviajador' },
    ],
  };
}
