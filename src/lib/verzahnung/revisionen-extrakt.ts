// ─── Normrevisions-Extrakt: reine Parser-Schicht (V1c) ──────────────────────
//
// FAHRPLAN-VERZAHNUNG-UI §V1c (David-Input 3.7.2026): «da gesetze immer wieder
// revision haben kann ein alter entscheid nicht unbesehen an die norm angehängt
// werden sofern sich die norm revidiert hat.» Aus den amtlichen Revisions-
// Fussnoten der Struktur-Sidecars (`public/normtext/struktur/bund/*.json`) ist je
// Artikel das Datum der LETZTEN Textänderung deterministisch ableitbar — quell-
// belegt über das AS-Zitat, ohne Heuristik (§2/§7).
//
// Reine, deterministische Datenschicht (§2/§3): kein `new Date(string)` (Zeitzonen-
// Falle, CLAUDE-Lektion), keine Netz-/Laufzeit-Abhängigkeit — nur String-Parsing.
// Dieselben Funktionen speisen den Build-Generator (scripts/verzahnung/…) UND die
// Unit-Tests (EIN Ort, §5).

/**
 * Artikel-Token kanonisieren. Die Struktur-Sidecars und `NormSnapshot.artikel`
 * nutzen die eId-nahe Unterstrich-Form (`216_c`, `663_b_bis`, `226_a_226_d`),
 * die Zitat-Extraktion/`passus.artikelToken` die kompakte Form (`216c`). Diese
 * Kanonisierung (Kleinschrift, ohne Whitespace UND Unterstriche) bringt BEIDE
 * Konventionen auf EINEN Schlüssel, sodass der GesetzLeser (`216_c`) und der
 * EntscheidLeser (`216c`) denselben Revisions-Eintrag treffen.
 */
export function kanonArtikelToken(s: string): string {
  return String(s).toLowerCase().replace(/[\s_]+/g, '');
}

// Deutsche Monatsnamen → Monatszahl. Deckt die im Bestand belegten amtlichen
// Fedlex-Abkürzungen (Jan./Febr./März/April/Mai/Juni/Juli/Aug./Sept./Okt./Nov./
// Dez.) UND die ausgeschriebenen Formen ab (defensiv, deterministisch).
const MONATE: Readonly<Record<string, string>> = {
  jan: '01', januar: '01',
  feb: '02', febr: '02', februar: '02',
  märz: '03', maerz: '03', mrz: '03',
  apr: '04', april: '04',
  mai: '05',
  jun: '06', juni: '06',
  jul: '07', juli: '07',
  aug: '08', august: '08',
  sep: '09', sept: '09', september: '09',
  okt: '10', oktober: '10',
  nov: '11', november: '11',
  dez: '12', dezember: '12',
};

/**
 * «1. Jan. 2017» → «2017-01-01». Rein lokale ISO-Konstruktion (kein `new Date`),
 * damit ISO-String-Vergleiche stimmen und keine Zeitzone reinspielt. Ungültiger
 * Monatsname / Tag / Jahr → null (kein Rateversuch).
 */
export function parseDeutschesRevisionsdatum(tag: string, monat: string, jahr: string): string | null {
  const mm = MONATE[monat.toLowerCase().replace(/\.$/, '')];
  if (!mm) return null;
  const t = Number(tag);
  const y = Number(jahr);
  if (!Number.isInteger(t) || t < 1 || t > 31) return null;
  if (!Number.isInteger(y) || y < 1848 || y > 2100) return null;   // Bundesstaat 1848 → Puffer
  return `${String(y).padStart(4, '0')}-${mm}-${String(t).padStart(2, '0')}`;
}

/** Ein datierter Textänderungs-Beleg: Inkraft-/Wirkungsdatum + AS-Fundstelle. */
export interface ArtikelRevision {
  /** ISO-Datum der Inkraftsetzung der letzten Textänderung (max über alle Fussnoten). */
  iso: string;
  /** Amtliche Fundstelle («AS 2016 4651»), leer wenn im Fussnotentext nicht auffindbar. */
  as: string;
}

