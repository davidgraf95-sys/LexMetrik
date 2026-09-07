import type { ReactNode, RefObject } from 'react';
import { SheetRahmen } from '../../../components/ui/SheetRahmen';

// ─── W2·10-UI-NAV/R2 · Mobile Gliederung als volles Bottom-Sheet ───────────────
//
// Fahrplan R2: «Sheet in voller Höhe (Daumenzone) · beim Öffnen Hierarchie zur
// aktuellen Leseposition aufgeklappt + markiert (Scroll-Spy-State existiert,
// A3 nutzt ihn) · Quickjump-Feld ‹Art. N› zuoberst».
//
// Vorher war die mobile Gliederung ein OBEN angeschlagener Drawer (max-h-60vh,
// `top: calc(4rem + 2.25rem)`): der Baum begann direkt unter dem Kopf, also am
// weitesten weg vom Daumen, und endete nach 60 % Höhe — bei ZGB/OR sah man
// wenige Zweige. Jetzt: von unten, bis knapp unter den Kopf, Bediengriffe
// (Schliessen, Quickjump) ZUOBERST, Baum darunter scrollend.
//
// Aufbau (von oben nach unten):
//   1. Griffleiste + Titel + ✕ (44 px Tap-Ziel)
//   2. «Sie sind hier» — der vom Scroll-Spy gelieferte Gliederungspfad + der
//      aktuell gelesene Artikel. Reine Projektion bestehenden Zustands (§3/§5):
//      es wird nichts zusätzlich beobachtet. Ohne Pfad steht die Zeile NICHT da
//      (kein «unbekannt»-Platzhalter, §8) — die Höhe ist dennoch reserviert.
//   3. Quickjump «Art. N» (ArtikelSprungFeld, derselbe Baustein wie im Desktop-
//      TOC-Kopf, §5)
//   4. Gliederungsbaum (einziger Scroller; `overscroll-contain`, damit Wischen
//      im Sheet nicht die Seite dahinter mitzieht)
//
// §15/2 CLS 0: das Sheet ist `fixed`/`absolute` und aus dem Fluss genommen — es
// verschiebt nichts. Alle vier Zonen haben feste bzw. flex-verteilte Höhen; der
// Baum bekommt `flex-1 min-h-0`, kein Inhalt wächst in einen Nachbarn ein.
// §3: keine Rechtslogik — Props rein, Sprünge macht der Reader.

