// scripts/analyse/gemini-diskrepanz-text.ts — deterministische Klartext-Reduktion
// für den Gemini-Diskrepanz-Finder (FAHRPLAN-FREMDAGENTEN §2 Phase 2).
//
// Zwei unabhängige Reduzierer, die je Artikel DASSELBE Format erzeugen, damit
// ein Zweitmodell (Gemini) Quelle und Snapshot textlich vergleichen kann:
//   - reduziereQuelleHtml: gepinntes Fedlex-Filestore-HTML -> Klartext je Artikel
//   - reduziereSnapshot:   NormSnapshot[] (public/normtext/**.json) -> Klartext je Artikel
//
// Harness-Lehren aus dem T2-Recall-Test (scratchpad t2-recall/ERGEBNIS.md,
// 3.9.2026): Absatznummern INLINE in den Text setzen (nicht in ein separates
// Feld auslagern — das erzeugte dort Scheinfunde), KEINE Platzhaltertexte
// («[SVG]» o.ä.) einstreuen, Artikelgrenzen exakt einhalten. Der Fussnoten-
// Apparat der Quelle wird bewusst GETRENNT vom Artikeltext gehalten (eigener
// Abschnitt) statt inline vermischt, weil der Snapshot ihn nicht als Feld
// führt (src/lib/normtext/typen.ts) — sonst wäre jeder Fussnotentext ein
// systematischer "drop"-Scheinfund.
//
// Bewusst UNABHÄNGIG von scripts/normtext/extrahiere-fedlex.ts: ein zweiter,
// eigenständiger Parser ist der Sinn des Diskrepanz-Finders (ein Bug, der in
// BEIDEN Parsern gleich wäre, entginge sonst). Reine Lesefunktion — ändert
// keinen Risikopfad, schreibt nichts.

import { parseHTML } from 'linkedom';
import type { NormSnapshot } from '../../src/lib/normtext/typen.ts';

export interface ArtikelKlartext {
  artikel: string;
  label: string;
  /** Artikeltext mit inline Absatz-/Item-Markern, OHNE Fussnoten-Apparat. */
  text: string;
  /** Fussnoten-Apparat der Quelle, getrennt gehalten (Snapshot hat keine Entsprechung). */
  fussnoten: string;
}

function normWs(s: string): string {
  return s.replace(/\u00a0/g, ' ').replace(/[ \t]+/g, ' ').replace(/ *\n */g, '\n').trim();
}

// ─── Gemeinsame Bausteine (Quelle UND Snapshot benutzen DIESELBEN) ───────
//
// Nachbesserung 4.9.2026: die erste Fassung hatte je Seite eigene Render-
// Pfade — Einzug, Zellentrenner und Absatzmarker liefen auseinander und
// erzeugten Scheinfunde auf JEDEM Tabellen-, bis/ter- und Aufhebungsartikel
// (gemessen an GEBV_SCHKG/AMBV/DBG). Alles, was beide Seiten gleich
// darstellen müssen, steht darum ab hier genau einmal.

/** Einheitlicher Einzug für alles, was unter einem Absatz hängt (Items, Tabellenzeilen). */
const EINZUG = '  ';

/** Einheitlicher Klartext für einen artikelweit aufgehobenen Artikel. */
const AUFGEHOBEN = '(aufgehoben)';

/**
 * Erkennt den Aufhebungs-Zustand auf BEIDEN Seiten: Fedlex liefert für einen
 * aufgehobenen Artikel einen Body, der ausser dem Fussnoten-Apparat NICHTS
 * enthält (Klartext also leer, s. AMBV Art. 47); unser Snapshot führt an
 * derselben Stelle den amtlichen Auslassungs-Platzhalter «…». Ohne diese
 * Normalisierung ist jeder aufgehobene Artikel ein garantierter Scheinfund.
 */
function istAufgehoben(text: string): boolean {
  const t = text.trim();
  return t === '' || t === '…' || t === '...' || t === AUFGEHOBEN;
}

