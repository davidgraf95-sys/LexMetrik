import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SeitenKopf } from '../components/layout/SeitenKopf';
import { EntscheidKarte } from '../components/rechtsprechung/EntscheidKarte';
import { EntscheidFilter } from '../components/rechtsprechung/EntscheidFilter';
import { SachgebietKacheln } from '../components/rechtsprechung/SachgebietKacheln';
import {
  ladeEntscheidManifest, gruppiereNachSachgebiet, filterEntscheide, nachDatum,
  type EntscheidFilterWerte,
} from '../lib/rechtsprechung/browse';
import type { BrowseEntscheid } from '../lib/rechtsprechung/register';
import type { Rechtsgebiet } from '../lib/normtext/register';

// Übersicht der Rubrik «Rechtsprechung» — Pendant zu /gesetze, aber kuratiert
// (Sachgebiet-Kacheln, Leitentscheide-first), nicht bloss eine flache Liste.
// Reine Darstellung (§3): Laden/Gruppieren/Filtern liegen in lib/rechtsprechung,
// hier nur die Anzeige + URL-gehaltener Sachgebiet-Filter (?rg=).

// Beschrifteter Abschnitt (Bundesgericht / Kantonale Gerichte) mit Karten-Raster.
function Sektion({ titel, liste }: { titel: string; liste: BrowseEntscheid[] }) {
  if (!liste.length) return null;
  return (
    <section className="space-y-3">
      <h2 className="lc-overline text-brass-700 flex items-center gap-3">
        {titel}<span className="num text-ink-400">{liste.length}</span>
        <span aria-hidden className="flex-1 h-px bg-line" />
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
        {liste.map((e) => <EntscheidKarte key={e.key} e={e} />)}
      </div>
    </section>
  );
}

export function Rechtsprechung() {
  const [alle, setAlle] = useState<BrowseEntscheid[] | null>(null);
  const [fehler, setFehler] = useState(false);
  const [params, setParams] = useSearchParams();
  // Restliche (nicht-URL-gehaltene) Filterwerte lokal — das Sachgebiet liegt in
  // der URL (?rg=), damit die Sidebar-/Kachel-Auswahl teilbar bleibt.
  const [rest, setRest] = useState<EntscheidFilterWerte>({});

  const sachgebiet = (params.get('rg') as Rechtsgebiet | null) ?? null;
  const setzeSachgebiet = (g: Rechtsgebiet | null) => {
    const p = new URLSearchParams(params);
    if (g) p.set('rg', g); else p.delete('rg');
    setParams(p, { replace: true });
  };

  useEffect(() => {
    let lebt = true;
    ladeEntscheidManifest().then((m) => {
      if (!lebt) return;
      if (!m) { setFehler(true); return; }
      setAlle(m.entscheide);
    });
    return () => { lebt = false; };
  }, []);

  // Sachgebiet (URL) + restliche Filter (lokal) zusammenführen.
  const werte: EntscheidFilterWerte = useMemo(() => ({ ...rest, sachgebiet }), [rest, sachgebiet]);

  // Kachel-Zähler IMMER über den vollen Bestand (unabhängig vom Sachgebiet-Filter,
  // sonst zeigt die nicht gewählte Kachel «0»); restliche Filter dürfen die Zähler
  // aber einschränken (Suche/Datum), darum ohne sachgebiet.
  const fuerKacheln = useMemo(
    () => (alle ? filterEntscheide(alle, { ...rest, sachgebiet: null }) : []),
    [alle, rest],
  );
  const gruppen = useMemo(() => gruppiereNachSachgebiet(fuerKacheln), [fuerKacheln]);

  const gefiltert = useMemo(
    () => (alle ? nachDatum(filterEntscheide(alle, werte)) : []),
    [alle, werte],
  );
  // Klare Trennung Bund ↔ Kantone (Auftrag David).
  const bundListe = useMemo(() => gefiltert.filter((e) => e.kanton === 'CH'), [gefiltert]);
  const kantonListe = useMemo(() => gefiltert.filter((e) => e.kanton !== 'CH'), [gefiltert]);
  const [ebene, setEbene] = useState<'alle' | 'bund' | 'kanton'>('alle');

  const onFilter = (w: EntscheidFilterWerte) => {
    // Sachgebiet aus dem Filter geht in die URL, der Rest bleibt lokal.
    const { sachgebiet: rg, ...r } = w;
    if (rg !== sachgebiet) setzeSachgebiet(rg ?? null);
    setRest(r);
  };

  return (
    <div className="space-y-8">
      <SeitenKopf
        overline="Rubrik VI · Rechtsprechung"
        titel="Rechtsprechung"
        intro="Ausgewählte Entscheide des Bundesgerichts und kantonaler Gerichte im Volltext, nach Sachgebiet erschlossen und mit den Gesetzen verzahnt. Daten: OpenCaseLaw. Massgeblich bleibt stets die amtliche Fassung."
      >
        <p className="text-body-s text-ink-400 max-w-reading">
          Keine Rechtsberatung; massgeblich ist die amtliche Fassung.
        </p>
      </SeitenKopf>

      {fehler && (
        <div className="lc-notice lc-notice-warn">
          Die Rechtsprechungs-Sammlung konnte nicht geladen werden. Bitte die Seite neu laden.
        </div>
      )}

      {!alle && !fehler && (
        <div className="py-12 text-center space-y-3">
          <div className="scale-rule max-w-[200px] mx-auto" aria-hidden />
          <p className="text-body-s text-ink-500">Die Sammlung wird abgerufen …</p>
        </div>
      )}

      {alle && alle.length === 0 && (
        <div className="lc-notice">
          Es sind noch keine Entscheide erfasst. Die Sammlung wird laufend erweitert.
        </div>
      )}

      {alle && alle.length > 0 && (
        <>
          <SachgebietKacheln gruppen={gruppen} aktiv={sachgebiet} onWaehle={setzeSachgebiet} />

          <EntscheidFilter werte={werte} onChange={onFilter} bestand={alle} />

          <div className="space-y-5">
            {/* Bund/Kanton-Segment — klare Trennung der Ebenen. */}
            <div className="flex flex-wrap items-center gap-2 text-body-s">
              {([
                ['alle', 'Alle', gefiltert.length],
                ['bund', 'Bundesgericht', bundListe.length],
                ['kanton', 'Kantone', kantonListe.length],
              ] as const).map(([id, label, n]) => (
                <button key={id} type="button" onClick={() => setEbene(id)}
                  aria-pressed={ebene === id}
                  className={`inline-flex items-center gap-1.5 min-h-[2rem] px-3 rounded-md border text-body-s font-medium transition-colors ${
                    ebene === id ? 'border-brass-400 text-brass-700 bg-brass-100/40' : 'border-line text-ink-600 hover:text-ink-900'
                  }`}>
                  {label} <span className="num text-ink-400">{n}</span>
                </button>
              ))}
              <span className="ml-auto text-ink-400">neueste zuerst</span>
            </div>

            {gefiltert.length === 0 ? (
              <p className="text-body-s text-ink-500">Kein Entscheid gefunden. Filter anpassen oder zurücksetzen.</p>
            ) : (
              <div className="space-y-8">
                {(ebene === 'alle' || ebene === 'bund') && <Sektion titel="Bundesgericht" liste={bundListe} />}
                {(ebene === 'alle' || ebene === 'kanton') && <Sektion titel="Kantonale Gerichte" liste={kantonListe} />}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
