import { useId, useRef, useState } from 'react';
import { useLeserSchriftskala as useSchriftskala } from '../leserSchrift';
import { usePopoverAutoZu } from './usePopoverAutoZu';
import { kopfGlypheKlassen, kopfGriffKlassen } from './kopfStufen';
import { setzeOption, useLeserOptionen, type OptFeld } from '../leserOptionen';
import { LeserScrim } from './LeserScrim';
import { SchriftgroessenRegler } from '../../../components/ui/SchriftgroessenRegler';
import { MenueRegler, MenueSchalter, MenueTitel, MenueZeile } from '../../../components/ui/Menue';

// ─── «Ansicht ▾» der V3-Kopfzeile (FAHRPLAN-LESER-V3 Kap. 4a/4f, H1) ─────────
//
// DREI Schalter, alle zweiwertig (Kap. 4f: 24 → 8 Kombinationen). Der Store
// darunter ist GETEILT mit V1 (FL-6, §5).
//
// S1 (Optionen-Rückbau): der dritte Historie-Modus («Chronologie») und der
// Verweise-Schalter sind nicht mehr bloss aus der V3-BEDIENUNG genommen, sondern
// im Store gestrichen. Die Abbildung `./v3Optionen` (`histZuSicht`/`sichtZuHist`/
// `histUmschalten`) ist damit ersatzlos entfallen — `histansicht` ist ein
// gewöhnliches zweiwertiges Feld, und alle drei Schalter laufen durch `schalte`.
//
// S1-NACHZUG B3 / D1 — ERLEDIGT im H3-Nachzug (17.8.2026): der Schalter
// «Änderungsvermerke» wird auch hier nur angeboten, wenn der Erlass Vermerke
// TRÄGT (§8). Die Bedingung ist NICHT nachgebaut — sie kommt als eine Prop
// `hatAenderungsvermerke` über `leserV3Modell.ts` → `LeserRahmenV3.tsx` →
// `LeserKopf.tsx` und wird dort mit `bieteAenderungsvermerkeSchalter` aus
// `../berechnungen` abgeleitet, DERSELBEN Funktion, die V1 seit S1 zieht (§5).
// Der Bau war bis zum Rebase auf den gelandeten S1-Stand blockiert: die drei
// Dateien lagen zugleich unter H2b und H3 (Drei-Wege-Konflikt, §0 Ziff. 5) und
// die Quelle stand erst mit PR #547 auf main.
//
// Was hier NICHT steht und bewusst nicht:
//  · Rechtsprechungs-Facetten (Instanz/Kanton/Zeit) — die ziehen in H3 ins
//    Panel, an den Ort ihres Ergebnisses (Kap. 4d). Bis dahin bleiben sie in
//    V3 unsichtbar; ihr Wert im Store wird weder gelesen noch geschrieben, die
//    Ist-Hülle findet ihn also unverändert vor.
//  · Ein Suchfeld — es lebt in der Seitenleiste (Kap. 4b).
//
// A11Y — ehrliche Disclosure, KEIN `role=menu` (Risiko R2, A4-Präzedenz): Der
// Trigger trägt `aria-expanded` + `aria-controls`, das Panel ist eine
// `role="group"` mit `aria-label`; die Schalter sind `role="switch"`. Ein
// `role=menu` verspräche Pfeiltasten-Navigation, die es hier nicht gibt.
// Fokus-Falle, Escape und Fokus-Rückgabe kommen aus dem geteilten
// `useDialogFokus` (§5) — dieselbe Mechanik wie im Ist-Menü.