/**
 * Menschliches Artikel-Label aus dem Fedlex-Anker-Token.
 * Fedlex trennt lateinische Ordinal-Suffixe und Buchstaben-Zusätze mit einem
 * Unterstrich (`art_220_a`, `art_335_c`, `art_1_bis`), unser Snapshot schreibt
 * sie zusammen (`Art. 220a`, `Art. 335c`, `Art. 1bis`). Massgeblich ist die
 * Snapshot-Schreibweise (`NormSnapshot.artikelLabel`) — sonst meldet der
 * Vergleich für jeden bis/ter/a-Artikel eine Label-Abweichung, die keine ist.
 */
export function artikelLabelAusId(nummer: string): string {
  const teile = nummer.split('_');
  let label = teile[0];
  for (const t of teile.slice(1)) {
    // Rein numerisches Folgesegment = ARTIKELSPANNE («art_49_50» ist die
    // gemeinsam aufgehobene Strecke Art. 49–50, nicht «Art. 4950»); der
    // Snapshot schreibt sie mit Gedankenstrich. Alles andere ist ein Suffix
    // (Buchstabe oder lateinisches Ordinale) und wird angehängt.
    label += /^\d+$/.test(t) ? `\u2013${t}` : t;
  }
  return `Art. ${label}`;
}

/**
 * Marke einer Aufzählung (lit./Ziff./Kategorie) auf die nackte Form bringen:
 * Fedlex schreibt «a. », «1. », aber auch «A: » (VZV Art. 3 Ausweiskategorien);
 * der Snapshot führt die Marke ohne jedes Satzzeichen. Beide Seiten laufen
 * durch diese Funktion, damit nur ein ECHTER Markenunterschied (z.B. amtlich
 * «A» gegen extrahiert «a») sichtbar bleibt.
 */
function normMarke(m: string): string {
  return m.replace(/[.:;,]\s*$/, '').trim();
}

/** Eine Aufzählungszeile — identisch für Quelle (dl/dt/dd) und Snapshot (items). */
function itemZeile(tiefe: number, marke: string, text: string): string {
  const einzug = EINZUG.repeat(1 + tiefe);
  const m = normMarke(marke);
  // Fortsetzungszeile ohne eigene Marke (Fedlex: leeres <dt>, z.B. VZV Art. 3):
  // kein Phantom-Punkt voranstellen.
  if (!m) return `${einzug}${normWs(text)}`.trimEnd();
  return `${einzug}${m}. ${normWs(text)}`.trimEnd();
}

/**
 * Eine Tabellenzeile — identisch für Quelle (<tr>/<td>) und Snapshot
 * (`tabelle`, `mehrspaltig`, `verweis`).
 *
 * BEWUSSTE ENTSCHEIDUNG zur Zellgrenze: die amtliche Quelle streut eine
 * Tarifstaffel über Layout-Zellen inklusive Leerzellen («» | «» | «» | «bis» |
 * «100» | «7.–»), unser Generator verdichtet sie zum kanonischen Spaltenmodell
 * («bis 100» | «7.–»). Beide Zellzerlegungen sind korrekt, nur verschieden —
 * ein Vergleich MIT Zellgrenzen meldete darum jede Tarif-Tabelle als
 * Struktur-Abweichung, obwohl der Inhalt identisch ist (gemessen an
 * GebV SchKG Art. 16). Der Klartext lässt die Zellgrenze deshalb weg und
 * vergleicht den ZELLINHALT in Lesereihenfolge; die Spaltenzahl selbst ist
 * ohnehin deterministisch tor-geprüft (T-B2, src/lib/normtext/typen.ts).
 * Preis: dieser Vergleich sieht eine reine Spalten-VERSCHIEBUNG nicht — das
 * ist die dokumentierte Restklasse, kein Versehen.
 */
function tabellenZeile(zellen: string[]): string | null {
  const gefuellt = zellen.map((z) => normWs(z)).filter((z) => z !== '');
  if (!gefuellt.length) return null;
  return `${EINZUG}${gefuellt.join(' ')}`;
}

