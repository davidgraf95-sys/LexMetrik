import { useEffect, useRef, useState } from 'react';
import { SEKTIONEN, RECHTSGEBIETE, RECHTSBEREICH_SEKTIONEN, istVorlageArt, type Sektion, type CalculatorCard, type Rechtsbereich } from '../lib/startseiteConfig';
import { RechnerKarte } from './RechnerKarte';
import { sansAmp } from './typografie';

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

// Relevanz einer Sektion: verfügbare Karten zuerst, dann Gesamtzahl.
const anzAktiv = (karten: CalculatorCard[]) => karten.filter((k) => k.status !== 'geplant').length;

// ─── Typ-Sektion: Editorial-Öffner + flaches Kartenraster ─────────────────

function TypSektion({ sektion, karten }: { sektion: Sektion; karten: CalculatorCard[] }) {
  const sortiert = sortiereKarten(karten);
  if (sortiert.length === 0) return null;

  return (
    <section id={sektion.id} className="scroll-mt-28">
      {/* Sektion per Mausklick ein-/ausklappbar (Disclosure); standardmässig offen. */}
      <details open className="lc-sektion group bg-surface rounded-2xl border border-line">
        <summary className="lc-disclosure block cursor-pointer select-none list-none [&::-webkit-details-marker]:hidden p-6 sm:p-10 sm:pb-6 hover:bg-brass-100/30 transition-colors motion-reduce:transition-none rounded-2xl">
          {/* Öffner: Mono-Eyebrow ohne Ziffern (konsistent zur Sidebar) +
              Serif-Titel + Lede */}
          <span className="block space-y-2">
            <span className="flex items-center justify-between gap-4">
              <span className="lc-overline text-brass-700">{sektion.title}</span>
              <span className="lc-overline text-ink-500 whitespace-nowrap inline-flex items-center gap-2">
                {/* Zähler-Einheit folgt dem Modus der Sektion (kein fixer String) */}
                <span className="num">{sortiert.length}</span> {istVorlageArt(sektion.art) ? 'Vorlagen' : 'Rechner'}
                <span aria-hidden className="text-brass-700 transition-transform motion-reduce:transition-none group-open:rotate-90 leading-none">▸</span>
              </span>
            </span>
            <h2 className="font-display font-semibold text-ink-900 text-h1 leading-tight text-balance">{sansAmp(sektion.title)}</h2>
            <span className="block text-body-l text-ink-600 max-w-reading">{sektion.lede}</span>
            <span className="scale-rule block mt-4" aria-hidden />
          </span>
        </summary>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(min(340px,100%),1fr))] gap-6 px-6 sm:px-10 pb-6 sm:pb-10 pt-2">
          {sortiert.map((c) => <RechnerKarte key={c.id} card={c} headingLevel="h3" />)}
        </div>
      </details>
    </section>
  );
}

// ─── Bereich-Sektion: zweistufig Rechtsbereich → Output-Typ ────────────────
// Gleiche Anatomie wie TypSektion (Disclosure, Eyebrow, Lede); innen die
// Output-Typen als kompakte Untergruppen — nur nicht-leere.

function BereichSektion({ bereich, karten }: {
  bereich: { code: Rechtsbereich; id: string; title: string; lede: string };
  karten: CalculatorCard[];
}) {
  const gruppen = SEKTIONEN
    .map((sx) => ({ sx, karten: sortiereKarten(karten.filter((k) => k.art === sx.art)) }))
    .filter((g) => g.karten.length > 0)
    // Relevanteste Untergruppe zuerst (verfügbare Karten, dann Gesamtzahl)
    .sort((a, b) => anzAktiv(b.karten) - anzAktiv(a.karten) || b.karten.length - a.karten.length);
  if (gruppen.length === 0) return null;

  return (
    <section id={bereich.id} className="scroll-mt-28">
      <details open className="lc-sektion group bg-surface rounded-2xl border border-line">
        <summary className="lc-disclosure block cursor-pointer select-none list-none [&::-webkit-details-marker]:hidden p-6 sm:p-10 sm:pb-6 hover:bg-brass-100/30 transition-colors motion-reduce:transition-none rounded-2xl">
          <span className="block space-y-2">
            <span className="flex items-center justify-between gap-4">
              <span className="lc-overline text-brass-700">{bereich.title}</span>
              <span className="lc-overline text-ink-500 whitespace-nowrap inline-flex items-center gap-2">
                <span className="num">{karten.length}</span> Rechner
                <span aria-hidden className="text-brass-700 transition-transform motion-reduce:transition-none group-open:rotate-90 leading-none">▸</span>
              </span>
            </span>
            <h2 className="font-display font-semibold text-ink-900 text-h1 leading-tight text-balance">{sansAmp(bereich.title)}</h2>
            <span className="block text-body-l text-ink-600 max-w-reading">{bereich.lede}</span>
            <span className="scale-rule block mt-4" aria-hidden />
          </span>
        </summary>
        <div className="px-6 sm:px-10 pb-6 sm:pb-10 pt-2 space-y-8">
          {gruppen.map((g) => (
            <div key={g.sx.id}>
              {/* Untergruppe: Output-Typ als Mono-Overline mit Haarlinie + Zähler */}
              <div className="flex items-center gap-4 mb-4">
                <h3 className="lc-overline text-ink-700">{g.sx.title}</h3>
                <div className="flex-1 h-px bg-line" />
                <span className="lc-overline num text-ink-500">{g.karten.length}</span>
              </div>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(min(340px,100%),1fr))] gap-6">
                {g.karten.map((c) => <RechnerKarte key={c.id} card={c} headingLevel="h3" />)}
              </div>
            </div>
          ))}
        </div>
      </details>
    </section>
  );
}

