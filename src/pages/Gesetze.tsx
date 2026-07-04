import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useLocation, Link } from 'react-router-dom';
import { SeitenKopf } from '../components/layout/SeitenKopf';
import { ErlassKarte, ErlassZeile } from '../components/normtext/ErlassKarte';
import { InternationalRubriken } from '../components/normtext/InternationalRubriken';
import {
  ladeBrowseManifest, ladeKantonSystematik, gruppiereNachKanton, filtern,
} from '../lib/normtext/browse';
import { istLesbar, type BrowseErlass } from '../lib/normtext/browse-typen';
import { SYSTEMATIK, sachgruppe, topTitel, subTitel, sachgebietRang, untergruppeRang, srVergleich, type KantonSystematik } from '../lib/normtext/systematik';
import { KantonWappen } from '../components/KantonWappen';
import { SchweizKarte } from '../components/SchweizKarte';
import { useErlassOeffnen, istErlassOffen } from '../lib/useErlassOeffnen';
import { usePaneKlasse } from '../components/layout/PaneKontext';

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

function Gitter({ erlasse }: { erlasse: BrowseErlass[] }) {
  const pk = usePaneKlasse();
  return (
    <div className={pk('grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3', 'grid grid-cols-1 @lg/pane:grid-cols-2 @3xl/pane:grid-cols-3 gap-3')}>
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
        <span className="num text-body-s text-ink-500 ml-auto">{anzahl}</span>
      </summary>
      <div className="px-5 pb-5 pt-4 space-y-5 border-t border-line">{children}</div>
    </details>
  );
}

// Inhalt einer Untergruppe: Leitgesetze als Karten, untergeordnetes
// Ausführungsrecht (Verordnungen/Reglemente) dezent als eingerückte Liste.
function GruppenInhalt({ titel, items }: { titel: string; items: BrowseErlass[] }) {
  const pk = usePaneKlasse();
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
          <p className="lc-overline text-ink-500 mb-1">Verordnungen &amp; Ausführungsrecht</p>
          <div className={pk('grid grid-cols-1 sm:grid-cols-2 gap-x-4', 'grid grid-cols-1 @lg/pane:grid-cols-2 gap-x-4')}>
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

  // Bund-Übersicht: standardmässig ALLES eingeklappt (Auftrag David 25.6.2026 —
  // Kategorien-Überblick auf einen Blick, wie die Kanton-Ansicht). Nur ein
  // Sidebar-Deeplink (#sys-<id>) öffnet zusätzlich seine Zielkategorie (hashOffen,
  // vom Eltern via key= bei Hash-Wechsel frisch gemountet) + springt sie an.
  const [offen, setOffen] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    if (hashOffen) initial.add(hashOffen);
    return initial;
  });
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

// Kompakte, überlaufsichere Erlass-Zeile für die Kanton-Systematik: SR-Nr fix
// links (tabellarisch), Titel einzeilig gekürzt. Bewusst NICHT ErlassZeile —
// kantonale «kuerzel» sind oft der ganze (bis 276 Z.) Titel und würden als
// shrink-0 die Zeile sprengen (Auftrag David: «überschnitten» bei BS).
// Stand-Jahr (ISO «YYYY-…») — reine Anzeige. Sehr alte Stände (vor 1990) werden
// dezent markiert: BS mischt Erlasse von 1826 bis 2026, ein sehr alter Stand ist
// für die Anwältin ein nützliches Signal, soll aber nicht so laut wie ein
// frischer wirken. Fixe Schwelle (kein Date.now(), §2 — reine Darstellung).
const standJahr = (stand: string): string | null => stand.slice(0, 4).match(/^\d{4}$/)?.[0] ?? null;

