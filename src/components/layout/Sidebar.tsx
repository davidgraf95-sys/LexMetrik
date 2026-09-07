import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, type Location } from 'react-router-dom';
import {
  NAVIGATION, alleNavLinks, type NavKnoten, type NavGruppe, type NavLink as NavLinkT,
} from '../../lib/navigation';
import { STUFE_WORT } from '../../lib/normtext/erfassungsgrad';
import { LexMetrikSiegel, LexMetrikWortmarke } from './Logo';
import { KorpusStand } from '../ui/KorpusStand';
import { registerVonPfad, REG_FLAECHE, REG_HOVER_FLAECHE_BLATT } from './bereiche';

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
  // D26 · DER SPEZIFISCHERE EINTRAG GEWINNT. Seit die Kernerlasse als eigene
  // Ziele in der Leiste stehen (`/gesetze/bund/or`), trafen auf einer Leser-Route
  // ZWEI Einträge zu: der Erlass selbst (exakter Pfad) und «Alle Bundeserlasse»
  // bzw. der Kantonslink über die `startsWith`-Regel oben — zwei Aktiv-Marken
  // sagen nicht mehr, wo man ist. Trägt der aktuelle Pfad selbst einen Eintrag,
  // gehört ihm die Marke allein; die `startsWith`-Regel bleibt für alles übrige
  // (Leser ohne eigenen Eintrag ⇒ die Rubrik leuchtet weiter).
  if (pfad === '/gesetze' && loc.pathname !== '/gesetze' && NAV_ZIELE.has(loc.pathname)) return false;
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
  const reg = registerVonPfad(k.ziel);
  return (
    <Link
      to={k.ziel}
      onClick={onNavigate}
      aria-current={aktiv ? 'page' : undefined}
      aria-label={k.ariaLabel}
      // W2·24 R2: Linien statt Flächen (§5). Der aktive Eintrag trug eine
      // Messing-FÜLLUNG — seit R1 ist das ein neutrales Grau, das nur noch
      // «irgendwas ist hier» sagt. Jetzt sagt die MARKE, WAS hier ist: der
      // 2-px-Strich trägt die Registerfarbe der Domäne des Ziels
      // (`./bereiche`), dieselbe Farbe wie der Bereichs-Reiter im Titelblatt
      // und der Reiter-Strich in der Arbeitsleiste. Fläche nur noch als
      // Hover-Andeutung des Papiers, kein Radius.
      className={`group/blatt flex items-center gap-2.5 no-underline transition-colors ${klein ? 'px-2.5 py-1.5 text-body-s' : 'px-2.5 py-2 text-body-s font-medium'} ${
        aktiv ? 'text-ink-900 font-medium' : 'text-ink-600 hover:text-ink-900'
      }`}
    >
      {/* Registerfarben-Strich als Aktiv-Marke; transparent reserviert den
          Platz → kein Layout-Sprung beim Wechsel.
          F2 (Prüfbefund 6.9.2026): die HOVER-Marke war `rule-soft`, also grau —
          auf den Übersichtsrouten blieb die Leiste damit farblos, obwohl jeder
          Eintrag einem Register angehört. Der Hover zeigt jetzt die Farbe des
          Ziels; unterschieden bleiben die Zustände über die Schrift (aktiv
          `ink-900`/`font-medium`) und `aria-current`, nicht über die Farbe
          allein (§11.6.8). */}
      <span aria-hidden className={`h-4 w-0.5 shrink-0 transition-colors ${
        aktiv
          ? (reg ? REG_FLAECHE[reg] : 'bg-ink-900')
          : `bg-transparent ${reg ? REG_HOVER_FLAECHE_BLATT[reg] : 'group-hover/blatt:bg-rule-soft'}`
      }`} />
      <span className="leading-snug" title={k.label}>{k.label}</span>
      {/* IA-7 (§11.5): Erlass-Zahl-Badge (Kantonslinks) — rechtsbündig, von
          Anfang an im Markup (§15.2, kein CLS). Optik-Familie der IA-2-Pills
          (Gesetze.tsx): `num text-micro`, Zahl ERBT die kontrast-geprüfte
          Link-Textfarbe — kein eigenes helleres Token (§13/F2, WCAG ≥4.5).
          aria-hidden: der volle Accessible Name (Name + Zahl + Zustands-Wort)
          liegt auf dem Link (k.ariaLabel, O4-Muster — nie nur die Zahl). */}
      {k.zahl != null && (
        <span aria-hidden className="ml-auto flex items-baseline gap-1.5 pl-1.5 shrink-0">
          {/* Zustands-Wort SICHTBAR, nicht nur im Accessible Name (Fehlerbuch-
              Befund 44, auf Prod reproduziert 29.8.2026): «Basel-Stadt 859» und
              «Aargau 4» standen ohne Einordnung untereinander, die 4 las sich wie
              die Grösse des Kantons statt wie die Grösse UNSERER Erfassung (§8).
              Wort + Zahl, nie Farbe allein (§11.6.8) — dieselbe Paarung, die
              Kachel, Karten-Bildunterschrift und Kantons-Kopf schon zeigen.
              Gedämpfter als die Zahl (`text-ink-500`), damit die Leiste scannbar
              bleibt: die Zahl trägt, das Wort ordnet ein. Heute treten nur
              «Auswahl» und «dünn» auf — «vollständig» setzt einen
              Enumerations-Beleg voraus, und ENUMERATIONS_BELEGE ist leer (§8:
              wir behaupten keine Vollständigkeit, die wir nicht belegt haben). */}
          {/* ink-600 statt -500: auf der aktiven Zeile misst axe für 11-px-Text
              sonst 4.36:1 < 4.5 (CI-Fund 29.8.2026, Shard 1/7). Die damalige
              Fläche (brass-100) ist seit R2 weg; der Ton bleibt, weil er auf
              dem Papier erst recht hält. */}
          {k.stufe && <span className="text-micro text-ink-600">{STUFE_WORT[k.stufe]}</span>}
          {/* aria-hidden auch am Badge selbst: der IA-7-Wächter prüft das
              Attribut an span.num (Eigenschaft identisch — der Wrapper trägt es
              schon; CI-Fund 29.8.2026, Shard 7). */}
          <span aria-hidden className="num text-micro">{k.zahl}</span>
        </span>
      )}
    </Link>
  );
}

