import type { EntscheidFilterWerte, SortModus } from '../../lib/rechtsprechung/browse';
import { normLabel, filterEntscheide } from '../../lib/rechtsprechung/browse';
import type { BrowseEntscheid } from '../../lib/rechtsprechung/register';

// Schlanke Steuerleiste der Übersicht /rechtsprechung (ersetzt den schweren
// Filterblock): EINE Toolbar-Zeile (Suche + Sortierung + Dichte) + eine sichtbare
// Facetten-Leiste (Gemeinwesen, Sprache) als Toggle-Chips mit Trefferzahl + ein
// zugeklapptes <details> für die Langläufer (Gericht/Datum/«nur Leitentscheide»)
// + eine Reihe entfernbarer Aktiv-Filter-Chips, damit nichts unsichtbar filtert.
// Das Sachgebiet steuert die Rail (Entdoppelung) — hier kein Sachgebiet-Select.
// Reine Darstellung (§3); Filterung macht filterEntscheide() im Eltern.

const SPRACH_LABEL: Record<string, string> = { de: 'Deutsch', fr: 'Französisch', it: 'Italienisch', rm: 'Rätoromanisch' };
const SORT_LABEL: Record<SortModus, string> = {
  relevanz: 'Leitentscheide zuerst', neu: 'Neueste zuerst', alt: 'Älteste zuerst', gericht: 'Bund → Kantone',
};

function einzigartig<T>(werte: T[]): T[] {
  return [...new Set(werte)];
}

/** Eine Facetten-Achse (Auftrag 4/8) als Toggle-Chips mit Trefferzahl (Reglement
 *  R15: «Trefferzahl je Facette» gegen Null-Treffer-Klicks). Die primären Achsen
 *  sichtbar in der Ergebnis-Spalte statt im zugeklappten <details>. Reine Anzeige (§3). */
