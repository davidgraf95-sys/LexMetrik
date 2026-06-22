import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import { SeitenKopf } from '../components/layout/SeitenKopf';
import { ErlassKarte, ErlassZeile } from '../components/normtext/ErlassKarte';
import {
  ladeBrowseManifest, gruppiereNachKanton, filtern,
} from '../lib/normtext/browse';
import type { BrowseErlass } from '../lib/normtext/browse-typen';
import { SYSTEMATIK, KANTON_RUBRIKEN, kantonRubrik } from '../lib/normtext/systematik';
import { KantonWappen } from '../components/KantonWappen';
import { SchweizKarte } from '../components/SchweizKarte';

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

// Ausführungsrecht (Verordnung/Reglement) erkennt man am Titel — rein für die
// ANZEIGE-Hierarchie (Leitgesetze prominent, Verordnungen dezent); ändert keine
// Rechtslogik. Echte Gesetze tragen «Verordnung» nicht im Titel.
const istVerordnung = (e: BrowseErlass) => /verordnung|reglement/i.test(e.titel);

// Eine aufklappbare Systematik-Kategorie (modulweit, kontrolliert über offen/onToggle).
function Kategorie({ id, offen, onToggle, kopf, anzahl, children }: {
  id?: string; offen: boolean; onToggle: () => void; kopf: React.ReactNode; anzahl: number; children: React.ReactNode;
}) {
  return (
    <details id={id} open={offen}
      onToggle={(e) => { if ((e.currentTarget as HTMLDetailsElement).open !== offen) onToggle(); }}
      className="group lc-card overflow-hidden scroll-mt-24">
      <summary className="flex items-baseline gap-3 cursor-pointer select-none px-5 py-3.5 hover:bg-brass-100/30">
        {kopf}
        <span className="num text-body-s text-ink-400 ml-auto">{anzahl}</span>
      </summary>
      <div className="px-5 pb-5 pt-4 space-y-5 border-t border-line">{children}</div>
    </details>
  );
}

// Inhalt einer Untergruppe: Leitgesetze als Karten, untergeordnetes
// Ausführungsrecht (Verordnungen/Reglemente) dezent als eingerückte Liste.
function GruppenInhalt({ titel, items }: { titel: string; items: BrowseErlass[] }) {
  const gesetze = items.filter((e) => !istVerordnung(e));
  const verordnungen = items.filter(istVerordnung);
  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-3">
        <h3 className="lc-overline text-brass-700">{titel}</h3>
        <span aria-hidden className="flex-1 h-px bg-line" />
      </div>
      {gesetze.length > 0 && <Gitter erlasse={gesetze} />}
      {verordnungen.length > 0 && (
        <div className="pl-3 border-l-2 border-line/70 ml-0.5">
          <p className="lc-overline text-ink-400 mb-1">Verordnungen &amp; Ausführungsrecht</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
            {verordnungen.map((e) => <ErlassZeile key={e.key} e={e} />)}
          </div>
        </div>
      )}
    </div>
  );
}

