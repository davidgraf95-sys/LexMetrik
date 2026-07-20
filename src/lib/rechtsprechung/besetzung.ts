// ─── Spruchkörper-Besetzung: Freitext → strukturierte Richter (deterministisch) ──
//
// RISIKOPFAD (Anonymisierung + Namens-Identität). Reine, deterministische Funktion
// (§2, kein LLM, keine Schätzung). Wandelt den amtlichen Besetzungs-Freitext eines
// Entscheids (BS-«Mitwirkende»-Block bzw. Bund-«Besetzung»-Rubrum) in eine Liste
// {slug, name, nameRoh, rolle} um. Grenzen (rechtlich KRITISCH):
//  · Richter/Gerichtsschreiber sind amtlich NAMENTLICH (öffentlich, URG-frei).
//  · Parteien/Gutachter sind ANONYMISIERT (C____, «Dr. med. X»). Die Extraktion
//    darf NIEMALS eine anonymisierte Person als Richter erfassen (harter Guard).
//  · «Dr. med.» ist ein legitimer medizinischer FACHRICHTER (SVG/BPatGer) und wird
//    NICHT ausgeschlossen — der Diskriminator ist die Position im Besetzungs-Block
//    plus die Abwesenheit eines Anonymisierungs-Tokens (____), nie der Titel.
//  · Ehrlichkeit (§8): Lässt sich ein Freitext nicht sicher strukturieren, wird
//    NICHTS fabriziert — die Funktion liefert []; der Entscheid erscheint dann
//    schlicht nicht in der Richter-Facette (der Freitext bleibt als Rubrum erhalten).

export type RichterRolle = 'vorsitz' | 'mitglied' | 'gerichtsschreiber';

/** Ein Roh-Richter aus dem Parser (der Generator kanonisiert slug korpusglobal weiter). */
export interface RichterRoh {
  /** Roh-Slug (Nachname[-Vorname]); Join-/Filter-Key VOR der Korpus-Kanonisierung. */
  slug: string;
  /** Gefalteter Nachname (Kanon-Pass gruppiert danach). */
  nachSlug: string;
  /** Gefalteter Vorname — voll («patrizia») oder Initial («p»); null wenn nur Nachname. */
  givenSlug: string | null;
  /** Kanonischer Anzeigename (Titel/Rolle gestrippt, Whitespace geglättet). */
  name: string;
  /** Name wie im Block gefunden (nach Strip von Rolle/Titel, vor Slug-Fold). */
  nameRoh: string;
  rolle: RichterRolle;
}

export interface BesetzungKontext {
  /** Court-Code (z.B. 'bge','bger','bvger','bstger','bs_appellationsgericht'). */
  gericht: string;
}

// ── Gerichte mit Nur-Nachnamen-Besetzung (kein Vorname im amtlichen Text) ──
// BGE/BGer nennen den Spruchkörper konsistent nur mit Nachnamen («Bundesrichter
// Chaix», mehrteilige Nachnamen «Aubry Girardin»). Kein Vorname → kein Initial-
// Suffix; die gesamte Namensrest-Zeichenkette IST der Nachname.
const NUR_NACHNAME_GERICHTE: ReadonlySet<string> = new Set(['bge', 'bger']);

// ── Anonymisierungs-Guard (hart) ──
// Fängt C____, X.__, A.________, D._______ etc. (≥2 Underscores, oder ein
// Grossbuchstabe/Initial direkt vor Underscores). Ein Segment, das dieses Muster
// trägt, ist eine anonymisierte Partei/Gutachter und wird NIE als Richter erfasst.
const ANON_RE = /_{2,}|\b[A-ZÄÖÜ]\.?_+/;

/** Trägt der Rohtext ein Anonymisierungs-Token? (Richter tragen es nie.) */
export function istAnonymisiert(roh: string): boolean {
  return ANON_RE.test(roh);
}

// ── Partei-/Vertreter-Marker (fail-safe; im sauberen Block ohnehin nicht erwartet) ──
const PARTEI_RE =
  /\b(vertreten durch|Advokat(?:in)?|Rechtsanw|Beschwerdef[üu]hr|Beschwerdegegn|Kl[äa]ger|Beklagt|Gesuchsteller|Gesuchsgegn|Berufungskl|appelant|recourant|Fürsprech)/i;

// ── Vorsitz-/Einzelrichter-Marker (Rolle = vorsitz) ──
// `P\s?r…` / `pr\s?é…`: die Amtstexte tragen gesperrt gesetzte Rollenwörter
// («Mmes et M. les Juges fédéraux Hohl, P résidente, Kiss, …», BGE 147 III 440).
// Ohne die Leerzeichen-Toleranz wurde «P résidente» als Nachname «résidente»
// gelesen und erschien als eigener Richter.
const VORSITZ_RE =
  /\(\s*Vorsitz\s*\)|Vorsitzende(?:r|n)?|P\s?r[äa]sident(?:in|en)?|p\s?r[ée]sident(?:e|s)?|P\s?residente|pr[äa]sidierendes?\s+Mitglied|Einzelrichter(?:in)?|Einzelgericht|juge\s+unique|giudice\s+unico|Referent(?:in)?/i;