function FacettenGruppe({ label, optionen }: {
  label: string;
  optionen: { id: string; text: string; n: number; aktiv: boolean; waehle: () => void }[];
}) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
      <span aria-hidden className="lc-overline shrink-0 text-ink-500">{label}</span>
      {optionen.map((o) => (
        <button key={o.id} type="button" aria-pressed={o.aktiv} onClick={o.waehle}
          aria-label={`${label}: ${o.text} (${o.n})`}
          className={`lc-chip ${o.aktiv ? 'border-brass-400 text-brass-700' : ''}`}>
          {/* ink-600 (nicht ink-500): 12px-Ziffer auf --well ≥4.5:1 (R4/WCAG 1.4.3,
              Werte nicht runden — ink-500 lag bei 4.47:1). Aktiv erbt brass-700. */}
          {o.text}<span className={`num ml-1.5 ${o.aktiv ? '' : 'text-ink-600'}`}>{o.n}</span>
        </button>
      ))}
    </div>
  );
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
  // Verweis-Einträge (vollständige Urteile zu einem BGE) NICHT mitzählen — sonst
  // widerspricht der Dropdown-Zähler dem Ergebnis-Counter (echtAnzahl, !e.verweis),
  // symmetrisch zur hausweiten Verweis-Ausnahme (zaehleSachgebiete/normHaeufigkeit).
  const gerichtN = (id: string) => bestand.filter((e) => !e.verweis && e.gericht === id).length;
  // Cross-gefilterte Facetten-Zähler (konsistent mit der Sachgebiets-Rail, R15): je
  // Achse die Resttreffer-Zahl über den Bestand MIT allen anderen aktiven Filtern, aber
  // OHNE die eigene Achse — so zeigt jeder Chip seine echte Menge, und Null-Optionen
  // werden ausgeblendet (kein Null-Treffer-Klick). Verweis-Einträge nie mitzählen.
  const zaehle = (basis: BrowseEntscheid[], pred: (e: BrowseEntscheid) => boolean) =>
    basis.filter((e) => !e.verweis && pred(e)).length;
  const gwBasis = filterEntscheide(bestand, { ...werte, ebene: null, kanton: null });
  const sprBasis = filterEntscheide(bestand, { ...werte, sprache: null });

  // ── Gemeinwesen-Achse (Auftrag 4): Bund/Kanton + Kanton-Drilldown als sichtbare
  //    Toggle-Chips. Ersetzt das frühere Ebene-Segment UND den Kanton-Select — EINE
  //    kohärente Achse statt zweier konkurrierender Controls. «Bund»/«Kantone» laufen
  //    über die `ebene`-Achse, einzelne Kantone über `kanton`; ein aktiver Chip schaltet
  //    auf «Alle» zurück (Toggle). Instanz (gerichtstyp) ist heute deckungsgleich mit
  //    Bund/Kanton (nur 2 Werte) → erst mit Batch 3 (BVGer/BStGer/BPatGer) eigene Achse.
  const echteKantone = kantone.filter((k) => k !== 'CH');
  const hatKantonal = echteKantone.length > 0;
  const gwAlle = () => setze({ ebene: null, kanton: null });
  const gemeinwesenOpt = [
    { id: 'alle', text: 'Alle', n: zaehle(gwBasis, () => true), aktiv: !werte.ebene && !werte.kanton, waehle: gwAlle },
    { id: 'bund', text: 'Bund', n: zaehle(gwBasis, (e) => e.kanton === 'CH'),
      aktiv: werte.ebene === 'bund',
      waehle: () => (werte.ebene === 'bund' ? gwAlle() : setze({ ebene: 'bund', kanton: null })) },
    ...(hatKantonal ? [
      { id: 'kantone', text: 'Kantone', n: zaehle(gwBasis, (e) => e.kanton !== 'CH'),
        aktiv: werte.ebene === 'kanton',
        waehle: () => (werte.ebene === 'kanton' ? gwAlle() : setze({ ebene: 'kanton', kanton: null })) },
      ...echteKantone.map((k) => ({
        id: k, text: k, n: zaehle(gwBasis, (e) => e.kanton === k), aktiv: werte.kanton === k,
        waehle: () => (werte.kanton === k ? gwAlle() : setze({ kanton: k, ebene: null })),
      })),
    ] : []),
  ].filter((o) => o.id === 'alle' || o.n > 0 || o.aktiv); // Null-Optionen aus (ausser aktiv)

  // ── Sprache-Achse (Auftrag 8): seit A2 gibt es echte FR-Entscheide → die Sprache
  //    aus dem vergrabenen <details>-Select in dieselbe Facetten-Leiste hochgezogen
  //    (eine kohärente Leiste, nicht zwei konkurrierende). Toggle + Null-Prune wie oben.
  const hatMehrsprachig = sprachen.length > 1;
  const spracheOpt = [
    { id: 'alle', text: 'Alle', n: zaehle(sprBasis, () => true), aktiv: !werte.sprache, waehle: () => setze({ sprache: null }) },
    ...sprachen.map((s) => ({
      id: s, text: SPRACH_LABEL[s] ?? s, n: zaehle(sprBasis, (e) => e.sprache === s), aktiv: werte.sprache === s,
      waehle: () => (werte.sprache === s ? setze({ sprache: null }) : setze({ sprache: s })),
    })),
  ].filter((o) => o.id === 'alle' || o.n > 0 || o.aktiv);

  // Aktive Sekundärfilter (ohne Sachgebiet — das zeigt die Rail) als entfernbare Chips.
  const aktiveChips: { key: string; label: string; loesche: () => void }[] = [];
  // Gemeinwesen (kanton/ebene) steht als sichtbare Facetten-Leiste mit Toggle —
  // darum KEIN zusätzlicher Aktiv-Chip dafür (sonst doppelte Repräsentation).
  if (werte.norm) aktiveChips.push({ key: 'norm', label: `Norm: ${normLabel(werte.norm)}`, loesche: () => setze({ norm: null }) });
  if (werte.gericht) aktiveChips.push({ key: 'gericht', label: `Gericht: ${bestand.find((e) => e.gericht === werte.gericht)?.gerichtName ?? werte.gericht}`, loesche: () => setze({ gericht: null }) });
  // F4 (JETZT-MACHEN §5): «nur Leitentscheide» und «nur BGE» wählten exakt dieselbe
  // Menge (am Korpus geprüft 272=272, 0 Divergenz) → zu EINEM sichtbaren Filter
  // zusammengeführt. Semantik trägt `leitcharakter`; der `nurBge`-Prädikat bleibt in
  // browse.ts erhalten (spätere Trennung amtliche-BGE ⟂ Leitentscheid bleibt möglich).
  if (werte.nurLeitentscheide) aktiveChips.push({ key: 'leit', label: 'Nur Leitentscheide (amtliche BGE)', loesche: () => setze({ nurLeitentscheide: false }) });
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
          <select className="lc-select lc-input-sm w-auto min-w-[13.75rem]" value={sort} onChange={(e) => onSort(e.target.value as SortModus)}
            aria-label="Sortierung">
            {(Object.keys(SORT_LABEL) as SortModus[]).map((s) => <option key={s} value={s}>{SORT_LABEL[s]}</option>)}
          </select>
        </label>
        <div className="inline-flex shrink-0 overflow-hidden rounded-md border border-line" role="group" aria-label="Ansicht">
          {dichteBtn('liste', 'Liste')}
          {dichteBtn('karten', 'Karten')}
        </div>
      </div>

      {/* Facetten-Leiste — die primären Achsen sichtbar (Auftrag 4 «Gemeinwesen»,
          Auftrag 8 «Sprache»), statt im <details> vergraben. Trefferzahl je Chip (R15). */}
      {hatKantonal && gemeinwesenOpt.length > 1 && <FacettenGruppe label="Gemeinwesen" optionen={gemeinwesenOpt} />}
      {hatMehrsprachig && spracheOpt.length > 1 && <FacettenGruppe label="Sprache" optionen={spracheOpt} />}

      {/* Sekundärfilter — standardmässig zu (Inhalt steht oben, nicht der Filter). */}
      <details className="lc-card px-4 py-2.5">
        <summary className="cursor-pointer select-none text-body-s font-medium text-brass-700">Erweiterte Filter</summary>
        {/* Kanton/Bund («Gemeinwesen») und Sprache stehen jetzt als Facetten-Leiste
            oben — hier nur die Langläufer (Gericht, Datum). */}
        <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
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
          {/* F4: EIN zusammengeführter Filter (Leitentscheid == amtlicher BGE, deckungs-
              gleiche Menge) statt zweier redundanter Häkchen. */}
          <label className="flex items-center gap-2 self-end pb-1 text-body-s text-ink-700">
            <input type="checkbox" className="h-4 w-4 accent-brass-600"
              checked={!!werte.nurLeitentscheide} onChange={(e) => setze({ nurLeitentscheide: e.target.checked })} />
            Nur Leitentscheide (amtliche BGE)
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
