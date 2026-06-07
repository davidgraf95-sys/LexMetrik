import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { SEKTIONEN, VORLAGE_SEKTIONEN, RECHTSGEBIETE, RECHTSGEBIET_SEKTIONEN, RECHTSBEREICH_SEKTIONEN, istVerfuegbar, istAktiv, karte, type CalculatorCard } from '../lib/startseiteConfig';
import { RECHTSBEREICH_GRUPPEN } from '../lib/rechtsbereichGruppen';
import { ladeZuletzt, merkeZuletzt } from '../lib/schnellzugriff';
import { kartePasst, sucheRang } from '../lib/katalogSuche';
import { RechnerKarte } from './RechnerKarte';
import { sansAmp } from './typografie';
import { Tabs } from './ui/Tabs';

// Katalog der Hauptseite «/» (eine Hauptseite seit 7.6.2026).
// Anatomie seit 6.6.2026 (Auftrag David, «Kachel-Katalog»): Die Rechtsgebiete
// erscheinen als KOMPAKTE KACHELN unter ihren juristischen Obergruppen; ein
// Klick öffnet das Gebiet als volle Breite direkt unter der Kachel-Zeile
// (die übrigen Kacheln rutschen nach unten), ein zweiter Klick schliesst.
// Aktive Suche/Filter ersetzen das Raster durch eine flache, deterministisch
// gerankte Trefferliste (Titel > Keyword exakt > Keyword > Norm > Gebiet).
//
// Übersichts-Umbau 7.6.2026 (FAHRPLAN-STARTSEITE-UEBERSICHT U2–U4, Auftrag
// David): Die Seitenleiste ist AUFGELÖST — ihre Gebietsliste duplizierte das
// Kachel-Raster 1:1. Die Suche steht als EIN Feld in voller Breite über dem
// Register; die Typ-Filter liegen hinter einer kompakten «Filter»-Schaltung
// im Katalog-Kopf; die Anliegen-Zeile lebt jetzt auf Seitenebene (vereinte
// Einstiegszeile in Startseite.tsx); «Zuletzt verwendet» erscheint nur,
// wenn es Einträge gibt (Leerzustand braucht keine Erklär-Prosa).

export function SectionHead({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-4">
      <h2 className="lc-overline text-ink-700">{children}</h2>
      <div className="flex-1 h-px bg-line" />
    </div>
  );
}

// ─── Karten-Sortierung innerhalb eines Gebiets: verfügbare vor geplanten ────

function sortiereKarten(karten: CalculatorCard[]): CalculatorCard[] {
  const hatAktiv = new Set(karten.filter((k) => k.status !== 'geplant').map((k) => k.rechtsgebiet));
  const gebietsRang = (g: string) => {
    const idx = RECHTSGEBIETE.indexOf(g);
    return (hatAktiv.has(g) ? 0 : RECHTSGEBIETE.length + 1) + (idx === -1 ? RECHTSGEBIETE.length : idx);
  };
  return [...karten].sort((a, b) =>
    gebietsRang(a.rechtsgebiet) - gebietsRang(b.rechtsgebiet) ||
    Number(a.status === 'geplant') - Number(b.status === 'geplant'));
}

// ─── Gebiet-Kachel: kleines Viereck mit Inhaltsangabe ───────────────────────
// «Was ist drin?» konkret: die verfügbaren Werkzeug-Titel (geklemmt), sonst
// die Gebiets-Lede; der Zähler trägt das ehrliche Mengenbild (§8).
// Klick → die Kachel weicht ihrem Panel an Ort und Stelle; die ÜBRIGEN
// Kacheln bleiben sichtbar und rutschen nach unten (Wunsch David 6.6.2026).
// Eigener view-transition-name je Kachel: der Browser animiert das
// Nachrutschen jedes Vierecks einzeln (View Transitions; ohne Support hart).