// ── Gerichtsschreiber-Rollen-Token (Rolle = gerichtsschreiber) ──
const GS_TOKEN =
  /Gerichtsschreiber(?:in)?|Greffi[eè]re?|Cancellier[ea]/i;

// ── Titel + Rollen-Nomen, die einem Namen VORANGEHEN (repeatable strippen) ──
// Titel sind KEIN Diskriminator (Dr. med. = legitimer Fachrichter). Rollen-Nomen
// (Bundesrichter…, Richter…, les Juges fédéraux…, Giudici…) markieren nur die Funktion.
//
// REIHENFOLGE IST BEDEUTUNGSTRAGEND: Rollen-PHRASEN («les Juges fédéraux», «la Juge
// fédérale») werden als GANZES gestrippt, BEVOR einzelne Tokens drankommen. Die
// blossen Artikel/Partikel «de/di/du/la/le/des» stehen NICHT mehr als Einzel-
// Alternative in der Liste (Befund 20.7.2026): sie sind in romanischen Nachnamen
// Namensbestandteil — «Mme la Juge fédérale de Werra» ergab mit Einzel-Strip
// fälschlich «Werra» statt «de Werra», also einen zweiten, falschen Richter-Slug.
const LEAD_STRIP = new RegExp(
  '^(?:' + [
    // (1) Rollen-Phrasen als Einheit (Artikel + Rollennomen + Zusatz)
    '(?:(?:les|la|le|il|i|gli|der|die|das)\\s+)?(?:Juges?|Giudici|Giudice)(?:\\s+(?:f[ée]d[ée]ra(?:les|le|ux|l)|p[ée]na(?:les|le|ux|l)|federal[ie]|penal[ie]))?',
    // (1b) Zustimmungs-Formeln (BVGer-Einzelrichter entscheidet MIT ZUSTIMMUNG
    //      einer zweiten Richterperson — die ist mitwirkend und gehört erfasst,
    //      die Formel davor nicht).
    'mit\\s+Zustimmung\\s+von', 'avec\\s+l[\'’]approbation\\s+(?:de\\s+l[ae]?|du|des)?',
    'con\\s+l[\'’]approvazione\\s+(?:dell[ao]?|del|degli)?',
    // (1c) Nebenamt/Ausserordentlichkeit — Funktionszusatz, kein Namensteil.
    'nebenamtliche[rn]?', 'ausserordentliche[rn]?',
    // (2) Schweizer Gerichts-Rollennomen
    'Bundesrichter(?:innen|in)?', 'Bundesstrafrichter(?:in)?',
    'Bundesverwaltungsrichter(?:in)?', 'Bundespatentrichter(?:in)?',
    'Kantonsrichter(?:in)?', 'Oberrichter(?:in)?', 'Appellationsrichter(?:in)?',
    'Statthalter(?:in)?', 'Instruktionsrichter(?:in)?', 'Gerichtspr[äa]sident(?:in)?',
    'Richter(?:innen|in)?',
    // (3) Anreden — «M.» steht bewusst NICHT hier, sondern nur in der
    //     französischen Variante (siehe LEAD_STRIP_FR): im deutschsprachigen
    //     Kantonstext ist «M.» ein VORNAMEN-INITIAL, keine Anrede.
    'MM\\.?', 'Mmes', 'Mme', 'Monsieur', 'Madame', 'Frau', 'Herr',
    // (4) akademische Titel + Grade (nie Diskriminator, nur Rauschen)
    'Prof\\.', 'Ass\\.\\s*-?\\s*Prof\\.', 'PD',
    'Dr\\.\\s*med\\.\\s*dent\\.', 'Dr\\.\\s*med\\.', 'Dr\\.\\s*iur\\.',
    'Dr\\.\\s*sc\\.\\s*nat\\.\\s*ETH', 'Dr\\.\\s*sc\\.\\s*nat\\.', 'Dr\\.\\s*phil\\.',
    'Dr\\.\\s*rer\\.\\s*[a-z]+\\.?', 'Dr\\.',
    // «lic»/«iur» auch OHNE Punkt: die Amtstexte tragen reale Tippfehler
    // («lic iur. André Equey», «lic .iur André Equey») — ohne Toleranz entstünden
    // daraus die Fehl-Slugs «iur-andre-equey-l» / «andre-equey-i».
    'lic\\.?\\s*iur\\.?', 'lic\\.?\\s*phil\\.?', 'lic\\.?\\s*oec\\.?', 'lic\\.?',
    'iur\\.?', 'med\\.', 'phil\\.', 'oec\\.', 'pharm\\.', 'dent\\.', 'rer\\.', 'nat\\.', 'sc\\.',
    'Dipl\\.[-\\w]*\\.?', 'dipl\\.', 'MLaw', 'BLaw', 'MA\\s+HSG', 'M\\.A\\.\\s*HSG',
    'LL\\.?\\s*M\\.?', 'LL\\.?\\s*B\\.?', 'E?MBA', 'MAS', 'CAS', 'Ph\\.?D\\.?',
    // «a.o.» (ausserordentlich) erscheint auch gesperrt gesetzt: «a. o.
    // Gerichtsschreiber». Ohne die \s*-Toleranz blieb «o.» stehen und wurde zum
    // Phantom-Nachnamen «o» (BES.2022.50).
    'a\\.\\s*o\\.', 'ao\\.',
    // bpatger: Fachrichter-Disziplinen + Reihungswort «Erster/Erste».
    'Bio-?chem\\.(?:-ing\\.)?', 'chem\\.(?:-ing\\.)?', 'phys\\.', 'biol\\.', 'ETH', 'Erste[rn]?',
    // Das Rubrum-Label selbst rutscht bei einzelnen Bund-Entscheiden in den
    // Freitext («Besetzung Bundesrichter Maillard»).
    'Besetzung',
    // Amtlicher Tippfehler im Rollennomen (BGE: «Bunderichterin Hänni»).
    'Bunde(?:s)?richter(?:innen|in)?',
    // (5) Konnektoren / Beiwerk
    'et', 'ed', 'und', '&', 'avec', 'les',
    'l[\'’]approbation', 'approvazione',
  ].join('|') + ')(?=$|[\\s.,])',
  'i',
);