// ── Ä69 · DER `hinweis`-SLOT IST GESTRICHEN (17.8.2026) ──────────────────────
// Er trug genau EINEN Satz, den Ä27-Hinweis am Vermerke-Schalter, und der ist mit
// der Entkopplung (Ä68) entfallen — die Kreuz-Abhängigkeit, die er erklärte, gibt
// es nicht mehr. Damit hatte der Slot null Aufrufer. §17 in der Fassung vom
// 13.8.2026: was nichts mehr bedient, wird gestrichen statt bewacht (dieselbe
// Begründung wie bei `beiwerkSlot`/`panelOeffner`/`LeserV3Kontext`). Mit ihm
// fallen `useId`, `aria-describedby` und der Geschwister-`<p>`; tritt je wieder
// eine echte Abhängigkeit zwischen zwei Schaltern auf, steht die Anatomie samt
// ihrer Accessible-Name-Herleitung in der Historie.
// ── D5-NACHZUG (6.9.2026) · DIE HÜLLE IST JETZT GETEILT ─────────────────────
// Hier stand ein eigener `V3Switch` mit eigenem Klassen-String und einem
// Zustands-DOPPEL rechts («✓ an» / «○ aus»). Beides ist in den geteilten
// Baustein `components/ui/Menue` gewandert (dort die Herleitung samt Davids
// Befund): Zustand als EIN Häkchen LINKS, Fokus als Strich statt Kasten, Zeilen
// durch Haarlinien getrennt, keine Umbrüche. Die SCHALTLOGIK ist Zeile für
// Zeile unberührt — `schalte(...)` und der geteilte Store bleiben, wie sie
// waren; `aria-checked`, `role="switch"`, `aria-label` und `title` gehen
// unverändert durch (der Baustein setzt sie an derselben Stelle).
const V3Switch = MenueSchalter;

