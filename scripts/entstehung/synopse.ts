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
import { vergleichsformLeerraumBlind } from '../../src/lib/entstehung/normalisierung.ts';
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
  /** Sachüberschrift der Vergleichs- UND Speicherform (`titelFuerVergleich`);
   *  leerer String = keine. */
  ueberschrift: string;
  bloecke: SynopseBlock[];
  /** Das rohe innere XML — Eingabe des UNNORMALISIERTEN Vergleichs (Mess-Referenz). */
  roh: string;
}

const ARTIKEL_RE = /<article\b[^>]*\beId="([^"]+)"[^>]*>([\s\S]*?)<\/article>/g;

/**
 * `<paragraph>`-Elemente eines Artikel-Innenraums — die EINZIGE Struktur-Quelle der
 * gespeicherten Blöcke (`zerlegeBloecke`). `flachText` (Befund #796) liest seit
 * Profil `/3` nichts mehr direkt aus dieser Konstante — es ruft `zerlegeBloecke`
 * selbst auf (`wortlaut(zerlegeBloecke(vergleichsRoh(roh)))`), damit Vergleichs- und
 * Speicher-Scope NIE wieder auseinanderlaufen können (§5).
 */
const PARAGRAPH_RE = /<paragraph\b[^>]*>([\s\S]*?)<\/paragraph>/g;

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
      ueberschrift: titelFuerVergleich(inner),
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
  const paras = [...inner.matchAll(PARAGRAPH_RE)];
  if (paras.length === 0) {
    // Artikel ohne `<paragraph>` (Einzelsatz-Artikel, Platzhalter «Aufgehoben»):
    // der Artikelkörper ohne `<num>`/`<heading>`/`<subheading>` ist EIN Block.
    const koerper = inner
      .replace(/<num\b[^>]*>[\s\S]*?<\/num>/, '')
      .replace(/<heading\b[^>]*>[\s\S]*?<\/heading>/, '')
      .replace(/<subheading\b[^>]*>[\s\S]*?<\/subheading>/, '');
    const t = reinerText(koerper);
    if (t) out.push(['', '', t]);
    return out;
  }
  for (const p of paras) {
    const koerper = p[1];
    const absatz = reinerText(ersterTag(koerper, 'num') ?? '');
    const ohneNum = koerper.replace(/<num\b[^>]*>[\s\S]*?<\/num>/, '');
    const listen = blockListBereiche(ohneNum);
    if (listen.length === 0) {
      const t = reinerText(ohneNum);
      if (t) out.push([absatz, '', t]);
      continue;
    }
    // Fliesstext AUSSERHALB der Aufzählungen — Vorlauf, Zwischentext und NACHLAUF —
    // trägt das Absatz-Etikett und sonst keines (Gegenprüfung PR #798, Auflage A1).
    let pos = 0;
    const fliesstext = (bis: number): void => {
      const t = reinerText(ohneNum.slice(pos, bis));
      if (t) out.push([absatz, '', t]);
    };
    for (const [von, bis] of listen) {
      fliesstext(von);
      const liste = ohneNum.slice(von, bis);
      // Listeneinleitung («Dieses Gesetz regelt … für:») trägt das Absatz-Etikett.
      const intro = reinerText(ersterTag(liste, 'listIntroduction') ?? '');
      if (intro) out.push([absatz, '', intro]);
      for (const it of liste.matchAll(/<item\b[^>]*>([\s\S]*?)<\/item>/g)) {
        const num = reinerText(ersterTag(it[1], 'num') ?? '');
        const t = reinerText(it[1].replace(/<num\b[^>]*>[\s\S]*?<\/num>/, ''));
        if (t) out.push([absatz, num, t]);
      }
      pos = bis;
    }
    fliesstext(ohneNum.length);
  }
  return out;
}

