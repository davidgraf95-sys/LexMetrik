import { useEffect, useRef, useState, type ReactNode } from 'react';

// ─── In-Gesetz-Suchfeld für den Inhalts-Kopf (A35-Verlegung, David 19.7.2026) ────
//
// David 19.7.2026: das In-Gesetz-Suchfeld soll «oben in diese Zeile» — die oberste
// Kopfzeile des Lesers (InhaltsKopf: Brotkrümel · Artikel-Chip · «Ansicht ▾» · Stand
// · ✕). Es wandert aus der früheren full-width `data-such-bar` (die in der EINZEL-
// ansicht entfällt; im Split-View bleibt sie, weil dort kein InhaltsKopf existiert)
// in den rechten Bedien-Cluster des Kopfs.
//
// Layout (empirisch bei 1024/1280/1440 + 390 geprüft, Auftrag §Platz):
//  · Desktop (≥ sm): das Feld steht sichtbar inline in der Zeile (Davids «in dieser
//    Zeile … sichtbar verankert»). Kompakte Breite (w-40 … lg:w-52), damit Ansicht/
//    Stand/✕ rechts Platz behalten.
//  · Mobil (< sm): die Zeile ist zu eng für ein Feld → ein kompaktes Such-Icon (§Platz
//    «Such-Icon ist mobil akzeptabel»). Antippen öffnet das Feld als Overlay über der
//    Zeile (der InhaltsKopf-Grid trägt `relative`); ✕ schliesst + leert.
//
// EIN Suchfeld (§5): dasselbe <input> in beiden Breiten (Klassen schalten Sichtbarkeit/
// Position), gebunden an denselben Reader-State `suche` — nie zwei Eingaben. Das Feld-
// Verhalten (Treffer-Highlight via CSS Custom Highlight API, Enter-Navigation, A40-BGer-
// Fallback) liegt unverändert im Reader; diese Komponente ist reiner Ort/Bedienung (§3).
// CLS (§15.2): der Kopf hat feste Höhe (h-9); das Feld/Icon wächst nichts ein — der
// mobile Overlay ist `absolute` und verschiebt nichts.

function Lupe() {
  return (
    <svg aria-hidden viewBox="0 0 16 16" width="14" height="14" fill="none"
      stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="7" cy="7" r="4.5" />
      <path d="M11 11l3.5 3.5" />
    </svg>
  );
}

export function InGesetzSuche({ value, onChange, gliederung }: {
  value: string;
  onChange: (v: string) => void;
  /** Optionaler ☰-Gliederungsknopf links vom Suchfeld (Reader baut ihn kontextabhängig). */
  gliederung?: ReactNode;
}) {
  // `offen` steuert NUR die mobile Overlay-Eingabe (Desktop-Feld ist stets `sm:block`).
  // Bewusst komponenten-lokal: das Auf-/Zuklappen rendert nicht den Reader/Normtext neu.
  const [offen, setOffen] = useState(false);
  // Das <input> bleibt stets montiert (nur display:none) → `autoFocus` feuert beim
  // mobilen Öffnen nicht. Darum den Fokus beim Öffnen explizit setzen.
  const feldRef = useRef<HTMLInputElement>(null);
  useEffect(() => { if (offen) feldRef.current?.focus(); }, [offen]);
  return (
    <div className="flex items-center gap-1.5">
      {gliederung}
      {/* Mobil (< sm): Such-Icon öffnet das Overlay-Feld. Auf sm+ ausgeblendet. */}
      <button type="button" onClick={() => setOffen(true)} aria-label="Im Gesetz suchen"
        title="Im Gesetz suchen"
        className={`sm:hidden inline-flex h-6 w-6 items-center justify-center rounded-md border border-line text-ink-500 transition-colors hover:border-brass-400 hover:text-brass-700 ${offen ? 'invisible' : ''}`}>
        <Lupe />
      </button>
      {/* EIN Suchfeld — Desktop: inline in der Zeile; Mobil: Overlay wenn `offen`. */}
      <div className={`${offen ? 'absolute inset-x-3 top-1/2 z-30 -translate-y-1/2' : 'hidden'} sm:static sm:z-auto sm:block sm:translate-y-0`}>
        <div className="flex items-center gap-1 rounded-md bg-paper sm:bg-transparent">
          <input ref={feldRef} type="search" value={value} onChange={(e) => onChange(e.target.value)}
            placeholder="Im Gesetz suchen …" aria-label="Im Gesetz suchen"
            className="lc-input h-7 py-0 text-body-s w-full min-w-0 sm:w-40 lg:w-36 xl:w-52" />
          {/* ✕ nur im mobilen Overlay (schliesst + leert). Auf sm+ ausgeblendet. */}
          <button type="button" onClick={() => { onChange(''); setOffen(false); }}
            aria-label="Suche schliessen" title="Suche schliessen"
            className="sm:hidden shrink-0 inline-flex h-6 w-6 items-center justify-center rounded-md border border-line text-ink-500 transition-colors hover:border-brass-400 hover:text-brass-700">
            <span aria-hidden className="text-base leading-none">✕</span>
          </button>
        </div>
      </div>
    </div>
  );
}