// ─── Filterleiste (horizontal, über dem Katalog): Suche · Status · Gebiete ──
// Die Inline-Suche FILTERT den aktiven Modus; die ⌘K-Palette navigiert global —
// bewusst getrennte Einstiege (s. STRUKTUR.md), darum hier «filtern»-Wortlaut.

export type PillGruppe = {
  label: string;
  optionen: { code: string; label: string }[];
  aktiv: Set<string>;
  toggle: (code: string) => void;
};

function FilterLeiste(props: {
  rechtsgebiete: string[];
  gebiete: Set<string>; toggleGebiet: (g: string) => void; reset: () => void;
  nurGeprueft: boolean; setNurGeprueft: (v: boolean) => void;
  suche: string; setSuche: (v: string) => void;
  zeigeRechtsgebiete: boolean;
  zusatzGruppen?: PillGruppe[];
}) {
  const { rechtsgebiete, gebiete, toggleGebiet, reset, nurGeprueft, setNurGeprueft, suche, setSuche, zeigeRechtsgebiete, zusatzGruppen } = props;
  return (
    <section aria-label="Filter" className="space-y-3">
      {/* Zeile 1: Suchfeld (flex-1) + Status-Toggle — beide auf --control-h (44px) */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <input
          type="search"
          value={suche}
          onChange={(e) => setSuche(e.target.value)}
          placeholder="Katalog filtern (Titel, Stichwort, Art. 336c) …"
          className="lc-input h-11 py-0 sm:flex-1"
          aria-label="Katalog filtern"
        />
        {/* Status: Alle (Standard, zeigt den Fahrplan) / Nur geprüfte */}
        <div className="flex h-11 items-stretch gap-1 p-1 bg-surface border border-line rounded-xl w-fit shrink-0" role="group" aria-label="Status">
          {([['Alle', false], ['Nur verfügbare', true]] as const).map(([label, wert]) => (
            <button key={label} type="button" onClick={() => setNurGeprueft(wert)}
              aria-pressed={nurGeprueft === wert}
              className={`px-3 rounded-lg text-body-s font-medium transition-all ${
                nurGeprueft === wert ? 'bg-surface-raised text-brass-700 shadow-sm border border-line' : 'text-ink-600 hover:text-ink-900'
              }`}>
              {label}
            </button>
          ))}
        </div>
      </div>
      {/* Zusatz-Filtergruppen (z. B. Rechtsbereich, Output-Typ) — gleiche Pill-Optik */}
      {(zusatzGruppen ?? []).map((gr) => (
        <div key={gr.label} className="flex flex-wrap items-center gap-2" role="group" aria-label={gr.label}>
          <span className="lc-overline text-ink-500 mr-1">{gr.label}</span>
          {gr.optionen.map((o) => {
            const an = gr.aktiv.has(o.code);
            return (
              <button key={o.code} type="button" onClick={() => gr.toggle(o.code)} aria-pressed={an}
                className={`inline-flex items-center h-9 text-xs font-medium rounded-full px-3 border transition-colors ${
                  an ? 'bg-ink-900 text-paper border-ink-900' : 'bg-surface text-ink-700 border-line hover:border-brass-400 hover:bg-brass-100/50'
                }`}>
                {o.label}
              </button>
            );
          })}
        </div>
      ))}
      {/* Zeile 2: Rechtsgebiet-Pills auf --pill-h (36px), umbrechend */}
      {zeigeRechtsgebiete && <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Rechtsgebiete">
        {rechtsgebiete.map((g) => {
          const an = gebiete.has(g);
          return (
            <button key={g} type="button" onClick={() => toggleGebiet(g)} aria-pressed={an}
              className={`inline-flex items-center h-9 text-xs font-medium rounded-full px-3 border transition-colors ${
                an
                  ? 'bg-ink-900 text-paper border-ink-900'
                  : 'bg-surface text-ink-700 border-line hover:border-brass-400 hover:bg-brass-100/50'
              }`}>
              {g}
            </button>
          );
        })}
        {gebiete.size > 0 && (
          <button type="button" onClick={reset}
            className="inline-flex items-center h-9 text-xs text-brass-700 hover:text-brass-600 px-1">
            Zurücksetzen
          </button>
        )}
      </div>}
    </section>
  );
}

// ─── Übersicht (schlanke Seitenleiste): Sprungmarken mit Scrollspy + Legende ─

function Uebersicht(props: {
  sprungmarken: { id: string; numeral: string; title: string; anzahl: number }[];
  aktiveSektion: string | null;
}) {
  const { sprungmarken, aktiveSektion } = props;
  return (
    <div className="space-y-5">
      {sprungmarken.length > 0 && (
        <nav aria-label="Sektionen" className="space-y-1">
          <p className="lc-overline mb-2">Übersicht</p>
          {sprungmarken.map((s) => {
            const aktiv = s.id === aktiveSektion;
            return (
              <a key={s.id} href={`#${s.id}`} aria-current={aktiv ? 'true' : undefined}
                className={`relative flex items-baseline justify-between gap-2 px-2 py-1 -mx-2 rounded-md text-body-s no-underline transition-colors ${
                  aktiv ? 'bg-brass-100/60 text-ink-900 font-medium' : 'text-ink-600 hover:text-ink-900 hover:bg-brass-100/40'
                }`}>
                {aktiv && <span aria-hidden className="absolute left-0 top-1 bottom-1 w-[3px] rounded-full bg-brass-500" />}
                {/* ohne Nummern — die Config-Numerale sprängen bei leeren Sektionen (I, II, IV) */}
                <span className="truncate pl-1">{s.title}</span>
                <span className="num text-xs text-ink-500">{s.anzahl}</span>
              </a>
            );
          })}
        </nav>
      )}

      {/* Status-Legende (drei Zustände) */}
      <p className="text-micro leading-relaxed text-ink-500 pt-2 border-t border-line">
        <span aria-hidden className="inline-block align-[-1px] w-3.5 h-2.5 mr-1 rounded-[2px] bg-surface-raised border border-line border-t-2 border-t-warn-500" />
        orange = Entwurf (ungeprüft) ·{' '}
        <span aria-hidden className="inline-block align-[-1px] w-3.5 h-2.5 mr-1 rounded-[2px] bg-surface-raised border border-line opacity-50" />
        gedämpft = in Vorbereitung ·{' '}
        <span aria-hidden className="inline-block align-[-1px] w-3.5 h-2.5 mr-1 rounded-[2px] bg-surface-raised border border-line border-t-2 border-t-brass-500" />
        Goldrand = geprüft
      </p>
    </div>
  );
}

// ─── Katalog: klebende Seitenleiste (Filter/Übersicht) + Sektionen ──────────
// `sektionen` bestimmt die Gliederung (Rechner-Output-Typen bzw. Dokument-Typen).
// `seitenleisteFuss` ist ein Slot für seitenspezifische Elemente (Direkteinstieg);
// die Modus-Weiche sitzt seitenseitig prominent UNTER dem Hero (IA-Entscheid).

export function Katalog({ karten, sektionen = SEKTIONEN, gliederung = 'art', filterRechtsgebiet = true, filterBereich = false, filterArt = false, seitenleisteFuss }: {
  karten: CalculatorCard[];
  sektionen?: Sektion[];
  // 'art' = flache Output-/Dokumenttyp-Sektionen · 'bereich' = zweistufig
  // Rechtsbereich → Output-Typ (/pro, Modus Rechner)
  gliederung?: 'art' | 'bereich';
  filterRechtsgebiet?: boolean;
  filterBereich?: boolean;
  filterArt?: boolean;
  seitenleisteFuss?: React.ReactNode;
}) {
  const [gebiete, setGebiete] = useState<Set<string>>(new Set());
  const [bereiche, setBereiche] = useState<Set<string>>(new Set());
  const [arten, setArten] = useState<Set<string>>(new Set());
  const [nurGeprueft, setNurGeprueft] = useState(false);
  const [suche, setSuche] = useState('');

  const toggleIn = (set: (f: (alt: Set<string>) => Set<string>) => void) => (g: string) =>
    set((alt) => {
      const neu = new Set(alt);
      if (neu.has(g)) neu.delete(g); else neu.add(g);
      return neu;
    });
  const toggleGebiet = toggleIn(setGebiete);
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

  // Nur Filterwerte anbieten, die in dieser Stufe auch vorkommen (Katalog-Reihenfolge).
  const rechtsgebiete = RECHTSGEBIETE.filter((g) => karten.some((k) => k.rechtsgebiet === g));

  const treffer = karten.filter(passt);
  const filterAktiv = q !== '' || gebiete.size > 0 || bereiche.size > 0 || arten.size > 0 || nurGeprueft;
  const allesZuruecksetzen = () => { setSuche(''); setGebiete(new Set()); setBereiche(new Set()); setArten(new Set()); setNurGeprueft(false); };

  // Sichtbare Sektionen, nach Relevanz sortiert (verfügbare Karten zuerst,
  // dann Gesamtzahl; Config-Reihenfolge als stabiler Tiebreak). Sprungmarken
  // und Rendering teilen dieselbe Reihenfolge.
  const bereichSichtbar = RECHTSBEREICH_SEKTIONEN
    .map((b) => ({ b, karten: treffer.filter((k) => k.rechtsbereich === b.code) }))
    .filter((x) => x.karten.length > 0)
    .sort((x, y) => anzAktiv(y.karten) - anzAktiv(x.karten) || y.karten.length - x.karten.length);
  const artSichtbar = sektionen
    .map((sx) => ({ sx, karten: treffer.filter((k) => k.art === sx.art) }))
    .filter((x) => x.karten.length > 0)
    .sort((x, y) => anzAktiv(y.karten) - anzAktiv(x.karten) || y.karten.length - x.karten.length);

  const sprungmarken = (gliederung === 'bereich'
    ? bereichSichtbar.map((x) => ({ id: x.b.id, numeral: '', title: x.b.title, anzahl: x.karten.length }))
    : artSichtbar.map((x) => ({ id: x.sx.id, numeral: x.sx.numeral, title: x.sx.title, anzahl: x.karten.length }))
  );

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
      // oben Headerhöhe ausblenden, unten 55 % — «aktiv» ist, was oben im Viewport liegt
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
    ...(filterArt ? [{
      label: 'Output-Typ',
      optionen: sektionen.filter((sx) => karten.some((k) => k.art === sx.art))
        .map((sx) => ({ code: sx.art as string, label: sx.title })),
      aktiv: arten, toggle: toggleArt,
    }] : []),
  ];
  const filterLeiste = (
    <FilterLeiste
      rechtsgebiete={rechtsgebiete}
      gebiete={gebiete} toggleGebiet={toggleGebiet} reset={() => setGebiete(new Set())}
      nurGeprueft={nurGeprueft} setNurGeprueft={setNurGeprueft}
      suche={suche} setSuche={setSuche}
      zeigeRechtsgebiete={filterRechtsgebiet}
      zusatzGruppen={zusatzGruppen}
    />
  );
  const uebersicht = (
    <>
      <Uebersicht sprungmarken={sprungmarken} aktiveSektion={aktiveSektion} />
      {seitenleisteFuss}
    </>
  );

  return (
    <div className="space-y-6">
      {/* Horizontale Filterleiste über dem Katalog (Desktop) */}
      <div className="hidden lg:block">{filterLeiste}</div>

      {/* Mobil: Filter & Übersicht in einem Drawer — die Karten stehen sofort da */}
      <details className="lg:hidden bg-surface border border-line rounded-xl">
        <summary className="cursor-pointer select-none list-none [&::-webkit-details-marker]:hidden px-4 py-3 flex items-center justify-between gap-2 text-body-s font-medium text-ink-700">
          <span>Filter & Übersicht</span>
          <span className="flex items-center gap-2">
            {filterAnzahl > 0 && (
              <span className="num text-xs rounded-full px-2 py-0.5 bg-brass-100 text-brass-700">{filterAnzahl} aktiv</span>
            )}
            <span aria-hidden className="text-ink-500">▾</span>
          </span>
        </summary>
        <div className="px-4 pb-4 space-y-5">
          {filterLeiste}
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
        ) : gliederung === 'bereich' ? (
          /* Zweistufig: Rechtsbereich → Output-Typ, relevanteste zuerst */
          bereichSichtbar.map((x) => (
            <BereichSektion key={x.b.id} bereich={x.b} karten={x.karten} />
          ))
        ) : (
          /* Sektionen (datengetrieben), relevanteste zuerst */
          artSichtbar.map((x) => (
            <TypSektion key={x.sx.id} sektion={x.sx} karten={x.karten} />
          ))
        )}
        </div>
      </div>
    </div>
  );
}
