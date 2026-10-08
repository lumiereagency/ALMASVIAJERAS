import type { Metadata, Viewport } from 'next';
import { Inter, Sora } from 'next/font/google';
import { ServiceWorkerRegister } from '@/components/app/PwaCards';
import './globals.css';
import './nawi.css';
import './pages.css';
import './dash.css';

const sora = Sora({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-sora', display: 'swap' });
const inter = Inter({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--font-inter', display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.SITE_URL ?? 'http://localhost:3000'),
  title: { default: 'Almas Viajeras — Viajes que te transforman', template: '%s · Almas Viajeras' },
  description:
    'Viajes personalizados que combinan experiencias auténticas, bienestar y conexión humana en los destinos más extraordinarios del mundo.',
  openGraph: { type: 'website', siteName: 'Almas Viajeras', locale: 'es_MX' },
  icons: { icon: '/brand/simbolo-gradiente-transparente.png', apple: '/icons/apple-touch-icon.png' },
  appleWebApp: { capable: true, title: 'Almas', statusBarStyle: 'black-translucent' },
};

export const viewport: Viewport = { themeColor: '#F8F6F1', width: 'device-width', initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${sora.variable} ${inter.variable}`}>
      <body>
        <a href="#contenido" className="sr-only">
          Ir al contenido
        </a>
        {children}
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
