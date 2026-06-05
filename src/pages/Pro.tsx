import { Link } from 'react-router-dom';
import { ALLE_KARTEN, RECHTSGEBIETE } from '../lib/startseiteConfig';
import { Katalog } from '../components/Katalog';
import { sansAmp } from '../components/typografie';

// Pro-Bereich: der vollständige Katalog (free + pro), gegliedert nach
// Rechtsgebiet mit Untergruppen Rechner/Vorlagen (Auftrag «Katalog-Ausbau»).
// Helles, redaktionelles Hero: Typo-Hierarchie statt Farbfläche, Kennzahlen
// als Messleiste auf der Ablesekante, Direkteinstieg zu den gebauten Rechnern.

export function Pro() {
  // Pro zeigt den VOLLSTÄNDIGEN Katalog (free + pro);
  // die Free-Seite zeigt nur die kostenlose Auswahl (tier 'free').
  const alle = ALLE_KARTEN;
  // Ehrliches Status-Modell: keine «geprüft»-Kennzahl, solange nichts geprüft ist
  const entwurf = alle.filter((k) => k.status === 'entwurf');
  const gebiete = RECHTSGEBIETE.filter((g) => alle.some((k) => k.rechtsgebiet === g)).length;

  return (
    <div className="space-y-12">
      {/* Kompakter Hero mit Kennzahlen-Messleiste */}
      <section className="space-y-4">
        <p className="lc-overline text-brass-700">Pro</p>
        <h1 className="font-display font-semibold text-ink-900 text-display sm:text-display-l max-w-reading">
          Der vollständige Katalog für die Praxis.
        </h1>
        <p className="text-body-l text-ink-600 max-w-reading">
          Alle Rechner und Vorlagen — von Verfahrens- und Rechtsmittelfristen über Verjährung bis
          Betreibung und Konkurs, mit nachvollziehbarem Rechenweg und exakten Normverweisen.
        </p>

        {/* Kennzahlen-Messleiste: Skala als Ablesekante, Haarlinien als Teilung */}
        <div className="pt-1">
          <span className="scale-rule block" aria-hidden />
          {/* Mobil 2×2-Raster ohne Trennlinien (divide-x bricht beim Umbruch),
              ab sm einzeilig mit Haarlinien-Teilung */}
          <dl className="grid grid-cols-2 gap-y-3 sm:flex sm:flex-wrap sm:divide-x sm:divide-line border-b border-line py-3 sm:py-0">
            {[
              { wert: alle.filter((k) => k.modus === 'rechner').length, label: 'Rechner' },
              { wert: alle.filter((k) => k.modus === 'vorlage').length, label: 'Vorlagen' },
              { wert: entwurf.length, label: 'in Entwurf' },
              { wert: gebiete, label: 'Rechtsgebiete' },
            ].map((s) => (
              <div key={s.label} className="sm:px-8 sm:first:pl-0 sm:py-3">
                <dd className="num text-h2 leading-none font-medium text-ink-900">{s.wert}</dd>
                <dt className="lc-overline mt-1.5">{s.label}</dt>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Katalog: Rechtsgebiet-Sektionen; Filter Suche · Rechtsbereich ·
          Output-/Dokument-Typ · Status; Direkteinstieg in der Seitenleiste */}
      <Katalog
        karten={alle}
        filterBereich
        filterArt
        seitenleisteFuss={
          <nav aria-label="Direkteinstieg" className="space-y-1 pt-3 border-t border-line">
            <p className="lc-overline mb-2">Direkt öffnen</p>
            {entwurf.filter((k) => k.href).map((k) => (
              <Link key={k.id} to={k.href!}
                className="block px-2 py-1 -mx-2 rounded-md text-body-s text-brass-700 no-underline hover:bg-brass-100/50 transition-colors truncate">
                {sansAmp(k.title)} <span aria-hidden>→</span>
              </Link>
            ))}
          </nav>
        }
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
