// scripts/entstehung/synopse.ts
// E5 «Synopse alt/neu am Artikel» (FAHRPLAN-MATERIALIEN-VERZAHNUNG §11.4/§11.6):
// REINER Teil — SPARQL-Abfrageform, AKN-XML → Artikel, Normalisierung, Diff, kanonische
// Serialisierung. Kein Fetch, kein Schreiben, kein Date.now (§2); der Netz-/Schreibteil
// liegt in `synopse-run.ts`, die Messung in `synopse-messung.ts`.
//
// REGELN (Skill `scraping-swiss-official-sources`, Recherche R2 6.9.2026):
//  · Struktur IMMER aus dem AKN-Baum (`<article eId>`, `<paragraph>`, `<item>`, `<num>`),
//    nie aus dem Rendering. AKN-XML ist Diff-Eingabe, HTML wäre Anzeige-Eingabe.
//  · Die Manifestations-URL kommt aus `jolux:isExemplifiedBy` und wird NIE konstruiert.
//    Die Alias-URL ohne `-N` ist bei cc-Konsolidierungen ein PHANTOM: für OR-Stand
//    1.7.2021 liefert sie eine DOCX-Erstkonversion, die in 1187 von 1528 gemeinsamen
//    eIds inhaltlich abweicht (R2 §6 d).
//  · `jolux:dateApplicability` ist der amtliche Stand; MIN()/MAX() am Endpunkt liefern
//    falsche Extrema (R2 §1) ⇒ roh ziehen, lokal sortieren.
//  · Fussnoten-Apparat (`<authorialNote>`) raus, `<sup>`-INHALT bleibt: «c<sup>ter</sup>»
//    muss «cter» ergeben, nie fünfmal «c» (R2 §2 Falle A).
//
// NORMALISIERUNG nur fürs MATCHING, nie für Speicherung oder den Roh-Hash (Muster
// law.soufien.lu, Bibliothek `soufien-lex.md`): der gespeicherte Wortlaut bleibt der
// amtliche, die normalisierte Form entscheidet bloss «geändert ja/nein». Ohne sie melden
// 36 % der stabilen eIds eine Änderung, die keine ist (R2 §3, gemessen an OR 2021→2024).
import { createHash } from 'node:crypto';
import type { SparqlBinding } from '../fedlex-sparql.ts';
import { ankerNachToken } from '../materialien/fedlex-anker.ts';
import {
  NORM_PROFIL, SYNOPSE_FENSTER_AB,
  type SynopseBlock, type SynopseShard,
} from '../../src/lib/entstehung/synopse.ts';

const DEU = '<http://publications.europa.eu/resource/authority/language/DEU>';
const XML_FORMAT = '<https://fedlex.data.admin.ch/vocabulary/user-format/xml>';

// ── SPARQL ────────────────────────────────────────────────────────────────────

/**
 * Alle Konsolidierungen einer Menge von cc-Abstrakta mit ihrer deutschen AKN-XML-
 * Manifestation. `isExemplifiedBy` ist primär, `isExemplifiedByPrivate` (Host-Tausch)
 * der Rückfall — einzelne Manifestationen tragen KEINE `isExemplifiedBy` (R2 §1), und
 * ein fehlender OPTIONAL-Zweig liesse Stände still verschwinden.
 */
export function baueStaendeQuery(valuesInline: string): string {
  return `PREFIX jolux: <http://data.legilux.public.lu/resource/ontology/jolux#>
SELECT ?abstract ?datum ?url ?priv WHERE {
  VALUES ?abstract { ${valuesInline} }
  ?cons jolux:isMemberOf ?abstract ; jolux:dateApplicability ?datum .
  ?cons jolux:isRealizedBy ?expr .
  ?expr jolux:language ${DEU} ; jolux:isEmbodiedBy ?manif .
  ?manif jolux:userFormat ${XML_FORMAT} .
  OPTIONAL { ?manif jolux:isExemplifiedBy ?url . }
  OPTIONAL { ?manif jolux:isExemplifiedByPrivate ?priv . }
}`;
}

