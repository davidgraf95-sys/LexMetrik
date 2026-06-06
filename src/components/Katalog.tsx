import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { SEKTIONEN, VORLAGE_SEKTIONEN, RECHTSGEBIETE, RECHTSGEBIET_SEKTIONEN, RECHTSBEREICH_SEKTIONEN, istVerfuegbar, istAktiv, karte, type CalculatorCard } from '../lib/startseiteConfig';
import { RECHTSBEREICH_GRUPPEN } from '../lib/rechtsbereichGruppen';
import { ladeZuletzt, merkeZuletzt } from '../lib/schnellzugriff';
import { kartePasst, sucheRang } from '../lib/katalogSuche';
import { RechnerKarte } from './RechnerKarte';
import { sansAmp } from './typografie';
import { Tabs } from './ui/Tabs';

// Gemeinsamer Rechner-Katalog für /pro (Pro-only seit 5.6.2026).
// Anatomie seit 6.6.2026 (Auftrag David, «Kachel-Katalog»): Die Rechtsgebiete
// erscheinen als KOMPAKTE KACHELN unter ihren juristischen Obergruppen; ein
// Klick öffnet das Gebiet als volle Breite direkt unter der Kachel-Zeile
// (die übrigen Kacheln rutschen nach unten), ein zweiter Klick schliesst.
// Aktive Suche/Filter ersetzen das Raster durch eine flache, deterministisch
// gerankte Trefferliste (Titel > Keyword exakt > Keyword > Norm > Gebiet).

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

function GebietKachel({ gebiet, karten, offen, onToggle }: {
  gebiet: { name: string; id: string; lede: string };
  karten: CalculatorCard[];
  offen: boolean;
  onToggle: () => void;
}) {
  const verf = karten.filter(istVerfuegbar);
  const geplant = karten.length - verf.length;
  const inhalt = verf.length > 0 ? verf.map((k) => k.title).join(' · ') : gebiet.lede;

  return (
    <button type="button" onClick={onToggle} aria-expanded={offen} aria-controls={`panel-${gebiet.id}`}
      id={`kachel-${gebiet.id}`}
      className={`lc-card text-left p-5 flex flex-col gap-2 min-w-0 scroll-mt-28 transition-all motion-reduce:transition-none cursor-pointer ${
        offen
          ? 'bg-surface-raised border-t-[3px] border-t-brass-500 shadow-lg'
          : 'bg-surface hover:shadow-lg hover:-translate-y-0.5 motion-reduce:transform-none'
      }`}>
      <span className="flex items-start justify-between gap-2">
        <span className="font-sans font-semibold text-ink-900 text-body-l leading-snug text-balance">{sansAmp(gebiet.name)}</span>
        <span aria-hidden className={`text-brass-700 leading-none mt-1 transition-transform motion-reduce:transition-none ${offen ? 'rotate-90' : ''}`}>▸</span>
      </span>
      <span className="lc-overline text-ink-500">
        {verf.length > 0 && <><span className="num text-brass-700">{verf.length}</span> verfügbar</>}
        {verf.length > 0 && geplant > 0 && ' · '}
        {geplant > 0 && <><span className="num">{geplant}</span> in Vorbereitung</>}
      </span>
      <span className="text-body-s text-ink-500 leading-relaxed line-clamp-3">{inhalt}</span>
    </button>
  );
}

// ─── Gebiet-Panel: volle Breite unter der Kachel-Zeile ──────────────────────
// Untergruppen «Rechner» und «Vorlagen» wie bisher (feste Auftrags-Ordnung).