// Bund-Erlasse nach der funktionalen Systematik (systematik.ts): aufklappbare
// Kategorien (geläufige offen), Untergruppen, Leitgesetze als Karten +
// Verordnungen dezent. «Alle auf-/zuklappen»; «Weitere Erlasse» fängt alles ein,
// was keiner Gruppe zugeordnet ist (nie ein Verlust).
function BundSystematik({ erlasse, hashOffen }: { erlasse: BrowseErlass[]; hashOffen?: string | null }) {
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
  const alleIds = [...kategorien.map((k) => k.id), ...(weitere.length ? ['weitere'] : [])];

  // Übersicht zuerst: alle Kategorien eingeklappt (6 Karten = die Systematik auf
  // einen Blick), erst Klick öffnet sie. Ein Sidebar-Deeplink (#sys-<id>) öffnet
  // seine Zielkategorie (hashOffen, vom Eltern via key= bei Hash-Wechsel frisch
  // gemountet) und springt sie an (ScrollZuHash in App.tsx).
  const [offen, setOffen] = useState<Set<string>>(() => new Set(hashOffen ? [hashOffen] : []));
  const alleOffen = offen.size >= alleIds.length;
  const toggle = (id: string) => setOffen((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  const toggleAlle = () => setOffen(alleOffen ? new Set() : new Set(alleIds));

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <button type="button" onClick={toggleAlle}
          className="text-body-s font-medium text-brass-700 hover:text-brass-600 transition-colors">
          {alleOffen ? 'Alle einklappen' : 'Alle aufklappen'}
        </button>
      </div>
      {kategorien.map((kat) => (
        <Kategorie key={kat.id} id={`sys-${kat.id}`} offen={offen.has(kat.id)} onToggle={() => toggle(kat.id)} anzahl={kat.anzahl}
          kopf={
            <span className="flex items-baseline gap-2.5">
              <span aria-hidden className="font-display text-h3 leading-none text-brass-700">{kat.nr}</span>
              <span className="font-sans font-semibold text-ink-900 text-h3 tracking-tight">{kat.titel}</span>
            </span>
          }>
          <p className="text-body-s text-ink-500 max-w-reading">{kat.lede}</p>
          {kat.gruppen.map((g) => <GruppenInhalt key={g.id} titel={g.titel} items={g.items} />)}
        </Kategorie>
      ))}
      {weitere.length > 0 && (
        <Kategorie anzahl={weitere.length} offen={offen.has('weitere')} onToggle={() => toggle('weitere')}
          kopf={<span className="font-sans font-medium text-ink-700 text-body-l">Weitere Erlasse</span>}>
          <Gitter erlasse={weitere} />
        </Kategorie>
      )}
    </div>
  );
}

// Kanton-Vollnamen für die Übersicht (reine Anzeige). Codes bleiben die SSoT;
// der Name macht das Auswahlraster scannbar.
const KANTON_NAMEN: Record<string, string> = {
  ZH: 'Zürich', BE: 'Bern', LU: 'Luzern', UR: 'Uri', SZ: 'Schwyz', OW: 'Obwalden',
  NW: 'Nidwalden', GL: 'Glarus', ZG: 'Zug', FR: 'Freiburg', SO: 'Solothurn',
  BS: 'Basel-Stadt', BL: 'Basel-Landschaft', SH: 'Schaffhausen', AR: 'Appenzell A.Rh.',
  AI: 'Appenzell I.Rh.', SG: 'St. Gallen', GR: 'Graubünden', AG: 'Aargau', TG: 'Thurgau',
  TI: 'Tessin', VD: 'Waadt', VS: 'Wallis', NE: 'Neuenburg', GE: 'Genf', JU: 'Jura',
};

// Ein gewählter Kanton, gegliedert nach Kosten-/Abgabe-Art (KANTON_RUBRIKEN) —
// das passt zum tatsächlichen Bestand (fast nur Gebühren-/Tarif-/Steuer-Erlasse)
// und zeigt auf einen Blick, wo der gesuchte Tarif liegt.
function KantonRubriken({ erlasse }: { erlasse: BrowseErlass[] }) {
  const proRubrik = KANTON_RUBRIKEN
    .map((r) => ({ r, items: erlasse.filter((e) => kantonRubrik(e.titel, e.kuerzel) === r.id) }))
    .filter((x) => x.items.length > 0);
  return (
    <div className="space-y-5">
      {proRubrik.map(({ r, items }) => (
        <section key={r.id} className="space-y-2.5">
          <div className="flex items-center gap-3">
            <h3 className="lc-overline text-brass-700">{r.titel} <span className="text-ink-400">· {items.length}</span></h3>
            <span aria-hidden className="flex-1 h-px bg-line" />
          </div>
          <Gitter erlasse={items} />
        </section>
      ))}
    </div>
  );
}

export function Gesetze() {
  const [erlasse, setErlasse] = useState<BrowseErlass[] | null>(null);
  const [fehler, setFehler] = useState(false);
  const [suche, setSuche] = useState('');

  // Ebene (Bund/Kantone) UND der gewählte Kanton liegen in der URL (?ebene= / ?kt=)
  // — so verlinkt die App-Shell-Seitenleiste direkt auf den Kantone-Tab bzw. einen
  // einzelnen Kanton (?kt=ZH); teilbar und mit Zurück-Taste, wie der Katalog.
  const [params, setParams] = useSearchParams();
  // #sys-<id> (Sidebar-Deeplink auf eine Bund-Kategorie) → öffnet sie in der
  // Systematik; key= an BundSystematik mountet bei Hash-Wechsel frisch.
  const { hash } = useLocation();
  const hashSys = hash.startsWith('#sys-') ? hash.slice(5) : null;
  const ebene: Ebene = params.get('ebene') === 'kanton' ? 'kanton' : 'bund';
  const kanton = ebene === 'kanton' ? params.get('kt') : null;
  const setzeEbene = (e: Ebene) => {
    const p = new URLSearchParams(params);
    if (e === 'kanton') p.set('ebene', 'kanton'); else p.delete('ebene');
    p.delete('kt');
    setParams(p, { replace: true });
  };
  const setzeKanton = (k: string | null) => {
    const p = new URLSearchParams(params);
    if (k) p.set('kt', k); else p.delete('kt');
    setParams(p, { replace: true });
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
              : <BundSystematik key={hashSys ?? 'base'} erlasse={gefiltert} hashOffen={hashSys} />
          )}

          {!suche.trim() && ebene === 'kanton' && (
            <div className="space-y-6">
              {/* Klickbare Schweiz-Karte: Kanton direkt auf der Landkarte wählen. */}
              <div className="lc-card p-4 sm:p-6">
                <SchweizKarte
                  aktiv={kanton}
                  onWaehle={setzeKanton}
                  nameFuer={(k) => KANTON_NAMEN[k] ?? k}
                  verfuegbar={(k) => kantone.includes(k as typeof kantone[number])}
                />
              </div>
              {kanton ? (
                /* Ein Kanton → Zurück-Leiste + nach Kosten-/Abgabe-Art gegliedert. */
                <>
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
                    <button type="button" onClick={() => setzeKanton(null)}
                      className="inline-flex items-center gap-1 text-body-s font-medium text-brass-700 hover:text-brass-600 transition-colors">
                      ← Alle Kantone
                    </button>
                    <span aria-hidden className="text-ink-300">·</span>
                    {/* Schnellwechsel zu Nachbarkantonen ohne Umweg über die Übersicht */}
                    <div className="flex flex-wrap gap-1">
                      {kantone.map((k) => (
                        <button type="button" key={k} onClick={() => setzeKanton(k)} aria-pressed={kanton === k}
                          className={`rounded px-1.5 py-0.5 text-xs font-medium num transition-colors ${
                            kanton === k ? 'bg-brass-100 text-brass-800' : 'text-ink-400 hover:bg-paper-sunken hover:text-brass-700'
                          }`}>
                          {k}
                        </button>
                      ))}
                    </div>
                  </div>
                  <section className="lc-card p-5 sm:p-6 space-y-5 scroll-mt-24">
                    <div className="flex items-center gap-3 border-b border-line pb-3">
                      <KantonWappen kanton={kanton} className="h-11 w-10" />
                      <span className="flex flex-col">
                        <span className="flex items-baseline gap-2">
                          <span className="font-sans font-semibold text-ink-900 text-h3 tracking-tight leading-tight">{KANTON_NAMEN[kanton] ?? 'Kanton'}</span>
                          <span aria-hidden className="num text-body-s text-ink-400">{kanton}</span>
                        </span>
                        <span className="lc-overline text-ink-400">Kantonale Erlasse</span>
                      </span>
                      <span className="num text-body-s text-ink-400 ml-auto self-end">{gefiltert.filter((e) => e.kanton === kanton).length}</span>
                    </div>
                    <KantonRubriken erlasse={gefiltert.filter((e) => e.kanton === kanton)} />
                  </section>
                </>
              ) : (
                /* «Alle» → kompaktes Auswahlraster (Code · Name · Erlass-Zähler) statt
                    aller Karten — ein Bildschirm Übersicht statt endlosem Scroll. */
                <>
                  <p className="text-body-s text-ink-500 max-w-reading">
                    Kanton wählen — die Erlasse werden dann nach Kosten- und Abgabe-Art (Gerichts-/Anwalts-/Notariats-/Grundbuchkosten, Handänderungssteuern) gegliedert.
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
                    {gruppiereNachKanton(gefiltert).map((g) => (
                      <button type="button" key={g.kanton} onClick={() => setzeKanton(g.kanton)}
                        className="lc-card group flex items-center gap-3 p-3.5 text-left transition-colors hover:border-brass-400">
                        <KantonWappen kanton={g.kanton} className="h-9 w-8 transition-transform group-hover:scale-105" />
                        <span className="flex flex-col min-w-0">
                          <span className="flex items-baseline gap-1.5">
                            <span className="text-body-s font-medium text-ink-800 truncate group-hover:text-brass-700 transition-colors">{KANTON_NAMEN[g.kanton] ?? g.kanton}</span>
                            <span aria-hidden className="num text-xs text-ink-400 shrink-0">{g.kanton}</span>
                          </span>
                          <span className="text-xs text-ink-400"><span className="num">{g.erlasse.length}</span> Erlasse</span>
                        </span>
                      </button>
                    ))}
                  </div>
                </>
              )}
              {gefiltert.length === 0 && <p className="text-body-s text-ink-500">Kein Erlass gefunden.</p>}
            </div>
          )}
        </>
      )}
    </div>
  );
}
