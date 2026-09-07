import {
  pfadTeil, entscheidPfad, erlassVonPfad, verlaufLabel, katalogKurzform,
  type VerlaufManifeste,
} from './verlaufLabel';
import { reiterKategorie, artikelLabelVonPfad } from './tabGruppen';
import { metaFuerPfad } from './seo';

// ─── Offene In-App-Reiter (Tab-Streifen, Auftrag David) ─────────────────────
//
// SSoT des localStorage-Keys 'lexmetrik-tabs' (§5). Reines Speicher-Werkzeug,
// KEINE Rechtslogik (§3): die Liste der zugleich offenen Reiter (Engines,
// Gesetze, Vorlagen, Entscheide), damit man ohne Browser-Tab zwischen mehreren
// hin- und herwechseln kann. Gespeichert wird NUR der Navigationspfad (+ optio-
// nales Anzeige-Label), NIE Formularinhalte (Berufsgeheimnis; das v1 erhält die
// Reiter-LISTE über Reloads, nicht den flüchtigen Formular-State — bewusste
// Grenze, navigationsbasiert). Reihenfolge = Array-Position, NEUE Reiter HINTEN
// angehängt (stabil, anders als der neueste-vorn-Ring in verlauf.ts) — kein
// Zeitstempel, also kein Date.now() in src/lib (§2 Determinismus).

export interface TabEintrag {
  path: string;
  label?: string;
  /** ── D27 (David 6.9.2026) · DER GEWÄHLTE ANKER — SEIT D27 NUR NOCH RÜCKFALL
   *  `path` trägt die LESESTELLUNG: der Scroll-Spy des Lesers schiebt dort
   *  laufend `#art-…` hinein (`aktualisiereTabArtikel`), damit ein Neustart an
   *  derselben Stelle aufsetzt (§5a Ziff. 6) und die Reiter-Liste die Position
   *  zeigt.
   *
   *  Der R2-Nachzug (F5) baute die Beschriftung ausdrücklich NICHT daraus,
   *  sondern aus diesem Feld — dem Anker, den die ADRESSE trug —, weil dieselbe
   *  Adresse sonst zwei Beschriftungen trug («ZGB» kalt, «Art. 3 ZGB» nach dem
   *  Scrollen). David 6.9.2026 hat die Regel UMGEDREHT: «diese funktion, dass
   *  es anzeigt in welchem artikel wir sind, soll der tab bekommen. es kann
   *  dann direkt im gesetz raus.» Determinismus (§2) heisst seither «gleiche
   *  LESESTELLUNG ⇒ gleiche Beschriftung» statt «gleiche Adresse ⇒ gleiche
   *  Beschriftung» — und die Lesestellung ist der gespeicherte `path`, der den
   *  Neustart überlebt (Kaltstart == SPA == Reload bei gleicher Stellung).
   *
   *  `wahl` bleibt der RÜCKFALL für das Fenster VOR dem ersten Spy-Lauf: ein
   *  Deep-Link `…#art-336_c`, der über `merkeTab` ohne Hash im `path`
   *  nachaktualisiert wird, verlöre sonst seinen Artikel, bis der Leser das
   *  erste Mal gescrollt hat. Er wird nie aus der Lesestellung nachgezogen. */
  wahl?: string;
  /** ── D19 (David 6.9.2026: «mit plus einen neuen reiter erzeugen können») ──
   *  Markiert den EINEN Browser-artigen «+»-Reiter: Pfad `/`, aber — anders
   *  als die sonst reiterlose Startseite (D7-Abweichung unten) — ein
   *  ausdrücklich angelegtes, noch UNGEFÜLLTES Dokument. `neuerLeererReiter`
   *  legt höchstens einen gleichzeitig an; die erste Navigation/Suche
   *  ERSETZT ihn (§5a Ziff. 3, über `ersetzeTab`) mit einem frischen Eintrag
   *  OHNE dieses Feld — er ist dann kein leerer Reiter mehr, ganz ohne
   *  Sonderfall an der Ersetzungsstelle. */
  leer?: boolean;
}

// ─── D7 (David 6.9.2026: «achte darauf dass der reiter bei gesetz mitzählt») ─
//
// PFLICHTFALL (e) aus dem Befund: «Übersicht /gesetze: Reiter? — Regel
// festlegen». Die bis hierher geltende Regel war «Übersichten erzeugen KEINEN
// Reiter» (`components/TabTracker.tsx`, Kommentar seit der Einführung). Sie
// hatte einen guten Grund — ein Seitenleisten-Klick sollte nicht jedes Mal
// einen Reiter anlegen —, aber dieser Grund ist mit §5a Ziff. 3 entfallen: seit
// dem R2-Nachzug ERSETZT eine Navigation den aktiven Reiter, sie häuft nicht
// mehr an. Was damals Wildwuchs erzeugt hätte, erzeugt heute genau einen
// Reiter, der weiterwandert.
//
// NEUE REGEL, in einem Satz: Die fünf BEREICHS-Übersichten sind Reiter wie
// jedes andere Dokument — «Gesetze», «Rechtsprechung», «Materialien»,
// «Rechner», «Vorlagen»; sie zählen in «N offen» und in Alt+Ziffer mit.
//
// ABWEICHUNG, ausdrücklich offengelegt (§7): Die STARTSEITE «/» erzeugt
// weiterhin KEINEN Reiter. Sie ist kein Bestandteil der Sammlung, sondern ihr
// Titelblatt: über die Marke von jeder Route aus einen Klick entfernt, ohne
// eigenen Zustand, und ein Reiter «Sammlung» neben den fünf Bereichen wäre der
// einzige, den man nie schliessen wollte. Eine Kurzform trägt sie trotzdem
// (unten) — sie kann als Reiter EXISTIEREN, wenn jemand sie ausdrücklich
// daneben öffnet (Pane, Ctrl-Klick, Prüfbefund R3-F7); nur angelegt wird sie
// nicht von selbst. Ebenso unverändert ohne Reiter: Meta- und Infoseiten
// (/ueber, /methodik, /einstellungen …).
export const BEREICHS_UEBERSICHTEN = [
  '/gesetze', '/rechtsprechung', '/materialien', '/rechner', '/vorlagen',
] as const;