// ── Wörter, die nach dem Strip NIE ein Nachname sind ──
// (Rollen-/Funktions- und Füllwörter, die real als eigenes Segment auftauchen und
//  sonst zu Phantom-Richtern würden: «suppléante», «als», «LL.M.», «a.o» …)
const STOPP_NACHNAME: ReadonlySet<string> = new Set([
  'suppleant', 'suppleante', 'suppleants', 'suppleantes', 'supplente', 'supplenti',
  'als', 'der', 'die', 'das', 'dem', 'den', 'und', 'et', 'ed', 'avec',
  'llm', 'llb', 'mlaw', 'blaw', 'mba', 'emba', 'mas', 'cas', 'phd',
  'iur', 'med', 'phil', 'oec', 'nat', 'sc', 'rer', 'dipl', 'ao', 'pd',
  'vorsitz', 'mitglied', 'praesident', 'prasident', 'president', 'presidente',
  'gerichtsschreiber', 'gerichtsschreiberin', 'greffier', 'greffiere',
  'einzelrichter', 'einzelrichterin', 'einzelgericht', 'referent', 'referentin',
  'hsg', 'eth',
]);

const KONJUNKTION_LEAD = /^(?:und|et|ed|e|&)\b[\s,]*/i;

/**
 * Titel, die mitten im Segment einen NEUEN Namen einleiten.
 *
 * Ein akademischer Titel steht immer VOR einem Namen — taucht er auf, nachdem
 * bereits ein Name begonnen hat, fehlt im Amtstext schlicht das Komma. Realfall
 * BEZ.2025.75 (amtlicher Erfassungsfehler, in EINEM Absatz):
 *   «Dr. Olivier Steiner Dr. Claudius Gelzer, lic. iur. André Equey»
 * Ohne diesen Schnitt entstand die erfundene Person «Olivier Steiner Dr. Claudius
 * Gelzer», während Gelzer als eigener Richter verschwand.
 *
 * Der Schnitt greift NUR, wenn vor dem Titel schon ein gross geschriebenes
 * Nicht-Titel-Wort steht — «Ass.-Prof. Dr. Cordula Lötscher» und «Dr. med. F. W.
 * Eymann» (Titelketten) bleiben dadurch unangetastet.
 */
