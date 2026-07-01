import { Fragment } from 'react';
import { NORM_IM_TEXT, fedlexLinkFuerArtikel, fremdgesetzNachArtikel } from '../lib/fedlex';
import { NormChip } from './vorlagen/ui';
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
// Der `des/der/über/vom`-Lookahead schliesst benannte Fremderlasse aus.
const ART_INTERN = /\bArt(?:\.|ikel)\s+(\d+(?:[a-z])?(?:bis|ter|quater|quinquies|sexies)?)(?![0-9a-z])(?!\s+(?:des|der|über|vom)\b)/g;

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
  const out: React.ReactNode[] = [];
  let last = 0;
  for (const m of s.matchAll(ART_INTERN)) {
    const rest = s.slice(m.index + m[0].length);
    // N2: Nennt der Verweis ein ANDERES Bundesgesetz — aus- ODER abgeschrieben
    // («Artikel 1a Absatz 1 Buchstabe c AHVG» in der AHVV → AHVG) —, zeigt
    // «Artikel N» auf JENES Gesetz; der interne Self-Link wäre falsch (§1) →
    // unterdrücken. Deterministisch aus der FEDLEX-Kürzelliste (§5). Das genaue
    // Fremdgesetz-Routing (Verweis-Chip auf den anderen Erlass) bleibt eine
    // eigene, verifizierte Datenaufgabe (David-Entscheid 28.6.: kein Link >
    // falscher Link). Ergänzt die alte Sofort-Kürzel-Regel unten (die auch
    // Nicht-FEDLEX-Kürzel fängt), fängt aber die ausgeschriebene Passus-Form.
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
    const start = m.index;
    if (start > last) out.push(<RechtsprechungText key={`${key}-r${last}`} text={s.slice(last, start)} />);
    out.push(
      <a key={`${key}-a${start}`} href={`${intern.basisPfad}#art-${token}`}
        onClick={(e) => { e.preventDefault(); intern.springeZu(token); }}
        className={INLINE_CLASS}>{m[0]}</a>,
    );
    last = start + m[0].length;
  }
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
  const teile: React.ReactNode[] = [];
  let zuletzt = 0;
  for (const treffer of text.matchAll(NORM_IM_TEXT)) {
    const start = treffer.index;
    const roh = treffer[0];
    // Defensiv (§5): nur verlinken, was der eine Resolver wirklich auflöst.
    // Nicht auflösbare Treffer bleiben im noch offenen Text-Stück (kein
    // Vorschub von `zuletzt`), werden also als reiner Text mit ausgegeben.
    if (fedlexLinkFuerArtikel(roh) == null) continue;
    if (start > zuletzt) teile.push(restMitIntern(text.slice(zuletzt, start), `r${zuletzt}`, intern));
    teile.push(<NormChip key={`${start}-${roh}`} artikel={roh} linkClass={INLINE_CLASS} />);
    zuletzt = start + roh.length;
  }
  // Kein Norm-Treffer → ganzer Text durch die Rest-Pipeline (ohne intern reiner
  // Pass-Through durch RechtsprechungText, zeichenidentisch wie bisher).
  if (teile.length === 0) return intern ? <>{restMitIntern(text, 'r0', intern)}</> : <RechtsprechungText text={text} />;
  if (zuletzt < text.length) teile.push(restMitIntern(text.slice(zuletzt), `r${zuletzt}`, intern));
  return <>{teile}</>;
}
