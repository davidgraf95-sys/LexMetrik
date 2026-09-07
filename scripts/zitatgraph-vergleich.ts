// ─── Z3 · Messung & Bericht: Fedlex-Zitatgraph ↔ LexMetrik-Verweiserkennung ──
//
// Trennlinie wie bei `verweis-inventar-messung.ts` (Steuerungs-Flächendeckel
// `scripts/check-*.ts`, aufraeumen.md §3): HIER steht, WIE VERGLICHEN WIRD —
// die Leser-Ziele je Textstelle, die Klassenbildung, der Bericht-Satz. DORT
// (`scripts/check-zitatgraph-warnungen.ts`) steht nur noch der Aufruf: lesen,
// schreiben, ausgeben. Ohne Seiteneffekte beim Import.
//
// ZWECK. Das Z2-Artefakt (`messwerte/fedlex-zitatgraph.json`) trägt die AMTLICHE
// Aussage «Erlass A verweist an Stelle eId auf Erlass B». Dieses Skript hält
// sie gegen das, was LexMetriks Verweis-Erkennung im GESPEICHERTEN Normtext
// derselben Stelle findet, und meldet die Differenz. Es ist ein BERICHT, kein
// Tor: Exit 0 in jedem Fall, nicht Teil von `npm run gate`. Grund steht im
// Bericht selbst (Rausch-Klassen unten) — eine Differenz ist ein HINWEIS auf
// eine Erkennungslücke, kein Beweis für einen Fehler.
//
// ─── Warum kein Tor: die bekannten Rausch-Klassen ───────────────────────────
//
//  (R1) FUSSNOTEN-HERKUNFT IST NICHT UNTERSCHEIDBAR. Fedlex führt Citations aus
//       dem Normtext UND aus den Fussnoten (Quellenverweise «SR 220», AS-/BBl-
//       Fundstellen) unter demselben `citationFromReference`-eId. LexMetrik
//       speichert und verlinkt nur den NORMTEXT. Jede Fussnoten-Citation
//       erscheint deshalb zwangsläufig als «Leser verlinkt nicht». Das ist
//       erwartet und kein Mangel. Die Klasse ist NICHT herausrechenbar: das
//       Datenmodell trägt kein Merkmal, das Normtext- von Fussnoten-Citation
//       trennt (live geprüft 2.9.2026).
//  (R2) ZIEL AUSSERHALB DES KORPUS. Zeigt eine Fedlex-Kante auf eine SR, die
//       LexMetrik nicht führt, KANN der Leser dort gar nicht verlinken. Diese
//       Kanten werden gezählt, aber getrennt ausgewiesen.
//  (R3) ABSICHTLICHE ZURÜCKHALTUNG (§1). Die Erkennung verlinkt bewusst NICHT,
//       wo das Ziel nicht deterministisch feststeht (kein Klammer-Kürzel, kein
//       kuratierter Genitiv, kein amtlicher Volltitel). «Lieber kein Link als
//       ein plausibel-falscher» ist Absicht, nicht Lücke.
//  (R4) eId OHNE ENTSPRECHUNG IM SNAPSHOT. Fedlex-eIds aus Anhängen und
//       Übergangsbestimmungen (`annex_2/lvl_u1/…`) haben nicht immer einen
//       Snapshot-Eintrag. Getrennt ausgewiesen, nie als Erkennungslücke gezählt.
//  (R5) VERWEIS AUF DEN GANZEN ERLASS, OHNE ARTIKELNUMMER. Fedlex zählt auch
//       «… gilt zudem das Bundesgesetz vom 4. Oktober 1991 über das bäuerliche
//       Bodenrecht» (OR art_218) als Citation. LexMetriks Erkennung setzt
//       durchweg an einer ARTIKELNUMMER an — einen Erlass-Chip ohne Bestimmung
//       kennt der Leser gar nicht. Solche Kanten landen zwangsläufig in Klasse B
//       und sind KEINE Erkennungslücke, sondern eine bewusste Modell-Grenze.
//       Belegte Sonde 2.9.2026 (systematische Stichprobe 10 aus Klasse B): OR
//       art_218 → BGBB, MVG art_79 → BVG, ZPO art_5 → FINIG — in KEINER der
//       zehn gezogenen Zeilen steht eine «Artikel N …»-Stelle mit dem Zielkürzel
//       im Normtext.
//
// ─── Wie der Leser-Vergleich zustande kommt ─────────────────────────────────
//
// Nicht nachgebaut, sondern GERUFEN: der Bericht benutzt die Fassade
// `src/lib/fedlex` — dieselben Funktionen, die `NormText.tsx` beim Rendern
// ruft, in derselben Reihenfolge (§5, keine zweite Wahrheit):
//
//   1. `normVerweiseImText`     — voll zitierte Anker + propagierte Ketten-Glieder
//   2. `artikelnPluralVerweise` — A10-Regionen mit aufgelöstem Fremdgesetz
//   3. `fremdRoutingFormB`      — «Artikel N … des <Name> (KÜRZEL)» (N2b/V-7)
//   4. `chapeauZielFremdgesetz` — Fremdgesetz-Chapeau über Aufzählungs-Items
//
// DAZU eine FÜNFTE, getrennt gezählte Klasse — der wertvollste Teil des
// Berichts. `fremdgesetzNachArtikel` (N2 Form A) ERKENNT die ausgeschriebene
// Form «Artikel 29 Absatz 1 ATSG», ROUTET sie aber nicht: ihr Kontrakt ist
// heute nur Unterdrückung des falschen Self-Links («Aktives Routing der
// bare-Kürzel-Form bleibt bewusst zurückgestellt», parser.ts). `NORM_IM_TEXT`
// wiederum verlangt die ABGEKÜRZTE Form «Art. N … KÜRZEL». Ergebnis: bei
// «Artikel N … KÜRZEL» weiss LexMetrik das Ziel, verlinkt aber nicht.
// Bestätigt Fedlex genau dieses Ziel, ist das keine Rausch-Zeile, sondern ein
// AMTLICH BELEGTER, adressierbarer Routing-Rückstand — der Bericht führt ihn
// als eigene Spalte «erkannt, nicht verlinkt». Belegte Sonde 2.9.2026, IVG
// art_10: «… nach Artikel 29 Absatz 1 ATSG» ⇒ normVerweiseImText liefert 0
// Spans, fremdgesetzNachArtikel liefert ATSG, Fedlex-Kante zeigt auf SR 830.1.
// GRENZE: die Guard-Reihenfolge von NormText (Selbstmarker, «des/der/über/vom»)
// ist hier NICHT nachgebaut — die Klasse ist eine Triage-Grösse, keine exakte
// Zählung der heute unterdrückten Links.
//
// NACHTRAG Z5 (W2·22, 2.9.2026) — der Befund oben ist datiert und bleibt so
// stehen (er beschreibt den Stand vor dem Fix). SEITHER routet
// `ausgeschriebeneVerweiseImText` (spannen.ts) genau diese Form aktiv, und
// `normVerweiseImText` gibt die Spannen mit aus; die Klasse-A-Zahl fiel damit
// von 824 auf 0. Die Spalte bleibt bestehen: sie ist der Wächter, der einen
// Rückfall oder eine neue Zitierform sofort wieder sichtbar macht.
//
// Der einzige transkribierte Bestandteil ist die bare-«Artikel N»-Regex, die
// Schritt 3 die Ansatzstelle gibt — sie wird NICHT neu geschrieben, sondern aus
// dem bestehenden Guard-Register `G.ART_INTERN`
// (`scripts/verweis-inventar-transkription.ts`) gelesen, das der dortige
// Wächter bereits gegen `NormText.tsx` hält.
//
// Ziel-Identität durchweg über die ELI, nie über Kürzel-Zeichenketten: die
// FEDLEX-Tabelle nennt je Kürzel die ELI, das Register nennt je Erlass ELI und
// SR — der Join ist ein Identitäts-Treffer (§7), keine Namensähnlichkeit
// (gemessen 2.9.2026: alle 209 FEDLEX-Kürzel lösen so auf, während 45 davon
// anders geschrieben sind als das Register-Kürzel — «GebVSchKG» vs «GebV SchKG»).

