import { useEffect, useMemo, useState } from 'react';
import { SeitenKopf } from '../components/layout/SeitenKopf';
import { ErlassKarte } from '../components/normtext/ErlassKarte';
import {
  ladeBrowseManifest, gruppiereNachGebiet, gruppiereNachKanton, filtern,
} from '../lib/normtext/browse';
import type { BrowseErlass } from '../lib/normtext/browse-typen';

type Ebene = 'bund' | 'kanton';

function Segment({ aktiv, onWahl }: { aktiv: Ebene; onWahl: (e: Ebene) => void }) {
  const opt: { id: Ebene; label: string }[] = [
    { id: 'bund', label: 'Bund' },
    { id: 'kanton', label: 'Kantone' },
  ];
  return (
    <div role="tablist" aria-label="Ebene" className="inline-flex rounded-md border border-line bg-paper-sunken/50 p-0.5">
      {opt.map((o) => (
        <button
          key={o.id}
          role="tab"
          aria-selected={aktiv === o.id}
          onClick={() => onWahl(o.id)}
          className={`rounded px-4 py-1.5 text-body-s font-medium transition-colors ${
            aktiv === o.id ? 'bg-paper text-ink-900 shadow-sm' : 'text-ink-500 hover:text-ink-800'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function Gitter({ erlasse }: { erlasse: BrowseErlass[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {erlasse.map((e) => <ErlassKarte key={e.key} e={e} />)}
    </div>
  );
}

export function Gesetze() {
  const [erlasse, setErlasse] = useState<BrowseErlass[] | null>(null);
  const [fehler, setFehler] = useState(false);
  const [ebene, setEbene] = useState<Ebene>('bund');
  const [suche, setSuche] = useState('');
  const [kanton, setKanton] = useState<string | null>(null);

  useEffect(() => {
    let lebt = true;
    ladeBrowseManifest().then((m) => {
      if (!lebt) return;
      if (!m) { setFehler(true); return; }
      setErlasse(m.erlasse);
    });
    return () => { lebt = false; };
  }, []);

  const gefiltert = useMemo(
    () => (erlasse ? filtern(erlasse.filter((e) => e.ebene === ebene), suche) : []),
    [erlasse, ebene, suche],
  );
  const kantone = useMemo(
    () => (erlasse ? [...new Set(erlasse.filter((e) => e.ebene === 'kanton').map((e) => e.kanton!))].sort() : []),
    [erlasse],
  );

  return (
    <div className="space-y-8">
      <SeitenKopf
        overline="Rubrik V · Gesetze"
        titel="Schweizer Gesetzessammlung"
        intro="Volltext der in LexMetrik verwendeten Bundesgesetze und kantonalen Erlasse — geltende Fassung, mit Stand und amtlichem Live-Link. Massgeblich bleibt stets die amtliche Quelle."
      />

      {fehler && (
        <div className="lc-notice lc-notice-warn">
          Die Gesetzessammlung konnte nicht geladen werden. Bitte die Seite neu laden.
        </div>
      )}

      {!erlasse && !fehler && (
        <div className="py-12 text-center space-y-3">
          <div className="scale-rule max-w-[200px] mx-auto" aria-hidden />
          {/* Eigener Lade-Text: NICHT «Wird geladen» — dieser Wortlaut ist dem
              Suspense-Fallback-Drift-Tor in scripts/prerender.ts vorbehalten. */}
          <p className="text-body-s text-ink-500">Die Sammlung wird abgerufen …</p>
        </div>
      )}

      {erlasse && (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            {!suche.trim() && <Segment aktiv={ebene} onWahl={(e) => { setEbene(e); setKanton(null); }} />}
            <input
              type="search"
              value={suche}
              onChange={(e) => setSuche(e.target.value)}
              placeholder="Suchen — Bund & Kantone (Kürzel, Titel, SR-Nr.) …"
              aria-label="Gesetze durchsuchen"
              className="lc-input h-9 py-0 text-body-s w-full max-w-sm"
            />
          </div>

          {/* Globale Suche: über Bund UND Kantone gleichzeitig */}
          {suche.trim() && (() => {
            const treffer = filtern(erlasse, suche);
            const bund = treffer.filter((e) => e.ebene === 'bund');
            const kant = treffer.filter((e) => e.ebene === 'kanton');
            return (
              <div className="space-y-8">
                <p className="text-body-s text-ink-500"><span className="num">{treffer.length}</span> Treffer für «{suche.trim()}»</p>
                {bund.length > 0 && (
                  <section className="space-y-3">
                    <h2 className="lc-overline">Bund <span className="text-ink-400">· {bund.length}</span></h2>
                    <Gitter erlasse={bund} />
                  </section>
                )}
                {gruppiereNachKanton(kant).map((g) => (
                  <section key={g.kanton} className="space-y-3">
                    <h2 className="lc-overline">Kanton {g.kanton} <span className="text-ink-400">· {g.erlasse.length}</span></h2>
                    <Gitter erlasse={g.erlasse} />
                  </section>
                ))}
                {treffer.length === 0 && <p className="text-body-s text-ink-500">Kein Erlass gefunden.</p>}
              </div>
            );
          })()}

          {!suche.trim() && ebene === 'bund' && (
            <div className="space-y-8">
              {gruppiereNachGebiet(gefiltert).map((g) => (
                <section key={g.gebiet} className="space-y-3">
                  <h2 className="lc-overline">{g.label} <span className="text-ink-400">· {g.erlasse.length}</span></h2>
                  <Gitter erlasse={g.erlasse} />
                </section>
              ))}
              {gefiltert.length === 0 && <p className="text-body-s text-ink-500">Kein Erlass gefunden.</p>}
            </div>
          )}

          {!suche.trim() && ebene === 'kanton' && (
            <div className="space-y-6">
              {/* Kantons-Raster als Schnellfilter */}
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => setKanton(null)}
                  aria-pressed={kanton === null}
                  className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${
                    kanton === null ? 'bg-brass-100 text-ink-900' : 'text-ink-500 hover:bg-paper-sunken'
                  }`}
                >
                  Alle
                </button>
                {kantone.map((k) => (
                  <button
                    key={k}
                    onClick={() => setKanton(kanton === k ? null : k)}
                    aria-pressed={kanton === k}
                    className={`rounded px-2.5 py-1 text-xs font-medium num transition-colors ${
                      kanton === k ? 'bg-brass-100 text-ink-900' : 'text-ink-500 hover:bg-paper-sunken'
                    }`}
                  >
                    {k}
                  </button>
                ))}
              </div>

              {gruppiereNachKanton(kanton ? gefiltert.filter((e) => e.kanton === kanton) : gefiltert).map((g) => (
                <section key={g.kanton} className="space-y-3">
                  <h2 className="lc-overline">Kanton {g.kanton} <span className="text-ink-400">· {g.erlasse.length}</span></h2>
                  <Gitter erlasse={g.erlasse} />
                </section>
              ))}
              {gefiltert.length === 0 && <p className="text-body-s text-ink-500">Kein Erlass gefunden.</p>}
            </div>
          )}
        </>
      )}
    </div>
  );
}
