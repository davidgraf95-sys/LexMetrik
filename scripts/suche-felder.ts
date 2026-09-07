// scripts/suche-felder.ts
// QS-BASIS (d) K1 — die EINE Extraktion der Such-Recall-Felder (§5 Single Source).
//
// WARUM DIESE DATEI EXISTIERT. Bis 31.8.2026 lebte die Feld-Extraktion allein in
// scripts/such-index-generieren.ts und speiste nur den STATISCHEN Client-Index.
// Der DB-/Edge-Index (scripts/datenhaltung/fts.ts) indexierte ausschliesslich den
// Artikeltext und fand darum systematisch weniger — still, denn seine Antworten
// waren nie leer, nur schlechter (gemessen: bibliothek/register/
// suche-edge-nullprobe-2026-08-31.md Ziff. 3 — Query «Miete» → OR 253 und OR 267
// mit NULL Treffern, während zehn kantonale Gebührenerlasse die Liste anführten).
//
// Der Kommentar in scripts/datenhaltung/suche-kern.ts:60-69 hatte genau das
// vorhergesagt: «eine Recall-Erweiterung wäre ein bewusster Folge-Schritt für
// BEIDE Indizes gemeinsam». Dies ist dieser Schritt. Beide Indizes rufen ab jetzt
// dieselben Funktionen auf; eine Änderung hier wirkt auf beide oder auf keinen.
//
// REIN + DETERMINISTISCH (§2): keine Zeit, kein Netz, kein Zufall. Import-frei bis
// auf Typen — die Datei wird build-time von zwei Strängen geladen (Generator und
// DB-Bau) und darf keine node:*-Kette in die Vercel-Function-Kompilation ziehen.
// (Sie ist NICHT Teil der api/**-Kette; diese Regel gilt trotzdem vorsorglich,
// weil fts.ts historisch genau daran zerbrochen ist — Vercel-Fix 3.7.2026.)

// ── Datenformen (Snapshot-Block + Struktur-Sidecar) ──────────────────────────────

export interface Bild {
  alt?: string;
  formel?: boolean;
}
export interface Kachel {
  bild?: Bild;
  nummer?: string;
  name?: string;
}
export interface Mehrspaltig {
  spalten?: { titel?: string }[];
  zeilen?: (string | number)[][];
}
export interface Block {
  absatz?: string;
  text?: string;
  items?: { marke?: string; text?: string }[];
  mehrspaltig?: Mehrspaltig;
  tabelle?: Record<string, unknown>[];
  bild?: Bild;
  bildKacheln?: Kachel[];
}
/** Ein Artikel-Eintrag im Struktur-Sidecar public/normtext/struktur/<ebene>/<key>.json. */
export interface StrukturArtikel {
  marginalie?: string[];
  gliederung?: { ebene?: number; label?: string }[];
  fussnoten?: { text?: string }[];
}

// ── Extraktoren (wörtlich aus such-index-generieren.ts übernommen) ───────────────

/** Durchsuchbarer Plaintext eines Artikels (Absätze + Aufzählungen, Whitespace normalisiert).
 *  Wert-gleich mit `bloeckeText` in scripts/datenhaltung/suche-kern.ts — dort auf dem
 *  JSON-String, hier auf den geparsten Blöcken. Die Doppelung ist BEWUSST: suche-kern.ts
 *  trägt die Null-Import-Regel für api/** und darf nichts von hier ziehen. */
export function artikelText(bloecke: Block[]): string {
  const teile: string[] = [];
  for (const b of bloecke) {
    if (b.text) teile.push(b.text);
    for (const it of b.items ?? []) if (it.text) teile.push(it.text);
  }
  return teile.join(' ').replace(/\s+/g, ' ').trim();
}

const GENERISCHES_ALT = /^amtliche abbildung$/i;

/** Nicht-generischer Alt-Text eines Bildes (SSV-Signalname o. Ä.), sonst ''.
 *  Der generische Fallback «Amtliche Abbildung» (271× im Bund) trägt keinen Inhalt
 *  und wird verworfen (§8: kein Suchrauschen). */
export function bildAlt(b?: Bild): string {
  const alt = (b?.alt ?? '').trim();
  return alt && !GENERISCHES_ALT.test(alt) ? alt : '';
}

/** Tabellen-/Struktur-Tier eines Artikels: Tabellenzellen (mehrspaltig-Spaltentitel
 *  + Zeilen, Füllpunkt-`tabelle`), Bild-Alt-Texte (SSV-Signalnamen; ohne den
 *  generischen Platzhalter) und Kachel-Beschriftungen.
 *  Ein Rang UNTER Marginalie/Gliederung, ÜBER Fussnote (Feld-Gewichtung S4). */