/**
 * Absatzzeile mit inline gesetztem Marker. Entdoppelt eine Nummer, die im
 * Text bereits steht — die Quelle trägt sie als <sup> IM textContent, und
 * mehrere Snapshot-Einträge führen sie zusätzlich am Textanfang
 * (public/normtext/bund/DBG.json Art. 20 Abs. 4–7: `absatz: "4"` UND
 * `text: "4 Schüttet …"`). Ohne Entdoppelung stünde dort «4 4 Schüttet …».
 */
function absatzZeile(marker: string, text: string): string {
  const m = normWs(marker).replace(/\s+/g, '');
  let t = normWs(text);
  if (m) {
    // Whitespace-TOLERANT vergleichen: die Quelle liefert «1bis» als zwei
    // getrennte <sup> und damit im textContent als «1 bis», der Snapshot als
    // «1bis». Beide Schreibweisen müssen als derselbe Präfix erkannt werden.
    let i = 0;
    let j = 0;
    while (j < m.length && i < t.length) {
      if (/\s/.test(t[i])) { i++; continue; }
      if (t[i].toLowerCase() !== m[j].toLowerCase()) { i = -1; break; }
      i++; j++;
    }
    if (i >= 0 && j === m.length) {
      const rest = t.slice(i);
      if (rest === '' || /^[\s.,;:)]/.test(rest)) t = rest.trim();
    }
  }
  if (!m) return t;
  return `${m} ${t}`.trim();
}

/**
 * Absatzmarker eines Fedlex-<p class="absatz">: die FÜHRENDEN <sup>-Elemente
 * zusammengezogen. «1bis» steht dort als zwei getrennte Elemente
 * (`<sup>1</sup><sup>bis</sup>`, GebV SchKG Art. 9) — die alte Fassung las nur
 * das erste, verwarf es am Test `/^\d+$/` nicht, und liess «bis» als losen
 * Text im Absatz stehen («1 bis Erfordert …» gegen Snapshot «1bis Erfordert
 * …»). Fussnoten-Referenzen sind zu diesem Zeitpunkt bereits entfernt
 * (`stripFussnotenRefs`), können den Marker also nicht verfälschen.
 */
const ORDINAL_SUFFIX = 'bis|ter|quater|quinquies|sexies|septies|octies|novies|decies';

function absatzMarkerVon(p: Element): string {
  const teile: string[] = [];
  for (const knoten of Array.from(p.childNodes) as Element[]) {
    if (knoten.nodeType === 1 && knoten.tagName?.toLowerCase() === 'sup') {
      teile.push(normWs(knoten.textContent ?? ''));
      continue;
    }
    // Reiner Whitespace (inkl. &nbsp;) trennt die <sup> voneinander; alles
    // andere ist bereits Fliesstext und beendet den Marker.
    if (knoten.nodeType === 3 && normWs(knoten.textContent ?? '') === '') continue;
    break;
  }
  const roh = teile.join('').replace(/\s+/g, '');
  return new RegExp(`^\\d+(${ORDINAL_SUFFIX})?$`, 'i').test(roh) ? roh : '';
}

// ─── Quelle (Fedlex-HTML) ────────────────────────────────────────────────

/** Entfernt Fussnoten-Referenzmarker (<sup><a href="#fn-...">N</a></sup>) — reines Verweis-Rauschen, kein Normtext. */
function stripFussnotenRefs(el: Element): void {
  const sups = Array.from(el.querySelectorAll('sup'));
  for (const sup of sups) {
    const a = sup.querySelector('a[href^="#fn-"]');
    if (a) sup.remove();
  }
}

function textOf(el: Element | null): string {
  if (!el) return '';
  return normWs(el.textContent ?? '');
}

/**
 * Rendert eine <dl>-Aufzählung (dt=Marke, dd=Text) als eingerückte Zeilen.
 * `dd` trägt seinen Text meist DIREKT (kein Kind-Element) — reines
 * `container.children`-Rekurrieren (wie renderBodyChildren) sähe da NICHTS,
 * darum eigener Pfad über `textContent` mit vorab entfernten Unterlisten
 * (verschachtelte lit./Ziff.-Ebenen wie Art. 33 Abs. 1 lit. g Ziff. 1/2).
 */
