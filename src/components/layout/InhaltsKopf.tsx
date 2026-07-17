import { Link } from 'react-router-dom';
import type { KopfDaten } from './InhaltsKopfKontext';

// ─── Inhalts-Kopf (Einzelansicht «analog Split-View», ohne Verschiebe-Optionen) ─
//
// Wenn EINE Inhaltsseite offen ist (kein Split-View), trägt sie oben — analog zur
// Split-View-Pane-Titelleiste — einen schmalen Kopfbalken: klickbare Breadcrumb
// «woher man kommt» (Gesetze › Bund › OR), bei Gesetzen in der Mitte der gerade
// gelesene Artikel (live), rechts der Stand + ✕ → Startseite. KEINE Verschiebe-
// /Tausch-Steuerung (es gibt nur diese eine Ansicht). Reine Darstellung (§3).
// Kontext/Helfer (melde, istInhaltsPfad, kopfVonPfad) liegen in InhaltsKopfKontext.ts.

export function InhaltsKopf({ daten, breiteKlasse, onSchliessen }: {
  daten: KopfDaten;
  /** Breitenklasse der Inhaltsspalte → Kopf fluchtet mit dem Inhalt. */
  breiteKlasse: string;
  onSchliessen: () => void;
}) {
  const letzter = daten.breadcrumb.length - 1;
  return (
    // Klebt unter der Topbar (sticky top-16 = 4rem), bleibt beim Scrollen sichtbar
    // (damit der Live-Artikel mitläuft). z ÜBER den Inhalts-Sticky-Leisten (Suche
    // z-16 / Sektions-Kontextkopf z-15), damit das A26-«Ansicht»-Dropdown-Panel
    // beim Aufklappen über sie legt statt dahinter zu verschwinden; die Leiste
    // selbst überlappt sie nicht (sie sitzt 36 px höher), das z ist rein fürs Panel.
    // A41 (David 16.7.2026, Overlay-Bug): z BEWUSST UNTER dem Topbar-Stapelkontext
    // (Topbar sticky z-20). Vorher z-30 > 20 → dieser Kopf legte sich über das
    // GANZE Topbar-Fenster inkl. des Header-Such-Dropdowns (dessen z-30 IM z-20-
    // Topbar-Kontext gefangen ist) → «kopfzeile bei gesetzen verdeckt suchresultate
    // aus dem header». z-[19] hält den Kopf weiter über den Reader-Sticky-Leisten
    // (z-16/z-15 → A26-Panel bleibt oben), lässt aber das Header-Dropdown darüber.
    <div className="sticky top-16 z-[19] border-b border-line bg-paper">
      <div className={`${breiteKlasse} mx-auto px-5 sm:px-6 h-9 grid grid-cols-[1fr_auto_1fr] items-center gap-2`}>
        <nav aria-label="Brotkrümel" className="flex min-w-0 items-center gap-1 text-xs text-ink-500">
          {daten.breadcrumb.map((b, i) => (
            <span key={`${i}-${b.label}`} className="inline-flex min-w-0 items-center gap-1">
              {i > 0 && <span aria-hidden className="text-ink-300">›</span>}
              {b.to
                ? <Link to={b.to} className="truncate no-underline hover:text-brass-700">{b.label}</Link>
                : <span className={`truncate ${i === letzter ? 'text-ink-700 font-medium' : ''}`}>{b.label}</span>}
            </span>
          ))}
        </nav>
        <span className="num justify-self-center text-xs font-medium text-ink-700">{daten.artikel ?? ''}</span>
        <div className="flex items-center justify-self-end gap-2">
          {/* A26 (David 11.7.2026): das grundart-spezifische Bedien-Element (beim
              Gesetzes-Volltext das «Ansicht»-Dropdown) — links vom Stand/✕, damit die
              Darstellungsoptionen immer erreichbar sind, während man im Gesetz ist. */}
          {daten.ansichtSlot}
          {daten.stand && <span className="text-xs text-ink-500">Stand <span className="num">{daten.stand}</span></span>}
          <button type="button" onClick={onSchliessen}
            aria-label="Schliessen (zur Startseite)" title="Schliessen (zur Startseite)"
            className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-line text-ink-500 transition-colors hover:border-brass-400 hover:text-brass-700">
            <span aria-hidden className="text-base leading-none">✕</span>
          </button>
        </div>
      </div>
    </div>
  );
}
