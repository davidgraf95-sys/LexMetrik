// ─── Generator: Bund-Artikel-Volltext-Suchindex (ROADMAP Schritt 5, Task 4.1) ─
//
// Baut aus den gepinnten Bund-Volltext-Snapshots (public/normtext/bund/*.json)
// EINE kompakte Datendatei public/such-index/artikel-bund.json für die globale
// Artikel-Volltextsuche. Der FlexSearch-Index wird daraus CLIENT-seitig lazy
// gebaut (eigener Chunk, §3/§6.4 — nie im Haupt-Bundle).
//
//   npm run gen:suchindex          schreibt die Datei
//   npm run check:suchindex        prüft Drift (Index ≠ Snapshots) → exit 1
//
// Nur Erlasse MIT `bloecke` (echter Volltext); Stubs/PDF/Live-Link tragen keinen
// durchsuchbaren Text und werden ausgelassen (§8: nichts vortäuschen).
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const wurzel = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const BUND = resolve(wurzel, 'public/normtext/bund');
const STRUKTUR = resolve(wurzel, 'public/normtext/struktur/bund');
const ZIEL = resolve(wurzel, 'public/such-index/artikel-bund.json');

// Bild/Kachel: `alt` ist der einzige durchsuchbare Text (SSV-Signalnamen wie
// «Rechtskurve», «Engpass»). Der generische Fallback «Amtliche Abbildung» (271×
// im Bund) trägt keinen Inhalt und wird verworfen (§8: kein Suchrauschen).
interface Bild { alt?: string; formel?: boolean }
interface Kachel { bild?: Bild; nummer?: string; name?: string }
interface Mehrspaltig { spalten?: { titel?: string }[]; zeilen?: (string | number)[][] }
interface Block {
  absatz?: string; text?: string; items?: { marke?: string; text?: string }[];
  mehrspaltig?: Mehrspaltig; tabelle?: Record<string, unknown>[];
  bild?: Bild; bildKacheln?: Kachel[];
}
interface Eintrag { id: string; erlass: string; artikel: string; artikelLabel: string; grundlage?: string; bloecke?: Block[] }

/** Durchsuchbarer Plaintext eines Artikels (Absätze + Aufzählungen, Whitespace normalisiert). */
function artikelText(bloecke: Block[]): string {
  const teile: string[] = [];
  for (const b of bloecke) {
    if (b.text) teile.push(b.text);
    for (const it of b.items ?? []) if (it.text) teile.push(it.text);
  }
  return teile.join(' ').replace(/\s+/g, ' ').trim();
}

const GENERISCHES_ALT = /^amtliche abbildung$/i;

/** Nicht-generischer Alt-Text eines Bildes (SSV-Signalname o. Ä.), sonst ''. */
function bildAlt(b?: Bild): string {
  const alt = (b?.alt ?? '').trim();
  return alt && !GENERISCHES_ALT.test(alt) ? alt : '';
}

/** Tabellen-/Struktur-Tier eines Artikels: Tabellenzellen (mehrspaltig-Spalten-
 *  titel + Zeilen, Füllpunkt-`tabelle`), Bild-Alt-Texte (SSV-Signalnamen; ohne
 *  den generischen «Amtliche Abbildung»-Platzhalter) und Kachel-Beschriftungen.
 *  Ein Rang UNTER Marginalie/Gliederung, ÜBER Fussnote (Feld-Gewichtung S4). */
function tabellenText(bloecke: Block[]): string {
  const teile: string[] = [];
  for (const b of bloecke) {
    if (b.mehrspaltig) {
      for (const s of b.mehrspaltig.spalten ?? []) if (s.titel) teile.push(s.titel);
      for (const z of b.mehrspaltig.zeilen ?? []) for (const c of z) if (c != null && c !== '') teile.push(String(c));
    }
    // Füllpunkt-Tabelle (`tabelle`): Array von Zeilen-Objekten mit freien String-
    // Feldern (Kanton-Gebührentarife: {beschreibung, betrag}). Bund führt aktuell
    // keine — verhaltensneutral hier, aber der Extraktor bleibt vollständig.
    for (const zeile of b.tabelle ?? []) {
      for (const v of Object.values(zeile)) if (typeof v === 'string' && v.trim()) teile.push(v);
    }
    const alt = bildAlt(b.bild);
    if (alt) teile.push(alt);
    for (const k of b.bildKacheln ?? []) {
      if (k.name) teile.push(k.name);
      const ka = bildAlt(k.bild);
      if (ka) teile.push(ka);
    }
  }
  return teile.join(' ').replace(/\s+/g, ' ').trim();
}

/** Fussnoten-Body eines Artikels als durchsuchbarer Plaintext (Änderungs-/
 *  Quellenhinweise, AS-/BBl-Referenzen). Fedlex-Hervorhebungen <b>/<i> und alle
 *  übrigen Tags fallen; niedrigster Recall-Tier (Feld-Gewichtung S4). */
function fussnotenText(fussnoten: { text?: string }[]): string {
  const teile: string[] = [];
  for (const fn of fussnoten) {
    // Tags raus, Fedlex-Entities dekodieren; die \s+-Normalisierung unten
    // fasst nbsp (von \s erfasst) mit ein.
    const t = (fn.text ?? '').replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
    if (t.trim()) teile.push(t);
  }
  return teile.join(' ').replace(/\s+/g, ' ').trim();
}

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
interface StrukturArtikel { marginalie?: string[]; gliederung?: { ebene?: number; label?: string }[]; fussnoten?: { text?: string }[] }
interface StrukturDatei { artikel?: Record<string, StrukturArtikel> }

