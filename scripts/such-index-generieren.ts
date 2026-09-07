// ─── Generator: Artikel-Volltext-Suchindex (ROADMAP Schritt 5, Task 4.1) ──────
//
// Baut aus den gepinnten Volltext-Snapshots (public/normtext/<ebene>/*.json)
// EINE kompakte Datendatei public/such-index/artikel.json für die globale
// Artikel-Volltextsuche. Der FlexSearch-Index wird daraus CLIENT-seitig lazy
// gebaut (eigener Chunk, §3/§6.4 — nie im Haupt-Bundle).
//
//   npm run gen:suchindex          schreibt die Datei
//   npm run check:suchindex        prüft Drift (Index ≠ Snapshots) → exit 1
//
// EBENEN-NEUTRAL (W2·5, 25.7.2026): Bund UND Kanton laufen durch DIESELBE
// Pipeline; die Ebene ist Parameter, nicht Literal. Jeder Eintrag trägt seine
// Ebene (`eb`) und — kantonal — seinen Kanton (`kt`) mit, damit die Oberfläche
// einen kantonalen Treffer als solchen ausweisen kann und nicht wie Bundesrecht
// aussehen lässt (§8). Vorher las das Skript ausschliesslich public/normtext/bund
// mit hartcodiertem `ebene: 'bund'`.
//
// Nur Erlasse MIT `bloecke` (echter Volltext); Stubs/PDF/Live-Link tragen keinen
// durchsuchbaren Text und werden ausgelassen (§8: nichts vortäuschen). Was
// ausgelassen wird, verschwindet aber NICHT stillschweigend: jede übersprungene
// Datei landet mit Grund in `uebersprungen` (im Artefakt UND in der CLI-Ausgabe),
// und das Tor src/tests/suchIndex.test.ts hält jeden Erlass fest, der Volltext
// führt, aber nicht im Index steht.
//
// FELD-EXTRAKTION LIEGT NICHT MEHR HIER (QS-BASIS (d) K1, 31.8.2026). Die
// Extraktoren (Artikeltext · Tabellen-Tier · Fussnoten · Marginalien-/Gliederungs-
// Labels) sind nach scripts/suche-felder.ts gewandert, weil der DB-/Edge-Index
// (scripts/datenhaltung/fts.ts) DIESELBEN Felder braucht. Sie hier zu belassen und
// dort nachzubauen hätte zwei Wahrheiten für denselben Fachinhalt erzeugt (§5) —
// und genau daran hing die gemessene Recall-Lücke des Edge-Weges.
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { artikelText, baueRecallFelder, type Block, type StrukturArtikel } from './suche-felder';

const wurzel = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const NORMTEXT = resolve(wurzel, 'public/normtext');
const ZIEL = resolve(wurzel, 'public/such-index/artikel.json');

/** Indexierte Ebenen — Reihenfolge bestimmt die Eintrags-Reihenfolge (§2 stabil). */
export const EBENEN = ['bund', 'kanton'] as const;
export type Ebene = (typeof EBENEN)[number];

/** Ebenen, die der Generator OHNE gesetzte Variable schreibt — seit der
 *  K3-Scharfschaltung (1.9.2026) nur noch der Bund. Begründung s. u. */
export const EBENEN_DEFAULT: readonly Ebene[] = ['bund'];

