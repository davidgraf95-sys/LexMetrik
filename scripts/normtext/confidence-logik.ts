/**
 * Confidence-/Treue-Logik für den Gesetzes-Import (3-Tier-Pipeline).
 *
 * Reine, deterministische Prüf-Logik (§2: kein Date.now/Math.random, keine
 * Heuristik mit Zufall) über einen bereits extrahierten Norm-Snapshot. Beantwortet
 * NICHT die juristische Richtigkeit (das bleibt Davids nicht-delegierbare Abnahme,
 * §7/§8), sondern die maschinell prüfbare TREUE der Extraktion zur Quelle:
 *
 *   - Treue-Invarianten je Artikel (leerer Artikel, Fussnoten-Marker im Normtext,
 *     verklebte Tokens, Mojibake/Replacement-Zeichen, Absatz-Monotonie).
 *   - Kreuzdiff-Normalform: normalisiert zwei Volltexte (Struktur-Quelle vs.
 *     amtliches PDF) auf einen vergleichbaren Token-Strom, plus Token-Recall.
 *   - Confidence-Score (Min-orientiert) + harte Vetos → Quarantäne-Entscheid.
 *
 * Zweck (Auftrag David 23.6.2026): den Korpus-Review-Fan-out (1 Agent pro Gesetz)
 * durch maschinelle Vorfilterung ersetzen — der Mensch sieht nur noch die
 * geflaggte Minderheit. Auto-akzeptierte Erlasse bleiben Status «entwurf», NIE
 * «geprüft»/«verified» ohne David (§8). Das Modul MISST Treue, es BEHAUPTET keine
 * Korrektheit.
 */

/** Ein Absatz-/Listen-Block eines Artikels (Spiegel von NormSnapshot.bloecke). */
export interface SnapBlock {
  absatz: string | null;
  text: string;
  items?: Array<{ marke: string; text: string }>;
  tabelle?: Array<{ beschreibung: string; betrag: string }>;
  mehrspaltig?: { kopf?: string[]; zeilen: string[][] };
}

/** Minimaler Artikel-Snapshot, auf dem die Treue-Prüfung arbeitet. */
export interface SnapArtikel {
  /** Artikel-Token ('1', '335_c') — nur für die Fehler-Lokalisierung. */
  artikel: string;
  artikelLabel: string;
  bloecke: SnapBlock[];
}

export type TreueSchwere = 'hart' | 'weich';

export interface TreueFlag {
  /** Artikel-Token, in dem der Befund liegt (oder '' für Erlass-Ebene). */
  artikel: string;
  /** Stabiler Klassen-Schlüssel (für Aggregation/Register bekannter Lücken). */
  klasse:
    | 'leerer-artikel'
    | 'fussnoten-marker-im-text'
    | 'verklebter-token'
    | 'mojibake';
  detail: string;
  schwere: TreueSchwere;
}

/** Ein Block trägt Substanz, wenn er Text, Items oder eine Tabelle hat. */
function blockHatSubstanz(b: SnapBlock): boolean {
  if (b.text.trim() !== '') return true;
  if (b.items && b.items.some((i) => i.text.trim() !== '')) return true;
  if (b.tabelle && b.tabelle.length > 0) return true;
  if (b.mehrspaltig && b.mehrspaltig.zeilen.length > 0) return true;
  return false;
}

/** Sammelt allen sichtbaren Text eines Artikels (Absatz + Items) in einen String. */
function artikelText(a: SnapArtikel): string {
  const teile: string[] = [];
  for (const b of a.bloecke) {
    if (b.text) teile.push(b.text);
    for (const it of b.items ?? []) teile.push(it.text);
    for (const z of b.tabelle ?? []) teile.push(`${z.beschreibung} ${z.betrag}`);
    for (const z of b.mehrspaltig?.zeilen ?? []) teile.push(z.join(' '));
  }
  return teile.join(' ');
}

// Fussnoten-Verweismarker, die NICHT in den Normtext gehören: «[12]» (eckige
// Klammer-Verweis) oder ein an ein Wort geklebter hochgestellter Zähler, der als
// «wort12 » im Plaintext landet, sind redaktionell. Wir erkennen konservativ nur
// die eindeutige Klammerform «[N]» — sie ist nie legitimer Normtext.
const FUSSNOTEN_MARKER = /\[\d{1,3}\]/;

