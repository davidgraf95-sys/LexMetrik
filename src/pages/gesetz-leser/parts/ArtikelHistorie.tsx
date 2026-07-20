import { memo, useState } from 'react';
import type { ArtikelHistorie, HistorieEreignis, HistorieTyp } from '../../../lib/normtext/historie-laden';
import { formatiereDatum } from '../helpers';

// G-HIST-UI — Per-Artikel-«Gilt seit»-Badge + aufklappbare Fassungs-Timeline.
//
// Datenquelle: der erlass-lokale Historie-Shard (public/normtext/historie/<KEY>.json,
// G-HIST #286) — der Reader lädt ihn EINMAL idle und reicht den Artikel-Eintrag als
// Prop durch (wie die Leitfall-/Verweis-Zeilen). Reine Darstellung (§3): die
// Komponente rechnet KEINE Daten, sie rendert nur, was der Shard liefert
// (giltSeit / aufgehobenSeit als Badge, `ereignisse` als Timeline).
//
// §15.2 (CLS) — KORRIGIERT nach Messung 20.7.2026. Die ursprüngliche Annahme, die
// Zeile wachse nur «below-fold» ein und sei darum CLS-neutral, war FALSCH: bei einem
// Anker-Deeplink (`/gesetze/bund/MWSTV#art-165`) steht der Zielartikel oben im
// Viewport, die Artikel darunter sind SICHTBAR — der idle-Shard-Resolve schob sie
// alle. Gemessen unter 6× CPU-Drossel: CLS 0.0227 gegen 0.0002 auf main (Faktor
// ~100), auf dem CI-Runner 0.0550 gegen Budget 0.05. Darum reserviert der Slot in
// ArtikelLeser (`mt-4 min-h-hist-zeile`) die eine Chip-Zeile ab dem ERSTEN Render,
// und `schaetzeArtikelHoehe` trägt sie in `contain-intrinsic-size` für die
// off-screen-Artikel nach. Diese Komponente rendert deshalb OHNE eigenen
// Aussenabstand (der sitzt am Slot), damit reservierte und gefüllte Höhe exakt
// zusammenfallen. Die Timeline ist im Initialzustand ZU (Klick = echter Input ⇒
// CLS-exkludiert). Kein leerer Kasten (§13): ohne datierten Stand UND ohne Ereignis
// rendert die Zeile GAR NICHT (§8) — der Slot bleibt dann leerer Weissraum.

// HistorieTyp → deutsches Anzeige-Label (Darstellung, keine Rechtslogik). Deckt die
// im Korpus belegten Ereignistypen (historie-parse.ts) vollständig ab.
const TYP_LABEL: Readonly<Record<HistorieTyp, string>> = {
  eingefuegt: 'Eingefügt',
  fassung: 'Neufassung',
  aufgehoben: 'Aufgehoben',
  ausdruck: 'Ausdruck angepasst',
  bezeichnung: 'Bezeichnung angepasst',
  angenommen: 'Angenommen (Abstimmung)',
  betrag: 'Betrag angepasst',
  nummerierung: 'Neu nummeriert',
  bereinigt: 'Bereinigt',
  berichtigt: 'Berichtigung',
  inkraft: 'In Kraft',
  urspruenglich: 'Ursprünglich',
};

// Skopus-Zusatz (Abs./lit.), sofern die Quell-Fussnote ihn trägt — dezent, ehrlich.
function skopus(e: HistorieEreignis): string {
  const teile: string[] = [];
  if (e.absatz) teile.push(`Abs. ${e.absatz}`);
  if (e.item) teile.push(`lit./Ziff. ${e.item}`);
  return teile.join(', ');
}