/**
 * EBENEN-WAHL über `SUCHE_INDEX_EBENEN` — SCHARF seit 1.9.2026
 * (QS-BASIS (d) K3; vorbereitet 31.8.2026, Default bis dahin «alle Ebenen»).
 *
 * Default ist jetzt `EBENEN_DEFAULT` = **nur Bund**: der ausgelieferte statische
 * Suchindex trägt keine kantonalen Artikel mehr. Wer den vollen Index braucht
 * (Mess-Werkzeuge, Vergleichsläufe), setzt `SUCHE_INDEX_EBENEN=bund,kanton`.
 *
 * BYTE-BEWEIS (gemessen 1.9.2026, `gzipSync` wie im Perf-Budget-Tor, Korpusstand
 * `123ffe495`; die K0-Zahlen vom 31.8.2026 bleiben unangetastet daneben stehen —
 * der Korpus ist seither um die ZH-Kern-Tranche gewachsen):
 *   · bund+kanton  57 036 Einträge · 47 646.3 KB roh · **9 974.0 KB gzip**
 *   · bund          25 391 Einträge · 25 496.6 KB roh · **5 311.0 KB gzip**
 *   · Ersparnis                                        **4 663.0 KB gzip = 46.8 %**
 * Der Perf-Budget-Deckel für `public/such-index/artikel.json` ist mit derselben
 * Messung gesenkt worden (scripts/check-perf-budget.ts) — ein Deckel, der die
 * alte Grösse weiter zuliesse, würde die Rückkehr der Kanton-Ebene NICHT bemerken.
 *
 * Was der Schalter tut und was nicht, steht ausführbar in
 * `src/tests/suche/ebenenWahl.test.ts`: der Vollindex (`bund,kanton`) ist byte-gleich
 * mit der Montage aus `baueEbenenIndex` je Ebene — also mit dem Code-Weg, den es VOR
 * dem Schalter gab —, der Default-Lauf byte-gleich mit `baueEbenenIndex('bund')`; der
 * Schalter FILTERT damit nur, er verändert keinen einzigen Eintrag. Ein dritter Test
 * hält §2 fest (zwei Läufe byte-gleich).
 *
 * (Bis zum 31.8.2026 verwies dieser Absatz auf einen Byte-Beweis in
 * `src/tests/suchIndex.test.ts` — den es dort nie gab; auch die K3-Tests standen
 * woanders. Gegenprüfungs-Befund F3. Ein behaupteter Beweis ist schlimmer als keiner:
 * er beendet das Nachfragen.)
 *
 * WOZU. Der Kanton-Anteil am ausgelieferten Suchindex sind 4.26 MiB gzip = 45.2 %
 * (Messung K0, bibliothek/register/suche-edge-nullprobe-2026-08-31.md). Seit K1/K2
 * findet und rangiert der Edge-Weg kantonale Artikel in denselben topischen Stufen wie
 * der statische — der statische Kanton-Anteil wäre also WEITGEHEND entbehrlich.
 *
 * «Weitgehend», nicht «gleichwertig» (Korrektur nach Gegenprüfungs-Befund F2,
 * 31.8.2026). Der Satz stand hier vorher als Vollparität, und die besteht nicht: der
 * DB-Weg kennt KEINE Präfix-Treffer («Verjähr» → Client findet, DB 0) und KEINE
 * Synonym-Expansion. Beides ist benannt, gemessen und begründet in
 * scripts/datenhaltung/suche-kern.ts, Abschnitt «WO DIE PARITÄT GILT — UND WO NICHT».
 * Für die Scharfschaltung ist das nicht nebensächlich: käme der Kanton nur noch vom
 * Edge, verlöre eine kantonale Präfix-Query ihre Treffer GANZ, statt sie bloss aus
 * einem Fallback zu holen. Der Entscheid selbst bleibt unverändert bei David — aber er
 * darf nicht auf einer überzeichneten Grundlage getroffen werden (§8).
 *
 * WAS DIE SCHARFSCHALTUNG KOSTET — und wo der Nutzer es sieht. Kantonale Treffer
 * kommen jetzt NUR noch online. Fällt die Edge-Suche aus (Timeout, 5-min-Sperre in
 * onlineVolltext.ts, fehlende Turso-Env), sucht die Seite in einem Korpus ohne
 * Kantone; dazu fehlen dem DB-Weg dauerhaft Präfix-Treffer und Synonym-Expansion.
 * Genau darum ist die Lücke nicht bloss hingenommen, sondern ANGESCHRIEBEN — und
 * zwar ohne Rückgriff auf einen Laufzeit-Zufall: das Artefakt trägt in `ebenen` die
 * tatsächlich indexierten Ebenen, der Client leitet daraus `nurOnlineEbenen` ab
 * (src/lib/suche/artikelVolltext.ts) und die Trefferliste sagt an der
 * Gesetzestext-Gruppe, dass kantonale Volltext-Treffer nur aus der Online-Suche
 * kommen und ohne Verbindung fehlen (src/lib/universalSuche.ts, EBENEN_NUR_ONLINE).
 * Eine weggelassene Ebene ohne diese Kette wäre eine stille Auskunftslücke (§8):
 * eine leere kantonale Trefferliste liest sich sonst als «es gibt keine kantonale
 * Bestimmung».
 *
 * ENTSCHEID. Die Scharfschaltung ist ein §8-Entscheid über die eigene
 * Vollständigkeit, kein technischer; David hat ihn am 31.8.2026 gefällt
 * («schalte scharf sobald geprüft und verifiziert»), nachdem die Edge-Suche live
 * verifiziert war. Die Heiss/Kalt-Grenze (Fahrplan §12.2) bleibt davon unberührt.
 */
