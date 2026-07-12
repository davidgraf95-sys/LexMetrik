import { Fragment } from 'react';
import {
  normVerweiseImText, fremdgesetzNachArtikel, fremdRoutingFormB,
  artikelnPluralVerweise,
} from '../lib/fedlex';
import { NormChip } from './vorlagen/NormChip';
import { RechtsprechungText } from './RechtsprechungLink';

// ─── Inline-Norm-Auto-Linker (Auftrag David 17.6.2026) ─────────────────────
//
// «Jede genannte Norm soll verlinkt sein.» Bis hierher öffnete das Norm-Popover
// nur an STRUKTURIERTEN Chip-Stellen; Artikel, die im FLIESSTEXT genannt werden
// (Begründungen, Hinweise, Tarif-`hinweis`, Gates-/Ergebnis-Warnungen), waren
// reiner Text. NormText schliesst das: es findet jeden Bund-Normverweis
// («Art. N … GESETZ») im übergebenen Text und macht ihn zum Popover-Trigger —
// der restliche Text bleibt zeichenidentisch (§1: nur Darstellung).
//
// UNIVERSELLER Inline-Verweis-Linker: Normen UND Rechtsprechung. Single source:
//  - NORM_IM_TEXT (fedlex.ts) findet die Norm-Verweise (Gesetz-Namen dort
//    gepflegt), NormChip (ui.tsx) trägt die GESAMTE Popover-Logik (Laden/
//    Overlay/A11y) — NormText dupliziert davon nichts, übergibt nur Inline-Stil.
//  - Die ZWISCHENSTÜCKE (alles, was kein Norm-Verweis ist) laufen durch
//    RechtsprechungText, sodass darin enthaltene BGE/BGer-Zitate ebenfalls
//    verlinkt werden. So genügt EINE Komponente an jeder Fliesstext-Stelle für
//    beide Verweis-Arten (ersetzt das frühere blosse <RechtsprechungText>).
//
// Auflösbarkeit: nur Norm-Treffer, die fedlexLinkFuerArtikel auflöst (Bund),
// werden verlinkt. Nicht auflösbare Nennungen (z. B. kantonale «§ 4», unbekannte
// Gesetze) bleiben Text — NIE ein toter Link (§8). Kantonale Inline-Auflösung
// läuft separat über den Erlass-/Kanton-Kontext der Quelle, nicht hier.
//
// SSR/Prerender: NormChip rendert serverseitig nur den <a> (Popover erst im
// Browser); der erzeugte Text ist zeichenidentisch zum heutigen plain {text}
// (nur zusätzliche <a>-Hüllen), Golden/PDF-Pfade nutzen NormText nicht.

// Dezenter Inline-Stil (gepunktete Unterstreichung) — fügt sich in den
// Fliesstext ein, anders als der Pillen-Chip an strukturierten Stellen.
const INLINE_CLASS = 'underline decoration-dotted underline-offset-2 hover:text-brass-700';

// ─── Interne Querverweise (Lesesicht, Deep-Research-Befund 7) ───────────────
// In der Gesetzes-Lesesicht sind BARE Artikelverweise («nach Artikel 6a»,
// «gemäss Art. 12») gemeint = Artikel DESSELBEN Erlasses (Drafting-Konvention;
// Fremdgesetze tragen das Kürzel und werden bereits von NORM_IM_TEXT erfasst).
// Solche bare Verweise werden zu Sprung-Links im Reader. Nur aktiv, wenn der
// Reader `intern` übergibt → andere NormText-Aufrufer (golden/PDF, Tarif-Hinweise)
// bleiben unverändert.
export interface InternRefs {
  /** normalisierter Ref («6a») → Artikel-Token des Erlasses («6_a»). */
  tokenMap: Map<string, string>;
  basisPfad: string;
  springeZu: (token: string) => void;
}
const normRef = (s: string): string => s.toLowerCase().replace(/[^a-z0-9]/g, '');
// «Art. N» / «Artikel N» (+ Buchstabe UND/ODER lat. Suffix als SEPARATE Gruppen,
// damit «329gbis»/«10bis» VOLLSTÄNDIG erfasst werden — nicht «329g»/«10b»; analog
// fedlex.ts). `(?![0-9a-z])` verhindert das `\d+`/Suffix-Backtracking, das sonst
// «Art. 20 des OR» auf «Art. 2» und «Art. 119bis …» auf «Art. 119b» verkürzte.
// Der frühere `(?!\s+(?:des|der|über|vom))`-Lookahead ist ENTFERNT (N2b, 4.7.2026):
// er blockierte das MATCHING von «Artikel 63 des Obligationenrechts (OR)» und
// verhinderte damit das Fremdgesetz-Routing der ausgeschriebenen Form. Die
// Fremd-/Verordnungs-Unterdrückung (bare «des/der …» ohne Klammer-Kürzel) läuft
// jetzt im Schleifenkörper NACH der N2b-Routing-Prüfung (identisches Ergebnis für
// die bare-«des»-Fälle, aber die «(KÜRZEL)»-Form wird nicht mehr verschluckt).
const ART_INTERN = /\bArt(?:\.|ikel)\s+(\d+(?:[a-z])?(?:bis|ter|quater|quinquies|sexies)?)(?![0-9a-z])/g;