function renderDl(dl: Element, tiefe = 0): string[] {
  const zeilen: string[] = [];
  const kinder = Array.from(dl.children);
  for (let i = 0; i < kinder.length; i++) {
    const k = kinder[i];
    if (k.tagName?.toLowerCase() !== 'dt') continue;
    const marke = textOf(k);
    const dd = kinder[i + 1]?.tagName?.toLowerCase() === 'dd' ? kinder[i + 1] : null;
    if (!dd) {
      const nur = itemZeile(tiefe, marke, '');
      if (nur.trim()) zeilen.push(nur);
      continue;
    }
    const ddOhneUnterlisten = dd.cloneNode(true) as Element;
    for (const sub of Array.from(ddOhneUnterlisten.querySelectorAll('dl'))) sub.remove();
    zeilen.push(itemZeile(tiefe, marke, ddOhneUnterlisten.textContent ?? ''));
    const unterlisten = Array.from(dd.children).filter((c) => c.tagName?.toLowerCase() === 'dl');
    for (const sub of unterlisten) zeilen.push(...renderDl(sub, tiefe + 1));
  }
  return zeilen;
}

/** Rendert eine amtliche <table> zeilenweise über `tabellenZeile` (dieselbe Funktion wie beim Snapshot). */
function renderTable(table: Element): string[] {
  const zeilen: string[] = [];
  for (const row of Array.from(table.querySelectorAll('tr'))) {
    const zellen = Array.from(row.querySelectorAll('th,td')).map((z) => z.textContent ?? '');
    const zeile = tabellenZeile(zellen);
    // Eine Kopfzeile ohne jeden Titeltext (reine Layout-Zeile) fällt hier von
    // selbst weg — dieselbe Wache wie beim Snapshot mit leeren `spalten[].titel`.
    if (zeile) zeilen.push(zeile);
  }
  return zeilen;
}

/** Rekursiv: Absatz-<p>, <dl>, <table> und Container in Dokumentreihenfolge rendern. */
function renderBodyChildren(container: Element): string {
  const teile: string[] = [];
  for (const kind of Array.from(container.children)) {
    const tag = kind.tagName?.toLowerCase();
    if (tag === 'p' && !kind.querySelector('table')) {
      const cls = kind.getAttribute('class') ?? '';
      if (cls.includes('footnotes')) continue;
      const marker = cls.includes('absatz') ? absatzMarkerVon(kind) : '';
      const txt = normWs(kind.textContent ?? '');
      const zeile = absatzZeile(marker, txt);
      if (zeile) teile.push(zeile);
    } else if (tag === 'dl') {
      teile.push(...renderDl(kind));
    } else if (tag === 'table') {
      teile.push(...renderTable(kind));
    } else if (tag === 'div' || tag === 'section' || tag === 'p') {
      // `tag === 'p'` erreicht diesen Zweig nur noch für ein <p>, das eine
      // <table> umschliesst (Fedlex schreibt `<p><div class="table">…`, was
      // strenggenommen invalides HTML ist) — dort darf NICHT der textContent
      // genommen werden, sonst kollabiert die Tabelle zu einer Textwurst.
      const cls = kind.getAttribute('class') ?? '';
      if (cls.includes('footnotes')) continue;
      const nested = renderBodyChildren(kind);
      if (nested) teile.push(nested);
    } else {
      const txt = normWs(kind.textContent ?? '');
      if (txt) teile.push(txt);
    }
  }
  return teile.filter(Boolean).join('\n');
}

function renderFussnoten(el: Element | null): string {
  if (!el) return '';
  const zeilen: string[] = [];
  for (const p of Array.from(el.querySelectorAll('p[id^="fn-"]'))) {
    const nr = normWs(p.querySelector('sup a')?.textContent ?? '');
    const klon = p.cloneNode(true) as Element;
    const supA = klon.querySelector('sup');
    if (supA) supA.remove();
    const txt = normWs(klon.textContent ?? '');
    if (txt) zeilen.push(nr ? `${nr}. ${txt}` : txt);
  }
  return zeilen.join('\n');
}

/**
 * Reduziert gepinntes Fedlex-Filestore-HTML (scripts/fedlex-cache.sh) zu
 * Klartext je Artikel. `von`/`bis` (Artikelnummer als Zahl, inklusive) filtert
 * optional auf einen Ausschnitt — Grossauflagen (OR, ZGB) sonst zu gross für
 * eine Gruppe.
 */
