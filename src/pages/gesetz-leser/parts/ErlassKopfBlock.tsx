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
  // S2 (F3 = V2, David 17.8.2026): Ingress und Präambel sind AMTLICHER WORTLAUT und
  // stehen in derselben Lesespalte (`max-w-normtext`) unmittelbar über den Artikeln.
  // Sie laufen darum auf derselben Fliesstext-Stufe `leser-text` (17 px / lh 1.55)
  // wie der Artikeltext — vorher `text-body-l` (18 px) plus rohem
  // `leading-[1.65]`-Override, also GRÖSSER und lockerer als der Artikeltext, den
  // sie einleiten. Hätte S2 nur `ArtikelLeser` umgestellt, wäre genau hier eine
  // sichtbare Stufe entstanden, die es vorher nicht gab (§5: der Wortlaut hat EINE
  // Stimme). Der Zeilenabstand gehört jetzt zur Stufe statt an die Klasse
  // (Design-Grundlage Kap. 8 Nr. 4: kein fixer Leading-Wert über alle Grössen).
  const zeilenStil = (rolle: string): string => {
    if (rolle === 'verb') return 'font-serif text-leser-text text-ink-800';
    if (rolle === 'autor') return 'font-serif text-leser-text text-ink-800';
    // ingress (Rechtsgrundlage) + praeambel (materiell, BV) ruhig im Lesefluss
    return 'font-serif text-leser-text text-ink-700';
  };
  return (
    // ── Ä100 (Live-Ästhetik-Prüfung 18.8.2026) · EINE LINIE, NICHT ZWEI ──────
    // GEMESSEN @1440 UND @390 (StPO): zwischen dem Ingress-Fussnoten-Apparat und
    // dem ersten Sektionskopf standen ZWEI waagrechte Linien rund 25 px
    // auseinander — die `border-b` dieses Blocks und die `border-t` des ersten
    // Sektionskopfs (`parts/SektionKopf.tsx`: `ebene <= 1` ⇒ «border-t
    // border-rule-struktur pt-4»). Beide in DERSELBEN Rolle `rule-struktur`,
    // beide an derselben Fuge. Design-Grundlage Kap. 3 lässt pro Ebene genau
    // eine Linienrolle zu; DESIGN-REGLEMENT §Linien-Kanon Regel 2 nennt die
    // Häufung ausdrücklich «Gleisbett».
    // WELCHE FÄLLT: diese. Die Linie des Sektionskopfs gehört zur STUFE und
    // wiederholt sich bei jedem obersten Teil/Titel/Abschnitt — sie ist der
    // Kanon. Die hier war die einmalige Kante eines Vorspanns, und der trennt
    // sich vom Folgenden bereits durch `pb-5` Weissraum plus die Stufenlinie
    // darunter («Trennung über Weissraum, dann Linie», Kap. 8 Nr. 1).
    // TRÄGT DER ERLASS GAR KEINE SEKTIONEN (`ohneGliederung`), steht zwischen
    // Ingress und erstem Artikel jetzt Weissraum statt einer Linie — dasselbe
    // Bild wie zwischen zwei Artikeln, und damit richtiger als vorher: eine
    // Struktur-Linie ohne Struktur dahinter war eine Behauptung.
    // GETEILTE DATEI: der Block trägt V1 UND V3 (`inhalt-volltext.tsx`,
    // `inhalt-ansichten.tsx`, `v3/LeserRahmenV3.tsx`). Die Änderung wirkt in
    // beiden Hüllen gleich — deklariert, nicht nebenbei.
    <section aria-label="Ingress" className="mx-auto w-full max-w-normtext space-y-3 pb-5">
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
                  <span key={nr}>{j > 0 && <span className="align-super text-[length:var(--hochgestellt)] text-ink-500">,</span>}<FnRef artikel="kopf" nr={nr} /></span>
                ))}</span>
              )}
            </p>
          ))}
        </div>
      )}
      {/* W2·5i-HIST-ANSICHT (bewusster Verzicht, 26.7.2026): der KOPF-Apparat trägt
          KEIN `data-fn-klasse` und folgt dem Schalter «Änderungsvermerke» also nicht —
          er bleibt in BEIDEN Stellungen vollständig sichtbar.

          NEU BEGRÜNDET (S1-Nachzug 17.8.2026, Architektur-Prüfer C1): die alte
          Begründung berief sich auf die dritte Ansicht «als Chronologie» — dort
          ersetzte eine datierte Liste am Artikelfuss die A-Einträge, und für den
          Erlass-Kopf gab es keine solche Ersatzdarstellung. Dieser Grund ist mit S1
          ENTFALLEN (der Modus ist gestrichen, David F1), das ERGEBNIS bleibt aber
          richtig — nur eben aus einem anderen, einfacheren Grund:

          Der Kopf-Apparat hängt an KEINEM Vermerke-Schalter, weil ein Ausblenden hier
          nichts verfeinern, sondern nur amtliche Substanz wegnehmen würde (§8,
          konservative Richtung wie H0-Auflage 1). Am Artikelfuss trennt der Schalter
          Änderungsvermerke von echten Verweisen — im Vorspann steht kein solches
          Gemisch, das man trennen müsste. Das Sidecar liefert `kl` für die
          Kopf-Fussnoten weiterhin mit; wer den Kopf später doch einbeziehen will,
          braucht dafür einen eigenen Entscheid, nicht bloss eine CSS-Regel.
          NACHTRAG D35-F3 (7.9.2026): der `data-fussnoten`-Toggle, der hier bis
          dahin weiterwirkte, ist ersatzlos gestrichen — der Kopf-Apparat steht
          seither in JEDER Stellung vollständig. Das ist dieselbe konservative
          Richtung, nur ohne Ausnahme. */}
      {kopf.fussnoten && kopf.fussnoten.length > 0 && (
        <div data-fn-apparat className="mt-3 border-t border-rule-artikel pt-2 space-y-1">
          {/* FN-3: Anker `fn-kopf-${nr}` am Kopf-Apparat — Sprungziel des FnRef-Popovers
              (getElementById) und des #-Sprungs; `nt-anker`/`target:` wie im Artikel-
              Apparat (ArtikelLeser). Nummernlose Zeilen (nr='') tragen keinen Anker. */}
          {kopf.fussnoten.map((fn, i) => (
            /* S2 (F3 = V2): `text-leser-fn` (11 px / lh 1.3) wie der Artikel-Apparat —
               die Klassenkette war bis S2 zeichengleich mit ihm (`text-xs
               leading-normal`), und sie muss es bleiben: es ist dieselbe Rolle am
               anderen Ort (§5). Der Kommentar unten nennt diese Kopplung schon für
               die Farbe; sie gilt für die Grösse genauso. */
            /* T3 (29.8.2026): `max-w-kleintext` zieht die Kopplung mit — dieselbe
               Rolle, dieselbe Feinschrift-Spalte (§5). */
            <p key={i} id={fn.nr ? `fn-kopf-${fn.nr}` : undefined} className="nt-anker max-w-kleintext text-leser-fn text-ink-500 target:bg-brass-100">
              {/* WCAG-AA (§13): Fussnoten-Nummer ist semantischer Text (kein aria-hidden).
                  LM-153 (W2·17-UI-BEFUNDE-B4): brass-700 statt ink-500 — dieselbe
                  Auszeichnung wie die Marke im Fliesstext (FnRef, ArtikelBody.tsx),
                  analog zum Artikel-Apparat (ArtikelLeser.tsx). */}
              {fn.nr && <span className="num mr-1 text-brass-700">{fn.nr}</span>}
              {fnTextMitLinks(fn)}
            </p>
          ))}
        </div>
      )}
    </section>
  );
}