function GebietKachel({ gebiet, karten, onOeffnen }: {
  gebiet: { name: string; id: string; lede: string };
  karten: CalculatorCard[];
  onOeffnen: () => void;
}) {
  const verf = karten.filter(istVerfuegbar);
  const geplant = karten.length - verf.length;
  const inhalt = verf.length > 0 ? verf.map((k) => k.title).join(' · ') : gebiet.lede;

  return (
    <button type="button" onClick={onOeffnen} id={`kachel-${gebiet.id}`}
      style={{ viewTransitionName: `kachel-${gebiet.id}` }}
      className="lc-card text-left p-5 flex flex-col gap-2 min-w-0 scroll-mt-28 bg-surface transition-all motion-reduce:transition-none motion-reduce:transform-none cursor-pointer hover:shadow-lg hover:-translate-y-0.5">
      <span className="flex items-start justify-between gap-2">
        <span className="font-sans font-semibold text-ink-900 text-body-l leading-snug text-balance">{sansAmp(gebiet.name)}</span>
        <span aria-hidden className="text-brass-700 leading-none mt-1">▸</span>
      </span>
      <span className="lc-overline text-ink-500">
        {verf.length > 0 && <><span className="num text-brass-700">{verf.length}</span> verfügbar</>}
        {verf.length > 0 && geplant > 0 && ' · '}
        {geplant > 0 && <><span className="num">{geplant}</span> in Vorbereitung</>}
      </span>
      {/* Inhaltsangabe auf EINE Zeile geklemmt (U4): einheitliche Kachel-
          höhe, scanbare Spalten; der Volltext steht im Panel. */}
      <span className="text-body-s text-ink-500 leading-relaxed line-clamp-1">{inhalt}</span>
    </button>
  );
}

// ─── Gebiet-Panel: volle Breite an der Stelle der angeklickten Kachel ───────
// Untergruppen «Rechner» und «Vorlagen» wie bisher (feste Auftrags-Ordnung);
// «Schliessen» (oder Zurück-Taste, ?gebiet=) stellt die Kachel wieder her.

