import { Link } from 'react-router-dom';
import { ALLE_KARTEN, RECHTSGEBIETE, SEKTIONEN, VORLAGE_SEKTIONEN } from '../lib/startseiteConfig';
import { Katalog } from '../components/Katalog';
import { ModusSchalter, useModus } from '../components/ModusSchalter';
import { MODUS_BESCHRIEB } from './Startseite';
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
    <div className="space-y-12">
      {/* Kompakter Hero mit Kennzahlen-Messleiste */}
      <section className="space-y-4">
        <p className="lc-overline text-brass-700">Experten-Panel</p>
        <h1 className="font-display font-semibold text-ink-900 leading-[1.05] text-[2.25rem] sm:text-[2.75rem] max-w-reading">
          Der vollständige Katalog für die Praxis.
        </h1>
        <p className="text-body-l text-ink-600 max-w-reading">
          Alle Rechner und Vorlagen — von Verfahrens- und Rechtsmittelfristen über Verjährung bis
          Betreibung und Konkurs, mit nachvollziehbarem Rechenweg und exakten Normverweisen.
        </p>

        {/* Kennzahlen-Messleiste: Skala als Ablesekante, Haarlinien als Teilung */}
        <div className="pt-1">
          <span className="scale-rule block" aria-hidden />
          <dl className="flex flex-wrap divide-x divide-line border-b border-line">
            {[
              { wert: alle.filter((k) => k.modus === 'rechner').length, label: 'Rechner' },
              { wert: alle.filter((k) => k.modus === 'vorlage').length, label: 'Vorlagen' },
              { wert: geprueft.length, label: 'geprüft' },
              { wert: gebiete, label: 'Rechtsgebiete' },
            ].map((s) => (
              <div key={s.label} className="px-8 first:pl-0 py-3">
                <dd className="num text-[1.6rem] leading-none font-medium text-ink-900">{s.wert}</dd>
                <dt className="lc-overline mt-1.5">{s.label}</dt>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Katalog: Modus-Wahl, Filter und Direkteinstieg in der Seitenleiste */}
      <Katalog
        karten={karten}
        sektionen={modus === 'rechner' ? SEKTIONEN : VORLAGE_SEKTIONEN}
        seitenleisteKopf={
          <div className="space-y-2">
            <ModusSchalter breit modus={modus} onChange={setModus} anzahl={anzahl} />
            <p className="text-xs text-ink-500 leading-relaxed">{MODUS_BESCHRIEB[modus]}</p>
          </div>
        }
        seitenleisteFuss={modus === 'rechner' ? (
          <nav aria-label="Direkteinstieg" className="space-y-1 pt-3 border-t border-line">
            <p className="lc-overline mb-2">Direkt öffnen</p>
            {geprueft.map((k) => (
              <Link key={k.id} to={k.href!}
                className="block px-2 py-1 -mx-2 rounded-md text-body-s text-brass-700 no-underline hover:bg-brass-100/50 transition-colors truncate">
                {sansAmp(k.title)} <span aria-hidden>→</span>
              </Link>
            ))}
          </nav>
        ) : undefined}
      />

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
