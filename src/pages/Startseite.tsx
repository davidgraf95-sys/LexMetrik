import { Link } from 'react-router-dom';
import { SEKTIONEN, ALLE_KARTEN, type Sektion, type CalculatorCard } from '../lib/startseiteConfig';
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
    <section id={sektion.id} className="scroll-mt-20 bg-surface rounded-2xl border border-line p-6 sm:p-10 space-y-8">
      {/* Öffner: römische Monospace-Eyebrow + Serif-Titel + Lede + Haarlinie */}
      <header className="space-y-2">
        <p className="lc-overline num text-brass-700">{sektion.numeral} — {sektion.title}</p>
        <h2 className="font-display font-semibold text-ink-900 text-h1 leading-tight">{sektion.title}</h2>
        <p className="text-body-l text-ink-600 max-w-reading">{sektion.lede}</p>
        <div className="h-px bg-line mt-4" aria-hidden />
      </header>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortiert.map((c) => <RechnerKarte key={c.id} card={c} headingLevel="h3" />)}
      </div>
    </section>
  );
}

// ─── Seite ────────────────────────────────────────────────────────────────

export function Startseite() {
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
          LegalCalc berechnet Fristen und Ansprüche nach Schweizer Recht mit nachvollziehbarem
          Rechenweg und exakten Normverweisen. Orientierung statt Black Box — clientseitig und deterministisch.
        </p>
        {/* Differenzierung: Berechnung statt KI */}
        <p className="text-body-s text-ink-500">
          LegalCalc rät nicht — es rechnet. Feste Rechenregeln statt Sprachmodell, jeder Schritt offen nachvollziehbar.
        </p>
        <div className="flex flex-wrap gap-3 pt-1">
          <a href="#fristen" className="lc-btn-primary no-underline">Zu den Rechnern</a>
          <Link to="/methodik" className="lc-btn-outline no-underline">Wie LegalCalc rechnet</Link>
        </div>
      </section>

      {/* Vier Output-Typ-Sektionen (datengetrieben aus startseiteConfig) */}
      {SEKTIONEN.map((s) => (
        <TypSektion key={s.id} sektion={s} karten={ALLE_KARTEN.filter((k) => k.art === s.art)} />
      ))}

      {/* Methodik / Vertrauens-Kacheln */}
      <section className="space-y-6">
        <SectionHead>So rechnet LegalCalc</SectionHead>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { t: 'Berechnung statt KI', b: 'LegalCalc nutzt kein Sprachmodell und keine Wahrscheinlichkeiten, sondern festgelegte Rechenregeln. Gleiche Eingaben ergeben immer dasselbe Ergebnis. Jeder Schritt wird offengelegt und jede angewandte Norm direkt mit dem Gesetzestext verlinkt — so ist jedes Ergebnis überprüfbar statt geschätzt.' },
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