/**
 * Die `<blockList>`-Bereiche eines Absatz-Innenraums als `[von, bis)`-Paare — VERSCHACHTELUNG
 * ZÄHLT MIT: eine Unter-Aufzählung innerhalb eines `<item>` schliesst den äusseren Bereich
 * nicht (gemessen 12.9.2026 über den ganzen Korpus: 4476 Absätze mit verschachtelter
 * `<blockList>`; ein nicht-gieriges `<blockList>…</blockList>` hätte dort mitten im Baum
 * geschnitten und den Rest der äusseren Liste zu «Fliesstext» erklärt).
 *
 * WARUM ÜBERHAUPT BEREICHE: `zerlegeBloecke` erfasste bis Profil `/3` je Absatz nur die
 * ERSTE `<listIntroduction>` und die `<item>`, nie den Text davor, dazwischen oder DANACH —
 * ein struktureller Speicherverlust (gemessen 12.9.2026: 651 Absätze je Stand tragen
 * Fliesstext nach der letzten Aufzählung). Beleg für den Schaden: KLV Art. 12 Bst. e, wo
 * genau dieser Nachlauf-Satz die Kantonsliste der Früherkennungsprogramme trägt und ihre
 * vier Erweiterungen (2022-01-01, 2023-01-01, 2025-01-01, 2026-07-01) in KEINER Generation
 * in `bloecke` landeten — der Generator buchte «geändert», der Leser sah nichts (§5).
 *
 * `<item>` AUSSERHALB einer `<blockList>` gibt es im Korpus nicht (gemessen 12.9.2026:
 * 0 Absätze); die Item-Suche läuft darum bewusst NUR innerhalb der Bereiche.
 */
function blockListBereiche(s: string): [number, number][] {
  const out: [number, number][] = [];
  const re = /<blockList\b[^>]*>|<\/blockList>/g;
  let tiefe = 0;
  let start = -1;
  let m: RegExpExecArray | null;
  while ((m = re.exec(s)) !== null) {
    if (m[0].startsWith('</')) {
      if (tiefe === 0) continue; // unbalancierter Schluss-Tag: ignorieren, nie Text verlieren
      tiefe -= 1;
      if (tiefe === 0) { out.push([start, m.index + m[0].length]); start = -1; }
    } else {
      if (tiefe === 0) start = m.index;
      tiefe += 1;
    }
  }
  // Unbalancierter Öffnungs-Tag (im Korpus nie gemessen): der Rest gilt als Liste, damit
  // sein `<item>`-Inhalt erfasst bleibt statt als Fliesstext doppelt zu erscheinen.
  if (tiefe > 0 && start >= 0) out.push([start, s.length]);
  return out;
}

/**
 * Der VERGLEICHS- UND SPEICHER-TITEL eines Artikels: die amtliche Sachüberschrift
 * (`<heading>`), ergänzt um einen `<subheading>`, der KEIN blosser Norm-Querverweis ist.
 *
 * WARUM DER RANDVERMERK AUSSEN BLEIBT (enge, gemessene Regel — Gegenprüfung PR #798,
 * Auflage A2): `<subheading>` trägt in der AKN-Konsolidierung des Bundes den Randvermerk
 * in Klammerform, also den Hinweis auf die Delegationsnorm — «(Art. 83 Abs. 1 Bst. i und o
 * AVIG)». Gemessen 12.9.2026 über den jüngsten Stand aller 186 Erlasse: 2096 Artikel
 * tragen einen `<subheading>`, und ALLE 2096 sind ein solcher Klammer-Querverweis (die
 * acht Ausreisser der ersten Regel-Fassung waren amtliche Schreibfehler in der Klammerung:
 * «(Art 17 …)» ohne Punkt, «(17 und 20 VAG)» ohne «Art.», «Art. 18 … MWSTG)» ohne
 * öffnende Klammer — inhaltlich dieselbe Sorte). Ändert sich NUR dieser Verweis, ist das
 * eine Umnummerierung ANDERSWO im Erlass, keine Änderung dieses Artikels (Beleg AVIV
 * Art. 109b 2021-04-01 → 2021-07-01, BPV Art. 88d 2023-01-01 — zusammen 8 Fälle im
 * Korpus). Ein `<subheading>`, der KEINE solche Klammer ist, zählt darum weiterhin zum
 * Titel — die Regel filtert eine belegte Form, nicht ein ganzes AKN-Element (§8).
 */
export function titelFuerVergleich(inner: string): string {
  const heading = reinerText(ersterTag(inner, 'heading') ?? '');
  const sub = reinerText(ersterTag(inner, 'subheading') ?? '');
  return [heading, sub && !RANDVERMERK_QUERVERWEIS.test(sub) ? sub : ''].filter(Boolean).join(' ');
}