function restMitIntern(s: string, key: string, intern?: InternRefs): React.ReactNode {
  if (!intern || !s) return s ? <RechtsprechungText key={key} text={s} /> : null;
  // N2 (Bündel N): Kürzel DIESES Erlasses (aus dem Lese-Basispfad, «…/bund/AHVV»
  // → «AHVV») — nennt ein Verweis exakt das eigene Kürzel, ist es ein echter
  // Self-Verweis und bleibt verlinkt; ein FREMDES Kürzel unterdrückt den Link.
  // Normalisiert (nur A–Z0–9): der Register-Schlüssel trägt «_» (FINFRAV_FINMA),
  // der FEDLEX-Key «-» (FinfraV-FINMA) — ohne Normalisierung würde ein Gesetz mit
  // getrenntem Kürzel den eigenen Self-Verweis fälschlich unterdrücken (QS-GP-Fund
  // 1.7.: FinfraV-FINMA art_50a, betrifft alle 6 getrennt-benannten Kind-Erlasse).
  const kuerzelKanon = (s: string) => s.toUpperCase().replace(/[^A-Z0-9]/g, '');
  const eigenesKuerzel = kuerzelKanon(intern.basisPfad.split('/').pop() ?? '');
  // A10 (Plural-Linker, David 5.7.2026): «in den Artikeln 31 …, 35 … und 45 …» —
  // jedes Glied EINZELN verlinken. Die Regionen werden VOR dem Singular-Lauf
  // erhoben; ART_INTERN-Treffer, die in eine Region fallen (der Öffner «die
  // Artikel 22» enthält ein Singular-Match), werden übersprungen. Auflösung je
  // Glied: fremd (Gesetz-Signal am Ende, inkl. Genitiv-Map) → NormChip aufs
  // Fremdgesetz; eigenes Kürzel oder kein Signal → Self-Sprung über die tokenMap
  // (nur existierende Token, §8); unterdrückte Regionen bleiben reiner Text (§1).
  const pluralRegionen = artikelnPluralVerweise(s);
  const inPluralRegion = (idx: number) =>
    pluralRegionen.some((r) => idx >= r.oeffnerStart && idx < r.end);
  const out: React.ReactNode[] = [];
  let last = 0;
  // Verlinkbare Spans (Singular + Plural-Glieder) einsammeln, dann in Text-
  // Reihenfolge mit Zwischenstücken emittieren.
  const linkSpans: { start: number; end: number; node: React.ReactNode }[] = [];
  for (const r of pluralRegionen) {
    if (r.unterdruecken) continue;
    // Fremd-Ziel = eigener Erlass ⇒ Self-Pfad (wie N2: eigenes Kürzel ist kein
    // Fremdgesetz — der In-Reader-Sprung ist die etablierte Self-Darstellung).
    const fremdEffektiv = r.fremd && kuerzelKanon(r.fremd) !== eigenesKuerzel ? r.fremd : null;
    for (const g of r.glieder) {
      const gk = `${key}-p${g.start}`;
      if (fremdEffektiv) {
        linkSpans.push({
          start: g.start, end: g.end,
          node: <NormChip key={gk} artikel={`Art. ${g.roh} ${fremdEffektiv}`} anzeige={g.roh} linkClass={INLINE_CLASS} />,
        });
      } else {
        const token = intern.tokenMap.get(normRef(g.roh));
        if (!token) continue; // kein Artikel dieses Erlasses → Text belassen (§8)
        linkSpans.push({
          start: g.start, end: g.end,
          node: (
            <a key={gk} href={`${intern.basisPfad}#art-${token}`}
              onClick={(e) => { e.preventDefault(); intern.springeZu(token); }}
              className={INLINE_CLASS}>{g.roh}</a>
          ),
        });
      }
    }
  }
  // Plural-Glieder-Spans in Text-Reihenfolge VOR der jeweils nächsten Singular-
  // Emission ausgeben (ein Cursor über linkSpans; Spans in schon konsumierten
  // N2b-Regionen werden verworfen).
  let pq = 0;
  const emitPluralBis = (pos: number) => {
    while (pq < linkSpans.length && linkSpans[pq].start < pos) {
      const sp = linkSpans[pq++];
      if (sp.start < last) continue; // von einer N2b-Region konsumiert
      if (sp.start > last) out.push(<RechtsprechungText key={`${key}-r${last}`} text={s.slice(last, sp.start)} />);
      out.push(sp.node);
      last = sp.end;
    }
  };
  for (const m of s.matchAll(ART_INTERN)) {
    // Von einer bereits verbrauchten Fremd-Region übersprungen (N2b konsumiert die
    // ganze «Artikel N … (KÜRZEL)»-Einheit; ein späterer Treffer darin entfällt).
    if (m.index < last) continue;
    // In einer Plural-Region (A10): die Glieder-Spans oben decken sie ab.
    if (inPluralRegion(m.index)) continue;
    emitPluralBis(m.index);
    const start = m.index;
    const rest = s.slice(start + m[0].length);
    // N2b (Bug David 4.7.2026): AUSGESCHRIEBENES Fremdgesetz mit Klammer-Kürzel
    // («Artikel 66a oder 66abis des Strafgesetzbuchs (StGB) …»). Jede genannte
    // Nummer — die erste UND jedes Aufzählungs-Glied — wird EINZELN auf das
    // Fremdgesetz geroutet (NormChip: In-Reader-Popover, wenn der Erlass im Korpus
    // ist, sonst Fedlex-Deep-Link; unbekanntes Kürzel → reiner Text). Das
    // deterministische Signal ist das «(KÜRZEL)» in der Klammer (§1, kein Raten).
    // Kein Prädikat hier → optimistische Verlinkung (etablierte Fremdverweis-
    // Darstellung, wie NORM_IM_TEXT-Treffer); die Existenz gegen den Ziel-Erlass
    // prüft das Popover beim Öffnen. Läuft VOR der Self-Link-Logik, damit «Artikel
    // 49a … (MStG)» nie fälschlich auf den eigenen Erlass (AIG art_49_a) zeigt.
    const routing = fremdRoutingFormB(rest, m[1]);
    if (routing) {
      if (start > last) out.push(<RechtsprechungText key={`${key}-r${last}`} text={s.slice(last, start)} />);
      let cur = 0; // Cursor im rest-Text
      for (const g of routing.glieder) {
        const anzeige = g.erst ? m[0] : g.roh;
        const gk = g.erst ? `${key}-f${start}` : `${key}-f${start}-${g.start}`;
        if (!g.erst && g.start > cur) out.push(<RechtsprechungText key={`${key}-rg${start}-${cur}`} text={rest.slice(cur, g.start)} />);
        out.push(g.linkbar
          ? <NormChip key={gk} artikel={g.artikel} anzeige={anzeige} linkClass={INLINE_CLASS} />
          : <RechtsprechungText key={`${gk}-t`} text={anzeige} />);
        if (!g.erst) cur = g.end;
      }
      if (cur < routing.regionEnd) out.push(<RechtsprechungText key={`${key}-rt${start}`} text={rest.slice(cur, routing.regionEnd)} />);
      last = start + m[0].length + routing.regionEnd;
      continue;
    }
    // Bare «Art. N des/der/über/vom …» OHNE Klammer-Kürzel (N2b traf nicht): ein
    // benannter Fremderlass oder eine «des vorliegenden …»-Wendung — NIE ein Self-
    // Sprung (§1). Ersetzt den früheren ART_INTERN-Lookahead an Ort und Stelle,
    // aber ERST nach der N2b-Routing-Prüfung (sonst würde «Artikel 63 des OR (…)»
    // fälschlich unterdrückt statt geroutet). Fedlex-Kürzel-Fälle fängt zusätzlich
    // die N2-Prüfung unten; dieser Check deckt auch Nicht-FEDLEX-Namen («der
    // Verordnung») ab, die tokenMap sonst fälschlich self-verlinken würde.
    if (/^\s+(?:des|der|über|vom)\b/.test(rest)) continue;
    // N2 (Form A, ABGEKÜRZTE Kürzel-Form): Nennt der Verweis ein ANDERES
    // Bundesgesetz («Artikel 1a Absatz 1 Buchstabe c AHVG» in der AHVV → AHVG),
    // zeigt «Artikel N» auf JENES Gesetz; der interne Self-Link wäre falsch (§1) →
    // unterdrücken. Deterministisch aus der FEDLEX-Kürzelliste (§5). Ergänzt die
    // alte Sofort-Kürzel-Regel unten (die auch Nicht-FEDLEX-Kürzel fängt), fängt
    // aber die ausgeschriebene Passus-Form. (Aktives Routing der bare-Kürzel-Form
    // bleibt bewusst zurückgestellt — der Kontrakt hier ist Unterdrückung.)
    const fremd = fremdgesetzNachArtikel(rest);
    if (fremd && kuerzelKanon(fremd) !== eigenesKuerzel) continue;
    // M12 (§1/§6): Folgt dem bare «Art./Artikel N» ein Gesetzes-KÜRZEL (≥2 Gross-
    // buchstaben, z.B. «Artikel 64 BGG», «Art. 5 VwVG»), ist es ein Verweis auf
    // ein ANDERES Gesetz (in Verordnungen meist das Trägergesetz) — NICHT auf
    // diesen Erlass. Der interne Self-Sprunglink wäre dann falsch (empirisch
    // BGerR: «Artikel N BGG» zeigte auf BGerR art_N statt BGG). NORM_IM_TEXT
    // erfasst die ausgeschriebene «Artikel»-Form (noch) nicht; bis das verifizierte
    // Trägergesetz-Routing als eigene Datenaufgabe steht, wird der falsche Self-
    // Link UNTERDRÜCKT (lieber kein Link als ein plausibel-falscher, §1/§6,
    // David-Entscheid 28.6.). «Absatz/Buchstabe/Ziffer» (EIN Grossbuchstabe)
    // bleiben unberührt → echte Self-Verweise («Artikel 6 Absatz 2») weiter verlinkt.
    if (/^\s+(?:[A-ZÄÖÜ]{2,}|[A-ZÄÖÜ][a-zäöü]*[A-ZÄÖÜ]\w*)/.test(rest)) continue;
    const token = intern.tokenMap.get(normRef(m[1]));
    if (!token) continue; // kein Artikel dieses Erlasses → als Text belassen
    if (start > last) out.push(<RechtsprechungText key={`${key}-r${last}`} text={s.slice(last, start)} />);
    out.push(
      <a key={`${key}-a${start}`} href={`${intern.basisPfad}#art-${token}`}
        onClick={(e) => { e.preventDefault(); intern.springeZu(token); }}
        className={INLINE_CLASS}>{m[0]}</a>,
    );
    last = start + m[0].length;
  }
  emitPluralBis(s.length);
  if (last === 0) return <RechtsprechungText key={key} text={s} />;
  if (last < s.length) out.push(<RechtsprechungText key={`${key}-r${last}`} text={s.slice(last)} />);
  // key-tragendes Fragment: restMitIntern-Ergebnisse landen in NormTexts `teile`-
  // Array (siehe unten); ein bare <>…</> dort löst die React-key-Warnung aus.
  return <Fragment key={key}>{out}</Fragment>;
}

