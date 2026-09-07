/**
 * scripts/normtext/zh-tor-regeln.ts — die REINEN Regeln des ZH-Vollständigkeits-
 * Tors: Snapshot-Seite auslesen, Mengen und Folgen vergleichen.
 *
 * Warum ein eigenes Modul: `check-zh-vollstaendigkeit.ts` ist ein Skript mit
 * Netz, FS und `process.exit` — nichts davon lässt sich in einem Unit-Test
 * bedienen. Die Entscheidungen (was gilt als Trennstrich-Ende? wann ist ein
 * Zusatz-Eintrag erlaubt? wann ist eine Zahlenfolge in Ordnung?) liegen darum
 * hier, rein und deterministisch (§2) — und werden in
 * `src/tests/zh-tor-regeln.test.ts` je einmal ROT gezeigt (§6.7).
 */

import type { RegionMass } from './zh-zweitlesung.ts';

// ─────────────────────────────────────────────────────────────────────────────
// Snapshot-Seite
// ─────────────────────────────────────────────────────────────────────────────

export interface TorBlock {
  absatz?: unknown;
  text?: unknown;
  items?: Array<{ marke?: unknown; text?: unknown }>;
  mehrspaltig?: {
    zeilen?: unknown[][];
    spalten?: Array<{ titel?: unknown }>;
    kopf?: unknown[];
  };
  verweis?: { etikett?: unknown; ziffern?: unknown };
}
export interface TorEintrag {
  artikel?: unknown;
  artikelLabel?: unknown;
  quelleUrl?: unknown;
  bloecke?: TorBlock[];
}

/**
 * Der DEKLARIERTE Platzhalter für eine aufgehobene Bestimmung, Ziffer oder
 * lit. Er steht so in KEINEM PDF — die Zürcher Sammlung druckt den nackten Kopf
 * und belegt die Aufhebung in der amtlichen Fussnote. Das ist eine bewusste
 * Haus-Konvention (gleiche Schreibweise wie im Bund-Korpus aus Fedlex), damit
 * die Zählung im Lese-View lückenlos bleibt. Jede Messung gegen das PDF muss
 * ihn darum herausrechnen, sonst meldet sie eine Erfindung, wo eine Deklaration
 * steht.
 */
export const PLATZHALTER = 'Aufgehoben';

/** Jede Zeichenkette, die im Snapshot Normtext trägt — Blocktext, items,
 *  mehrspaltig-Zellen UND die Zellen der Verweis-Spalte. */
export function* snapshotTexte(
  eintraege: TorEintrag[],
): Generator<{ label: string; text: string }> {
  for (const e of eintraege) {
    const label = String(e.artikelLabel ?? e.artikel ?? '?');
    for (const b of e.bloecke ?? []) {
      if (typeof b.text === 'string') yield { label, text: b.text };
      for (const i of b.items ?? []) {
        if (typeof i.text === 'string') yield { label, text: i.text };
      }
      for (const zeile of b.mehrspaltig?.zeilen ?? []) {
        for (const zelle of zeile) {
          if (typeof zelle === 'string') yield { label: `${label} (Tabelle)`, text: zelle };
        }
      }
      if (typeof b.verweis?.ziffern === 'string') {
        yield { label: `${label} (Verweis)`, text: b.verweis.ziffern };
      }
    }
  }
}

/**
 * Zahlenfolge und Zeichenzahl EINES Eintrags, in Lesereihenfolge — das
 * Gegenstück zu `RegionMass` der Zweitlesung.
 *
 * Der Platzhalter «Aufgehoben» zählt NICHT mit (s. PLATZHALTER); die
 * item-MARKE dagegen schon, weil sie im PDF als «5.» am Zeilenanfang steht.
 */
