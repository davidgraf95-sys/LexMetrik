import { useEffect, useRef } from 'react';
import type { NormSnapshot } from '../lib/normtext/typen';
import { textFragment } from '../lib/normtext/passus';
import { istSchliessTaste } from '../lib/normtext/tasten';
import { bestimmePassusZiel } from '../lib/normtext/passusZiel';
import { ArtikelBody } from './normtext/ArtikelBody';

// Norm-Vorschau-Popover (§7 Zitat-Ausnahme): zeigt den Volltext des zitierten
// Artikels aus einem Snapshot, die zitierte Stelle hervorgehoben, mit Stand +
// sichtbarem Live-Link zur GELTENDEN Fassung (massgeblich, §8) und einem
// Disclaimer. Reine Darstellung (§3) — kein Normtext wird hier erzeugt, alles
// kommt aus dem übergebenen Snapshot. Rein clientseitig; window-/document-
// Zugriffe sind in useEffect gekapselt, damit Prerender/SSR nicht bricht.
// Esc-Helfer in lib/normtext/tasten.ts; die Artikel-Blöcke rendert die geteilte
// Komponente ArtikelBody (auch in der Gesetzes-Lesesicht, Rubrik V), die
// Passus-Ziel-Bestimmung der geteilte Helfer bestimmePassusZiel — eine
// Darstellungswahrheit (§5/§10).

// Datum IMMER als DD.MM.YYYY anzeigen (Design-Regel David 17.6.2026). Snapshots
// speichern ISO 'YYYY-MM-DD'; nicht-ISO-Werte (Altbestand) unverändert lassen.
function formatiereDatum(iso: string): string {
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return m ? `${m[3]}.${m[2]}.${m[1]}` : iso;
}

export function NormPopover({ snapshot, passus, onClose }: {
  snapshot: NormSnapshot;
  passus: { absatz: string | null; lit?: string; ziff?: string };
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const schliessRef = useRef<HTMLButtonElement>(null);
  // Ref auf die markierte Stelle (Item oder Block) — für Scroll-ins-Sichtfeld.
  // Nur gesetzt, wenn ein Treffer vorhanden ist; sonst null → kein Scrollen.
  const passusRef = useRef<HTMLElement>(null);

  // Esc schliesst; Fokus beim Öffnen auf den Schliess-Button (A11y). Beides nur
  // im Browser — useEffect läuft im SSR/Prerender nicht, window-Zugriff bleibt
  // also gekapselt.
  useEffect(() => {
    schliessRef.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (istSchliessTaste(e)) onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Markierte Stelle ins Sichtfeld scrollen (block:'center', sofort/auto).
  // Läuft unabhängig vom Fokus-Effekt; scrollIntoView ohne focus() — Fokus
  // bleibt auf dem Schliess-Button. Kein Scrollen, wenn kein Treffer gesetzt.
  // SSR-sicher: useEffect läuft im Prerender nicht, Markup bleibt unverändert.
  useEffect(() => {
    passusRef.current?.scrollIntoView({ block: 'center', behavior: 'auto' });
  }, []);

  // Geteilte Passus-Ziel-Bestimmung: derselbe Treffer steuert die Hervorhebung
  // (in ArtikelBody) UND das Text-Fragment des Live-Links (hier im Fuss).
  const { hervorBlock, hervorItem } = bestimmePassusZiel(snapshot.bloecke, passus);

  // Der hervorgehobene Block/Item bestimmt das Text-Fragment des Live-Links;
  // ohne Hervorhebung der erste Block. Ist ein konkretes Item zitiert, springt
  // das Fragment auf den Item-Text (sonst auf den Absatz-Einleitungstext). So
  // springt der amtliche Link genau zur zitierten Stelle (Chromium hebt hervor,
  // andere ignorieren das Fragment).
  const fragmentText = hervorItem?.text
    ?? (hervorBlock ?? snapshot.bloecke[0])?.text
    ?? '';
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

      {/* Body: alle Blöcke in Reihenfolge (Fedlex-Stil), zitierte Stelle
          hervorgehoben — gerendert von der geteilten ArtikelBody-Komponente.
          Der passusRef erlaubt das Scrollen zur markierten Stelle (Popover). */}
      <ArtikelBody
        bloecke={snapshot.bloecke}
        artikel={snapshot.artikel}
        passus={passus}
        passusRef={passusRef}
      />

      {/* Fuss: In Kraft seit · Live-Link zur geltenden Fassung · Disclaimer (§8). */}
      <div className="border-t border-line px-5 py-3 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs text-ink-500">
            {snapshot.ebene === 'bund' ? 'Fassung vom: ' : 'In Kraft seit: '}
            <span className="num">{formatiereDatum(snapshot.stand)}</span>
          </span>
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
