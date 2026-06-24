import type { EntscheidFilterWerte, SortModus } from '../../lib/rechtsprechung/browse';
import { normLabel } from '../../lib/rechtsprechung/browse';
import type { BrowseEntscheid } from '../../lib/rechtsprechung/register';

// Schlanke Steuerleiste der Übersicht /rechtsprechung (ersetzt den schweren
// Filterblock): EINE Toolbar-Zeile (Suche + Sortierung + Dichte) + ein
// zugeklapptes <details> für Sekundärfilter (Kanton/Gericht/Sprache/Datum/
// «nur Leitentscheide») + eine Reihe entfernbarer Aktiv-Filter-Chips, damit
// nichts unsichtbar filtert. Das Sachgebiet steuert die Rail (Entdoppelung) —
// hier kein Sachgebiet-Select. Reine Darstellung (§3); Filterung macht
// filterEntscheide() im Eltern. Auswahllisten aus dem Bestand abgeleitet.

const SPRACH_LABEL: Record<string, string> = { de: 'Deutsch', fr: 'Französisch', it: 'Italienisch', rm: 'Rätoromanisch' };
const SORT_LABEL: Record<SortModus, string> = {
  relevanz: 'Leitentscheide zuerst', neu: 'Neueste zuerst', alt: 'Älteste zuerst', gericht: 'Bund → Kantone',
};

function einzigartig<T>(werte: T[]): T[] {
  return [...new Set(werte)];
}