/** Trägt dieser Pfad einen eigenen Reiter? EIN Ort für die Regel (§5) —
 *  gelesen von `components/TabTracker.tsx`. `path` darf ?query/#hash tragen.
 *
 *  ── M2 (Prüfbefund R11 #23, 6.9.2026) · MATERIALIEN GEHÖREN DAZU ───────────
 *  GEMESSEN (Preview 4362, `/materialien/BJ-EHRA-PM-2025-01`, Titel
 *  «Praxismitteilung EHRA 1/25»): die Leiste blieb bei ihren fünf Reitern, ein
 *  sechster entstand nicht — die Rubrik fehlte in diesem einen Regex. Damit
 *  waren 1'561 prerenderte Material-Detailseiten reiterlos: wer eine Botschaft
 *  nachschlägt, verliert sie beim nächsten Klick, und die Übersicht
 *  `/materialien` (seit D7 ein Reiter) führte zu Detailseiten, die keiner mehr
 *  sind. Die D7-Regel sagt es bereits im Satz darüber — «die fünf
 *  Bereichs-Übersichten sind Reiter wie jedes andere Dokument»; ihre
 *  Detailseiten erst recht. */
export function istReiterPfad(path: string): boolean {
  const p = path.split('#')[0].split('?')[0];
  return /^\/(rechner|vorlagen|gesetze|rechtsprechung|materialien)\/.+/.test(p)
    || (BEREICHS_UEBERSICHTEN as readonly string[]).includes(p);
}

// ─── R3-F7 (Prüfbefund 6.9.2026) · KURZFORM STATT SEO-TITEL ─────────────────
//
// GEMESSEN: der Reiter für «/» trug `SITE_TITEL` («Schweizer Recht an einem
// Ort: …»), weil `labelAusMeta` die SEO-Metadaten der Route zurückgibt — für
// ein Browser-artiges Reiterband die falsche Zeichenkette (§5a Ziff. 2 verlangt
// die kanonische KURZFORM, «Art. 336c OR», «BGE 152 V 52»). Dieselbe Falle
// trifft jede Übersichts-Route, die mit D7 jetzt ein Reiter werden kann.
// Darum eine kleine, geschlossene Tabelle genau für die Routen OHNE eigenes
// Inhalts-Objekt; alles andere holt seine Kurzform weiterhin aus dem Manifest
// (`Reiterleiste.kurzform`). Der volle Titel bleibt im `title` des Reiters.
const KURZFORM: Record<string, string> = {
  '/': 'Sammlung',
  '/gesetze': 'Gesetze',
  '/rechtsprechung': 'Rechtsprechung',
  '/materialien': 'Materialien',
  '/rechner': 'Rechner',
  '/vorlagen': 'Vorlagen',
};

/** Kanonische Kurzform einer Übersichts-/Startseiten-Route — oder null, wenn
 *  die Beschriftung aus dem Inhalt selbst kommt (Erlass, Entscheid, Vorlage). */
export function reiterKurzform(path: string): string | null {
  return KURZFORM[path.split('#')[0].split('?')[0]] ?? null;
}

/** ── Gerichts-Kurzformen (F6) ───────────────────────────────────────────────
 *  Die Zitierung eines Entscheids ist «Gericht + Geschäftsnummer». GEMESSEN
 *  6.9.2026: «Obergericht AG HOR.2024.19» lief in `max-w-[13rem]` auf und wurde
 *  als «Obergericht AG HOR.2024.1…» abgeschnitten — die Nummer ist aber das
 *  EINZIGE, was den Entscheid identifiziert (§8: lieber das Gericht kürzen als
 *  die Nummer verstümmeln).
 *  Die Tabelle ist BEWUSST geschlossen und trägt nur die im schweizerischen
 *  Gebrauch etablierten Kürzel (BGer, OGer, KGer …). Ein unbekanntes Gericht
 *  wird NICHT geraten (§7), sondern bleibt ausgeschrieben — dann trägt es die
 *  Kürzung, nicht die Nummer. */
const GERICHT_KURZ: Record<string, string> = {
  Bundesgericht: 'BGer',
  Bundesverwaltungsgericht: 'BVGer',
  Bundesstrafgericht: 'BStGer',
  Bundespatentgericht: 'BPatGer',
  Obergericht: 'OGer',
  Kantonsgericht: 'KGer',
  Verwaltungsgericht: 'VGer',
  Appellationsgericht: 'AppGer',
  Handelsgericht: 'HGer',
  Bezirksgericht: 'BezGer',
  Zivilgericht: 'ZGer',
  Strafgericht: 'StGer',
  Sozialversicherungsgericht: 'SVGer',
  Versicherungsgericht: 'VersGer',
  Arbeitsgericht: 'ArbGer',
  Mietgericht: 'MGer',
  Kassationsgericht: 'KassGer',
  Steuerrekursgericht: 'StRG',
  Baurekursgericht: 'BRG',
};

/** Zerlegung einer Zitierung in «Kopf» (kürzbar) und «Kern» (nie kürzbar).
 *  Kern = alles ab dem ersten Wort mit einer Ziffer, also die Geschäftsnummer
 *  bzw. bei einer BGE-Zitierung die Fundstelle («BGE» + «152 V 52»). Das
 *  angehängte Urteilsdatum («… vom 14.01.2026») fällt weg — es identifiziert
 *  nichts, was die Nummer nicht schon identifiziert, und der `title` des
 *  Reiters trägt die vollständige Zitierung weiter. Ohne Ziffern-Wort gibt es
 *  keinen Kern; dann kürzt wie bisher der ganze Text. */