function Knoten({ k, loc, onNavigate }: { k: NavKnoten; loc: Location; onNavigate?: () => void }) {
  if (k.art === 'link') return <Blatt k={k} loc={loc} onNavigate={onNavigate} />;
  return <Gruppe k={k} loc={loc} onNavigate={onNavigate} />;
}

/** Auf-/Zuklapp-Chevron — EINE Form für Abschnitts- und Gruppen-Zeilen (O2).
 *  Vorher trug die `<details>`-Variante der Gruppen stattdessen das globale
 *  `details > summary::after`-Dreieck: zwei Zeichen für dieselbe Geste. */
function Chevron({ offen }: { offen: boolean }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden
      className={`transition-transform ${offen ? 'rotate-90' : ''}`}>
      <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─── Gruppe (W2·10-UI-NAV-O · O2 «Sidebar-Konsistenz») ──────────────────────
//
// EINE Zeilen-Anatomie für ALLE Untergruppen (vorher zwei, je nachdem ob die
// Gruppe ein `ziel` trug):
//  · mit `ziel`  → Label ist ein Link auf die Übersicht, der Chevron klappt.
//  · ohne `ziel` → die ganze Zeile ist der Klapp-Schalter (das frühere native
//    <details>/<summary>), aber mit demselben Chevron und derselben Polsterung.
// Das Label ist damit überall bedienbar und nirgends tot; der Chevron bedeutet
// überall dasselbe. Chevron-Hitbox bleibt R6 (nicht dieser Schritt).
function Gruppe({ k, loc, onNavigate }: { k: NavGruppe; loc: Location; onNavigate?: () => void }) {
  // Offen-Zustand LOKAL gesteuert (nicht controlled über `open`), damit der
  // Nutzer jede Gruppe frei zu-/aufklappen kann — auch wenn ein Kind aktiv ist
  // (Auftrag David: Kategorien müssen einklappbar bleiben). Anfangszustand:
  // offen, wenn standardOffen ODER ein Kind die aktuelle Seite ist.
  const kindAktiv = k.kinder.some((kk) => kk.art === 'link' && istAktiv(kk.ziel, loc));
  const [offen, setOffen] = useState(!!k.standardOffen || kindAktiv);

  // O2 · Auto-Expandieren bei Navigation. Der Anfangszustand griff nur beim
  // MOUNT — wer über Kopfsuche, Deep-Link oder Zurück-Taste auf einer Seite
  // landete, deren Sidebar-Eintrag in einer zugeklappten Gruppe liegt, sah die
  // Aktiv-Markierung nicht (der Weg dorthin blieb verborgen). Nur die STEIGENDE
  // Flanke wirkt: wer eine Gruppe mit aktivem Kind bewusst zuklappt, behält sie
  // zu — Davids «Kategorien einklappbar» bleibt gewahrt.
  // Kein React-Compiler im Projekt → der Vorher-Wert liegt in einem eigenen
  // useRef, nicht in einer memoisierten Ableitung.
  const warKindAktiv = useRef(kindAktiv);
  useEffect(() => {
    if (kindAktiv && !warKindAktiv.current) setOffen(true);
    warKindAktiv.current = kindAktiv;
  }, [kindAktiv]);

  const aktiv = k.ziel != null && istAktiv(k.ziel, loc);
  const kinder = (
    <div className="mt-0.5 ml-3.5 pl-2 border-l border-rule-soft flex flex-col gap-0.5">
      {k.kinder.map((kk, i) => (
        kk.art === 'link'
          ? <Blatt key={i} k={kk} loc={loc} onNavigate={onNavigate} klein />
          : <Knoten key={i} k={kk} loc={loc} onNavigate={onNavigate} />
      ))}
    </div>
  );

  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-1 px-2.5 py-2">
        {k.ziel ? (
          <>
            {/* KEIN natives <details>: ein Link in <summary> würde beim Klick
                zugleich navigieren UND umschalten. */}
            <Link to={k.ziel} onClick={onNavigate} aria-current={aktiv ? 'page' : undefined}
              className={`flex-1 leading-snug text-body-s font-medium no-underline transition-colors ${aktiv ? 'text-ink-900' : 'text-ink-600 hover:text-ink-900'}`}
              title={k.label}>{k.label}</Link>
            <button type="button" onClick={() => setOffen((o) => !o)} aria-expanded={offen}
              aria-label={`${k.label} ${offen ? 'einklappen' : 'aufklappen'}`}
              className="shrink-0 p-0.5 text-ink-500 hover:text-ink-900 transition-colors">
              <Chevron offen={offen} />
            </button>
          </>
        ) : (
          <button type="button" onClick={() => setOffen((o) => !o)} aria-expanded={offen}
            className="flex flex-1 items-center gap-1 text-left text-body-s font-medium text-ink-600 hover:text-ink-900 transition-colors">
            <span className="flex-1 leading-snug" title={k.label}>{k.label}</span>
            <span className="shrink-0 p-0.5 text-ink-500"><Chevron offen={offen} /></span>
          </button>
        )}
      </div>
      {offen && kinder}
    </div>
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
  // F2 · DER GRUPPENKOPF TRÄGT SEINE REGISTERFARBE DAUERHAFT (David 6.9.2026:
  // «nicht trist»). Der Strich sitzt auf derselben Achse wie die Aktiv-Marken
  // der Blätter darunter (px-2.5 · 2 px · 10 px Abstand) — die Leiste bekommt
  // damit eine durchgehende Registerspalte statt vier grauer Überschriften.
  const reg = a.ziel ? registerVonPfad(a.ziel) : null;
  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-1 px-2.5 pt-1 pb-1.5 border-b border-rule-soft">
        <span aria-hidden className={`h-3.5 w-0.5 shrink-0 mr-2.5 ${reg ? REG_FLAECHE[reg] : 'bg-rule-soft'}`} />
        {a.ziel ? (
          <Link to={a.ziel} onClick={() => { onNavigate?.(); setZuklappGen((g) => g + 1); }} aria-current={aktiv ? 'page' : undefined}
            className={`lc-overline flex-1 no-underline transition-colors ${aktiv ? 'text-ink-900' : ' hover:text-ink-900'}`}>
            {a.titel}
          </Link>
        ) : (
          <span className="lc-overline flex-1">{a.titel}</span>
        )}
        <button type="button" onClick={() => setOffen((o) => !o)} aria-expanded={offen}
          aria-label={`${a.titel} ${offen ? 'einklappen' : 'aufklappen'}`}
          className="shrink-0 p-0.5 text-ink-500 hover:text-ink-900 transition-colors">
          <Chevron offen={offen} />
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

export function Sidebar({ onNavigate, markeZeigen = false }: { onNavigate?: () => void; markeZeigen?: boolean }) {
  const loc = useLocation();
  return (
    <nav aria-label="Hauptnavigation" className="flex flex-col gap-5 p-4 min-h-full">
      {/* W2·24 R2: Die Marke steht seit dem Titelblatt-Umbau IM KOPF, auf jeder
          Breite (`Topbar.tsx`) — die persistente Leiste zeigt sie darum nicht
          mehr (Vorgabe `markeZeigen = false`); zwei Marken auf einem Bildschirm
          sind eine Dopplung, kein Angebot.
          ── C2 (29.8.2026) · UNTER 480 px TRÄGT SIE DIE SCHUBLADE ────────────
          Dort hat der Streifen keinen Platz mehr für acht 44-px-Ziele und lässt
          das Logo weg (Messreihe in `Topbar.tsx`). Die Marke fällt deswegen
          nicht aus der App: die Schublade blendet sie unter DERSELBEN Schwelle
          wieder ein — eine Zahl, zwei spiegelbildliche Klassen. Bewacht von
          `e2e/topbar-kein-ueberlauf-320.e2e.ts` (Gegenprobe @480). */}
      <Link to="/" onClick={onNavigate}
        className={`${markeZeigen ? 'flex' : 'hidden max-[480px]:flex'} items-center gap-2.5 px-2.5 pt-1 pb-1 no-underline`}
        aria-label="LexMetrik – Startseite">
        <LexMetrikSiegel size={30} />
        <LexMetrikWortmarke className="text-h3" />
      </Link>

      {/* «Start» als Kopf-Eintrag, abgesetzt durch eine Haarlinie. Die Suche
          lebt seit der UI-Welle ausschliesslich im Header-Dropdown (§5). */}
      <div className="flex flex-col gap-1.5 -mt-1">
        {NAVIGATION[0].kinder.map((k, j) => <Knoten key={j} k={k} loc={loc} onNavigate={onNavigate} />)}
      </div>

      <div aria-hidden className="h-px bg-rule-soft -mt-2.5" />

      {NAVIGATION.slice(1).map((abschnitt, i) => (
        <Abschnitt key={i} a={abschnitt} loc={loc} onNavigate={onNavigate} />
      ))}

      {/* Fuss der Leiste — abgesetzt durch Hairline.
          ── D26 (David 6.9.2026) · DIE META-ZIELE STEHEN IM SEITENFUSS ────────
          Einstellungen · Methodik · Über · Kontakt · Datenschutz standen hier als
          fünf gleichrangige Zeilen unter den Inhalts-Rubriken und beanspruchten
          in einer Leiste, die «zeigen soll, was man aufschlägt», ein Fünftel der
          Höhe für Dinge, die man einmal im Jahr braucht. Sie sind NICHT weg —
          `Footer.tsx` führt dieselbe SSoT-Liste (`NAVIGATION_META`), und der
          Seitenfuss steht auf jeder Route. `NAVIGATION_META` bleibt darum
          unverändert exportiert; nur die Leiste rendert es nicht mehr. */}
      <div className="mt-auto pt-3 border-t border-rule-soft flex flex-col gap-0.5">
        {/* W2·23-STARTSEITE-V4 §6.3 · Fuss «Stand des Korpus». Dieselbe Wahrheit
            wie die Korpus-Stand-Zeile auf «/» — EIN Baustein, zwei Konsumenten
            (§5), kein zweiter Datumssatz in der Leiste. Auf Mobil trägt die
            Schublade dieselbe Komponente und damit denselben Fuss.
            §8: der Baustein sagt «Register erzeugt», nicht «Stand der
            Rechtsprechung» — die Felder datieren den Build-Lauf. */}
        <KorpusStand className="px-2.5 pt-2.5" />
      </div>
    </nav>
  );
}
