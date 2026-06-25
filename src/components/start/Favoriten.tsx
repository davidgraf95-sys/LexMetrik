import { useState } from 'react';
import { Link } from 'react-router-dom';
import { KATALOG_KARTEN, istVerfuegbar } from '../../lib/startseiteConfig';

// ─── Favoriten / Schnellzugriff (Startseite V2) ─────────────────────────────
//
// Selbst wählbare Direktlinks (Auftrag David): hinzufügen aus dem ganzen
// Katalog, entfernen je Chip. Lokal gespeichert (localStorage, kein Server).
// Reine Darstellung; die Liste leitet sich über href aus dem Katalog ab (§5).

const KEY = 'lexmetrik-favoriten';
const STANDARD = [
  '/rechner/tagerechner', '/rechner/verzugszins', '/rechner/teuerung',
  '/vorlagen/testament', '/vorlagen/schlichtungsgesuch-bs',
];

function laden(): string[] {
  try {
    const roh = localStorage.getItem(KEY);
    const arr = roh ? JSON.parse(roh) : null;
    return Array.isArray(arr) && arr.every((h) => typeof h === 'string') ? arr : STANDARD;
  } catch {
    return STANDARD;
  }
}
function speichern(hrefs: string[]): void {
  try { localStorage.setItem(KEY, JSON.stringify(hrefs)); } catch { /* privater Modus */ }
}

export function Favoriten() {
  const [hrefs, setHrefs] = useState<string[]>(laden);

  const favoriten = hrefs
    .map((href) => KATALOG_KARTEN.find((k) => k.href === href && istVerfuegbar(k)))
    .filter((k): k is NonNullable<typeof k> => !!k);

  const waehlbar = KATALOG_KARTEN
    .filter((k) => istVerfuegbar(k) && !!k.href && !hrefs.includes(k.href!))
    .sort((a, b) => a.title.localeCompare(b.title, 'de'));

  const entfernen = (href: string) => { const n = hrefs.filter((h) => h !== href); setHrefs(n); speichern(n); };
  const hinzufuegen = (href: string) => {
    if (!href || hrefs.includes(href)) return;
    const n = [...hrefs, href]; setHrefs(n); speichern(n);
  };

  return (
    <div className="flex flex-wrap items-center gap-2.5" suppressHydrationWarning>
      {favoriten.map((k) => (
        <span key={k.href}
          className="inline-flex items-center gap-2 bg-surface border border-line rounded-lg pl-3.5 pr-1.5 py-1.5 text-body-s text-ink-900 hover:border-brass-400 transition-colors">
          <span aria-hidden className="w-1.5 h-1.5 rounded-full bg-brass-500 shrink-0" />
          <Link to={k.href!} className="no-underline text-ink-900 hover:text-brass-700">{k.title}</Link>
          <button type="button" onClick={() => entfernen(k.href!)} aria-label={`${k.title} aus Favoriten entfernen`}
            className="inline-flex items-center justify-center w-5 h-5 rounded text-ink-500 hover:text-danger-700 transition-colors">
            <span aria-hidden className="text-xs leading-none">✕</span>
          </button>
        </span>
      ))}

      {waehlbar.length > 0 && (
        <select
          value=""
          onChange={(e) => { hinzufuegen(e.target.value); e.currentTarget.value = ''; }}
          aria-label="Favorit hinzufügen"
          className="lc-input lc-input-sm w-auto max-w-full text-ink-600">
          <option value="">+ Favorit hinzufügen …</option>
          {waehlbar.map((k) => <option key={k.href} value={k.href!}>{k.title}</option>)}
        </select>
      )}
    </div>
  );
}