function zerlege(zitierung: string): { kopf: string; kern: string } {
  const ohneDatum = zitierung.replace(/\s+vom\s+\d{1,2}\.\d{1,2}\.\d{2,4}\s*$/, '');
  const worte = ohneDatum.split(/\s+/).filter(Boolean);
  const i = worte.findIndex((w) => /\d/.test(w));
  if (i <= 0) return { kopf: '', kern: ohneDatum };
  const kopf = worte.slice(0, i).map((w) => GERICHT_KURZ[w] ?? w).join(' ');
  return { kopf, kern: worte.slice(i).join(' ') };
}

/** Kanonische Kurzform eines Reiters (§5a Ziff. 2): «Art. 336c OR», «BGE 152
 *  V 52», «Fristenrechner».
 *
 *  ── D27 (David 6.9.2026) · DER REITER SAGT, WO MAN STEHT ──────────────────
 *  «diese funktion, dass es anzeigt in welchem artikel wir sind, soll der tab
 *  bekommen. es kann dann direkt im gesetz raus.» Der Artikel kommt darum aus
 *  der LESESTELLUNG (`t.path`, vom Scroll-Spy geführt), nicht mehr aus dem
 *  Anker der Adresse (`t.wahl`, seit D27 nur noch Rückfall vor dem ersten
 *  Spy-Lauf). Determinismus (§2) ist damit nicht aufgegeben, sondern
 *  umformuliert: gleiche Lesestellung ⇒ gleiche Beschriftung — Kaltstart, SPA
 *  und Reload liefern bei gleicher Stellung dieselbe Zeichenkette, und jedes
 *  Pane folgt seiner eigenen Stellung (`aktualisiereTabArtikel` schreibt je
 *  Reiter-Identität).
 *
 *  DRITTER TEIL `stelle`, getrennt vom Kern — die Arbeitsleiste braucht die
 *  Trennung, um dem wandernden Artikel eine feste Breite zu reservieren
 *  (`.rl-stelle`, index.css); ohne sie schöbe jeder Artikelwechsel die ganze
 *  Leiste. Drei Werte, drei Bedeutungen:
 *    `null` → kein Gesetzes-Reiter, hier kann nie eine Stellung stehen;
 *    `''`   → Gesetzes-Reiter, Stellung noch unbekannt (Breite trotzdem
 *             reserviert, sonst ruckte der Reiter beim ersten Spy-Lauf);
 *    `'Art. 43a'` → die gelesene Stelle.
 *  Der Einzeiler (`reiterKurzformText`) bleibt Wort für Wort derselbe wie vor
 *  der Trennung — «Art. 336c OR», «Art. 266g OR (2)». */
function basisKurzform(t: TabEintrag, m: VerlaufManifeste): KurzformTeile {
  // D19: der leere Reiter zeigt '/', ist aber KEINE Startseite, sondern ein
  // eigenes, noch ungefülltes Dokument — er bekommt NICHT `reiterKurzform('/')`
  // («Sammlung»), sondern seinen eigenen Namen. Erste Prüfung, vor jeder
  // Pfad-Auflösung.
  if (t.leer) return { kopf: '', kern: NEUER_REITER_NAME, stelle: null };
  // R3-F7 (Prüfbefund 6.9.2026): Übersichts- und Startseiten-Routen tragen ihre
  // Kurzform aus `lib/tabs` («Gesetze», «Sammlung») statt des SEO-Titels, den
  // `labelAusMeta` liefert («Schweizer Recht an einem Ort: …»). Erst seit D7
  // können solche Routen überhaupt Reiter sein — die Kurzform ist die
  // Voraussetzung dafür, nicht eine Verzierung.
  const fest = reiterKurzform(t.path);
  if (fest) return { kopf: '', kern: fest, stelle: null };
  const kat = reiterKategorie(t.path);
  const kuerzel = kat === 'gesetze' ? erlassVonPfad(t.path, m)?.kuerzel : null;
  if (kuerzel) {
    // Gesetze: EIN kurzer Block («Art. 336c OR») — hier gibt es nichts, was
    // gegen die Kürzung geschützt werden müsste, der ganze Text ist die Marke.
    // ── R5 (Prüfbefund R11) · ZWEITE INSTANZ, ZWEITE STELLE ───────────────
    // GEMESSEN 6.9.2026: zwei offene Instanzen desselben Erlasses hiessen
    // beide «OR». Seit D27 trennt sie schon die Lesestellung selbst — die
    // Instanz-Nummer (unten, `reiterKurzformTeile`) bleibt als Unterscheidung
    // für den Fall, dass beide zufällig an derselben Stelle stehen.
    // REIHENFOLGE (D27): erst der gespeicherte Pfad — das ist die Stellung,
    // die der Spy führt und die den Neustart überlebt —, dann `t.wahl` als
    // Rückfall für das Fenster vor dem ersten Spy-Lauf.
    const anker = hashVon(t.path) ?? t.wahl;
    const art = anker ? artikelLabelVonPfad(anker) : null;
    return { kopf: '', kern: kuerzel, stelle: art ?? '' };
  }
  const voll = verlaufLabel(t.path, m);
  if (kat === 'rechtsprechung') return { ...zerlege(voll), stelle: null };
  // M7 (Prüfbefund R11 #21): der Katalog führt für die Karten, deren `title`
  // eine BESCHREIBUNG ist, eine ausdrückliche Kurzform (`kurz`) — GEMESSEN war
  // «Verfahrens- & Rechtsmittelfristen» mit 268 px der breiteste Reiter der
  // ganzen Leiste. Die Quelle bleibt der Katalog (§5); fehlt das Feld, steht
  // wie bisher der volle Titel da, nichts wird geraten (§7).
  return { kopf: '', kern: katalogKurzform(t.path) ?? ohneUntertitel(voll), stelle: null };
}

