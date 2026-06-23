import { useState } from 'react';
import { Link, useLocation, type Location } from 'react-router-dom';
import {
  NAVIGATION, NAVIGATION_META, type NavKnoten, type NavGruppe, type NavLink as NavLinkT,
} from '../../lib/navigation';
import { LexMetrikSiegel, LexMetrikWortmarke } from './Logo';

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

  if (pfad === '/') {
    const kat = zielP.get('kategorie');
    if (kat) return curP.get('kategorie') === kat;
    // «Start»: «/» ohne Kategorie und ohne Suche.
    return !curP.get('kategorie') && !curP.get('q');
  }
  if (pfad === '/gesetze') {
    return (zielP.get('ebene') ?? 'bund') === (curP.get('ebene') ?? 'bund');
  }
  if (pfad === '/recherche') {
    // Bereichs-Überschriften: «Vorlagen» (?kategorie=vorlagen) vs. «Rechner»
    // (?bereich=rechner) param-weise unterscheiden, robust gegen Zusatz-Filter
    // (?rg=, ?q=, …). Nacktes /recherche nur als solches aktiv.
    const kat = zielP.get('kategorie'); const ber = zielP.get('bereich');
    if (kat) return curP.get('kategorie') === kat;
    if (ber) return curP.get('bereich') === ber && !curP.get('kategorie');
    return !curP.get('kategorie') && !curP.get('bereich');
  }
  return true; // Meta-Seiten: Pfad-Treffer genügt.
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
      <span className="truncate" title={k.label}>{k.label}</span>
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
  return (
    <details className="group" open={offen} onToggle={(e) => setOffen((e.currentTarget as HTMLDetailsElement).open)}>
      {/* Disclosure-Dreieck liefert der globale details>summary::after (index.css). */}
      <summary className="flex items-center gap-2 cursor-pointer select-none rounded-md px-2.5 py-2 text-body-s font-medium text-ink-600 hover:text-ink-900 hover:bg-brass-100/40">
        <span className="flex-1 truncate" title={k.label}>{k.label}</span>
        {typeof k.anzahl === 'number' && (
          <span className="num text-xs text-ink-500" aria-label={`${k.anzahl} verfügbar`}>{k.anzahl}</span>
        )}
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
          <Link to={a.ziel} onClick={onNavigate} aria-current={aktiv ? 'page' : undefined}
            className={`lc-overline flex-1 no-underline transition-colors ${aktiv ? 'text-brass-700' : 'text-ink-500 hover:text-brass-700'}`}>
            {a.titel}
          </Link>
        ) : (
          <span className="lc-overline text-ink-500 flex-1">{a.titel}</span>
        )}
        <button type="button" onClick={() => setOffen((o) => !o)} aria-expanded={offen}
          aria-label={`${a.titel} ${offen ? 'einklappen' : 'aufklappen'}`}
          className="shrink-0 p-0.5 text-ink-400 hover:text-brass-700 transition-colors">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden
            className={`transition-transform ${offen ? 'rotate-90' : ''}`}>
            <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
      {offen && (
        <div className="flex flex-col gap-0.5">
          {a.kinder.map((k, j) => <Knoten key={j} k={k} loc={loc} onNavigate={onNavigate} />)}
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
          className="flex items-center gap-2.5 px-2.5 pt-1 pb-3 no-underline" aria-label="LexMetrik – Startseite">
          <LexMetrikSiegel size={30} />
          <LexMetrikWortmarke className="text-[1.3rem]" />
        </Link>
      )}
      {NAVIGATION.map((abschnitt, i) => (
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