import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import {
  FEDLEX, normVerweiseImText, artikelnPluralVerweise, fremdRoutingFormB,
  chapeauZielFremdgesetz, erkenneFedlexGesetz, fremdgesetzNachArtikel,
  type FedlexGesetz,
} from '../src/lib/fedlex';
import { G, re } from './verweis-inventar-transkription';
import type { Zitatgraph } from './fedlex-zitatgraph';

const WURZEL = process.cwd();
const GRAPH_PFAD = join(WURZEL, 'messwerte', 'fedlex-zitatgraph.json');
const REGISTER_PFAD = join(WURZEL, 'public', 'normtext', 'register.json');
const SNAPSHOT_WURZEL = join(WURZEL, 'public', 'normtext');
export const BERICHT_PFAD = join(WURZEL, 'messwerte', 'zitatgraph-warnungen.md');

/** Wie viele Erlasse der Bericht im Detail auflistet (Rest nur in der Summe). */
const DETAIL_ERLASSE = 25;
/** Wie viele Zeilen je Erlass. */
const DETAIL_ZEILEN = 12;

interface RegisterErlass {
  key: string; ebene: string; status: string; kuerzel: string;
  sr: string | null; datei: string | null; quelleUrl: string | null;
}
interface SnapshotBlock { text?: string; items?: { text?: string }[] }
interface SnapshotEintrag { id: string; bloecke?: SnapshotBlock[] }

