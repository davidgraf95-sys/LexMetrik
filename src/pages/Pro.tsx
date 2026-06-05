import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { proEinloggen } from '../lib/proSession';
import { ALLE_KARTEN, RECHTSGEBIETE } from '../lib/startseiteConfig';
import { Katalog } from '../components/Katalog';
import { sansAmp } from '../components/typografie';

// Pro-Bereich: der vollständige Katalog (free + pro), gegliedert nach
// Rechtsgebiet mit Untergruppen Rechner/Vorlagen (Auftrag «Katalog-Ausbau»).
// Helles, redaktionelles Hero: Typo-Hierarchie statt Farbfläche, Kennzahlen
// als Messleiste auf der Ablesekante, Direkteinstieg zu den gebauten Rechnern.

export function Pro() {
  // Pro betreten = eingeloggt (überlebt Neuladen; Header zeigt «Ausloggen»).
  // Andockpunkt PayPal-Gate: später wird hier stattdessen das Gate geprüft.
  useEffect(() => { proEinloggen(); }, []);
  // Pro zeigt den VOLLSTÄNDIGEN Katalog (free + pro);
  // die Free-Seite zeigt nur die kostenlose Auswahl (tier 'free').
  const alle = ALLE_KARTEN;
  // Ehrliches Status-Modell: keine «geprüft»-Kennzahl, solange nichts geprüft ist
  const entwurf = alle.filter((k) => k.status === 'entwurf');
  const gebiete = RECHTSGEBIETE.filter((g) => alle.some((k) => k.rechtsgebiet === g)).length;

  return (
    <div className="space-y-6">
      {/* Schlanker Einzeilen-Hero (analog Free, Entscheid 5.6.2026):
          Titel + Claim auf EINER Zeile, Kennzahlen kompakt rechts. */}
      <section className="pt-3 sm:pt-4 pb-3 border-b border-line">
        <div className="flex flex-col sm:flex-row sm:items-baseline gap-x-3 gap-y-0.5 sm:whitespace-nowrap">
          <h1 className="font-display font-semibold text-ink-900 text-h3 shrink-0">
            <span className="lc-overline text-brass-700 mr-2 align-middle">Pro</span>
            Der vollständige Katalog für die Praxis.
          </h1>
          <p className="text-body-s text-ink-500 sm:truncate sm:min-w-0">
            Alle Rechner und Vorlagen — mit nachvollziehbarem Rechenweg und exakten Normverweisen.
          </p>
          <span className="hidden lg:inline-flex items-baseline gap-4 ml-auto pl-4 shrink-0 num text-body-s text-ink-500">
            {[
              { wert: alle.filter((k) => k.modus === 'rechner').length, label: 'Rechner' },
              { wert: alle.filter((k) => k.modus === 'vorlage').length, label: 'Vorlagen' },
              { wert: entwurf.length, label: 'in Entwurf' },
              { wert: gebiete, label: 'Gebiete' },
            ].map((s) => (
              <span key={s.label}><span className="font-medium text-ink-900">{s.wert}</span> {s.label}</span>
            ))}
          </span>
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
