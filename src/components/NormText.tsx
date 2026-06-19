import { NORM_IM_TEXT, fedlexLinkFuerArtikel } from '../lib/fedlex';
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
  const out: React.ReactNode[] = [];
  let last = 0;
  for (const m of s.matchAll(ART_INTERN)) {
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
  return <>{out}</>;
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