// Replacement-/Mojibake-Indikatoren: U+FFFD (�) oder eine als latin-1/cp-1252
// fehldekodierte UTF-8-Doppelbyte-Sequenz. Das erste Byte erscheint als «Ã»/«Â»
// (bzw. «â» für 3-Byte-Sequenzen), das zweite als Latin-1-Folgezeichen
// (U+0080–U+00BF) ODER als cp-1252-Sonderzeichen (€™Ÿ–—'""… etc.). Beide
// Dekodierungen sind abgedeckt; «Ã»/«Â» gefolgt von einem dieser Zeichen ist in
// sauberem de/fr/it-Normtext praktisch nie legitim (§1: niedrige Falsch-Positiv-
// Rate trotz Veto). Reine «Ã»/«Â» ohne solches Folgezeichen wird NICHT geflaggt.
const MJ_FOLGE =
  '\\u0080-\\u00BF\\u20AC\\u201A\\u0192\\u201E\\u2026\\u2020\\u2021\\u02C6\\u2030\\u0160\\u2039\\u0152\\u017D\\u2018\\u2019\\u201C\\u201D\\u2022\\u2013\\u2014\\u02DC\\u2122\\u0161\\u203A\\u0153\\u017E\\u0178';
const MOJIBAKE = new RegExp(`\\uFFFD|[ÃÂ][${MJ_FOLGE}]|â€`);

/**
 * Treue-Invarianten je Artikel. Liefert alle Befunde (leer = sauber). Rein.
 */
export function pruefeTreue(artikel: SnapArtikel[]): TreueFlag[] {
  const flags: TreueFlag[] = [];
  for (const a of artikel) {
    // (1) Leerer Artikel: kein Block trägt Substanz. HART (fängt die Blank-
    //     Artikel-Klasse der Korpus-Review — eine positiv falsche Rechtsauskunft).
    if (a.bloecke.length === 0 || !a.bloecke.some(blockHatSubstanz)) {
      flags.push({
        artikel: a.artikel,
        klasse: 'leerer-artikel',
        detail: `${a.artikelLabel}: kein substanzieller Block`,
        schwere: 'hart',
      });
      continue; // bei leerem Artikel sind Folgeprüfungen sinnlos
    }
    const text = artikelText(a);
    // (2) Fussnoten-Marker im Normtext (Leak). WEICH.
    if (FUSSNOTEN_MARKER.test(text)) {
      flags.push({
        artikel: a.artikel,
        klasse: 'fussnoten-marker-im-text',
        detail: `${a.artikelLabel}: Verweismarker «${text.match(FUSSNOTEN_MARKER)![0]}» im Text`,
        schwere: 'weich',
      });
    }
    // (3) Mojibake/Replacement-Zeichen. HART (falscher Buchstabe = falsche Norm).
    if (MOJIBAKE.test(text)) {
      flags.push({
        artikel: a.artikel,
        klasse: 'mojibake',
        detail: `${a.artikelLabel}: Replacement-/Mojibake-Zeichen`,
        schwere: 'hart',
      });
    }
    // (4) Verklebter Token: ein «Wort» > 40 Zeichen deutet auf verschmolzene
    //     Spalten/Zahlen (Tarif-Verschmelzung). WEICH. Aber NUR flaggen, wenn der
    //     Token eine Ziffer enthält ODER eine Klein→Gross-Grenze hat (camelCase =
    //     verschmolzene Wörter «…rechtlicheBetriebs…») — denn lange REINE Klein-
    //     Komposita («Grundstückgewinnsteuerveranlagungsverfügung», 43 Z.) sind
    //     legitimer deutscher Normtext und dürfen nicht geflaggt werden (§1, kein
    //     Falsch-Positiv). URLs/Anker ausgenommen.
    const verklebt = text
      .split(/\s+/)
      .find(
        (w) =>
          w.length > 40 &&
          !/^https?:|^#/.test(w) &&
          (/\d/.test(w) || /\p{Ll}\p{Lu}/u.test(w)),
      );
    if (verklebt) {
      flags.push({
        artikel: a.artikel,
        klasse: 'verklebter-token',
        detail: `${a.artikelLabel}: Token «${verklebt.slice(0, 50)}…» (${verklebt.length} Z.)`,
        schwere: 'weich',
      });
    }
    // Hinweis: Eine naive Absatz-Monotonie-Prüfung (1,2,3 lückenlos) ist hier
    // bewusst NICHT enthalten — konsolidiertes Recht hat legitime Lücken durch
    // aufgehobene Absätze; ein Sprung ist kein Extraktionsfehler. Verlorene
    // Absätze fängt der Kreuzdiff gegen das amtliche PDF (Gate C), nicht eine
    // Heuristik mit hoher Falsch-Positiv-Rate (§1: keine falschen Befunde).
  }
  return flags;
}

