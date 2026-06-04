import { ALLE_KARTEN, RECHTSGEBIETE } from '../lib/startseiteConfig';
import { Katalog } from '../components/Katalog';
import { StufenSchalter } from '../components/StufenSchalter';

// Experten-Panel: alle Rechner der Stufe 'experte' (anwaltliche Praxis).
// Invertiertes Ink-Hero mit Kennzahlen als «Pro»-Signal; Katalog und
// Filterlogik identisch zur Basis-Seite.

export function Fachpersonen() {
  const karten = ALLE_KARTEN.filter((k) => k.tier === 'experte');
  const geprueft = karten.filter((k) => k.status === 'geprüft').length;
  const gebiete = RECHTSGEBIETE.filter((g) => karten.some((k) => k.rechtsgebiet === g)).length;

  return (
    <div className="space-y-16">
      {/* Stufenwahl + dunkles Hero */}
      <div className="space-y-5">
        <StufenSchalter />
        <section className="relative overflow-hidden rounded-2xl p-8 sm:p-12" style={{ background: 'var(--ink-900)' }}>
          {/* Messskala als Ablesekante auf dunklem Grund */}
          <span className="scale-rule absolute left-8 right-8 top-0" aria-hidden />
          <div className="max-w-reading space-y-5">
            <p className="lc-overline" style={{ color: 'var(--brass-300)' }}>Experten-Panel</p>
            <h1 className="font-display font-semibold leading-[1.05] text-[2.5rem] sm:text-display" style={{ color: 'var(--paper)' }}>
              Rechner für die anwaltliche Praxis.
            </h1>
            <p className="text-body-l" style={{ color: 'var(--ink-300)' }}>
              Verfahrens- und Rechtsmittelfristen, Verjährung, Betreibung und Konkurs, Zuständigkeit
              und mehr — mit nachvollziehbarem Rechenweg und exakten Normverweisen, wie auf der
              Basis-Stufe.
            </p>
            {/* Kennzahlen aus der zentralen Config */}
            <dl className="flex flex-wrap gap-x-10 gap-y-4 pt-2">
              {[
                { wert: karten.length, label: 'Rechner' },
                { wert: geprueft, label: 'geprüft' },
                { wert: gebiete, label: 'Rechtsgebiete' },
              ].map((s) => (
                <div key={s.label}>
                  <dt className="lc-overline" style={{ color: 'var(--ink-400)' }}>{s.label}</dt>
                  <dd className="num text-[1.75rem] leading-tight font-medium" style={{ color: 'var(--brass-300)' }}>{s.wert}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      </div>

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