function SysZeile({ e }: { e: BrowseErlass }) {
  const jahr = standJahr(e.stand);
  const altDezent = jahr != null && Number(jahr) < 1990;
  const inhalt = (
    <>
      <span className="num text-xs text-ink-500 shrink-0 w-20 tabular-nums truncate">{e.sr}</span>
      <span className="text-ink-700 truncate group-hover/z:text-brass-700">{e.titel}</span>
      {istLesbar(e) ? (
        <span className="ml-auto shrink-0 flex items-baseline gap-2 num text-xs tabular-nums">
          {e.artikelAnzahl > 0 && <span className="text-ink-500">{e.artikelAnzahl} Art.</span>}
          {/* Sehr alte Stände dezent (italic) statt blass — Kontrast (S10/WCAG) bleibt gewahrt. */}
          {jahr && <span className={`hidden sm:inline text-ink-500${altDezent ? ' italic' : ''}`}>{jahr}</span>}
        </span>
      ) : (
        <span aria-hidden className="text-xs text-brass-700 shrink-0 ml-auto">↗</span>
      )}
    </>
  );
  const cls = 'group/z flex items-baseline gap-3 text-body-s no-underline rounded px-2 py-1 hover:bg-brass-100/30 transition-colors min-w-0';
  // Punkt G: erneutes Öffnen eines bereits offenen Erlasses → neue Instanz (?r).
  // <Link> behält den nackten Basispfad (SEO/Mittelklick/Cmd-Klick/Copy-Link);
  // nur der einfache Linksklick auf ein schon offenes Gesetz wird abgefangen.
  const oeffne = useErlassOeffnen();
  const basePath = `/gesetze/${e.ebene}/${encodeURIComponent(e.key)}`;
  return !istLesbar(e)
    ? <a href={e.quelleUrl} target="_blank" rel="noopener noreferrer" className={cls}>{inhalt}</a>
    : (
      <Link
        to={basePath}
        onClick={(ev) => {
          if (ev.defaultPrevented || ev.button !== 0 || ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.altKey) return;
          if (!istErlassOffen(basePath)) return;
          ev.preventDefault();
          oeffne(e.ebene, e.key, e.kuerzel);
        }}
        className={cls}
      >{inhalt}</Link>
    );
}

// Ein gewählter Kanton, gegliedert nach der OFFIZIELLEN Systematik (systematik.ts:
// Top-Sachgebiet + Untergruppe aus dem amtlichen clex-Baum). Übersicht zuerst:
// alle Top-Sektionen eingeklappt (Sachgebiete des Kantons auf einen Blick), Klick
// öffnet eine; «Alle auf-/zuklappen». Im Inneren je Untergruppe ein Zwischen-
// titel, darunter nach SR-Nr sortierte Zeilen. Die Seiten-Suche liefert die
// flache Trefferliste — diese gegliederte Ansicht zeigt sich nur ohne Suche.
function KantonSystematik({ erlasse, sys }: { erlasse: BrowseErlass[]; sys?: KantonSystematik }) {
  const pk = usePaneKlasse();
  const gruppen = useMemo(() => {
    const rangTop = sachgebietRang(sys);
    const tops = new Map<string, Map<string, BrowseErlass[]>>();
    for (const e of erlasse) {
      const { top, sub } = sachgruppe(sys, e.sr);
      if (!tops.has(top)) tops.set(top, new Map());
      const subs = tops.get(top)!;
      if (!subs.has(sub)) subs.set(sub, []);
      subs.get(sub)!.push(e);
    }
    return [...tops.entries()]
      .sort((a, b) => rangTop(a[0]) - rangTop(b[0]) || a[0].localeCompare(b[0], 'de', { numeric: true }))
      .map(([top, subs]) => {
        const rangSub = untergruppeRang(sys, top);
        const anzahl = [...subs.values()].reduce((n, arr) => n + arr.length, 0);
        const untergruppen = [...subs.entries()]
          .sort((a, b) => rangSub(a[0]) - rangSub(b[0]) || a[0].localeCompare(b[0], 'de', { numeric: true }))
          .map(([sub, items]) => ({
            sub,
            titel: subTitel(sys, top, sub),
            items: items.sort((a, b) => srVergleich(a.sr, b.sr) || a.titel.localeCompare(b.titel, 'de')),
          }));
        return { top, titel: topTitel(sys, top), anzahl, untergruppen };
      });
  }, [erlasse, sys]);

  const alleIds = gruppen.map((g) => g.top);
  const [offen, setOffen] = useState<Set<string>>(() => new Set());
  const alleOffen = alleIds.length > 0 && offen.size >= alleIds.length;
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
      {gruppen.map((g) => (
        <Kategorie key={g.top} offen={offen.has(g.top)} onToggle={() => toggle(g.top)} anzahl={g.anzahl}
          kopf={
            <span className="flex items-baseline gap-2.5 min-w-0">
              <span aria-hidden className="num font-display text-h3 leading-none text-brass-700 shrink-0">{g.top}</span>
              {/* N10: nicht hart einzeilig kürzen (lange Sachgebietstitel werden auf
                  Mobil sonst abgeschnitten) — bis zu zwei Zeilen, dann erst ellipsis. */}
              <span className="font-sans font-semibold text-ink-900 text-h3 tracking-tight line-clamp-2">{g.titel}</span>
            </span>
          }>
          <div className="space-y-4">
            {g.untergruppen.map((u) => (
              <section key={u.sub || '_'} className="space-y-1.5">
                {u.titel && (
                  <div className="flex items-baseline gap-2">
                    <span aria-hidden className="num text-xs text-brass-700 shrink-0">{u.sub}</span>
                    <h4 className="lc-overline text-brass-700">{u.titel}</h4>
                    <span className="text-ink-500 text-xs">· {u.items.length}</span>
                    <span aria-hidden className="flex-1 h-px bg-line/70" />
                  </div>
                )}
                <div className={pk('grid grid-cols-1 sm:grid-cols-2 gap-x-5', 'grid grid-cols-1 @lg/pane:grid-cols-2 gap-x-5')}>
                  {u.items.map((e) => <SysZeile key={e.key} e={e} />)}
                </div>
              </section>
            ))}
          </div>
        </Kategorie>
      ))}
    </div>
  );
}

