import { useEffect, useRef, useState } from 'react';
import { SEKTIONEN, RECHTSGEBIETE, type Sektion, type CalculatorCard } from '../lib/startseiteConfig';
import { RechnerKarte } from './RechnerKarte';
import { sansAmp } from './typografie';

// Gemeinsamer Rechner-Katalog (Filterleiste + vier Typ-Sektionen) für die
// Basis-Seite (/) und das Experten-Panel (/fachpersonen). Die übergebene
// Kartenmenge bestimmt die Stufe; Filterlogik und Anatomie sind identisch.

export function SectionHead({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-4">
      <h2 className="lc-overline text-ink-700">{children}</h2>
      <div className="flex-1 h-px bg-line" />
    </div>
  );
}

// ─── Typ-Sektion: Editorial-Öffner + flaches Kartenraster ─────────────────
// Sortierung: geprüfte Rechner zuerst (Goldrand), danach «In Vorbereitung».

function TypSektion({ sektion, karten }: { sektion: Sektion; karten: CalculatorCard[] }) {
  const sortiert = [
    ...karten.filter((k) => k.status === 'geprüft'),
    ...karten.filter((k) => k.status === 'geplant'),
  ];
  if (sortiert.length === 0) return null;

  return (
    <section id={sektion.id} className="scroll-mt-28">
      {/* Sektion per Mausklick ein-/ausklappbar (Disclosure); standardmässig offen. */}
      <details open className="lc-sektion group bg-surface rounded-2xl border border-line">
        <summary className="lc-disclosure block cursor-pointer select-none list-none [&::-webkit-details-marker]:hidden p-6 sm:p-10 sm:pb-6 hover:bg-brass-100/30 transition-colors motion-reduce:transition-none rounded-2xl">
          {/* Öffner: römische Monospace-Eyebrow + Serif-Titel + Lede + Akzentlinie */}
          <span className="block space-y-2">
            <span className="flex items-center justify-between gap-4">
              <span className="lc-overline num text-brass-700">{sektion.numeral} — {sektion.title}</span>
              <span className="lc-overline text-ink-500 whitespace-nowrap inline-flex items-center gap-2">
                <span className="num">{sortiert.length}</span> Rechner
                <span aria-hidden className="text-brass-700 transition-transform motion-reduce:transition-none group-open:rotate-90 leading-none">▸</span>
              </span>
            </span>
            <h2 className="font-display font-semibold text-ink-900 text-h1 leading-tight">{sansAmp(sektion.title)}</h2>
            <span className="block text-body-l text-ink-600 max-w-reading">{sektion.lede}</span>
            <span className="scale-rule block mt-4" aria-hidden />
          </span>
        </summary>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 px-6 sm:px-10 pb-6 sm:pb-10 pt-2">
          {sortiert.map((c) => <RechnerKarte key={c.id} card={c} headingLevel="h3" />)}
        </div>
      </details>
    </section>
  );
}

// ─── Seitenleiste: Suche · Status · Rechtsgebiete · Sprungmarken · Legende ──
// Vertikal, auf Desktop klebend — die Karten rücken dadurch nach oben.

function Seitenleiste(props: {
  rechtsgebiete: string[];
  gebiete: Set<string>; toggleGebiet: (g: string) => void; reset: () => void;
  nurGeprueft: boolean; setNurGeprueft: (v: boolean) => void;
  suche: string; setSuche: (v: string) => void;
  sprungmarken: { id: string; numeral: string; title: string; anzahl: number }[];
  aktiveSektion: string | null;
}) {
  const { rechtsgebiete, gebiete, toggleGebiet, reset, nurGeprueft, setNurGeprueft, suche, setSuche, sprungmarken, aktiveSektion } = props;
  return (
    <section aria-label="Filter" className="space-y-5">
      <input
        type="search"
        value={suche}
        onChange={(e) => setSuche(e.target.value)}
        placeholder="Suchen (z. B. Art. 336c) …"
        className="lc-input"
        aria-label="Katalog durchsuchen"
      />

      {/* Status: Alle (Standard, zeigt den Fahrplan) / Nur geprüfte */}
      <div className="flex gap-1 p-1 bg-surface border border-line rounded-xl" role="group" aria-label="Status">
        {([['Alle', false], ['Nur geprüfte', true]] as const).map(([label, wert]) => (
          <button key={label} type="button" onClick={() => setNurGeprueft(wert)}
            aria-pressed={nurGeprueft === wert}
            className={`flex-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              nurGeprueft === wert ? 'bg-surface-raised text-brass-700 shadow-sm border border-line' : 'text-ink-600 hover:text-ink-900'
            }`}>
            {label}
          </button>
        ))}
      </div>

      {/* Sprungmarken: Übersicht über die Sektionen — Scrollspy markiert die aktive */}
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
                <span className="truncate pl-1"><span className="num text-brass-700 mr-1.5">{s.numeral}</span>{s.title}</span>
                <span className="num text-xs text-ink-500">{s.anzahl}</span>
              </a>
            );
          })}
        </nav>
      )}

      {/* Rechtsgebiete */}
      <div className="space-y-2">
        <p className="lc-overline">Rechtsgebiet</p>
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Rechtsgebiete">
          {rechtsgebiete.map((g) => {
            const an = gebiete.has(g);
            return (
              <button key={g} type="button" onClick={() => toggleGebiet(g)} aria-pressed={an}
                className={`text-xs font-medium rounded-full px-2.5 py-1 border transition-colors ${
                  an
                    ? 'bg-ink-900 text-paper border-ink-900'
                    : 'bg-surface text-ink-700 border-line hover:border-brass-400 hover:bg-brass-100/50'
                }`}>
                {g}
              </button>
            );
          })}
        </div>
        {gebiete.size > 0 && (
          <button type="button" onClick={reset}
            className="text-body-s text-brass-700 hover:text-brass-600">
            Zurücksetzen
          </button>
        )}
      </div>

      {/* Status-Legende: erklärt die Karten-Semantik einmalig */}
      <div className="space-y-1 text-xs text-ink-500 pt-1 border-t border-line">
        <p className="inline-flex items-center gap-1.5 pt-2">
          <span aria-hidden className="inline-block w-4 h-3 rounded-[3px] bg-surface-raised border border-line border-t-2 border-t-brass-500" />
          Goldrand = geprüft, sofort nutzbar
        </p>
        <p className="inline-flex items-center gap-1.5">
          <span aria-hidden className="inline-block w-4 h-3 rounded-[3px] bg-surface-raised border border-line opacity-50" />
          gedämpft = in Vorbereitung
        </p>
      </div>
    </section>
  );
}

