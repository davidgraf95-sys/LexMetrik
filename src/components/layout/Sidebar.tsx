import { useState } from 'react';
import { Link, useLocation, type Location } from 'react-router-dom';
import {
  NAVIGATION, NAVIGATION_META, alleNavLinks, type NavKnoten, type NavGruppe, type NavLink as NavLinkT,
} from '../../lib/navigation';
import { LexMetrikSiegel, LexMetrikWortmarke } from './Logo';

// Alle Nav-Ziele inkl. #Anker (statisch) — zum Erkennen, ob ein aktiver Hash
// überhaupt einem Geschwister-Eintrag entspricht (Bug-Fix 26.6.: sonst verlieren
// Single-Entry-Seiten mit internen Hash-Tabs wie /rechner/tagerechner#zpo ihre
// Aktiv-Markierung).
const NAV_ZIELE = new Set(alleNavLinks().map((l) => l.ziel));

// ─── App-Shell-Seitenleiste (Build-Plan App-Shell, Phase 3) ─────────────────
//
// Rendert die Navigations-Topologie aus dem reinen Datenmodul navigation.ts
// (SSoT, §5) — als <nav>-Landmark, tastaturbedienbar, mit aria-current auf dem
// aktiven Eintrag. Dieselbe Komponente trägt die persistente Desktop-Leiste UND
// den Inhalt der mobilen Schublade; onNavigate schliesst die Schublade beim
// Klick. KEINE Rechtslogik (§3) — nur Darstellung der navigation.ts-Daten.

/** Aktiv-Erkennung: vergleicht Ziel (Pfad + ?-Diskriminator + #-Anker) mit dem
 *  aktuellen Standort. Bewusst eng — überstrahlt nicht ganze Bereiche. */
function istAktiv(ziel: string, loc: Location): boolean {
  const [vorHash, hash] = ziel.split('#');
  const [pfad, qs] = vorHash.split('?');
  const zielP = new URLSearchParams(qs ?? '');
  const curP = new URLSearchParams(loc.search);

  const pfadOk = pfad === '/gesetze' ? loc.pathname.startsWith('/gesetze') : loc.pathname === pfad;
  if (!pfadOk) return false;
  // Trägt das Ziel einen Anker, muss er stimmen (Vorlagen-Gruppe / Bund-Gebiet).
  if (hash && loc.hash !== `#${hash}`) return false;
  // Hash-LOSES Ziel auf exaktem Pfad (z.B. «Zivilprozess» /rechner/zustaendigkeit)
  // darf NICHT mitleuchten, wenn ein Hash-GESCHWISTER aktiv ist (#straf/#schkg).
  // Aber NUR, wenn der aktive Hash auch wirklich ein Nav-Ziel ist — sonst verlöre
  // eine Single-Entry-Seite mit internen Hash-Tabs (z.B. /rechner/tagerechner#zpo)
  // ihre Markierung. `/gesetze`-startsWith-Gruppe bleibt unberührt.
  if (!hash && loc.hash && pfad !== '/' && pfad !== '/gesetze' && NAV_ZIELE.has(pfad + loc.hash)) return false;

  if (pfad === '/') {
    // «Start» ist aktiv, solange «/» ohne aktive Hero-Suche (?q=) offen ist.
    return !curP.get('q');
  }
  // JEDER Query-Diskriminator des Ziels muss zum aktuellen Standort passen,
  // sonst überstrahlt ein Eintrag seine Geschwister: Gesetze-Kantone tragen
  // `ebene=kanton&kt=<KT>` (früher nur `ebene` verglichen → ALLE Kantone aktiv),
  // Rechtsprechung trägt `rg=<gebiet>` (früher `return true` → ALLE aktiv).
  // `ebene` fehlt ⇒ Default 'bund' (Tab-Vorwahl).
  for (const [key, val] of zielP) {
    const cur = key === 'ebene' ? (curP.get('ebene') ?? 'bund') : curP.get(key);
    if (cur !== val) return false;
  }
  return true; // Pfad (+ Anker + alle Query-Diskriminatoren) treffen.
}