/**
 * Kreuzdiff-Normalform: reduziert einen Volltext auf einen vergleichbaren
 * Token-Strom — Kleinschreibung, Ligaturen/Soft-Hyphen/NBSP aufgelöst,
 * Tausendertrenner entfernt, Fussnoten-Marker «[N]» raus, Whitespace kollabiert,
 * Satzzeichen entfernt. Layout-/Reihenfolge-invariant: zwei Quellen (Struktur-
 * HTML vs. amtliches PDF) sollen denselben Token-Strom liefern, auch wenn ihr
 * Layout abweicht (§7 «Realität gewinnt»: nur Substanz zählt, nicht Form).
 */
export function normalisiereVolltext(s: string): string[] {
  const norm = s
    // Tausendertrenner ZUERST — VOR NFKC, solange NBSP/schmales NBSP/Thin-Space
    // noch nicht zu regulärem Space normalisiert sind (NFKC würde sie zu U+0020
    // machen, der Trenner-Match ginge verloren — Bug K1). Lookahead statt
    // verbrauchender Zifferngruppe, damit auch Mehrfachgruppen «1'000'000»
    // vollständig zusammengezogen werden (Bug K2).
    .replace(/(\d)['’.\u00A0\u202F\u2009](?=\d{3}(?:\D|$))/g, '$1')
    .replace(/­/g, '') // Soft-Hyphen
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[\u00A0\u202F\u2009]/g, ' ') // verbliebene NBSP/schmale Spaces → Space
    .replace(/\[\d{1,3}\]/g, ' ') // Fussnoten-Marker
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim();
  return norm === '' ? [] : norm.split(' ');
}

/**
 * Token-Recall: Anteil der Quell-Tokens (Multiset), die im Ziel-Token-Strom
 * wiederauftauchen. 1.0 = jeder Quell-Token vorhanden; 0 = nichts. Misst, ob die
 * Extraktion (ziel) den Quelltext (quelle, i.d.R. das amtliche PDF) inhaltlich
 * abdeckt. Reine Mengen-Arithmetik. Leere Quelle → 1 (nichts zu decken).
 */
export function tokenRecall(quelle: string[], ziel: string[]): number {
  if (quelle.length === 0) return 1;
  const verfuegbar = new Map<string, number>();
  for (const t of ziel) verfuegbar.set(t, (verfuegbar.get(t) ?? 0) + 1);
  let getroffen = 0;
  for (const t of quelle) {
    const n = verfuegbar.get(t) ?? 0;
    if (n > 0) {
      getroffen++;
      verfuegbar.set(t, n - 1);
    }
  }
  return getroffen / quelle.length;
}

export interface ConfidenceErgebnis {
  /** [0..1]; >= schwelleAuto darf auto-live (Status entwurf), sonst Quarantäne. */
  score: number;
  /** Harte Befunde, die unabhängig vom Score sofort Quarantäne erzwingen. */
  vetos: string[];
  /** Alle Treue-Flags (hart + weich), für die Review-Queue. */
  flags: TreueFlag[];
}

/**
 * Bündelt Treue-Flags (+ optional einen Kreuzdiff-Recall) zu einem Confidence-
 * Score. Min-orientiert: ein einzelner harter Befund (Veto) drückt den Score auf
 * 0 — gute Durchschnitte dürfen ein katastrophales Einzelsignal nicht überdecken.
 * Weiche Befunde senken den Score graduell. Rein/deterministisch.
 *
 * @param recall optionaler Kreuzdiff-Token-Recall [0..1]; < recallVeto = Veto.
 */
export function bewerteConfidence(
  flags: TreueFlag[],
  recall?: number,
  opt: { recallVeto?: number; weichGewicht?: number } = {},
): ConfidenceErgebnis {
  const recallVeto = opt.recallVeto ?? 0.985;
  const weichGewicht = opt.weichGewicht ?? 0.05;
  const vetos: string[] = [];
  for (const f of flags) {
    if (f.schwere === 'hart') vetos.push(`${f.klasse} (${f.artikel || 'erlass'}): ${f.detail}`);
  }
  if (recall != null && recall < recallVeto) {
    vetos.push(`kreuzdiff-recall ${recall.toFixed(4)} < ${recallVeto}`);
  }
  if (vetos.length > 0) return { score: 0, vetos, flags };
  const weich = flags.filter((f) => f.schwere === 'weich').length;
  const recallTeil = recall ?? 1;
  const score = Math.max(0, Math.min(1, recallTeil - weich * weichGewicht));
  return { score, vetos, flags };
}