export function gewaehlteEbenen(roh = process.env.SUCHE_INDEX_EBENEN): readonly Ebene[] {
  const wunsch = (roh ?? '').trim();
  if (!wunsch) return EBENEN_DEFAULT;
  const genannt = new Set(wunsch.split(/[,\s]+/).filter(Boolean));
  const unbekannt = [...genannt].filter((e) => !(EBENEN as readonly string[]).includes(e));
  if (unbekannt.length > 0) {
    // Ein Tippfehler darf NICHT still einen halben Index erzeugen — genau der
    // Fehlmodus aus PR #313 (halber Index, nie rot geworden).
    throw new Error(
      `SUCHE_INDEX_EBENEN: unbekannte Ebene(n) «${unbekannt.join(', ')}» — erlaubt: ${EBENEN.join(', ')}.`,
    );
  }
  // Reihenfolge bleibt die von EBENEN (§2 stabile Eintrags-Reihenfolge), nicht die
  // Nenn-Reihenfolge der Variable.
  const gewaehlt = EBENEN.filter((e) => genannt.has(e));
  if (gewaehlt.length === 0) throw new Error('SUCHE_INDEX_EBENEN: keine gültige Ebene genannt.');
  return gewaehlt;
}

// `quelle` trägt bei kantonalen Snapshots das Kantonskürzel («AG», «BS»); Bund
// führt das Feld nicht. Es ist die Grundlage der ehrlichen Herkunfts-Anzeige.
interface Eintrag { id: string; erlass: string; artikel: string; artikelLabel: string; grundlage?: string; quelle?: string; bloecke?: Block[] }

// ── Sachüberschrift (Marginalie + Gliederung) je Artikel (UI-NAV S4) ─────────
//
// Der Ranking-Boost «Marginalie/Sachüberschrift» (S4/#40) braucht den Randtitel
// UND den Titel-/Abschnitts-Pfad als DURCHSUCHBARES Feld. Beides liegt bereits in
// public/normtext/struktur/bund/<key>.json (artikel[a].marginalie + .gliederung) —
// derselbe Datenbestand, aus dem der Reader die Randtitel rendert (K10: KEIN
// Zweit-Index, nur ein zusätzliches Feld auf denselben Daten). So trifft die
// Alltags-Query «Miete» über die Gliederung «Achter Titel: Die Miete» direkt die
// mietrechtlichen Artikel (OR 253 ff.), die im Artikeltext das Wort «Miete» selbst
// nie führen (FlexSearch-forward: «miete» ist kein Präfix von «mietvertrag»).
interface StrukturDatei { artikel?: Record<string, StrukturArtikel> }

