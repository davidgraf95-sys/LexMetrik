import { useEffect, useRef } from 'react';
import type { NormSnapshot } from '../lib/normtext/typen';
import { textFragment } from '../lib/normtext/passus';

// Norm-Vorschau-Popover (§7 Zitat-Ausnahme): zeigt den Volltext des zitierten
// Artikels aus einem Snapshot, die zitierte Stelle hervorgehoben, mit Stand +
// sichtbarem Live-Link zur GELTENDEN Fassung (massgeblich, §8) und einem
// Disclaimer. Reine Darstellung (§3) — kein Normtext wird hier erzeugt, alles
// kommt aus dem übergebenen Snapshot. Rein clientseitig; window-/document-
// Zugriffe sind in useEffect gekapselt, damit Prerender/SSR nicht bricht.

/** Reiner Helfer: true für die Schliess-Taste (Esc). Ausgelagert, damit die
 *  Schliesslogik ohne DOM testbar ist (node-Test-Env ohne jsdom). */
export function istSchliessTaste(e: { key: string }): boolean {
  return e.key === 'Escape' || e.key === 'Esc';
}

export function NormPopover({ snapshot, passus, onClose }: {
  snapshot: NormSnapshot;
  passus: { absatz: string | null };
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const schliessRef = useRef<HTMLButtonElement>(null);

  // Esc schliesst; Fokus beim Öffnen auf den Schliess-Button (A11y). Beides nur
  // im Browser — useEffect läuft im SSR/Prerender nicht, window-Zugriff bleibt
  // also gekapselt.
  useEffect(() => {
    schliessRef.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (istSchliessTaste(e)) onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Der hervorgehobene Block bestimmt das Text-Fragment des Live-Links; ohne
  // Hervorhebung der erste Block. So springt der amtliche Link genau zur
  // zitierten Stelle (Chromium hebt hervor, andere ignorieren das Fragment).
  const hervor = passus.absatz != null
    ? snapshot.bloecke.find((b) => b.absatz === passus.absatz)
    : undefined;
  const fragmentText = (hervor ?? snapshot.bloecke[0])?.text ?? '';
  // textFragment liefert '#:~:text=…'. Hat die Quelle-URL schon einen Anker
  // (…#art_335_c), teilen sich Anker und Text-Fragment EIN # (das führende #
  // des Fragments entfällt) → '…#art_335_c:~:text=…'. So bleibt der Artikel-
  // Anker auch ohne Text-Fragment-Unterstützung gültig (kein doppeltes #).
  const frag = textFragment(fragmentText);
  const liveUrl = snapshot.quelleUrl.includes('#')
    ? snapshot.quelleUrl + frag.slice(1)
    : snapshot.quelleUrl + frag;
  const titel = `${snapshot.artikelLabel} ${snapshot.erlass}`;

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={titel}
      tabIndex={-1}
      className="lc-card w-full max-w-xl max-h-[80vh] overflow-y-auto p-0 text-left"
    >
      {/* Kopf */}
      <div className="flex items-start justify-between gap-3 border-b border-line px-5 py-3">
        <div className="min-w-0">
          <p className="lc-overline text-brass-700">Norm-Vorschau</p>
          <h2 className="text-body-l font-semibold text-ink-900 truncate">
            {snapshot.artikelLabel} <span className="text-ink-500 font-normal">{snapshot.erlass}</span>
          </h2>
        </div>
        <button
          ref={schliessRef}
          type="button"
          onClick={onClose}
          aria-label="Schliessen"
          className="lc-btn-ghost lc-btn-sm shrink-0 px-2"
        >
          ✕
        </button>
      </div>

      {/* Body: alle Blöcke in Reihenfolge, Fedlex-Stil mit hochgestellter
          Absatznummer; der zitierte Block hervorgehoben. */}
      <div className="px-5 py-4 space-y-2.5">
        {snapshot.bloecke.map((b, i) => {
          const istPassus = passus.absatz != null && b.absatz === passus.absatz;
          return (
            <p
              key={i}
              data-passus={istPassus ? 'true' : 'false'}
              className={`text-body-s leading-relaxed ${
                istPassus
                  ? 'rounded-md border-l-4 border-brass-500 bg-brass-100 px-3 py-2 text-ink-900'
                  : 'text-ink-700'
              }`}
            >
              {b.absatz != null && (
                <sup className="num mr-1 font-semibold text-ink-500">{b.absatz}</sup>
              )}
              {b.text}
            </p>
          );
        })}
      </div>

      {/* Fuss: Stand · Live-Link zur geltenden Fassung · Disclaimer (§8). */}
      <div className="border-t border-line px-5 py-3 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs text-ink-500">Stand: <span className="num">{snapshot.stand}</span></span>
          <a
            href={liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="lc-chip no-underline hover:text-brass-700"
          >
            ↗ geltende Fassung
          </a>
        </div>
        <p className="text-micro text-ink-500">
          Snapshot — massgeblich ist die amtliche Fassung (Live-Link oben).
        </p>
      </div>
    </div>
  );
}
