import { useCallback, useState } from 'react';
import { labelMitBereich } from '../../../lib/normtext/darstellung';
import { useBezuege } from '../bezuegeLaden';
import { KLASSE_SCHALTER } from '../bezugAuswahl';
import { bereichLabel, type Zeitbereich } from '../bezugZeit';
import { bestimmungDativ, type BestimmungsWort } from './erlassAnsicht';
import { useLeserOptionen } from '../leserOptionen';
import { STATUS_RANG, type BezugStatus } from '../../../lib/verzahnung/facetten';
import type { Bezug } from '../../../lib/rechtsprechung/bezuege';

// ─── Modell des Rechtsprechungs-/Kontext-Panels (FAHRPLAN-LESER-V3 Kap. 4d, H3) ─
//
// Rechnende und zustandshaltende Hälfte des Panels — ohne JSX, damit die drei
// Zusagen ohne Browser prüfbar sind (§3/§6): der Zähler-Wortlaut, die
// Reiter-Ordnung und die Gruppierung der Kanten.
//
// ── NACHLADEN: DIE EINE STELLE, AN DER ES ENTSCHIEDEN WIRD (Kap. 7) ─────────
// `useBezuege` bekommt den Erlass-Key ERST, nachdem das Panel einmal offen war.
// Ohne Key läuft ihr Lade-Effekt in die frühe Rückgabe (`if (!erlassKey) return`),
// es geht also kein Byte des Bezugs-Shards über die Leitung, solange niemand das
// Panel aufzieht. Gemessen: BGG 300.2 KB gzip, BV 123.3, StPO 102.0
// (`check:perf-budget` führt die drei als eigene Budget-Zeilen).
//
// `jeGeoeffnet`, NICHT `offen`: Schliessen wirft die Daten nicht weg. Ein Panel,
// das bei jedem Zu/Auf neu lädt, wäre teurer als das eager-Laden, das wir gerade
// abgeschafft haben — und der Zähler verlöre seine Zahl wieder (§8).
//
// DIE HÜLLE BLEIBT DIE SELBE DATENLOGIK: geladen, gefiltert und gezählt wird
// weiterhin ausschliesslich in `bezuegeLaden`/`bezugAuswahl`/`bezugZeit`/
// `lib/rechtsprechung/bezuege`. H3 verschiebt den ZEITPUNKT und den ORT der
// Darstellung, nicht die Rechnung (§5).

export type PanelReiter = 'entscheide' | 'aenderungen' | 'materialien' | 'anwendung';

/** Reiter-Ordnung UND Beschriftung aus EINER Quelle (§5): ein Reiter, der hier
 *  fehlt, existiert nirgends; einer, der hier steht, ist überall gleich benannt.
 *  Reihenfolge = die Reihenfolge der Fragen am Gesetzesartikel: wie wird er
 *  ausgelegt (Entscheide) · wie ist er geworden (Änderungen) · woher kommt er
 *  (Materialien) · wie wendet man ihn an (Anwendung).
 *
 *  DER VIERTE STEHT HINTEN, NICHT NEBEN «ENTSCHEIDE» (W2·7-VZUI, 31.8.2026):
 *  fachlich stünde «Anwendung» der Auslegung am nächsten, die Reihe wäre dann
 *  aber nicht mehr die Frage-Chronologie, die sie erklärt — und ein Umsortieren
 *  verschöbe den Pfeiltasten-Weg, den `leser-v3-panel-facetten` (b) als Zusage
 *  misst. Der Zuwachs kostet damit nichts an bestehender Bedienung. */
export const PANEL_REITER: readonly { id: PanelReiter; label: string }[] = [
  { id: 'entscheide', label: 'Entscheide' },
  { id: 'aenderungen', label: 'Änderungen' },
  { id: 'materialien', label: 'Materialien' },
  { id: 'anwendung', label: 'Anwendung' },
];

/**
 * Erklärender Titel eines Reiters — ERLASS-NEUTRAL (H3-Nachzug C1).
 *
 * Bis hierher stand «zu diesem Artikel» als Literal in `PANEL_REITER`. An einem
 * §-Erlass (BS-640.100) war das schlicht falsch (Ä23-Klasse). Das Zähl-Substantiv
 * kommt darum aus der EINEN Ableitung (`./erlassAnsicht`), und weil der Titel
 * damit vom Erlass abhängt, ist er eine Funktion und kein Feld: ein Feld hätte
 * verlangt, die Tabelle je Erlass neu zu bauen — und die Reiter-ORDNUNG hängt
 * nicht am Erlass (§5, eine Quelle je Frage).
 */