// Neutraler Landeplatz /gesetze (G4 · §4.1): prominenter Sprung-/Such-Einstieg
// (öffnet die Cmd/Ctrl-K-Palette, §4.2) + drei gleichwertige Einstiegskacheln mit
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
      {/* Prominenter Artikel-Sprung / Suche (§4.2): öffnet die Befehlspalette. */}
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
              <span className="lc-overline text-ink-500">{k.einheit}</span>
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
  const pk = usePaneKlasse();
  const [erlasse, setErlasse] = useState<BrowseErlass[] | null>(null);
  const [systematik, setSystematik] = useState<Record<string, KantonSystematik>>({});
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
  const setzeEbene = (e: Ebene) => {
    const p = new URLSearchParams(params);
    p.set('ebene', e);
    p.delete('kt');
    setParams(p, { replace: true });
  };
  const zurUebersicht = () => {
    const p = new URLSearchParams(params);
    p.delete('ebene');
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
            {!suche.trim() && gewaehlt !== null ? (
              <div className="flex flex-wrap items-center gap-3">
                <button type="button" onClick={zurUebersicht}
                  className="text-body-s font-medium text-brass-700 hover:text-brass-600 transition-colors">
                  ← Übersicht
                </button>
                <Segment aktiv={ebene} onWahl={setzeEbene} />
              </div>
            ) : <span />}
            <input
              type="search"
              value={suche}
              onChange={(e) => setSuche(e.target.value)}
              placeholder="Suchen — Bund, Kantone & International (Kürzel, Titel, SR-Nr.) …"
              aria-label="Gesetze durchsuchen"
              className="lc-input h-9 py-0 text-body-s w-full max-w-sm"
            />
          </div>

          {/* Landeplatz (G4 · §4.1): drei gleichwertige Einstiegskacheln mit
              Kurz-Statistik statt stillem Bund-Default. Prominenter Sprung-/
              Such-Hinweis (Cmd/Ctrl-K, §4.2) darüber. */}
          {!suche.trim() && gewaehlt === null && (
            <Einstieg
              bund={gefiltert.length}
              bundArtikel={gefiltert.reduce((a, e) => a + e.artikelAnzahl, 0)}
              kantone={kantone.length}
              kantonErlasse={erlasse.filter((e) => e.ebene === 'kanton').length}
              international={international.length}
              onWahl={setzeEbene}
              onBefehl={() => { if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('lm:befehlspalette')); }}
            />
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
          {!suche.trim() && gewaehlt !== null && (
          <div role="tabpanel" id={`ebene-panel-${ebene}`} aria-labelledby={`ebene-tab-${ebene}`}>
          {ebene === 'bund' && (
            gefiltert.length === 0
              ? <p className="text-body-s text-ink-500">Kein Erlass gefunden.</p>
              : <BundSystematik key={hashSys ?? 'base'} erlasse={gefiltert} hashOffen={hashSys} />
          )}

          {/* International-Tab (Auftrag David 25.6.2026): gleichwertige Säule neben
              Bund/Kantone — Staatsverträge SR 0.* + EU-Verordnungen, geteilte
              Rubriken-Darstellung (§5, identisch zu /international). */}
          {!suche.trim() && ebene === 'international' && (
            <div className="space-y-3">
              <p className="text-body-s text-ink-500 max-w-reading">
                Für die Schweiz massgebliche Staatsverträge und internationales Recht — je mit Live-Link zur amtlichen Fassung (Fedlex SR 0.* bzw. EUR-Lex). Einzelne Erlasse (z. B. EMRK) werden als amtliches PDF in-app angezeigt; massgeblich bleibt stets die amtliche Quelle.
              </p>
              <InternationalRubriken erlasse={international} />
            </div>
          )}

          {!suche.trim() && ebene === 'kanton' && (
            <div className="space-y-6">
              {/* N8: Die grosse Schweiz-Karte verdrängte die Gesetzesliste unter den
                  Fold. Nur im «Alle»-Modus zeigen — und dort kollabierbar (Default
                  zu), damit die Liste/das Auswahlraster hoch beginnt. Im Einzel-
                  kanton-Modus trägt der kompakte Wappen-Chip in der Zurück-Leiste
                  die Identität (Karte dort redundant, da der Kanton schon gewählt ist). */}
              {!kanton && (
                <details className="lc-card group overflow-hidden">
                  <summary className="flex items-center gap-2 cursor-pointer select-none px-4 py-2.5 text-body-s font-medium text-ink-700 hover:bg-brass-100/30">
                    <span aria-hidden className="text-brass-700">🗺</span>
                    Kanton auf der Karte wählen
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden
                      className="ml-auto text-ink-500 transition-transform group-open:rotate-90">
                      <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </summary>
                  <div className="border-t border-line p-4 sm:p-6">
                    <SchweizKarte
                      aktiv={kanton}
                      onWaehle={setzeKanton}
                      nameFuer={(k) => KANTON_NAMEN[k] ?? k}
                      verfuegbar={(k) => kantone.includes(k as typeof kantone[number])}
                    />
                  </div>
                </details>
              )}
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
                        <span className="lc-overline text-ink-500">Kantonale Erlasse</span>
                      </span>
                      <span className="num text-body-s text-ink-500 ml-auto self-end">{kantGefiltert.filter((e) => e.kanton === kanton).length}</span>
                    </div>
                    <KantonSystematik erlasse={kantGefiltert.filter((e) => e.kanton === kanton)} sys={systematik[kanton]} />
                  </section>
                </>
              ) : (
                /* «Alle» → kompaktes Auswahlraster (Code · Name · Erlass-Zähler) statt
                    aller Karten — ein Bildschirm Übersicht statt endlosem Scroll. */
                <>
                  <p className="text-body-s text-ink-500 max-w-reading">
                    Kanton wählen — die Erlasse werden dann nach der amtlichen Systematik des Kantons (Sachgebiete) gegliedert.
                  </p>
                  <div className={pk('grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5', 'grid grid-cols-2 @xl/pane:grid-cols-3 @4xl/pane:grid-cols-4 gap-2.5')}>
                    {gruppiereNachKanton(kantGefiltert).map((g) => (
                      <button type="button" key={g.kanton} onClick={() => setzeKanton(g.kanton)}
                        className="lc-card group flex items-center gap-3 p-3.5 text-left transition-colors hover:border-brass-400">
                        <KantonWappen kanton={g.kanton} className="h-9 w-8 transition-transform group-hover:scale-105" />
                        <span className="flex flex-col min-w-0">
                          <span className="flex items-baseline gap-1.5">
                            <span className="text-body-s font-medium text-ink-800 truncate group-hover:text-brass-700 transition-colors">{KANTON_NAMEN[g.kanton] ?? g.kanton}</span>
                            <span aria-hidden className="num text-xs text-ink-500 shrink-0">{g.kanton}</span>
                          </span>
                          <span className="text-xs text-ink-500"><span className="num">{g.erlasse.length}</span> Erlasse</span>
                        </span>
                      </button>
                    ))}
                  </div>
                </>
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
