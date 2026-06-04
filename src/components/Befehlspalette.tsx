import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ALLE_KARTEN, type CatalogItem } from '../lib/startseiteConfig';
import { Icon } from './Icon';

// Befehlspalette (⌘K / Ctrl+K): durchsucht Rechner, Vorlagen und Seiten von
// überall — clientseitig, ohne Abhängigkeit. Geprüfte Einträge öffnen direkt;
// geplante erscheinen gedämpft als «In Vorbereitung». Trigger-Knopf inklusive
// (wird im Header gerendert).

type Eintrag = {
  id: string;
  titel: string;
  meta: string;
  href: string | null;  // null = nicht navigierbar (In Vorbereitung)
  gruppe: 'Seiten' | 'Rechner' | 'Vorlagen';
  icon: string;
};

const SEITEN: Eintrag[] = [
  { id: 'p-start', titel: 'Allgemeine Rechner & Vorlagen', meta: 'Startseite', href: '/', gruppe: 'Seiten', icon: 'house' },
  { id: 'p-fachpersonen', titel: 'Fachpersonen — vollständiger Katalog', meta: 'Experten-Panel', href: '/fachpersonen', gruppe: 'Seiten', icon: 'scale' },
  { id: 'p-vorlagen', titel: 'Vorlagen durchsuchen', meta: 'Modus «Vorlagen»', href: '/?modus=vorlagen', gruppe: 'Seiten', icon: 'document' },
  { id: 'p-methodik', titel: 'Methodik — wie LexMetrik rechnet', meta: 'Seite', href: '/methodik', gruppe: 'Seiten', icon: 'clipboard' },
  { id: 'p-ueber', titel: 'Über LexMetrik', meta: 'Seite', href: '/ueber', gruppe: 'Seiten', icon: 'document' },
];

function trifft(k: CatalogItem, q: string, qKompakt: string): boolean {
  return (
    [k.title, k.rechtsgebiet, ...(k.keywords ?? [])].some((t) => t.toLowerCase().includes(q)) ||
    k.norms.some((n) => n.label.toLowerCase().replace(/\s+/g, '').includes(qKompakt))
  );
}

function alsEintrag(k: CatalogItem): Eintrag {
  return {
    id: k.id,
    titel: k.title,
    meta: `${k.rechtsgebiet}${k.status === 'geplant' ? ' · In Vorbereitung' : k.status === 'entwurf' ? ' · Entwurf' : ''}`,
    href: k.status !== 'geplant' && k.href ? k.href : null,
    gruppe: k.modus === 'rechner' ? 'Rechner' : 'Vorlagen',
    icon: k.icon ?? 'document',
  };
}

