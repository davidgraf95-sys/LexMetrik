import React, { useEffect, useRef } from 'react';
import type { NormSnapshot } from '../lib/normtext/typen';
import { textFragment } from '../lib/normtext/passus';
import { istSchliessTaste } from '../lib/normtext/tasten';

// Norm-Vorschau-Popover (§7 Zitat-Ausnahme): zeigt den Volltext des zitierten
// Artikels aus einem Snapshot, die zitierte Stelle hervorgehoben, mit Stand +
// sichtbarem Live-Link zur GELTENDEN Fassung (massgeblich, §8) und einem
// Disclaimer. Reine Darstellung (§3) — kein Normtext wird hier erzeugt, alles
// kommt aus dem übergebenen Snapshot. Rein clientseitig; window-/document-
// Zugriffe sind in useEffect gekapselt, damit Prerender/SSR nicht bricht.
// Esc-Helfer in lib/normtext/tasten.ts (eslint: Komponenten-Datei exportiert
// nur Komponenten).

// Vergleichs-Normalisierung für lit/Ziff-Marken: case-insensitive, ohne
// umschliessende Punkte/Klammern/Leerzeichen ('a)', '(a)', '17.', ' b ' → 'a',
// '17', 'b'). Innere Suffixe (z.B. '5a', '20a', 'bis') bleiben erhalten — die
// Marke wird nur an den Rändern gesäubert, damit lit/Ziff aus dem Zitat exakt
// gegen die Snapshot-Marke matcht (einheitlich Bund-lit ↔ Kanton-Ziff).
function markeNorm(s: string): string {
  return s.trim().replace(/^[.()\s]+|[.()\s]+$/g, '').toLowerCase();
}

