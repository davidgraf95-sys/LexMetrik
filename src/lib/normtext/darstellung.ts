// Reine Darstellungs-Normalisierungen (§3 — Wortlaut wird NICHT verändert,
// nur Extraktions-Artefakte für die Anzeige getrennt). Hier ausgelagert, damit
// sowohl die Render-Komponente (ArtikelBody) als auch die Lesesicht
// (GesetzLeser, Download-Text) dieselbe Wahrheit teilen — und damit der
// react-refresh-Lint (nur Komponenten-Exporte je Datei) grün bleibt.

// Änderungs-/Quellenhistorie, die der Fedlex-Snapshot für aufgehobene/eingefügte
// und Bereichs-Artikel (z. B. OR 40g, 274–274g, ArG 21) FÄLSCHLICH in den
// Wortlaut-Block mischt. Signatur: die hochgestellte Fussnoten-Nummer steht im
// Text VERDOPPELT («… 25 25 Eingefügt durch …», «53 53 Fassung gemäss …»),
// gefolgt von einem Historie-Schlüsselwort. Davor steht entweder echter Wortlaut
// (in-Kraft-Artikel mit angehängter Fussnote) ODER nur ein geleakter Label-Rest
// («g», «– 274 g», «und 34» — kein echtes Wort). Eng getriggert (verdoppelte
// IDENTISCHE Nummer + Stichwort), damit echter Normtext nie zerschnitten wird.
// Die abgetrennte Historie selbst gehört an den Artikelfuss (dort ohnehin als
// amtliche Sidecar-Fussnote vorhanden); fehlt die Sidecar-Fussnote, dient sie
// als Rückfall.
const HISTORIE_STICHWORT =
  'Aufgehoben|Eingefügt|Fassung gemäss|Ursprünglich|Tritt|Siehe auch|In Kraft|Berichtigt|Bereinigt';
// Starke Änderungs-Stichwörter: die leiten IMMER eine Fussnoten-/Historie-Notiz ein,
// nie echten Normtext-Inhalt → dort genügt ein Zwei-Nummern-Präfix (Fussnoten-Ref +
// Definitionsnummer, oft VERSCHIEDEN, z.B. «337 336 Aufgehoben durch …»).
const HISTORIE_STARK = 'Aufgehoben|Eingefügt|Fassung gemäss';
// (a) gleiche Doppelnummer «131 131 <Stichwort>» (alle Stichwörter, konservativ);
// (b) zwei beliebige Nummern «337 336 <starkes Stichwort>» (deckt verschiedene
//     Fussnoten-Ref/Def-Nummern, ohne weiche Stichwörter wie «Tritt» falsch zu greifen).
const HISTORIE_RE = new RegExp(
  `(\\d{1,3})\\s+\\1\\s+(?=(?:${HISTORIE_STICHWORT})\\b)` +
  `|(?:\\d{1,3}\\s+){1,3}(?=(?:${HISTORIE_STARK})\\b)`,
);

export function trenneAenderungshistorie(text: string): { wortlaut: string; historie: string | null } {
  const m = text.match(HISTORIE_RE);
  if (!m || m.index == null) return { wortlaut: text, historie: null };
  const davor = text.slice(0, m.index).trim();
  const historie = text.slice(m.index + m[0].length).trim() || null;
  // Echter Wortlaut trägt mindestens ein Wort (≥4 Buchstaben); ein geleakter
  // Label-Rest («g», «und 34», «– 274 g») nicht → verwerfen (Ganzkörper-Fall).
  const istWortlaut = /[A-Za-zÀ-ÿ]{4,}/.test(davor);
  return { wortlaut: istWortlaut ? davor : '', historie };
}

// Randtitel/Marginalien («A. Abschluss des Vertrages», «I. Übereinstimmende
// Willensäusserung», «1. Im Allgemeinen») für die Lesesicht aufbereiten: den
// strukturellen Aufzähler (A./I./1.) strippen, die übergeordneten Stufen als
// Oberzeilen (Versalien-Anzeige übernimmt das CSS), die unterste Stufe als
// eigentlichen Sachtitel. Rein Darstellung (§3).
// Aufzähler-Lauf am Anfang eines Randtitels: einzeln («A.», «1.») ODER
// kombiniert («II. und III.», «I. bis III.») — plus der nachfolgende Titel.
const ENUM = '(?:[A-Za-z]{1,4}|\\d{1,3})\\.';
const ENUM_RUN = new RegExp(`^(${ENUM}(?:\\s*(?:und|bis|[–-])\\s*${ENUM})*)\\s+(.*)$`);
// Aufgehobene Artikel tragen als «Titel» nur das Auslassungszeichen «…» — das
// ist keine echte Sachüberschrift und darf NICHT als Heading erscheinen.
const istLeererTitel = (t: string) => !t || /^[….]+$/.test(t.trim());

