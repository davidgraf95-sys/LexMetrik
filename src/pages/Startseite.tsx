import { Link } from 'react-router-dom';
import { SEKTIONEN, ALLE_KARTEN } from '../lib/startseiteConfig';
import { Katalog, SectionHead } from '../components/Katalog';

// Basis-Seite: zeigt nur die allgemeinen Rechner (tier 'frei').
// Spezialisierte Rechner stehen im Experten-Panel unter /fachpersonen.

// Teaser für das Experten-Panel — invertierte Ink-Fläche mit Messing-Akzenten
// («Pro»-Signal), Highlight-Chips und Kennzahlen aus der zentralen Config.
function ExpertenTeaser() {
  const experte = ALLE_KARTEN.filter((k) => k.tier === 'experte');
  const geprueft = experte.filter((k) => k.status === 'geprüft');
  const highlights = [
    ...geprueft.map((k) => k.title),
    'Rechtsmittelfristen Bundesgericht', 'Strafrechtliche Verjährung', 'Arrest — Prosequierungsfristen',
  ].slice(0, 6);

  return (
    <section className="relative overflow-hidden rounded-2xl p-8 sm:p-12" style={{ background: 'var(--ink-900)' }}>
      {/* Messskala als Ablesekante auf dunklem Grund */}
      <span className="scale-rule absolute left-8 right-8 top-0" aria-hidden />
      <div className="max-w-reading space-y-4">
        <p className="lc-overline" style={{ color: 'var(--brass-300)' }}>Experten-Panel</p>
        <h2 className="font-display font-semibold text-h1 leading-tight" style={{ color: 'var(--paper)' }}>
          Werkzeuge für die anwaltliche Praxis.
        </h2>
        <p className="text-body-l" style={{ color: 'var(--ink-300)' }}>
          Verfahrens- und Rechtsmittelfristen, Verjährung, Betreibung und Konkurs, Zuständigkeit —
          derselbe nachvollziehbare Rechenweg, zugeschnitten auf Fachpersonen.
        </p>
        <div className="flex flex-wrap gap-1.5 pt-1">
          {highlights.map((t) => (
            <span key={t} className="rounded-full px-3 py-1 text-body-s"
              style={{ color: 'var(--paper)', boxShadow: 'inset 0 0 0 1px color-mix(in srgb, var(--paper) 25%, transparent)' }}>
              {t}
            </span>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-3">
          <Link to="/fachpersonen" className="lc-btn-brass no-underline">Zum Experten-Panel →</Link>
          <p className="num text-body-s" style={{ color: 'var(--ink-400)' }}>
            {experte.length} Rechner · {geprueft.length} geprüft
          </p>
        </div>
      </div>
    </section>
  );
}

export function Startseite() {
  const karten = ALLE_KARTEN.filter((k) => k.tier === 'frei');
  // Sprungmarken nur für Sektionen, die auf dieser Stufe Karten haben
  const sektionen = SEKTIONEN.filter((s) => karten.some((k) => k.art === s.art));

  return (
    <div className="space-y-16">
      {/* Hero */}
      <section className="space-y-5 max-w-reading">
        <h1 className="font-display font-semibold text-ink-900 leading-[1.05] text-[2.5rem] sm:text-display">
          Schweizer Rechtsfristen und Ansprüche — transparent berechnet.
        </h1>
        <p className="text-body-l text-ink-600">
          Lexmetrik berechnet Fristen und Ansprüche nach Schweizer Recht — mit nachvollziehbarem
          Rechenweg und exakten Normverweisen. Jeder Schritt ist überprüfbar, jede angewandte Norm
          direkt mit dem Gesetzestext verlinkt.
        </p>
        {/* Differenzierung: Berechnung statt KI */}
        <p className="text-body-s text-ink-500">
          Lexmetrik rät nicht — es rechnet. Feste Rechenregeln statt Sprachmodell: gleiche Eingaben
          ergeben immer dasselbe Ergebnis.
        </p>
        {/* Eyebrow als Sprungmarken zu den Sektionen */}
        <nav aria-label="Sektionen" className="lc-overline flex flex-wrap gap-x-2 gap-y-1 pt-1">
          {sektionen.map((s, i) => (
            <span key={s.id} className="inline-flex gap-x-2">
              {i > 0 && <span aria-hidden className="text-ink-300">·</span>}
              <a href={`#${s.id}`} className="text-ink-500 hover:text-brass-700 no-underline">{s.title}</a>
            </span>
          ))}
        </nav>
      </section>

      {/* Katalog der Basis-Stufe */}
      <Katalog karten={karten} />

      {/* Experten-Panel-Teaser: invertierte Fläche als Signal für die Pro-Stufe */}
      <ExpertenTeaser />

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