export function EntscheidFilter({ werte, onChange, bestand, sort, onSort, dichte, onDichte }: {
  werte: EntscheidFilterWerte;
  onChange: (w: EntscheidFilterWerte) => void;
  /** Voller Bestand (vor Filter) — für die Auswahllisten/Zähler. */
  bestand: BrowseEntscheid[];
  sort: SortModus;
  onSort: (s: SortModus) => void;
  dichte: 'liste' | 'karten';
  onDichte: (d: 'liste' | 'karten') => void;
}) {
  const setze = (teil: Partial<EntscheidFilterWerte>) => onChange({ ...werte, ...teil });

  const gerichte = einzigartig(bestand.map((e) => JSON.stringify({ id: e.gericht, name: e.gerichtName })))
    .map((s) => JSON.parse(s) as { id: string; name: string })
    .sort((a, b) => a.name.localeCompare(b.name, 'de'));
  const kantone = einzigartig(bestand.map((e) => e.kanton)).sort();
  const sprachen = einzigartig(bestand.map((e) => e.sprache)).sort();
  const gerichtN = (id: string) => bestand.filter((e) => e.gericht === id).length;
  const kantonN = (k: string) => bestand.filter((e) => e.kanton === k).length;
  const spracheN = (s: string) => bestand.filter((e) => e.sprache === s).length;

  // Aktive Sekundärfilter (ohne Sachgebiet — das zeigt die Rail) als entfernbare Chips.
  const aktiveChips: { key: string; label: string; loesche: () => void }[] = [];
  if (werte.norm) aktiveChips.push({ key: 'norm', label: `Norm: ${normLabel(werte.norm)}`, loesche: () => setze({ norm: null }) });
  if (werte.kanton) aktiveChips.push({ key: 'kanton', label: `Kanton: ${werte.kanton === 'CH' ? 'Bund' : werte.kanton}`, loesche: () => setze({ kanton: null }) });
  if (werte.gericht) aktiveChips.push({ key: 'gericht', label: `Gericht: ${bestand.find((e) => e.gericht === werte.gericht)?.gerichtName ?? werte.gericht}`, loesche: () => setze({ gericht: null }) });
  if (werte.sprache) aktiveChips.push({ key: 'sprache', label: `Sprache: ${SPRACH_LABEL[werte.sprache] ?? werte.sprache}`, loesche: () => setze({ sprache: null }) });
  if (werte.nurLeitentscheide) aktiveChips.push({ key: 'leit', label: 'Nur Leitentscheide', loesche: () => setze({ nurLeitentscheide: false }) });
  if (werte.nurBge) aktiveChips.push({ key: 'bge', label: 'Nur BGE (amtlich publiziert)', loesche: () => setze({ nurBge: false }) });
  if (werte.datumVon) aktiveChips.push({ key: 'von', label: `ab ${werte.datumVon}`, loesche: () => setze({ datumVon: null }) });
  if (werte.datumBis) aktiveChips.push({ key: 'bis', label: `bis ${werte.datumBis}`, loesche: () => setze({ datumBis: null }) });
  const suchAktiv = !!werte.q?.trim();
  // Beim Zurücksetzen das Sachgebiet (Rail/URL) bewahren — nur Sekundärfilter+Suche leeren.
  const zuruecksetzen = () => onChange({ sachgebiet: werte.sachgebiet ?? null });

  const dichteBtn = (d: 'liste' | 'karten', label: string) => (
    <button type="button" onClick={() => onDichte(d)} aria-pressed={dichte === d}
      className={`px-2.5 py-1 text-xs transition-colors ${dichte === d ? 'bg-brass-100 text-brass-800 font-medium' : 'text-ink-500 hover:text-ink-700'}`}>
      {label}
    </button>
  );

  return (
    <div className="space-y-2.5">
      {/* Toolbar — eine Zeile (umbrechend auf Mobil). */}
      <div className="flex flex-wrap items-center gap-2">
        <input
          type="search"
          value={werte.q ?? ''}
          onChange={(e) => setze({ q: e.target.value })}
          placeholder="Suchen — Thema, Aktenzeichen, Norm, Gericht …"
          aria-label="Rechtsprechung durchsuchen"
          className="lc-input lc-input-sm min-w-[180px] flex-1"
        />
        <label className="flex shrink-0 items-center gap-1.5 text-xs text-ink-500">
          <span className="hidden sm:inline">Sortierung</span>
          {/* min-w + shrink-0: in der flex-wrap-Toolbar wurde der Select sonst
              gestaucht und das längste Label («Leitentscheide zuerst») abgeschnitten. */}
          <select className="lc-select lc-input-sm min-w-[11.5rem]" value={sort} onChange={(e) => onSort(e.target.value as SortModus)}
            aria-label="Sortierung">
            {(Object.keys(SORT_LABEL) as SortModus[]).map((s) => <option key={s} value={s}>{SORT_LABEL[s]}</option>)}
          </select>
        </label>
        <div className="inline-flex shrink-0 overflow-hidden rounded-md border border-line" role="group" aria-label="Ansicht">
          {dichteBtn('liste', 'Liste')}
          {dichteBtn('karten', 'Karten')}
        </div>
      </div>

      {/* Sekundärfilter — standardmässig zu (Inhalt steht oben, nicht der Filter). */}
      <details className="lc-card px-4 py-2.5">
        <summary className="cursor-pointer select-none text-body-s font-medium text-brass-700">Erweiterte Filter</summary>
        <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
          {kantone.length > 1 && (
            <label className="flex flex-col gap-1 text-xs text-ink-500">
              <span>Kanton / Bund</span>
              <select className="lc-input h-9 py-0 text-body-s" value={werte.kanton ?? ''}
                onChange={(e) => setze({ kanton: e.target.value || null })}>
                <option value="">Alle</option>
                {kantone.map((k) => <option key={k} value={k}>{k === 'CH' ? 'Bund (CH)' : k} ({kantonN(k)})</option>)}
              </select>
            </label>
          )}
          {gerichte.length > 1 && (
            <label className="flex flex-col gap-1 text-xs text-ink-500">
              <span>Gericht</span>
              <select className="lc-input h-9 py-0 text-body-s" value={werte.gericht ?? ''}
                onChange={(e) => setze({ gericht: e.target.value || null })}>
                <option value="">Alle</option>
                {gerichte.map((g) => <option key={g.id} value={g.id}>{g.name} ({gerichtN(g.id)})</option>)}
              </select>
            </label>
          )}
          {sprachen.length > 1 && (
            <label className="flex flex-col gap-1 text-xs text-ink-500">
              <span>Sprache</span>
              <select className="lc-input h-9 py-0 text-body-s" value={werte.sprache ?? ''}
                onChange={(e) => setze({ sprache: e.target.value || null })}>
                <option value="">Alle</option>
                {sprachen.map((s) => <option key={s} value={s}>{SPRACH_LABEL[s] ?? s} ({spracheN(s)})</option>)}
              </select>
            </label>
          )}
          <label className="flex flex-col gap-1 text-xs text-ink-500">
            <span>Urteil ab</span>
            <input type="date" lang="de-CH" className="lc-input h-9 py-0 text-body-s"
              value={werte.datumVon ?? ''} onChange={(e) => setze({ datumVon: e.target.value || null })} />
          </label>
          <label className="flex flex-col gap-1 text-xs text-ink-500">
            <span>Urteil bis</span>
            <input type="date" lang="de-CH" className="lc-input h-9 py-0 text-body-s"
              value={werte.datumBis ?? ''} onChange={(e) => setze({ datumBis: e.target.value || null })} />
          </label>
          <label className="flex items-center gap-2 self-end pb-1 text-body-s text-ink-700">
            <input type="checkbox" className="h-4 w-4 accent-brass-600"
              checked={!!werte.nurLeitentscheide} onChange={(e) => setze({ nurLeitentscheide: e.target.checked })} />
            Nur Leitentscheide
          </label>
          <label className="flex items-center gap-2 self-end pb-1 text-body-s text-ink-700">
            <input type="checkbox" className="h-4 w-4 accent-brass-600"
              checked={!!werte.nurBge} onChange={(e) => setze({ nurBge: e.target.checked })} />
            Nur BGE (amtlich publiziert)
          </label>
        </div>
      </details>

      {/* Aktiv-Filter-Chips (immer sichtbar, auch bei zugeklapptem Disclosure). */}
      {(aktiveChips.length > 0 || suchAktiv) && (
        <div className="flex flex-wrap items-center gap-1.5">
          {aktiveChips.map((c) => (
            <button key={c.key} type="button" onClick={c.loesche}
              className="lc-chip inline-flex items-center gap-1 hover:border-brass-400 hover:text-brass-700"
              title="Filter entfernen">
              {c.label}<span aria-hidden>×</span>
            </button>
          ))}
          <button type="button" onClick={zuruecksetzen}
            className="text-xs font-medium text-brass-700 hover:text-brass-600">
            zurücksetzen
          </button>
        </div>
      )}
    </div>
  );
}