export function Befehlspalette() {
  const [offen, setOffen] = useState(false);
  const [q, setQ] = useState('');
  const [sel, setSel] = useState(0);
  const eingabeRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const navigate = useNavigate();

  // Globaler Hotkey + Escape
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOffen((o) => !o);
      } else if (e.key === 'Escape') {
        setOffen(false);
      }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);

  // Beim Öffnen: Eingabe fokussieren, Zustand zurücksetzen, Scroll sperren
  useEffect(() => {
    if (!offen) return;
    setQ('');
    setSel(0);
    const t = setTimeout(() => eingabeRef.current?.focus(), 0);
    const vorher = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      clearTimeout(t);
      document.body.style.overflow = vorher;
      triggerRef.current?.focus(); // Fokus zurück auf den Auslöser
    };
  }, [offen]);

  const { gruppen, waehlbar } = useMemo(() => {
    const ql = q.trim().toLowerCase();
    const qK = ql.replace(/\s+/g, '');
    let eintraege: Eintrag[];
    if (ql === '') {
      // Standard: Seiten + alle geprüften Karten
      eintraege = [...SEITEN, ...ALLE_KARTEN.filter((k) => k.status !== 'geplant').map(alsEintrag)];
    } else {
      const seiten = SEITEN.filter((s) => s.titel.toLowerCase().includes(ql));
      const karten = ALLE_KARTEN.filter((k) => trifft(k, ql, qK))
        .sort((a, b) => (a.status === b.status ? 0 : a.status !== 'geplant' ? -1 : 1))
        .map(alsEintrag);
      eintraege = [...seiten, ...karten];
    }
    const gruppen = (['Seiten', 'Rechner', 'Vorlagen'] as const)
      .map((g) => ({ g, items: eintraege.filter((e) => e.gruppe === g) }))
      .filter((x) => x.items.length > 0);
    const waehlbar = eintraege.filter((e) => e.href !== null);
    return { gruppen, waehlbar };
  }, [q]);

  const oeffnen = (e: Eintrag) => {
    if (!e.href) return;
    setOffen(false);
    navigate(e.href);
  };

  const tastatur = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); if (waehlbar.length) setSel((s) => Math.min(s + 1, waehlbar.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); if (waehlbar.length) setSel((s) => Math.max(s - 1, 0)); }
    else if (e.key === 'Enter' && waehlbar[sel]) { e.preventDefault(); oeffnen(waehlbar[sel]); }
    else if (e.key === 'Tab') { e.preventDefault(); } // Fokus bleibt in der Palette (Eingabe + Pfeile)
  };

  return (
    <>
      {/* Trigger im Header */}
      <button ref={triggerRef} type="button" onClick={() => setOffen(true)} aria-label="Suchen (⌘K)"
        className="inline-flex items-center gap-2 h-9 px-2.5 sm:px-3 rounded-lg border border-line bg-surface text-ink-500 hover:text-ink-900 hover:border-brass-400 transition-colors">
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" aria-hidden>
          <circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" />
        </svg>
        <span className="hidden md:inline num text-xs border border-line rounded px-1.5 py-0.5 bg-paper-sunken/60">⌘K</span>
      </button>

      {offen && (
        <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Befehlspalette">
          {/* Hintergrund */}
          <div className="absolute inset-0" onClick={() => setOffen(false)}
            style={{ background: 'color-mix(in srgb, var(--ink-900) 32%, transparent)', backdropFilter: 'blur(2px)' }} />
          {/* Panel */}
          <div className="relative mx-auto mt-[10vh] w-[min(40rem,92vw)] bg-surface-raised border border-line rounded-xl shadow-lg overflow-hidden lc-reveal">
            <div className="flex items-center gap-3 px-4 border-b border-line">
              <svg className="w-5 h-5 text-ink-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" aria-hidden>
                <circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" />
              </svg>
              <input
                ref={eingabeRef} value={q}
                onChange={(e) => { setQ(e.target.value); setSel(0); }}
                onKeyDown={tastatur}
                placeholder="Rechner, Vorlagen oder Artikel suchen (z. B. Art. 336c) …"
                aria-label="Suchen"
                className="w-full bg-transparent py-3.5 text-base text-ink-900 placeholder:text-ink-300 focus:outline-none"
              />
              <span className="num text-xs text-ink-500 border border-line rounded px-1.5 py-0.5 shrink-0">esc</span>
            </div>

            <div className="max-h-[55vh] overflow-y-auto py-2">
              {gruppen.length === 0 && (
                <p className="px-4 py-6 text-body-s text-ink-500 text-center">Keine Treffer für «{q.trim()}».</p>
              )}
              {gruppen.map(({ g, items }) => (
                <div key={g}>
                  <p className="lc-overline px-4 pt-3 pb-1">{g}</p>
                  {items.map((e) => {
                    const aktiv = e.href !== null && waehlbar[sel]?.id === e.id;
                    return (
                      <button key={e.id} type="button" disabled={e.href === null}
                        onClick={() => oeffnen(e)}
                        onMouseMove={() => { const i = waehlbar.findIndex((w) => w.id === e.id); if (i >= 0) setSel(i); }}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                          e.href === null ? 'opacity-50 cursor-default' : aktiv ? 'bg-brass-100/70' : 'hover:bg-brass-100/40'
                        }`}>
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-brass-100 text-brass-700 shrink-0">
                          <Icon name={e.icon} className="w-4 h-4" />
                        </span>
                        <span className="min-w-0">
                          <span className="block text-body-s font-medium text-ink-900 truncate">{e.titel}</span>
                          <span className="block text-xs text-ink-500 truncate">{e.meta}</span>
                        </span>
                        {aktiv && <span aria-hidden className="ml-auto text-brass-700 num text-xs shrink-0">↵</span>}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between px-4 py-2 border-t border-line bg-surface">
              <p className="lc-overline text-ink-500 normal-case" style={{ letterSpacing: '0.04em' }}>↑↓ navigieren · ↵ öffnen · esc schliessen</p>
              <p className="lc-overline text-ink-500">LexMetrik</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