/** ── V4/F5-Rest (§5a Ziff. 2) · DER REITER TRÄGT DEN NAMEN, NICHT DEN UNTERTITEL
 *
 *  GEMESSEN 6.9.2026 (Preview 4352, vier Reiter): der Rechner-Reiter hiess
 *  «Fristenrechner (Tage · ZPO · SchKG)» — 34 Zeichen für eine Zeile, die
 *  «Fristenrechner» sagen soll, und im Streifen der breiteste von allen. Die
 *  Klammer ist der UNTERTITEL des Katalogs (was der Rechner alles kann), nicht
 *  der Name des Dokuments; §5a Ziff. 2 verlangt die kanonische Kurzform.
 *
 *  Deterministisch (§2) und bewusst eng: gestrichen wird NUR eine Klammer AM
 *  ENDE, und nur, wenn davor noch etwas steht. Ein Titel, der ganz in Klammern
 *  steht, bleibt unangetastet — dann ist die Klammer der Name. Die vollständige
 *  Bezeichnung geht nicht verloren: sie steht im `title` des Reiters und in der
 *  Reiter-Liste (§8). Gesetze und Entscheide gehen diesen Weg NICHT — dort ist
 *  eine Klammer Teil der Zitierung (§1: lieber zwei Wege als eine Abstraktion,
 *  die zwei verschiedene Fälle gleich behandelt). */
function ohneUntertitel(titel: string): string {
  const gekuerzt = titel.replace(/\s*\([^()]*\)\s*$/, '').trim();
  return gekuerzt.length > 0 ? gekuerzt : titel;
}

/** Instanz-Nummer eines Reiterpfads: 1 = die erste (kein `?r`), sonst der
 *  Wert des Diskriminators (`tabSchluessel`). Rein, ohne DOM (§2). */
function instanzNr(path: string): number {
  const qs = path.split('#')[0].split('?')[1];
  const n = Number(new URLSearchParams(qs ?? '').get('r'));
  return Number.isFinite(n) && n > 1 ? n : 1;
}

/** Die drei Teile einer Reiter-Kurzform. `stelle` s. `basisKurzform` (D27). */
export interface KurzformTeile { kopf: string; kern: string; stelle: string | null }

/** Kanonische Kurzform eines Reiters (§5a Ziff. 2), zerlegt in kürzbaren Kopf
 *  und ungekürzten Kern — die Arbeitsleiste braucht die Trennung, die
 *  Reiter-Liste und die Menü-Titel nur den Einzeiler darunter.
 *
 *  ── R5 · DIE INSTANZ STEHT IM NAMEN ────────────────────────────────────────
 *  Zwei Instanzen desselben Dokuments an DERSELBEN Stelle sind sonst nicht
 *  unterscheidbar — der Anker allein trennt sie nur, wenn sie auseinander
 *  liegen. Die Nummer ist deterministisch aus dem Pfad (`?r=n`) und steht am
 *  Kern, weil der Kopf (das gekürzte Gericht) wegfallen kann. */
export function reiterKurzformTeile(t: TabEintrag, m: VerlaufManifeste): KurzformTeile {
  const { kopf, kern, stelle } = basisKurzform(t, m);
  const nr = instanzNr(t.path);
  return { kopf, kern: nr > 1 ? `${kern} (${nr})` : kern, stelle };
}

/** Einzeiler für Suchfeld, Accessible Names und Titel. Reihenfolge = die
 *  Lesereihenfolge der Zitierung: Kopf (gekürztes Gericht) · Stelle («Art.
 *  43a») · Kern (Kürzel/Nummer). Leere Teile fallen weg — der Text ist damit
 *  vor und nach der D27-Trennung derselbe. */
export function reiterKurzformText(t: TabEintrag, m: VerlaufManifeste): string {
  const { kopf, kern, stelle } = reiterKurzformTeile(t, m);
  return [kopf, stelle, kern].filter((x) => !!x).join(' ');
}

/** ── R8 (Prüfbefund R11, 6.9.2026) · WAS DER `title` EINES REITERS SAGT ─────
 *
 *  GEMESSEN am Stand `c91541617`: der Tooltip trug den Stand NUR bei Gesetzen
 *  («OR — Stand 02.09.2026 — gelesen bis Art. 336c»); ein Entscheid-Reiter
 *  nannte kein Urteilsdatum und ein Rechner-Reiter nichts ausser seinem Namen.
 *  Gerade dort ist der Tooltip aber der Ort, an dem die Kurzform ihre Auskunft
 *  zurückgibt (§8): die Kurzform kürzt «Obergericht AG HOR.2024.19 vom
 *  14.01.2026» auf «OGer AG HOR.2024.19», und «Fristenrechner (Tage · ZPO ·
 *  SchKG)» auf «Fristenrechner».
 *
 *  AUS DER QUELLE, SONST GAR NICHT (§7): Stand und Urteilsdatum kommen aus den
 *  Manifesten, die Kurzbeschreibung aus dem Katalog (`karte.description`,
 *  SSoT §5). Fehlt ein Feld — oder ist das Manifest noch nicht geladen —,
 *  bleibt der Teil weg. Kein Platzhalter, keine Schätzung. Ein Entscheid mit
 *  `datumUnbekannt` (Quelle ohne Entscheiddatum) bekommt darum kein Datum.
 */
