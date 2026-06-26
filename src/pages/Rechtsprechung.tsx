import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SeitenKopf } from '../components/layout/SeitenKopf';
import { EntscheidKarte } from '../components/rechtsprechung/EntscheidKarte';
import { EntscheidZeile } from '../components/rechtsprechung/EntscheidZeile';
import { EntscheidFilter } from '../components/rechtsprechung/EntscheidFilter';
import { SachgebietKacheln } from '../components/rechtsprechung/SachgebietKacheln';
import { LiveSuche } from '../components/rechtsprechung/LiveSuche';
import {
  ladeEntscheidManifest, filterEntscheide, sortiere, gruppiereNachLeit,
  zaehleSachgebiete, normLabel,
  type EntscheidFilterWerte, type SortModus,
} from '../lib/rechtsprechung/browse';
import type { BrowseEntscheid } from '../lib/rechtsprechung/register';
import type { Rechtsgebiet } from '../lib/normtext/register';

// Übersicht der Rubrik «Rechtsprechung» — kuratierter Einstieg (Sachgebiets-Rail,
// Leitentscheide-first, Norm-Verzahnung), bessere Übersicht als eine flache
// Trefferliste. Reine Darstellung (§3): Laden/Sortieren/Filtern/Gruppieren liegen
// in lib/rechtsprechung/browse.ts; hier nur Anzeige + URL-Zustand (?rg= Sachgebiet,
// ?norm= angewandte Norm). Sortierung/Dichte lokal (Dichte in localStorage).

type Dichte = 'liste' | 'karten';
const DICHTE_KEY = 'rsp:dichte';

function leseDichte(): Dichte {
  if (typeof localStorage === 'undefined') return 'liste';
  return localStorage.getItem(DICHTE_KEY) === 'karten' ? 'karten' : 'liste';
}

// Eine Treffer-Liste je Dichte rendern (geteilte Datenquelle, nur Darstellung).
function Liste({ liste, dichte, onNorm }: { liste: BrowseEntscheid[]; dichte: Dichte; onNorm: (k: string) => void }) {
  if (dichte === 'karten') {
    return (
      <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
        {liste.map((e) => <EntscheidKarte key={e.key} e={e} onNorm={onNorm} />)}
      </div>
    );
  }
  return (
    <div className="lc-panel divide-y divide-line overflow-hidden">
      {liste.map((e) => <EntscheidZeile key={e.key} e={e} onNorm={onNorm} />)}
    </div>
  );
}

function Sektion({ titel, liste, dichte, onNorm }: {
  titel: string; liste: BrowseEntscheid[]; dichte: Dichte; onNorm: (k: string) => void;
}) {
  if (!liste.length) return null;
  return (
    <section className="space-y-3">
      <h2 className="lc-overline text-brass-700 flex items-center gap-3">
        {titel}<span className="num text-ink-500">{liste.length}</span>
        <span aria-hidden className="h-px flex-1 bg-line" />
      </h2>
      <Liste liste={liste} dichte={dichte} onNorm={onNorm} />
    </section>
  );
}

