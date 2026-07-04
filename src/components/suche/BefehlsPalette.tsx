import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useUniversalSuche } from './useUniversalSuche';
import { SuchResultate } from './SuchResultate';
import { suchOptionId } from './suchOptionId';
import { useDialogFokus } from '../layout/useDialogFokus';
import { ladeBrowseManifest } from '../../lib/normtext/browse';
import { baueNormIndex, parseNormQuery, type NormIndex, type NormQueryTreffer } from '../../lib/suche/normQuery';
import type { BrowseErlass } from '../../lib/normtext/browse-typen';

// ─── Befehls-/Sprung-Palette (Cmd/Ctrl-K · W2·5d G4) ────────────────────────
//
// Globaler Tastatur-Einstieg zur Artikel-scharfen Suche in ≤ 2 Interaktionen
// (öffnen → tippen + Enter). Zwei Dinge in EINEM Overlay:
//  1. Norm-Query-Parser (lib/suche/normQuery): «OR 257d» / «Art. 5 AIG» →
//     direkter Deep-Link in den Leser (prominent oben, Enter springt).
//  2. Fallback = die BESTEHENDE Universal-Suche (useUniversalSuche/SuchResultate,
//     KEIN zweiter Index, K10) für Freitext.
//
// a11y: role="dialog"/aria-modal, Fokus-Falle + Esc + Fokus-Rückgabe über den
// geteilten useDialogFokus (§5). Das Eingabefeld ist eine ARIA-Combobox, die die
// Trefferliste (SuchResultate im Listbox-Modus) über aria-activedescendant führt.
// Nur-visuell/Navigation (§3) — keine Rechtslogik.

function Symbol() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.7" />
      <path d="M20 20l-3.6-3.6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

