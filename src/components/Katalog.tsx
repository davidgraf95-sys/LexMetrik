import { useState } from 'react';
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
      <details open className="group bg-surface rounded-2xl border border-line">
        <summary className="lc-disclosure block cursor-pointer select-none list-none [&::-webkit-details-marker]:hidden p-6 sm:p-10 sm:pb-6 hover:bg-brass-100/30 transition-colors motion-reduce:transition-none rounded-2xl">
          {/* Öffner: römische Monospace-Eyebrow + Serif-Titel + Lede + Haarlinie */}
          <span className="block space-y-2">
            <span className="flex items-center justify-between gap-4">
              <span className="lc-overline num text-brass-700">{sektion.numeral} — {sektion.title}</span>
              <span className="lc-overline text-ink-400 whitespace-nowrap inline-flex items-center gap-2">
                <span className="num">{sortiert.length}</span> Rechner
                <span aria-hidden className="text-brass-700 transition-transform motion-reduce:transition-none group-open:rotate-90 leading-none">▸</span>
              </span>
            </span>
            <h2 className="font-display font-semibold text-ink-900 text-h1 leading-tight">{sansAmp(sektion.title)}</h2>
            <span className="block text-body-l text-ink-600 max-w-reading">{sektion.lede}</span>
            <span className="scale-rule block mt-4" aria-hidden />
          </span>
        </summary>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-6 sm:px-10 pb-6 sm:pb-10 pt-2">
          {sortiert.map((c) => <RechnerKarte key={c.id} card={c} headingLevel="h3" />)}
        </div>
      </details>
    </section>
  );
}

// ─── Filterleiste: Rechtsgebiet (Mehrfachauswahl) · Status · Freitextsuche ─

function Filterleiste(props: {
  rechtsgebiete: string[];
  gebiete: Set<string>; toggleGebiet: (g: string) => void; reset: () => void;
  nurGeprueft: boolean; setNurGeprueft: (v: boolean) => void;
  suche: string; setSuche: (v: string) => void;
}) {
  const { rechtsgebiete, gebiete, toggleGebiet, reset, nurGeprueft, setNurGeprueft, suche, setSuche } = props;
  return (
    <section aria-label="Filter" className="space-y-4">
      <SectionHead>Rechner filtern</SectionHead>
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <input
          type="search"
          value={suche}
          onChange={(e) => setSuche(e.target.value)}
          placeholder="Suchen (z. B. Kündigung, Verjährung, Betreibung) …"
          className="lc-input sm:max-w-sm"
          aria-label="Rechner durchsuchen"
        />
        {/* Status: Alle (Standard, zeigt den Fahrplan) / Nur geprüfte */}
        <div className="flex gap-1 p-1 bg-surface rounded-xl w-fit" role="group" aria-label="Status">
          {([['Alle', false], ['Nur geprüfte', true]] as const).map(([label, wert]) => (
            <button key={label} type="button" onClick={() => setNurGeprueft(wert)}
              aria-pressed={nurGeprueft === wert}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                nurGeprueft === wert ? 'bg-surface-raised text-brass-700 shadow-sm border border-line' : 'text-ink-600 hover:text-ink-900'
              }`}>
              {label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Rechtsgebiete">
        {rechtsgebiete.map((g) => {
          const an = gebiete.has(g);
          return (
            <button key={g} type="button" onClick={() => toggleGebiet(g)} aria-pressed={an}
              className={`text-body-s font-medium rounded-full px-3.5 py-1.5 border transition-colors ${
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
            className="text-body-s text-brass-700 hover:text-brass-600 px-2 py-1.5">
            Zurücksetzen
          </button>
        )}
      </div>
    </section>
  );
}

// ─── Katalog: Filter + Sektionen über der übergebenen Kartenmenge ──────────
// `sektionen` bestimmt die Gliederung (Rechner-Output-Typen bzw. Dokument-Typen).

export function Katalog({ karten, sektionen = SEKTIONEN }: { karten: CalculatorCard[]; sektionen?: Sektion[] }) {
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
  const passt = (k: CalculatorCard) =>
    (gebiete.size === 0 || gebiete.has(k.rechtsgebiet)) &&
    (!nurGeprueft || k.status === 'geprüft') &&
    (q === '' ||
      [k.title, k.rechtsgebiet, ...(k.keywords ?? [])].some((t) => t.toLowerCase().includes(q)));

  // Nur Filterwerte anbieten, die in dieser Stufe auch vorkommen (Katalog-Reihenfolge).
  const rechtsgebiete = RECHTSGEBIETE.filter((g) => karten.some((k) => k.rechtsgebiet === g));

  return (
    <>
      {/* Filter (clientseitig); leere Sektionen werden ausgeblendet */}
      <Filterleiste
        rechtsgebiete={rechtsgebiete}
        gebiete={gebiete} toggleGebiet={toggleGebiet} reset={() => setGebiete(new Set())}
        nurGeprueft={nurGeprueft} setNurGeprueft={setNurGeprueft}
        suche={suche} setSuche={setSuche}
      />

      {/* Vier Sektionen (datengetrieben aus startseiteConfig) */}
      {sektionen.map((s) => (
        <TypSektion key={s.id} sektion={s} karten={karten.filter((k) => k.art === s.art && passt(k))} />
      ))}
    </>
  );
}