export function reduziereQuelleHtml(
  html: string,
  von?: number,
  bis?: number,
): Map<string, ArtikelKlartext> {
  const { document } = parseHTML(html);
  const out = new Map<string, ArtikelKlartext>();
  const artikel = Array.from(document.querySelectorAll('article[id^="art_"]'));
  for (const art of artikel) {
    const id = art.getAttribute('id') ?? '';
    const nummer = id.replace(/^art_/, '');
    const nummerZahl = parseInt(nummer.replace(/[^0-9].*$/, ''), 10);
    if (von !== undefined && !Number.isNaN(nummerZahl) && nummerZahl < von) continue;
    if (bis !== undefined && !Number.isNaN(nummerZahl) && nummerZahl > bis) continue;

    const klon = art.cloneNode(true) as Element;
    stripFussnotenRefs(klon);

    // Label bewusst NUR "Art. N" (ohne amtlichen Randtitel aus <h6>): der
    // Bund-Snapshot führt aktuell KEIN `titel`-Feld (0 von 240 DBG-Einträgen,
    // Stichprobe) — ein Vergleich der Randtitel wäre ein systematischer
    // Scheinfund über JEDEN Artikel hinweg, kein realer Korpus-Fehler (T2-
    // Lehre: keine Harness-Artefakte einstreuen). `div.collapseable` enthält
    // ohnehin nur den Artikelkörper, nicht das <h6>. Die Schreibweise folgt
    // dem Snapshot (`artikelLabelAusId`), nicht dem Anker-Token.
    const label = artikelLabelAusId(nummer);

    const body = klon.querySelector('div.collapseable') ?? klon;
    const fussnotenEl = body.querySelector('div.footnotes');
    const fussnoten = renderFussnoten(fussnotenEl);
    const roherText = renderBodyChildren(body);
    const text = istAufgehoben(roherText) ? AUFGEHOBEN : roherText;

    out.set(nummer, { artikel: nummer, label, text, fussnoten });
  }
  return out;
}

// ─── Snapshot (public/normtext/**.json) ─────────────────────────────────

function renderSnapshotBlock(b: NormSnapshot['bloecke'][number]): string {
  const zeilen: string[] = [];

  // Anhang-Zwischenüberschrift (M13-Annex): erscheint in der Quelle als
  // blosses <h2>–<h6> ohne Absatzmarker, also auch hier als nackte Zeile —
  // ABER ohne frühen `return`. Die alte Fassung kehrte hier sofort zurück und
  // verwarf items/tabelle/mehrspaltig DESSELBEN Blocks; heute trägt kein
  // Snapshot diese Kombination (0 Treffer über public/normtext/**), morgen
  // wäre es ein stiller, unsichtbarer drop.
  if (b.titel) {
    const titelText = normWs(b.text);
    if (titelText) zeilen.push(titelText);
  } else {
    const zeile = absatzZeile(b.absatz ?? '', b.text ?? '');
    if (zeile) zeilen.push(zeile);
  }

  for (const item of b.items ?? []) {
    zeilen.push(itemZeile(item.tiefe ?? 0, item.marke, item.text));
  }
  for (const zeile of b.tabelle ?? []) {
    const z = tabellenZeile([zeile.beschreibung, zeile.betrag]);
    if (z) zeilen.push(z);
  }
  if (b.mehrspaltig) {
    const kopf = b.mehrspaltig.spalten?.map((sp) => sp.titel) ?? b.mehrspaltig.kopf ?? [];
    // Keine Phantom-Kopfzeile: `spalten` mit durchgehend leerem `titel` ist
    // real und häufig (ELG Art. 14, SSV Art. 1/66, VZV Art. 84) — die alte
    // Fassung machte daraus die Zeile "   | ", die in der Quelle nichts
    // entspricht. `tabellenZeile` verwirft sie von selbst.
    const kopfZeile = tabellenZeile(kopf);
    if (kopfZeile) zeilen.push(kopfZeile);
    for (const zeile of b.mehrspaltig.zeilen) {
      const z = tabellenZeile(zeile);
      if (z) zeilen.push(z);
    }
  }
  if (b.verweis) {
    const z = tabellenZeile([b.verweis.etikett, b.verweis.ziffern]);
    if (z) zeilen.push(z);
  }
  return zeilen.filter(Boolean).join('\n');
}