export function randtitelTeile(marginalie: string[]): { ober: string[]; titel: string | null } {
  const clean = marginalie
    .map((s) => { const m = s.match(ENUM_RUN); return (m ? m[2] : s).trim(); })
    .filter((t) => !istLeererTitel(t));
  if (clean.length === 0) return { ober: [], titel: null };
  return { ober: clean.slice(0, -1), titel: clean[clean.length - 1] };
}

// Wie randtitelTeile, aber jede Stufe einzeln mit ihrem Aufzähler erhalten —
// für die schmale (Fedlex-artige) Ansicht, die die Randtitel als gestufte
// Überschriften MIT Aufzähler («A. Anwendung des Rechts») über dem Artikel zeigt.
export function randtitelEintraege(marginalie: string[]): { mark: string; titel: string }[] {
  return marginalie
    .map((s) => {
      const m = s.match(ENUM_RUN);
      return m ? { mark: m[1], titel: m[2].trim() } : { mark: '', titel: s.trim() };
    })
    .filter((e) => !istLeererTitel(e.titel));
}

// Absatznummern mit lat. Suffix («1bis», «2ter») wurden bei der Extraktion teils
// NICHT ins absatz-Feld übernommen, sondern stehen am Textanfang («1bis Wurde …»),
// oder nur das Suffix leckte aus dem Feld («absatz=1», Text «bis Erfordert …»).
// Rekonstruiert die Marke für die hängende Darstellung (§3) — OHNE je das echte
// Wort «bis/ter» am Satzanfang («bis zum Ablauf …») zu strippen: der geleakte
// Suffix wird vom Absatz-Beginn (Grossbuchstabe) gefolgt.
const ABS_SUFFIX = '(?:bis|ter|quater|quinquies|sexies)';
export function absatzMarke(absatz: string | null, text: string): { marke: string | null; rest: string } {
  if (absatz == null) {
    const m = text.match(new RegExp(`^(\\d+${ABS_SUFFIX})\\s+`));
    return m ? { marke: m[1], rest: text.slice(m[0].length) } : { marke: null, rest: text };
  }
  const m = text.match(new RegExp(`^(${ABS_SUFFIX})\\s+(?=[A-ZÄÖÜ])`));
  return m ? { marke: absatz + m[1], rest: text.slice(m[0].length) } : { marke: absatz, rest: text };
}

// Schweizer Tausender-Apostrophe für die Betrag-Spalte der TarifTabelle (§1: nur
// Gruppierung, kein Zeichen geändert; §3: reine Darstellung). Verwendet den
// geraden Apostroph U+0027 — konsistent mit dem Zeichen, das die Fedlex-/LexWork-
// Snapshots selbst schreiben (z. B. «10'000» in BS-154.810.json, geprüft 22.6.2026).
//
// Zwei Pässe:
// 1. Leerzeichen-getrennte Tausender-Gruppen (ZH-PDF-Stil): «5 000» → «5'000»,
//    «1 250» → «1'250», «106 400» → «106'400». Wiederholt bis stabil (Ketten:
//    «1 234 567» → «1 234'567» → «1'234'567»). Nur wenn linke Seite eine oder
//    mehrere Ziffern UND die rechte Seite exakt 3 Ziffern ist, und darauf eine
//    Nicht-Ziffer oder Stringende folgt. Leerzeichen vor Buchstaben («10 Mio.»)
//    und normale Worttrennungen («mind. aber Fr. 100») werden NICHT angefasst
//    (die 3-Ziffern-Bedingung + (?=\D|$) schützt zuverlässig).
// 2. Zusammenhängende ≥4-stellige Ziffernfolgen (SG-/Bund-Stil, kein Leerzeichen):
//    «2000» → «2'000», «50000» → «50'000». Bereits gruppierte Zahlen («2'000»)
//    bleiben unberührt (Apostroph unterbricht den \d{4,}-Match).
export function gruppiereTausender(s: string): string {
  // Pass 0: Bereichs-Strich-Artefakt aus der PDF-Extraktion glätten — ein an die
  // linke Zahl geklebter Halbgeviert-/Geviertstrich mit Leerzeichen vor der
  // rechten Zahl («65– 250» → «65–250», «250– 420» → «250–420»). Nur Ziffer-
  // Strich-Leerzeichen-Ziffer; ein Strich mit Leerzeichen auf BEIDEN Seiten
  // («5 – 7») bleibt unberührt. Reine Darstellung (§3), keine Ziffer geändert.
  let r = s.replace(/(\d[–—])\s+(\d)/g, '$1$2');
  // Pass 1: Leerzeichen-getrennte Tausender (ZH-PDF) — wiederholen bis stabil.
  let prev: string;
  do {
    prev = r;
    r = r.replace(/(\d)\s(\d{3})(?=\D|$)/g, "$1'$2");
  } while (r !== prev);
  // Pass 2: zusammenhängende ≥4-stellige Läufe (SG/Bund-Stil).
  return r.replace(/\d{4,}/g, (n) => n.replace(/\B(?=(\d{3})+(?!\d))/g, "'"));
}

