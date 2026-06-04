import { Link } from 'react-router-dom';
import { ALLE_KARTEN, RECHTSGEBIETE, SEKTIONEN, VORLAGE_SEKTIONEN } from '../lib/startseiteConfig';
import { Katalog } from '../components/Katalog';
import { ModusSchalter, useModus } from '../components/ModusSchalter';
import { ModusHero } from './Startseite';
import { sansAmp } from '../components/typografie';

// Experten-Panel: alle Rechner der Stufe 'experte' (anwaltliche Praxis).
// Helles, redaktionelles Hero: Typo-Hierarchie statt Farbfläche, Kennzahlen
// als Messleiste auf der Ablesekante, Direkteinstieg zu den geprüften Rechnern.

export function Fachpersonen() {
  const [modus, setModus] = useModus();
  // Fachpersonen sehen den VOLLSTÄNDIGEN Katalog (beide Stufen);
  // die Basis-Seite zeigt nur die allgemeinen Karten (tier 'frei').
  const alle = ALLE_KARTEN;
  const karten = alle.filter((k) => k.modus === modus);
  const anzahl = {
    rechner: alle.filter((k) => k.modus === 'rechner').length,
    vorlage: alle.filter((k) => k.modus === 'vorlage').length,
  } as const;
  const geprueft = alle.filter((k) => k.status === 'geprüft' && k.modus === 'rechner');
  const gebiete = RECHTSGEBIETE.filter((g) => alle.some((k) => k.rechtsgebiet === g)).length;

  return (
    <div className="space-y-16">
      {/* Hero */}
      <section className="space-y-5">
        <p className="lc-overline text-brass-700">Experten-Panel</p>
        <h1 className="font-display font-semibold text-ink-900 leading-[1.05] text-[2.5rem] sm:text-display max-w-reading">
          Rechner für die anwaltliche Praxis.
        </h1>
        <p className="text-body-l text-ink-600 max-w-reading">
          Der vollständige Katalog: Verfahrens- und Rechtsmittelfristen, Verjährung, Betreibung
          und Konkurs, Zuständigkeit und mehr — einschliesslich aller allgemeinen Rechner und
          Vorlagen, mit nachvollziehbarem Rechenweg und exakten Normverweisen.
        </p>

        {/* Kennzahlen-Messleiste: Skala als Ablesekante, Haarlinien als Teilung */}
        <div className="pt-2">
          <span className="scale-rule block" aria-hidden />
          <dl className="flex flex-wrap divide-x divide-line border-b border-line">
            {[
              { wert: alle.filter((k) => k.modus === 'rechner').length, label: 'Rechner' },
              { wert: alle.filter((k) => k.modus === 'vorlage').length, label: 'Vorlagen' },
              { wert: geprueft.length, label: 'geprüft' },
              { wert: gebiete, label: 'Rechtsgebiete' },
            ].map((s) => (
              <div key={s.label} className="px-8 first:pl-0 py-4">
                <dd className="num text-[1.75rem] leading-none font-medium text-ink-900">{s.wert}</dd>
                <dt className="lc-overline mt-1.5">{s.label}</dt>
              </div>
            ))}
          </dl>
        </div>

        {/* Direkteinstieg: geprüfte Rechner sofort öffnen */}
        {modus === 'rechner' && (
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="lc-overline text-ink-500 normal-case" style={{ letterSpacing: '0.04em' }}>Direkt öffnen:</span>
            {geprueft.map((k) => (
              <Link key={k.id} to={k.href!}
                className="inline-flex items-center gap-1.5 rounded-full border border-brass-400 px-3.5 py-1.5 text-body-s font-medium text-brass-700 no-underline hover:bg-brass-100 transition-colors">
                {sansAmp(k.title)} <span aria-hidden>→</span>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Primärweiche + modusabhängiger Sub-Hero */}
      <div className="space-y-6">
        <ModusSchalter modus={modus} onChange={setModus} anzahl={anzahl} />
        <ModusHero modus={modus} />
      </div>

      {/* Katalog der Experten-Stufe im aktiven Modus */}
      <Katalog karten={karten} sektionen={modus === 'rechner' ? SEKTIONEN : VORLAGE_SEKTIONEN} />

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