// Beide amtlichen Formulierungen einer DATIERTEN Textänderung: «Fassung gemäss …,
// in Kraft seit <Datum>» (Neufassung/Einfügung) und «Aufgehoben durch …, mit
// Wirkung seit <Datum>» (Absatz-Aufhebung = ebenfalls Textänderung). Beide tragen
// eine AS-Fundstelle. (Deckung über die reine «in Kraft seit»-Form hinaus: §1-
// Korrektheit — eine Absatz-Aufhebung ändert den Artikeltext genauso.)
const TRIGGER_RE = /in Kraft seit|mit Wirkung seit/g;
// Datum irgendwo am KLAUSEL-Anfang (nicht starr direkt nach «seit»): Fedlex trägt
// belegte Tippfehler «… seit seit 1. Jan. 2017» (BVG Art. 34a) und «… seit. 1. Jan.
// 2001» (AVIV Art. 99) — das Datum sitzt dann ein paar Zeichen hinter dem Trigger.
const DATUM_RE = /(\d{1,2})\.\s*([A-Za-zäöü]+)\.?\s*(\d{4})/;
// AS-Fundstelle tolerant gegen Bold/Italic-Umschliessung UND fehlendes Leerzeichen
// nach «AS» (belegt: «AS<b> 2007</b> 5259», AHVG Art. 92a).
const AS_RE = /AS\s*(?:<[^>]*>\s*)*(\d{4})(?:\s*<[^>]*>)*\s+(\d+)/;
// Wie weit hinter dem Trigger das Klausel-Datum noch als «zu diesem Trigger gehörig»
// gilt (deckt «seit »/«seit. »/«dem »-Präfixe, verhindert das Greifen eines fernen
// Datums aus einer anderen Klausel).
const DATUM_FENSTER = 24;

/**
 * Max «in Kraft seit»/«mit Wirkung seit»-Datum über ALLE Fussnoten eines Artikels
 * → das Datum der letzten Textänderung + zugehörige AS-Fundstelle (aus DERSELBEN
 * Klausel). Kein datierter Beleg (Urfassung / nur SR-Verweis-Fussnote) → null.
 */
export function extrahiereArtikelRevision(
  fussnoten: ReadonlyArray<{ text?: string }> | undefined,
): ArtikelRevision | null {
  let best: ArtikelRevision | null = null;
  for (const fn of fussnoten ?? []) {
    const text = fn.text ?? '';
    TRIGGER_RE.lastIndex = 0;
    let tm: RegExpExecArray | null;
    while ((tm = TRIGGER_RE.exec(text)) !== null) {
      const nachTrigger = tm.index + tm[0].length;
      const dm = DATUM_RE.exec(text.slice(nachTrigger));
      if (!dm || dm.index > DATUM_FENSTER) continue;   // Datum gehört nicht zu diesem Trigger
      const iso = parseDeutschesRevisionsdatum(dm[1], dm[2], dm[3]);
      if (!iso) continue;
      if (!best || iso > best.iso) {
        // AS-Fundstelle NACH dem Datum, innerhalb DERSELBEN Fussnote: eine
        // Enactment-AS gilt für die ganze Fassung — auch wenn eine Fussnote
        // gestaffelte In-Kraft-Daten trägt (BVG Art. 64, OR Art. 732/927) und die
        // AS erst hinter dem zweiten Datum steht.
        const am = AS_RE.exec(text.slice(nachTrigger + dm.index + dm[0].length));
        best = { iso, as: am ? `AS ${am[1]} ${am[2]}` : '' };
      }
    }
  }
  return best;
}

/** Ein Struktur-Artikel-Knoten, soweit für den Revisions-Extrakt relevant. */
export interface StrukturArtikel {
  fussnoten?: { text?: string }[];
}

/**
 * Ein Erlass-Sidecar → `{ token → Revision }` (nur Artikel MIT datiertem Beleg).
 * Kanonische Token; bei Token-Kollision (mehrere Sidecar-Keys auf denselben
 * Token) gewinnt deterministisch das spätere Datum.
 */
export function baueRevisionProArtikel(
  artikel: Readonly<Record<string, StrukturArtikel>>,
): Record<string, ArtikelRevision> {
  const proArtikel: Record<string, ArtikelRevision> = {};
  for (const [key, node] of Object.entries(artikel)) {
    const rev = extrahiereArtikelRevision(node?.fussnoten);
    if (!rev) continue;
    const token = kanonArtikelToken(key);
    const vorhanden = proArtikel[token];
    if (!vorhanden || rev.iso > vorhanden.iso) proArtikel[token] = rev;
  }
  return proArtikel;
}
