import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { filtern } from '../../lib/normtext/browse';
import { istLesbar } from '../../lib/normtext/browse-typen';
import type { BrowseManifest } from '../../lib/normtext/browse-typen';
import { erlassVorschlaege } from './helpers';

// ─── W2·10-UI-NAV/N0b: hilfreiche Fehlseite für einen unbekannten Erlass-Key ───
//
// Statt der nackten «nicht verfügbar»-Notiz: den ANGEFRAGTEN Key nennen (§8 —
// ehrlich, nichts Erfundenes), deterministische Fuzzy-Vorschläge aus dem
// Browse-Manifest («Meinten Sie …?», erlassVorschlaege = norm()+Levenshtein,
// kein neuer Index/K10) und ein eingebettetes Erlass-Suchfeld über das Register.
// Reine Darstellung/Navigation (§3) — keine Rechtslogik.
export function GesetzFehlSeite({ schluessel, manifest }: {
  schluessel: string;
  manifest: BrowseManifest | null;
}) {
  const [filter, setFilter] = useState('');
  const erlasse = useMemo(() => manifest?.erlasse ?? [], [manifest]);

  const vorschlaege = useMemo(
    () => erlassVorschlaege(erlasse, schluessel, 6),
    [erlasse, schluessel],
  );
  // Suchfeld: über die lesbaren Erlasse (Volltext/PDF), damit jeder Treffer auch
  // wirklich in eine Lesesicht führt (§8). Leerer Filter → keine Liste (ruhig).
  const treffer = useMemo(() => {
    if (filter.trim() === '') return [];
    return filtern(erlasse.filter(istLesbar), filter).slice(0, 12);
  }, [erlasse, filter]);

  const pfad = (e: { ebene: string; key: string }) => `/gesetze/${e.ebene}/${encodeURIComponent(e.key)}`;

  return (
    <div className="space-y-5">
      <Link to="/gesetze" className="inline-block text-body-s text-brass-700 hover:text-brass-600 no-underline">‹ Zur Gesetzessammlung</Link>
      <div className="lc-notice lc-notice-warn space-y-1">
        <p className="font-medium">Erlass nicht gefunden</p>
        <p className="text-body-s">
          «<span className="num">{schluessel}</span>» ist nicht als Erlass im Bestand.
        </p>
      </div>

      {vorschlaege.length > 0 && (
        <div className="space-y-2">
          <p className="lc-overline">Meinten Sie …?</p>
          <div className="flex flex-wrap gap-1.5">
            {vorschlaege.map((e) => (
              <Link key={`${e.ebene}/${e.key}`} to={pfad(e)}
                className="lc-chip hover:text-brass-700 hover:border-brass-300"
                title={e.titel}>
                {e.kuerzel}
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <label htmlFor="fehl-erlass-suche" className="lc-overline">Erlass suchen</label>
        <input id="fehl-erlass-suche" type="search" value={filter}
          onChange={(ev) => setFilter(ev.target.value)}
          placeholder="Kürzel, Titel oder SR-Nummer …" aria-label="Erlass suchen"
          className="lc-input h-9 py-0 text-body-s w-full max-w-reading" />
        {filter.trim() !== '' && (
          treffer.length > 0 ? (
            <ul className="space-y-1">
              {treffer.map((e) => (
                <li key={`${e.ebene}/${e.key}`}>
                  <Link to={pfad(e)} className="inline-flex min-h-11 items-center gap-2 text-body-s text-ink-700 hover:text-brass-700 no-underline">
                    <span className="num font-medium">{e.kuerzel}</span>
                    <span className="truncate text-ink-500">{e.titel}</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-body-s text-ink-500">Kein Erlass gefunden.</p>
          )
        )}
      </div>
    </div>
  );
}
