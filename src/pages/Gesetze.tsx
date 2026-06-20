import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SeitenKopf } from '../components/layout/SeitenKopf';
import { ErlassKarte } from '../components/normtext/ErlassKarte';
import {
  ladeBrowseManifest, gruppiereNachKanton, filtern,
} from '../lib/normtext/browse';
import type { BrowseErlass } from '../lib/normtext/browse-typen';
import { SYSTEMATIK } from '../lib/normtext/systematik';

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

// Eine aufklappbare Systematik-Kategorie (modulweit, nicht im Render erzeugt).
function Kategorie({ id, offen, kopf, anzahl, children }: {
  id?: string; offen?: boolean; kopf: React.ReactNode; anzahl: number; children: React.ReactNode;
}) {
  return (
    <details id={id} open={offen} className="group lc-card overflow-hidden scroll-mt-24">
      <summary className="flex items-baseline gap-3 cursor-pointer select-none px-5 py-3.5 hover:bg-brass-100/30">
        {kopf}
        <span className="num text-body-s text-ink-400 ml-auto">{anzahl}</span>
      </summary>
      <div className="px-5 pb-5 pt-4 space-y-5 border-t border-line">{children}</div>
    </details>
  );
}

// Bund-Erlasse nach der funktionalen Systematik (systematik.ts): aufklappbare
// Kategorien (die geläufigen offen), Untergruppen, je Gesetz eine klickbare
// Karte (Volltext oder Live-Link). «Weitere Erlasse» fängt alles ein, was (noch)
// keiner Gruppe zugeordnet ist — so geht nie ein Eintrag verloren.
function BundSystematik({ erlasse }: { erlasse: BrowseErlass[] }) {
  const proKey = new Map(erlasse.map((e) => [e.key, e]));
  const zugeordnet = new Set<string>();
  const kategorien = SYSTEMATIK.map((kat) => {
    const gruppen = kat.gruppen
      .map((g) => {
        const items = g.keys.map((k) => proKey.get(k)).filter((e): e is BrowseErlass => !!e);
        items.forEach((e) => zugeordnet.add(e.key));
        return { id: g.id, titel: g.titel, items };
      })
      .filter((g) => g.items.length > 0);
    const anzahl = gruppen.reduce((a, g) => a + g.items.length, 0);
    return { ...kat, gruppen, anzahl };
  }).filter((k) => k.anzahl > 0);
  const weitere = erlasse.filter((e) => !zugeordnet.has(e.key));

  return (
    <div className="space-y-3">
      {kategorien.map((kat) => (
        <Kategorie key={kat.id} id={`sys-${kat.id}`} offen={kat.standardOffen} anzahl={kat.anzahl}
          kopf={
            <span className="flex items-baseline gap-2.5">
              <span aria-hidden className="font-display text-h3 leading-none text-brass-700">{kat.nr}</span>
              <span className="font-sans font-semibold text-ink-900 text-h3 tracking-tight">{kat.titel}</span>
            </span>
          }>
          <p className="text-body-s text-ink-500 max-w-reading">{kat.lede}</p>
          {kat.gruppen.map((g) => (
            <div key={g.id} className="space-y-2">
              <div className="flex items-center gap-3">
                <h3 className="lc-overline text-brass-700">{g.titel}</h3>
                <span aria-hidden className="flex-1 h-px bg-line" />
              </div>
              <Gitter erlasse={g.items} />
            </div>
          ))}
        </Kategorie>
      ))}
      {weitere.length > 0 && (
        <Kategorie anzahl={weitere.length}
          kopf={<span className="font-sans font-medium text-ink-700 text-body-l">Weitere Erlasse</span>}>
          <Gitter erlasse={weitere} />
        </Kategorie>
      )}
    </div>
  );
}

export function Gesetze() {
  const [erlasse, setErlasse] = useState<BrowseErlass[] | null>(null);
  const [fehler, setFehler] = useState(false);
  const [suche, setSuche] = useState('');
  const [kanton, setKanton] = useState<string | null>(null);

  // Ebene (Bund/Kantone) liegt in der URL (?ebene=) — so verlinkt die App-Shell-
  // Seitenleiste direkt auf den Kantone-Tab bzw. (mit #g-<gebiet>) auf ein
  // Bund-Rechtsgebiet; teilbar und mit Zurück-Taste, wie der Katalog (?kategorie=).
  const [params, setParams] = useSearchParams();
  const ebene: Ebene = params.get('ebene') === 'kanton' ? 'kanton' : 'bund';
  const setzeEbene = (e: Ebene) => {
    const p = new URLSearchParams(params);
    if (e === 'kanton') p.set('ebene', 'kanton'); else p.delete('ebene');
    setParams(p, { replace: true });
    setKanton(null);
  };

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
            {!suche.trim() && <Segment aktiv={ebene} onWahl={setzeEbene} />}
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
            gefiltert.length === 0
              ? <p className="text-body-s text-ink-500">Kein Erlass gefunden.</p>
              : <BundSystematik erlasse={gefiltert} />
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