export function reiterTitel(id: PanelReiter, wort: BestimmungsWort): string {
  if (id === 'entscheide') return `Gerichtsentscheide zu ${bestimmungDativ(wort)}`;
  if (id === 'aenderungen') return 'Änderungserlasse dieses Erlasses';
  if (id === 'materialien') return 'Botschaften und Vernehmlassungen zu diesem Erlass';
  return 'Behörden-Ressourcen und Werkzeuge zu diesem Erlass';
}

/**
 * Alle Öffner des Panels an einem Marker (A3, H3-Nachzug).
 *
 * Sie stehen ausserhalb der Panel-Fläche — in der klebenden Kopfzeile und im
 * «Ansicht ▾»-Menü —, und die Aussenklick-Regel des Panels muss sie kennen: ohne
 * die Ausnahme schliesst ihr `pointerdown` das Panel, das ihr `click` gleich
 * darauf wieder öffnet (der Knopf hätte sichtbar nichts getan). EIN Sammel-Marker
 * statt einer Aufzählung von Selektoren, damit ein dritter Öffner nicht
 * vergessen werden kann; er steht hier und nicht in der Komponenten-Datei, weil
 * `react-refresh/only-export-components` (Tor `lint`) dort keinen zweiten Export
 * duldet.
 */
export const OEFFNER_SELEKTOR = '[data-v3-panel-oeffner]';

/**
 * Beschriftung des Panel-Öffners.
 *
 * ── §8: KEINE ZAHL, DIE WIR NICHT HABEN ────────────────────────────────────
 * `null` heisst «noch nicht geladen» und ergibt «Rechtsprechung» ohne Zahl —
 * NICHT «0 Entscheide». Der Bezugs-Shard wird erst beim Öffnen geholt (s. o.),
 * und ein Korpus führt kein leichtes Zähl-Sidecar, aus dem die Zahl vorher
 * bekannt sein könnte. Eine 0 an dieser Stelle wäre eine Behauptung über den
 * Bestand, die wir aus Unwissen aufstellen.
 *
 * `0` heisst «geladen, dieser Artikel führt keine Entscheide» und ergibt
 * ebenfalls KEINEN Zähler: ein «0 Entscheide →» ist genau der leere Zähler, den
 * die Erlass-Neutralitäts-Regel verbietet (Kantonserlasse ohne Bezüge).
 * Der Öffner bleibt in beiden Fällen da — er führt zu allen Reitern der Leiste
 * (seit W2·7-VZUI vier), nicht nur zu den Entscheiden.
 */
export function oeffnerLabel(anzahl: number | null): string {
  if (anzahl === null || anzahl <= 0) return 'Rechtsprechung';
  return anzahl === 1 ? '1 Entscheid' : `${anzahl} Entscheide`;
}

/**
 * Dasselbe für den Handy-Zuschnitt: nur die ZAHL, ohne Zähl-Substantiv.
 *
 * H4-II (17./18.8.2026). Auf `mini` ist die Kopfzeile innen 350 px breit
 * (gemessen @390, StPO) — «⚖ 14 Entscheide» misst dort 115 px, «⚖ 14» rund 50.
 * Die Ikone daneben sagt bereits, WOVON die Zahl handelt, und der volle
 * Wortlaut steht unverkürzt im Accessible Name (`oeffnerName`), also dort, wo
 * ihn ein Screenreader ohnehin liest.
 *
 * DIESELBE §8-SCHRANKE WIE OBEN, nicht eine zweite: keine Zahl, die wir nicht
 * haben. `null` (noch nicht geladen) und `0` (geladen, nichts erfasst) ergeben
 * die leere Zeichenkette — dann trägt der Chip nur die Ikone. Wer hier eine «0»
 * schriebe, behauptete auf dem engsten Zuschnitt genau das, was `oeffnerLabel`
 * auf den beiden anderen verbietet.
 */
export function oeffnerLabelKompakt(anzahl: number | null): string {
  return anzahl !== null && anzahl > 0 ? String(anzahl) : '';
}

/**
 * Maschinell lesbarer Zähler am Öffner (`data-v3-panel-anzahl`).
 *
 * DIESELBE WAHRHEIT WIE DAS LABEL, nicht eine zweite: `undefined` überall, wo
 * `oeffnerLabel` keine Zahl schreibt. Sonst stand am Kantonserlass sichtbar
 * «Rechtsprechung» und im Attribut «0» — zwei Aussagen an einem Knopf, und die
 * maschinelle war die falsche (gefunden beim ersten Lauf von
 * `leser-v3-panel-facetten` (d), 17.8.2026: «Öffner zeigt ‹0›»).
 */