/**
 * Reduziert die Snapshot-Einträge EINES Erlasses zu Klartext je Artikel, im
 * selben Format wie reduziereQuelleHtml. `fussnoten` bleibt immer leer — der
 * Snapshot (src/lib/normtext/typen.ts) führt keinen separaten Fussnoten-Text.
 */
export function reduziereSnapshot(eintraege: NormSnapshot[]): Map<string, ArtikelKlartext> {
  const out = new Map<string, ArtikelKlartext>();
  for (const e of eintraege) {
    const zeilen = e.bloecke.map(renderSnapshotBlock).filter(Boolean);
    const roherText = zeilen.join('\n');
    out.set(e.artikel, {
      artikel: e.artikel,
      label: e.artikelLabel,
      // Aufgehobener Artikel: der Snapshot führt den amtlichen Auslassungs-
      // Platzhalter «…», die Quelle einen leeren Body — beide Seiten auf
      // denselben Klartext normalisieren (sonst garantierter Scheinfund).
      text: istAufgehoben(roherText) ? AUFGEHOBEN : roherText,
      fussnoten: '',
    });
  }
  return out;
}

export function formatiereArtikel(a: ArtikelKlartext): string {
  const teile = [`${a.label}\n${a.text}`];
  if (a.fussnoten) teile.push(`--- Fussnoten (Quelle) ---\n${a.fussnoten}`);
  return teile.join('\n');
}

// ─── Deterministischer Erstfilter ────────────────────────────────────────
//
// Nachbesserung 4.9.2026: die erste Fassung schickte JEDEN Artikel eines
// Erlasses an Gemini und liess das Modell die Abweichung suchen. Das ist
// teuer, langsam (Fahrplan-Timing-Befund: > 600 s je Gruppe bei `high`) und
// verlangt vom Modell genau das, was es nachweislich am schlechtesten kann —
// zeichengenauen Abgleich (AMBV-Pilot: 0 von 5 echten Defekten gefunden).
//
// Umgekehrte Arbeitsteilung: der Vergleich ist DETERMINISTISCH (String-Diff
// über die beiden Reduktionen), Gemini bekommt nur noch die Artikel, bei
// denen der Diff bereits angeschlagen hat, und beantwortet die Frage, die ein
// Diff nicht beantworten kann — WAS die Abweichung bedeutet (drop/leak/
// tabelle/bister/zahl/sonst). Kein Artikel ohne Differenz kostet mehr Tokens.

export interface ZeilenAbweichung {
  artikel: string;
  /** 0-basierte Zeilennummer innerhalb des reduzierten Artikeltexts. */
  zeile: number;
  quelle: string;
  snapshot: string;
}

export interface ArtikelBefund {
  artikel: string;
  /** true, wenn Quelle und Snapshot sich unterscheiden (Label ODER Text). */
  abweichend: boolean;
  labelQuelle: string;
  labelSnapshot: string;
  zeilen: ZeilenAbweichung[];
}

const FEHLT_QUELLE = '[kein Fedlex-Artikel gefunden]';
const FEHLT_SNAPSHOT = '[kein Snapshot-Eintrag]';

/** Sortierschlüssel für Artikel-Token ('5' < '5a' < '5bis' < '6'). */
export function sortiereArtikelSchluessel(a: string, b: string): number {
  return (parseInt(a, 10) || 0) - (parseInt(b, 10) || 0) || a.localeCompare(b);
}

/**
 * Vergleicht beide Reduktionen Artikel für Artikel und Zeile für Zeile.
 * Reine Funktion, kein Modell, kein Netz — das Ergebnis ist der BELEG, an dem
 * jede spätere Gemini-Aussage gemessen wird (§14.7: das Modell liefert eine
 * Deutung, nie den Befund selbst).
 */