export function reiterTitel(t: TabEintrag, m: VerlaufManifeste): string {
  if (t.leer) return NEUER_REITER_NAME;
  const voll = verlaufLabel(t.path, m);
  const teile: (string | null)[] = [voll];

  const erlass = erlassVonPfad(t.path, m);
  const roh = erlass?.stand ?? null;
  const iso = roh ? /^(\d{4})-(\d{2})-(\d{2})/.exec(roh) : null;
  if (roh) teile.push(`Stand ${iso ? `${iso[3]}.${iso[2]}.${iso[1]}` : roh}`);

  const ent = entscheidPfad(t.path);
  if (ent) {
    const e = m.entscheide?.entscheide.find((x) => x.key === ent.key);
    const d = e && !e.datumUnbekannt ? /^(\d{4})-(\d{2})-(\d{2})/.exec(e.datum) : null;
    // Nur, wenn die Zitierung das Datum nicht ohnehin schon trägt («… vom …»).
    if (d && !/\svom\s\d/.test(voll)) teile.push(`vom ${d[3]}.${d[2]}.${d[1]}`);
  }

  const beschreibung = metaFuerPfad(pfadTeil(t.path))?.karte?.description ?? null;
  if (beschreibung) teile.push(beschreibung);

  // Die LESESTELLUNG. Seit D27 steht sie AUCH in der Beschriftung; hier bleibt
  // sie, weil der Tooltip die einzige Stelle ist, die sie ausspricht («gelesen
  // bis Art. 336c») statt sie nur zu nennen — und weil Kurzform und Tooltip aus
  // DERSELBEN Quelle kommen müssen (§5), sonst driften sie auseinander.
  const gelesen = reiterKategorie(t.path) === 'gesetze' ? artikelLabelVonPfad(t.path) : null;
  if (gelesen) teile.push(`gelesen bis ${gelesen}`);

  return teile.filter(Boolean).join(' — ');
}

const KEY = 'lexmetrik-tabs';
const MAX = 50;

/** Identität eines Reiters: pathname + optionaler Instanz-Diskriminator `?r=<n>`.
 *  Erlaubt DASSELBE Gesetz mehrfach offen (Auftrag David): zwei Reiter mit
 *  gleichem Pfad, aber verschiedenem `?r` sind verschiedene Reiter. Andere
 *  Query-Parameter (z.B. ?preset=) und der #Artikel-Anker gehören NICHT zur
 *  Identität — eine Engine mit ?preset=a/b bleibt EIN Reiter, der Artikel ändert
 *  nur Label/Scrollziel. */
export function tabSchluessel(path: string): string {
  const vorHash = path.split('#')[0];
  const [pfad, qs] = vorHash.split('?');
  const r = new URLSearchParams(qs ?? '').get('r');
  return r ? `${pfad}?r=${r}` : pfad;
}
/** Event, mit dem Schreiber (TabTracker, Schliess-Buttons) die Leser
 *  (useTabs → ReiterUebersicht/TabPanel) im selben Browser-Tab synchron halten. */
export const TABS_EVENT = 'lexmetrik:tabs';

export function ladeTabs(): TabEintrag[] {
  try {
    const roh = localStorage.getItem(KEY);
    const arr = roh ? JSON.parse(roh) : [];
    if (!Array.isArray(arr)) return [];
    return arr
      .filter((e): e is TabEintrag =>
        e && typeof e.path === 'string' &&
        (e.label === undefined || typeof e.label === 'string') &&
        (e.wahl === undefined || typeof e.wahl === 'string') &&
        (e.leer === undefined || typeof e.leer === 'boolean'))
      .slice(0, MAX);
  } catch {
    return [];
  }
}

function schreibe(tabs: TabEintrag[]): void {
  try { localStorage.setItem(KEY, JSON.stringify(tabs)); } catch { /* privater Modus — Reiter sind Komfort */ }
  try { window.dispatchEvent(new Event(TABS_EVENT)); } catch { /* SSR/kein window */ }
}

/** Anker der ADRESSE («#art-…») oder undefined. Quelle des `wahl`-Feldes. */
function hashVon(path: string): string | undefined {
  const i = path.indexOf('#');
  return i === -1 ? undefined : path.slice(i);
}

/** Eintrag aus einer Adresse bauen — mit `alt` als Vorzustand desselben Reiters
 *  (Label, Lesestellung und gewählter Anker überleben ein hash-/labelloses
 *  Update). EINE Stelle für diese Regel: `merkeTab` und `ersetzeTab` bauen
 *  denselben Eintrag, sonst driften «anhängen» und «ersetzen» auseinander. */
function eintragAus(path: string, label?: string, alt?: TabEintrag): TabEintrag {
  // Ein Update OHNE Artikel-Anker (z.B. vom TabTracker mit pathname+?r) darf den
  // vom Reader gepflegten Anker NICHT löschen — sonst verlöre die zweite Instanz
  // ihr Live-Label «Kürzel – Art. X» (Auftrag David).
  const neuPath = (!path.includes('#') && alt?.path.includes('#'))
    ? `${path}#${alt.path.split('#')[1]}`
    : path;
  const neuLabel = label ?? alt?.label;
  const neuWahl = hashVon(path) ?? alt?.wahl;
  return {
    path: neuPath,
    ...(neuLabel ? { label: neuLabel } : {}),
    ...(neuWahl ? { wahl: neuWahl } : {}),
  };
}

const gleich = (a: TabEintrag, b: TabEintrag): boolean =>
  a.path === b.path && a.label === b.label && a.wahl === b.wahl;

