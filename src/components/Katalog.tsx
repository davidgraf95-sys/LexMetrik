import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { SEKTIONEN, VORLAGE_SEKTIONEN, RECHTSGEBIETE, RECHTSGEBIET_SEKTIONEN, RECHTSBEREICH_SEKTIONEN, istVerfuegbar, karte, type CalculatorCard } from '../lib/startseiteConfig';
import { RECHTSBEREICH_GRUPPEN } from '../lib/rechtsbereichGruppen';
import { ladeFavoriten, toggleFavorit, ladeZuletzt, merkeZuletzt } from '../lib/schnellzugriff';
import { RechnerKarte } from './RechnerKarte';
import { sansAmp } from './typografie';
import { Tabs } from './ui/Tabs';

// Gemeinsamer Rechner-Katalog (Filterleiste + vier Typ-Sektionen) für die
// Free-Seite (/) und Pro (/pro). Die übergebene
// Kartenmenge bestimmt die Stufe; Filterlogik und Anatomie sind identisch.

export function SectionHead({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-4">
      <h2 className="lc-overline text-ink-700">{children}</h2>
      <div className="flex-1 h-px bg-line" />
    </div>
  );
}

// ─── Karten-Sortierung: nach Rechtsgebiet geclustert ────────────────────────
// Alle Karten desselben Rechtsgebiets stehen zusammen (z. B. Erbrecht);
// Gebiete MIT verfügbaren (nicht-geplanten) Karten zuerst, danach übrige —
// jeweils in RECHTSGEBIETE-Reihenfolge; innerhalb des Gebiets verfügbare vor
// geplanten. Deterministisch und datengetrieben.

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

// ─── Gebiet-Sektion: Rechtsgebiet → Untergruppen «Rechner» und «Vorlagen» ───
// Primäre Gliederung gemäss Auftrag «Katalog-Ausbau» §4 (feste Reihenfolge,
// keine Relevanz-Sortierung); gleiche Disclosure-Anatomie wie die übrigen
// Sektionen. Nur nicht-leere Untergruppen werden angezeigt.