/** Private Intranet-URL → öffentliche Filestore-URL (Host-Tausch, wie E2). */
export function oeffentlicheUrl(priv: string): string {
  return priv.replace('https://intranet.fedlex.admin.ch/casematesbo/', 'https://fedlex.data.admin.ch/');
}

/** Ein Stand vor dem Abruf: amtliches Datum + aufgelöste XML-URL. */
export interface StandKandidat { datum: string; xmlUrl: string; }

/**
 * REIN: Bindings → je Abstract die nach Datum sortierten Stände AB `fensterAb`.
 * Mehrere Manifestationen zum selben Stand (mehrere `-N`-Generationen) ⇒ die
 * LEXIKOGRAPHISCH GRÖSSTE `-N` gewinnt deterministisch: Fedlex erzeugt Artefakte neu,
 * die jüngste Generation ist die massgebliche (R2 §6 d). Nie die Alias-URL ohne `-N`.
 */
export function baueStaende(
  bindings: SparqlBinding[],
  fensterAb: string = SYNOPSE_FENSTER_AB,
): Map<string, StandKandidat[]> {
  const roh = new Map<string, Map<string, Set<string>>>();
  for (const b of bindings) {
    const abstract = b.abstract?.value;
    const datum = b.datum?.value?.slice(0, 10);
    if (!abstract || !datum || !/^\d{4}-\d{2}-\d{2}$/.test(datum)) continue;
    if (datum < fensterAb) continue;
    const url = b.url?.value ?? (b.priv?.value ? oeffentlicheUrl(b.priv.value) : undefined);
    if (!url) continue;
    if (!roh.has(abstract)) roh.set(abstract, new Map());
    const je = roh.get(abstract)!;
    if (!je.has(datum)) je.set(datum, new Set());
    je.get(datum)!.add(url);
  }
  const out = new Map<string, StandKandidat[]>();
  for (const [abstract, je] of roh) {
    const liste: StandKandidat[] = [];
    for (const [datum, urls] of je) {
      liste.push({ datum, xmlUrl: waehleManifestation([...urls]) });
    }
    liste.sort((a, b) => (a.datum < b.datum ? -1 : a.datum > b.datum ? 1 : 0));
    out.set(abstract, liste);
  }
  return out;
}

/** Deterministische Wahl unter mehreren Manifestations-URLs desselben Stands. */
export function waehleManifestation(urls: readonly string[]): string {
  const mitN = urls
    .map((u) => ({ u, n: Number(/-xml-(\d+)\.xml$/.exec(u)?.[1] ?? -1) }))
    .sort((a, b) => (a.n !== b.n ? b.n - a.n : a.u < b.u ? -1 : 1));
  return mitN[0].u;
}

/** Live-Link auf die amtliche Fassung EINES Stands (§7c) — für Menschen, nie zum Parsen. */
export function liveUrlFuerStand(eliKurz: string, datum: string): string {
  return `https://www.fedlex.admin.ch/eli/${eliKurz}/${datum.replace(/-/g, '')}/de`;
}

/** «https://www.fedlex.admin.ch/eli/cc/2010/262/de» → «cc/2010/262». */
export function eliKurzAusUrl(u: string): string | null {
  const m = /\/eli\/(cc\/[^/]+\/[^/]+(?:\/[^/]+)?)(?:\/(?:de|fr|it))?(?:[/#?]|$)/.exec(u);
  if (!m) return null;
  return m[1].replace(/\/(?:de|fr|it)$/, '');
}

/** Abstract-URI des Erlasses aus der ELI-Kurzform. */
export function abstractUri(eliKurz: string): string {
  return `https://fedlex.data.admin.ch/eli/${eliKurz}`;
}

// ── AKN-XML → Artikel ─────────────────────────────────────────────────────────

/** Ein Artikel eines Stands, wie er aus dem AKN-Baum kommt. */
export interface ArtikelFassung {
  eId: string;
  label: string;
  /** Sachüberschrift; leerer String = keine. */
  ueberschrift: string;
  bloecke: SynopseBlock[];
  /** Das rohe innere XML — Eingabe des UNNORMALISIERTEN Vergleichs (Mess-Referenz). */
  roh: string;
}

const ARTIKEL_RE = /<article\b[^>]*\beId="([^"]+)"[^>]*>([\s\S]*?)<\/article>/g;

