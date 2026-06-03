import { useState } from 'react';
import { SEKTIONEN, ALLE_KARTEN, RECHTSGEBIETE, type Sektion, type CalculatorCard } from '../lib/startseiteConfig';
import { RechnerKarte } from '../components/RechnerKarte';

function SectionHead({ children }: { children: React.ReactNode }) {
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
    <section id={sektion.id} className="scroll-mt-20">
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
            <h2 className="font-display font-semibold text-ink-900 text-h1 leading-tight">{sektion.title}</h2>
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
  gebiete: Set<string>; toggleGebiet: (g: string) => void; reset: () => void;
  nurGeprueft: boolean; setNurGeprueft: (v: boolean) => void;
  suche: string; setSuche: (v: string) => void;
}) {
  const { gebiete, toggleGebiet, reset, nurGeprueft, setNurGeprueft, suche, setSuche } = props;
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
        {RECHTSGEBIETE.map((g) => {
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

// ─── Seite ────────────────────────────────────────────────────────────────

export function Startseite() {
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

  return (
    <div className="space-y-16">
      {/* Hero */}
      <section className="space-y-5 max-w-reading">
        {/* Eyebrow als Sprungmarken zu den vier Sektionen */}
        <nav aria-label="Sektionen" className="lc-overline flex flex-wrap gap-x-2 gap-y-1">
          {SEKTIONEN.map((s, i) => (
            <span key={s.id} className="inline-flex gap-x-2">
              {i > 0 && <span aria-hidden className="text-ink-300">·</span>}
              <a href={`#${s.id}`} className="text-ink-500 hover:text-brass-700 no-underline">{s.title}</a>
            </span>
          ))}
        </nav>
        <h1 className="font-display font-semibold text-ink-900 leading-[1.05] text-[2.5rem] sm:text-display">
          Schweizer Rechtsfristen und Ansprüche — transparent berechnet.
        </h1>
        <p className="text-body-l text-ink-600">
          Lexmetrik berechnet Fristen und Ansprüche nach Schweizer Recht mit nachvollziehbarem
          Rechenweg und exakten Normverweisen. Orientierung statt Black Box — clientseitig und deterministisch.
        </p>
        {/* Differenzierung: Berechnung statt KI */}
        <p className="text-body-s text-ink-500">
          Lexmetrik rät nicht — es rechnet. Feste Rechenregeln statt Sprachmodell, jeder Schritt offen nachvollziehbar.
        </p>
      </section>

      {/* Filter (clientseitig); leere Sektionen werden ausgeblendet */}
      <Filterleiste
        gebiete={gebiete} toggleGebiet={toggleGebiet} reset={() => setGebiete(new Set())}
        nurGeprueft={nurGeprueft} setNurGeprueft={setNurGeprueft}
        suche={suche} setSuche={setSuche}
      />

      {/* Vier Output-Typ-Sektionen (datengetrieben aus startseiteConfig) */}
      {SEKTIONEN.map((s) => (
        <TypSektion key={s.id} sektion={s} karten={ALLE_KARTEN.filter((k) => k.art === s.art && passt(k))} />
      ))}

      {/* Methodik / Vertrauens-Kacheln */}
      <section className="space-y-6">
        <SectionHead>So rechnet Lexmetrik</SectionHead>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { t: 'Berechnung statt KI', b: 'Lexmetrik nutzt kein Sprachmodell und keine Wahrscheinlichkeiten, sondern festgelegte Rechenregeln. Gleiche Eingaben ergeben immer dasselbe Ergebnis. Jeder Schritt wird offengelegt und jede angewandte Norm direkt mit dem Gesetzestext verlinkt — so ist jedes Ergebnis überprüfbar statt geschätzt.' },
            { t: 'Verifizierte Normverweise', b: 'Nur explizit genannte, geprüfte Gesetzesartikel werden fest verdrahtet. Rechtsprechung trägt einen Verifikations-Vorbehalt.' },
            { t: 'Nachvollziehbarer Rechenweg', b: 'Jeder Schritt zeigt Eingangsgrössen, angewandte Norm und Zwischenergebnis — vollständig im PDF-Bericht.' },
            { t: 'Praxis statt Schublade', b: 'Kantonale Skalen und Gerichtspraxis werden als solche gekennzeichnet und sind vor Produktiveinsatz zu prüfen.' },
          ].map((c) => (
            <div key={c.t} className="lc-card p-5">
              <h3 className="text-body-l font-semibold text-ink-900 mb-1 font-sans">{c.t}</h3>
              <p className="text-body-s text-ink-500 leading-relaxed">{c.b}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Rechtlicher Hinweis */}
      <section className="lc-notice">
        <p className="lc-overline mb-1">Rechtlicher Hinweis</p>
        <p className="text-body-s text-ink-600 max-w-reading">
          Alle Rechner liefern automatisierte Orientierungsberechnungen und keine Rechtsberatung. Massgeblich
          sind Gesetz, GAV, Vertrag und der konkrete Sachverhalt. Für die Wahrung einer Frist im Einzelfall ist
          allein die nutzende Person verantwortlich.
        </p>
      </section>
    </div>
  );
}