function Blatt({ k, loc, onNavigate, klein }: {
  k: NavLinkT; loc: Location; onNavigate?: () => void; klein?: boolean;
}) {
  const aktiv = istAktiv(k.ziel, loc);
  return (
    <Link
      to={k.ziel}
      onClick={onNavigate}
      aria-current={aktiv ? 'page' : undefined}
      className={`group/blatt flex items-center gap-2.5 rounded-md no-underline transition-colors ${klein ? 'px-2.5 py-1.5 text-body-s' : 'px-2.5 py-2 text-body-s font-medium'} ${
        aktiv ? 'bg-brass-100 text-brass-800' : 'text-ink-600 hover:text-ink-900 hover:bg-brass-100/40'
      }`}
    >
      {/* Messing-Skalenstrich als Aktiv-Marke (greift das Siegel-Motiv auf);
          transparent reserviert den Platz → kein Layout-Sprung beim Wechsel. */}
      <span aria-hidden className={`h-3.5 w-0.5 rounded-full shrink-0 transition-colors ${
        aktiv ? 'bg-brass-600' : 'bg-transparent group-hover/blatt:bg-brass-300'
      }`} />
      <span className="leading-snug" title={k.label}>{k.label}</span>
    </Link>
  );
}

function Knoten({ k, loc, onNavigate }: { k: NavKnoten; loc: Location; onNavigate?: () => void }) {
  if (k.art === 'link') return <Blatt k={k} loc={loc} onNavigate={onNavigate} />;
  return <Gruppe k={k} loc={loc} onNavigate={onNavigate} />;
}