// ─── 1 · Leser-Ziele eines Textes (rein, netzfrei testbar) ──────────────────

/**
 * Alle Fremdgesetze, auf die LexMetriks Erkennung in `text` verlinken würde.
 * Reihenfolge und Aufrufform wie in NormText.tsx (Kopf, Schritte 1–3).
 *
 * @param eigenesKuerzelKanon kanonisiertes Kürzel des GELESENEN Erlasses —
 *   Form-B-Treffer auf den eigenen Erlass sind kein Fremdverweis (V-7).
 */
export function leserZieleImText(text: string, eigenesKuerzelKanon: string): {
  verlinkt: Set<FedlexGesetz>;
  /** N2 Form A: Ziel erkannt, aber heute nur unterdrückt statt verlinkt. */
  erkannt: Set<FedlexGesetz>;
} {
  const verlinkt = new Set<FedlexGesetz>();
  const erkannt = new Set<FedlexGesetz>();
  if (!text) return { verlinkt, erkannt };
  for (const s of normVerweiseImText(text)) {
    const g = erkenneFedlexGesetz(s.artikel);
    if (g) verlinkt.add(g);
  }
  for (const r of artikelnPluralVerweise(text, 'bund')) {
    if (r.fremd && !r.unterdruecken) verlinkt.add(r.fremd);
  }
  for (const m of text.matchAll(re(G.ART_INTERN.literal))) {
    const rest = text.slice(m.index + m[0].length);
    const routing = fremdRoutingFormB(rest, m[1], undefined, 'bund');
    if (routing && kanon(routing.gesetz) !== eigenesKuerzelKanon) { verlinkt.add(routing.gesetz); continue; }
    const n2 = fremdgesetzNachArtikel(rest);
    if (n2 && kanon(n2) !== eigenesKuerzelKanon) erkannt.add(n2);
  }
  return { verlinkt, erkannt };
}

const kanon = (s: string): string => s.toUpperCase().replace(/[^A-Z0-9]/g, '');

/** Ein Snapshot-Eintrag → die Ziele, die der Leser dort verlinken würde. */
export function leserZieleImEintrag(
  eintrag: SnapshotEintrag,
  registerKuerzel: string,
): { verlinkt: Set<FedlexGesetz>; erkannt: Set<FedlexGesetz> } {
  const eigen = kanon(registerKuerzel);
  const verlinkt = new Set<FedlexGesetz>();
  const erkannt = new Set<FedlexGesetz>();
  const artRe = re(G.ART_INTERN.literal);
  const sammle = (t: string): void => {
    const r = leserZieleImText(t, eigen);
    for (const g of r.verlinkt) verlinkt.add(g);
    for (const g of r.erkannt) erkannt.add(g);
  };
  for (const b of eintrag.bloecke ?? []) {
    const blockText = b.text ?? '';
    sammle(blockText);
    // Fremdgesetz-Chapeau: die bare «Art. N» der Items zeigen auf das Chapeau-Ziel
    // (ArtikelBody.tsx). Nur zählen, wenn ein Item überhaupt eine bare Nummer nennt.
    const chapeau = chapeauZielFremdgesetz(blockText, registerKuerzel);
    for (const it of b.items ?? []) {
      const t = it.text ?? '';
      sammle(t);
      if (chapeau) { artRe.lastIndex = 0; if (artRe.test(t)) verlinkt.add(chapeau); }
    }
  }
  for (const g of verlinkt) erkannt.delete(g);
  return { verlinkt, erkannt };
}