export function zaehlerAttribut(anzahl: number | null): number | undefined {
  return anzahl !== null && anzahl > 0 ? anzahl : undefined;
}

/** Voller Accessible-Name des Öffners — sagt, WAS sich öffnet und WORAUF sich
 *  die Zahl bezieht (der Zähler allein ist zweideutig: Artikel oder Erlass?). */
export function oeffnerName(anzahl: number | null, artikelLabel: string | null): string {
  const ort = artikelLabel ? ` zu ${artikelLabel}` : '';
  if (anzahl === null) return `Rechtsprechung und Kontext${ort} öffnen`;
  if (anzahl <= 0) return `Rechtsprechung und Kontext${ort} öffnen — keine Entscheide erfasst`;
  return `Rechtsprechung und Kontext${ort} öffnen — ${anzahl} ${anzahl === 1 ? 'Entscheid' : 'Entscheide'}`;
}

/**
 * Kurzstand der Instanz-Wahl für die Filterzeile: «BGE» · «BGE +2» · «keine».
 *
 * Ä54: die Klappe muss ihren Stand NENNEN, sonst ist eine eingeklappte Facette
 * ein verstecktes Filter — und ein Ergebnis, dessen Einschränkung man nicht sieht,
 * ist eine falsche Auskunft über den Bestand (§8). Die Kurznamen kommen aus
 * `KLASSE_SCHALTER` (derselben Quelle wie die Schalter selbst, §5).
 */
export function instanzStand(klassen: readonly BezugStatus[]): string {
  const erste = klassen[0];
  if (erste === undefined) return 'keine';
  return klassen.length === 1
    ? KLASSE_SCHALTER[erste]
    : `${KLASSE_SCHALTER[erste]} +${klassen.length - 1}`;
}

/** Kurzstand des Zeitraums. `bereichLabel` liefert bei offenem Bereich `null` —
 *  daraus wird «alle», nie eine erfundene Jahreszahl (§8). */
export function zeitStand(bereich: Zeitbereich): string {
  return bereichLabel(bereich) ?? 'alle';
}

/**
 * Kanten nach Instanz-Klasse gruppieren, Klassen nach `STATUS_RANG`.
 *
 * Dieselbe Ordnung wie am Artikelfuss der Ist-Hülle (`BezuegeZeile`) und aus
 * demselben Grund (§8, `facetten.ts`): «Wer die drei in EINE Liste kippt und nur
 * nach Datum sortiert, behauptet stillschweigend Gleichrang.» Die Reihenfolge
 * INNERHALB einer Klasse ist die Shard-Ordnung (chronologisch neu → alt) — hier
 * wird sie erhalten, nie neu gesetzt (§5: keine zweite Sortier-Wahrheit).
 */
export function gruppiereKanten(kanten: readonly Bezug[]): [BezugStatus, Bezug[]][] {
  const gruppen = new Map<BezugStatus, Bezug[]>();
  for (const b of kanten) {
    const liste = gruppen.get(b.facetten.status);
    if (liste) liste.push(b);
    else gruppen.set(b.facetten.status, [b]);
  }
  return [...gruppen.entries()].sort((a, b) => STATUS_RANG[a[0]] - STATUS_RANG[b[0]]);
}

