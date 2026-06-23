import type { EntscheidFilterWerte } from '../../lib/rechtsprechung/browse';
import type { BrowseEntscheid } from '../../lib/rechtsprechung/register';
import { GEBIETE, type Rechtsgebiet } from '../../lib/normtext/register';

// Filterleiste der Übersicht /rechtsprechung: Suchfeld + Sachgebiet/Gericht/
// Kanton/Sprache/«nur Leitentscheide»/Datum von-bis. Reine Darstellung (§3) —
// die eigentliche Filterung macht filterEntscheide() im Eltern; hier wird nur
// der Werte-Zustand bearbeitet. Auswahllisten (Gerichte/Kantone/Sprachen)
// werden aus dem Bestand abgeleitet, damit nie eine leere Option erscheint.

const SPRACH_LABEL: Record<string, string> = { de: 'Deutsch', fr: 'Französisch', it: 'Italienisch', rm: 'Rätoromanisch' };

function einzigartig<T>(werte: T[]): T[] {
  return [...new Set(werte)];
}

export function EntscheidFilter({ werte, onChange, bestand }: {
  werte: EntscheidFilterWerte;
  onChange: (w: EntscheidFilterWerte) => void;
  /** Voller Bestand (vor Filter) — für die Auswahllisten. */
  bestand: BrowseEntscheid[];
}) {
  const setze = (teil: Partial<EntscheidFilterWerte>) => onChange({ ...werte, ...teil });
  const gerichte = einzigartig(bestand.map((e) => ({ id: e.gericht, name: e.gerichtName })).map((g) => JSON.stringify(g)))
    .map((s) => JSON.parse(s) as { id: string; name: string });
  const kantone = einzigartig(bestand.map((e) => e.kanton)).sort();
  const sprachen = einzigartig(bestand.map((e) => e.sprache)).sort();
  const aktiv = !!(werte.q?.trim() || werte.sachgebiet || werte.gericht || werte.kanton
    || werte.sprache || werte.nurLeitentscheide || werte.datumVon || werte.datumBis);

  return (
    <div className="lc-card p-4 space-y-3">
      <input
        type="search"
        value={werte.q ?? ''}
        onChange={(e) => setze({ q: e.target.value })}
        placeholder="Suchen — Aktenzeichen, BGE, Regeste, Norm …"
        aria-label="Rechtsprechung durchsuchen"
        className="lc-input h-9 py-0 text-body-s w-full"
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        <label className="flex flex-col gap-1 text-xs text-ink-500">
          <span>Sachgebiet</span>
          <select className="lc-input h-9 py-0 text-body-s"
            value={werte.sachgebiet ?? ''}
            onChange={(e) => setze({ sachgebiet: (e.target.value || null) as Rechtsgebiet | null })}>
            <option value="">Alle</option>
            {GEBIETE.map((g) => <option key={g.id} value={g.id}>{g.label}</option>)}
          </select>
        </label>
        {gerichte.length > 1 && (
          <label className="flex flex-col gap-1 text-xs text-ink-500">
            <span>Gericht</span>
            <select className="lc-input h-9 py-0 text-body-s"
              value={werte.gericht ?? ''}
              onChange={(e) => setze({ gericht: e.target.value || null })}>
              <option value="">Alle</option>
              {gerichte.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
            </select>
          </label>
        )}
        {kantone.length > 1 && (
          <label className="flex flex-col gap-1 text-xs text-ink-500">
            <span>Kanton</span>
            <select className="lc-input h-9 py-0 text-body-s"
              value={werte.kanton ?? ''}
              onChange={(e) => setze({ kanton: e.target.value || null })}>
              <option value="">Alle</option>
              {kantone.map((k) => <option key={k} value={k}>{k === 'CH' ? 'Bund (CH)' : k}</option>)}
            </select>
          </label>
        )}
        {sprachen.length > 1 && (
          <label className="flex flex-col gap-1 text-xs text-ink-500">
            <span>Sprache</span>
            <select className="lc-input h-9 py-0 text-body-s"
              value={werte.sprache ?? ''}
              onChange={(e) => setze({ sprache: e.target.value || null })}>
              <option value="">Alle</option>
              {sprachen.map((s) => <option key={s} value={s}>{SPRACH_LABEL[s] ?? s}</option>)}
            </select>
          </label>
        )}
        <label className="flex flex-col gap-1 text-xs text-ink-500">
          <span>Datum von</span>
          <input type="date" className="lc-input h-9 py-0 text-body-s"
            value={werte.datumVon ?? ''}
            onChange={(e) => setze({ datumVon: e.target.value || null })} />
        </label>
        <label className="flex flex-col gap-1 text-xs text-ink-500">
          <span>Datum bis</span>
          <input type="date" className="lc-input h-9 py-0 text-body-s"
            value={werte.datumBis ?? ''}
            onChange={(e) => setze({ datumBis: e.target.value || null })} />
        </label>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="flex items-center gap-2 text-body-s text-ink-700 cursor-pointer">
          <input type="checkbox" className="h-4 w-4 accent-brass-600"
            checked={!!werte.nurLeitentscheide}
            onChange={(e) => setze({ nurLeitentscheide: e.target.checked })} />
          Nur Leitentscheide
        </label>
        {aktiv && (
          <button type="button"
            onClick={() => onChange({})}
            className="text-body-s font-medium text-brass-700 hover:text-brass-600 transition-colors">
            Filter zurücksetzen
          </button>
        )}
      </div>
    </div>
  );
}