// Tausender-Gruppierung NUR in Geld-Kontext (Fliesstext, §3, FIX 2 — 22.6.2026).
//
// Zweck: In normalem Artikel-Fliesstext («Fr. 12 000» im ZH-PDF) werden Beträge
// mit ZH-PDF-Leerzeichen-Tausendertrenner dargestellt. Diese sollen in der Anzeige
// zum Schweizer Apostroph werden («Fr. 12'000»). ABER: bloss «gruppiereTausender»
// anzuwenden würde z. B. ein Jahreszahl «2011» → «2'011» verunstalten, weil
// gruppiereTausender auf ALLE Zahlen ≥ 4 Stellen wirkt.
//
// Lösung: NUR nach einem Währungs-Marker (Fr., CHF) ODER vor «Franken» gruppieren.
// Alle anderen Zahlen (Jahrezahlen, §-Nummern, Prozentzahlen) bleiben unberührt.
//
// Regeln (§1: kein Ziffernwert geändert; §3: reine Darstellung):
//   1. (Fr\.|CHF)\s*(\d[…\d  '']*\d) → Betrag hinter Marker gruppieren.
//   2. (\d[…\d  '']*\d)\s+Franken → Betrag vor «Franken» gruppieren.
//   Idempotent: bereits «12'000» bleibt «12'000». «Fr. 500» (3 Stellen) bleibt.
//   «2011» allein: KEIN Marker → unverändert. «§ 1234»: kein Fr./Franken → unverändert.
//
// Implementierung:
//   gruppiereEineZahl(s) ruft gruppiereTausender auf einen einzelnen Ziffern-String.
//   Die Regex matcht nur den Zahlen-Teil des Musters und ersetzt ihn.
function gruppiereEineZahl(zahl: string): string {
  return gruppiereTausender(zahl);
}

export function gruppiereBetraege(text: string): string {
  // Pass 1: Nach Fr. oder CHF: «Fr. 12 000» → «Fr. 12'000»,
  //         «CHF 12 000» → «CHF 12'000», «Fr. 500» → «Fr. 500» (3 Stellen, unverändert).
  // Leerzeichen zwischen Marker und Zahl optional (Fr.1000 kommt auch vor).
  let r = text.replace(
    /(Fr\.|CHF)(\s*)(\d[\d\s'']*\d|\d)/g,
    (_, marker, sp, zahl) => `${marker}${sp}${gruppiereEineZahl(zahl)}`,
  );
  // Pass 2: Vor «Franken»: «12 000 Franken» → «12'000 Franken».
  r = r.replace(
    /(\d[\d\s'']*\d|\d)(\s+)(Franken)\b/g,
    (_, zahl, sp, wort) => `${gruppiereEineZahl(zahl)}${sp}${wort}`,
  );
  return r;
}

// Bereichs-Artikel («Art. 226a226d», «Art. 6770») trägt im Snapshot zwei
// zusammengeklebte Artikelnummern ohne Halbgeviert. Aus der Artikel-id
// (z. B. «226_a_226_d», «67_70») das Halbgeviert rekonstruieren. IDs mit nur
// EINER Nummer (Buchstaben-Suffix «40_g», Einzelartikel «335_c») bleiben unberührt.
export function labelMitBereich(label: string, id: string): string {
  if (/[–-]/.test(label)) return label;
  const toks = id.split('_');
  const numPos = toks.map((t, i) => (/^\d+$/.test(t) ? i : -1)).filter((i) => i >= 0);
  if (numPos.length < 2) return label;
  const p2 = numPos[1];
  const g1 = toks.slice(0, p2).join('');
  const g2 = toks.slice(p2).join('');
  const prefix = label.match(/^(Art\.|§)/)?.[1] ?? 'Art.';
  return `${prefix} ${g1}–${g2}`;
}