export function eintragMass(bloecke: TorBlock[]): RegionMass {
  const zahlen: string[] = [];
  let zeichen = 0;
  const nimm = (t: unknown): void => {
    if (typeof t !== 'string' || t === PLATZHALTER) return;
    for (const z of t.match(/\d+/g) ?? []) zahlen.push(z);
    zeichen += t.replace(/[\s­‐‑-]/g, '').length;
  };
  for (const b of bloecke) {
    nimm(b.text);
    for (const i of b.items ?? []) {
      nimm(i.marke);
      nimm(i.text);
    }
    for (const sp of b.mehrspaltig?.spalten ?? []) nimm(sp.titel);
    for (const k of b.mehrspaltig?.kopf ?? []) nimm(k);
    for (const zeile of b.mehrspaltig?.zeilen ?? []) for (const z of zeile) nimm(z);
  }
  return { zahlen, zeichen };
}

// ─────────────────────────────────────────────────────────────────────────────
// Prüfung 9 — Einheiten-Exponenten je § (Befund B1, Fix-Runde 4)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Einheiten-Exponent-Token eines Snapshot-Eintrags: jedes «m²»/«m³»/«cm²»/… im
 * Normtext, als Vergleichs-Token («m2», «cm3») in Lesereihenfolge.
 *
 * WOZU: Der Adapter verwarf die hochgestellten Einheiten-Exponenten als
 * Fussnoten-Verweise («1000 m²» → «1000 m») — und KEINE der Prüfungen 1–8 sah
 * es: ²/³ ist keine \d-Ziffer (7/7b blind), ein Zeichen liegt weit über der
 * 7c-Untergrenze. Prüfung 9 hält die Exponenten, die die Zweitlesung
 * UNABHÄNGIG erhebt (`einheitenExponenten`), je § EXAKT gegen den Snapshot —
 * beidseitig: ein fehlender Exponent ist Textverlust, ein zusätzlicher eine
 * Erfindung.
 */
export const EINHEIT_EXPONENT_SNAPSHOT = /(mm|cm|dm|km|m)([²³])/g;

export function exponentTokens(bloecke: TorBlock[]): string[] {
  const raus: string[] = [];
  const nimm = (t: unknown): void => {
    if (typeof t !== 'string') return;
    for (const m of t.matchAll(EINHEIT_EXPONENT_SNAPSHOT)) {
      raus.push(`${m[1]}${m[2] === '²' ? '2' : '3'}`);
    }
  };
  for (const b of bloecke) {
    nimm(b.text);
    for (const i of b.items ?? []) nimm(i.text);
    for (const zeile of b.mehrspaltig?.zeilen ?? []) for (const z of zeile) nimm(z);
  }
  return raus;
}

// ─────────────────────────────────────────────────────────────────────────────
// Prüfung 3 — Trennstrich-Enden (M9b/M9c)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Ein Block/item, dessen Text auf einem TRENNSTRICH endet, ist mitten im Wort
 * abgeschnitten.
 *
 * VARIANTEN (Härtung 2, Befunde M9b/M9c): Das alte Muster kannte nur
 * `\p{L}-$`, also Buchstabe + ASCII-Bindestrich. Damit rutschten zwei
 * Kappungs-Formen durch:
 *   M9b  der nicht umbrechende Bindestrich U+2011 («Rechts‑»),
 *   M9c  die Kappung nach einer ZIFFER («… gemäss Ziffer 12-»).
 * Jetzt: Buchstabe ODER Ziffer, gefolgt von einem der vier Trennstrich-
 * Codepoints.
 *
 * NICHT dabei ist der GEDANKENSTRICH U+2013 «–»: «Fr. 10.–» und «65– 250» sind
 * gültige Schweizer Betragsschreibweisen und stehen so im PDF (§1 — ein
 * Wächter, der korrekten Wortlaut beanstandet, wird abgeschaltet statt
 * geduldet).
 */
export const TRENNSTRICH_ENDE = /[\p{L}\p{N}][-‐‑­]$/u;