function Gruppe({ k, loc, onNavigate }: { k: NavGruppe; loc: Location; onNavigate?: () => void }) {
  // Offen-Zustand LOKAL gesteuert (nicht controlled über `open`), damit der
  // Nutzer jede Gruppe frei zu-/aufklappen kann — auch wenn ein Kind aktiv ist
  // (Auftrag David: Kategorien müssen einklappbar bleiben). Anfangszustand:
  // offen, wenn standardOffen ODER ein Kind die aktuelle Seite ist.
  const kindAktiv = k.kinder.some((kk) => kk.art === 'link' && istAktiv(kk.ziel, loc));
  const [offen, setOffen] = useState(!!k.standardOffen || kindAktiv);

  // Mit `ziel` (z.B. Bund/Kantone): die Überschrift navigiert zur Übersicht
  // (Auftrag David), ein separater Chevron klappt die Kinder. KEIN natives
  // <details> — ein Link in <summary> würde beim Klick zugleich navigieren UND
  // umschalten.
  if (k.ziel) {
    const aktiv = istAktiv(k.ziel, loc);
    return (
      <div className="flex flex-col">
        <div className="flex items-center gap-1 rounded-md px-2.5 py-2 hover:bg-brass-100/40">
          <Link to={k.ziel} onClick={onNavigate} aria-current={aktiv ? 'page' : undefined}
            className={`flex-1 leading-snug text-body-s font-medium no-underline transition-colors ${aktiv ? 'text-brass-700' : 'text-ink-600 hover:text-ink-900'}`}
            title={k.label}>{k.label}</Link>
          <button type="button" onClick={() => setOffen((o) => !o)} aria-expanded={offen}
            aria-label={`${k.label} ${offen ? 'einklappen' : 'aufklappen'}`}
            className="shrink-0 p-0.5 text-ink-500 hover:text-brass-700 transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden
              className={`transition-transform ${offen ? 'rotate-90' : ''}`}>
              <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
        {offen && (
          <div className="mt-0.5 ml-3.5 pl-2 border-l border-line flex flex-col gap-0.5">
            {k.kinder.map((kk, i) => (
              kk.art === 'link'
                ? <Blatt key={i} k={kk} loc={loc} onNavigate={onNavigate} klein />
                : <Knoten key={i} k={kk} loc={loc} onNavigate={onNavigate} />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <details className="group" open={offen} onToggle={(e) => setOffen((e.currentTarget as HTMLDetailsElement).open)}>
      {/* Disclosure-Dreieck liefert der globale details>summary::after (index.css). */}
      <summary className="flex items-center gap-2 cursor-pointer select-none rounded-md px-2.5 py-2 text-body-s font-medium text-ink-600 hover:text-ink-900 hover:bg-brass-100/40">
        <span className="flex-1 leading-snug" title={k.label}>{k.label}</span>
      </summary>
      <div className="mt-0.5 ml-3.5 pl-2 border-l border-line flex flex-col gap-0.5">
        {k.kinder.map((kk, i) => (
          kk.art === 'link'
            ? <Blatt key={i} k={kk} loc={loc} onNavigate={onNavigate} klein />
            : <Knoten key={i} k={kk} loc={loc} onNavigate={onNavigate} />
        ))}
      </div>
    </details>
  );
}

// Ein Sidebar-Abschnitt (Rechner/Vorlagen/Gesetze). Anfangszustand offen.
// Die Überschrift ist KLICKBAR zur Gesamtübersicht (a.ziel, Auftrag David
// 20.6.2026); ein separater Chevron-Knopf klappt die Kinder ein/aus. Bewusst
// KEIN natives <details>: ein Link in <summary> würde beim Klick zugleich
// navigieren UND umschalten (preventDefault könnte beides nicht trennen).
function Abschnitt({ a, loc, onNavigate }: { a: typeof NAVIGATION[number]; loc: Location; onNavigate?: () => void }) {
  const [offen, setOffen] = useState(true);
  // Klick auf die Abschnitts-Überschrift (z.B. «Gesetze») klappt alle Untergruppen
  // wieder zu (Auftrag David): der hochgezählte Schlüssel remountet die Kinder, die
  // sich dann auf ihren Default (standardOffen=false) re-initialisieren.
  const [zuklappGen, setZuklappGen] = useState(0);
  if (!a.titel) {
    return (
      <div className="flex flex-col gap-0.5">
        {a.kinder.map((k, j) => <Knoten key={j} k={k} loc={loc} onNavigate={onNavigate} />)}
      </div>
    );
  }
  const aktiv = a.ziel != null && (loc.pathname + loc.search === a.ziel || (a.ziel === '/gesetze' && loc.pathname.startsWith('/gesetze')));
  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-1 px-2.5 pt-1 pb-1.5 rounded-md hover:bg-brass-100/30">
        {a.ziel ? (
          <Link to={a.ziel} onClick={() => { onNavigate?.(); setZuklappGen((g) => g + 1); }} aria-current={aktiv ? 'page' : undefined}
            className={`lc-overline flex-1 no-underline transition-colors ${aktiv ? 'text-brass-700' : ' hover:text-brass-700'}`}>
            {a.titel}
          </Link>
        ) : (
          <span className="lc-overline flex-1">{a.titel}</span>
        )}
        <button type="button" onClick={() => setOffen((o) => !o)} aria-expanded={offen}
          aria-label={`${a.titel} ${offen ? 'einklappen' : 'aufklappen'}`}
          className="shrink-0 p-0.5 text-ink-500 hover:text-brass-700 transition-colors">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden
            className={`transition-transform ${offen ? 'rotate-90' : ''}`}>
            <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
      {offen && (
        <div className="flex flex-col gap-0.5">
          {a.kinder.map((k, j) => <Knoten key={`${j}-${zuklappGen}`} k={k} loc={loc} onNavigate={onNavigate} />)}
        </div>
      )}
    </div>
  );
}

export function Sidebar({ onNavigate, markeZeigen = true }: { onNavigate?: () => void; markeZeigen?: boolean }) {
  const loc = useLocation();
  return (
    <nav aria-label="Hauptnavigation" className="flex flex-col gap-5 p-4 min-h-full">
      {/* Marke am Kopf der Seitenleiste (Prototyp V2). Auf Mobil trägt der
          Top-Streifen das Logo (Schublade kann es ausblenden). */}
      {markeZeigen && (
        <Link to="/" onClick={onNavigate}
          className="flex items-center gap-2.5 px-2.5 pt-1 pb-1 no-underline" aria-label="LexMetrik – Startseite">
          <LexMetrikSiegel size={30} />
          <LexMetrikWortmarke className="text-h3" />
        </Link>
      )}

      {/* «Start» als Kopf-Eintrag, abgesetzt durch eine Haarlinie. Die Suche
          lebt seit der UI-Welle ausschliesslich im Header-Dropdown (§5). */}
      <div className="flex flex-col gap-1.5 -mt-1">
        {NAVIGATION[0].kinder.map((k, j) => <Knoten key={j} k={k} loc={loc} onNavigate={onNavigate} />)}
      </div>

      <div aria-hidden className="h-px bg-line -mt-2.5" />

      {NAVIGATION.slice(1).map((abschnitt, i) => (
        <Abschnitt key={i} a={abschnitt} loc={loc} onNavigate={onNavigate} />
      ))}

      {/* Utility/Meta unten — abgesetzt durch Hairline. */}
      <div className="mt-auto pt-3 border-t border-line flex flex-col gap-0.5">
        {NAVIGATION_META.map((k, i) => (
          <Blatt key={i} k={k} loc={loc} onNavigate={onNavigate} klein />
        ))}
      </div>
    </nav>
  );
}