const INTERNER_TITEL =
  /(?<=\b\p{Lu}[\p{L}'’-]{2,}\s)(?=(?:Prof\.|Ass\.\s*-?\s*Prof\.|Dr\.|lic\.\s*iur\.|lic\.|MLaw|BLaw|Dipl\.|PD|Bunde(?:s)?richter(?:innen|in)?|Bundesstrafrichter(?:in)?|Bundesverwaltungsrichter(?:in)?|Richter(?:innen|in)?)\s)/gu;

/** Segment an internen Titel-Startpunkten auftrennen (amtliche Komma-Fehler heilen). */
function trenneInterneTitel(seg: string): string[] {
  return seg.split(INTERNER_TITEL).map((x) => x.trim()).filter(Boolean);
}

/** Diakritika-/Ligatur-Faltung für den Kanon-Slug (deterministisch, §2). */
export function fold(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // kombinierende Diakritika
    .replace(/ß/g, 'ss')
    .replace(/æ/gi, 'ae')
    .replace(/œ/gi, 'oe')
    .replace(/ø/gi, 'o')
    .toLowerCase()
    .replace(/['’.]/g, '')                // Apostrophe/Punkte fallen weg
    .replace(/[^a-z0-9]+/g, '-')          // alles Übrige → Bindestrich
    .replace(/^-+|-+$/g, '');
}

/**
 * Kuratierte Alias-Tabelle (deterministisch): OCR-/Schreibvarianten desselben
 * Richters → Kanon-Slug. Nur belegte, gleich-Person-gleich-Gericht-Paare
 * (Abnahme-Status «Erstrecherche»). Neue Kandidaten kommen aus dem Kollisions-
 * Report (Nah-Duplikat-Slugs), nicht aus Raten.
 */
export const ALIAS: Readonly<Record<string, string>> = Object.freeze({
  // Belegt über den Nah-Duplikat-Report (Levenshtein ≤ 1 auf dem Kanon-Slug) am
  // Gesamtkorpus 20.7.2026. Aufnahmekriterium (streng, damit nie zwei Personen
  // verschmelzen): identischer Nachname+Vorname bis auf EINEN Zeichen-Dreher,
  // dasselbe Gericht, und ein stark asymmetrisches Auftreten (die Variante
  // erscheint 1–2×, die Kanon-Form 50–500×) — das Muster eines Erfassungsfehlers
  // im Amtstext, nicht zweier Amtsträger. Abnahme-Status: Erstrecherche (§11).
  'hoenen-christan': 'hoenen-christian',              //   1× ↔ 516×
  'steiner-oliver': 'steiner-olivier',                //   1× ↔ 389×
  'dellena-anja': 'dillena-anja',                     //   1× ↔ 137×
  'gutmanns-bauer-heidrun': 'gutmannsbauer-heidrun',  //   1× ↔ 107×
  'zingg-denis': 'zingg-dennis',                      //   1× ↔  51×
  'mabillard-roman': 'mabillard-ramon',               //   1× ↔ 183×
  'thurnherrr-keller-daniela': 'thurnherr-keller-daniela', // 2× ↔ 160×
  'turnherr-keller-daniela': 'thurnherr-keller-daniela',   // 1× ↔ 160×
  'wullschleger-st': 'wullschleger-stephan',          //   1× ↔ 691× (Kurzform «St.»)
  // NICHT aufgenommen (bewusst getrennt gelassen, verschiedene Personen):
  //   bollinger ~ zollinger · braun ~ brun · ramelli ~ raselli · trutmann ~ truttmann
  //   christ-e ~ christ-l · meier-a ~ meyer-a · steiner-j ~ steiner-s
});

/** Slug ggf. über die Alias-Tabelle auf den Kanon abbilden. */
export function kanonSlug(slug: string): string {
  return ALIAS[slug] ?? slug;
}

// ── Name-Tokenisierung → {given, surname} ──
interface NameTeile { given: string | null; surname: string; }

/**
 * Namenspartikel, die zum NACHNAMEN gehören und nie ein Vorname sind.
 * Ohne diese Liste zerlegte «de Sépibus» in given=«de» / surname=«Sépibus» und
 * erzeugte den Slug `sepibus-de` statt `de-sepibus` (Korpus-Befund 20.7.2026).
 */
const PARTIKEL: ReadonlySet<string> = new Set([
  'de', 'di', 'du', 'da', 'dal', 'del', 'della', 'dello', 'des', 'van', 'von',
  'vom', 'zu', 'zur', 'ten', 'ter', 'le', 'la', "d'", 'op', 'af',
]);

function tokenisiereName(rest: string, nurNachname: boolean): NameTeile | null {
  const toks = rest.split(/\s+/).filter(Boolean);
  if (!toks.length) return null;
  if (nurNachname) {
    // Nachgestellte Einzel-Initiale abwerfen: «Bundesrichter Stadelmann T.»
    // (BGE 148 V 114) ergab sonst den Nachnamen «Stadelmann T» — ein zweiter,
    // toter Eimer neben dem echten «Stadelmann». Bei Nur-Nachname-Gerichten
    // trägt der Amtstext nie einen Vornamen, ein Rest-Initial ist also Rauschen.
    const ohne = toks.length > 1 && /^[A-ZÄÖÜ]\.?$/.test(toks[toks.length - 1])
      ? toks.slice(0, -1)
      : toks;
    return { given: null, surname: ohne.join(' ') };
  }
  if (toks.length === 1) return { given: null, surname: toks[0] };
  // Führendes Partikel ⇒ der ganze Rest ist der Nachname («de Sépibus», «van de Graaf»).
  if (PARTIKEL.has(toks[0].toLowerCase())) return { given: null, surname: toks.join(' ') };
  // Führende Initialen («G.», «F. W.») → Vorname(n), Rest = Nachname.
  // MEHRERE Initialen müssen ALLE konsumiert werden (Befund Gegenprüfung
  // 20.7.2026): «Dr. med. F. W. Eymann» ergab mit Ein-Initial-Regel den Nachnamen
  // «W. Eymann» und den Slug `w-eymann-f` — eine Suche nach «Eymann» fand den
  // Fachrichter nicht mehr. Der Anzeigename behält alle Initialen («F. W. Eymann»),
  // der Slug bindet an das ERSTE (`eymann-f`), damit er stabil bleibt.
  const istInitiale = (t: string) => /^[A-ZÄÖÜ]\.?$/.test(t) && t.replace('.', '').length === 1;
  if (istInitiale(toks[0])) {
    let i = 0;
    while (i < toks.length - 1 && istInitiale(toks[i])) i++;
    // i zeigt aufs erste Nicht-Initial-Token = Beginn des Nachnamens.
    return { given: toks.slice(0, i).join(' '), surname: toks.slice(i).join(' ') };
  }
  // Sonst: erstes Token = Vorname, Rest = Nachname(n) (mehrteilige Nachnamen bleiben zusammen).
  // MITTEL-Initialen gehören zum Vornamen, nicht zum Nachnamen: «Christoph A. Spenlé»
  // ergab sonst den Nachnamen «A. Spenlé» (Slug `a-spenle-christoph`) — eine Suche
  // nach «Spenlé» fand ihn nicht mehr.
  let i = 1;
  while (i < toks.length - 1 && /^[A-ZÄÖÜ]\.?$/.test(toks[i]) && toks[i].replace('.', '').length === 1) i++;
  return { given: toks.slice(0, i).join(' '), surname: toks.slice(i).join(' ') };
}

/**
 * Slug-Teile aus einem Namen.
 *
 * Der Vorname geht VOLLSTÄNDIG in den Slug (nicht nur als Initial) — ABWEICHUNG vom
 * Bauplan, erzwungen durch einen echten Korpus-Befund (20.7.2026): am
 * Appellationsgericht BS amten «Patrizia Schmid» (150 Entscheide) UND «Patrick
 * Schmid» (37 Entscheide). Ein Initial-Slug `schmid-p` verschmilzt die beiden zu
 * EINER Person — ein Nutzer, der nach Patrizia Schmid filtert, bekäme Patricks
 * Entscheide mitgeliefert (§1-Verstoss, und im Richter-Filter der teuerste
 * denkbare Fehler). Mit vollem Vornamen entstehen `schmid-patrizia` und
 * `schmid-patrick` sauber getrennt.
 *
 * Nennt die Quelle nur ein Initial («P. Schmid», SVG-Stil), bleibt der Slug
 * zunächst `schmid-p`; der korpus-globale Kanon-Pass (`kanonisiere`) führt ihn
 * NUR dann auf einen Vollnamen zurück, wenn dieser eindeutig ist — sonst bleibt er
 * ein eigener Eimer und wird als Kollision berichtet (nie raten, §2/§8).
 */
function slugTeile(t: NameTeile): { slug: string; nachSlug: string; givenSlug: string | null } {
  const nachSlug = fold(t.surname);
  if (!t.given) return { slug: nachSlug, nachSlug, givenSlug: null };
  // Mehrere Initialen («F. W.») binden im Slug nur an die ERSTE: sonst entstünde
  // `eymann-f-w` mit givenSlug «f-w» (Länge 3), und der Kanon-Pass hielte das für
  // einen ausgeschriebenen Vornamen — «F. W. Eymann» und ein späteres
  // «Fritz Eymann» würden dann nie zusammengeführt. Mit `eymann-f` bleibt die
  // Initial-Semantik (Länge 1) erhalten, die `kanonisiere()` auswertet.
  const givenSlug = fold(t.given.split(/\s+/)[0]);
  if (!givenSlug) return { slug: nachSlug, nachSlug, givenSlug: null };
  return { slug: `${nachSlug}-${givenSlug}`, nachSlug, givenSlug };
}

/**
 * «M.» als ANREDE (Monsieur) — nur im französischsprachigen Gerichtstext.
 *
 * KOLLISION (Befund Gegenprüfung 20.7.2026): «M.» ist mehrdeutig. In den
 * französischen Bundes-Rubra ist es die Anrede («M. le Juge fédéral Denys»,
 * «Greffier: M. Dyens») und muss weg; in den deutschsprachigen Basler Rubra ist es
 * ein VORNAMEN-INITIAL («lic. iur. M. Prack Hoenen», «Dr. M. Meier») und muss
 * bleiben. Wurde es global gestrippt, entstand aus «M. Prack Hoenen» der Slug
 * `hoenen-prack` — Vorname weg, zweiteiliger Nachname zerlegt, also eine falsche
 * Person. Der Diskriminator ist die Instanz-Sprache, nicht der Text selbst:
 * die Anrede tritt nur dort auf, wo auch die Rollen-Nomen französisch sind.
 */
const LEAD_STRIP_FR = /^(?:MM\.|M\.)(?=$|[\s.,])/i;

/** Gerichte, deren Rubra Anreden (M./Mme) statt Initialen führen. */
const ANREDE_GERICHTE: ReadonlySet<string> = new Set([
  'bge', 'bger', 'bvger', 'bstger', 'bpatger',
]);

/** Titel/Rollen-Nomen wiederholt vom Segmentanfang strippen. */
function stripLead(seg: string, anrede: boolean): string {
  let s = seg.trim();
  for (;;) {
    const before = s;
    if (anrede) s = s.replace(LEAD_STRIP_FR, '').replace(/^[\s.,]+/, '');
    s = s.replace(LEAD_STRIP, '').replace(/^[\s.,]+/, '');
    if (s === before) break;
  }
  return s.trim();
}

/**
 * Satzzeichen-Rauschen am Segment-Ende entfernen.
 *
 * Zwei reale Muster (Korpus 20.7.2026):
 *  · Bund-Freitexte enden auf einen Satzpunkt («… et Muschietti.») — ohne Trim
 *    entstehen zwei Anzeigenamen für DENSELBEN Slug («Haag» vs. «Haag.»), was den
 *    Kollisions-Report mit ~30 Phantom-Merges flutet und den Anzeigenamen verfälscht.
 *  · BS-Deckblätter tragen leere Klammer-Reste («Liselotte Henz ( )»).
 * Der Slug war davon nie betroffen (fold() wirft '.' weg) — der ANZEIGENAME schon.
 */
/**
 * Nachgestellte Rollen-/Reihungswörter (bpatger: «Hannes Spillmann Richter»,
 * «… Marco Zardi Erster»). Vorangestellte Rollen fängt LEAD_STRIP; am ENDE braucht
 * es einen eigenen Schnitt, sonst wandert das Rollenwort in den Nachnamen.
 */
const TRAIL_ROLLE =
  /\s+(?:Erste[rn]?|Richter(?:innen|in)?|Bundespatentrichter(?:in)?|Vorsitzende[rn]?)\s*$/i;

function trimRand(seg: string): string {
  return seg
    .replace(TRAIL_ROLLE, ' ')
    .replace(/\(\s*\)/g, ' ')          // leere Klammern
    .replace(/[\s.,;:]+$/g, '')        // Schluss-Interpunktion
    .replace(/\s+/g, ' ')
    .trim();
}

/** Ein bereinigtes Namens-Segment → RichterRoh (oder null, wenn kein valider Name). */
function segmentZuRichter(
  seg: string,
  rolle: RichterRolle,
  nurNachname: boolean,
  anrede: boolean,
): { r: RichterRoh } | { leak: true } | null {
  const trimmed = seg.trim();
  if (!trimmed) return null;
  // Guard: anonymisierte Person / Partei-Marker → NIE als Richter.
  if (istAnonymisiert(trimmed)) return { leak: true };
  if (PARTEI_RE.test(trimmed)) return null;
  const rest = trimRand(stripLead(trimRand(trimmed), anrede));
  if (!rest) return null;
  // Nach dem Strip erneut auf Anonymisierung prüfen (z.B. «med. X»).
  if (istAnonymisiert(rest)) return { leak: true };
  // Ein Rest, der noch Ziffern oder ein verbliebenes Rollen-/Verfahrenswort trägt,
  // ist nicht sicher ein Name → verwerfen (Ehrlichkeit, lieber leer als falsch).
  if (/\d/.test(rest)) return null;
  const teile = tokenisiereName(rest, nurNachname);
  if (!teile || !teile.surname) return null;
  // Nachname muss mit einem Buchstaben beginnen (kein Rest-Satzzeichen).
  if (!/[A-Za-zÀ-ÿ]/.test(teile.surname)) return null;
  // Rollen-/Füllwort statt Nachname → kein Richter (§8: lieber leer als falsch).
  if (STOPP_NACHNAME.has(fold(teile.surname))) return null;
  const name = teile.given ? `${teile.given} ${teile.surname}` : teile.surname;
  const st = slugTeile(teile);
  return { r: { slug: st.slug, nachSlug: st.nachSlug, givenSlug: st.givenSlug, name, nameRoh: rest, rolle } };
}

/** Segment-Trenner: Komma, Semikolon, « und »/« et »/« e »/« ed » (mit Whitespace). */
function segmentiere(s: string): string[] {
  return s
    .split(/,|;|\s+und\s+|\s+et\s+|\s+ed?\s+|\s+&\s+/i)
    .map((x) => x.trim())
    .filter(Boolean);
}

export interface BesetzungErgebnis {
  richter: RichterRoh[];
  /** true ⇒ Guard hat ein Anonymisierungs-Token im Besetzungsblock erkannt (Report). */
  leakErkannt: boolean;
  /** true ⇒ Freitext war nicht sicher strukturierbar (nichts emittiert, §8). */
  unstrukturiert: boolean;
}

/**
 * Besetzungs-Freitext → strukturierte Richterliste (deterministisch, §2).
 * Reihenfolge: (1) Gerichtsschreiber-Teil abtrennen, (2) Richter-Teil segmentieren,
 * (3) je Segment Rolle ernten + Titel/Rollen strippen + Namen bilden.
 */
export function parseBesetzung(
  freitext: string | null | undefined,
  ctx: BesetzungKontext,
): BesetzungErgebnis {
  const leer: BesetzungErgebnis = { richter: [], leakErkannt: false, unstrukturiert: false };
  const roh = (freitext ?? '').replace(/[\u00a0\u202f]/g, ' ').replace(/\s+/g, ' ').trim();
  if (!roh) return leer;
  const nurNachname = NUR_NACHNAME_GERICHTE.has(ctx.gericht);
  const anrede = ANREDE_GERICHTE.has(ctx.gericht);
  let leakErkannt = false;

  // ── (1) Gerichtsschreiber-Teil abtrennen ──
  // (a) Doppelpunkt-Form «Greffier: M. Douzals» / «Gerichtsschreiber: X».
  // (b) Rollen-vorangestellt «Gerichtsschreiberin Sauthier» / «la greffière X».
  // (c) Nachgestellt am Ende «…, greffier» (FR juge unique) — Name steht DAVOR.
  let richterTeil = roh;
  const gsNamen: string[] = [];

  // (c) trailing «, greffier[e]»/«, cancelliere» ohne folgenden Namen → Name davor.
  const trailGs = /[,;]\s*(?:la\s+|le\s+|il\s+)?(?:greffi[eè]re?|cancellier[ea])\s*$/i;
  const mTrail = trailGs.exec(richterTeil);
  if (mTrail) {
    const vor = richterTeil.slice(0, mTrail.index);
    // letztes Namens-Chunk (nach letztem Komma/Semikolon/;) ist der GS-Name
    const chunk = vor.split(/[,;]/).pop()?.trim() ?? '';
    if (chunk) gsNamen.push(chunk);
    richterTeil = vor.slice(0, vor.length - chunk.length).replace(/[,;]\s*$/, '').trim();
  }

  // (a)+(b) erstes GS-Rollen-Token → alles ab dort ist GS-Teil.
  const gsMarker = new RegExp(
    `(?:und\\s+)?(?:a\\.\\s*o\\.\\s*|ao\\.\\s+)?(?:die\\s+|der\\s+|la\\s+|le\\s+|il\\s+)?(?:${GS_TOKEN.source})\\s*:?\\s*`,
    'i',
  );
  const mGs = gsMarker.exec(richterTeil);
  if (mGs) {
    const gsTeil = richterTeil.slice(mGs.index + mGs[0].length);
    richterTeil = richterTeil.slice(0, mGs.index).replace(/[,;]\s*$/, '').trim();
    for (const seg of segmentiere(gsTeil).flatMap(trenneInterneTitel)) gsNamen.push(seg);
  }

  // ── (2)+(3) Richter-Segmente ──
  const richter: RichterRoh[] = [];
  const vorigenAlsVorsitz = (): void => {
    if (richter.length) richter[richter.length - 1].rolle = 'vorsitz';
  };
  // Interne Titel als zusätzliche Segmentgrenze (heilt fehlende Kommas im Amtstext).
  const segmente = segmentiere(richterTeil).flatMap(trenneInterneTitel);
  for (const seg0 of segmente) {
    const seg = seg0.replace(KONJUNKTION_LEAD, '').trim();
    if (!seg) continue;
    const mV = VORSITZ_RE.exec(seg);
    const hatVorsitz = !!mV;
    // Steht der Vorsitz-Marker am Segment-ANFANG und folgt ihm ein eigener Name
    // («Vorsitzende Richter Thormann», BVGer), gilt der Vorsitz dem VORIGEN Richter
    // — der Marker ist eine nachgestellte Kennzeichnung, die ans nächste Segment
    // geklebt wurde. Folgt der Marker dem Namen («Wullschleger (Vorsitz)») oder
    // steht er isoliert («…, Präsident, …»), gilt er dem aktuellen/vorigen Namen.
    const vorsitzLeitet = hatVorsitz && mV!.index === 0;
    const ohneMarker = seg
      .replace(VORSITZ_RE, ' ')
      .replace(/\bMitglied\b/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    const eigeneRolle: RichterRolle = hatVorsitz && !vorsitzLeitet ? 'vorsitz' : 'mitglied';
    const res = segmentZuRichter(ohneMarker, eigeneRolle, nurNachname, anrede);
    if (res && 'leak' in res) { leakErkannt = true; continue; }
    if (!res) {
      // Reiner/leitender Marker ohne eigenen Namen («Präsident») → gilt dem Vorigen.
      if (hatVorsitz) vorigenAlsVorsitz();
      continue;
    }
    // Leitender Marker MIT eigenem Namen: der Vorsitz gilt dem vorigen Richter,
    // der aktuelle Name ist Mitglied (schon so gesetzt).
    if (vorsitzLeitet) vorigenAlsVorsitz();
    richter.push(res.r);
  }

  // ── Gerichtsschreiber ──
  for (const seg of gsNamen) {
    const res = segmentZuRichter(seg, 'gerichtsschreiber', /* GS immer mit Namen */ false, anrede);
    if (res && 'leak' in res) { leakErkannt = true; continue; }
    if (res) richter.push(res.r);
  }

  // ── Vorsitz-Default: hat kein Richter einen expliziten Vorsitz-Marker, gilt
  // der erste Richter als Vorsitz (amtliche Reihung nennt den Vorsitz zuerst). ──
  const richterOhneGs = richter.filter((r) => r.rolle !== 'gerichtsschreiber');
  if (richterOhneGs.length && !richterOhneGs.some((r) => r.rolle === 'vorsitz')) {
    richterOhneGs[0].rolle = 'vorsitz';
  }

  // ── Ehrlichkeits-Gate (§8): kein einziger Richter (nur GS oder nichts) erkannt,
  // obwohl Freitext vorhanden → unstrukturiert; nichts Halbes emittieren. ──
  if (!richterOhneGs.length) {
    return { richter: [], leakErkannt, unstrukturiert: !leakErkannt };
  }
  return { richter, leakErkannt, unstrukturiert: false };
}

// ─────────────────────────────────────────────────────────────────────────────
// Korpus-globaler Kanon-Pass
// ─────────────────────────────────────────────────────────────────────────────
//
// Der Parser sieht immer nur EINEN Entscheid und kann darum nicht wissen, ob das
// Initial in «P. Schmid» für Patrizia oder Patrick steht. Diese Auflösung braucht
// den Blick über den ganzen Korpus — sie passiert deshalb hier, EINMAL beim
// Generieren des Registers, deterministisch und ohne zu raten.

export interface KanonEintrag {
  slug: string;
  nachSlug: string;
  givenSlug: string | null;
  name: string;
  /**
   * Namensraum der Zusammenführung (z.B. 'CH' für Bundesgerichte, 'BS' für
   * Basler Gerichte). Initial→Vollname wird NUR innerhalb desselben Raums
   * aufgelöst: ein Bundesrichter «Müller» und ein Basler «Markus Müller» sind
   * verschiedene Personen und dürfen nie verschmelzen (§1).
   */
  raum: string;
}

export interface KanonErgebnis {
  /** `${raum}|${rohSlug}` → Kanon-Slug. */
  map: Map<string, string>;
  /** Kanon-Slug → Anzeigename (die vollständigste beobachtete Schreibweise). */
  anzeige: Map<string, string>;
  /** Report-Zeilen: mehrdeutige Initialen + gleicher Slug mit divergenten Vornamen. */
  kollisionen: string[];
}

/**
 * Führt Roh-Slugs korpusweit auf Kanon-Slugs zurück.
 *
 * Regeln (alle deterministisch, alle konservativ):
 *  1. Ein Initial-Slug («schmid-p») wird auf einen Vollnamen-Slug («schmid-patrizia»)
 *     abgebildet, wenn im selben Raum GENAU EIN Vollname mit diesem Anfangs-
 *     buchstaben existiert. Gibt es mehrere (Patrizia UND Patrick), bleibt der
 *     Initial-Eimer eigenständig und wird als Kollision berichtet — geraten wird nie.
 *  2. Nur-Nachname-Slugs (BGE/BGer-Stil) werden NICHT in Vornamen-Eimer gezogen:
 *     die Bundesgerichte nennen konsequent nur Nachnamen, die kantonalen Gerichte
 *     konsequent Vornamen — eine Zusammenführung wäre eine Vermutung über
 *     Personenidentität quer durch die Instanzen (§1/§8).
 *  3. Der Anzeigename je Kanon-Slug ist die längste beobachtete Schreibweise
 *     (Gleichstand → lexikographisch kleinste), damit die Ausgabe stabil ist (§2).
 */
export function kanonisiere(eintraege: readonly KanonEintrag[]): KanonErgebnis {
  // (a) Vollnamen je (Raum, Nachname) sammeln.
  const voll = new Map<string, Set<string>>();
  for (const e of eintraege) {
    if (!e.givenSlug || e.givenSlug.length <= 1) continue;
    const k = `${e.raum}|${e.nachSlug}`;
    (voll.get(k) ?? voll.set(k, new Set()).get(k)!).add(e.givenSlug);
  }

  // (b) Roh-Slug → Kanon-Slug.
  const map = new Map<string, string>();
  const kollisionen: string[] = [];
  const mehrdeutig = new Set<string>();
  for (const e of eintraege) {
    const key = `${e.raum}|${e.slug}`;
    if (map.has(key)) continue;
    let ziel = kanonSlug(e.slug);
    if (e.givenSlug && e.givenSlug.length === 1) {
      const kandidaten = [...(voll.get(`${e.raum}|${e.nachSlug}`) ?? [])]
        .filter((g) => g.startsWith(e.givenSlug!))
        .sort();
      if (kandidaten.length === 1) ziel = kanonSlug(`${e.nachSlug}-${kandidaten[0]}`);
      else if (kandidaten.length > 1) mehrdeutig.add(`${e.raum}|${e.slug}|${kandidaten.join(',')}`);
    }
    map.set(key, ziel);
  }
  for (const m of [...mehrdeutig].sort()) {
    const [raum, slug, kand] = m.split('|');
    kollisionen.push(
      `MEHRDEUTIGES INITIAL — ${raum}/${slug}: passt auf ${kand.split(',').join(' und ')} ` +
      `→ bleibt eigener Eimer (nicht zugeordnet, §8).`,
    );
  }

  // (c) Anzeigenamen + Divergenz-Report je Kanon-Slug.
  const namen = new Map<string, Map<string, number>>();
  for (const e of eintraege) {
    const ziel = map.get(`${e.raum}|${e.slug}`)!;
    const m = namen.get(ziel) ?? namen.set(ziel, new Map()).get(ziel)!;
    m.set(e.name, (m.get(e.name) ?? 0) + 1);
  }
  const anzeige = new Map<string, string>();
  for (const [slug, m] of [...namen].sort((a, b) => a[0].localeCompare(b[0]))) {
    const sortiert = [...m.keys()].sort((a, b) => b.length - a.length || a.localeCompare(b));
    anzeige.set(slug, sortiert[0]);
    // Divergente VORNAMEN unter einem Slug sind der klassische False-Merge.
    const vornamen = new Set(
      [...m.keys()].map((n) => n.split(/\s+/)[0]).filter((v) => v.length > 2),
    );
    if (vornamen.size > 1) {
      kollisionen.push(
        `DIVERGENTE VORNAMEN — ${slug}: ${[...m.entries()]
          .sort((a, b) => b[1] - a[1])
          .map(([n, c]) => `«${n}»×${c}`)
          .join(' | ')} → prüfen, ob eine Person (Tippfehler) oder zwei (Alias/Trennung nötig).`,
      );
    }
  }
  return { map, anzeige, kollisionen };
}
