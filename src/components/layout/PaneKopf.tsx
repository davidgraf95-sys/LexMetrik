import type { DragEvent, ReactNode } from 'react';

// ─── Pane-Kopf (Split-View «Fensterkopf», Auftrag David) ────────────────────
//
// EINE Titelleiste je Pane, IDENTISCH für primär + sekundär, nur im Multipane
// montiert (1-Pane-Default trägt keine Chrome → byte-gleich). Sagt, WAS im Pane
// liegt (Icon · Label · Stand) und trägt die Pane-Steuerung rechts:
// ⠿ Ziehgriff · ◂/▸ Umsortieren (Tastatur/Touch) · [zum Hauptfenster] · [teilen] · ✕.
// Reine Darstellung (§3); Tokens-only (§13). Sitzt AUSSERHALB des Scroll-
// Containers (echte Leiste, kein sticky-Hack).

export interface PaneKopfProps {
  icon?: ReactNode;
  label: string;
  /** In-Kraft-/Konsolidierungs-Stand, nur wenn auflösbar (§8 — kein erfundener Stand). */
  stand?: string | null;
  /** F: Breadcrumb «Gesetze › Bund › OR» statt blossem Label (Parität zur Einzelansicht);
   *  im Pane reine Anzeige (keine Navigation — der Pane-Navigator liegt nicht hier). */
  breadcrumb?: { label: string; to?: string }[];
  /** F: aktuell gelesener Artikel (Gesetz, live), z. B. «Art. 7 OR». */
  artikel?: string | null;
  rolle: 'primaer' | 'sekundaer';
  onSchliessen: () => void;
  /** Sekundär: dieses Pane zum Hauptfenster (URL) machen. */
  onHauptfenster?: () => void;
  /** Sekundär: Layout-Link kopieren. */
  onTeilen?: () => void;
  /** Umsortieren (Tastatur/Touch). disabled an den Enden. */
  onLinks?: () => void;
  onRechts?: () => void;
  kannLinks?: boolean;
  kannRechts?: boolean;
  /** HTML5-Drag-Handler für den ⠿-Griff (nur wenn ziehbar, d. h. ≥2 Panes). */
  ziehbar?: boolean;
  onDragStart?: (e: DragEvent) => void;
  onDragEnd?: (e: DragEvent) => void;
}

const knopf = 'inline-flex h-7 w-7 items-center justify-center rounded-md text-ink-500 hover:text-brass-700 hover:bg-brass-100/40 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-ink-500 transition-colors';

export function PaneKopf({ icon, label, stand, breadcrumb, artikel, rolle, onSchliessen, onHauptfenster, onTeilen, onLinks, onRechts, kannLinks, kannRechts, ziehbar, onDragStart, onDragEnd }: PaneKopfProps) {
  return (
    <div className={`shrink-0 grid grid-cols-[1fr_auto] items-center gap-2 h-9 px-1.5 border-b border-line bg-paper ${rolle === 'primaer' ? 'border-l-2 border-l-brass-700' : ''}`}>
      {/* Links: Identität (Icon · Label · Stand). */}
      <div className="flex min-w-0 items-center gap-1.5 pl-1">
        {ziehbar && (
          <span
            draggable
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            aria-hidden
            title="Zum Verschieben ziehen"
            className="shrink-0 cursor-grab active:cursor-grabbing select-none px-0.5 text-ink-400 hover:text-brass-600"
          >⠿</span>
        )}
        {icon && <span className="shrink-0">{icon}</span>}
        {breadcrumb && breadcrumb.length > 0 ? (
          // Breadcrumb (Parität zur Einzelansicht) — reine Anzeige (keine Navigation
          // im Pane), daher KEIN <nav>-Landmark (sonst gleichnamige Landmark-Flut bei
          // mehreren Panes). Plus laufender Artikel + Stand (rechts angehängt).
          <span className="flex min-w-0 items-center gap-1 text-body-s">
            {breadcrumb.map((b, i) => (
              <span key={`${i}-${b.label}`} className="inline-flex min-w-0 items-center gap-1">
                {i > 0 && <span aria-hidden className="shrink-0 text-ink-300">›</span>}
                <span className={`truncate ${i === breadcrumb.length - 1 ? 'font-medium text-ink-800' : 'text-ink-500'}`}>{b.label}</span>
              </span>
            ))}
          </span>
        ) : (
          <span className="truncate text-body-s font-medium text-ink-800">{label}</span>
        )}
        {artikel && <span className="num shrink-0 text-micro font-medium text-ink-700">· {artikel}</span>}
        {stand && <span className="num shrink-0 text-micro text-ink-500">· Stand {stand}</span>}
        {rolle === 'primaer' && <span className="sr-only">(aktuelle Adresse)</span>}
      </div>
      {/* Rechts: Steuerung. */}
      <div className="flex items-center">
        {onLinks && (
          <button type="button" className={knopf} disabled={!kannLinks} onClick={onLinks} aria-label={`«${label}» nach links`}>
            <span aria-hidden className="text-body-s leading-none">◂</span>
          </button>
        )}
        {onRechts && (
          <button type="button" className={knopf} disabled={!kannRechts} onClick={onRechts} aria-label={`«${label}» nach rechts`}>
            <span aria-hidden className="text-body-s leading-none">▸</span>
          </button>
        )}
        {onHauptfenster && (
          <button type="button" className={knopf} onClick={onHauptfenster} aria-label={`«${label}» zum Hauptfenster machen`} title="Zum Hauptfenster machen">
            <span aria-hidden className="text-body-s leading-none">⇱</span>
          </button>
        )}
        {onTeilen && (
          <button type="button" className={knopf} onClick={onTeilen} aria-label="Layout-Link kopieren" title="Layout-Link kopieren">
            <span aria-hidden className="text-base leading-none">⧉</span>
          </button>
        )}
        <button type="button" className={`${knopf} hover:text-danger-700`} onClick={onSchliessen}
          aria-label={rolle === 'primaer' ? 'Hauptfenster schliessen' : `«${label}» schliessen`}
          title={rolle === 'primaer' ? 'Hauptfenster schliessen' : 'Schliessen'}>
          <span aria-hidden className="text-body-s leading-none">✕</span>
        </button>
      </div>
    </div>
  );
}
