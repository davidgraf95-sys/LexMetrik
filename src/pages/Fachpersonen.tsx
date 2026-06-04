import { Link } from 'react-router-dom';
import { ALLE_KARTEN } from '../lib/startseiteConfig';
import { Katalog } from '../components/Katalog';

// Experten-Panel: alle Rechner der Stufe 'experte' (anwaltliche Praxis).
// Gleiches visuelles System und gleiche Filterlogik wie die Basis-Seite.

export function Fachpersonen() {
  const karten = ALLE_KARTEN.filter((k) => k.tier === 'experte');

  return (
    <div className="space-y-16">
      {/* Kopf */}
      <section className="space-y-5 max-w-reading">
        <p className="lc-overline">Experten-Panel</p>
        <h1 className="font-display font-semibold text-ink-900 leading-[1.05] text-[2.5rem] sm:text-display">
          Rechner für Fachpersonen.
        </h1>
        <p className="text-body-l text-ink-600">
          Spezialisierte Berechnungen für die anwaltliche und gerichtliche Praxis — Verfahrens- und
          Rechtsmittelfristen, Verjährung, Betreibung und Konkurs, Zuständigkeit und mehr. Mit
          nachvollziehbarem Rechenweg und exakten Normverweisen wie auf der Basis-Stufe.
        </p>
        <p className="text-body-s text-ink-500">
          Die allgemeinen Rechner finden Sie auf der{' '}
          <Link to="/" className="text-brass-700 hover:text-brass-600 no-underline font-medium">Startseite →</Link>
        </p>
      </section>

      {/* Katalog der Experten-Stufe */}
      <Katalog karten={karten} />

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