export interface PanelZustand {
  /**
   * REGEL DAVID 16.8.2026 (V-0-Entscheid F8), an EINER Stelle: Schalter
   * «Rechtsprechung im Text» AUS ⇒ Zähler UND Randlasche weg.
   *
   * Der Schalter ist der umgewidmete `leitfaelle`-Schalter des «Ansicht ▾»
   * (Kap. 4f, seit H1). Er steuert in V3 nicht mehr eine Zeile im Lesetext — die
   * gibt es dort nicht mehr —, sondern die SICHTBARKEIT DER ÖFFNER. Das Panel
   * bleibt dabei erreichbar: über «Ansicht ▾» wieder einschaltbar und über die
   * Taste `r` (Kap. 4h, `LeserTastatur`) direkt aufziehbar. «Aus» heisst «ich
   * will keinen Rechtsprechungs-Hinweis sehen», nicht «ich verzichte auf den
   * Zugang».
   */
  oeffnerSichtbar: boolean;
  offen: boolean;
  /** War das Panel in dieser Sitzung schon einmal offen — oder hat jemand
   *  ANDERS nach denselben Daten gefragt? Steuert das Nachladen.
   *
   *  D30 (6.9.2026): das Flag heisst weiterhin so, trägt aber seither zwei
   *  Auslöser. Der zweite ist `weckeDaten()` unten. */
  jeGeoeffnet: boolean;
  reiter: PanelReiter;
  setReiter: (r: PanelReiter) => void;
  oeffne: (r?: PanelReiter) => void;
  schliesse: () => void;
  umschalten: () => void;
  /**
   * Die Daten holen, OHNE das Panel aufzuziehen (W2·24-R5-F1K, D30).
   *
   * Anlass, Davids Wortlaut: die Bezüge-Zeile am Artikelkopf «klappt auf, zeigt
   * aber nur den Rechnen-Block; die gezählten Entscheide … werden nicht
   * geladen». Sie sass am kurzen Ende von H3: der Bezugs-Shard wird seither erst
   * beim Öffnen des Panels geholt, und die Zeile hatte keinen Weg, danach zu
   * fragen. Die Zahl stand da (Zähl-Datei, R6c), der Apparat kam nie.
   *
   * DIESELBE STELLE, KEIN ZWEITER LADEPFAD (§5): das Aufklappen setzt genau das
   * Flag, das auch das Panel setzt — `useBezuege` bekommt seinen Erlass-Key,
   * `usePanelBezuege` und die Bezüge-Zeile lesen danach DIESELBE Hook-Instanz.
   * Wer erst die Zeile aufklappt und dann das Panel öffnet, löst keinen zweiten
   * Fetch aus; wer die Zeile wieder zuklappt, verliert die Daten nicht (der
   * Grund, aus dem das Flag `jeGeoeffnet` heisst und nicht `offen`).
   */
  weckeDaten: () => void;
}

export function usePanelZustand(): PanelZustand {
  const oeffnerSichtbar = useLeserOptionen().leitfaelle === 'an';
  const [offen, setOffen] = useState(false);
  const [jeGeoeffnet, setJeGeoeffnet] = useState(false);
  const [reiter, setReiter] = useState<PanelReiter>('entscheide');

  const oeffne = useCallback((r?: PanelReiter) => {
    if (r) setReiter(r);
    setJeGeoeffnet(true);
    setOffen(true);
  }, []);
  const schliesse = useCallback(() => setOffen(false), []);
  // D30: nur das Lade-Flag, kein `setOffen` — das Panel bleibt zu.
  // `setJeGeoeffnet(true)` auf einem bereits gesetzten Flag ist in React ein
  // No-op (Bail-out), die Zeile darf also bei jedem Aufklappen rufen.
  const weckeDaten = useCallback(() => setJeGeoeffnet(true), []);
  const umschalten = useCallback(() => {
    setOffen((o) => {
      if (!o) setJeGeoeffnet(true);
      return !o;
    });
  }, []);

  // `offen` ist BEWUSST NICHT mit `oeffnerSichtbar` verrechnet. Die F8-Regel
  // nimmt die ÖFFNER weg, nicht den Zugang: «Panel bleibt über ‹Ansicht ▾› und
  // Tastatur erreichbar». Wer `r` drückt, während der Schalter aus ist, bekommt
  // das Panel — es hat dann nur keine Lasche und keinen Zähler, über die man es
  // wieder zumachen könnte, wohl aber sein eigenes ✕ und Esc.
  return { oeffnerSichtbar, offen, jeGeoeffnet, reiter, setReiter, oeffne, schliesse, umschalten, weckeDaten };
}

/**
 * Bezugs-Daten des Panels — dieselbe Hook wie in der Ist-Hülle, nur mit
 * verzögertem Key (Begründung im Dateikopf).
 *
 * Rückgabe ist unverändert die von `useBezuege`; das Panel bekommt damit
 * `bezuegeFuer`, die verfügbaren Kantone, die Klassen-Zahlen des Erlasses und
 * das Jahres-Histogramm aus EINER Quelle.
 */
export type PanelBezuege = ReturnType<typeof useBezuege>;

export function usePanelBezuege(erlassKey: string | undefined, jeGeoeffnet: boolean): PanelBezuege {
  return useBezuege(jeGeoeffnet ? erlassKey : undefined);
}

