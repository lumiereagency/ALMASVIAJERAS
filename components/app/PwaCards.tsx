'use client';

/* Detectar recursos do navegador (instalação, notificações) só é possível após a hidratação:
   setState em efeito é intencional neste arquivo. */
/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useState } from 'react';
import { Bell, Download, Smartphone } from '@/components/ui/icons';
import { removePush, savePush } from '@/app/ajustes/actions';

interface InstallEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => undefined);
    }
  }, []);
  return null;
}

export function InstallCard() {
  const [evt, setEvt] = useState<InstallEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [ios, setIos] = useState(false);

  useEffect(() => {
    const standalone = window.matchMedia('(display-mode: standalone)').matches || (navigator as unknown as { standalone?: boolean }).standalone === true;
    setInstalled(standalone);
    setIos(/iphone|ipad|ipod/i.test(navigator.userAgent) && !standalone);
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setEvt(e as InstallEvent);
    };
    const onInstalled = () => setInstalled(true);
    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  async function install() {
    if (!evt) return;
    await evt.prompt();
    const c = await evt.userChoice;
    if (c.outcome === 'accepted') setInstalled(true);
    setEvt(null);
  }

  return (
    <section className="card pwa">
      <span className="pwa__icon"><Smartphone width={26} height={26} /></span>
      <div className="pwa__body">
        <h2>Instala la app en tu pantalla de inicio</h2>
        {installed ? (
          <p className="muted">Listo: ya usas Almas Viajeras como app.</p>
        ) : ios ? (
          <p className="muted">En iPhone: toca <strong>Compartir</strong> y luego <strong>Añadir a pantalla de inicio</strong>.</p>
        ) : evt ? (
          <p className="muted">Acceso con un toque, pantalla completa y carga más rápida.</p>
        ) : (
          <p className="muted">Si tu navegador lo permite, verás aquí el botón de instalar. También puedes usar el menú del navegador → «Instalar app».</p>
        )}
      </div>
      {evt && !installed && (
        <button type="button" className="btn btn--primary btn--sm" onClick={install}>
          <Download width={16} height={16} /> Instalar
        </button>
      )}
    </section>
  );
}

const b64 = (s: string) => {
  const pad = '='.repeat((4 - (s.length % 4)) % 4);
  const raw = atob((s + pad).replace(/-/g, '+').replace(/_/g, '/'));
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
};

export function NotificationsCard() {
  const [perm, setPerm] = useState<'unsupported' | NotificationPermission>('default');
  const [on, setOn] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const vapid = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

  useEffect(() => {
    if (!('Notification' in window) || !('serviceWorker' in navigator)) return setPerm('unsupported');
    setPerm(Notification.permission);
    navigator.serviceWorker.getRegistration().then(async (r) => setOn(Notification.permission === 'granted' && !!(await r?.pushManager.getSubscription())));
  }, []);

  async function enable() {
    setBusy(true);
    setMsg(null);
    try {
      const p = await Notification.requestPermission();
      setPerm(p);
      if (p !== 'granted') return;
      const reg = await navigator.serviceWorker.ready;
      if (vapid) {
        const sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64(vapid) });
        await savePush(sub.toJSON() as { endpoint: string; keys: { p256dh: string; auth: string } });
        setOn(true);
      }
      await reg.showNotification('Notificaciones activadas', { body: 'Te avisaremos de lo importante en Almas Viajeras.', icon: '/icons/icon-192.png' });
      setMsg(vapid ? null : 'Permiso concedido. Las alertas fuera de la app se activarán cuando el equipo configure las claves push del servidor.');
    } catch {
      setMsg('No se pudo activar. Revisa los permisos del navegador.');
    } finally {
      setBusy(false);
    }
  }

  async function disable() {
    setBusy(true);
    try {
      const reg = await navigator.serviceWorker.getRegistration();
      const sub = await reg?.pushManager.getSubscription();
      if (sub) {
        await removePush(sub.endpoint);
        await sub.unsubscribe();
      }
      setOn(false);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="card pwa">
      <span className="pwa__icon"><Bell width={26} height={26} /></span>
      <div className="pwa__body">
        <h2>Notificaciones</h2>
        {perm === 'unsupported' && <p className="muted">Tu navegador no admite notificaciones.</p>}
        {perm === 'denied' && <p className="muted">Las bloqueaste en el navegador. Habilítalas desde los permisos del sitio.</p>}
        {(perm === 'default' || perm === 'granted') && <p className="muted">Entérate al instante de nuevos leads, ventas y comisiones.</p>}
        {msg && <p className="hint">{msg}</p>}
      </div>
      {(perm === 'default' || (perm === 'granted' && !on)) && (
        <button type="button" className="btn btn--primary btn--sm" onClick={enable} disabled={busy}>
          Activar
        </button>
      )}
      {perm === 'granted' && on && (
        <button type="button" className="btn btn--secondary btn--sm" onClick={disable} disabled={busy}>
          Desactivar
        </button>
      )}
    </section>
  );
}