// «aufgehoben»: faithful-Snapshot trägt für aufgehobene Stellen (§7) nur das
// Auslassungszeichen «…» (ggf. mit Punkten/Whitespace). Rein Darstellung (§3):
// gedämpftes «aufgehoben» statt des nackten «…»; gilt für Absätze UND Items.
function istAufgehoben(text: string): boolean {
  return /^[….\s]*$/.test(text) && text.trim() !== '';
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

  // Präzise lit/Ziff-Markierung: ist ein lit/ziff zitiert, wird GENAU das Item
  // markiert; das umschliessende Absatz wird dezent gekennzeichnet. Sonst (nur
  // Absatz zitiert) wird der ganze Absatz-Block hervorgehoben (wie bisher).
  // Bund (lit) und Kanton (ziff) laufen über dieselbe Marke — eine normalisierte
  // Vergleichs-Marke, ein Render-Pfad (Einheitlichkeit §3/§5).
  const passusMarke = passus.lit != null
    ? markeNorm(passus.lit)
    : passus.ziff != null ? markeNorm(passus.ziff) : null;

  // Der hervorgehobene Block bestimmt das Text-Fragment des Live-Links; ohne
  // Hervorhebung der erste Block. Ist ein konkretes Item zitiert, springt das
  // Fragment auf den Item-Text (sonst auf den Absatz-Einleitungstext). So
  // springt der amtliche Link genau zur zitierten Stelle (Chromium hebt hervor,
  // andere ignorieren das Fragment).
  const hervorBlock = passus.absatz != null
    ? snapshot.bloecke.find((b) => b.absatz === passus.absatz)
    : undefined;
  // GENAU EIN Item-Treffer (B1): der erste in Dokumentreihenfolge, dessen Block
  // als Ziel gilt UND dessen Marke passt. Ist ein Absatz zitiert, beschränkt
  // sich die Suche auf diesen Block; sonst (Marke ohne Absatz, typisch Kanton-§)
  // wird über alle Blöcke gesucht — aber nur der ERSTE Treffer markiert, nicht
  // jeder gleichnamige in mehreren Blöcken.
  const zielItemKey = (() => {
    if (passusMarke == null) return null;
    for (let bi = 0; bi < snapshot.bloecke.length; bi++) {
      const b = snapshot.bloecke[bi];
      const istZielBlock = passus.absatz == null || b.absatz === passus.absatz;
      if (!istZielBlock || b.items == null) continue;
      const ji = b.items.findIndex((it) => markeNorm(it.marke) === passusMarke);
      if (ji >= 0) return { bi, ji };
    }
    return null;
  })();
  const hervorItem = zielItemKey != null
    ? snapshot.bloecke[zielItemKey.bi].items![zielItemKey.ji]
    : undefined;
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

      {/* Body: alle Blöcke in Reihenfolge, Fedlex-Stil mit hochgestellter
          Absatznummer; die zitierte Stelle hervorgehoben. Markierungs-Logik
          (EINHEITLICH Bund-lit ↔ Kanton-Ziff, ein Pfad):
          - lit/ziff zitiert (passusMarke gesetzt): der Absatz-Block wird nur
            DEZENT umrandet, GENAU das passende Item stark hervorgehoben
            (data-passus-item="true").
          - sonst nur Absatz zitiert: der ganze Absatz-Block stark hervorgehoben
            (data-passus="true", wie bisher).
          Aufgehobene Stellen («…») erscheinen gedämpft als «aufgehoben» — für
          Absatz-Einleitung UND Items gleichermassen. */}
      <div className="px-5 py-4 space-y-2.5">
        {snapshot.bloecke.map((b, i) => {
          const istAbsatzZitiert = passus.absatz != null && b.absatz === passus.absatz;
          // Starke Block-Hervorhebung nur, wenn KEIN Item zitiert ist; bei
          // zitiertem Item wird der Block dezent umrandet, das Item trägt die
          // starke Markierung.
          const blockStark = istAbsatzZitiert && passusMarke == null;
          const blockDezent = istAbsatzZitiert && passusMarke != null;
          return (
            <div
              key={i}
              ref={blockStark ? (passusRef as React.Ref<HTMLDivElement>) : undefined}
              data-passus={blockStark ? 'true' : 'false'}
              className={`text-body-s leading-relaxed ${
                blockStark
                  ? 'rounded-md border-l-4 border-brass-500 bg-brass-100 px-3 py-2 text-ink-900'
                  : blockDezent
                    ? 'rounded-md border-l-2 border-brass-300 bg-brass-50 px-3 py-2 text-ink-800'
                    : 'text-ink-700'
              }`}
            >
              <p>
                {b.absatz != null && (
                  <sup className="num mr-1 font-semibold text-ink-500">{b.absatz}</sup>
                )}
                {/* Aufgehobene Absätze tragen im Snapshot (faithful, §7) nur das
                    Auslassungszeichen «…». Statt des nackten «…» zeigen wir
                    «aufgehoben» (rein Darstellung, §3 — Daten unverändert). Die
                    Absatznummer-<sup> bleibt davor → liest sich «² aufgehoben». */}
                {istAufgehoben(b.text)
                  ? <span className="italic text-ink-400">aufgehoben</span>
                  : b.text}
              </p>
              {/* Aufzählungs-Items (lit. bei Bund, Ziff. bei Kanton). EINHEITLICH:
                  identisches Markup/Styling, nur die Marke unterscheidet sich
                  (Daten). Das zitierte Item wird stark hervorgehoben. */}
              {b.items != null && b.items.length > 0 && (
                <ul className="mt-1.5 space-y-1 pl-1">
                  {b.items.map((it, j) => {
                    // GENAU der eine global bestimmte (Block,Item)-Treffer (B1):
                    // bei gleicher Marke in mehreren Blöcken nur der erste.
                    const istItemZitiert = zielItemKey != null
                      && zielItemKey.bi === i
                      && zielItemKey.ji === j;
                    return (
                      <li
                        key={j}
                        ref={istItemZitiert ? (passusRef as React.Ref<HTMLLIElement>) : undefined}
                        {...(istItemZitiert ? { 'data-passus-item': 'true' } : {})}
                        className={`flex gap-2 rounded-md px-2 py-1 ${
                          istItemZitiert
                            ? 'border-l-4 border-brass-500 bg-brass-100 text-ink-900'
                            : 'text-ink-700'
                        }`}
                      >
                        <span className="num shrink-0 font-semibold text-ink-500">{`${it.marke}.`}</span>
                        <span>
                          {istAufgehoben(it.text)
                            ? <span className="italic text-ink-400">aufgehoben</span>
                            : it.text}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}
      </div>

      {/* Fuss: In Kraft seit · Live-Link zur geltenden Fassung · Disclaimer (§8). */}
      <div className="border-t border-line px-5 py-3 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs text-ink-500">In Kraft seit: <span className="num">{snapshot.stand}</span></span>
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