/**
 * REIN: AKN-XML → Artikel je eId. Erfasst werden ALLE `<article eId=…>` des Dokuments,
 * auch die in `<attachment>`/`<doc name="annex">` (Anhänge sind eigene Dokument-Wurzeln;
 * ein Zähl-Tor allein auf `<body>` übersähe sie — Skill `scraping-swiss-official-sources`).
 * Aufgehobene Artikel bleiben als «Aufgehoben»-Platzhalter erhalten, ihre eId wird NIE
 * fallengelassen.
 */
export function extrahiereArtikel(xml: string): Map<string, ArtikelFassung> {
  const out = new Map<string, ArtikelFassung>();
  ARTIKEL_RE.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = ARTIKEL_RE.exec(xml)) !== null) {
    const eId = m[1];
    const inner = m[2];
    if (out.has(eId)) continue; // Doppel-eId (Mantel-Anhang): erster Treffer gewinnt, nie raten.
    out.set(eId, {
      eId,
      label: reinerText(ersterTag(inner, 'num') ?? ''),
      ueberschrift: reinerText(ersterTag(inner, 'heading') ?? ''),
      bloecke: zerlegeBloecke(inner),
      roh: inner,
    });
  }
  return out;
}

/** Inhalt des ERSTEN Tags `name` auf oberster Ebene des Fragments (ohne Rekursionsbedarf). */
function ersterTag(fragment: string, name: string): string | null {
  const re = new RegExp(`<${name}\\b[^>]*>([\\s\\S]*?)</${name}>`);
  return re.exec(fragment)?.[1] ?? null;
}

/**
 * Artikel-Innenraum → flache Blockliste (Absatz / Listenpunkt). Die Etiketten sind die
 * literalen `<num>` des Baums; zusammengesetzt wird nie eines (ein erfundenes «1 a.»
 * wäre keine amtliche Schreibweise mehr).
 */
export function zerlegeBloecke(inner: string): SynopseBlock[] {
  const out: SynopseBlock[] = [];
  const paras = [...inner.matchAll(/<paragraph\b[^>]*>([\s\S]*?)<\/paragraph>/g)];
  if (paras.length === 0) {
    // Artikel ohne `<paragraph>` (Einzelsatz-Artikel, Platzhalter «Aufgehoben»):
    // der Artikelkörper ohne `<num>`/`<heading>` ist EIN Block.
    const koerper = inner
      .replace(/<num\b[^>]*>[\s\S]*?<\/num>/, '')
      .replace(/<heading\b[^>]*>[\s\S]*?<\/heading>/, '');
    const t = reinerText(koerper);
    if (t) out.push(['', '', t]);
    return out;
  }
  for (const p of paras) {
    const koerper = p[1];
    const absatz = reinerText(ersterTag(koerper, 'num') ?? '');
    const ohneNum = koerper.replace(/<num\b[^>]*>[\s\S]*?<\/num>/, '');
    const items = [...ohneNum.matchAll(/<item\b[^>]*>([\s\S]*?)<\/item>/g)];
    if (items.length === 0) {
      const t = reinerText(ohneNum);
      if (t) out.push([absatz, '', t]);
      continue;
    }
    // Listeneinleitung («Dieses Gesetz regelt … für:») trägt das Absatz-Etikett.
    const intro = reinerText(ersterTag(ohneNum, 'listIntroduction') ?? '');
    if (intro) out.push([absatz, '', intro]);
    for (const it of items) {
      const num = reinerText(ersterTag(it[1], 'num') ?? '');
      const t = reinerText(it[1].replace(/<num\b[^>]*>[\s\S]*?<\/num>/, ''));
      if (t) out.push([absatz, num, t]);
    }
  }
  return out;
}