export function Rechtsprechung() {
  const [alle, setAlle] = useState<BrowseEntscheid[] | null>(null);
  const [fehler, setFehler] = useState(false);
  const [params, setParams] = useSearchParams();
  // Nicht-URL-gehaltene Filterwerte lokal; Sachgebiet (?rg) und Norm (?norm) in der URL (teilbar).
  const [rest, setRest] = useState<EntscheidFilterWerte>({});
  const [sort, setSort] = useState<SortModus>('relevanz');
  const [dichte, setDichte] = useState<Dichte>(leseDichte);

  const sachgebiet = (params.get('rg') as Rechtsgebiet | null) ?? null;
  const norm = params.get('norm');

  const setzeUrl = (schluessel: 'rg' | 'norm', wert: string | null) => {
    const p = new URLSearchParams(params);
    if (wert) p.set(schluessel, wert); else p.delete(schluessel);
    setParams(p, { replace: true });
  };
  const setzeDichte = (d: Dichte) => {
    setDichte(d);
    if (typeof localStorage !== 'undefined') localStorage.setItem(DICHTE_KEY, d);
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

  // URL-Achsen (Sachgebiet/Norm) + restliche Filter zusammenführen.
  const werte: EntscheidFilterWerte = useMemo(
    () => ({ ...rest, sachgebiet, norm }), [rest, sachgebiet, norm]);

  // Rail-Zähler über den vollen Bestand minus Sachgebiet (sonst zeigt die nicht
  // gewählte Kachel «0»); restliche Filter (Suche/Norm/…) dürfen die Zähler aber
  // einschränken, darum ohne sachgebiet.
  const fuerRail = useMemo(
    () => (alle ? filterEntscheide(alle, { ...rest, norm, sachgebiet: null }) : []),
    [alle, rest, norm],
  );
  const railZaehler = useMemo(() => zaehleSachgebiete(fuerRail), [fuerRail]);
  // «Alle Sachgebiete» = Summe der Kacheln: Verweis-Einträge (vollständige Urteile zu
  // einem BGE) ausschliessen, symmetrisch zu zaehleSachgebiete/echtAnzahl — sonst zeigt
  // der Aggregat-Zähler einen Wert ≠ Summe seiner Teile (Doppelzählung der BGE).
  const railGesamt = useMemo(() => fuerRail.filter((e) => !e.verweis).length, [fuerRail]);

  const gefiltert = useMemo(
    () => (alle ? sortiere(filterEntscheide(alle, werte), sort) : []),
    [alle, werte, sort],
  );
  const leitAnzahl = useMemo(() => gefiltert.filter((e) => !e.verweis && e.leitcharakter === 'leitentscheid').length, [gefiltert]);
  // Verweis-Einträge (vollständige Urteile) zählen nicht als eigenständige Entscheide.
  const echtAnzahl = useMemo(() => gefiltert.filter((e) => !e.verweis).length, [gefiltert]);
  const volltextAnzahl = useMemo(() => gefiltert.filter((e) => !!e.verweis).length, [gefiltert]);

  // Zwei Sektionen (Leitentscheide / Weitere) nur im Default-Sort ohne aktive
  // Suche/Norm — sonst EIN sortierter Strom (Leit oben via Sortierung).
  const alsSektionen = sort === 'relevanz' && !werte.q?.trim() && !norm;
  const gruppen = useMemo(() => gruppiereNachLeit(gefiltert), [gefiltert]);

  const onFilter = (w: EntscheidFilterWerte) => {
    // Sachgebiet & Norm gehören in die URL, der Rest bleibt lokal.
    const { sachgebiet: rg, norm: n, ...r } = w;
    if ((rg ?? null) !== sachgebiet) setzeUrl('rg', rg ?? null);
    if ((n ?? null) !== norm) setzeUrl('norm', n ?? null);
    setRest(r);
  };
  const waehleSachgebiet = (g: Rechtsgebiet | null) => setzeUrl('rg', g);
  const waehleNorm = (k: string) => setzeUrl('norm', k);

  return (
    <div className="space-y-6">
      <SeitenKopf
        overline="Bundesgericht & Kantone"
        titel="Rechtsprechung"
        intro="Kuratierte Auswahl von Entscheiden des Bundesgerichts und kantonaler Gerichte — Leitentscheide und Sachfrage zuerst, verzahnt mit der angewandten Norm. Daten: OpenCaseLaw. Massgeblich bleibt stets die amtliche Fassung."
      />

      {fehler && (
        <div className="lc-notice lc-notice-warn">
          Die Rechtsprechungs-Sammlung konnte nicht geladen werden. Bitte die Seite neu laden.
        </div>
      )}

      {!alle && !fehler && (
        <div className="space-y-3 py-12 text-center">
          <div className="scale-rule mx-auto max-w-[200px]" aria-hidden />
          <p className="text-body-s text-ink-500">Die Sammlung wird abgerufen …</p>
        </div>
      )}

      {alle && alle.length === 0 && (
        <div className="lc-notice">
          Es sind noch keine Entscheide erfasst. Die Sammlung wird laufend erweitert.
        </div>
      )}

      {alle && alle.length > 0 && (
        <div className="lg:grid lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-6">
          {/* Links: Sachgebiets-Rail (Mobil oben als Chip-Band). */}
          <div className="mb-4 lg:mb-0">
            <SachgebietKacheln
              zaehler={railZaehler}
              gesamt={railGesamt}
              aktiv={sachgebiet}
              onWaehle={waehleSachgebiet}
            />
          </div>

          {/* Rechts: Ergebnis-Spalte. */}
          <div className="min-w-0 space-y-4">
            {/* Discovery über den ganzen CH-Korpus (extern, opt-in) — prominent am
                Kopf der Ergebnis-Spalte (Auftrag David), über der kuratierten Auswahl. */}
            <LiveSuche initialQ={werte.q ?? ''} />

            <EntscheidFilter
              werte={werte}
              onChange={onFilter}
              bestand={alle}
              sort={sort}
              onSort={setSort}
              dichte={dichte}
              onDichte={setzeDichte}
            />

            {/* Norm-Kontextstreifen — der explizite Pfad «Rechtsprechung zu Art. X». */}
            {norm && (
              <div className="lc-notice flex items-center justify-between gap-3">
                <span className="text-body-s">
                  Rechtsprechung zu <span className="font-medium text-ink-900">{normLabel(norm)}</span>
                  {' '}— <span className="num">{gefiltert.length}</span> {gefiltert.length === 1 ? 'Entscheid' : 'Entscheide'}
                </span>
                <button type="button" onClick={() => setzeUrl('norm', null)}
                  className="shrink-0 text-xs font-medium text-brass-700 hover:text-brass-600">
                  aufheben
                </button>
              </div>
            )}

            {/* Treffer-Zähler + Ebene-Segment (klare Trennung Bund ↔ Kantone, Auftrag David). */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-ink-500">
              <span><span className="num text-ink-700">{echtAnzahl}</span> {echtAnzahl === 1 ? 'Entscheid' : 'Entscheide'}</span>
              {leitAnzahl > 0 && <span>· <span className="num">{leitAnzahl}</span> Leitentscheide</span>}
              {volltextAnzahl > 0 && <span>· <span className="num">{volltextAnzahl}</span> Volltext-Verweise</span>}
              <div className="ml-auto flex flex-wrap items-center gap-1.5">
                {([['', 'Alle'], ['bund', 'Bundesgericht'], ['kanton', 'Kantone']] as const).map(([id, label]) => {
                  const aktivE = (rest.ebene ?? '') === id;
                  return (
                    <button key={id || 'alle'} type="button" aria-pressed={aktivE}
                      onClick={() => setRest({ ...rest, ebene: (id || null) as 'bund' | 'kanton' | null })}
                      className={`lc-chip ${aktivE ? 'border-brass-400 text-brass-700' : ''}`}>
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            {gefiltert.length === 0 ? (
              <div className="lc-notice">Kein Entscheid gefunden. Filter anpassen oder zurücksetzen.</div>
            ) : alsSektionen ? (
              <div className="space-y-8">
                <Sektion titel="Amtliche Leitentscheide (BGE)" liste={gruppen.leitentscheide} dichte={dichte} onNorm={waehleNorm} />
                {gruppen.volltexte.length > 0 && (
                  <Sektion titel="Vollständige Urteile zu den Leitentscheiden" liste={gruppen.volltexte} dichte={dichte} onNorm={waehleNorm} />
                )}
                <Sektion titel="Weitere Entscheide (nicht amtlich publiziert)" liste={gruppen.weitere} dichte={dichte} onNorm={waehleNorm} />
              </div>
            ) : (
              <Liste liste={gefiltert} dichte={dichte} onNorm={waehleNorm} />
            )}

            <p className="border-t border-line/60 pt-3 text-micro text-ink-500">
              Keine Rechtsberatung. «ungeprüft» = maschinell erfasst, fachlich noch nicht abgenommen; massgeblich ist stets die amtliche Fassung (Link je Entscheid).
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