/** Öffnet/aktualisiert einen Reiter und hängt einen NEUEN hinten an (gekappt auf
 *  die jüngsten MAX). Dublette (per `tabSchluessel`) behält ihre Position
 *  (stabile Reihenfolge) und übernimmt nur ein neu aufgelöstes Label.
 *
 *  ── Seit dem R2-Nachzug ist das der Weg für einen AUSDRÜCKLICH neuen Reiter
 *  (Mittelklick, Ctrl/⌘-Klick, ⌘/Ctrl+Enter in der Suche, «zweite Instanz»).
 *  Die gewöhnliche Navigation geht über `ersetzeTab` (§5a Ziff. 3). */
export function merkeTab(path: string, label?: string): void {
  const teil = tabSchluessel(path);
  const bisher = ladeTabs();
  const idx = bisher.findIndex((t) => tabSchluessel(t.path) === teil);
  if (idx !== -1) {
    const alt = bisher[idx];
    const neu = eintragAus(path, label, alt);
    // nur schreiben, wenn sich etwas ändert (idempotent gegen Mehrfach-Aufruf)
    if (gleich(alt, neu)) return;
    const naechste = [...bisher];
    naechste[idx] = neu;
    schreibe(naechste);
    return;
  }
  schreibe([...bisher, eintragAus(path, label)].slice(-MAX));
}

/** ── §5a Ziff. 3 · EINE NAVIGATION ERSETZT DEN AKTIVEN REITER ───────────────
 *
 *  Wie im Browser: wer einem Link folgt, bekommt KEINEN neuen Reiter, sondern
 *  denselben Reiter mit neuem Inhalt («kein Reiter-Wildwuchs», David 6.9.2026).
 *  Drei Fälle, in dieser Reihenfolge — die Reihenfolge ist die ganze Regel:
 *
 *  1. **Das Ziel ist schon offen** → nur aktualisieren (`merkeTab`-Semantik).
 *     Der Wechsel auf einen bestehenden Reiter darf den vorher aktiven NICHT
 *     wegwerfen; sonst kostete jeder Klick in der Arbeitsleiste einen Reiter.
 *  2. **Der aktive Reiter existiert** → er wird an SEINER Position ersetzt
 *     (Reihenfolge bleibt stabil, der Reiter «wandert» nicht ans Ende).
 *  3. **Kein aktiver Reiter** (Kaltstart, Start-/Übersichtsseite als Herkunft)
 *     → anhängen wie bisher.
 *
 *  `altPath` ist die Adresse, aus der die Navigation kam; `null` heisst «es gab
 *  keinen». Rein deterministisch (§2), kein Zeitstempel, kein DOM. */
export function ersetzeTab(altPath: string | null | undefined, neuPath: string, label?: string): void {
  const teilNeu = tabSchluessel(neuPath);
  const bisher = ladeTabs();
  if (bisher.some((t) => tabSchluessel(t.path) === teilNeu)) { merkeTab(neuPath, label); return; }
  const idxAlt = altPath ? bisher.findIndex((t) => tabSchluessel(t.path) === tabSchluessel(altPath)) : -1;
  if (idxAlt === -1) { merkeTab(neuPath, label); return; }
  const naechste = [...bisher];
  // M3: der ERSETZTE Reiter ist so verloren wie ein geschlossener — er kommt
  // darum in denselben Ring. Genau hier ist der Verlust häufiger als im
  // Browser, weil §5a Ziff. 3 das Ersetzen zum Normalfall macht.
  merkeGeschlossen([{ eintrag: bisher[idxAlt], index: idxAlt }]);
  // KEIN `alt`-Vorzustand: der Reiter zeigt jetzt ein ANDERES Dokument — Label,
  // Lesestellung und gewählter Anker des alten gehören nicht dorthin.
  naechste[idxAlt] = eintragAus(neuPath, label);
  schreibe(naechste);
}

/** #12: Reiter umsortieren — verschiebt den gezogenen Reiter (vonPath) an die
 *  Position des Ziel-Reiters (nachPath). Identifikation über `tabSchluessel`
 *  (stabile Reiter-Identität); deterministisch, kein Zeitstempel.
 *
 *  ── D15/D16 (David 6.9.2026) · WOHIN GENAU, SAGT DER ZEIGER ────────────────
 *  «per drag and drop soll man register verschieben können … analog browser».
 *  Im Browser entscheidet die ZEIGERPOSITION über dem Ziel, ob der Reiter davor
 *  oder dahinter einrastet — darum der dritte Parameter. Er ist optional, und
 *  sein Default reproduziert die frühere, richtungsabhängige Regel BIT-GLEICH:
 *  wer nach links zieht, landet vor dem Ziel; wer nach rechts zieht, dahinter.
 *  Genau davon leben die ▲/▼-Knöpfe der Reiter-Liste (`layout/TabPanel.tsx`),
 *  die kein Zeiger-X haben — sie bleiben unangetastet (§6.3).
 *
 *  Der Zielindex wird NACH dem Herausnehmen neu bestimmt: sonst verschiebt der
 *  entnommene Reiter das Ziel um eins, und «davor» landete dahinter. */
export function ordneTabsUm(vonPath: string, nachPath: string, davor?: boolean): void {
  const bisher = ladeTabs();
  const von = bisher.findIndex((t) => tabSchluessel(t.path) === tabSchluessel(vonPath));
  const nach = bisher.findIndex((t) => tabSchluessel(t.path) === tabSchluessel(nachPath));
  if (von === -1 || nach === -1 || von === nach) return;
  const seite = davor ?? von > nach;
  const naechste = [...bisher];
  const [bewegt] = naechste.splice(von, 1);
  const nachNeu = naechste.findIndex((t) => tabSchluessel(t.path) === tabSchluessel(nachPath));
  naechste.splice(seite ? nachNeu : nachNeu + 1, 0, bewegt);
  schreibe(naechste);
}