// Kompaktes Schema (kurze Keys → kleinere Datei): k=ROUTEN-Key (Dateiname-Stamm
// = ERLASS_REGISTER.key, für /gesetze/<eb>/<k>), ku=Anzeige-Kürzel (z. B. «StGB»;
// kantonal der amtliche Titel «Anwaltstarif (SAR 291.150)»), eb=Ebene
// ('bund'|'kanton'), kt=Kantonskürzel («AG») bzw. '' bei Bund,
// a=artikel, l=label, m=PRIMÄRE Marginalie (oberster Randtitel = Hauptthema des
// Artikels), n=nachrangige Marginalie (tiefere Randtitel-Stufen), g=Gliederung
// (Titel-/Abschnitts-Pfad), t=text.
// eb/kt sind KEINE Recall-Felder, sondern Anzeige- und Routing-Daten: sie tragen
// den href auf die richtige Ebene (/gesetze/kanton/AG-291.150) und die
// Kanton-Marke im Treffer. Ohne sie sähe ein kantonaler Treffer wie Bundesrecht
// aus — genau die Unehrlichkeit, die §8 verbietet.
// m/n/g werden GETRENNT geführt (S4): trifft die Query die primäre Marginalie ODER
// den Gliederungs-Titel, ist der Artikel dem Thema GEWIDMET (OR 127 «Verjährung»,
// OR 492 im Titel «Die Bürgschaft»); trifft sie nur eine nachrangige Marginalie,
// NENNT der Artikel das Thema bloss (OR 121 «Verrechnung … Bei Bürgschaft»). Die
// Rangschicht (artikelRanking.ts) wertet das unterschiedlich.
// WICHTIG (§8): k MUSS der Dateiname-Stamm sein, NICHT das interne `erlass`-Feld —
// 71/218 Erlasse haben Kürzel ≠ Dateiname (StGB/STGB, AdoV/ADOV …); sonst tote Links.
// tb=Tabellen-/Struktur-Tier (Tabellenzellen + Füllpunkt-`tabelle` + Bild-Alt +
// `grundlage`-Delegationsnorm), f=Fussnoten-Body. Beide sind RECALL-only (kein
// topischer Boost — eine Fussnoten-/Tabellen-Nennung widmet den Artikel dem Thema
// nicht) und tragen die von der Korpus-Suche bisher übersehenen Werte, die NUR in
// Tabellen oder Fussnoten stehen. Feld-Gewichtung: t > m > n > g > tb > f.
interface IndexEintrag { k: string; ku: string; eb: Ebene; kt: string; a: string; l: string; m: string; n: string; g: string; t: string; tb: string; f: string }

/** Warum eine Datei keinen (oder keinen vollständigen) Beitrag zum Index leistet.
 *  Wird mitgeschrieben statt verschluckt — ein Erlass, der aus dem Index fällt,
 *  muss sichtbar sein und nicht im Nichts verschwinden (§8). */
export interface Uebersprungen {
  ebene: Ebene;
  datei: string;
  /** 'unlesbar' = JSON kaputt · 'kein-eintraege-array' = keine Erlass-Datei
   *  (z. B. kanton/index.json, eine URL→Datei-Karte) · 'kein-volltext' = Erlass
   *  ohne einen einzigen indexierbaren Artikel (Stub/PDF/Live-Link). */
  grund: 'unlesbar' | 'kein-eintraege-array' | 'kein-volltext';
  /** Zahl der Snapshot-Einträge in der Datei (0 wenn unlesbar/kein Array). */
  eintraege: number;
}

export interface EbenenIndex { eintraege: IndexEintrag[]; uebersprungen: Uebersprungen[]; ohneText: number }

/**
 * Baut den Index EINER Ebene aus public/normtext/<ebene> + dem Struktur-Sidecar.
 * Rein und deterministisch (§2): Datei-Reihenfolge sortiert, kein Date, kein Netz.
 */