function GebietPanel({ gebiet, karten, onOeffnen }: {
  gebiet: { name: string; id: string; lede: string };
  karten: CalculatorCard[];
  onOeffnen?: (id: string) => void;
}) {
  const gruppen = ([
    { id: 'rechner', titel: 'Rechner', karten: karten.filter((k) => k.modus === 'rechner') },
    { id: 'vorlagen', titel: 'Vorlagen', karten: karten.filter((k) => k.modus === 'vorlage') },
  ] as const).filter((g) => g.karten.length > 0);
  if (gruppen.length === 0) return null;

  return (
    <section id={`panel-${gebiet.id}`} aria-label={gebiet.name}
      className="col-span-full bg-surface rounded-2xl border border-line p-6 sm:p-8 space-y-6">
      <div className="space-y-1">
        <h3 className="font-sans font-semibold text-ink-900 text-h3 tracking-tight">{sansAmp(gebiet.name)}</h3>
        <p className="text-body-s text-ink-500 max-w-reading">{gebiet.lede}</p>
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
        {k.status === 'entwurf' && <span className="lc-badge lc-badge-warn" title="erstellt, fachlich noch nicht geprüft">Entwurf</span>}
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

// ─── Gruppierte Übersicht (Seitenleiste): Obergruppe → Gebiete ──────────────
// Klick wählt die Kachel an (öffnet das Panel) und springt zur Gruppe.

function UebersichtGruppiert(props: {
  gruppen: { label: string; eintraege: { id: string; title: string; anzahl: number }[] }[];
  aktiveSektion: string | null;
  onSprung?: (id: string) => void;
}) {
  const { gruppen, aktiveSektion, onSprung } = props;
  return (
    <nav aria-label="Rechtsgebiete nach Obergruppen" className="space-y-4">
      {gruppen.map((gr) => (
        <div key={gr.label} className="space-y-1">
          <p className="lc-overline mb-1.5">{gr.label}</p>
          {gr.eintraege.map((s) => {
            const aktiv = s.id === aktiveSektion;
            return (
              <a key={s.id} href={`#kachel-${s.id}`} aria-current={aktiv ? 'true' : undefined}
                onClick={() => onSprung?.(s.id)}
                className={`relative flex items-baseline justify-between gap-2 px-2 py-1 -mx-2 rounded-md text-body-s no-underline transition-colors ${
                  aktiv ? 'bg-brass-100/60 text-ink-900 font-medium' : 'text-ink-600 hover:text-ink-900 hover:bg-brass-100/40'
                }`}>
                {aktiv && <span aria-hidden className="absolute left-0 top-1 bottom-1 w-[3px] rounded-full bg-brass-500" />}
                <span className="truncate pl-1">{s.title}</span>
                <span className="num text-xs text-ink-500">{s.anzahl}</span>
              </a>
            );
          })}
        </div>
      ))}
    </nav>
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

  // Leer (z. B. Erstbesuch): EINE dezente Zeile statt leerem Gerüst.
  if (zuletztKarten.length === 0) {
    return (
      <p aria-label="Schnellzugriff" className="text-xs text-ink-500">
        Schnellzugriff: Zuletzt geöffnete Tools erscheinen hier automatisch.
      </p>
    );
  }

  return (
    <section aria-label="Schnellzugriff"
      className="grid grid-cols-1 sm:grid-cols-[9.5rem_minmax(0,1fr)] gap-x-3 gap-y-1 sm:items-center">
      <span className="lc-overline text-ink-500">Zuletzt verwendet</span>
      <div className="flex flex-wrap gap-1.5">{zuletztKarten.map(chip)}</div>
    </section>
  );
}

// ─── Katalog: Seitenleiste (Suche/Übersicht/Filter) + Kachel-Raster ─────────

export function Katalog({ karten, filterBereich = false, filterArt = false }: {
  karten: CalculatorCard[];
  filterBereich?: boolean;
  filterArt?: boolean;
}) {
  // ── URL-Zustand: Tab Verfügbar/Katalog + offenes Gebiet (teilbar) ──
  const [searchParams, setSearchParams] = useSearchParams();
  const ansicht: 'verfuegbar' | 'katalog' =
    searchParams.get('ansicht') === 'katalog' ? 'katalog' : 'verfuegbar';
  const offenGebiet = searchParams.get('gebiet');
  const patchParams = (patch: Record<string, string | null>) => {
    const p = new URLSearchParams(searchParams);
    for (const [key, wert] of Object.entries(patch)) {
      if (wert === null) p.delete(key); else p.set(key, wert);
    }
    setSearchParams(p);
  };
  const setAnsicht = (a: 'verfuegbar' | 'katalog') =>
    patchParams({ ansicht: a === 'katalog' ? 'katalog' : null });
  const toggleGebiet = (id: string) =>
    patchParams({ gebiet: offenGebiet === id ? null : id });

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

  // «/» fokussiert das Suchfeld (Etappe 1.4) — kein neues UI-Muster, nur das
  // bestehende Feld bedienbarer; Eingabefelder bleiben unberührt.
  const suchFeldDesktop = useRef<HTMLInputElement>(null);
  const suchFeldMobil = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key !== '/' || e.metaKey || e.ctrlKey || e.altKey) return;
      const ziel = e.target as HTMLElement | null;
      if (ziel && (/^(INPUT|TEXTAREA|SELECT)$/.test(ziel.tagName) || ziel.isContentEditable)) return;
      const feld = [suchFeldDesktop.current, suchFeldMobil.current]
        .find((el) => el && el.offsetParent !== null);
      if (feld) { e.preventDefault(); feld.focus(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

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
  const trefferSortiert = q === '' ? treffer : [...treffer].sort(
    (a, b) => (sucheRang(a, suche) ?? 9) - (sucheRang(b, suche) ?? 9));
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
  // Kompaktes Suchfeld – sitzt in der Seitenleiste (Desktop) bzw. im
  // Filter-Drawer (mobil); filtert den Katalog live (flache Trefferliste).
  const suchFeld = (ref: React.RefObject<HTMLInputElement | null>) => (
    <input
      ref={ref}
      type="search"
      value={suche}
      onChange={(e) => setSuche(e.target.value)}
      placeholder="Katalog filtern …  ( / )"
      className="lc-input h-9 py-0 text-body-s"
      aria-label="Katalog filtern"
      aria-keyshortcuts="/"
    />
  );
  // Seitenleiste = EIN Ort für alles Steuernde: Suche, Übersicht, Filter
  // (Entscheid 5.6.2026 – keine horizontale Filterleiste mehr über den Karten).
  const uebersicht = (variante: 'desktop' | 'mobil') => (
    <>
      {suchFeld(variante === 'desktop' ? suchFeldDesktop : suchFeldMobil)}
      <UebersichtGruppiert
        gruppen={gruppenSichtbar.map((x) => ({
          label: x.gr.label,
          eintraege: x.sektionen.map((sx) => ({
            id: sx.g.id, title: sx.g.name,
            anzahl: ansicht === 'verfuegbar' ? sx.karten.length : sx.karten.filter(istVerfuegbar).length || sx.karten.length,
          })),
        }))}
        aktiveSektion={offenGebiet}
        onSprung={(id) => patchParams({ gebiet: id })} />
      <FilterLeiste zusatzGruppen={zusatzGruppen} />
    </>
  );

  return (
    <div className="space-y-6">
      {/* Mobil: Suche, Übersicht & Filter in einem Drawer – Kacheln sofort da */}
      <details className="lg:hidden bg-surface border border-line rounded-xl">
        <summary className="cursor-pointer select-none list-none [&::-webkit-details-marker]:hidden px-4 py-3 flex items-center justify-between gap-2 text-body-s font-medium text-ink-700">
          <span>Suche, Filter & Übersicht</span>
          <span className="flex items-center gap-2">
            {filterAnzahl > 0 && (
              <span className="num text-xs rounded-full px-2 py-0.5 bg-brass-100 text-brass-700">{filterAnzahl} aktiv</span>
            )}
            <span aria-hidden className="text-ink-500">▾</span>
          </span>
        </summary>
        <div className="px-4 pb-4 space-y-5">
          {uebersicht('mobil')}
        </div>
      </details>

      <div className="lg:grid lg:grid-cols-[230px_minmax(0,1fr)] lg:gap-10 lg:items-start">
        {/* Schlanke Übersicht: klebt auf Desktop unter dem Header */}
        <aside className="hidden lg:block lg:sticky lg:top-28 space-y-6">
          {uebersicht('desktop')}
        </aside>

        {/* Kacheln/Treffer: ab hier beginnt das Produkt */}
        <div className="space-y-8 min-w-0">
        {/* Tabs: steuern NUR die Sichtbarkeit; Default «Verfügbar»; in der URL gespiegelt */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Tabs
            ariaLabel="Katalog-Ansicht"
            items={[
              { code: 'verfuegbar', label: `Verfügbar (${karten.filter(istVerfuegbar).length})` },
              { code: 'katalog', label: `Gesamter Katalog (${karten.length})` },
            ] as const}
            value={ansicht}
            onChange={setAnsicht}
          />
        </div>
        {/* Schnellzugriff: Zuletzt verwendet – in beiden Tabs, zeigt nur Verfügbares */}
        <Schnellzugriff zuletzt={zuletzt} onOeffnen={onOeffnen} />
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
          /* Kachel-Katalog (Auftrag David 6.6.2026): Obergruppen als ruhige
             Trenner, darunter die Gebiets-Kacheln; das angewählte Gebiet
             öffnet sich als Panel in voller Breite unter seiner Kachel-Zeile
             (col-span-full — nachfolgende Kacheln rutschen nach unten). */
          gruppenSichtbar.map((x) => (
            <section key={x.gr.id} aria-labelledby={`gruppe-${x.gr.id}`} className="space-y-5">
              <div className="flex items-center gap-4 pt-2">
                <h2 id={`gruppe-${x.gr.id}`} className="font-sans font-semibold text-ink-900 text-h3 tracking-tight whitespace-nowrap">
                  {sansAmp(x.gr.label)}
                </h2>
                <span aria-hidden className="scale-rule flex-1" />
              </div>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(min(240px,100%),1fr))] gap-4">
                {x.sektionen.map((sx) => (
                  <span key={sx.g.id} className="contents">
                    <GebietKachel gebiet={sx.g} karten={sx.karten}
                      offen={offenGebiet === sx.g.id}
                      onToggle={() => toggleGebiet(sx.g.id)} />
                    {offenGebiet === sx.g.id && (
                      <GebietPanel gebiet={sx.g} karten={sx.karten} onOeffnen={onOeffnen} />
                    )}
                  </span>
                ))}
              </div>
            </section>
          ))
        )}
        </div>
      </div>
    </div>
  );
}