// AS-/BBl-Fundstellen eines Ereignisses: amtlicher Deep-Link, wo aufgelöst; sonst
// ehrlich das blosse Label (Fundstelle nie verschweigen, §7/§8). Deduped stabil.
function Quellen({ quellen }: { quellen: HistorieEreignis['quellen'] }) {
  const gesehen = new Set<string>();
  const eindeutig = quellen.filter((q) => (gesehen.has(q.label) ? false : (gesehen.add(q.label), true)));
  if (eindeutig.length === 0) return null;
  return (
    <span className="text-ink-400">
      {eindeutig.map((q, i) => (
        <span key={q.label + i}>
          {i > 0 && <span aria-hidden> · </span>}
          {q.url ? (
            <a href={q.url} target="_blank" rel="noopener noreferrer" className="num hover:text-brass-700 hover:underline">{q.label}</a>
          ) : (
            <span className="num">{q.label}</span>
          )}
        </span>
      ))}
    </span>
  );
}

export const ArtikelHistorieZeile = memo(function ArtikelHistorieZeile({ historie, artikel }: {
  /** Historie dieses Artikels aus dem erlass-lokalen Shard; undefined = kein Eintrag ⇒ still. */
  historie?: ArtikelHistorie;
  /** Artikel-Token (für stabile aria-controls-/Panel-Id). */
  artikel: string;
}) {
  const [offen, setOffen] = useState(false);

  // §8: ohne datierten Stand UND ohne Ereignis nichts anzeigen (kein leerer Kasten, §13).
  if (!historie) return null;
  const ereignisse = historie.ereignisse ?? [];
  const hatDatum = !!historie.giltSeit || !!historie.aufgehobenSeit;
  if (!hatDatum && ereignisse.length === 0) return null;

  const panelId = `hist-${artikel}`;
  const hatTimeline = ereignisse.length > 0;

  // Badge-Text (§8, nie erfunden): aufgehobener Artikel zeigt den Wirkungs-Stand,
  // sonst das In-Kraft-Datum der aktuellen Fassung; fehlt beides, ein neutraler
  // Titel für die reine Ereignis-Historie.
  const badgeText = historie.aufgehobenSeit
    ? `Aufgehoben seit ${formatiereDatum(historie.aufgehobenSeit)}`
    : historie.giltSeit
      ? `Gilt seit ${formatiereDatum(historie.giltSeit)}`
      : 'Fassungshistorie';

  return (
    // Kein eigener Aussenabstand mehr: den trägt der reservierte Slot in
    // ArtikelLeser (`mt-4 min-h-hist-zeile`), damit reservierte und gefüllte
    // Höhe exakt zusammenfallen (§15.2, sonst schiebt der Resolve doch wieder).
    <div data-historie-zeile>
      <div className="flex flex-wrap items-center gap-2">
        <span className="lc-overline mr-1" title="Fassungshistorie dieses Artikels aus den amtlichen Änderungs-Fussnoten (Fedlex). Massgeblich bleibt die amtliche Quelle.">
          <span className="lc-punkt" aria-hidden />Fassung
        </span>
        {hatTimeline ? (
          <button
            type="button"
            onClick={() => setOffen((v) => !v)}
            aria-expanded={offen}
            aria-controls={panelId}
            className="lc-chip hover:text-brass-700"
            title={offen ? 'Fassungs-Zeitleiste einklappen' : 'Fassungs-Zeitleiste anzeigen'}
          >
            {badgeText}
            <span aria-hidden className="ml-1 text-ink-400">{offen ? '▾' : '▸'}</span>
          </button>
        ) : (
          <span className="lc-chip">{badgeText}</span>
        )}
      </div>
      {hatTimeline && offen && (
        <ol id={panelId} className="mt-2 space-y-1.5 border-l border-line pl-3 text-xs leading-snug text-ink-500">
          {ereignisse.map((e, i) => {
            const sk = skopus(e);
            return (
              <li key={i} className="relative">
                <span className="font-semibold text-ink-700">{TYP_LABEL[e.typ]}</span>
                {sk && <span className="text-ink-400"> · {sk}</span>}
                {e.datum && (
                  <span> · {e.wirkung ? 'mit Wirkung seit' : 'in Kraft seit'} <span className="num text-ink-600">{formatiereDatum(e.datum)}</span></span>
                )}
                {e.quellen.length > 0 && <span> · <Quellen quellen={e.quellen} /></span>}
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
});