export function baueEbenenIndex(ebene: Ebene): EbenenIndex {
  const quellDir = resolve(NORMTEXT, ebene);
  const strukturDir = resolve(NORMTEXT, 'struktur', ebene);
  const eintraege: IndexEintrag[] = [];
  const uebersprungen: Uebersprungen[] = [];
  let ohneText = 0;
  for (const datei of readdirSync(quellDir).filter((f) => f.endsWith('.json')).sort()) {
    const key = datei.replace(/\.json$/, ''); // = Routen-Key (ERLASS_REGISTER.key)
    let snap: { eintraege?: Eintrag[] };
    try { snap = JSON.parse(readFileSync(resolve(quellDir, datei), 'utf8')); } catch {
      uebersprungen.push({ ebene, datei, grund: 'unlesbar', eintraege: 0 });
      continue;
    }
    // Nicht jede *.json unter public/normtext/<ebene> ist ein Erlass: der Kanton
    // führt dort zusätzlich index.json (URL→Dateiname-Karte). Kein Erlass ⇒ kein
    // Verlust, aber protokollpflichtig, damit «fehlt» und «ist keiner» unterscheidbar bleibt.
    if (!Array.isArray(snap.eintraege)) {
      uebersprungen.push({ ebene, datei, grund: 'kein-eintraege-array', eintraege: 0 });
      continue;
    }
    // Sidecar-Strukturdatei (Marginalie/Gliederung) — fehlt sie, bleibt m leer (§8).
    let struktur: StrukturDatei = {};
    try { struktur = JSON.parse(readFileSync(resolve(strukturDir, datei), 'utf8')); } catch { /* keine Struktur → m='' */ }
    const vorher = eintraege.length;
    for (const e of snap.eintraege) {
      if (!e.bloecke || e.bloecke.length === 0) { ohneText++; continue; }
      const t = artikelText(e.bloecke);
      if (!t) { ohneText++; continue; }
      // Die fünf Recall-Felder kommen aus der GETEILTEN Extraktion (§5) — dieselbe
      // Funktion speist den DB-/Edge-Index in scripts/datenhaltung/fts.ts.
      const { m, n, g, tb, f } = baueRecallFelder(e.bloecke, struktur.artikel?.[e.artikel], e.grundlage);
      // kt aus dem Snapshot-Feld `quelle` (Kanton) — bei Bund leer. Ein kantonaler
      // Eintrag OHNE Kanton wäre eine stille Herkunfts-Lüge; das Tor
      // src/tests/suchIndex.test.ts lässt genau das rot auflaufen.
      const kt = ebene === 'kanton' ? (e.quelle ?? '').trim() : '';
      eintraege.push({ k: key, ku: e.erlass, eb: ebene, kt, a: e.artikel, l: e.artikelLabel, m, n, g, t, tb, f });
    }
    // Erlass-Datei, die KEINEN einzigen indexierbaren Artikel beigetragen hat.
    if (eintraege.length === vorher) {
      uebersprungen.push({ ebene, datei, grund: 'kein-volltext', eintraege: snap.eintraege.length });
    }
  }
  // Stabile Reihenfolge (erlass, dann Datei-Reihenfolge der Artikel bleibt erhalten).
  return { eintraege, uebersprungen, ohneText };
}

export interface Suchindex {
  erzeugt: string;
  ebenen: readonly Ebene[];
  eintraege: IndexEintrag[];
  /** Alles, was NICHT in den Index kam — mit Grund (§8: kein stiller Verlust). */
  uebersprungen: Uebersprungen[];
}

/** Gesamt-Index über die gewählten Ebenen, in EBENEN-Reihenfolge (Bund vor Kanton).
 *  Ohne gesetztes `SUCHE_INDEX_EBENEN` sind das ALLE Ebenen — unverändertes Verhalten. */
export function baueIndex(ebenen: readonly Ebene[] = gewaehlteEbenen()): Suchindex {
  const eintraege: IndexEintrag[] = [];
  const uebersprungen: Uebersprungen[] = [];
  for (const ebene of ebenen) {
    const teil = baueEbenenIndex(ebene);
    eintraege.push(...teil.eintraege);
    uebersprungen.push(...teil.uebersprungen);
  }
  // `ebenen` im Artefakt sind die TATSÄCHLICH indexierten — der Client liest daraus,
  // welche Ebenen er erwarten darf. Eine weggelassene Ebene ist damit im Artefakt
  // sichtbar und nicht bloss durch Abwesenheit von Einträgen zu erraten (§8).
  return { erzeugt: 'generiert', ebenen, eintraege, uebersprungen };
}