export function trennstrichEnden(eintraege: TorEintrag[]): string[] {
  const treffer: string[] = [];
  const endet = (t: unknown): boolean =>
    typeof t === 'string' && TRENNSTRICH_ENDE.test(t.trim());
  for (const e of eintraege) {
    const label = String(e.artikelLabel ?? e.artikel ?? '?');
    for (const b of e.bloecke ?? []) {
      if (endet(b.text)) treffer.push(label);
      for (const i of b.items ?? []) if (endet(i.text)) treffer.push(`${label} lit.`);
      for (const zeile of b.mehrspaltig?.zeilen ?? []) {
        for (const z of zeile) if (endet(z)) treffer.push(`${label} (Tabelle)`);
      }
    }
  }
  return treffer;
}

// ─────────────────────────────────────────────────────────────────────────────
// Prüfung 1 — Kopf-Mengen beidseitig (M14)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Ist ein Snapshot-Eintrag der DEKLARIERTE Platzhalter einer aufgehobenen
 * Bestimmung — und nichts sonst?
 *
 * WOZU (Befund M14, Erfindungs-Klasse): Innerhalb einer genannten Sammel-Spanne
 * («§§ 74–80 d.») darf der Snapshot mehr Einträge führen, als die bewusst
 * konservative Zweitlesung auszählt — der Adapter füllt die Spanne auf. Diese
 * Nachsicht galt bisher für JEDEN Eintrag in der Spanne. Ein erfundener
 * «§ 77 b» MIT WORTLAUT ging damit durch, obwohl das PDF ihn nicht kennt.
 * Nachsicht gibt es jetzt nur noch für den Platzhalter selbst: was Text trägt,
 * muss einen Kopf im PDF haben.
 */