export function ermittleAbweichungen(
  quelle: Map<string, ArtikelKlartext>,
  snapshot: Map<string, ArtikelKlartext>,
): ArtikelBefund[] {
  const schluessel = [...new Set([...quelle.keys(), ...snapshot.keys()])].sort(
    sortiereArtikelSchluessel,
  );
  const befunde: ArtikelBefund[] = [];
  for (const k of schluessel) {
    const q = quelle.get(k);
    const s = snapshot.get(k);
    const qText = q?.text ?? FEHLT_QUELLE;
    const sText = s?.text ?? FEHLT_SNAPSHOT;
    const labelQuelle = q?.label ?? '—';
    const labelSnapshot = s?.label ?? '—';
    const zeilen: ZeilenAbweichung[] = [];
    if (qText !== sText) {
      const qz = qText.split('\n');
      const sz = sText.split('\n');
      for (let i = 0; i < Math.max(qz.length, sz.length); i++) {
        if (qz[i] !== sz[i]) {
          zeilen.push({ artikel: k, zeile: i, quelle: qz[i] ?? '', snapshot: sz[i] ?? '' });
        }
      }
    }
    const abweichend = zeilen.length > 0 || labelQuelle !== labelSnapshot;
    befunde.push({ artikel: k, abweichend, labelQuelle, labelSnapshot, zeilen });
  }
  return befunde;
}

/**
 * Die Artikel, die an Gemini gehen: jeder abweichende Artikel plus ein
 * Nachbar auf jeder Seite. Der Kontext ist kein Luxus — ein `drop` sieht in
 * Isolation oft aus wie eine Umnummerierung, und ohne den Nachbarartikel
 * kann das Modell nicht unterscheiden, ob Text FEHLT oder VERSCHOBEN ist.
 */
export function waehleMitKontext(befunde: ArtikelBefund[], kontext = 1): string[] {
  const gewaehlt = new Set<number>();
  befunde.forEach((b, i) => {
    if (!b.abweichend) return;
    for (let d = -kontext; d <= kontext; d++) {
      if (i + d >= 0 && i + d < befunde.length) gewaehlt.add(i + d);
    }
  });
  return [...gewaehlt].sort((a, b) => a - b).map((i) => befunde[i].artikel);
}

// ─── Antwort-Verpackung ──────────────────────────────────────────────────

/**
 * Schält das massgebliche JSON-Objekt aus einer Modellantwort.
 *
 * Zwei Verpackungen kommen real vor (beide am 4.9.2026 gemessen):
 *   - ein ```json-Zaun oder ein Begleitsatz um das Objekt herum;
 *   - MIT `--json-schema` liefert agy ZWEI Objekte hintereinander — erst das
 *     vom Modell formulierte, dann das schema-erzwungene (zusätzlich mit
 *     `toolAction`/`toolSummary` angereichert). Aneinandergehängt ist das
 *     kein gültiges JSON; das LETZTE Objekt ist das massgebliche.
 *
 * Darum: alle Objekte auf oberster Klammerebene sammeln und von hinten das
 * erste zurückgeben, das sich parsen lässt. Bewusst KEIN Reparieren von
 * kaputtem JSON — was auch so nicht parst, bleibt ein Fehlschlag.
 */
export function schaeleJson(roh: string): string | null {
  const text = roh.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
  const kandidaten: string[] = [];
  let tiefe = 0;
  let start = -1;
  let imString = false;
  let escaped = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (imString) {
      if (escaped) escaped = false;
      else if (c === '\\') escaped = true;
      else if (c === '"') imString = false;
      continue;
    }
    if (c === '"') { imString = true; continue; }
    if (c === '{') {
      if (tiefe === 0) start = i;
      tiefe++;
    } else if (c === '}') {
      tiefe--;
      if (tiefe === 0 && start !== -1) {
        kandidaten.push(text.slice(start, i + 1));
        start = -1;
      }
    }
  }
  for (let i = kandidaten.length - 1; i >= 0; i--) {
    try {
      JSON.parse(kandidaten[i]);
      return kandidaten[i];
    } catch { /* nächsten Kandidaten versuchen */ }
  }
  return null;
}
