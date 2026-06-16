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

/** Fliesstext mit verlinkten Norm- UND Rechtsprechungs-Verweisen — Text bleibt
 *  zeichenidentisch (nur Anker-Hüllen kommen hinzu). */
export function NormText({ text }: { text: string }) {
  // Zwischenstück (Nicht-Norm-Text) → durch RechtsprechungText, damit darin
  // enthaltene BGE/BGer-Zitate ebenfalls verlinkt werden. key nötig, weil die
  // Stücke in einer Liste stehen.
  const rest = (s: string, key: string) =>
    s ? <RechtsprechungText key={key} text={s} /> : null;

  const teile: React.ReactNode[] = [];
  let zuletzt = 0;
  for (const treffer of text.matchAll(NORM_IM_TEXT)) {
    const start = treffer.index;
    const roh = treffer[0];
    // Defensiv (§5): nur verlinken, was der eine Resolver wirklich auflöst.
    // Nicht auflösbare Treffer bleiben im noch offenen Text-Stück (kein
    // Vorschub von `zuletzt`), werden also als reiner Text mit ausgegeben.
    if (fedlexLinkFuerArtikel(roh) == null) continue;
    if (start > zuletzt) teile.push(rest(text.slice(zuletzt, start), `r${zuletzt}`));
    teile.push(<NormChip key={`${start}-${roh}`} artikel={roh} linkClass={INLINE_CLASS} />);
    zuletzt = start + roh.length;
  }
  // Kein Norm-Treffer → ganzer Text durch RechtsprechungText (reiner Pass-Through,
  // falls auch keine Rechtsprechung: zeichenidentisch).
  if (teile.length === 0) return <RechtsprechungText text={text} />;
  if (zuletzt < text.length) teile.push(rest(text.slice(zuletzt), `r${zuletzt}`));
  return <>{teile}</>;
}