function GebietPanel({ gebiet, karten, onSchliessen, onOeffnen }: {
  gebiet: { name: string; id: string; lede: string };
  karten: CalculatorCard[];
  onSchliessen: () => void;
  onOeffnen?: (id: string) => void;
}) {
  const gruppen = ([
    { id: 'rechner', titel: 'Rechner', karten: karten.filter((k) => k.modus === 'rechner') },
    { id: 'vorlagen', titel: 'Vorlagen', karten: karten.filter((k) => k.modus === 'vorlage') },
  ] as const).filter((g) => g.karten.length > 0);
  if (gruppen.length === 0) return null;

  return (
    <section id={`panel-${gebiet.id}`} aria-label={gebiet.name} tabIndex={-1}
      style={{ viewTransitionName: 'gebiet-panel' }}
      className="lc-reveal-panel col-span-full scroll-mt-28 bg-surface rounded-2xl border border-line p-6 sm:p-8 space-y-6 focus:outline-none">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h3 className="font-sans font-semibold text-ink-900 text-h3 tracking-tight">{sansAmp(gebiet.name)}</h3>
          <p className="text-body-s text-ink-500 max-w-reading">{gebiet.lede}</p>
        </div>
        <button type="button" onClick={onSchliessen}
          className="shrink-0 text-body-s font-medium text-ink-500 hover:text-brass-700 transition-colors">
          Schliessen <span aria-hidden>✕</span>
        </button>
      </div>
      {gruppen.map((g) => (
        <div key={g.id}>
          <div className="flex items-center gap-4 mb-4">
            <h4 className="lc-overline text-ink-700">{g.titel}</h4>
            <div className="flex-1 h-px bg-line" />
            <span className="lc-overline num text-ink-500">{g.karten.length}</span>
          </div>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(min(340px,100%),1fr))] gap-6">
            {sortiereKarten(g.karten).map((c) => (
              <RechnerKarte key={c.id} card={c} headingLevel="h5"
                onOeffnen={onOeffnen ? () => onOeffnen(c.id) : undefined} />
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}

// ─── Treffer-Zeile: kompakte Zeile der flachen Suchergebnis-Liste ───────────

function TrefferZeile({ k, onOeffnen }: { k: CalculatorCard; onOeffnen?: (id: string) => void }) {
  const aktiv = istAktiv(k.status) && !!k.href;
  const inhalt = (
    <>
      <span className="min-w-0 flex-1">
        <span className="block font-sans font-medium text-ink-900 text-body-l leading-snug">{sansAmp(k.title)}</span>
        <span className="block text-body-s text-ink-500 truncate">{k.rechtsgebiet} · {k.modus === 'vorlage' ? 'Vorlage' : 'Rechner'}</span>
      </span>
      <span className="flex items-center gap-3 shrink-0">
        {k.status === 'entwurf' && <span className="lc-badge-entwurf" title="erstellt, fachlich noch nicht geprüft">Entwurf</span>}
        {k.status === 'geplant' && <span className="lc-badge lc-badge-soft">In Vorbereitung</span>}
        {aktiv && <span className="text-body-s font-medium text-brass-700 whitespace-nowrap">{k.modus === 'vorlage' ? 'Erstellen →' : 'Öffnen →'}</span>}
      </span>
    </>
  );
  const klasse = 'flex items-center justify-between gap-4 px-4 py-3 rounded-xl border border-line bg-surface no-underline';
  return aktiv ? (
    <Link to={k.href!} onClick={onOeffnen ? () => onOeffnen(k.id) : undefined}
      className={`${klasse} hover:border-brass-400 hover:bg-brass-100/30 transition-colors motion-reduce:transition-none`}>
      {inhalt}
    </Link>
  ) : (
    <div className={klasse}>{inhalt}</div>
  );
}

// ─── Filterleiste: Filtergruppen (Rechtsbereich, Output-/Dokument-Typ) ──────

export type PillGruppe = {
  label: string;
  optionen: { code: string; label: string }[];
  aktiv: Set<string>;
  toggle: (code: string) => void;
};

function FilterLeiste({ zusatzGruppen }: { zusatzGruppen?: PillGruppe[] }) {
  return (
    <section aria-label="Filter" className="space-y-4">
      {(zusatzGruppen ?? []).map((gr) => (
        <div key={gr.label} role="group" aria-label={gr.label}>
          <p className="lc-overline mb-1.5">{gr.label}</p>
          <div className="flex flex-wrap gap-1.5">
            {gr.optionen.map((o) => {
              const an = gr.aktiv.has(o.code);
              return (
                <button key={o.code} type="button" onClick={() => gr.toggle(o.code)} aria-pressed={an}
                  className={`inline-flex items-center h-7 text-xs font-medium rounded-full px-2.5 border transition-colors ${
                    an ? 'bg-ink-900 text-paper border-ink-900' : 'bg-surface text-ink-700 border-line hover:border-brass-400 hover:bg-brass-100/50'
                  }`}>
                  {o.label}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </section>
  );
}

// ─── Schnellzugriff: Zuletzt verwendet ──────────────────────────────────────
// Zeigt NUR Verfügbares (defensiv gegen entfernte IDs via karte()-Lookup).
// Favoriten entfernt (Anweisung David 5.6.2026) — nur noch «Zuletzt».

function Schnellzugriff(props: {
  zuletzt: string[];
  onOeffnen: (id: string) => void;
}) {
  const { zuletzt, onOeffnen } = props;
  const zuletztKarten = zuletzt
    .map((id) => karte(id))
    .filter((k): k is NonNullable<ReturnType<typeof karte>> => !!k && istVerfuegbar(k) && !!k.href)
    .slice(0, 6);

  // Bewusst leise (Befund 5.6.2026): keine Farbflächen — schlanke, neutrale Chips.
  const chip = (k: NonNullable<ReturnType<typeof karte>>) => (
    <Link key={k.id} to={k.href!} onClick={() => onOeffnen(k.id)}
      className="inline-flex items-center gap-1 h-7 px-2.5 rounded-md border border-line text-body-s text-ink-600 no-underline hover:text-brass-700 hover:border-brass-400 transition-colors">
      {sansAmp(k.title)}
    </Link>
  );

  // Leer (z. B. Erstbesuch): NICHTS rendern (U2 — ein Leerzustand braucht
  // keine Erklär-Prosa; die Zeile erscheint mit dem ersten geöffneten Tool).
  if (zuletztKarten.length === 0) return null;

  return (
    <section aria-label="Schnellzugriff"
      className="grid grid-cols-1 sm:grid-cols-[9.5rem_minmax(0,1fr)] gap-x-3 gap-y-1 sm:items-center">
      <span className="lc-overline text-ink-500">Zuletzt verwendet</span>
      <div className="flex flex-wrap gap-1.5">{zuletztKarten.map(chip)}</div>
    </section>
  );
}

// ─── Katalog: Suchleiste + Kopfzeile (Tabs/Filter/Notiz) + Kachel-Raster ────

export function Katalog({ karten, filterBereich = false, filterArt = false, kopfNotiz }: {
  karten: CalculatorCard[];
  filterBereich?: boolean;
  filterArt?: boolean;
  /** Stille Zeile rechts der Tabs (z. B. Entwurf-Legende der Seite, U4). */
  kopfNotiz?: React.ReactNode;
}) {
  // ── URL-Zustand: Tab Verfügbar/Katalog + offenes Gebiet (teilbar) ──
  const [searchParams, setSearchParams] = useSearchParams();
  const ansicht: 'verfuegbar' | 'katalog' =
    searchParams.get('ansicht') === 'katalog' ? 'katalog' : 'verfuegbar';
  const offenGebiet = searchParams.get('gebiet');
  const patchParams = (patch: Record<string, string | null>, viewTransition = false) => {
    const p = new URLSearchParams(searchParams);
    for (const [key, wert] of Object.entries(patch)) {
      if (wert === null) p.delete(key); else p.set(key, wert);
    }
    // viewTransition: Raster ⇄ Fokus-Panel weich überblenden (View
    // Transitions API via Router; Browser ohne Support wechseln hart,
    // prefers-reduced-motion wird von der globalen Regel abgedeckt).
    setSearchParams(p, viewTransition ? { viewTransition: true } : undefined);
  };
  const setAnsicht = (a: 'verfuegbar' | 'katalog') =>
    patchParams({ ansicht: a === 'katalog' ? 'katalog' : null });
  const toggleGebiet = (id: string) =>
    patchParams({ gebiet: offenGebiet === id ? null : id }, true);

  // ── Schnellzugriff (Zuletzt verwendet; localStorage, SSR-sicher) ──
  const [zuletzt, setZuletzt] = useState<string[]>(() => ladeZuletzt());
  const onOeffnen = (id: string) => { merkeZuletzt(id); setZuletzt(ladeZuletzt()); };
  const [bereiche, setBereiche] = useState<Set<string>>(new Set());
  const [arten, setArten] = useState<Set<string>>(new Set());
  // Suche in der URL (?q=, Etappe 1.3): teil-/lesezeichenfähig, Zurück-Taste
  // stellt sie wieder her; replace statt push — Tippen füllt keine History.
  const suche = searchParams.get('q') ?? '';
  const setSuche = (wert: string) => {
    const p = new URLSearchParams(searchParams);
    if (wert) p.set('q', wert); else p.delete('q');
    setSearchParams(p, { replace: true });
  };

  // Fokus-Verwaltung des Kachel↔Panel-Tauschs (Deploy-Bug-Check 7.6.2026,
  // MITTEL/a11y): das fokussierte Element verschwindet beim Öffnen wie beim
  // Schliessen aus dem DOM, der Fokus fiel auf <body>. Beim Öffnen erhält
  // das Panel den Fokus (tabIndex -1), beim Schliessen wieder die Kachel.
  const vorherOffen = useRef<string | null>(null);
  useEffect(() => {
    const vorher = vorherOffen.current;
    vorherOffen.current = offenGebiet;
    if (offenGebiet) {
      document.getElementById(`panel-${offenGebiet}`)?.focus({ preventScroll: true });
    } else if (vorher) {
      document.getElementById(`kachel-${vorher}`)?.focus({ preventScroll: true });
    }
  }, [offenGebiet]);

  // «/» fokussiert das Suchfeld (Etappe 1.4) — seit U2/U3 gibt es genau
  // EIN Feld (volle Breite über dem Register), kein Desktop/Drawer-Paar mehr.
  const suchFeldRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key !== '/' || e.metaKey || e.ctrlKey || e.altKey) return;
      const ziel = e.target as HTMLElement | null;
      if (ziel && (/^(INPUT|TEXTAREA|SELECT)$/.test(ziel.tagName) || ziel.isContentEditable)) return;
      if (suchFeldRef.current) { e.preventDefault(); suchFeldRef.current.focus(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Filter-Schaltung (U3): die Typ-Filter liegen hinter EINER kompakten
  // Schaltfläche im Katalog-Kopf statt in einer eigenen Seitenleiste;
  // bei aktiven Filtern bleibt die Gruppe sichtbar (nichts Verstecktes wirkt).
  const [filterOffen, setFilterOffen] = useState(false);

  const toggleIn = (set: (f: (alt: Set<string>) => Set<string>) => void) => (g: string) =>
    set((alt) => {
      const neu = new Set(alt);
      if (neu.has(g)) neu.delete(g); else neu.add(g);
      return neu;
    });
  const toggleBereich = toggleIn(setBereiche);
  const toggleArt = toggleIn(setArten);

  const q = suche.trim();
  // Treffer-Semantik lebt in lib/katalogSuche.ts (Etappe 0.1) — dieselbe
  // Logik, gegen die auch die Suchbegriff-Goldliste testet.
  const passt = (k: CalculatorCard) =>
    kartePasst(k, { gebiete: new Set<string>(), bereiche, arten, nurVerfuegbar: false, suche });

  // Tab «Verfügbar» blendet Geplantes aus – Daten bleiben unverändert.
  const basisKarten = ansicht === 'verfuegbar' ? karten.filter(istVerfuegbar) : karten;
  const filterAktiv = q !== '' || bereiche.size > 0 || arten.size > 0;
  // Flache Trefferliste bei aktiver Suche/Filter: Such-Rang ordnet (Titel >
  // Keyword exakt > Keyword > Norm > Gebiet), bei Gleichstand bzw. reiner
  // Pill-Filterung bleibt die Katalog-Reihenfolge (stabil, erwartbar).
  const treffer = basisKarten.filter(passt);
  // Rang je Karte EINMAL berechnen, dann sortieren (/simplify 7.6.2026:
  // der Comparator rief sucheRang zuvor O(n log n)-fach neu auf).
  const trefferSortiert = q === '' ? treffer : treffer
    .map((k) => [k, sucheRang(k, suche) ?? 9] as const)
    .sort((a, b) => a[1] - b[1])
    .map(([k]) => k);
  const allesZuruecksetzen = () => { setSuche(''); setBereiche(new Set()); setArten(new Set()); };

  // Rechtsgebiete in FESTER Auftrags-Reihenfolge (RECHTSGEBIETE pur), als
  // Kacheln unter ihren Obergruppen; leere Gebiete/Gruppen entfallen.
  const gebietSichtbar = [...RECHTSGEBIET_SEKTIONEN]
    .sort((a, b) => RECHTSGEBIETE.indexOf(a.name) - RECHTSGEBIETE.indexOf(b.name))
    .map((g) => ({ g, karten: basisKarten.filter((k) => k.rechtsgebiet === g.name) }))
    .filter((x) => x.karten.length > 0);
  const sektionFuer = new Map(gebietSichtbar.map((x) => [x.g.name, x]));
  const gruppenSichtbar = RECHTSBEREICH_GRUPPEN
    .map((gr) => ({ gr, sektionen: gr.gebiete.map((n) => sektionFuer.get(n)).filter((x): x is NonNullable<typeof x> => !!x) }))
    .filter((x) => x.sektionen.length > 0);

  const filterAnzahl = bereiche.size + arten.size + (q !== '' ? 1 : 0);
  const zusatzGruppen: PillGruppe[] = [
    ...(filterBereich ? [{
      label: 'Rechtsbereich',
      optionen: RECHTSBEREICH_SEKTIONEN.filter((b) => karten.some((k) => k.rechtsbereich === b.code))
        .map((b) => ({ code: b.code as string, label: b.title })),
      aktiv: bereiche, toggle: toggleBereich,
    }] : []),
    ...(filterArt ? [
          // Gemischter Katalog: Output-Typ (Rechner) und Dokument-Typ (Vorlagen)
          // als getrennte Pill-Gruppen; Auswahl filtert über beide Modi hinweg.
          {
            label: 'Output-Typ (Rechner)',
            optionen: SEKTIONEN.filter((sx) => karten.some((k) => k.art === sx.art))
              .map((sx) => ({ code: sx.art as string, label: sx.title })),
            aktiv: arten, toggle: toggleArt,
          },
          {
            label: 'Dokument-Typ (Vorlagen)',
            optionen: VORLAGE_SEKTIONEN.filter((sx) => karten.some((k) => k.art === sx.art))
              .map((sx) => ({ code: sx.art as string, label: sx.title })),
            aktiv: arten, toggle: toggleArt,
          },
        ].filter((gr) => gr.optionen.length > 0) : []),
  ];
  // EIN Suchfeld in voller Breite — der prominente Einstieg (U2); filtert
  // den Katalog live (flache Trefferliste), «/» fokussiert, ?q= teilbar.
  const suchFeld = (
    <input
      ref={suchFeldRef}
      type="search"
      value={suche}
      onChange={(e) => setSuche(e.target.value)}
      placeholder="Rechner, Vorlage oder Norm suchen …  ( / )"
      className="lc-input h-11 py-0"
      aria-label="Katalog durchsuchen"
      aria-keyshortcuts="/"
    />
  );
  const filterSichtbar = zusatzGruppen.length > 0 && (filterOffen || bereiche.size > 0 || arten.size > 0);

  return (
    <div className="space-y-6">
      {suchFeld}

      {/* Kopfzeile: Tabs links · Filter-Schaltung + stille Notiz rechts */}
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <Tabs
          ariaLabel="Katalog-Ansicht"
          items={[
            { code: 'verfuegbar', label: `Verfügbar (${karten.filter(istVerfuegbar).length})` },
            { code: 'katalog', label: `Gesamter Katalog (${karten.length})` },
          ] as const}
          value={ansicht}
          onChange={setAnsicht}
        />
        <div className="flex items-center gap-4">
          {kopfNotiz}
          {zusatzGruppen.length > 0 && (
            <button type="button" onClick={() => setFilterOffen((o) => !o)}
              aria-expanded={filterSichtbar}
              className="text-body-s font-medium text-ink-600 hover:text-brass-700 transition-colors whitespace-nowrap">
              Filter{filterAnzahl > 0 && <span className="num text-brass-700"> ({filterAnzahl})</span>} <span aria-hidden>{filterSichtbar ? '▴' : '▾'}</span>
            </button>
          )}
        </div>
      </div>
      {filterSichtbar && <FilterLeiste zusatzGruppen={zusatzGruppen} />}

      {/* «Zuletzt verwendet» — nur wenn vorhanden (U2) */}
      <Schnellzugriff zuletzt={zuletzt} onOeffnen={onOeffnen} />

      <div className="space-y-8 min-w-0">
        {filterAktiv ? (
          trefferSortiert.length === 0 ? (
            /* Leerer Zustand: kein stilles Verschwinden */
            <section className="bg-surface rounded-2xl border border-line p-10 sm:p-14 text-center space-y-3">
              <p className="lc-overline">Keine Treffer</p>
              <h2 className="font-display font-semibold text-ink-900 text-h2">
                {q !== '' ? <>Nichts gefunden für «{q}».</> : 'Die gewählten Filter ergeben keine Treffer.'}
              </h2>
              <p className="text-body-s text-ink-500 max-w-reading mx-auto">
                Versuchen Sie einen anderen Begriff (z. B. einen Gesetzesartikel wie «Art. 336c») oder
                setzen Sie die Filter zurück.
              </p>
              <button type="button" onClick={allesZuruecksetzen} className="lc-btn-outline mt-2">
                Filter zurücksetzen
              </button>
            </section>
          ) : (
            /* Flache, gerankte Trefferliste — Suchen-und-Öffnen ohne Umweg */
            <section aria-label="Suchtreffer" className="space-y-3">
              <div className="flex items-center justify-between gap-4">
                <p className="lc-overline text-ink-500"><span className="num">{trefferSortiert.length}</span> Treffer</p>
                <button type="button" onClick={allesZuruecksetzen}
                  className="text-body-s text-ink-500 hover:text-brass-700 transition-colors">
                  Zurücksetzen
                </button>
              </div>
              <div className="space-y-2">
                {trefferSortiert.map((k) => <TrefferZeile key={k.id} k={k} onOeffnen={onOeffnen} />)}
              </div>
            </section>
          )
        ) : (
          /* Kachel-Katalog (Auftrag David 6.6.2026, präzisiert): Obergruppen
             als ruhige Trenner, darunter die Gebiets-Kacheln. Die angeklickte
             Kachel weicht ihrem Panel an Ort und Stelle (col-span-full);
             die ÜBRIGEN Kacheln bleiben sichtbar und rutschen nach unten —
             animiert über je einen eigenen view-transition-name. */
          gruppenSichtbar.map((x) => (
            <section key={x.gr.id} aria-labelledby={`gruppe-${x.gr.id}`} className="space-y-4">
              {/* Obergruppe als STILLE Overline (U4): vorher fünf h3-Schwer-
                  gewichte mit eigener Ablesekante — das Register trägt die
                  Hierarchie jetzt typografisch, nicht mit fünf Linealen. */}
              <div className="flex items-center gap-4 pt-1">
                <h2 id={`gruppe-${x.gr.id}`} className="lc-overline text-ink-700 whitespace-nowrap">
                  {sansAmp(x.gr.label)}
                </h2>
                <span aria-hidden className="flex-1 h-px bg-line" />
              </div>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(min(240px,100%),1fr))] gap-4">
                {x.sektionen.map((sx) => (
                  offenGebiet === sx.g.id ? (
                    <GebietPanel key={sx.g.id} gebiet={sx.g} karten={sx.karten}
                      onSchliessen={() => toggleGebiet(sx.g.id)} onOeffnen={onOeffnen} />
                  ) : (
                    <GebietKachel key={sx.g.id} gebiet={sx.g} karten={sx.karten}
                      onOeffnen={() => toggleGebiet(sx.g.id)} />
                  )
                ))}
              </div>
            </section>
          ))
        )}
      </div>
    </div>
  );
}
