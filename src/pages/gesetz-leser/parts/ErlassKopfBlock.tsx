import { NormText, type InternRefs } from '../../../components/NormText';
import { FnRef } from '../../../components/normtext/ArtikelBody';
import type { ErlassKopf } from '../../../lib/normtext/browse';
import { fnTextMitLinks } from '../helpers';

// M5 (§2 Fundiertheits-Floor): Erlass-Kopf = Ingress/Erlassformel bzw. materielle
// Präambel + Erlassdatum + Kopf-Fussnoten. Fedlex zeigt das unter dem Titel; bei
// uns war es zu 100 % verworfen (Extraktor startete erst beim ersten <article>).
// Reine Darstellung aus dem Sidecar (§3) — Wortlaut unangetastet (§1). Die Kopf-
// Fussnoten (Provenienz) liegen wie der Änderungs-Apparat hinter dem Schalter (§4).
// W2·5d U-VERWEIS/A11 (David 5.7.2026, «auch jeweils verweise in den präambeln
// einbauen»): die Ingress-/Präambel-Zeilen laufen durch den Inline-Verweis-Linker
// (NormText) — Präambeln zitieren die BV/Trägergesetze ausgeschrieben («gestützt
// auf Artikel 130 der Bundesverfassung», «… des Bundesgesetzes … (ATSG)»); die
// Auflösung leistet die kuratierte Genitiv-Map + das N2b-Klammer-Routing inkl.
// A10-Plural («die Artikel 26, 31 Absatz 2, 34 und 114 der Bundesverfassung»).
// Ohne Reader-InternRefs (pdf-embed) linkt der Fallback nur Fremdziele — eine
// leere tokenMap erzeugt nie einen Self-Sprung (§8, kein toter Link).
//
// §1-GRENZE «alte Bundesverfassung» (Gegenprüfungs-Befund 10.7.2026): der Ingress
// ist HISTORISCH (wird nie nachgeführt) — Erlasse mit Erlassdatum VOR 2000 zitieren
// dort die BV von 1874 (aBV). «Artikel 26 der Bundesverfassung» im ArG-Ingress
// (1964) meint aBV 26 (Gewerbefreiheit-Kontext), NICHT die heutige Eigentums-
// garantie — ein Link auf SR 101 wäre plausibel-falsch. Deterministisches Tor:
// Ingress-Verlinkung NUR bei Erlassdatum ≥ 2000 (neue BV in Kraft 1.1.2000);
// unparsebares Datum ⇒ keine Links (lieber kein Link als ein falscher, §1).
// Artikel-FLIESSTEXT ist nicht betroffen: dort werden BV-Zitate bei Revisionen
// amtlich nachgeführt (Korpus-Belege ASYLG 121a, RVOG 184 → heutige BV).
const PRAEAMBEL_INTERN_FALLBACK: InternRefs = { tokenMap: new Map(), basisPfad: '', springeZu: () => {} };
function ingressVerlinkbar(erlassdatum: string | undefined): boolean {
  const m = erlassdatum?.match(/vom\s+\d{1,2}\.\s*\S+\s+(\d{4})/);
  return !!m && Number(m[1]) >= 2000;
}

export function ErlassKopfBlock({ kopf, intern }: { kopf: ErlassKopf; intern?: InternRefs }) {
  const hatPraeambel = !!kopf.praeambel?.length;
  if (!kopf.erlassdatum && !hatPraeambel) return null;
  const verlinkbar = ingressVerlinkbar(kopf.erlassdatum);
  const zeilenStil = (rolle: string): string => {
    if (rolle === 'verb') return 'font-serif text-body-l text-ink-800';
    if (rolle === 'autor') return 'font-serif text-body-l text-ink-800';
    // ingress (Rechtsgrundlage) + praeambel (materiell, BV) ruhig im Lesefluss
    return 'font-serif text-body-l leading-[1.65] text-ink-700';
  };
  return (
    <section aria-label="Ingress" className="max-w-reading space-y-3 border-b border-rule-struktur pb-5">
      {kopf.erlassdatum && (
        <p className="font-serif text-body-s text-ink-500">{kopf.erlassdatum}</p>
      )}
      {kopf.praeambelTitel && (
        <p className="lc-overline">{kopf.praeambelTitel}</p>
      )}
      {hatPraeambel && (
        <div className="space-y-2">
          {kopf.praeambel!.map((z, i) => (
            <p key={i} className={zeilenStil(z.rolle)}>
              {verlinkbar
                ? <NormText text={z.text} intern={intern ?? PRAEAMBEL_INTERN_FALLBACK} />
                : z.text}
              {/* FN-3 (V2 §2 F1-Familie, David 10.7.2026 «Präambel-Fussnoten
                  unverlinkt»): Ingress-/Präambel-Fussnoten HINTER dem A11-NormText-
                  Element inline verlinken — dieselbe FnRef-Marker-Mechanik wie im
                  Artikel-Fliesstext (FN-1/FN-2/G2b). `artikel="kopf"` ⇒ FnRef löst den
                  Popover aus `#fn-kopf-${nr}` am Kopf-Apparat auf. Marker trägt
                  `data-fn-marker` ⇒ folgt dem Fussnoten-Toggle (R9/§8: Substanz bleibt
                  im DOM, der data-fussnoten-CSS-Toggle dämpft nur). Additiv: nur wenn
                  die Zeile amtliche Marker trägt (`fnNrs` aus FN-2). */}
              {z.fnNrs && z.fnNrs.length > 0 && (
                <span className="ml-0.5" data-fn-marker>{z.fnNrs.map((nr, j) => (
                  <span key={nr}>{j > 0 && <span className="align-super text-[0.62em] text-ink-500">,</span>}<FnRef artikel="kopf" nr={nr} /></span>
                ))}</span>
              )}
            </p>
          ))}
        </div>
      )}
      {kopf.fussnoten && kopf.fussnoten.length > 0 && (
        <div data-fn-apparat className="mt-3 border-t border-rule-artikel pt-2 space-y-1">
          {/* FN-3: Anker `fn-kopf-${nr}` am Kopf-Apparat — Sprungziel des FnRef-Popovers
              (getElementById) und des #-Sprungs; `nt-anker`/`target:` wie im Artikel-
              Apparat (ArtikelLeser). Nummernlose Zeilen (nr='') tragen keinen Anker. */}
          {kopf.fussnoten.map((fn, i) => (
            <p key={i} id={fn.nr ? `fn-kopf-${fn.nr}` : undefined} className="nt-anker text-xs leading-normal text-ink-500 target:bg-brass-100">
              {fn.nr && <span className="num mr-1 text-ink-300">{fn.nr}</span>}
              {fnTextMitLinks(fn)}
            </p>
          ))}
        </div>
      )}
    </section>
  );
}