export function schliesseTab(path: string): void {
  const teil = tabSchluessel(path);
  const bisher = ladeTabs();
  const idx = bisher.findIndex((t) => tabSchluessel(t.path) === teil);
  if (idx === -1) return;
  merkeGeschlossen([{ eintrag: bisher[idx], index: idx }]);
  schreibe(bisher.filter((_, i) => i !== idx));
}

export function leereTabs(): void {
  // Reihenfolge: der ERSTE Reiter zuerst in den Ring, damit die
  // Wiederherstellung (vom Ende her) von hinten nach vorn zurückholt und
  // Position um Position stimmt.
  merkeGeschlossen(ladeTabs().map((eintrag, index) => ({ eintrag, index })));
  schreibe([]);
}

/** ── M4 · «ALLE ANDEREN SCHLIESSEN» (Prüfbefund R11 #35) ────────────────────
 *  Reiner Array-Filter, deterministisch (§2), Identität über `tabSchluessel`.
 *  Kein Sonderfall für den leeren «+»-Reiter: er ist ein Reiter wie jeder
 *  andere und wird mitgeschlossen, wenn er nicht der genannte ist. */
export function schliesseAndere(path: string): void {
  const teil = tabSchluessel(path);
  const bisher = ladeTabs();
  if (!bisher.some((t) => tabSchluessel(t.path) === teil)) return;
  const weg = bisher.map((eintrag, index) => ({ eintrag, index }))
    .filter(({ eintrag }) => tabSchluessel(eintrag.path) !== teil);
  if (weg.length === 0) return;
  merkeGeschlossen(weg);
  schreibe(bisher.filter((t) => tabSchluessel(t.path) === teil));
}

/** ── M4 · «RECHTS DAVON SCHLIESSEN» ────────────────────────────────────────
 *  Alles NACH der Position des genannten Reiters fällt weg; der genannte und
 *  alles links davon bleibt. Die Position ist die des flachen Speichers — also
 *  genau die, die die Arbeitsleiste zeigt (D16). */
export function schliesseRechtsVon(path: string): void {
  const teil = tabSchluessel(path);
  const bisher = ladeTabs();
  const idx = bisher.findIndex((t) => tabSchluessel(t.path) === teil);
  if (idx === -1 || idx === bisher.length - 1) return;
  merkeGeschlossen(bisher.slice(idx + 1).map((eintrag, i) => ({ eintrag, index: idx + 1 + i })));
  schreibe(bisher.slice(0, idx + 1));
}

// ─── M3 (Prüfbefund R11 #37, 6.9.2026) · «ZULETZT GESCHLOSSEN» ──────────────
//
// GEMESSENER ANLASS: Alt+Shift+T liess die Reiterliste unverändert, und
// `localStorage` führte keinen Schliess-Ring (G4/G4c). Im Browser ist das
// Wiederherstellen die Rückfahrkarte für jedes versehentliche ✕ — hier ist es
// MEHR als das: seit §5a Ziff. 3 ERSETZT schon eine gewöhnliche Navigation den
// aktiven Reiter (`ersetzeTab`), der Verlust ist also Alltag und nicht Unfall.
// Rechner-Eingaben liegen vollständig in der Adresse (`?e=…&k=ZH`), gehen mit
// dem Reiter also mit — genau darum ist die Wiederherstellung der richtige
// Ersatz für eine Schliess-Warnung und nicht deren Ergänzung.
//
// BERUFSGEHEIMNIS · DIESELBE GRENZE WIE `lexmetrik-tabs`, NICHT WEITER: der
// Ring speichert AUSSCHLIESSLICH `TabEintrag`-Objekte, also Pfad + Label +
// gewählter Anker — dieselben Felder, dieselbe Herkunft, dieselbe Lebensdauer
// wie die offene Reiterliste selbst. Eine Rechner-Adresse trägt Falldaten
// (`?e=2025-01-15&k=ZH`); sie tut das schon heute in `lexmetrik-tabs`, und der
// Ring verlängert genau diese eine Grenze um höchstens ZU_MAX Einträge. NIE
// aufgenommen werden Formularinhalte, und nie ein Zeitstempel (§2: kein
// Date.now() in src/lib) — die Reihenfolge im Array IST die Reihenfolge.
const ZU_KEY = 'lexmetrik-tabs-zu';
const ZU_MAX = 10;

/** Ein geschlossener Reiter mit der Position, an der er stand. Die Position ist
 *  der ganze Unterschied zu einem Verlauf: wiederhergestellt wird DORT, wo der
 *  Reiter war, nicht am Ende der Leiste. */
interface GeschlossenerReiter { eintrag: TabEintrag; index: number }

function ladeGeschlossene(): GeschlossenerReiter[] {
  try {
    const roh = localStorage.getItem(ZU_KEY);
    const arr = roh ? JSON.parse(roh) : [];
    if (!Array.isArray(arr)) return [];
    return arr
      .filter((x): x is GeschlossenerReiter =>
        x && typeof x.index === 'number' && x.eintrag && typeof x.eintrag.path === 'string')
      .slice(-ZU_MAX);
  } catch {
    return [];
  }
}

function schreibeGeschlossene(ring: GeschlossenerReiter[]): void {
  try { localStorage.setItem(ZU_KEY, JSON.stringify(ring.slice(-ZU_MAX))); }
  catch { /* privater Modus — die Rückfahrkarte ist Komfort, kein Datenbestand */ }
}

/** Legt geschlossene/ersetzte Reiter hinten in den Ring (jüngster zuletzt).
 *  Der leere «+»-Reiter kommt NICHT hinein: er trägt kein Dokument, seine
 *  «Wiederherstellung» wäre ein Klick auf «+» (§8 — nichts versprechen, was
 *  keinen Wert hat). */