/** Fliesstext mit verlinkten Norm- UND Rechtsprechungs-Verweisen — Text bleibt
 *  zeichenidentisch (nur Anker-Hüllen kommen hinzu). `intern` (nur Lesesicht)
 *  macht bare Artikelverweise auf denselben Erlass zu Sprung-Links. */
export function NormText({ text, intern }: { text: string; intern?: InternRefs }) {
  // EINE Wahrheit der Verweis-/Ketten-Regel: normVerweiseImText (fedlex.ts)
  // liefert die voll zitierten Anker UND die per «i.V.m.»-Kette propagierten
  // bare Glieder. Für Nicht-Ketten-Text ist die Anker-Menge identisch zum
  // früheren matchAll(NORM_IM_TEXT)-Lauf (additiv, §6).
  const spans = normVerweiseImText(text);
  // Kein Norm-Treffer → ganzer Text durch die Rest-Pipeline (ohne intern reiner
  // Pass-Through durch RechtsprechungText, zeichenidentisch wie bisher).
  if (spans.length === 0) return intern ? <>{restMitIntern(text, 'r0', intern)}</> : <RechtsprechungText text={text} />;
  const teile: React.ReactNode[] = [];
  let zuletzt = 0;
  for (const s of spans) {
    if (s.start > zuletzt) teile.push(restMitIntern(text.slice(zuletzt, s.start), `r${zuletzt}`, intern));
    // Anker: anzeige === artikel → `anzeige` weglassen (SSR-byte-identisch zum
    // früheren <NormChip artikel={roh}>). Propagiertes Glied: Anzeige = reiner
    // Glied-Text (zeichenidentisch, §1), Auflösung über das synthetisierte Ziel.
    teile.push(
      <NormChip key={`${s.start}-${s.artikel}`} artikel={s.artikel}
        anzeige={s.propagiert ? s.anzeige : undefined} linkClass={INLINE_CLASS} />,
    );
    zuletzt = s.end;
  }
  if (zuletzt < text.length) teile.push(restMitIntern(text.slice(zuletzt), `r${zuletzt}`, intern));
  return <>{teile}</>;
}