// ─── 2 · Vergleich (rein) ───────────────────────────────────────────────────

export interface Warnung { sr: string; eId: string; zielSr: string; zielKuerzel: string }
export interface Befund {
  warnungen: Warnung[];
  /** Ziel erkannt (N2 Form A), aber heute nicht verlinkt — belegter Rückstand. */
  erkanntNichtVerlinkt: Warnung[];
  /** Fedlex-Kanten, deren Ziel LexMetrik gar nicht führt (R2). */
  zielAusserhalb: number;
  /** Fedlex-eIds ohne Snapshot-Eintrag (R4). */
  eIdOhneEintrag: number;
  /** Kanten, die der Leser tatsächlich verlinkt — die Deckung. */
  gedeckt: number;
}

/**
 * Vergleicht die ausgehenden Fedlex-Kanten EINES Erlasses mit den Leser-Zielen
 * je eId. `leserZiele` bildet eId → Menge der Ziel-SR; `korpusSr` ist die Menge
 * aller SR, die LexMetrik überhaupt führt.
 */
export function vergleicheErlass(
  sr: string,
  ausgehend: { eId: string; zielSr: string }[],
  leserZiele: Map<string, { verlinkt: Set<string>; erkannt: Set<string> }>,
  korpusSr: ReadonlyMap<string, string>,
): Befund {
  const warnungen: Warnung[] = [];
  const erkanntNichtVerlinkt: Warnung[] = [];
  let zielAusserhalb = 0, eIdOhneEintrag = 0, gedeckt = 0;
  for (const k of ausgehend) {
    if (k.zielSr === sr) continue; // Selbstzitat — kein Fremdverweis
    const zielKuerzel = korpusSr.get(k.zielSr);
    if (!zielKuerzel) { zielAusserhalb += 1; continue; }
    const ziele = leserZiele.get(k.eId);
    if (!ziele) { eIdOhneEintrag += 1; continue; }
    if (ziele.verlinkt.has(k.zielSr)) { gedeckt += 1; continue; }
    const zeile = { sr, eId: k.eId, zielSr: k.zielSr, zielKuerzel };
    if (ziele.erkannt.has(k.zielSr)) erkanntNichtVerlinkt.push(zeile);
    else warnungen.push(zeile);
  }
  const c = (a: string, b: string): number => (a < b ? -1 : a > b ? 1 : 0);
  const ord = (l: Warnung[]): void => { l.sort((a, b) => c(a.eId, b.eId) || c(a.zielSr, b.zielSr)); };
  ord(warnungen); ord(erkanntNichtVerlinkt);
  return { warnungen, erkanntNichtVerlinkt, zielAusserhalb, eIdOhneEintrag, gedeckt };
}

// ─── 3 · Messung + Bericht-Satz (schreibt nichts, druckt nichts) ────────────

const eliAusUrl = (u: string | null): string | null => {
  const m = /^https:\/\/www\.fedlex\.admin\.ch\/eli\/(.+?)\/de$/.exec(u ?? '');
  return m ? m[1] : null;
};