export function tabellenText(bloecke: Block[]): string {
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
export function fussnotenText(fussnoten: { text?: string }[]): string {
  const teile: string[] = [];
  for (const fn of fussnoten) {
    // Tags raus, Fedlex-Entities dekodieren; die \s+-Normalisierung unten
    // fasst nbsp (von \s erfasst) mit ein.
    const t = (fn.text ?? '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>');
    if (t.trim()) teile.push(t);
  }
  return teile.join(' ').replace(/\s+/g, ' ').trim();
}

/** Enumerator-Präfix eines Randtitels entfernen («G. Verjährung» → «Verjährung»,
 *  «1. Zehn Jahre» → «Zehn Jahre», «a. Grundsatz» → «Grundsatz»). Deterministisch;
 *  reine Text-Säuberung, damit die Buchstaben-/Ziffern-Zähler nicht als Suchrauschen
 *  in den Index geraten. */
export function ohneEnumerator(s: string): string {
  return s.replace(/^\s*(?:[0-9]+|[IVXLCDMivxlcdm]+|[A-Za-z])[.)]\s+/, '').trim();
}

/** Labels entdoppeln + säubern (Enumerator weg, Whitespace normalisiert), in
 *  stabiler Reihenfolge zu einem Text joinen. */
export function labelText(rohe: (string | undefined)[]): string {
  const teile: string[] = [];
  const sehen = new Set<string>();
  for (const roh of rohe) {
    const s = ohneEnumerator((roh ?? '').replace(/\s+/g, ' ').trim());
    if (s && !sehen.has(s.toLowerCase())) {
      sehen.add(s.toLowerCase());
      teile.push(s);
    }
  }
  return teile.join(' · ');
}

// ── Das gemeinsame Ergebnis: die fünf Recall-Felder eines Artikels ───────────────

/**
 * Die fünf Recall-Felder NEBEN dem Artikeltext, in der Feld-Gewichtung t > m > n > g > tb > f.
 *
 * - `m`  primäre (oberste) Marginalie = Hauptthema des Artikels
 * - `n`  nachrangige Randtitel-Stufen
 * - `g`  Gliederung (Titel-/Abschnitts-Pfad)
 * - `tb` Tabellen-/Struktur-Tier + `grundlage`-Delegationsnorm — RECALL-only
 * - `f`  Fussnoten-Body — RECALL-only
 *
 * m/n/g werden GETRENNT geführt (S4): trifft die Query die primäre Marginalie ODER den
 * Gliederungs-Titel, ist der Artikel dem Thema GEWIDMET (OR 127 «Verjährung», OR 492 im
 * Titel «Die Bürgschaft»); trifft sie nur eine nachrangige Marginalie, NENNT der Artikel
 * das Thema bloss (OR 121 «Verrechnung … Bei Bürgschaft»). tb/f tragen keinen topischen
 * Boost — eine Fussnoten- oder Tabellen-Nennung widmet den Artikel dem Thema nicht.
 */
export interface RecallFelder {
  m: string;
  n: string;
  g: string;
  tb: string;
  f: string;
}

/**
 * Baut die fünf Recall-Felder aus den Artikel-Blöcken, dem Struktur-Sidecar-Eintrag
 * und der `grundlage`-Delegationsnorm.
 *
 * FEHLENDER SIDECAR IST KEIN FEHLER (§8): 38 kantonale Erlasse (2263 Artikel, 4.03 %
 * des Bestands — Messung K0) führen keine Strukturdatei. Für sie bleiben m/n/g/f leer,
 * genau wie im statischen Index, der den Lesefehler still auffängt
 * (such-index-generieren.ts:212). Ein leeres Feld ist ehrlich; ein geratenes wäre es nicht.
 */
export function baueRecallFelder(
  bloecke: Block[],
  struktur: StrukturArtikel | undefined,
  grundlage: string | null | undefined,
): RecallFelder {
  const marg = struktur?.marginalie ?? [];
  const tabellen = tabellenText(bloecke);
  const delegationsnorm = (grundlage ?? '').replace(/\s+/g, ' ').trim();
  return {
    m: labelText(marg.slice(0, 1)),
    n: labelText(marg.slice(1)),
    g: labelText((struktur?.gliederung ?? []).map((x) => x.label)),
    tb: [tabellen, delegationsnorm].filter(Boolean).join(' '),
    f: fussnotenText(struktur?.fussnoten ?? []),
  };
}