function merkeGeschlossen(neue: GeschlossenerReiter[]): void {
  const echte = neue.filter(({ eintrag }) => !eintrag.leer);
  if (echte.length === 0) return;
  schreibeGeschlossene([...ladeGeschlossene(), ...echte]);
}

/** Der zuletzt geschlossene Reiter — für die Beschriftung der Aktion
 *  («Zuletzt geschlossen: Art. 336c OR»). null = der Ring ist leer, dann wird
 *  die Aktion gar nicht erst angeboten (kein toter Menüeintrag). */
export function letzterGeschlossener(): TabEintrag | null {
  const ring = ladeGeschlossene();
  return ring.length ? ring[ring.length - 1].eintrag : null;
}

/** Stellt den zuletzt geschlossenen Reiter AN SEINER ALTEN POSITION wieder her
 *  und gibt ihn zurück (der Aufrufer navigiert dorthin). null = nichts im Ring.
 *
 *  Ist derselbe Reiter inzwischen wieder offen, wird der Ring-Eintrag
 *  VERBRAUCHT und der offene Reiter zurückgegeben — sonst bliebe ein Eintrag
 *  stehen, dessen Wiederherstellung sichtbar nichts tut. */
export function stelleLetztenWiederHer(): TabEintrag | null {
  const ring = ladeGeschlossene();
  const letzter = ring.pop();
  if (!letzter) return null;
  schreibeGeschlossene(ring);
  const bisher = ladeTabs();
  const teil = tabSchluessel(letzter.eintrag.path);
  if (bisher.some((t) => tabSchluessel(t.path) === teil)) return letzter.eintrag;
  const naechste = [...bisher];
  naechste.splice(Math.min(letzter.index, naechste.length), 0, letzter.eintrag);
  schreibe(naechste.slice(0, MAX));
  return letzter.eintrag;
}

/** Pfad für eine NEUE Instanz desselben Erlasses/Items (Auftrag David: dasselbe
 *  Gesetz mehrfach offen). Hängt den nächsten freien `?r=<n>` an den aktuellen
 *  Pfad (Artikel-Anker bleibt erhalten). Die erste Instanz trägt kein `?r`
 *  (implizit r=1), die nächste `?r=2` usw. */
export function naechsteInstanz(path: string): string {
  const pfad = pfadTeil(path);
  const hash = path.includes('#') ? `#${path.split('#')[1]}` : '';
  const rs = ladeTabs()
    .filter((t) => pfadTeil(t.path) === pfad)
    .map((t) => Number(new URLSearchParams(t.path.split('#')[0].split('?')[1] ?? '').get('r')) || 1);
  const next = (rs.length ? Math.max(...rs) : 0) + 1;
  return `${pfad}?r=${next}${hash}`;
}

/** Aktualisiert NUR den Artikel-Anker (#) eines bereits offenen Reiters mit
 *  dieser Identität — die LESESTELLUNG (Neustart, Reiter-Liste, Auftrag David).
 *  Legt KEINEN neuen Reiter an und ändert die Reihenfolge nicht.
 *  Rührt `wahl` NICHT an: die Beschriftung folgt der Adresse, nicht dem
 *  Scroll-Spy (F5, Herleitung an `TabEintrag.wahl`). */
export function aktualisiereTabArtikel(path: string): void {
  const teil = tabSchluessel(path);
  const bisher = ladeTabs();
  const idx = bisher.findIndex((t) => tabSchluessel(t.path) === teil);
  if (idx === -1 || bisher[idx].path === path) return;
  const naechste = [...bisher];
  naechste[idx] = { ...bisher[idx], path };
  schreibe(naechste);
}

// ─── D19 (David 6.9.2026: «in der tab zeile oben soll man mit plus einen
//     neuen reiter erzeugen können») · DER LEERE REITER ────────────────────
//
// Ein Browser-«+»: legt einen NEUEN, leeren Reiter an, der bis zur ersten
// Navigation/Suche die Startseite zeigt (§5a Ziff. 3 «Navigation ersetzt den
// aktiven Reiter» übernimmt das Füllen unverändert — `TabTracker.tsx` muss nur
// wissen, dass der leere Reiter der AKTIVE ist, s. dort). Höchstens EIN
// leerer Reiter gleichzeitig: ein zweiter Klick auf «+» aktiviert den
// bestehenden, statt einen zweiten anzulegen — sonst häufen sich leere Reiter
// an, genau der «Reiter-Wildwuchs», den §5a Ziff. 3 verhindern sollte.
//
// Kanonische Anzeige-Bezeichnung, EIN Ort (§5): `Reiterleiste.kurzform` und
// `TabPanel.zeile` lesen von hier statt den String je einmal zu tragen.
export const NEUER_REITER_NAME = 'Neuer Reiter';

/** Legt den einen leeren Reiter an (Pfad `/`, `leer: true`) — oder tut nichts,
 *  wenn schon einer existiert. Der Aufrufer navigiert danach auf `/`; das
 *  Navigieren dorthin ist so oder so richtig, ob neu angelegt oder schon da. */
export function neuerLeererReiter(): void {
  const bisher = ladeTabs();
  if (bisher.some((t) => t.leer)) return;
  schreibe([...bisher, { path: '/', leer: true }].slice(-MAX));
}

/** true, wenn GENAU der leere Reiter (s.o.) gerade existiert. `TabTracker`
 *  braucht das: Pfad `/` erzeugt sonst KEINEN Reiter (D7-Abweichung oben) und
 *  würde ohne diese Ausnahme übersprungen — die nächste Navigation ersetzte
 *  dann nicht ihn, sondern den davor aktiven Reiter (oder häufte an). */
export function hatLeerenReiter(): boolean {
  return ladeTabs().some((t) => t.leer === true);
}