/**
 * Trefferzahl am Öffner: Kanten des GELESENEN Artikels nach Facetten-Filter.
 *
 * `null` = wir wissen es nicht (Lade-Versuch noch offen) ⇒ der Öffner zeigt
 * keine Zahl (§8, siehe `oeffnerLabel`). Die Unterscheidung «lädt noch» gegen
 * «leer» kann NICHT aus `bezuegeFuer` kommen: die Hook gibt in beiden Fällen
 * `undefined` zurück (Begründung dort). Sie kommt darum aus `geladen` — und
 * zwar seit dem H3-Nachzug (A1) aus dem **Lade-Ende-Signal von `useBezuege`**,
 * nicht mehr aus dem Klassen-Zähler des Erlasses.
 *
 * ── WARUM DER KLASSEN-ZÄHLER DAFÜR UNTAUGLICH WAR (gemessen 17.8.2026) ──────
 * `shardGeladen(klassenImErlass)` hiess «nicht leer ⇒ ausgewertet». Ein Erlass
 * ohne Shard bekommt aber ein `{}`, das sich von «noch nicht geladen» nicht
 * unterscheidet — der Zustand blieb an 1149 von 1459 Erlassen (79 %) für immer
 * «lädt noch». Die Funktion ist darum gestrichen, nicht bewacht (§17): ein
 * Signal, das die entscheidende Lage nicht ausdrücken KANN, lässt sich nicht
 * durch einen Test retten.
 */
export function trefferZahl(
  bezuegeFuer: (artikel: string) => { kanten: readonly Bezug[] } | undefined,
  geladen: boolean,
  aktArtikel: string | null,
): number | null {
  if (!geladen || !aktArtikel) return null;
  return bezuegeFuer(aktArtikel)?.kanten.length ?? 0;
}

/**
 * Auf WELCHEN Artikel bezieht sich das Panel?
 *
 * ── DER BEFUND, DEN DAS BEHEBT (gemessen 17.8.2026 @390, StPO) ─────────────
 * Der Scroll-Spy setzt die Leseposition erst, wenn ein Artikel die Beobachtungs-
 * zone erreicht. Auf dem Handy-Zuschnitt ist sie beim Ankommen noch NICHT
 * gesetzt (`[data-v3-kopf-artikel]` count 0). Wer dort das Panel öffnete, las
 * «Zu diesem Erlass ist kein Entscheid der eingeschalteten Instanzen erfasst» —
 * an einem Erlass mit 1443 Verknüpfungen. Das ist keine leere Liste, das ist
 * eine falsche Tatsachenbehauptung (§8), und sie entstand aus einem Zustand, den
 * der Nutzer nicht kennt und nicht herstellen wollte.
 *
 * FALLBACK IST DER ERSTE ARTIKEL DES ERLASSES — und er wird BENANNT: der
 * Panel-Kopf schreibt «· Art. 1» daneben, das Kurz-Zitat trägt dieselbe Angabe.
 * Damit ist die Auskunft wahr («die Entscheide zu Art. 1»), statt wahr-aber-
 * unbrauchbar («keine Leseposition») oder falsch («nichts erfasst»).
 *
 * Das Label kommt aus `labelMitBereich` — derselben Funktion, aus der der Kern
 * es baut (§5): sonst stimmte das `?norm=` bei Bereichs-Artikeln nicht.
 */
export function panelBezug(
  aktArtikel: string | null,
  aktivToken: string | null,
  erster: { artikelLabel: string; artikel: string } | undefined,
): { label: string | null; token: string | null } {
  if (aktArtikel && aktivToken) return { label: aktArtikel, token: aktivToken };
  if (!erster) return { label: null, token: null };
  return { label: labelMitBereich(erster.artikelLabel, erster.artikel), token: erster.artikel };
}

/**
 * Kurz-Zitat für den Fundstellen-Sprung («Art. 429 StPO»).
 *
 * MUSS ZEICHENGLEICH SEIN mit dem, was der Kern am Artikelfuss baut
 * (`ArtikelLeser`: `${labelMitBereich(e.artikelLabel, e.artikel)} ${erlass.kuerzel}`)
 * — sonst matcht der EntscheidLeser die zitierende Erwägung nicht mehr und der
 * Sprung landet am Seitenanfang. Der Scroll-Spy liefert genau dieses Label
 * (`artLabelByToken` in `inhalt-ableitungen` wendet `labelMitBereich` an), es
 * wird hier also NICHT neu gebildet, nur zusammengesetzt (§5).
 *
 * Ohne Leseposition bleibt das Kürzel allein — ein erfundenes «Art. 1» wäre eine
 * falsche Fundstellen-Angabe (§8).
 */
export function normZitat(artikelLabel: string | null, kuerzel: string): string {
  return artikelLabel ? `${artikelLabel} ${kuerzel}` : kuerzel;
}