/** Der fertige Bericht + die Konsolenzeilen; `null`, wenn das Z2-Artefakt fehlt. */
export function berichte(): { inhalt: string; log: string[] } | null {
  if (!existsSync(GRAPH_PFAD)) return null;
  const graph = JSON.parse(readFileSync(GRAPH_PFAD, 'utf8')) as Zitatgraph;
  const register = JSON.parse(readFileSync(REGISTER_PFAD, 'utf8')) as { erlasse: RegisterErlass[] };
  const bund = register.erlasse.filter((e) => e.ebene === 'bund' && e.status === 'snapshot' && e.sr);

  // SR → Anzeige-Kürzel (der ganze Korpus, inkl. Kantone: R2-Abgrenzung).
  const korpusSr = new Map<string, string>();
  for (const e of register.erlasse) if (e.sr) korpusSr.set(e.sr, e.kuerzel);
  // FEDLEX-Kürzel → SR, über die ELI (Identitäts-Join, §7).
  const eliZuSr = new Map<string, string>();
  for (const e of bund) { const eli = eliAusUrl(e.quelleUrl); if (eli) eliZuSr.set(eli, e.sr!); }
  const gesetzZuSr = new Map<FedlexGesetz, string>();
  for (const k of Object.keys(FEDLEX) as FedlexGesetz[]) {
    const eli = eliAusUrl(FEDLEX[k]);
    const sr = eli ? eliZuSr.get(eli) : undefined;
    if (sr) gesetzZuSr.set(k, sr);
  }

  const jeSr = new Map<string, RegisterErlass>();
  for (const e of bund) jeSr.set(e.sr!, e);

  const befunde: (Befund & { sr: string; kuerzel: string })[] = [];
  let ohneSnapshot = 0;
  for (const knoten of graph.erlasse) {
    const e = jeSr.get(knoten.sr);
    if (!e?.datei) { ohneSnapshot += 1; continue; }
    const datei = join(SNAPSHOT_WURZEL, e.datei);
    if (!existsSync(datei)) { ohneSnapshot += 1; continue; }
    const snap = JSON.parse(readFileSync(datei, 'utf8')) as { eintraege: SnapshotEintrag[] };
    const leserZiele = new Map<string, { verlinkt: Set<string>; erkannt: Set<string> }>();
    for (const eintrag of snap.eintraege) {
      const eId = eintrag.id.split('/').pop() ?? eintrag.id;
      const roh = leserZieleImEintrag(eintrag, e.kuerzel);
      const srs = (m: Set<FedlexGesetz>): Set<string> => {
        const out = new Set<string>();
        for (const g of m) { const sr = gesetzZuSr.get(g); if (sr) out.add(sr); }
        return out;
      };
      leserZiele.set(eId, { verlinkt: srs(roh.verlinkt), erkannt: srs(roh.erkannt) });
    }
    befunde.push({
      ...vergleicheErlass(knoten.sr, knoten.ausgehend, leserZiele, korpusSr),
      sr: knoten.sr, kuerzel: e.kuerzel,
    });
  }

  const gesamtWarn = befunde.reduce((n, b) => n + b.warnungen.length, 0);
  const gesamtErkannt = befunde.reduce((n, b) => n + b.erkanntNichtVerlinkt.length, 0);
  const gesamtGedeckt = befunde.reduce((n, b) => n + b.gedeckt, 0);
  const gesamtAusserhalb = befunde.reduce((n, b) => n + b.zielAusserhalb, 0);
  const gesamtOhneEId = befunde.reduce((n, b) => n + b.eIdOhneEintrag, 0);
  const vergleichbar = gesamtWarn + gesamtErkannt + gesamtGedeckt;
  const pct = (n: number): string =>
    (vergleichbar > 0 ? ((n / vergleichbar) * 100).toFixed(1) : '—');
  const quote = pct(gesamtGedeckt);

  const c = (a: string, b: string): number => (a < b ? -1 : a > b ? 1 : 0);
  const rang = [...befunde].sort((a, b) => b.warnungen.length - a.warnungen.length || c(a.sr, b.sr));
  const rangErkannt = [...befunde]
    .sort((a, b) => b.erkanntNichtVerlinkt.length - a.erkanntNichtVerlinkt.length || c(a.sr, b.sr));

  const z: string[] = [];
  z.push('# Zitatgraph-Warnungen — Fedlex ↔ LexMetrik-Verweiserkennung', '');
  z.push('> **Bericht, kein Tor.** Erzeugt von `npm run check:zitatgraph`, Exit stets 0,');
  z.push('> nicht Teil von `npm run gate`. Quelle: `messwerte/fedlex-zitatgraph.json`');
  z.push('> (amtliche `jolux:Citation`, DEU) gegen die Fassade `src/lib/fedlex`,');
  z.push('> angewandt auf die gespeicherten Normtext-Snapshots.', '');
  z.push('## Bekannte Rausch-Klassen — vor jeder Zeile mitlesen', '');
  z.push('**R1 · Fussnoten-Herkunft ist nicht unterscheidbar.** Fedlex führt Citations aus');
  z.push('dem Normtext UND aus den Fussnoten (Quellenverweise, AS-/BBl-Fundstellen) unter');
  z.push('demselben `citationFromReference`-eId; das Datenmodell trägt kein Merkmal, das');
  z.push('beide trennt (live geprüft 2.9.2026). LexMetrik speichert nur den Normtext —');
  z.push('jede Fussnoten-Citation MUSS hier als «nicht verlinkt» erscheinen. Ein');
  z.push('unbekannter, aber vermutlich erheblicher Teil der Zeilen unten gehört dazu.', '');
  z.push('**R2 · Ziel ausserhalb des Korpus** — der Leser könnte dort gar nicht verlinken;');
  z.push('separat gezählt, nicht in den Warnungen. **R3 · Absichtliche Zurückhaltung (§1)**');
  z.push('— wo das Ziel nicht deterministisch feststeht, verlinkt die Erkennung bewusst');
  z.push('nicht. **R4 · eId ohne Snapshot-Eintrag** (Anhänge, Übergangsrecht) — separat');
  z.push('gezählt.', '');
  z.push('**R5 · Verweis auf den GANZEN Erlass, ohne Artikelnummer.** Fedlex zählt auch');
  z.push('«… gilt zudem das Bundesgesetz vom 4. Oktober 1991 über das bäuerliche');
  z.push('Bodenrecht» (OR art_218) als Citation. LexMetriks Erkennung setzt durchweg an');
  z.push('einer Artikelnummer an — einen Erlass-Chip ohne Bestimmung kennt der Leser');
  z.push('nicht. Solche Kanten landen zwangsläufig in Klasse B; sie sind eine bewusste');
  z.push('Modell-Grenze, keine Lücke. Systematische Stichprobe von 10 Klasse-B-Zeilen');
  z.push('(2.9.2026): in KEINER steht eine «Artikel N …»-Stelle mit dem Zielkürzel im');
  z.push('Normtext (OR art_218 → BGBB, MVG art_79 → BVG, ZPO art_5 → FINIG …).', '');
  z.push('Eine Zeile ist damit ein **Prüfhinweis**, kein Fehlerbeleg.', '');
  z.push('## Zahlen', '');
  z.push('| Grösse | Wert |');
  z.push('|---|---|');
  z.push(`| Erlasse im Graph | ${graph.erlasse.length} |`);
  z.push(`| davon verglichen (Snapshot vorhanden) | ${befunde.length} |`);
  z.push(`| Fedlex-Kanten vergleichbar (Ziel im Korpus, eId im Snapshot) | ${vergleichbar} |`);
  z.push(`| davon vom Leser verlinkt | ${gesamtGedeckt} (${quote} %) |`);
  z.push(`| **A · Ziel erkannt, aber nicht verlinkt (N2 Form A)** | **${gesamtErkannt} (${pct(gesamtErkannt)} %)** |`);
  z.push(`| **B · Warnungen (Fedlex kennt Ziel, Leser erkennt es dort nicht)** | **${gesamtWarn} (${pct(gesamtWarn)} %)** |`);
  z.push(`| R2 · Ziel ausserhalb des Korpus | ${gesamtAusserhalb} |`);
  z.push(`| R4 · eId ohne Snapshot-Eintrag | ${gesamtOhneEId} |`);
  z.push(`| Graph-Erlasse ohne Snapshot | ${ohneSnapshot} |`, '');
  z.push('**Klasse A ist der belegte Rückstand**, Klasse B die offene Frage. In A nennt der');
  z.push('Normtext das Zielkürzel ausgeschrieben («Artikel N Absatz M KÜRZEL») und LexMetrik');
  z.push('erkennt es — bis W2·22 Z5 (2.9.2026) wurde der Link dort nur unterdrückt, seither');
  z.push('routet ihn `ausgeschriebeneVerweiseImText`; A ist damit von 824 auf 0 gefallen und');
  z.push('bleibt als Wächter gegen Rückfall und neue Zitierformen stehen. Der Gegenprüfungs-');
  z.push('Nachzug zu Z5 (2.9.2026) hat A bewusst wieder auf 3 gehoben: FIDLEV art_111, KKV');
  z.push('art_126_z_octies und FINIV art_93 zitieren das Ziel «in der Fassung vom …», also eine');
  z.push('AUFGEHOBENE Fassung — der Leser zeigt die geltende, in der die Zielbestimmung teils');
  z.push('gar nicht mehr existiert. Fedlex kennt die Kante trotzdem; hier ist A der RICHTIGE');
  z.push('Zustand, nicht ein Rückstand (Guard `historischeFassung`, positivliste.ts). In B mischen sich');
  z.push('R1 (Fussnoten) und R3 (absichtliche Zurückhaltung); B ist ohne Einzelprüfung');
  z.push('nicht auswertbar.', '');
  z.push(`## Klasse A — erkannt, nicht verlinkt (Top ${DETAIL_ERLASSE})`, '');
  z.push('| Erlass | SR | A | B | verlinkt |');
  z.push('|---|---|---|---|---|');
  for (const b of rangErkannt.slice(0, DETAIL_ERLASSE)) {
    if (b.erkanntNichtVerlinkt.length === 0) continue;
    z.push(`| ${b.kuerzel} | ${b.sr} | ${b.erkanntNichtVerlinkt.length} | ${b.warnungen.length} | ${b.gedeckt} |`);
  }
  z.push('');
  for (const b of rangErkannt.slice(0, 5)) {
    if (b.erkanntNichtVerlinkt.length === 0) continue;
    z.push(`### A · ${b.kuerzel} (SR ${b.sr}) — ${b.erkanntNichtVerlinkt.length} Stellen`, '');
    for (const w of b.erkanntNichtVerlinkt.slice(0, DETAIL_ZEILEN)) {
      z.push(`- Fedlex kennt Ziel-SR ${w.zielSr} (${w.zielKuerzel}) aus eId \`${w.eId}\`; LexMetrik erkennt dasselbe Ziel, verlinkt es aber nicht.`);
    }
    if (b.erkanntNichtVerlinkt.length > DETAIL_ZEILEN) z.push(`- … ${b.erkanntNichtVerlinkt.length - DETAIL_ZEILEN} weitere.`);
    z.push('');
  }
  z.push(`## Klasse B — Erlasse mit den meisten Warnungen (Top ${DETAIL_ERLASSE})`, '');
  z.push('| Erlass | SR | B | A | verlinkt | R2 | R4 |');
  z.push('|---|---|---|---|---|---|---|');
  for (const b of rang.slice(0, DETAIL_ERLASSE)) {
    z.push(`| ${b.kuerzel} | ${b.sr} | ${b.warnungen.length} | ${b.erkanntNichtVerlinkt.length} | ${b.gedeckt} | ${b.zielAusserhalb} | ${b.eIdOhneEintrag} |`);
  }
  z.push('', '## Klasse B — einzelne Hinweise', '');
  z.push(`Je Erlass höchstens ${DETAIL_ZEILEN} Zeilen; vollständige Kantenliste im Artefakt.`, '');
  for (const b of rang.slice(0, DETAIL_ERLASSE)) {
    if (b.warnungen.length === 0) continue;
    z.push(`### B · ${b.kuerzel} (SR ${b.sr}) — ${b.warnungen.length} Hinweise`, '');
    for (const w of b.warnungen.slice(0, DETAIL_ZEILEN)) {
      z.push(`- Fedlex kennt Ziel-SR ${w.zielSr} (${w.zielKuerzel}) aus eId \`${w.eId}\`, Leser verlinkt dort nicht darauf.`);
    }
    if (b.warnungen.length > DETAIL_ZEILEN) z.push(`- … ${b.warnungen.length - DETAIL_ZEILEN} weitere.`);
    z.push('');
  }
  const inhalt = `${z.join('\n').replace(/\n+$/, '')}\n`;
  return {
    inhalt,
    log: [
      `Zitatgraph-Warnungen — ${befunde.length}/${graph.erlasse.length} Erlasse verglichen.`,
      `  ${vergleichbar} vergleichbare Kanten · ${gesamtGedeckt} verlinkt (${quote} %)`,
      `  A erkannt-nicht-verlinkt: ${gesamtErkannt} (${pct(gesamtErkannt)} %) · B Warnungen: ${gesamtWarn} (${pct(gesamtWarn)} %)`,
      `  R2 Ziel ausserhalb Korpus: ${gesamtAusserhalb} · R4 eId ohne Eintrag: ${gesamtOhneEId}`,
      `  Bericht: messwerte/zitatgraph-warnungen.md (${Buffer.byteLength(inhalt)} Bytes)`,
      '  Hinweis: R1 (Fussnoten-Citations) ist nicht herausrechenbar — Bericht, kein Tor.',
    ],
  };
}