/**
 * Markup weg, Entities aufgelöst, ASCII-Leerraum kollabiert — das Zitat bleibt Zitat.
 * `<authorialNote>` (Fussnoten-Apparat) fällt VOLLSTÄNDIG weg; Inline-Auszeichnung
 * verschwindet SPURLOS (sonst wird «c<sup>ter</sup>» zu «c ter»), Block-Auszeichnung
 * trennt mit einem Leerzeichen. U+00A0 bleibt U+00A0 — das geschützte Leerzeichen in
 * «Art. 16c Abs. 3» ist Teil der amtlichen Schreibweise, eine ASCII-Faltung wäre eine
 * stille Textänderung (Skill `scraping-swiss-official-sources`, Typografie-Falle).
 */
export function reinerText(s: string): string {
  return s
    .replace(/<authorialNote\b[^>]*>[\s\S]*?<\/authorialNote>/g, '')
    // Fedlex-Migrations-Platzhalter MITSAMT Inhalt: `<placeholder fedlex:message=
    // "E40S10-TAB">[tab]</placeholder>` ist ein Layout-Marker der Konversion, kein
    // Wortlaut — er erscheint in einer Artefakt-Generation und in der nächsten nicht
    // mehr (gemessen E5.0: 592 Vorkommen, AVIV Art. 120a Bst. b). Einziger belegter
    // Platzhalter-Typ im Korpus; ein anderer `fedlex:message` wäre unbekannt und
    // bliebe deshalb absichtlich sichtbar, statt still zu verschwinden.
    .replace(/<placeholder\b[^>]*fedlex:message="E40S10-TAB"[^>]*>[\s\S]*?<\/placeholder>/g, '')
    .replace(/<\/?(?:b|i|em|strong|sup|sub|span|a|abbr|small|u|inline|ref)\b[^>]*>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, d: string) => String.fromCodePoint(Number(d)))
    .replace(/&#x([0-9a-f]+);/gi, (_, h: string) => String.fromCodePoint(Number.parseInt(h, 16)))
    .replace(/[ \t\r\n]+/g, ' ')
    .trim();
}

/** Der gespeicherte Wortlaut eines Artikels als ein String (Anzeige-/Mass-Eingabe). */
export function wortlaut(bloecke: readonly SynopseBlock[]): string {
  return bloecke.map((b) => b.filter(Boolean).join(' ')).join('\n');
}

/**
 * VERGLEICHS-Eingabe: der Artikel als EIN flacher Text, unabhaengig davon, in welchem
 * Element sein Listen-Etikett steckt.
 *
 * Gemessen E5.0 (AVIV Art. 120a Bst. b, Stand 2024-08-01 -> 2025-08-01): dieselbe
 * Bestimmung steht einmal als `<num>[tab]</num><p>b. AHV-Nummer …</p>` und einmal als
 * `<num>b. </num><p>AHV-Nummer …</p>`. Der Wortlaut ist identisch, die Baumstruktur
 * nicht. Ein blockweiser Vergleich meldet hier eine Gesetzesaenderung, die keine ist —
 * und weil die Fussnote schweigt, waere sie am Artikel eine falsche Behauptung (§1).
 * Deshalb entscheidet ueber «geaendert ja/nein» ausschliesslich der flache Text; die
 * Bloecke bleiben unveraendert das, was gespeichert und angezeigt wird.
 */
export function flachText(a: ArtikelFassung): string {
  return reinerText(vergleichsRoh(a.roh));
}