// CLI-Logik NICHT unter vitest ausführen — der Test importiert baueIndex
// und darf den Index nicht als Seiteneffekt schreiben. (vite-node setzt VITEST
// nicht → gen:suchindex/check:suchindex laufen normal.)
if (!process.env.VITEST) {
  const istCheck = process.argv.includes('--check');
  const index = baueIndex();
  const neu = JSON.stringify(index);
  // Je-Ebene-Zählung für die Ausgabe: der Bericht muss zeigen, dass BEIDE Ebenen
  // im Index sind — eine blosse Gesamtzahl verstiege sich zur Aussage «viel» und
  // verschwiege eine leer gelaufene Ebene (§8).
  // Bewusst über ALLE EBENEN, nicht nur über die gewählten: eine weggelassene Ebene
  // erscheint so als «kanton 0 (WEGGELASSEN)» statt gar nicht — Abwesenheit muss
  // sichtbar sein, nicht erschliessbar (§8).
  const jeEbene = EBENEN.map((eb) => {
    const n = index.eintraege.filter((e) => e.eb === eb).length;
    return index.ebenen.includes(eb) ? `${eb} ${n}` : `${eb} 0 (WEGGELASSEN)`;
  }).join(' · ');
  if (index.ebenen.length < EBENEN.length) {
    console.log(
      `gen:suchindex: Index trägt NUR ${index.ebenen.join(', ')} ` +
        `(${process.env.SUCHE_INDEX_EBENEN ? 'SUCHE_INDEX_EBENEN gesetzt' : 'Default seit K3-Scharfschaltung 1.9.2026'}). ` +
        'Die weggelassenen Ebenen müssen am Edge abgedeckt und in der Oberfläche als fehlend ausgewiesen sein (§8).',
    );
  }
  if (istCheck) {
    let alt = '';
    try { alt = readFileSync(ZIEL, 'utf8'); } catch {
      console.error('check:suchindex: ' + ZIEL + ' fehlt — `npm run gen:suchindex` ausführen.');
      process.exit(1);
    }
    if (alt !== neu) {
      console.error('check:suchindex: public/such-index/artikel.json ist VERALTET gegenüber den Snapshots — `npm run gen:suchindex` ausführen.');
      process.exit(1);
    }
    console.log(`check:suchindex: Index synchron mit den Snapshots (${index.eintraege.length} Artikel — ${jeEbene}).`);
  } else {
    mkdirSync(dirname(ZIEL), { recursive: true });
    writeFileSync(ZIEL, neu, 'utf8');
    console.log(`gen:suchindex: ${index.eintraege.length} Artikel (${jeEbene}) → public/such-index/artikel.json`);
  }
  // Übersprungenes IMMER ausweisen (auch im --check-Lauf): ein Erlass, der aus
  // dem Index fällt, soll im Build-Log stehen und nicht im Nichts verschwinden.
  if (index.uebersprungen.length > 0) {
    const nachGrund = new Map<string, Uebersprungen[]>();
    for (const u of index.uebersprungen) {
      const s = `${u.ebene}/${u.grund}`;
      const arr = nachGrund.get(s);
      if (arr) arr.push(u); else nachGrund.set(s, [u]);
    }
    console.log(`  nicht indexiert (${index.uebersprungen.length} Datei(en)):`);
    for (const [s, arr] of [...nachGrund].sort()) {
      const namen = arr.map((u) => u.datei).sort();
      const zeige = namen.slice(0, 12).join(', ');
      console.log(`    ${s}: ${arr.length} — ${zeige}${namen.length > 12 ? `, … (+${namen.length - 12})` : ''}`);
    }
  }
}