export function BefehlsPalette({ offen, onSchliessen }: { offen: boolean; onSchliessen: () => void }) {
  const navigate = useNavigate();
  const listboxId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const [wert, setWert] = useState('');
  const [q, setQ] = useState('');
  const [erlasse, setErlasse] = useState<BrowseErlass[] | null>(null);

  // Fokus-Falle + Esc + Fokus-Rückgabe (identisch zu allen Overlays, §5).
  useDialogFokus(offen, dialogRef, onSchliessen);

  // Erlass-Registry (Browse-Manifest) für den Parser — lazy beim ersten Öffnen,
  // gecacht (ladeBrowseManifest teilt die laufende Promise mit der Übersicht/Suche,
  // kein Doppel-Fetch). KEIN neuer Index (K10).
  useEffect(() => {
    if (!offen || erlasse) return;
    let lebt = true;
    ladeBrowseManifest().then((m) => { if (lebt) setErlasse(m?.erlasse ?? []); }).catch(() => { if (lebt) setErlasse([]); });
    return () => { lebt = false; };
  }, [offen, erlasse]);

  const index = useMemo<NormIndex | null>(() => (erlasse ? baueNormIndex(erlasse) : null), [erlasse]);
  const direkt = useMemo<NormQueryTreffer | null>(() => (index ? parseNormQuery(wert, index) : null), [index, wert]);

  // Debounce Eingabe → Such-Query (~120 ms), stösst zugleich das Lazy-Laden an.
  useEffect(() => {
    const id = setTimeout(() => setQ(wert.trim()), 120);
    return () => clearTimeout(id);
  }, [wert]);

  const { gruppen, allesGeladen } = useUniversalSuche(q);

  // Flache Trefferliste der Suche (Pfeil-Navigation, geteilte Options-IDs).
  const flach = gruppen.flatMap((g) => g.treffer.map((t) => ({ oid: suchOptionId(listboxId, g.id, t.id), href: t.href })));
  const [aktivIndex, setAktivIndex] = useState(-1);
  // Bei neuer Query Hervorhebung zurücksetzen (Render-Phasen-Abgleich).
  const [letzteQuery, setLetzteQuery] = useState(q);
  if (q !== letzteQuery) { setLetzteQuery(q); setAktivIndex(-1); }
  const aktivId = aktivIndex >= 0 && aktivIndex < flach.length ? flach[aktivIndex].oid : undefined;

  // Beim Schliessen leeren, damit die Palette stets frisch öffnet (Render-Phasen-
  // Abgleich statt Effekt).
  const [warOffen, setWarOffen] = useState(offen);
  if (offen !== warOffen) {
    setWarOffen(offen);
    if (!offen) { setWert(''); setQ(''); setAktivIndex(-1); }
  }

  useEffect(() => {
    if (aktivId) document.getElementById(aktivId)?.scrollIntoView({ block: 'nearest' });
  }, [aktivId]);

  const springe = (href: string) => { onSchliessen(); navigate(href); };

  // Enter: hat der Nutzer einen Suchtreffer hervorgehoben → dieser; sonst der
  // Direktsprung (Parser-Treffer); sonst der oberste Suchtreffer.
  const aufTaste = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown' && flach.length > 0) {
      e.preventDefault();
      setAktivIndex((i) => (i + 1) % flach.length);
    } else if (e.key === 'ArrowUp' && flach.length > 0) {
      e.preventDefault();
      setAktivIndex((i) => (i <= 0 ? flach.length - 1 : i - 1));
    } else if (e.key === 'Enter') {
      const ziel = aktivIndex >= 0 && aktivIndex < flach.length
        ? flach[aktivIndex].href
        : direkt?.href ?? flach[0]?.href;
      if (ziel) { e.preventDefault(); springe(ziel); }
    }
    // Esc wird von useDialogFokus behandelt (schliesst das Overlay).
  };

  if (!offen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:pt-[12vh]">
      {/* Abdunkelnder Scrim — themenunabhängig dunkel. */}
      <div className="fixed inset-0 bg-black/50" onClick={onSchliessen} aria-hidden />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Suche und Sprung zum Artikel"
        tabIndex={-1}
        className="relative z-10 w-full max-w-2xl rounded-lg border border-line bg-paper-raised shadow-lg focus:outline-none"
      >
        <div className="flex items-center gap-3 border-b border-line px-4">
          <span className="pointer-events-none text-ink-500"><Symbol /></span>
          <input
            type="search"
            value={wert}
            onChange={(e) => setWert(e.target.value)}
            onKeyDown={aufTaste}
            placeholder="Artikel springen (z. B. «OR 257d») oder suchen …"
            aria-label="Artikel springen oder durchsuchen"
            className="h-14 flex-1 bg-transparent text-body-l text-ink-900 placeholder:text-ink-500 focus:outline-none"
            enterKeyHint="go"
            autoComplete="off"
            role="combobox"
            aria-expanded={q !== '' || direkt != null}
            aria-controls={q !== '' ? listboxId : undefined}
            aria-activedescendant={aktivId}
            aria-autocomplete="list"
          />
          <button
            type="button"
            onClick={onSchliessen}
            aria-label="Schliessen"
            className="shrink-0 inline-flex h-8 w-8 items-center justify-center rounded-md text-ink-500 transition-colors hover:text-brass-700"
          >
            <span aria-hidden className="text-base leading-none">✕</span>
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto overscroll-contain">
          {/* Direktsprung (Parser-Treffer) — prominent, mit amtlicher Fundstelle. */}
          {direkt && (
            <button
              type="button"
              onClick={() => springe(direkt.href)}
              className="flex w-full items-center gap-3 border-b border-line px-4 py-3 text-left transition-colors hover:bg-brass-100/40"
            >
              <span className="lc-badge lc-badge-ok shrink-0">Sprung</span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-body-s font-semibold text-ink-900">
                  {direkt.erlass.kuerzel}
                  {direkt.artikelAnzeige && <span className="num"> · Art. {direkt.artikelAnzeige}</span>}
                </span>
                <span className="block truncate text-body-s text-ink-500">{direkt.erlass.titel}</span>
              </span>
              <span aria-hidden className="text-brass-500">↵</span>
            </button>
          )}

          {q !== '' && (
            <SuchResultate
              gruppen={gruppen}
              allesGeladen={allesGeladen}
              q={q}
              listboxId={listboxId}
              aktivId={aktivId}
              onAuswahl={onSchliessen}
              onNavigate={springe}
            />
          )}

          {q === '' && !direkt && (
            <p className="px-4 py-6 text-body-s text-ink-500">
              Norm eingeben, um direkt zum Artikel zu springen — z. B. «OR 257d», «Art. 5 AIG»,
              «ZGB 684». Oder ein Stichwort für die Suche über Gesetze, Rechtsprechung und Werkzeuge.
            </p>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
