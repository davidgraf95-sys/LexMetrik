import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import { SeitenKopf } from '../components/layout/SeitenKopf';
import { InternationalRubriken } from '../components/normtext/InternationalRubriken';
import { RechtsgebietSicht, RechtsgebietEinstieg } from '../components/normtext/RechtsgebietSicht';
import {
  GliederungUmschalter, RelevanzGitter, KantonRelevanzListe,
  KantonGebietGruppen, IntlRechtsgebietSicht,
} from '../components/normtext/GesetzeGliederung';
import { loeseGliederung, speichereGliederung, type Gliederung } from '../lib/normtext/gliederung';
import {
  ladeBrowseManifest, ladeKantonSystematik, gruppiereNachKanton, filtern,
} from '../lib/normtext/browse';
import { type BrowseErlass } from '../lib/normtext/browse-typen';
import { type KantonSystematik as KantonSystematikBaum } from '../lib/normtext/systematik';
// Kanton-Vollnamen: EINE Quelle (§5) — dieselbe Tabelle wie die Tarif-Domäne.
// Codes bleiben die SSoT; der Name macht Raster/Sidebar scannbar. Auf string
// verbreitert, da die Übersicht mit rohen Kanton-Codes (string) indexiert.
import { KANTON_NAMEN as KANTON_NAMEN_TYP } from '../data/tarif/typen';
const KANTON_NAMEN: Record<string, string> = KANTON_NAMEN_TYP;
import { KantonWappen } from '../components/KantonWappen';
import { usePaneKlasse } from '../components/layout/PaneKontext';
// H-10 (§6.6 billig, B27): BundSystematik/KantonSystematik/KantonAuswahl
// (+Kachel) als reiner Move nach gesetze-teile/ — Props/Verhalten unverändert.
import { Gitter } from './gesetze-teile/geteilt';
import { BundSystematik } from './gesetze-teile/BundSystematik';
import { KantonSystematik } from './gesetze-teile/KantonSystematik';
import { KantonAuswahl } from './gesetze-teile/KantonAuswahl';

type Ebene = 'bund' | 'kanton' | 'international';