/** Enumerator-Präfix eines Randtitels entfernen («G. Verjährung» → «Verjährung»,
 *  «1. Zehn Jahre» → «Zehn Jahre», «a. Grundsatz» → «Grundsatz»). Deterministisch;
 *  reine Text-Säuberung, damit die Buchstaben-/Ziffern-Zähler nicht als Suchrauschen
 *  in den Index geraten. */
function ohneEnumerator(s: string): string {
  return s.replace(/^\s*(?:[0-9]+|[IVXLCDMivxlcdm]+|[A-Za-z])[.)]\s+/, '').trim();
}

/** Labels entdoppeln + säubern (Enumerator weg, Whitespace normalisiert), in
 *  stabiler Reihenfolge zu einem Text joinen. */
function labelText(rohe: (string | undefined)[]): string {
  const teile: string[] = [];
  const sehen = new Set<string>();
  for (const roh of rohe) {
    const s = ohneEnumerator((roh ?? '').replace(/\s+/g, ' ').trim());
    if (s && !sehen.has(s.toLowerCase())) { sehen.add(s.toLowerCase()); teile.push(s); }
  }
  return teile.join(' · ');
}

// Kompaktes Schema (kurze Keys → kleinere Datei): k=ROUTEN-Key (Dateiname-Stamm
// = ERLASS_REGISTER.key, für /gesetze/bund/<k>), ku=Anzeige-Kürzel (z. B. «StGB»),
// a=artikel, l=label, m=PRIMÄRE Marginalie (oberster Randtitel = Hauptthema des
// Artikels), n=nachrangige Marginalie (tiefere Randtitel-Stufen), g=Gliederung
// (Titel-/Abschnitts-Pfad), t=text. ebene ist immer 'bund'.
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
interface IndexEintrag { k: string; ku: string; a: string; l: string; m: string; n: string; g: string; t: string; tb: string; f: string }

export function baueBundIndex(): { erzeugt: string; ebene: 'bund'; eintraege: IndexEintrag[] } {
  const eintraege: IndexEintrag[] = [];
  for (const datei of readdirSync(BUND).filter((f) => f.endsWith('.json')).sort()) {
    const key = datei.replace(/\.json$/, ''); // = Routen-Key (ERLASS_REGISTER.key)
    let snap: { eintraege?: Eintrag[] };
    try { snap = JSON.parse(readFileSync(resolve(BUND, datei), 'utf8')); } catch { continue; }
    // Sidecar-Strukturdatei (Marginalie/Gliederung) — fehlt sie, bleibt m leer (§8).
    let struktur: StrukturDatei = {};
    try { struktur = JSON.parse(readFileSync(resolve(STRUKTUR, datei), 'utf8')); } catch { /* keine Struktur → m='' */ }
    for (const e of snap.eintraege ?? []) {
      if (!e.bloecke || e.bloecke.length === 0) continue;
      const t = artikelText(e.bloecke);
      if (!t) continue;
      const sa = struktur.artikel?.[e.artikel];
      const marg = sa?.marginalie ?? [];
      const m = labelText(marg.slice(0, 1)); // primäre (oberste) Marginalie = Hauptthema
      const n = labelText(marg.slice(1)); // nachrangige Randtitel-Stufen
      const g = labelText((sa?.gliederung ?? []).map((x) => x.label));
      // Tabellen-Tier: Zellen/Bild-Alt aus den Blöcken + `grundlage` (Delegations-
      // norm-Template, «(Art. 1 ArG)»). Fussnoten-Tier: aus dem Struktur-Sidecar.
      const tbTeile = tabellenText(e.bloecke);
      const grundlage = (e.grundlage ?? '').replace(/\s+/g, ' ').trim();
      const tb = [tbTeile, grundlage].filter(Boolean).join(' ');
      const f = fussnotenText(sa?.fussnoten ?? []);
      eintraege.push({ k: key, ku: e.erlass, a: e.artikel, l: e.artikelLabel, m, n, g, t, tb, f });
    }
  }
  // Stabile Reihenfolge (erlass, dann Datei-Reihenfolge der Artikel bleibt erhalten).
  return { erzeugt: 'generiert', ebene: 'bund', eintraege };
}

function serialisiere(): string {
  return JSON.stringify(baueBundIndex());
}

// CLI-Logik NICHT unter vitest ausführen — der Test importiert baueBundIndex
// und darf den Index nicht als Seiteneffekt schreiben. (vite-node setzt VITEST
// nicht → gen:suchindex/check:suchindex laufen normal.)
if (!process.env.VITEST) {
  const istCheck = process.argv.includes('--check');
  const neu = serialisiere();
  if (istCheck) {
    let alt = '';
    try { alt = readFileSync(ZIEL, 'utf8'); } catch {
      console.error('check:suchindex: ' + ZIEL + ' fehlt — `npm run gen:suchindex` ausführen.');
      process.exit(1);
    }
    if (alt !== neu) {
      console.error('check:suchindex: public/such-index/artikel-bund.json ist VERALTET gegenüber den Snapshots — `npm run gen:suchindex` ausführen und committen.');
      process.exit(1);
    }
    const n = JSON.parse(neu).eintraege.length;
    console.log(`check:suchindex: Index synchron mit den Snapshots (${n} Artikel).`);
  } else {
    mkdirSync(dirname(ZIEL), { recursive: true });
    writeFileSync(ZIEL, neu, 'utf8');
    const n = JSON.parse(neu).eintraege.length;
    console.log(`gen:suchindex: ${n} Bund-Artikel → public/such-index/artikel-bund.json`);
  }
}