/**
 * Strukturelle Vorbehandlung NUR fuer den Vergleich (Profil `entstehung-norm/2`).
 *
 * Sie raeumt zwei Klassen von KONVERSIONS-Artefakten aus, die die Gegenpruefung zu
 * PR #794 an vier Stellen belegt hat — beide sitzen an einer ELEMENTGRENZE, nie im
 * Fliesstext, und beide lassen den gespeicherten (amtlichen) Wortlaut unberuehrt.
 */
export function vergleichsRoh(roh: string): string {
  return roh
    // (a) Satzzeichen unmittelbar VOR einer Aufzaehlung. Gemessen an zwei Faellen:
    //   ARG Art. 12  (2021-01-01 -> 2023-09-01): derselbe Satz einmal als gewoehnlicher
    //     `<p>` ohne Satzzeichen, einmal als `<listIntroduction>… werden:</listIntroduction>`.
    //   EMRK Art. 44 (2022-02-01 -> 2022-09-16): `<p>… wird endgueltig,</p><blockList>`
    //     wird zu `<blockList><listIntroduction>… wird endgueltig:</listIntroduction>`.
    // Beide Male macht die Konversion aus «Satz + Liste» ein «Einleitung + Liste» und
    // tauscht dabei das Schluss-Satzzeichen. Die Regel greift AUSSCHLIESSLICH an dieser
    // Elementgrenze, nie im Fliesstext — ein Komma in einer Aufzaehlung kann den Sinn
    // tragen (§1). Der GESPEICHERTE Wortlaut behaelt sein Satzzeichen; er ist amtlich.
    .replace(/[,;:\s]*(<\/listIntroduction>)/g, '$1')
    .replace(/[,;:]\s*(<\/p>\s*<blockList)/g, '$1')
    // (b) Absatz-Etikett in Klammerform. Gemessen an UNO_PAKT_II Art. 24
    // (2022-01-24 -> 2022-05-09): das Etikett steht im alten Stand als Text am Anfang
    // des Absatzes (`<content><p>(l)  Jedes Kind …`, mit kleinem L statt Eins aus der
    // Erstkonversion) und im neuen als eigenes Element (`<num>(1)</num><content><p>Jedes
    // Kind …`). Etikett und Glyphe wandern, der Wortlaut nicht.
    // ENG GEFASST: nur die Klammerform mit hoechstens vier alphanumerischen Zeichen und
    // nur am BLOCKANFANG. «(Aufgehoben)» ist laenger und bleibt stehen, ein Querverweis
    // «(2)» mitten im Satz ebenso.
    .replace(/<num\b[^>]*>\s*\(\s*[0-9a-zA-Z]{1,4}\s*\)\s*<\/num>/g, '')
    .replace(/(<p\b[^>]*>)\s*\(\s*[0-9a-zA-Z]{1,4}\s*\)\s*/g, '$1');
}

/**
 * Profil `entstehung-norm/1` — NUR fürs Matching. Löst die drei gemessenen Rausch-Quellen
 * auf (R2 §3): unsichtbare Trenn-/Leerzeichen-Codepunkte, Leerraum-Varianz und die
 * Generator-Typografie (die bereits `reinerText` schluckt). Gross-/Kleinschreibung und
 * Interpunktion bleiben unangetastet — eine Redaktionskorrektur «hiebei»→«hierbei» IST
 * eine Textänderung und darf nicht wegnormalisiert werden (§1).
 *
 * NIE EDITIEREN: eine Verbesserung heisst `entstehung-norm/2` und entsteht daneben,
 * sonst entwertet sie rückwirkend jede gespeicherte Prüfsumme.
 */