export function GliederungSheet({
  sheetRef, inPane, onSchliessen, pfad, aktArtikelLabel, sprungFeld, baum, titel = 'Gliederung',
  ortAnzeigen = true, feldZuoberst = false,
}: {
  /** Fokus-/Dialog-Ref des Readers (useDialogFokus: Esc, Fokusfang, Rückgabe). */
  sheetRef: RefObject<HTMLDivElement | null>;
  /** Im Split-View-Pane: `absolute` in der Overlay-Schicht statt `fixed`. */
  inPane: boolean;
  onSchliessen: () => void;
  /** «Sie sind hier»: Gliederungspfad der aktuellen Leseposition (kann leer sein). */
  pfad: string[];
  /** «Sie sind hier»: Label des aktuell gelesenen Artikels (kann null sein). */
  aktArtikelLabel: string | null;
  /** Quickjump-Zone ZUOBERST. `undefined` = die Zone entfällt ganz (samt Linie).
   *
   *  Ä19 (LESER-V3 H2b): V3 hat sein Such-/Sprungfeld in den KLEBENDEN Block der
   *  Kopfzeile gezogen, wo die Gliederung nicht als Spalte steht — es ist dort
   *  ohne jede Geste erreichbar. Ein zweites Feld im Blatt wäre danach genau die
   *  Doppel-Eingabe, die Pos. 4 beseitigt hat (§5, Fehler K2).
   *  Die Ist-Hülle setzt die Prop unverändert und bekommt Zeichen für Zeichen
   *  dieselbe Zone wie bisher (FL-4). */
  sprungFeld?: ReactNode;
  baum: ReactNode;
  /** Ä10 (LESER-V3 H2b): Titel des Blatts. Vorgabe «Gliederung» = Ist-Verhalten.
   *  V3 gibt hier «Gliederung» bzw. «Treffer» durch und lässt die Leiste im Blatt
   *  ihre eigene Überschrift weg — das Wort stand sonst zweimal übereinander. */
  titel?: string;
  /** ── Ä32 (H2b-Nachzug) · «SIE SIND HIER» GEHÖRT ZUR GLIEDERUNG ────────────
   *  Vorgabe `true` = Ist-Verhalten. `false` setzt der Aufrufer, wo das Blatt
   *  gerade NICHT die Gliederung zeigt: im TREFFER-Blatt beantwortet «Sie sind
   *  hier» eine Frage, die niemand gestellt hat, und lautete im gemessenen Fall
   *  (StPO @390, Suche «Kosten») «Sie sind hier — Noch keine Leseposition
   *  erfasst.» — eine ganze Zone für die Auskunft, dass es keine gibt (§8). */
  ortAnzeigen?: boolean;
  /** ── A2/Ä18 (H2b-Nachzug) · DAS FELD IST DAS OBERSTE ELEMENT ──────────────
   *  Vorgabe `false` = Ist-Reihenfolge (Ort, dann Feld). `true` zieht die
   *  Sprung-/Suchzone VOR die Ortsangabe — damit gilt im Blatt dieselbe Regel wie
   *  in Spalte und Kopf-Block: das Feld steht zuoberst (Ä18). Nur die V3-Hülle
   *  setzt es; die Ist-Hülle bekommt Zeichen für Zeichen ihre Anordnung (FL-4). */
  feldZuoberst?: boolean;
}) {
  const ortZone = ortAnzeigen ? (
    /* 2 · «Sie sind hier» — Pfad + gelesener Artikel (nur wenn bekannt, §8) */
    <div data-sie-sind-hier className="shrink-0 border-b border-line px-4 py-2">
      <p className="lc-overline mb-0.5">Sie sind hier</p>
      {pfad.length > 0 || aktArtikelLabel ? (
        <p className="text-micro leading-snug text-ink-600 [overflow-wrap:anywhere]">
          {pfad.map((l, i) => (
            <span key={`${l}-${i}`}>
              {i > 0 && <span aria-hidden className="mx-1 text-ink-400">›</span>}
              {l}
            </span>
          ))}
          {aktArtikelLabel && (
            <>
              {pfad.length > 0 && <span aria-hidden className="mx-1 text-ink-400">›</span>}
              <span className="font-medium text-ink-900">{aktArtikelLabel}</span>
            </>
          )}
        </p>
      ) : (
        // ── DEKLARIERTE FL-4-ABWEICHUNG (PR #537, 16.8.2026) ───────────
        // FL-4 friert die geteilten Ist-Dateien ein, solange V3 hinter dem
        // Flag steht — DIESE eine Zeile ist die einzige Ausnahme, und sie
        // ist im PR-Body als Ist-Kontrastfix ausgewiesen.
        //
        // BEFUND: `ink-400` ist ein Deko-Token (3.41:1 auf `paper-raised`)
        // und trug hier sichtbaren Text — axe: `color-contrast`, serious.
        // Gefunden beim axe-Scan des GEÖFFNETEN Sheets (die bestehende
        // a11y-Stichprobe öffnet es nicht) und in BEIDEN Hüllen
        // reproduziert: der Defekt ist heute live, nicht durch V3 entstanden.
        //
        // WARUM KEIN REVERT: FL-4 schützt die Ist-Hülle vor V3-getriebenem
        // Umbau, nicht vor der Behebung eines eigenen AA-Verstosses. Ein
        // Revert liesse einen serious-Befund auf Prod stehen, um eine Regel
        // formal einzuhalten, die genau dafür nicht gemacht ist (§8, §1).
        // `ink-500` hebt ihn auf AA, ohne die Dämpfung aufzugeben; dieselbe
        // Klasse wie W3.6 (25.6.2026) und der Menü-Befund vom 26.7.2026.
        <p className="text-micro leading-snug text-ink-500">Noch keine Leseposition erfasst.</p>
      )}
    </div>
  ) : null;
  /* 3 · Quickjump «Art. N» — entfällt ganz, wenn kein Feld geliefert wird
     (Ä19/H2b): ein leerer, bordierter Streifen wäre eine Fläche ohne
     Inhalt (Design-Grundlage Kap. 8 Nr. 1). */
  const feldZone = sprungFeld
    ? <div data-v3-blatt-feld className="shrink-0 border-b border-line px-4 py-2">{sprungFeld}</div>
    : null;
  return (
    <>
      {/* F2-1: Farbe und Deckung des Scrims kommen aus `.lc-scrim`
          (src/index.css). Hier stand `bg-ink-900/30` — `--ink-900` flippt mit
          dem Thema und ist im Dunkelmodus `#E9E7E2`, dieser «Scrim» HELLTE also
          im Dunkelmodus auf, statt abzudunkeln (Messung/Herleitung:
          `../v3/LeserScrim.tsx`, B7-N1). Position und z-Ebene bleiben hier. */}
      <div className={inPane ? 'lc-scrim pointer-events-auto absolute inset-0 z-overlay' : 'lc-scrim fixed inset-0 z-overlay'}
        onClick={onSchliessen} aria-hidden />
      {/* Rahmen, Griffleiste, Titelzeile, ✕ und Scroller kommen aus dem EINEN
          Sheet-Baustein (F2-2, `ui/SheetRahmen`) — sie standen zeichengleich
          auch im `rechtsprechung/FilterSheet`.
          B11: auch der Dialog selbst heisst, was er zeigt — sonst kündigt der
          Screenreader «Gliederung» an, und darin steht die Trefferliste; und der
          ✕-Name folgt dem Titel (gemessen 17.8.2026: der Knopf hiess «Gliederung
          schliessen», während über ihm «Treffer» stand, §8). Beides trägt der
          Baustein aus `titel`.
          W2·19-GLIEDERUNG/S2: Anschlag aus `--leser-kopf-h` (gesetzt an genau
          einer Stelle, `.lc-leser` in inhalt.tsx) statt aus der Vorgabe
          `--sheet-anschlag` — hier ist die Kopfhöhe GEMESSEN, nicht angenommen.
          Dieser Zweig rendert immer im Fluss unterhalb von `.lc-leser` (nur der
          inPane-Zweig portaliert in die Overlay-Wurzel, und der trägt gar keinen
          Anschlag) — die Variable erbt also zuverlässig.
          `overflow-x-hidden` am Scroller (Zusatzpunkt David 9.8.2026,
          W2·19-GLIEDERUNG/S9): dieselbe Garantie wie in der Desktop-Spalte
          ([data-toc], inhalt-volltext.tsx) — kein horizontales Scrollen, lange
          Etikette brechen um. */}
      <SheetRahmen sheetRef={sheetRef} inPane={inPane} titel={titel} onSchliessen={onSchliessen}
        anschlag="var(--leser-kopf-h)" daten="data-gliederung-sheet"
        scrollerDaten="data-gliederung-baum-scroll"
        scrollerKlassen="overflow-x-hidden px-3 py-2"
        // Feld und Ortsangabe — Reihenfolge und Vorhandensein entscheidet der
        // Aufrufer (`feldZuoberst`, `ortAnzeigen`); Vorgabe = Ist-Anordnung.
        zwischenZonen={feldZuoberst ? <>{feldZone}{ortZone}</> : <>{ortZone}{feldZone}</>}>
        {baum}
      </SheetRahmen>
    </>
  );
}
