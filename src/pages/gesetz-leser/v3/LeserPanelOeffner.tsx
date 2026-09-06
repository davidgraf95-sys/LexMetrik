import { OEFFNER_WORT, oeffnerLabelKompakt, oeffnerName, zaehlerAttribut } from './panelModell';
import { kopfGlypheKlassen, kopfGriffKlassen, type KopfElemente } from './kopfStufen';

// ─── Der Öffner des Panels — EINER je Zuschnitt (H3, F8; Nachzug Ä53/Ä56) ─────
//
// ═══ DIE RANDLASCHE IST GESTRICHEN — GEMESSEN, NICHT ENTSCHIEDEN ═════════════
//
// F8-Entscheid David 16.8.2026 lautete «V1, a, Lasche behalten»: ein Zähler in
// der Kopfzeile UND eine Randlasche im Seitenrand. Am GEBAUTEN Stand hält die
// Prämisse dieses Entscheids an keiner Breite (gemessen 17.8.2026, StPO):
//
//   Breite   Artikel-Rechtskante   Lasche (w-9 = 36 px)   Überlappung
//   ──────────────────────────────────────────────────────────────────
//   390 px   x = 370               x = 354 … 390          16 px IM Normtext
//   1024 px  x = 992               x = 988 … 1024          4 px IM Normtext
//   1440 px  x = 1200              x = 1404 … 1440         keine
//
// Bei 1024 px lässt die Lesespalte zwischen ihrer Kante und dem Rand des Lesers
// **8 px** — eine 36 px breite Schiene passt dort nicht, und sie passt auch
// nirgends unterhalb von ~1200 px. Die Design-Grundlage (Kap. 6) erlaubt im
// Lesekörper «**null** Icons ausser dem Entscheid-Zähler», und dieser Zähler ist
// der am ARTIKEL (Beiwerk-Zone, S2) — nicht eine schwebende Schiene über dem
// Text. Wo die Lasche NICHT überlappte (@1440), war sie zudem das wortgleiche
// Doppel des Kopf-Zählers: fünf Elemente in der Kopfzeile, zwei Knöpfe mit
// identischem Accessible-Name für dieselbe Fläche (Ä56).
//
// DARAUS DIE NEUE ORDNUNG — GENAU EIN ÖFFNER JE ZUSCHNITT:
//
//   Zuschnitt   Öffner                                  Grund
//   ────────────────────────────────────────────────────────────────────────────
//   voll        Zähler «⚖ 14 Entscheide»                Platz ist da, Zahl ist da
//   kompakt     Zähler «⚖ 14 Entscheide»                dito
//   mini        Zähler-Chip «⚖ 14»                      H4-II, s. u.
//   alle        Eintrag im «Ansicht ▾»/«···»-Menü       F8-Weg, wenn der Schalter aus ist
//   alle        Taste «r»                               F8-Weg (Kap. 4h)
//
// Der Menü-Eintrag steht auf JEDEM Zuschnitt und in JEDEM Pane (A2) — er ist der
// Weg, den Davids F8-Regel ausdrücklich offen halten will («Panel bleibt über
// ‹Ansicht ▾› und Tastatur erreichbar»). Die Abweichung von «Lasche behalten»
// ist im Vollzugsvermerk als §7-Abweichung ausgewiesen und wartet auf Davids
// Bestätigung.
//
// ── H4-II (17./18.8.2026) · AUF `mini` STEHT DER ZÄHLER JETZT AUCH ──────────
// Bis hierher trug die Zeile «mini | Eintrag im ···-Menü | Kopfzeile ist bei 4».
// Gemessen am gebauten Stand (@390, StPO Art. 429) hiess das: `[data-v3-panel-
// oeffner]` im Ruhezustand **0**, und der Weg zu den Entscheiden kostete **zwei
// Taps** («···» aufziehen, dann «Entscheide & Kontext …») gegen einen auf D und
// S. Das ist der NM-2-Befund des Kontaktbogens H4 und dort der Flip-Blocker:
// nicht «unerreichbar», wie der Bogen zunächst schrieb, aber doppelt so teuer
// auf dem Gerät, auf dem der Finger das einzige Werkzeug ist.
//
// Der VIER-ELEMENTE-Deckel von Kap. 6 bleibt gewahrt, weil ein anderes Element
// weicht: das ✕ war auf `mini` das Duplikat des sichtbaren Rücksprungs
// «‹ Gesetze» in derselben Zeile (beide auf `/gesetze`) — Herleitung und
// Messreihe in `./kopfStufen`, `zeigeSchliessKreuz`. Die Zeile trägt danach
// Ort · ⚖ · ☰ · ··· .
// NICHT eingelöst ist die zweite Hälfte des Deckels («≤ 2 reine Icons»): der
// Chip zeigt im Ruhezustand nur die Ikone, weil die Zahl vor dem Nachladen
// niemand kennt (§8). Vorher standen dort ☰ · ··· · ✕, also ebenfalls drei —
// die Lage ist unverändert, nicht verbessert; sie steht als offener Punkt im
// Kontaktbogen H4.
//
// ── DIE REGEL DAVIDS, UND WO SIE STEHT ──────────────────────────────────────
// «Rechtsprechung im Text» AUS ⇒ der Zähler verschwindet. Diese Datei prüft das
// NICHT: sie wird dann gar nicht gerendert. Die Entscheidung liegt an genau
// einer Stelle (`panelModell.oeffnerSichtbar`) — zwei Stellen, die dieselbe
// Option lesen, hätten irgendwann zwei Antworten. Der MENÜ-Eintrag bleibt in
// jeder Stellung: «aus» heisst «ich will keinen Hinweis sehen», nicht «ich
// verzichte auf den Zugang».
//
// ── WELCHE GESTALT der Zähler hat, entscheidet die STUFE (§5) ───────────────
// Die Zuordnung steht in `kopfElemente(stufe).panel` (`'voll' | 'kompakt'`),
// damit sie eine prüfbare Aussage über einen Rückgabewert ist und nicht über
// abwesenden Code (§6.7). Diese Datei liest den Wert, sie leitet ihn nicht ab —
// eine zweite Ableitung derselben Frage wäre eine zweite Wahrheit.