function Segment({ aktiv, onWahl }: { aktiv: Ebene; onWahl: (e: Ebene) => void }) {
  const opt: { id: Ebene; label: string }[] = [
    { id: 'bund', label: 'Bund' },
    { id: 'kanton', label: 'Kantone' },
    { id: 'international', label: 'International' },
  ];
  // APG-Tabs-Muster (analog src/components/ui/Tabs.tsx, §10): roving tabindex
  // (genau ein tabbarer Tab) + Pfeiltasten/Home/End — sonst trägt role=tab das
  // ARIA-Versprechen ohne das erwartete Tastaturverhalten.
  const aufTaste = (e: React.KeyboardEvent<HTMLButtonElement>, i: number) => {
    let ziel: number;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') ziel = (i + 1) % opt.length;
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') ziel = (i - 1 + opt.length) % opt.length;
    else if (e.key === 'Home') ziel = 0;
    else if (e.key === 'End') ziel = opt.length - 1;
    else return;
    e.preventDefault();
    onWahl(opt[ziel].id);
    (e.currentTarget.parentElement?.children[ziel] as HTMLElement | undefined)?.focus();
  };
  return (
    <div role="tablist" aria-label="Ebene" className="inline-flex rounded-md border border-line bg-paper-sunken/50 p-0.5">
      {opt.map((o, i) => (
        <button
          key={o.id}
          type="button"
          role="tab"
          id={`ebene-tab-${o.id}`}
          aria-controls={`ebene-panel-${o.id}`}
          aria-selected={aktiv === o.id}
          tabIndex={aktiv === o.id ? 0 : -1}
          onKeyDown={(e) => aufTaste(e, i)}
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

// Neutraler Landeplatz /gesetze (G4 · §4.1): prominenter Sprung-/Such-Einstieg
// (fokussiert die normale HeaderSuche, in der der Norm-Sprung sitzt — A5, David
// 5.7.2026, keine eigene Palette mehr) + drei gleichwertige Einstiegskacheln mit
// Kurz-Statistik. Löst die frühere Dreifach-Redundanz (Overline + Tab-Leiste +
// Sidebar) auf: EINE Steuerung, kein stiller Bund-Default. Reine Darstellung (§3).
function Einstieg({ bund, bundArtikel, kantone, kantonErlasse, international, onWahl, onBefehl }: {
  bund: number; bundArtikel: number; kantone: number; kantonErlasse: number; international: number;
  onWahl: (e: Ebene) => void; onBefehl: () => void;
}) {
  const pk = usePaneKlasse();
  const kacheln: { id: Ebene; titel: string; zahl: number; einheit: string; sub: string }[] = [
    { id: 'bund', titel: 'Bundesrecht', zahl: bund, einheit: 'Erlasse', sub: `Gesetze & Verordnungen · ${bundArtikel.toLocaleString('de-CH')} Artikel im Volltext` },
    { id: 'kanton', titel: 'Kantone', zahl: kantone, einheit: 'Kantone', sub: `${kantonErlasse.toLocaleString('de-CH')} kantonale Erlasse` },
    { id: 'international', titel: 'International', zahl: international, einheit: 'Erlasse', sub: 'Staatsverträge & EU-Recht' },
  ];
  return (
    <div className="space-y-6">
      {/* Prominenter Artikel-Sprung / Suche (§4.2 · A5): fokussiert die HeaderSuche. */}
      <button
        type="button"
        onClick={onBefehl}
        className="group flex w-full items-center gap-3 rounded-lg border border-line bg-paper-sunken/40 px-4 py-3.5 text-left transition-colors hover:border-brass-400 hover:bg-brass-100/30"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden className="shrink-0 text-ink-500 group-hover:text-brass-700">
          <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.7" />
          <path d="M20 20l-3.6-3.6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        </svg>
        <span className="min-w-0 flex-1">
          <span className="block text-body-l text-ink-700">Direkt zum Artikel springen — z. B. «OR 257d», «Art. 5 AIG»</span>
          <span className="block text-body-s text-ink-500">oder Stichwort suchen über Gesetze, Rechtsprechung und Werkzeuge</span>
        </span>
        <kbd className="hidden sm:inline num shrink-0 rounded border border-line bg-paper px-1.5 py-0.5 text-micro font-medium text-ink-500">⌘K</kbd>
      </button>

      <div className={pk('grid grid-cols-1 sm:grid-cols-3 gap-3', 'grid grid-cols-1 @2xl/pane:grid-cols-3 gap-3')}>
        {kacheln.map((k) => (
          <button
            type="button"
            key={k.id}
            onClick={() => onWahl(k.id)}
            className="lc-card group flex flex-col gap-1.5 p-5 text-left transition-colors hover:border-brass-400"
          >
            <span className="flex items-baseline gap-2">
              <span className="num font-display text-h1 leading-none text-brass-700">{k.zahl}</span>
              <span className="lc-overline">{k.einheit}</span>
            </span>
            <span className="font-sans font-semibold text-ink-900 text-h3 tracking-tight group-hover:text-brass-700 transition-colors">{k.titel}</span>
            <span className="text-body-s text-ink-500">{k.sub}</span>
            <span aria-hidden className="mt-1 text-body-s font-medium text-brass-700">Öffnen →</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export function Gesetze() {
  const [erlasse, setErlasse] = useState<BrowseErlass[] | null>(null);
  const [systematik, setSystematik] = useState<Record<string, KantonSystematikBaum>>({});
  const [fehler, setFehler] = useState(false);
  // ?q= (z.B. aus der Startseiten-Rubrik «Gesetze», #6) füllt die Suche vor —
  // SSR-sicher als Lazy-Init (Prerender hat keine Query → leer).
  const [suche, setSuche] = useState(() =>
    typeof window === 'undefined' ? '' : new URLSearchParams(window.location.search).get('q') ?? '');
  // N6: ist ein einzelner Kanton gewählt, sucht die Trefferliste standardmässig
  // NUR in diesem Kanton (auf der BS-Seite erwartet man BS-Treffer, nicht Bund +
  // alle 25 anderen Kantone). Ein sichtbarer Umschalter weitet auf «Alle» aus.
  const [nurKanton, setNurKanton] = useState(true);

  // Ebene (Bund/Kantone) UND der gewählte Kanton liegen in der URL (?ebene= / ?kt=)
  // — so verlinkt die App-Shell-Seitenleiste direkt auf den Kantone-Tab bzw. einen
  // einzelnen Kanton (?kt=ZH); teilbar und mit Zurück-Taste, wie der Katalog.
  const [params, setParams] = useSearchParams();
  // #sys-<id> (Sidebar-Deeplink auf eine Bund-Kategorie) → öffnet sie in der
  // Systematik; key= an BundSystematik mountet bei Hash-Wechsel frisch.
  const { hash } = useLocation();
  const hashSys = hash.startsWith('#sys-') ? hash.slice(5) : null;
  // Einstiegs-Auflösung (G4 · §4.1): OHNE explizites ?ebene= landet man NICHT
  // still auf «Bund», sondern auf dem neutralen Landeplatz (drei Einstiegskacheln).
  // Eine Säule ist erst gewählt, wenn ?ebene= gesetzt ist (Deep-Links bleiben
  // erreichbar). `ebene` (Fallback 'bund') trägt nur die abgeleiteten Listen.
  const ebeneParam = params.get('ebene');
  const gewaehlt: Ebene | null = ebeneParam === 'kanton' ? 'kanton'
    : ebeneParam === 'international' ? 'international'
    : ebeneParam === 'bund' ? 'bund' : null;
  const ebene: Ebene = gewaehlt ?? 'bund';
  const kanton = gewaehlt === 'kanton' ? params.get('kt') : null;
  // Rechtsgebiets-Sicht (G6 · §4.4): zweite, achsen-orthogonale Gliederung. Eigener
  // Zustand `?ansicht=rechtsgebiet` (nicht Teil der Ebene) — vom Landeplatz
  // erreichbar, mit «← Übersicht» wieder verlassen.
  const themenSicht = params.get('ansicht') === 'rechtsgebiet';
  // Gliederung (A15): EINE Wahl für alle drei Säulen (Relevanz/Systematisch/
  // Rechtsgebiet). URL `?gliederung=` gewinnt (teilbarer Deep-Link), sonst die
  // persistente Wahl (localStorage), sonst Default 'systematisch' — das hält die
  // prerenderte Sicht + bestehende e2e-/Golden-Kontrakte byte-gleich. Die
  // Store-Lesung ist synchron (Pre-Paint-Muster, §15/G2a): kein Flash, weil der
  // Inhalt ohnehin erst nach dem async Manifest paintet.
  const gliederung = loeseGliederung(params.get('gliederung'));
  const setzeGliederung = (g: Gliederung) => {
    const p = new URLSearchParams(params);
    p.set('gliederung', g);
    setParams(p, { replace: true });
    speichereGliederung(g);
  };
  const setzeEbene = (e: Ebene) => {
    const p = new URLSearchParams(params);
    p.set('ebene', e);
    p.delete('kt');
    p.delete('ansicht');
    setParams(p, { replace: true });
  };
  const setzeThemen = () => {
    const p = new URLSearchParams(params);
    p.set('ansicht', 'rechtsgebiet');
    p.delete('ebene');
    p.delete('kt');
    setParams(p, { replace: true });
  };
  const zurUebersicht = () => {
    const p = new URLSearchParams(params);
    p.delete('ebene');
    p.delete('kt');
    p.delete('ansicht');
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
      // ALLE Erlasse halten — die International-Erlasse (SR 0.* + EU-Recht,
      // rechtsgebiet 'international') gehören jetzt in den eigenen International-Tab
      // der Übersicht (Auftrag David 25.6.2026: International gleichwertig hier
      // abdecken). Die Bund-Ansicht blendet sie weiter aus (istIntl-Filter unten).
      setErlasse(m.erlasse);
    });
    // Systematik-Bäume parallel; fehlen sie, greift der neutrale Fallback (§8).
    ladeKantonSystematik().then((s) => { if (lebt) setSystematik(s); });
    return () => { lebt = false; };
  }, []);

  const istIntl = (e: BrowseErlass) => e.rechtsgebiet === 'international';
  // Bund-Ansicht: nur echte Bundeserlasse (International sind ebene 'bund', aber
  // rechtsgebiet 'international' → hier ausgeschlossen, sie haben den eigenen Tab).
  const gefiltert = useMemo(
    () => (erlasse ? filtern(erlasse.filter((e) => e.ebene === 'bund' && !istIntl(e)), suche) : []),
    [erlasse, suche],
  );
  const international = useMemo(
    () => (erlasse ? erlasse.filter(istIntl) : []),
    [erlasse],
  );
  const kantone = useMemo(
    () => (erlasse ? [...new Set(erlasse.filter((e) => e.ebene === 'kanton').map((e) => e.kanton!))].sort() : []),
    [erlasse],
  );
  // Kanton-Ansicht: nur kantonale Erlasse (sonst zeigte der Kanton-Zweig das
  // Bund-only `gefiltert` → leeres Raster, keine Kantone). Suche mitgeführt.
  const kantGefiltert = useMemo(
    () => (erlasse ? filtern(erlasse.filter((e) => e.ebene === 'kanton'), suche) : []),
    [erlasse, suche],
  );

  return (
    <div className="space-y-8">
      <SeitenKopf
        overline="Rechtssammlung Schweiz"
        titel="Schweizer Gesetzessammlung"
        intro="Volltext der in LexMetrik verwendeten Bundesgesetze und kantonalen Erlasse — geltende Fassung, mit Stand und amtlichem Live-Link — sowie die für die Schweiz massgeblichen Staatsverträge und EU-Verordnungen (International). Massgeblich bleibt stets die amtliche Quelle."
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
            {/* Steuerung nur NACH Säulen-Wahl (G4 · §4.1): auf dem Landeplatz
                tragen die drei Kacheln die Steuerung, kein Tab-/Overline-Dopplung. */}
            {!suche.trim() && (gewaehlt !== null || themenSicht) ? (
              <div className="flex flex-wrap items-center gap-3">
                <button type="button" onClick={zurUebersicht}
                  className="text-body-s font-medium text-brass-700 hover:text-brass-600 transition-colors">
                  ← Übersicht
                </button>
                {gewaehlt !== null && <Segment aktiv={ebene} onWahl={setzeEbene} />}
              </div>
            ) : <span />}
            <input
              type="search"
              value={suche}
              onChange={(e) => setSuche(e.target.value)}
              placeholder="Suchen — Kürzel, Titel, SR-Nr. …"
              aria-label="Gesetze durchsuchen — Bund, Kantone & International (Kürzel, Titel, SR-Nr.)"
              className="lc-input h-11 py-0 text-body-s w-full max-w-sm"
            />
          </div>

          {/* Landeplatz (G4 · §4.1): drei gleichwertige Einstiegskacheln mit
              Kurz-Statistik statt stillem Bund-Default. Prominenter Sprung-/
              Such-Hinweis (Cmd/Ctrl-K, §4.2) darüber. */}
          {!suche.trim() && gewaehlt === null && !themenSicht && (
            <div className="space-y-4">
              <Einstieg
                bund={gefiltert.length}
                bundArtikel={gefiltert.reduce((a, e) => a + e.artikelAnzahl, 0)}
                kantone={kantone.length}
                kantonErlasse={erlasse.filter((e) => e.ebene === 'kanton').length}
                international={international.length}
                onWahl={setzeEbene}
                onBefehl={() => { if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('lm:suche-fokus')); }}
              />
              {/* G6 · §4.4 — vierte Tür: die zweite Gliederung nach Rechtsgebiet/Thema. */}
              <RechtsgebietEinstieg onWahl={setzeThemen} />
            </div>
          )}

          {/* Rechtsgebiets-Sicht (G6 · §4.4): zweite Gliederung, Querschnitts-Themen
              + Auto-Grundgerüst. Reine Darstellung (§3); tolerant (unzugeordnet ok). */}
          {!suche.trim() && themenSicht && (
            <RechtsgebietSicht erlasse={erlasse} />
          )}

          {/* Suche: global über Bund UND Kantone — oder (N6) auf den gewählten
              Kanton eingegrenzt, wenn ein Kanton aktiv ist und «Nur …» gewählt ist. */}
          {suche.trim() && (() => {
            const aufKanton = !!kanton && nurKanton;
            const basis = aufKanton ? erlasse.filter((e) => e.kanton === kanton) : erlasse;
            const treffer = filtern(basis, suche);
            const bund = treffer.filter((e) => e.ebene === 'bund' && !istIntl(e));
            const kant = treffer.filter((e) => e.ebene === 'kanton');
            const intl = treffer.filter(istIntl);
            return (
              <div className="space-y-8">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1.5">
                  <p className="text-body-s text-ink-500"><span className="num">{treffer.length}</span> Treffer für «{suche.trim()}»</p>
                  {kanton && (
                    <div role="group" aria-label="Suchbereich" className="inline-flex rounded-md border border-line bg-paper-sunken/50 p-0.5 text-xs">
                      <button type="button" onClick={() => setNurKanton(true)} aria-pressed={nurKanton}
                        className={`rounded px-2 py-0.5 font-medium transition-colors ${nurKanton ? 'bg-paper text-ink-900 shadow-sm' : 'text-ink-500 hover:text-ink-800'}`}>
                        Nur {KANTON_NAMEN[kanton] ?? kanton}
                      </button>
                      <button type="button" onClick={() => setNurKanton(false)} aria-pressed={!nurKanton}
                        className={`rounded px-2 py-0.5 font-medium transition-colors ${!nurKanton ? 'bg-paper text-ink-900 shadow-sm' : 'text-ink-500 hover:text-ink-800'}`}>
                        Alle
                      </button>
                    </div>
                  )}
                </div>
                {bund.length > 0 && (
                  <section className="space-y-3">
                    <h2 className="lc-overline">Bund <span className="text-ink-500">· {bund.length}</span></h2>
                    <Gitter erlasse={bund} />
                  </section>
                )}
                {gruppiereNachKanton(kant).map((g) => (
                  <section key={g.kanton} className="space-y-3">
                    <h2 className="lc-overline">Kanton {g.kanton} <span className="text-ink-500">· {g.erlasse.length}</span></h2>
                    <Gitter erlasse={g.erlasse} />
                  </section>
                ))}
                {intl.length > 0 && (
                  <section className="space-y-3">
                    <h2 className="lc-overline">International <span className="text-ink-500">· {intl.length}</span></h2>
                    <Gitter erlasse={intl} />
                  </section>
                )}
                {treffer.length === 0 && <p className="text-body-s text-ink-500">Kein Erlass gefunden.</p>}
              </div>
            );
          })()}

          {/* Ein Tab-Panel pro Ebene (nur das aktive rendert); id/aria-labelledby
              folgen der aktiven Ebene und verbinden es mit dem gewählten Tab.
              Erst NACH Säulen-Wahl (gewaehlt !== null) — davor trägt der Landeplatz. */}
          {!suche.trim() && gewaehlt !== null && !themenSicht && (
          <div role="tabpanel" id={`ebene-panel-${ebene}`} aria-labelledby={`ebene-tab-${ebene}`}>
          {ebene === 'bund' && (
            gefiltert.length === 0
              ? <p className="text-body-s text-ink-500">Kein Erlass gefunden.</p>
              : (
                <div className="space-y-4">
                  {/* A15 — Gliederungs-Umschalter (dieselbe Bedienung auf allen Säulen). */}
                  <div className="flex justify-end">
                    <GliederungUmschalter wert={gliederung} onWahl={setzeGliederung} />
                  </div>
                  {gliederung === 'relevanz'
                    ? <RelevanzGitter erlasse={gefiltert} />
                    : gliederung === 'rechtsgebiet'
                      ? <RechtsgebietSicht erlasse={gefiltert} />
                      : <BundSystematik key={hashSys ?? 'base'} erlasse={gefiltert} hashOffen={hashSys} />}
                </div>
              )
          )}

          {/* International-Tab (Auftrag David 25.6.2026): gleichwertige Säule neben
              Bund/Kantone — Staatsverträge SR 0.* + EU-Verordnungen, geteilte
              Rubriken-Darstellung (§5, identisch zu /international). */}
          {!suche.trim() && ebene === 'international' && (
            <div className="space-y-4">
              <p className="text-body-s text-ink-500 max-w-reading">
                Für die Schweiz massgebliche Staatsverträge und internationales Recht — je mit Live-Link zur amtlichen Fassung (Fedlex SR 0.* bzw. EUR-Lex). Einzelne Erlasse (z. B. EMRK) werden als amtliches PDF in-app angezeigt; massgeblich bleibt stets die amtliche Quelle.
              </p>
              {/* A15 — Gliederungs-Umschalter (dieselbe Bedienung auf allen Säulen). */}
              <div className="flex justify-end">
                <GliederungUmschalter wert={gliederung} onWahl={setzeGliederung} />
              </div>
              {gliederung === 'relevanz'
                ? <RelevanzGitter erlasse={international} />
                : gliederung === 'rechtsgebiet'
                  ? <IntlRechtsgebietSicht erlasse={international} />
                  : <InternationalRubriken erlasse={international} />}
            </div>
          )}

          {!suche.trim() && ebene === 'kanton' && (
            <div className="space-y-6">
              {kanton ? (
                /* Ein Kanton → Zurück-Leiste (mit Wappen-Chip) + nach Kosten-/Abgabe-Art gegliedert. */
                <>
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
                    <button type="button" onClick={() => setzeKanton(null)}
                      className="inline-flex items-center gap-1.5 text-body-s font-medium text-brass-700 hover:text-brass-600 transition-colors">
                      <KantonWappen kanton={kanton} className="h-5 w-4" />
                      ← Alle Kantone
                    </button>
                    <span aria-hidden className="text-ink-300">·</span>
                    {/* Schnellwechsel zu Nachbarkantonen ohne Umweg über die Übersicht */}
                    <div className="flex flex-wrap gap-1">
                      {kantone.map((k) => (
                        <button type="button" key={k} onClick={() => setzeKanton(k)} aria-pressed={kanton === k}
                          aria-label={KANTON_NAMEN[k] ?? k}
                          className={`rounded px-1.5 py-0.5 text-xs font-medium num transition-colors ${
                            kanton === k ? 'bg-brass-100 text-brass-800' : 'text-ink-500 hover:bg-paper-sunken hover:text-brass-700'
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
                          <span aria-hidden className="num text-body-s text-ink-500">{kanton}</span>
                        </span>
                        <span className="lc-overline">Kantonale Erlasse</span>
                      </span>
                      <span className="num text-body-s text-ink-500 ml-auto self-end">{kantGefiltert.filter((e) => e.kanton === kanton).length}</span>
                    </div>
                    {/* A14/A15 — Gliederungs-Umschalter für die Erlasse dieses Kantons
                        (die G5-Umschalter Alphabet/Erlass-Zahl/Region auf dem 26er-
                        Raster bleiben davon unberührt — sie ordnen die KANTONE). */}
                    <div className="flex justify-end">
                      <GliederungUmschalter wert={gliederung} onWahl={setzeGliederung} />
                    </div>
                    {(() => {
                      const eig = kantGefiltert.filter((e) => e.kanton === kanton);
                      const sys = systematik[kanton];
                      return gliederung === 'relevanz'
                        ? <KantonRelevanzListe erlasse={eig} sys={sys} />
                        : gliederung === 'rechtsgebiet'
                          ? <KantonGebietGruppen erlasse={eig} />
                          : <KantonSystematik erlasse={eig} sys={sys} />;
                    })()}
                  </section>
                </>
              ) : (
                /* «Alle» → entrümpelte Auswahl (G5 · §4.3): Kontext-Zeile + Karte/
                    Liste + Sortierung. */
                <KantonAuswahl
                  gruppen={gruppiereNachKanton(kantGefiltert)}
                  alleKantone={kantone}
                  onWaehle={setzeKanton}
                />
              )}
              {kantGefiltert.length === 0 && <p className="text-body-s text-ink-500">Kein Erlass gefunden.</p>}
            </div>
          )}
          </div>
          )}
        </>
      )}
    </div>
  );
}