// ─── Katalog: klebende Seitenleiste (Filter/Übersicht) + Sektionen ──────────
// `sektionen` bestimmt die Gliederung (Rechner-Output-Typen bzw. Dokument-Typen).
// `seitenleisteKopf`/`seitenleisteFuss` sind Slots für seitenspezifische
// Elemente (z. B. Modus-Umschalter, Direkteinstieg).

export function Katalog({ karten, sektionen = SEKTIONEN, seitenleisteKopf, seitenleisteFuss }: {
  karten: CalculatorCard[];
  sektionen?: Sektion[];
  seitenleisteKopf?: React.ReactNode;
  seitenleisteFuss?: React.ReactNode;
}) {
  const [gebiete, setGebiete] = useState<Set<string>>(new Set());
  const [nurGeprueft, setNurGeprueft] = useState(false);
  const [suche, setSuche] = useState('');

  const toggleGebiet = (g: string) =>
    setGebiete((alt) => {
      const neu = new Set(alt);
      if (neu.has(g)) neu.delete(g); else neu.add(g);
      return neu;
    });

  const q = suche.trim().toLowerCase();
  // Normverweise kompakt (ohne Leerzeichen) abgleichen, damit «Art. 335c»,
  // «Art.335c» und «335c» gleichermassen treffen.
  const qKompakt = q.replace(/\s+/g, '');
  const passt = (k: CalculatorCard) =>
    (gebiete.size === 0 || gebiete.has(k.rechtsgebiet)) &&
    (!nurGeprueft || k.status === 'geprüft') &&
    (q === '' ||
      [k.title, k.rechtsgebiet, ...(k.keywords ?? [])].some((t) => t.toLowerCase().includes(q)) ||
      k.norms.some((n) => n.label.toLowerCase().replace(/\s+/g, '').includes(qKompakt)));

  // Nur Filterwerte anbieten, die in dieser Stufe auch vorkommen (Katalog-Reihenfolge).
  const rechtsgebiete = RECHTSGEBIETE.filter((g) => karten.some((k) => k.rechtsgebiet === g));

  const treffer = karten.filter(passt);
  const filterAktiv = q !== '' || gebiete.size > 0 || nurGeprueft;
  const allesZuruecksetzen = () => { setSuche(''); setGebiete(new Set()); setNurGeprueft(false); };

  // Sprungmarken für die Seitenleisten-Übersicht (nur belegte Sektionen)
  const sprungmarken = sektionen
    .map((s) => ({ id: s.id, numeral: s.numeral, title: s.title, anzahl: treffer.filter((k) => k.art === s.art).length }))
    .filter((s) => s.anzahl > 0);

  // Scrollspy: oberste sichtbare Sektion in der Übersicht markieren.
  const [aktiveSektion, setAktiveSektion] = useState<string | null>(null);
  const sichtbar = useRef(new Map<string, boolean>());
  const idsKey = sprungmarken.map((s) => s.id).join(',');
  useEffect(() => {
    const ids = idsKey ? idsKey.split(',') : [];
    sichtbar.current = new Map();
    setAktiveSektion(ids[0] ?? null);
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

  return (
    <div className="lg:grid lg:grid-cols-[270px_minmax(0,1fr)] lg:gap-10 lg:items-start space-y-8 lg:space-y-0">
      {/* Seitenleiste: klebt auf Desktop unter dem Header */}
      <aside className="lg:sticky lg:top-28 space-y-6">
        {seitenleisteKopf}
        <Seitenleiste
          rechtsgebiete={rechtsgebiete}
          gebiete={gebiete} toggleGebiet={toggleGebiet} reset={() => setGebiete(new Set())}
          nurGeprueft={nurGeprueft} setNurGeprueft={setNurGeprueft}
          suche={suche} setSuche={setSuche}
          sprungmarken={sprungmarken}
          aktiveSektion={aktiveSektion}
        />
        {seitenleisteFuss}
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
        ) : (
          /* Vier Sektionen (datengetrieben aus startseiteConfig) */
          sektionen.map((s) => (
            <TypSektion key={s.id} sektion={s} karten={treffer.filter((k) => k.art === s.art)} />
          ))
        )}
      </div>
    </div>
  );
}