/** Zähler in der Kopfzeile: «⚖ 14 Entscheide» bzw. auf `mini` «⚖ 14».
 *  Ohne bekannte Zahl «⚖ Rechtsprechung» bzw. die blosse Ikone. */
export function PanelZaehler({ anzahl, artikelLabel, offen, panelId, form, onKlick }: {
  anzahl: number | null;
  artikelLabel: string | null;
  offen: boolean;
  /** Id der Fläche — nur im offenen Zustand gesetzt (Bug-Check B3, H1): im
   *  geschlossenen Zustand existiert sie nicht, und eine kaputte Id-Referenz
   *  meldet axe als `aria-valid-attr-value`.
   *
   *  A3 (H3-Nachzug): der RAHMEN reicht sie herein. Bis zum Nachzug entstand sie
   *  in `LeserPanelZone` per `useId` und wurde nie durchgereicht — `aria-controls`
   *  war am Kopf-Zähler auf JEDER Desktop-Breite `null` (gemessen @1024/@1440). */
  panelId?: string;
  /** H4-II · Gestalt des Chips, aus `kopfElemente(stufe).panel`. Der Rahmen
   *  reicht sie herein; diese Datei kennt die Stufe nicht und soll sie nicht
   *  kennen (§3 — sie rendert, sie entscheidet nicht). */
  form: KopfElemente['panel'];
  onKlick: () => void;
}) {
  const kompakt = form === 'kompakt';
  const marke = oeffnerLabelKompakt(anzahl);
  return (
    <button
      type="button"
      onClick={onKlick}
      aria-expanded={offen}
      aria-controls={offen ? panelId : undefined}
      aria-label={oeffnerName(anzahl, artikelLabel)}
      title={oeffnerName(anzahl, artikelLabel)}
      data-v3-panel-zaehler
      // A3: der Öffner ist für die Aussenklick-Regel des Panels kein «Aussen».
      // Sammel-Marker statt Aufzählung zweier Selektoren (`OEFFNER_SELEKTOR` in
      // `panelModell`), damit ein dritter Öffner nicht vergessen werden kann.
      data-v3-panel-oeffner
      data-v3-panel-anzahl={zaehlerAttribut(anzahl)}
      data-v3-panel-zaehler-form={form}
      // Ä90: die EINE Bauform der Kopf-Griffe — Umriss und Zielgrösse kommen
      // aus `kopfStufen`, nicht aus einer Klassenliste je Griff (§5).
      className={`${kopfGriffKlassen(kompakt)} ${kompakt ? 'gap-0.5 px-1' : 'gap-1 px-1.5'}`}
    >
      <span aria-hidden className={kopfGlypheKlassen(kompakt)}>⚖</span>
      {/* N1 (7.9.2026): DAS WORT steht fest, die Zahl ist eine Marke daneben —
          Herleitung in `./panelModell` (`OEFFNER_WORT`). Auf `mini` bleibt es
          bei Ikone + Zahl (H4-II: die Kopfzeile misst dort innen 350 px). */}
      {!kompakt && <span className="whitespace-nowrap">{OEFFNER_WORT}</span>}
      {/* `tabular-nums` (`num`) + `whitespace-nowrap`: die Zahl wechselt mit der
          Leseposition (Scroll-Spy). Proportionale Ziffern liessen den Knopf bei
          jedem Artikelwechsel um Bruchteile atmen und schöben die Nachbarn —
          eine Bewegung in der klebenden Kopfzeile, die niemand angefordert hat.
          FESTE BREITE statt Auf- und Zuklappen — zwei Befunde in einem Kasten:
          (1) Die Marke kommt aus der Zähl-Datei und trifft im Leerlauf ein, also
              NACH dem ersten Bild. Ein `span`, das dann erst entsteht,
              verbreiterte den Knopf und schöbe die ganze Griff-Gruppe nach links
              — ein Layout-Shift ohne Eingabe (§15.2).
          (2) GEMESSEN 7.9.2026 (`leser-v3-kopf` A9, «Ansicht + Gliederungs-Sprung,
              CLS 0»): mit blosser Mindestbreite genügte `tabular-nums` NICHT.
              Die Zahl folgt der Leseposition (Scroll-Spy); wechselt sie die
              STELLENZAHL (3 → 11 → 121), wächst der Kasten mit, und die Sonde
              meldete CLS 8.1e-7 gegen die zugesagte 0. Seit N1 steht die Zahl
              schon vor dem ersten Öffnen da — der Knopf atmet also beim blossen
              Scrollen, nicht erst nach einer Eingabe. 2.25 rem = 36 px tragen
              vier Ziffern in dieser Stufe; mehr Entscheide führt kein Artikel.
          (3) Und die Zahl steht LINKS im Fach, nicht rechts — das ist der Fix,
              der die Null wirklich gebracht hat, und er ist gemessen statt
              geraten: ein `PerformanceObserver` auf die Shift-QUELLEN (7.9.2026,
              BV #art-8 @1440) meldete als einzigen Knoten genau dieses
              `SPAN.num`, mit fester Breite UND fester Höhe. Ursache: rechts-
              bündig wächst eine Zahl nach LINKS — beim Wechsel 3 → 12 rutscht
              die schon gemalte Ziffer um eine Stelle, und genau das IST der
              Shift. Linksbündig bleibt sie stehen, die neue Ziffer kommt rechts
              dazu; nachgemessen 0 Einträge. `h-4 leading-4` steht daneben, weil
              ein leeres `inline-block` sonst 0 px hoch wäre und die Griff-Zeile
              sich neu ausrichtete, sobald die Zahl eintrifft.
          Dieselbe Bauform wie die leere Fassungs-Angabe im Artikelkopf
          (`index.css`, `.lr7-fassung [data-hist-slot]:empty`): der Platz steht,
          der Inhalt darf fehlen — eine 0 behauptet er nie (§8).
          Auf `mini` gibt es keine Reserve: dort trägt der Chip nur die Zahl, und
          eine leere Box wäre die halbe Breite des Knopfes. */}
      {kompakt
        ? marke && <span className="num whitespace-nowrap">{marke}</span>
        : <span aria-hidden className="num inline-block h-4 w-[2.25rem] whitespace-nowrap text-left leading-4">{marke}</span>}
    </button>
  );
}