function GebietSektion({ gebiet, karten, erzwungenOffen, startOffen = false, proZaehler = false, favoriten, onFavorit, onOeffnen }: {
  gebiet: { name: string; id: string; lede: string };
  karten: CalculatorCard[];
  /** Suche/Filter aktiv oder Sprungmarke geklickt → Sektion aufklappen. */
  erzwungenOffen?: boolean;
  /** Pro: Verfügbar-Tab = offen; Katalog-Tab = offen, wenn Verfügbares da. */
  startOffen?: boolean;
  /** Pro: Zähler «X verfügbar · Y in Vorbereitung» statt «N Einträge». */
  proZaehler?: boolean;
  favoriten?: Set<string>;
  onFavorit?: (id: string) => void;
  onOeffnen?: (id: string) => void;
}) {
  // Free: initial zugeklappt (Entscheid 5.6.2026); Pro steuert über
  // startOffen (Tab-Wechsel remountet via key → Zustand frisch).
  const [offen, setOffen] = useState(startOffen);
  const istOffen = offen || !!erzwungenOffen;

  const gruppen = ([
    { id: 'rechner', titel: 'Rechner', karten: karten.filter((k) => k.modus === 'rechner') },
    { id: 'vorlagen', titel: 'Vorlagen', karten: karten.filter((k) => k.modus === 'vorlage') },
  ] as const).filter((g) => g.karten.length > 0);
  if (gruppen.length === 0) return null;

  return (
    <section id={gebiet.id} className="scroll-mt-28">
      <details open={istOffen} onToggle={(e) => setOffen(e.currentTarget.open)}
        className="lc-sektion group bg-surface rounded-2xl border border-line">
        <summary className="lc-disclosure block cursor-pointer select-none list-none [&::-webkit-details-marker]:hidden p-6 sm:p-10 sm:pb-6 hover:bg-brass-100/30 transition-colors motion-reduce:transition-none rounded-2xl">
          <span className="block space-y-2">
            <span className="flex items-center justify-between gap-4">
              <span className="lc-overline text-brass-700">{gebiet.name}</span>
              <span className="lc-overline text-ink-500 whitespace-nowrap inline-flex items-center gap-2">
                {proZaehler ? (() => {
                  const v = karten.filter(istVerfuegbar).length;
                  const g = karten.length - v;
                  return <>
                    {v > 0 && <><span className="num text-brass-700">{v}</span> verfügbar</>}
                    {v > 0 && g > 0 && ' · '}
                    {g > 0 && <><span className="num">{g}</span> in Vorbereitung</>}
                  </>;
                })() : (
                  <><span className="num">{karten.length}</span> Einträge</>
                )}
                <span aria-hidden className="text-brass-700 transition-transform motion-reduce:transition-none group-open:rotate-90 leading-none">▸</span>
              </span>
            </span>
            {/* Gebiets-Titel in der Sans (Geist) statt der Display-Serife —
                Entscheid 5.6.2026; eine Stufe kompakter (h2) */}
            <h2 className="font-sans font-semibold text-ink-900 text-h2 leading-tight text-balance tracking-tight">{sansAmp(gebiet.name)}</h2>
            <span className="block text-body-l text-ink-600 max-w-reading">{gebiet.lede}</span>
            <span className="scale-rule block mt-4" aria-hidden />
          </span>
        </summary>
        <div className="px-6 sm:px-10 pb-6 sm:pb-10 pt-2 space-y-8">
          {gruppen.map((g) => (
            <div key={g.id}>
              {/* Untergruppe: Rechner bzw. Vorlagen als Mono-Overline mit Haarlinie + Zähler */}
              <div className="flex items-center gap-4 mb-4">
                <h3 className="lc-overline text-ink-700">{g.titel}</h3>
                <div className="flex-1 h-px bg-line" />
                <span className="lc-overline num text-ink-500">{g.karten.length}</span>
              </div>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(min(340px,100%),1fr))] gap-6">
                {/* innerhalb der Gruppe: verfügbare vor geplanten (sortiereKarten) */}
                {sortiereKarten(g.karten).map((c) => (
                  <RechnerKarte key={c.id} card={c} headingLevel="h3"
                    favorit={favoriten?.has(c.id)}
                    onFavorit={onFavorit && istVerfuegbar(c) ? () => onFavorit(c.id) : undefined}
                    onOeffnen={onOeffnen ? () => onOeffnen(c.id) : undefined} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </details>
    </section>
  );
}

// ─── Filterleiste (horizontal, über dem Katalog): Status · Filtergruppen ────
// Die Suche sitzt kompakt in der Seitenleiste (Entscheid 5.6.2026; die
// frühere ⌘K-Palette ist entfernt) und FILTERT den Katalog.

export type PillGruppe = {
  label: string;
  optionen: { code: string; label: string }[];
  aktiv: Set<string>;
  toggle: (code: string) => void;
};

function FilterLeiste(props: {
  nurGeprueft: boolean; setNurGeprueft: (v: boolean) => void;
  zusatzGruppen?: PillGruppe[];
  /** Pro: Status-Schnitt entfällt – die Katalog-Tabs übernehmen ihn. */
  ohneStatus?: boolean;
}) {
  const { nurGeprueft, setNurGeprueft, zusatzGruppen, ohneStatus } = props;
  return (
    <section aria-label="Filter" className="space-y-4">
      {/* Status: Alle (Standard, zeigt den Fahrplan) / Nur verfügbare */}
      {!ohneStatus && <div role="group" aria-label="Status">
        <p className="lc-overline mb-1.5">Status</p>
        <Tabs
          groesse="s"
          mode="pressed"
          items={[
            { code: 'alle', label: 'Alle' },
            { code: 'nur', label: 'Nur verfügbare' },
          ] as const}
          value={nurGeprueft ? 'nur' : 'alle'}
          onChange={(code) => setNurGeprueft(code === 'nur')}
        />
      </div>}
      {/* Filtergruppen (Rechtsbereich, Output-/Dokument-Typ) – kompakte Pills */}
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

// ─── Gruppierte Übersicht (Pro): Obergruppe als Überschrift, Gebiete darunter ─

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
              <a key={s.id} href={`#${s.id}`} aria-current={aktiv ? 'true' : undefined}
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

// ─── Schnellzugriff (Pro): Favoriten + Zuletzt verwendet ────────────────────
// Zeigt NUR Verfügbares (defensiv gegen entfernte IDs via karte()-Lookup).

function Schnellzugriff(props: {
  favoriten: Set<string>;
  zuletzt: string[];
  onOeffnen: (id: string) => void;
}) {
  const { favoriten, zuletzt, onOeffnen } = props;
  const aufloesen = (ids: string[]) =>
    ids.map((id) => karte(id)).filter((k): k is NonNullable<ReturnType<typeof karte>> =>
      !!k && istVerfuegbar(k) && !!k.href);
  const favKarten = aufloesen([...favoriten]);
  const zuletztKarten = aufloesen(zuletzt.filter((id) => !favoriten.has(id))).slice(0, 6);

  const chip = (k: NonNullable<ReturnType<typeof karte>>) => (
    <Link key={k.id} to={k.href!} onClick={() => onOeffnen(k.id)}
      className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-line bg-surface-raised text-body-s text-ink-900 no-underline hover:border-brass-400 hover:bg-brass-100/40 transition-colors">
      {sansAmp(k.title)}
    </Link>
  );

  return (
    <section aria-label="Schnellzugriff" className="space-y-2.5">
      <div className="flex flex-wrap items-center gap-2">
        <span className="lc-overline text-ink-500 w-32 shrink-0">★ Favoriten</span>
        {favKarten.length > 0
          ? favKarten.map(chip)
          : <span className="text-body-s text-ink-500">Mit ★ markierte Tools erscheinen hier.</span>}
      </div>
      {zuletztKarten.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="lc-overline text-ink-500 w-32 shrink-0">Zuletzt verwendet</span>
          {zuletztKarten.map(chip)}
        </div>
      )}
    </section>
  );
}

// ─── Katalog: klebende Seitenleiste (Filter/Übersicht) + Sektionen ──────────
// Pro-only seit 5.6.2026: einziger Konsument ist /pro; die Free-Startseite
// rendert eine eigene flache Kachelwand (kein Katalog). Damit entfielen die
// Free-Pfade (ungruppierte Übersicht, Rechtsgebiet-Pills, `gebieteZuerst`,
// `seitenleisteFuss`) als toter Code – verhaltensneutral entfernt.
// Tabs Verfügbar/Gesamt, juristische Obergruppen, gruppierte Seitenleiste
// und Schnellzugriff sind die feste Anatomie.

export function Katalog({ karten, filterBereich = false, filterArt = false }: {
  karten: CalculatorCard[];
  filterBereich?: boolean;
  filterArt?: boolean;
}) {
  // ── Pro: Tab Verfügbar/Gesamter Katalog, in der URL gespiegelt ──
  const [searchParams, setSearchParams] = useSearchParams();
  const ansicht: 'verfuegbar' | 'katalog' =
    searchParams.get('ansicht') === 'katalog' ? 'katalog' : 'verfuegbar';
  const setAnsicht = (a: 'verfuegbar' | 'katalog') => {
    const p = new URLSearchParams(searchParams);
    if (a === 'katalog') p.set('ansicht', 'katalog'); else p.delete('ansicht');
    setSearchParams(p);
  };

  // ── Pro: Schnellzugriff (Favoriten + Zuletzt; localStorage, SSR-sicher) ──
  const [favoriten, setFavoriten] = useState<Set<string>>(() => new Set(ladeFavoriten()));
  const [zuletzt, setZuletzt] = useState<string[]>(() => ladeZuletzt());
  const onFavorit = (id: string) => setFavoriten(new Set(toggleFavorit(id)));
  const onOeffnen = (id: string) => { merkeZuletzt(id); setZuletzt(ladeZuletzt()); };
  const [gebiete, setGebiete] = useState<Set<string>>(new Set());
  const [bereiche, setBereiche] = useState<Set<string>>(new Set());
  const [arten, setArten] = useState<Set<string>>(new Set());
  const [nurGeprueft, setNurGeprueft] = useState(false);
  const [suche, setSuche] = useState('');
  // Per Sprungmarke angeklickte Sektion: wird aufgeklappt (Sektionen starten zu)
  const [sprungOffen, setSprungOffen] = useState<string | null>(null);

  const toggleIn = (set: (f: (alt: Set<string>) => Set<string>) => void) => (g: string) =>
    set((alt) => {
      const neu = new Set(alt);
      if (neu.has(g)) neu.delete(g); else neu.add(g);
      return neu;
    });
  const toggleBereich = toggleIn(setBereiche);
  const toggleArt = toggleIn(setArten);

  const q = suche.trim().toLowerCase();
  // Normverweise kompakt (ohne Leerzeichen) abgleichen, damit «Art. 335c»,
  // «Art.335c» und «335c» gleichermassen treffen.
  const qKompakt = q.replace(/\s+/g, '');
  const passt = (k: CalculatorCard) =>
    (gebiete.size === 0 || gebiete.has(k.rechtsgebiet)) &&
    (bereiche.size === 0 || bereiche.has(k.rechtsbereich)) &&
    (arten.size === 0 || arten.has(k.art)) &&
    (!nurGeprueft || k.status !== 'geplant') &&
    (q === '' ||
      [k.title, k.rechtsgebiet, ...(k.keywords ?? [])].some((t) => t.toLowerCase().includes(q)) ||
      k.norms.some((n) => n.label.toLowerCase().replace(/\s+/g, '').includes(qKompakt)));

  // Tab «Verfügbar» blendet Geplantes aus – Daten bleiben unverändert.
  const basisKarten = ansicht === 'verfuegbar' ? karten.filter(istVerfuegbar) : karten;
  const treffer = basisKarten.filter(passt);
  const filterAktiv = q !== '' || gebiete.size > 0 || bereiche.size > 0 || arten.size > 0 || nurGeprueft;
  const allesZuruecksetzen = () => { setSuche(''); setGebiete(new Set()); setBereiche(new Set()); setArten(new Set()); setNurGeprueft(false); };

  // Rechtsgebiete in FESTER Auftrags-Reihenfolge (§4 – RECHTSGEBIETE-Reihenfolge
  // pur), bewusst ohne Relevanz-Sortierung; Ordnung stabil und erwartbar.
  const gebietSichtbar = [...RECHTSGEBIET_SEKTIONEN]
    .sort((a, b) => RECHTSGEBIETE.indexOf(a.name) - RECHTSGEBIETE.indexOf(b.name))
    .map((g) => ({ g, karten: treffer.filter((k) => k.rechtsgebiet === g.name) }))
    .filter((x) => x.karten.length > 0);

  // Pro: dieselben sichtbaren Sektionen, gruppiert nach RECHTSBEREICH_GRUPPEN
  // (Gruppen-/Gebiets-Reihenfolge = Anzeigeordnung; leere Gruppen entfallen).
  const sektionFuer = new Map(gebietSichtbar.map((x) => [x.g.name, x]));
  const gruppenSichtbar = RECHTSBEREICH_GRUPPEN
    .map((gr) => ({ gr, sektionen: gr.gebiete.map((n) => sektionFuer.get(n)).filter((x): x is NonNullable<typeof x> => !!x) }))
    .filter((x) => x.sektionen.length > 0);

  const sprungmarken = gruppenSichtbar.flatMap((x) => x.sektionen)
    .map((x) => ({ id: x.g.id, numeral: '', title: x.g.name, anzahl: x.karten.length }));

  // Scrollspy: oberste sichtbare Sektion in der Übersicht markieren.
  const [aktiveSektion, setAktiveSektion] = useState<string | null>(null);
  const sichtbar = useRef(new Map<string, boolean>());
  const idsKey = sprungmarken.map((s) => s.id).join(',');
  // Initial-/Resetwert bei Filterwechsel: Render-Zeit-Anpassung statt
  // setState im Effect (verhindert kaskadierende Renders).
  const [letzterIdsKey, setLetzterIdsKey] = useState(idsKey);
  if (idsKey !== letzterIdsKey) {
    setLetzterIdsKey(idsKey);
    setAktiveSektion(idsKey ? idsKey.split(',')[0] : null);
  }
  useEffect(() => {
    const ids = idsKey ? idsKey.split(',') : [];
    sichtbar.current = new Map();
    if (ids.length === 0) return;
    const beobachter = new IntersectionObserver(
      (eintraege) => {
        eintraege.forEach((e) => sichtbar.current.set(e.target.id, e.isIntersecting));
        const erste = ids.find((id) => sichtbar.current.get(id));
        if (erste) setAktiveSektion(erste);
      },
      // oben Headerhöhe ausblenden, unten 55 % – «aktiv» ist, was oben im Viewport liegt
      { rootMargin: '-120px 0px -55% 0px' },
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) beobachter.observe(el);
    });
    return () => beobachter.disconnect();
  }, [idsKey]);

  const filterAnzahl = gebiete.size + bereiche.size + arten.size + (q !== '' ? 1 : 0) + (nurGeprueft ? 1 : 0);
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
  const filterLeiste = (
    <FilterLeiste
      nurGeprueft={nurGeprueft} setNurGeprueft={setNurGeprueft}
      zusatzGruppen={zusatzGruppen}
      ohneStatus /* Tabs Verfügbar/Gesamt übernehmen den Status-Schnitt */
    />
  );
  // Kompaktes Suchfeld – sitzt in der Seitenleiste (Desktop) bzw. im
  // Filter-Drawer (mobil); filtert den Katalog live.
  const suchFeld = (
    <input
      type="search"
      value={suche}
      onChange={(e) => setSuche(e.target.value)}
      placeholder="Katalog filtern …"
      className="lc-input h-9 py-0 text-body-s"
      aria-label="Katalog filtern"
    />
  );
  // Seitenleiste = EIN Ort für alles Steuernde: Suche, Übersicht, Filter
  // (Entscheid 5.6.2026 – keine horizontale Filterleiste mehr über den Karten).
  const uebersicht = (
    <>
      {suchFeld}
      <UebersichtGruppiert
        gruppen={gruppenSichtbar.map((x) => ({
          label: x.gr.label,
          eintraege: x.sektionen.map((sx) => ({ id: sx.g.id, title: sx.g.name, anzahl: sx.karten.length })),
        }))}
        aktiveSektion={aktiveSektion}
        onSprung={(id) => setSprungOffen(id)} />
      {filterLeiste}
    </>
  );

  return (
    <div className="space-y-6">
      {/* Mobil: Suche, Übersicht & Filter in einem Drawer – Karten sofort da */}
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
          {uebersicht}
        </div>
      </details>

      <div className="lg:grid lg:grid-cols-[230px_minmax(0,1fr)] lg:gap-10 lg:items-start">
        {/* Schlanke Übersicht: klebt auf Desktop unter dem Header */}
        <aside className="hidden lg:block lg:sticky lg:top-28 space-y-6">
          {uebersicht}
        </aside>

        {/* Karten: ab hier beginnt das Produkt */}
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
        {/* Schnellzugriff: Favoriten + Zuletzt – in beiden Tabs, zeigt nur Verfügbares */}
        <Schnellzugriff favoriten={favoriten} zuletzt={zuletzt} onOeffnen={onOeffnen} />
        {treffer.length === 0 ? (
          /* Leerer Zustand: kein stilles Verschwinden der Sektionen */
          <section className="bg-surface rounded-2xl border border-line p-10 sm:p-14 text-center space-y-3">
            <p className="lc-overline">Keine Treffer</p>
            <h2 className="font-display font-semibold text-ink-900 text-h2">
              {q !== '' ? <>Nichts gefunden für «{suche.trim()}».</> : 'Die gewählten Filter ergeben keine Treffer.'}
            </h2>
            <p className="text-body-s text-ink-500 max-w-reading mx-auto">
              Versuchen Sie einen anderen Begriff (z. B. einen Gesetzesartikel wie «Art. 336c») oder
              setzen Sie die Filter zurück.
            </p>
            {filterAktiv && (
              <button type="button" onClick={allesZuruecksetzen} className="lc-btn-outline mt-2">
                Filter zurücksetzen
              </button>
            )}
          </section>
        ) : (
          /* Pro: Obergruppen als IMMER OFFENE Super-Trenner (Landkarte),
             darunter die Gebiets-Sektionen. Verfügbar-Tab: alles offen;
             Katalog-Tab: Gebiete kollabierbar, offen wenn Verfügbares da.
             key trägt die ansicht → Tab-Wechsel remountet mit frischem
             Default (kein Stale-State des details-Elements). */
          gruppenSichtbar.map((x) => (
            <section key={x.gr.id} aria-labelledby={`gruppe-${x.gr.id}`} className="space-y-6">
              <div className="flex items-center gap-4 pt-2">
                <h2 id={`gruppe-${x.gr.id}`} className="font-sans font-semibold text-ink-900 text-h3 tracking-tight whitespace-nowrap">
                  {sansAmp(x.gr.label)}
                </h2>
                <span aria-hidden className="scale-rule flex-1" />
              </div>
              {x.sektionen.map((sx) => (
                /* Start EINGEKLAPPT (Wunsch David 5.6.2026) — die Zähler
                   «X verfügbar · Y in Vorbereitung» tragen die Übersicht;
                   Suche/Filter und Sprungmarken klappen weiterhin auf. */
                <GebietSektion key={`${sx.g.id}:${ansicht}`} gebiet={sx.g} karten={sx.karten}
                  startOffen={false}
                  proZaehler
                  erzwungenOffen={filterAktiv || sprungOffen === sx.g.id}
                  favoriten={favoriten} onFavorit={onFavorit} onOeffnen={onOeffnen} />
              ))}
            </section>
          ))
        )}
        </div>
      </div>
    </div>
  );
}