export function istPlatzhalterEintrag(e: TorEintrag): boolean {
  const b = e.bloecke ?? [];
  return (
    b.length === 1 &&
    b[0].text === PLATZHALTER &&
    (b[0].items?.length ?? 0) === 0 &&
    b[0].mehrspaltig === undefined
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Prüfung 7b — Zahlenfolge je §-Region (M6b/M6c/M6d)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * DEKLARIERTE Ausnahmen der Zahlenfolge-Prüfung: Schlüssel «ZH-<nr>/<token>»,
 * Wert = die Zahl der Zahlen, die der Snapshot MEHR trägt als die
 * PDF-Region.
 *
 * Alle sieben stammen aus der bewussten Konservativität der Zweitlesung, nicht
 * aus einem Snapshot-Mangel — sie lässt eine Zeile aus, die Normtext ist:
 *   ZH-175.2 § 42 / § 44 · ZH-323.1 § 4  verschachtelte Ziffern-Aufzählungen,
 *       deren Zeilen die Überschrifts-Gestalt tragen («1. Anordnungen in
 *       personalrechtlichen und administrativen Be-»);
 *   ZH-281.1 § 25 · ZH-631.1 § 216       dasselbe, je eine Zeile;
 *   ZH-331 § 17                          «Vorbehalten bleiben §§ 23–23 b und
 *       35 b.» hat die Gestalt eines Sammel-Aufhebungskopfs und wird von der
 *       Zweitlesung als solcher behandelt (der Adapter erkennt am Kopf-Einzug,
 *       dass es ein Satzende ist);
 *   ZH-631.1 § 20                        Regionsgrenze um eine Zeile versetzt.
 *
 * Die Werte sind EXAKT, nicht mit Reserve: wächst eine Abweichung, wird das Tor
 * rot — die Ausnahme deckt genau das gemessene Delta und keinen Millimeter mehr
 * (§6.7 — eine Ausnahme mit Polster ist eine Abschaltung mit Umweg).
 */
export const ZAHLENFOLGE_AUSNAHMEN: Record<string, number> = {
  'ZH-175.2/42': 3,
  'ZH-175.2/44': 3,
  'ZH-281.1/25': 1,
  'ZH-323.1/4': 8,
  'ZH-331/17': 3,
  'ZH-631.1/20': 1,
  'ZH-631.1/216': 1,
};

/** Ist `teil` eine Teilfolge (Reihenfolge gewahrt) von `ganz`? */
export function istTeilfolge(teil: string[], ganz: string[]): boolean {
  let i = 0;
  for (const g of ganz) {
    if (i < teil.length && teil[i] === g) i++;
  }
  return i === teil.length;
}

export interface ZahlenBefund {
  /** Zahlen, die im PDF stehen, im Snapshot aber fehlen oder umgestellt sind. */
  folgeGebrochen: boolean;
  /** Wie viele Zahlen der Snapshot MEHR trägt als das PDF. */
  zusatz: number;
}

/**
 * Der Werte-Wächter je Region, BEIDSEITIG:
 *
 *  (a) Die Zahlenfolge des PDF muss eine TEILFOLGE der Snapshot-Folge sein.
 *      Das bindet jeden Quell-Wert an seine STELLE: ein Tausch zweier Beträge
 *      innerhalb derselben Tarif-Tabelle (M6b «1 050» ↔ «3 150») lässt die
 *      Multimenge unverändert, zerstört aber die Reihenfolge; ein Ersatz
 *      (M6c 14 % → 8 %, M6d Staffelgrenze) lässt die Quell-Zahl ganz
 *      verschwinden.
 *  (b) Der Snapshot darf nicht mehr Zahlen tragen als das PDF — ausser der
 *      deklarierten Ausnahme dieses §.
 */
export function pruefeZahlen(
  snapshot: string[],
  region: string[],
  erlaubterZusatz: number,
): ZahlenBefund {
  const zusatz = Math.max(snapshot.length - region.length, 0);
  return {
    folgeGebrochen: !istTeilfolge(region, snapshot),
    zusatz: zusatz > erlaubterZusatz ? zusatz : 0,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Prüfung 7c — Zeichen-Deckungsgrad je §-Region (M3/M11/M12)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Untere Schranke des Zeichen-Deckungsgrads (Snapshot-Zeichen / PDF-Region-
 * Zeichen), Leerraum und Trennstriche auf beiden Seiten herausgerechnet.
 *
 * WARUM NUR NACH UNTEN: die drei Mutationsklassen, die diese Prüfung fangen
 * soll, ENTFERNEN Text — ein gelöschter Absatz (M3), ein leergeräumtes
 * `bloecke: []` (M11), eine Kappung ohne Trennstrich (M12). Nach oben misst
 * die Zahlenfolge (7b) und der Gliederungstitel-Wächter (6).
 *
 * SCHWELLE, am geheilten Bestand erhoben (2441 §-Regionen, alle 24 Erlasse,
 * offline aus dem Roh-PDF-Cache):
 *     min 95.9 % · p01 98.3 % · p05 99.0 % · Median 100.0 %
 * Der schlechteste Wert liegt also 4 Punkte über der Schwelle 90 %. Die
 * verbleibende Differenz zu 100 % ist die bewusste Konservativität der
 * Zweitlesung (ausgelassene Überschriften-Zeilen), nicht fehlender Snapshot.
 *
 * Was 90 % fängt: `bloecke: []` (0 %), jeder gelöschte Absatz ab einem Zehntel
 * der Bestimmung, jede Kappung ab einem Zehntel. Was 90 % NICHT fängt: der
 * Verlust eines sehr kurzen Absatzes in einer sehr langen Bestimmung — dort
 * greift die Zahlenfolge, sobald der Absatz eine Zahl trägt.
 */
export const ZEICHEN_MIN = 0.9;

/** Regionen ohne Zeichen (nackter, aufgehobener Kopf) sind von 7c ausgenommen:
 *  dort steht im Snapshot der Platzhalter und im PDF nichts. */
export function zeichenQuote(snapshotZeichen: number, regionZeichen: number): number | null {
  if (regionZeichen === 0) return null;
  return snapshotZeichen / regionZeichen;
}