export function LeserAnsichtV3({ kompakt, fussnotenAnzahl, hatAenderungsvermerke, onPanelOeffnen }: {
  /** `true` = Handy-Zuschnitt: der Öffner zeigt «···» statt «Ansicht ▾»
   *  (Fahrplan Kap. 4a). Reine Beschriftung — der Accessible-Name bleibt in
   *  beiden Zuschnitten «Ansicht», und die Elemente des Panels sind identisch. */
  kompakt: boolean;
  fussnotenAnzahl: number | null;
  /**
   * D1 (S1-Rest, H3-Nachzug 17.8.2026) · Trägt dieser Erlass überhaupt
   * Änderungsvermerke? Nur dann wird der Schalter angeboten (§8).
   *
   * Der Wert kommt aus dem MODELL (`leserV3Modell.ts` → `LeserRahmenV3` →
   * `LeserKopf`), abgeleitet mit `bieteAenderungsvermerkeSchalter` aus
   * `../berechnungen` — DERSELBEN Funktion, die V1 seit S1 zieht (§5). Hier steht
   * keine eigene Bedingung: eine zweite Ableitung derselben Frage wäre eine
   * zweite Wahrheit, und sie liefe beim ersten Nachjustieren auseinander.
   */
  hatAenderungsvermerke: boolean;
  /**
   * A2 (H3-Nachzug) · «Entscheide & Kontext …» — der Weg zum Panel, der bleibt,
   * wenn der Zähler weg ist.
   *
   * BEFUND, gemessen 17.8.2026: mit «Rechtsprechung: aus» verschwinden Zähler
   * und Lasche (F8, richtig), und danach gab es auf `mini` KEINEN bedienbaren
   * Weg mehr zum Panel — nur noch die Taste «r». Auf einem Telefon ohne
   * Hardware-Tastatur war die Fläche damit unerreichbar. Davids F8-Regel
   * verspricht ausdrücklich das Gegenteil: «Panel bleibt über ‹Ansicht ▾› und
   * Tastatur erreichbar».
   *
   * ── Ä92 (H4-Nachzug 18.8.2026) · ABER NICHT NEBEN DEM ZÄHLER ──────────────
   * Bis hierher stand der Eintrag UNABHÄNGIG von der Schalterstellung, also
   * auch dann, wenn der Chip zwei Zentimeter weiter oben schon dasselbe tut.
   * Gemessen 18.8.2026 @390 UND @1440: `[data-v3-panel-zaehler]` = 1 und
   * `[data-v3-ansicht-panel-auf]` = 1 — zwei Öffner für eine Fläche, mit
   * verschiedenem Wortlaut («⚖ 14 Entscheide» / «Entscheide & Kontext …»).
   * Das ist derselbe §5-Befund, an dem schon die Randlasche gefallen ist
   * (Ä53/Ä56), nur im Menü statt am Rand.
   * DIE ORDNUNG, die daraus folgt («ein Öffner je Breite», Fahrplan Kap. 7):
   * der Eintrag erscheint GENAU DANN, wenn kein Chip sichtbar ist — also genau
   * in der Lage, für die Davids F8-Regel ihn verlangt. `undefined` heisst
   * darum nicht «nicht gebaut», sondern «der Chip trägt den Weg schon»; die
   * Entscheidung trifft der RAHMEN aus `panel.oeffnerSichtbar`, der einen
   * Quelle dieser Frage (§5), nicht diese Datei.
   */
  onPanelOeffnen?: () => void;
}) {
  const opt = useLeserOptionen();
  const schrift = useSchriftskala();
  const [offen, setOffen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const panelId = useId();

  // H3 · GETEILTES AUTO-ZU (§5). Bis H2 standen hier drei lokale Effekte:
  // Fokus-Falle/Esc (`useDialogFokus`), Aussenklick und Wisch-Geste (LM-009).
  // H3 bringt eine zweite aufziehbare Fläche — das Rechtsprechungs-Panel —, und
  // zwei Kopien derselben Bedien-Zusage laufen beim ersten Nachjustieren
  // auseinander. Die Mechanik liegt darum in `./usePopoverAutoZu`; die Herleitung
  // beider Effekte (samt LM-009) steht dort im Kopf, nicht mehr hier.
  usePopoverAutoZu({ offen, schliesse: () => setOffen(false), wrapRef, panelRef, modus: 'popover' });

  const schalte = (feld: OptFeld, an: boolean) => setzeOption(feld, an ? 'aus' : 'an');

  return (
    <div ref={wrapRef} className="relative inline-flex">
      <button
        type="button"
        onClick={() => setOffen((o) => !o)}
        aria-expanded={offen}
        // NUR im offenen Zustand (Bug-Check B3, 16.8.2026): `aria-controls`
        // zeigt im geschlossenen Zustand auf eine Id, die es im DOM gar nicht
        // gibt — das Panel wird bedingt gerendert. axe meldet das als
        // `aria-valid-attr-value` (kaputte Id-Referenz), und Screenreader
        // bieten einen Sprung an, der ins Leere führt (§8). `aria-expanded`
        // trägt die Zustandsauskunft ohnehin allein. Dasselbe Muster wie im
        // Header-Suchfeld (`aria-controls={zeigtPanel ? listboxId : undefined}`).
        aria-controls={offen ? panelId : undefined}
        aria-label="Ansicht"
        data-v3-ansicht
        // Ä90: EINE Bauform für alle Kopf-Griffe (`kopfStufen`), und die
        // Abstufung folgt dem gemessenen KOPF-Zuschnitt (`kompakt`), nicht
        // einem Viewport-Breakpoint — `sm:` hätte im Pane das Fenster gemessen
        // (Kap. 10, dieselbe Falle wie beim früheren `lg:` unten).
        className={`${kopfGriffKlassen(kompakt)} ${kompakt ? 'gap-0.5 px-1' : 'gap-1 px-1.5'}`}
        // D1: der Tooltip nennt nur, was das Panel wirklich trägt — sonst
        // versprach er auf vermerkfreien Erlassen einen Schalter, den es dort
        // nicht gibt (dieselbe §8-Sorge wie die Bedingung unten).
        // B2 (18.8.2026): derselbe Wortlaut wie am Schalter unten — der Tooltip
        // versprach «im Text», was V3 nicht einlöst (Herleitung dort).
        // ── Ä114 (18.8.2026) · EIN WORT FÜR EIN MENÜ ──────────────────────
        // GEMESSEN am Live-Stand hiess dieselbe Fläche viermal anders: Öffner
        // «Ansicht», `aria-label` des Panels «Darstellungsoptionen», Overline
        // «DARSTELLUNG», Tooltip «Darstellung: …». Ein Screenreader-Nutzer und
        // ein sehender Nutzer sprachen damit über zwei verschiedene Menüs.
        // Der Benennungs-Glossar (Design-Grundlage Kap. 9) setzt «Ansicht» —
        // das Wort, das am Öffner steht und das der Nutzer zuerst sieht.
        // «nur» wie im Gruppen-Namen und im sichtbaren Wort darunter (Entscheid
        // David 5B, 29.8.2026): der Öffner-Tooltip kündigt an, was das Menü
        // enthält — stünde hier «Grösse des Gesetzestexts» und drinnen «Nur
        // Gesetzestext», trüge dieselbe Sache im selben Menü zwei Namen, genau
        // der Ä114-Fehler eine Ebene tiefer.
        title={`Ansicht: Fussnoten${hatAenderungsvermerke ? ' · Fassung' : ''} · Rechtsprechung · Grösse nur des Gesetzestexts`}
      >
        {/* ── Ä91 (H4-Nachzug 18.8.2026) · ZWEI GESICHTER, NICHT DREI ────────
            Gemessen 18.8.2026 trug dieser Öffner DREI verschiedene Gestalten:
            «···» auf `mini`, «◧ Ansicht ▾» ab 1024 px Fenster — und dazwischen,
            zwischen 640 und 1023 px, ein stummes «◧▾». Der dritte war keine
            Absicht, sondern die Folge eines `lg:`-Präfixes: es misst den
            VIEWPORT, während der ganze Kopf-Zuschnitt an der gemessenen
            Element-Breite hängt (Kap. 10). Im Pane hätte dasselbe Präfix ein
            «Ansicht» auch dort gezeigt, wo die Spalte 620 px misst.
            JETZT: das Wort hängt am Zuschnitt. Wo Platz ist («voll»/«kompakt»)
            steht «◧ Ansicht ▾», auf dem Handy «···» — kein drittes Gesicht.
            Der Accessible-Name bleibt in beiden Fällen «Ansicht». */}
        {kompakt
          ? <span aria-hidden className={kopfGlypheKlassen(true)}>···</span>
          : <><span aria-hidden>◧</span><span>Ansicht</span><span aria-hidden className={`transition-transform ${offen ? 'rotate-180' : ''}`}>▾</span></>}
      </button>

      {/* B7-N1 · LM-015: die abdunkelnde Fläche hinter diesem Menü. Regel,
          Farbwahl, Stapelordnung und a11y stehen im Kopf von `./LeserScrim`
          — kurz: der Scrim folgt der FOKUS-FALLE (Modus `popover` fängt sie),
          nicht der Fläche; Ä52 bleibt davon unberührt. */}
      {offen && <LeserScrim onSchliessen={() => setOffen(false)} />}

      {offen && (
        <div
          ref={panelRef}
          id={panelId}
          tabIndex={-1}
          role="group"
          aria-label="Ansicht"
          data-v3-ansicht-panel
          /* D5: 15 rem war die Breite, in der «Rechtsprechung im Kopf» und «Nur
             Gesetzestext» umbrachen (Davids Befund «letzter Eintrag zweizeilig
             umgebrochen»). 17 rem trägt beide einzeilig; die Zeilen kappen
             notfalls mit Auslassung (`.lc-menu-zeile`), sie brechen nicht.
             `gap`/`p` fallen weg: die Trennung tragen jetzt die Haarlinien der
             Zeilen, nicht Zwischenräume. */
          className="lc-schwebeflaeche absolute right-0 top-full z-overlay mt-1.5 flex w-[19rem] max-w-[calc(100vw-2rem)] flex-col py-1"
        >
          {/* Ä114: dasselbe Wort wie am Öffner und im `aria-label` — der
              Glossar-Eintrag «Menü der Darstellungsschalter → Ansicht». */}
          <MenueTitel>Ansicht</MenueTitel>
          <V3Switch
            an={opt.fussnoten === 'an'}
            label="Fussnoten"
            // ── LM-025 (B8, 31.8.2026) · DIE ZAHL SAGT JETZT, WAS SIE ZÄHLT ──
            // Der Befund («neben ‹Fussnoten› steht eine unerklärte Zahl (932)»)
            // ist SICHTBAR überholt — im V3-Menü steht keine Ziffer mehr, die
            // A26-Zahl lebt nur noch im Accessible Name. Genau dort war sie
            // aber weiterhin unerklärt: ein Screenreader las «Fussnoten 932»,
            // ohne dass irgendetwas sagte, worauf sich die 932 bezieht — für
            // diese Nutzer war der Befund unverändert reproduzierbar.
            // Sie ist keine Zahl am Artikel, sondern die Summe über den GANZEN
            // Erlass (`leserV3Modell.ts` → `fussnotenAnzahl`, Summe der
            // `fussnoten` aller Struktur-Einträge; am OR gegen das gebaute
            // Artefakt nachgezählt: 1'686 Artikel, 932 Fussnoten). Der Zusatz
            // «im Erlass» ist damit keine Schmückung, sondern die
            // Bezugsgrösse — ohne sie liest sich dieselbe Zahl als «932 hier»
            // (§8). Entfernen wäre der andere Weg gewesen und kollidiert mit
            // Davids Entscheid A26 (11.7.2026, Zähler N am Fussnoten-Schalter);
            // der bleibt unangetastet, er bekommt nur seine Einheit dazu.
            ariaLabel={fussnotenAnzahl != null && fussnotenAnzahl > 0 ? `Fussnoten (${fussnotenAnzahl} im Erlass)` : undefined}
            // Ä68: dieser Schalter trägt Marker UND Apparat, und zwar ALLE
            // Klassen — auch `kl:'A'`. Er ist damit der einzige, der amtlichen
            // Fussnotentext ausblendet.
            // LM-025 · dieselbe Erklärung auch für Sehende: der Accessible Name
            // trägt die Zahl, der Tooltip trägt ihre Bedeutung — ein Wortlaut,
            // zwei Kanäle (§5). Ohne Zahl (Struktur noch nicht geladen) bleibt
            // der Satz exakt der bisherige.
            titel={`Amtlicher Fussnoten-Apparat am Artikelfuss ein- oder ausblenden — Marker und Apparat, alle Fussnoten${
              fussnotenAnzahl != null && fussnotenAnzahl > 0 ? ` (${fussnotenAnzahl} in diesem Erlass)` : ''}`}
            onKlick={() => schalte('fussnoten', opt.fussnoten === 'an')}
          />
          {/* Ä68 (Entscheid David 17.8.2026) · ENTKOPPELT. Der Schalter blendet
              AUSSCHLIESSLICH die abgeleitete Fassungs-Zeile aus
              (`[data-hist-slot]`) — nie eine Fussnote. Bis 17.8. nahm er `kl:'A'`
              mit, und weil das beim Bundesrecht die Regel ist (StPO 187/285,
              ZGB 719/809), verschwand mit ihm fast der ganze Apparat: Davids
              Befund «wenn änderungsvermerke abgewählt wird dann verschwinden auch
              fussnoten». Herleitung und Messreihe: index.css, Regel-Block Ä68. */}
          {/* D1: … und nur, wenn dieser Erlass Vermerke TRÄGT. Auf BS-640.100 und
              ZH-211.11 blieb dem Schalter sonst eine Layout-Raffung von 40 px je
              Artikel — die Beschriftung versprach mehr, als sie hielt (§8). Die
              Stellung im geteilten Store bleibt unberührt: nicht angeboten heisst
              nicht zurückgesetzt (`leser-v3-umschalten` (a3)). */}
          {hatAenderungsvermerke && (
          <V3Switch
            an={opt.histansicht === 'an'}
            label="Fassung"
            // Ä68: derselbe Wortlaut wie in V1 (§5) — und er beschreibt jetzt die
            // ganze Wirkung, nicht mehr einen Teil davon.
            // ── Ä116 (18.8.2026) · SCHALTER UND ELEMENT HEISSEN GLEICH ────
            // Der Schalter hiess «Änderungsvermerke», das Element, das er
            // schaltet, trägt die Overline «FASSUNG · Gilt seit …». Wer den
            // Schalter umlegte, musste erraten, dass die Zeile mit dem anderen
            // Namen gemeint war. Ä68 hat die WIRKUNG schon geklärt (nur die
            // Fassungs-Zeile, nie eine Fussnote) — jetzt folgt ihr der Name.
            // Glossar: «Fassungs-Zeile → Fassung» überall.
            titel="Fassungs-Zeile am Artikelfuss ein- oder ausblenden («Gilt seit …» samt Zeitleiste) — der amtliche Fussnoten-Apparat bleibt in beiden Stellungen sichtbar"
            // Ä69: die Ä27-Hinweiszeile ist gestrichen — die Kreuz-Abhängigkeit,
            // die sie erklärte, gibt es nicht mehr (`../leserOptionen`).
            onKlick={() => schalte('histansicht', opt.histansicht === 'an')}
          />
          )}
          {/* ── B2 (Klick-Test 18.8.2026) · DIE BESCHRIFTUNG WAR EINE ZUSAGE,
                 DIE V3 NICHT EINLÖST ────────────────────────────────────────
              Hier stand «Rechtsprechung im Text», Tooltip «Hinweise auf
              Entscheide im Lesetext ein- oder ausblenden». Gemessen am gebauten
              Stand (StPO Art. 429, @1440 und @390): Bezugs-/Leitfall-Zeilen im
              V3-Lesetext **0** — vor UND nach dem Umlegen. Der Schalter kann
              dort nichts ausblenden, weil V3 gar nichts einblendet:
              `LeserLesespalte` reicht dem Kern weder `bezuege` noch
              `leitfaelle` weiter (Pos. 12, H3 — die Entscheide stehen im
              Panel). Das CSS `html[data-leitfaelle="aus"] [data-leitfall-zeile]`
              greift weiter, es findet in V3 nur keine Zeile.
              WAS ER WIRKLICH TUT — und was jetzt dransteht: er nimmt den
              ZUGANG aus der Kopfzeile. Gemessen wechselt `[data-v3-panel-
              zaehler]` beim Umlegen von 1 auf 0; das ist Davids F8-Regel vom
              16.8.2026 («aus ⇒ Zähler UND Lasche weg»), und der Zugang bleibt
              über den Menü-Eintrag unten und die Taste «r». Eine Beschriftung,
              die etwas anderes verspricht als sie tut, ist der §8-Fall, den
              dieser Nachzug an mehreren Ecken einsammelt.
              (Im geteilten Store heisst das Feld weiter `leitfaelle` — bis H5
              wirkte es unverändert auf den Lesetext der Ist-Hülle, mit ihr
              eigenem, dort zutreffenden Wortlaut in `LeserRechtsprechungMenu`;
              beides ist mit der Ist-Hülle 21.8.2026 gelöscht. §5 blieb
              gewahrt, solange es zwei Oberflächen gab: EIN Feld, jede
              beschriftet nach ihrer eigenen Wirkung.) */}
          <V3Switch
            an={opt.leitfaelle === 'an'}
            // ── Ä115 (18.8.2026) · DREI SCHALTER, EINE WORTART ────────────
            // «Rechtsprechung anzeigen» las sich mit dem Zustandszeichen
            // daneben als Satz («Rechtsprechung anzeigen ✓ an»), während die
            // beiden Nachbarn Substantive sind («Fussnoten», «Fassung»). Der
            // Schalter benennt jetzt die SACHE, die er ein- und ausschaltet —
            // seinen Zustand sagt das Zeichen rechts, nicht das Verb.
            // Glossar: die Fläche heisst «Rechtsprechung» (Chip konstant).
            // ── Ä128 (Ästhetik-Nachzug 18.8.2026) · DER EINZIGE ZWEIZEILER ──
            // GEMESSEN im aufgezogenen Ansicht-Menü: «Rechtsprechung in der
            // Kopfzeile» war die einzige Beschriftung, die umbrach — die
            // Schalterliste bekam dadurch eine unruhige Kante, und der Umbruch
            // fiel ausgerechnet auf den Schalter, der ohnehin am meisten
            // erklärt. «Im Kopf» sagt dasselbe: der Erlass-KOPF ist im Leser
            // eine benannte Zone, keine Umschreibung. Die Wirkung bleibt Wort
            // für Wort im `titel` stehen, wo Platz dafür ist.
            label="Rechtsprechung im Kopf"
            titel="Zähler und Zugang zur Rechtsprechung im Erlass-Kopf ein- oder ausblenden — das Panel bleibt über «Ansicht ▾» und die Taste «r» erreichbar"
            onKlick={() => schalte('leitfaelle', opt.leitfaelle === 'an')}
          />

          {/* ── Schriftgrösse ────────────────────────────────────────────────
              H2 · DEKLARIERTE UMKEHR DER H1-ABWEICHUNG A-1 (David 16.8.2026).
              H1 bediente hier bewusst den GLOBALEN Skala-Store
              (`lexmetrik-schriftskala`) — mit der Begründung, ein zweiter
              Speicher für dieselbe Frage wäre eine zweite Wahrheit (§5).
              Davids Befund am gebauten Stand widerlegt die Prämisse: es ist
              NICHT dieselbe Frage. «Wie gross ist die App» und «wie gross ist
              der Gesetzestext, den ich gerade lese» sind zwei Fragen, und der
              globale Regler beantwortete beide zugleich — gemessen skalierte
              er mit dem Normtext auch Kopfzeile und Seitenleiste mit (StPO/V3,
              3× A+: `<html>` 16 → 20.8 px, Kopfzeile 16 → 20.8 px).
              Neu: vier Stufen im GETEILTEN Leser-Store `lm.leser.optionen`
              (Feld `schrift`, V1 und V3 dieselbe Quelle), wirksam nur auf dem
              Lesekörper. Der globale App-Regler bleibt unberührt.
              TREUE-GRENZE gehalten: die Vorgabestufe emittiert gar keine
              Deklaration (`:not()` im Selektor), der Normtext bleibt exakt
              1.125 rem — der Pixelvergleich PX läuft mit der Änderung 4/4 grün. */}
          {/* ── Ä9 (H2b) · ZWEI STELLER, ZWEI NAMEN ──────────────────────────
              BEFUND, gemessen 17.8.2026 @1440 im Leser: ZWEI Regler mit
              `role="group"` und dem IDENTISCHEN Namen «Schriftgrösse» —
              einer in der Topbar (global, `useSchriftskala`), einer hier. Beide
              zeigten «A− 100 % A+». Der Nutzer konnte nicht wissen, welcher was
              tut; ein Screenreader las zweimal dasselbe.
              WAS H2 SCHON GELÖST HAT: die Stellen sind nicht mehr dieselbe Frage
              — der globale skaliert die ganze Anwendung (WCAG 1.4.4), dieser nur
              den Normtext (`leserSchrift.ts`). Es blieb ein BENENNUNGS-Fehler.
              WARUM DER GLOBALE REGLER IM LESER NICHT VERSCHWINDET (Entscheid
              H2b, im Vollzugsvermerk deklariert): ihn im Leser auszublenden hätte
              genau zwei Wege — (a) an einen Leser-Pfad gebunden: dann verliert die
              EINGEFRORENE Ist-Hülle ihren einzigen Schriftregler, denn sie hat
              keinen eigenen (FL-4-Bruch); (b) an das V3-Flag gebunden: dann wüsste
              die App-Topbar vom Flag, dessen Schaltpunkt ausdrücklich die eine
              Fassade ist (FL-1). Beide Wege kosten mehr, als der Befund wiegt.
              Behoben wird darum die Ursache der Verwechslung: dieser Regler sagt,
              WAS er vergrössert. «Im Leser nur EIN Regler für den Gesetzestext»
              ist damit erfüllt; der zweite ist ein anderes Werkzeug mit anderem
              Namen. Ob der App-Regler im Leser dennoch weichen soll, entscheidet
              David (Vollzugsvermerk, offener Punkt). */}
          {/* ── ENTSCHEID DAVID 5B (29.8.2026) · «NUR» IST DAS TRAGENDE WORT ──
              Ä9 (oben) hat diesem Regler bereits einen eigenen Namen gegeben —
              «Gesetzestext» hier, «Schriftgrösse» dort. Das reichte nicht: der
              App-Regler in der Topbar trug gar keinen SICHTBAREN Scope, also
              stand «Gesetzestext» neben einem namenlosen Zwilling und las sich
              als Beschriftung DESSELBEN Werkzeugs (Design-Review C4, erneut
              gemessen 29.8.2026: beide gleichzeitig auf 120 % / 118 %). Seit
              David 5B tragen BEIDE ihren Scope sichtbar: «Ganze Seite» in
              `components/layout/Topbar.tsx`, «Nur Gesetzestext» hier. Das «Nur»
              ist kein Füllwort — es ist die Abgrenzung, die den Unterschied ohne
              Screenreader lesbar macht (§8). */}
          {/* D5: eigene Zeile mit Label statt neben eine umbrechende
              Beschriftung gequetscht — die Anatomie steht im geteilten
              `MenueRegler`, der Wortlaut bleibt (Entscheid David 5B: «Nur»
              ist das tragende Wort). */}
          <MenueRegler label="Nur Gesetzestext" ariaLabel="Grösse nur des Gesetzestexts">
            <SchriftgroessenRegler
              schrift={schrift}
              kleinerLabel="Gesetzestext verkleinern"
              kleinerTitle="Gesetzestext verkleinern — die Anwendung bleibt gleich gross"
              kleinerAttrs={{ 'data-v3-schrift': 'kleiner' }}
              groesserLabel="Gesetzestext vergrössern"
              groesserTitle="Gesetzestext vergrössern — die Anwendung bleibt gleich gross"
              groesserAttrs={{ 'data-v3-schrift': 'groesser' }}
            />
          </MenueRegler>

          {/* ── A2 · Der Weg zum Panel, der keine Tastatur braucht ────────────
              KEIN `role="menuitem"`: das Panel ist eine ehrliche Disclosure
              (R2/A4-Präzedenz), und ein einzelnes Menü-Element in einer
              `role="group"` verspräche eine Pfeiltasten-Bedienung, die es hier
              nicht gibt. Ein gewöhnlicher Knopf mit sprechendem Namen.
              Er SCHLIESST das Menü mit — sonst stünde das Dropdown über der
              Fläche, die es gerade geöffnet hat (dieselbe Falle wie Ä19). */}
          {onPanelOeffnen && (
            <MenueZeile
              label="Entscheide & Kontext …"
              marke="⚖"
              titel="Gerichtsentscheide, Änderungen und Materialien zur gelesenen Bestimmung"
              onKlick={() => { setOffen(false); onPanelOeffnen(); }}
              attrs={{ 'data-v3-ansicht-panel-auf': '', 'data-v3-panel-oeffner': '' }} />
          )}
        </div>
      )}
    </div>
  );
}