export function normalisiere(s: string): string {
  return s
    // (1) unsichtbare Trenn-/Verbindungs-Codepunkte: Soft-Hyphen, Zero-Width-Space,
    // ZWNJ/ZWJ, BOM — sie tragen keinen Wortlaut und wandern zwischen Generationen.
    .replace(/\u00AD/g, '')  // Soft-Hyphen
    .replace(/\u200B/g, '')  // Zero-Width-Space
    .replace(/\u200C/g, '')  // ZWNJ  (einzeln, nicht als Zeichenklasse: ZWJ/ZWNJ in
    .replace(/\u200D/g, '')  // ZWJ    einer Klasse waeren irrefuehrend, no-misleading-character-class)
    .replace(/\uFEFF/g, '')  // BOM
    // (2) Bindestrich-Varianten auf den gewoehnlichen Bindestrich. Gemessen an der
    // Gegenpruefung zu PR #794 (ARG Art. 12): dieselbe Stelle steht in einer Generation
    // mit «-», in der naechsten mit «\u2013». Der EM-DASH \u2014 bleibt ABSICHTLICH
    // unangetastet — er ist Gedankenstrich, also Interpunktion, kein Trennzeichen.
    .replace(/[\u2010\u2011\u2012\u2013]/g, '-')
    // (3) Auslassungspunkte: dieselbe Stelle einmal «...», einmal «\u2026»
    // (gemessen E5.0: ZGB Art. 107 Ziff. 4, 2021-01-01 -> 2022-01-01).
    .replace(/\.\.\./g, '\u2026')
    // (4) Unicode-Kanonik: dieselbe Umlaut-Folge kommt je nach Artefakt-Generation
    // zusammengesetzt oder zerlegt — reine Kodierung, nie Wortlaut.
    .normalize('NFC')
    // (5) ALLER Leerraum faellt weg — die staerkste Regel des Profils, und die, an der
    // /1 gescheitert ist. Die Grenze zwischen `<num>` und `<content>` WANDERT durch das
    // Ordnungs-Suffix: AHVG Art. 10 Abs. 2bis steht im Stand 2021-01-01 als
    // `<num>2bis</num><content>Die \u2026`, im Stand 2022-01-01 als
    // `<num>2b</num><content><sup>is</sup> Die \u2026`. Beide Male lautet der Wortlaut
    // «2bis Die \u2026»; zwischen «2b» und «is» steht einmal eine Elementgrenze (= ein
    // Leerzeichen) und einmal nicht. Eine Grammatik fuer «bis/ter/quater/\u2026» waere
    // offen (§2) und truege nur diesen einen Fall; Leerraum ganz zu streichen traegt die
    // ganze Klasse. Ein Unterschied, der NUR aus Leerraum besteht, ist nie eine
    // Gesetzesaenderung — der gespeicherte Wortlaut bleibt davon unberuehrt, die Regel
    // gilt allein fuers Matching.
    .replace(/\s+/g, '');
}

export const NORMALISIERUNGS_PROFIL = NORM_PROFIL;

/** sha256 hex über einen String. */
export function sha256(s: string): string {
  return createHash('sha256').update(s, 'utf8').digest('hex');
}

// ── Diff ──────────────────────────────────────────────────────────────────────

/** Ergebnis eines Schritt-Vergleichs zweier Stände. */
export interface DiffErgebnis {
  /** eIds in beiden Ständen. */
  stabil: string[];
  /** eIds nur im ALTEN Stand (entfallen / umnummeriert). */
  nurAlt: string[];
  /** eIds nur im NEUEN Stand (eingefügt / umnummeriert) — samt der eIds, die im alten
   *  Stand bloss als angekündigte, textlose Hülse standen. */
  nurNeu: string[];
  /** stabile eIds mit verschiedenem NORMALISIERTEM Wortlaut = echte Änderung. */
  geaendert: string[];
  /** stabile eIds mit verschiedenem ROHEM XML = Mess-Referenz vor der Normalisierung. */
  geaendertRoh: string[];
  /** eIds, deren ALT-Fassung keinen Wortlaut trägt (blosse Hülse: `<num>Art. 222q</num>`
   *  plus Fussnote «Tritt am … in Kraft», oder ein Artikel, dessen Änderung nur Etikett
   *  bzw. Sachtitel betrifft) UND deren Neu-Fassung ebenfalls keinen trägt. Es gibt
   *  nichts zu zeigen — gelistet statt gespeichert, damit nichts still verschwindet (§8). */
  ohneAltText: string[];
}