/** Randvermerk in Klammerform mit Norm-Querverweis — siehe `titelFuerVergleich`. */
const RANDVERMERK_QUERVERWEIS = /^\(?\s*(?:Art\.?|Ziff\.?|Abs\.?|Bst\.?|Anhang|\d)[^()]*\)$/;

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
 *
 * SCOPE SEIT PROFIL /4 (Gegenprüfung PR #798, Auflagen A1/A2, 12.9.2026): GENAU das,
 * was auch gespeichert wird — `titelFuerVergleich` (Sachüberschrift ohne den
 * Klammer-Randvermerk) plus `wortlaut(zerlegeBloecke(…))`. Vergleichs- und Speicher-Scope
 * sind damit dieselbe Funktion und können nicht mehr auseinanderlaufen (§5).
 *
 * VORGESCHICHTE, damit die Grenze nicht wieder verrutscht:
 *  · `/2` verglich den GANZEN Artikel-Innenraum — ein Randvermerk-Update ohne
 *    Textänderung buchte «geändert», der Leser sah nichts (70 Alt-Blöcke, 11.9.2026).
 *  · `/3` schnitt darum auf `<paragraph>`-Inhalt zurück und liess Titel UND
 *    Sachüberschrift ganz aussen vor. Das ging zu weit: 45 echte Randtitel-Änderungen
 *    (BVG Art. 33b «ordentliches Rentenalter» → «Referenzalter», STPO Art. 55/431,
 *    HMG Art. 41, HREGV Art. 77, PARTG Art. 10, AHVV Art. 52a, EPV Art. 90, VAG Art. 84,
 *    FINFRAG Art. 41 …) wurden dadurch UNSICHTBAR — der Leser bekam «kein Unterschied
 *    erkennbar» zu sehen, obwohl sich die amtliche Sachüberschrift geändert hatte (§8).
 *  · `/4` nimmt den Titel wieder auf, aber als GESPEICHERTEN Teil (siehe
 *    `SynopseArtikel.ueberschrift`/`ueberschriftNeu`), nicht als unsichtbares
 *    Vergleichs-Beiwerk — gemessen 12.9.2026: 35 Schritte ändern NUR den Titel,
 *    666 Schritte ändern Titel UND Wortlaut.
 *  · `/3` delegierte nicht an `zerlegeBloecke`, weil dieses den `<p>`-Satz VOR einer
 *    `<blockList>` (ARG 12 / EMRK 44, PR #794) nicht kannte. Seit Auflage A1 erfasst
 *    `zerlegeBloecke` Vor-, Zwischen- und Nachlauftext — die Delegation ist damit möglich
 *    und Regel (c) («Text nach `</blockList>` wegwerfen») ersatzlos gestrichen.
 */
export function flachText(a: ArtikelFassung): string {
  const vorbehandelt = vergleichsRoh(a.roh);
  return [
    titelFuerVergleich(vorbehandelt),
    vergleichsFolge(zerlegeBloecke(vorbehandelt)),
  ].filter(Boolean).join('\n');
}

/**
 * Die Blockfolge als EIN Vergleichstext — mit den Etiketten, aber das ABSATZ-Etikett nur
 * beim Wechsel (Profil `/4`, Gegenprüfung PR #798).
 *
 * WARUM DIE ETIKETTEN MIT MÜSSEN: die AKN-Elementgrenze zwischen `<num>` und `<content>`
 * wandert zwischen zwei Generationen — AVIV Art. 120a Bst. b steht einmal als
 * `<num>[tab]</num><p>b. AHV-Nummer …</p>`, einmal als `<num>b. </num><p>AHV-Nummer …</p>`
 * (E5.0). Nur die Aneinanderreihung von Etikett und Text ist über diese Grenze hinweg
 * stabil.
 *
 * WARUM DAS ABSATZ-ETIKETT NUR BEIM WECHSEL: ein Absatz kann in der einen Generation EINEN
 * Block tragen und in der nächsten ZWEI, weil die Konversion an einer Interpunktion
 * trennt — SSV Art. 24 Abs. 1 Bst. a, 2024-04-08 → 2025-01-01: «… (2.33): Der Führer muss
 * …» wird zu «… (2.33):» + eigener Block «Der Führer muss …» (gemessen 12.9.2026). Würde
 * das Absatz-Etikett «1» je Block wiederholt, sähe der Vergleich dort ein zusätzliches
 * Wort und buchte eine Änderung, die der Leser nicht zeigen kann — genau der
 * Zwei-Wahrheiten-Fehler, den der Leer-Diff-Wächter verbietet (§5). Im alten,
 * paragraph-weisen `flachText` stand das Etikett aus demselben Grund genau einmal je
 * Absatz: es kam aus dem einen `<num>` des `<paragraph>`.
 */
function vergleichsFolge(bloecke: readonly SynopseBlock[]): string {
  const teile: string[] = [];
  let letzterAbsatz: string | null = null;
  for (const b of bloecke) {
    if (b[0] !== letzterAbsatz) {
      if (b[0]) teile.push(b[0]);
      letzterAbsatz = b[0];
    }
    const rest = [b[1], b[2]].filter(Boolean).join(' ');
    if (rest) teile.push(rest);
  }
  return teile.join('\n');
}

/**
 * Strukturelle Vorbehandlung NUR fuer den Vergleich (Profil `entstehung-norm/4`).
 *
 * Sie raeumt KONVERSIONS-Artefakte aus, die an einer ELEMENTGRENZE sitzen, nie im
 * Fliesstext, und die den gespeicherten (amtlichen) Wortlaut unberuehrt lassen.
 *
 * REGEL (c) IST SEIT PROFIL `/4` ERSATZLOS GESTRICHEN (Gegenpruefung PR #798, Auflage
 * A1): sie warf den Fliesstext nach `</blockList>` aus dem VERGLEICH, statt die
 * STORAGE-Luecke zu schliessen — und loeschte damit vier echte Wortlautaenderungen von
 * KLV Art. 12 Bst. e (Kantonsliste der Frueherkennungsprogramme, Schritte 2021-11-04 →
 * 2022-01-01, 2022-10-01 → 2023-01-01, 2024-07-01 → 2025-01-01, 2026-05-11 →
 * 2026-07-01). Die Luecke sitzt jetzt dort, wo sie hingehoert: `zerlegeBloecke`
 * erfasst Vor-, Zwischen- und Nachlauftext.
 */
export function vergleichsRoh(roh: string): string {
  return roh
    // (a0) Fussnoten-Apparat WEG, BEVOR die Satzzeichen-Regel (a) unten prueft, ob ein
    // Satzzeichen unmittelbar vor der Elementgrenze steht (Befund #796, 11.9.2026).
    // Gemessen an BGOE Art. 13 (2023-09-01 -> 2023-11-01) und VEV Art. 4 (2026-04-08 ->
    // 2026-06-12): eine `<authorialNote>` (Berichtigungs- bzw. «Fassung gemaess…»-Hinweis)
    // schiebt sich in EINER Generation zwischen das Satzzeichen und `</listIntroduction>`
    // (`…Person:<authorialNote>…</authorialNote></listIntroduction>`), in der anderen steht
    // sie nicht dort — die Regel (a) griff nur in der fussnotenlosen Generation und liess
    // ein reines Fussnoten-Artefakt wie eine Wortlaut-Aenderung aussehen (kein gespeicherter
    // Block betroffen: `reinerText` entfernt `<authorialNote>` ohnehin vollstaendig, nur
    // die VERGLEICHS-Reihenfolge war falsch). Dieselbe Regex wie in `reinerText`.
    .replace(/<authorialNote\b[^>]*>[\s\S]*?<\/authorialNote>/g, '')
    // (a0b) INLINE-Auszeichnung SPURLOS weg, aus demselben Grund wie (a0) und mit derselben
    // Regex-Liste wie `reinerText` (Rot-Beweis ZSTV Art. 17, 2025-01-01 -> 2025-06-01):
    // `<span>…bewilligen:</span></listIntroduction>` in EINER Generation (ein reines
    // Konversions-Artefakt — `reinerText` entfernt `<span>` ohnehin spurlos) blockiert die
    // Satzzeichen-Regel (a) genauso wie eine `<authorialNote>` — dieselbe STRUKTUR
    // (Konversions-Rauschen zwischen Satzzeichen und Elementgrenze), nur das dazwischen-
    // liegende Element wechselt. `bloecke` waren in diesem Fall bereits byte-gleich; nur die
    // VERGLEICHS-Reihenfolge war falsch.
    .replace(/<\/?(?:b|i|em|strong|sup|sub|span|a|abbr|small|u|inline|ref)\b[^>]*>/gi, '')
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
 * Profil `entstehung-norm/4` (Gegenprüfung PR #798, 12.9.2026) — NUR fürs Matching.
 * Dünner Wrapper um die EINE geteilte Vergleichsform
 * (`src/lib/entstehung/normalisierung.ts`, dort auch von `synopse-diff.ts`/dem
 * Leser importiert — «genau ein Ort», §5) MIT der generator-eigenen
 * Leerraum-Blindheit obendrauf: sie trägt die Klasse «AKN-Elementgrenze wandert
 * durch ein Ordnungs-Suffix» (AHVG Art. 10 Abs. 2bis, R2 §6b) und hat nach wie
 * vor kein Gegenstück beim Leser (der sieht nie XML-Elementgrenzen, nur bereits
 * sauber extrahierte Blöcke). Alles andere — unsichtbare Codepunkte,
 * Bindestrich-/Ellipsen-Varianten, NFC, geschützte Leerzeichen — kommt jetzt
 * aus DERSELBEN Funktion wie beim Leser statt aus einer zweiten, eigenen
 * Zeichenliste (vorher `normalisiere()` hier, `vergleichsform()` dort — zwei
 * Normalisierungen sind zwei Wahrheiten, §5).
 *
 * Profile /1 und /2 sind Geschichte (siehe `NORM_PROFIL`-Dokumentation in
 * `src/lib/entstehung/synopse.ts`); NIE EDITIEREN — eine Verbesserung entsteht
 * als neue Nummer daneben, sonst entwertet sie rückwirkend jede gespeicherte
 * Prüfsumme.
 */
export function normalisiere(s: string): string {
  return vergleichsformLeerraumBlind(s);
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
    // ORDNUNGS-SUFFIX WANDERT UEBER DIE ELEMENTGRENZE `<num>`/`<heading>` (Profil `/4`,
    // Gegenpruefung PR #798): RPV Art. 32bis steht am 2026-05-11 als
    // `<num>Art. 32</num><heading><sup>bis</sup> Buendelung von Infrastrukturanlagen</heading>`
    // und am 2026-05-20 als `<num>Art. 32<sup>bis</sup></num><heading>Buendelung …</heading>`.
    // Etikett und Titel zusammen sind Zeichen fuer Zeichen dieselben — nur die Grenze
    // zwischen beiden Elementen ist gewandert. Dieselbe Klasse wie AHVG Art. 10 Abs. 2bis
    // (R2 §6b), nur eine Ebene hoeher; `normalisiere` ist leerraum-blind, darum traegt die
    // blosse Aneinanderreihung den Vergleich. SIE UNTERDRUECKT NUR — eine Etikett-Aenderung
    // allein bucht nie eine Aenderung (§1: sonst staende ein Alt-Block ohne sichtbaren
    // Unterschied im Shard).
    if (normalisiere(a.label + flachText(a)) === normalisiere(n.label + flachText(n))) continue;
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
    // Symmetrischer Fall (Nachtrag Befund #796, 11.9.2026): die NEU-Fassung wird leer,
    // waehrend die ALT-Fassung Wortlaut trug — dieselbe Ueberlegung wie oben, nur
    // spiegelverkehrt. Beleg: AVIV Art. 57b, 2021-04-01 -> 2021-07-01 (`<num><b>Art.
    // 57</b><i>b</i></num>` bleibt als eId erhalten, der Koerper wird textlos — keine
    // `<paragraph>` mit Inhalt mehr). Ohne diese Regel wurde eine ZUR HUELSE GEWORDENE
    // Bestimmung als "geaendert" gebucht statt als "entfallen" — `neuNach()` suchte beim
    // Leser dann ueber den leeren Punkt hinweg nach dem NAECHSTEN Auftreten desselben
    // Tokens und fand dort zufaellig denselben Wortlaut wieder (Kurzarbeits-Verlaengerung
    // "sechs Abrechnungsperioden", 2021-07-01 wie 2025-11-01) — ein Leer-Diff, dessen
    // Ursache eine falsche STORAGE-Klassifikation war, keine Normalisierungs-Luecke.
    if (leer(n)) { nurAlt.push(eId); continue; }
    geaendert.push(eId);
  }
  const nurNeu = [...neu.keys()].filter((e) => !alt.has(e)).concat(erstBefuellt).sort();
  return { stabil, nurAlt, nurNeu, geaendert, geaendertRoh, ohneAltText: ohneAltText.sort() };
}

/**
 * Hat sich die SACHUEBERSCHRIFT zwischen zwei Fassungen desselben Artikels geaendert?
 *
 * Massgeblich ist die Vergleichsform des Profils (`normalisiere`, leerraum-blind) UND
 * derselbe Ordnungs-Suffix-Escape wie in `diffStaende`: wandert das «bis»/«ter» eines
 * Artikel-Etiketts ueber die Grenze `<num>`/`<heading>` (RPV Art. 32bis), ist der Titel
 * unveraendert. Grundlage von `SynopseArtikel.ueberschriftNeu` — gespeichert wird der
 * neue Titel nur, wenn er sich wirklich unterscheidet (§8: nie eine Aenderung behaupten,
 * die keine ist).
 */
export function titelGeaendert(a: ArtikelFassung, n: ArtikelFassung): boolean {
  if (normalisiere(a.ueberschrift) === normalisiere(n.ueberschrift)) return false;
  return normalisiere(a.label + a.ueberschrift) !== normalisiere(n.label + n.ueberschrift);
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
