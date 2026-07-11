import { type ReactNode } from 'react';
import type { CurrencyEintrag } from '../../../lib/normtext/browse';
import type { BrowseErlass } from '../../../lib/normtext/browse-typen';
import { formatiereDatum } from '../helpers';

// W2·5d G2b — EINE Leser-Kopf-Komponente für ALLE Grundarten (Kopf-Zusammen-
// führung, §3.3): Overline + Titel (Kürzel «— Volltitel», Doppel-Suffix entfernt)
// + Meta-Zeile (SR · [N Artikel] · Stand · geltende Fassung) + grundart-spezifische
// Aktionen. Ersetzt die zwei früher duplizierten <header>-Blöcke (Snapshot vs.
// pdf-embed) durch EINE Quelle (§5) — die Options-Leiste trägt sie einheitlich.
// Reine Darstellung (§3); Kopf-Label bleibt heutige Herleitung (erlassTyp-Label
// ist G3a). Der overflow-wrap/hyphens am Titel deckt Langtitel (mobil, §3.3).
export function ErlassLeserKopf({ erlass, overline, artikelAnzahl, bestimmungsWort = 'Artikel', aktionen, hinweis, currency }: {
  erlass: BrowseErlass;
  overline: ReactNode;
  /** Artikelzahl (Snapshot); null = keine Zählung (pdf-embed). */
  artikelAnzahl: number | null;
  /** Zähl-Substantiv (W2·5d G3a/⑥): «Artikel» bzw. «Paragraphen» für §-Kantone
   *  (bestimmungsEtikett='paragraf'). NUR sichtbares Label — der Anker bleibt
   *  überall art-<token> (K2/R8). Entwurf-Etikett (K6), darum kein Zitat-Label. */
  bestimmungsWort?: 'Artikel' | 'Paragraphen';
  /** Grundart-spezifische Aktionen (Herunterladen/Reiter/Options bzw. PDF-Download). */
  aktionen?: ReactNode;
  hinweis: string;
  /** P1-d: maschineller Fedlex-Currency-Beweis (geltend geprüft / künftige Fassung). */
  currency?: CurrencyEintrag;
}) {
  const titelOhneSuffix = erlass.titel.replace(/\s*\([^)]*\)\s*$/, '').trim();
  const titelRedundant = titelOhneSuffix.toLowerCase() === erlass.kuerzel.trim().toLowerCase();
  return (
    <header className="space-y-2.5 border-b border-line pb-5">
      <p className="lc-overline">{overline}</p>
      <h1 className="text-h2 sm:text-h1 font-display font-semibold text-ink-900 [overflow-wrap:anywhere] hyphens-auto">
        {erlass.kuerzel}{!titelRedundant && <span className="text-ink-500 font-normal"> — {erlass.titel}</span>}
      </h1>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-ink-500">
        {erlass.sr && <span>SR <span className="num">{erlass.sr}</span></span>}
        {artikelAnzahl != null && (
          <>
            {erlass.sr && <span className="text-ink-300" aria-hidden>·</span>}
            <span><span className="num">{artikelAnzahl}</span> {bestimmungsWort}</span>
          </>
        )}
        {erlass.stand && (erlass.sr || artikelAnzahl != null) && <span className="text-ink-300" aria-hidden>·</span>}
        {erlass.stand && <span>Stand <span className="num">{formatiereDatum(erlass.stand)}</span></span>}
        {erlass.quelleUrl && <a href={erlass.quelleUrl} target="_blank" rel="noopener noreferrer" className="lc-chip no-underline hover:text-brass-700">↗ geltende Fassung</a>}
        {/* P1-d Currency-Chips (Moat-Hebel 3): maschineller Freshness-Beweis + angekündigte
            Fassung. Prerender-stabil (Sidecar zur Bauzeit erhoben, keine Client-Datums-Logik,
            §15/2 CLS=0). Wortfeld «geltend geprüft am … (maschinell)» ist die zugelassene Formel. */}
        {currency?.geprueftAm && (
          <span className="lc-chip lc-chip-geltend whitespace-nowrap" title="Maschinell gegen den amtlichen Fedlex-Konsolidierungsgraphen (dateApplicability) geprüft; massgeblich bleibt stets die amtliche Quelle.">
            {`geltend geprüft am ${formatiereDatum(currency.geprueftAm)} (maschinell)`}
          </span>
        )}
        {currency?.naechsteFassungAb && (
          <span className="lc-chip lc-chip-vorbehalt whitespace-nowrap" title="Fedlex hat eine künftige Konsolidierung angekündigt; sie ist noch nicht in Kraft und wird erst zum Stichtag massgeblich.">
            {`nächste Fassung ab ${formatiereDatum(currency.naechsteFassungAb)}`}
          </span>
        )}
        {aktionen}
        <span className="basis-full sm:basis-auto sm:ml-auto text-micro text-ink-500">{hinweis}</span>
      </div>
    </header>
  );
}