/** REIN: zwei Stände vergleichen. Diff-Einheit ist die amtliche eId (nie der Text). */
export function diffStaende(
  alt: Map<string, ArtikelFassung>,
  neu: Map<string, ArtikelFassung>,
): DiffErgebnis {
  const stabil: string[] = [];
  const nurAlt: string[] = [];
  const geaendert: string[] = [];
  const geaendertRoh: string[] = [];
  const erstBefuellt: string[] = [];
  const ohneAltText: string[] = [];
  const leer = (f: ArtikelFassung): boolean => wortlaut(f.bloecke).trim() === '';
  for (const eId of [...alt.keys()].sort()) {
    const n = neu.get(eId);
    if (!n) {
      // Entfallen — aber nur speicherbar, wenn die Alt-Fassung überhaupt Wortlaut trug.
      if (leer(alt.get(eId)!)) ohneAltText.push(eId); else nurAlt.push(eId);
      continue;
    }
    stabil.push(eId);
    const a = alt.get(eId)!;
    if (a.roh !== n.roh) geaendertRoh.push(eId);
    const alt_ = normalisiere(flachText(a));
    const neu_ = normalisiere(flachText(n));
    if (alt_ === neu_) continue;
    // Leere Alt-Fassung: der Artikel war im alten Stand nur als ANGEKUENDIGTE Huelse da
    // (`<num>Art. 222q</num>` + Fussnote «Tritt am 1. April 2024 in Kraft.», gemessen
    // E5.0 an VTS Art. 222q). Er ist kein geaenderter, sondern ein eingefuegter Artikel;
    // ein leerer Alt-Block waere eine Synopse gegen nichts. Gemessen wird die Leere am
    // BLOCK-Wortlaut, nicht am flachen Text: der traegt Etikett und Sachtitel mit und ist
    // bei einer Huelse gerade nicht leer («Art. 222q»).
    if (leer(a)) {
      if (leer(n)) ohneAltText.push(eId); else erstBefuellt.push(eId);
      continue;
    }
    geaendert.push(eId);
  }
  const nurNeu = [...neu.keys()].filter((e) => !alt.has(e)).concat(erstBefuellt).sort();
  return { stabil, nurAlt, nurNeu, geaendert, geaendertRoh, ohneAltText: ohneAltText.sort() };
}

/** eId → kanonischer Korpus-Token («art_38_a» → «38_a»); null = kein Artikel-Token. */
export function tokenAusEId(eId: string): string | null {
  return ankerNachToken(eId);
}

// ── Serialisierung ────────────────────────────────────────────────────────────

/**
 * Kanonische Serialisierung eines Shards (byte-deterministisch, §2).
 *
 * KOMPAKT, anders als bei den Anker- und Curia-Sidecars: die sind wenige KB gross und
 * profitieren von der Lesbarkeit im Diff. Hier hängen an jedem Alt-Block drei Schlüssel,
 * und die Einrückung kostet gemessen (11.9.2026, STPO) 175,9 KB statt 120,8 KB — 46 %
 * Aufschlag auf ein Artefakt, das korpusweit mehrere MB wiegt und über die Leitung geht
 * (§15). Von Hand editiert wird ein Shard ohnehin nie: `check:entstehung` vergleicht ihn
 * byte-genau mit dieser Funktion und wird rot, wenn jemand es doch tut.
 */
export function serialisiereShard(s: SynopseShard): string {
  return `${JSON.stringify(s)}\n`;
}

/** sha256 über den serialisierten Shard — Determinismus-Wächter (§11.6 (5)). */
export function shaShard(s: SynopseShard): string {
  return sha256(serialisiereShard(s));
}
