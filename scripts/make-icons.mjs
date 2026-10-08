// Gera os ícones do PWA a partir do símbolo da marca. Uso: node scripts/make-icons.mjs
import fs from 'node:fs';
import sharp from 'sharp';

const SRC = 'public/brand/simbolo-gradiente-transparente.png';
const BG = '#061633';
fs.mkdirSync('public/icons', { recursive: true });

async function icon(size, ratio, out) {
  const inner = Math.round(size * ratio);
  const mark = await sharp(SRC).resize(inner, inner, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).toBuffer();
  await sharp({ create: { width: size, height: size, channels: 4, background: BG } })
    .composite([{ input: mark, gravity: 'center' }])
    .png()
    .toFile(out);
  console.log(out);
}

await icon(192, 0.66, 'public/icons/icon-192.png');
await icon(512, 0.66, 'public/icons/icon-512.png');
await icon(512, 0.52, 'public/icons/maskable-512.png'); // zona segura para máscaras circulares
await icon(180, 0.66, 'public/icons/apple-touch-icon.png');
