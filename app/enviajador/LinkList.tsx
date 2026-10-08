'use client';

import { useState } from 'react';

type Item = { label: string; url: string; title: string };
const TONES = {
  inspirador: (t: string, u: string) => `Hay viajes que te cambian por dentro. ${t}: ${u}`,
  directo: (t: string, u: string) => `${t}. Mira detalles y precio aquí: ${u}`,
  cercano: (t: string, u: string) => `Te lo recomiendo de corazón: ${t}. Aquí lo ves: ${u}`,
} as const;

export function LinkList({ items }: { items: Item[] }) {
  const [tone, setTone] = useState<keyof typeof TONES>('inspirador');
  const [copied, setCopied] = useState<string | null>(null);
  async function copy(key: string, text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(null), 1800);
    } catch {
      // Sin permiso de portapapeles: el enlace sigue visible para copiarlo a mano.
    }
  }
  return (
    <div className="stack">
      <div className="field" style={{ maxWidth: 280 }}>
        <label htmlFor="tone">Estilo del texto para compartir</label>
        <select id="tone" value={tone} onChange={(e) => setTone(e.target.value as keyof typeof TONES)}>
          <option value="inspirador">Inspirador</option>
          <option value="directo">Directo</option>
          <option value="cercano">Cercano</option>
        </select>
      </div>
      <ul className="links">
        {items.map((it) => (
          <li key={it.url}>
            <div>
              <strong>{it.label}</strong>
              <code>{it.url}</code>
            </div>
            <div className="row-actions">
              <button type="button" className="btn btn--secondary btn--sm" onClick={() => copy(it.url, it.url)}>
                {copied === it.url ? '¡Copiado!' : 'Copiar enlace'}
              </button>
              <button type="button" className="btn btn--primary btn--sm" onClick={() => copy(`t-${it.url}`, TONES[tone](it.title, it.url))}>
                {copied === `t-${it.url}` ? '¡Copiado!' : 'Copiar texto'}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
