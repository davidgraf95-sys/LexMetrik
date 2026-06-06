import { useEffect } from 'react';
import { proEinloggen } from '../lib/proSession';
import { ALLE_KARTEN, RECHTSGEBIETE, istVerfuegbar } from '../lib/startseiteConfig';
import { Katalog } from '../components/Katalog';

// Pro-Bereich: der vollständige Katalog (free + pro), gegliedert nach
// Rechtsgebiet mit Untergruppen Rechner/Vorlagen (Auftrag «Katalog-Ausbau»).
// Helles, redaktionelles Hero: Typo-Hierarchie statt Farbfläche, Kennzahlen
// als Messleiste auf der Ablesekante, Direkteinstieg zu den gebauten Rechnern.

export function Pro() {
  // Pro betreten = eingeloggt (überlebt Neuladen; Header zeigt «Ausloggen»).
  // Andockpunkt Zahlungs-Gate (System noch offen): später wird hier das Gate geprüft.
  useEffect(() => { proEinloggen(); }, []);
  // Pro zeigt den VOLLSTÄNDIGEN Katalog (free + pro);
  // die Free-Seite zeigt nur die kostenlose Auswahl (tier 'free').
  const alle = ALLE_KARTEN;
  // Ehrliches Status-Modell: keine «geprüft»-Kennzahl, solange nichts geprüft ist
  const verfuegbar = alle.filter(istVerfuegbar);
  const gebiete = RECHTSGEBIETE.filter((g) => alle.some((k) => k.rechtsgebiet === g)).length;

  return (
    <div className="space-y-6">
      {/* Hero (Neubau 5.6.2026, Richtung «nüchtern & juristisch» wie Free):
          Nutzen-Headline statt Etikett, konkrete Arbeitsfelder im Untertitel,
          Kennzahlen-Messzeile auf ALLEN Breiten (vorher erst ab lg). Bewusst
          kompakter als der Free-Hero – Pro ist eine tägliche Arbeitsseite,
          der Katalog soll ohne Scrollen erreichbar bleiben. */}
      <section className="pt-6 pb-7 sm:pt-8 border-b border-line">
        <div className="max-w-3xl space-y-4">
          <p className="lc-overline text-brass-700">Pro · Schweizer Recht, berechenbar</p>
          <h1 className="font-display font-semibold text-ink-900 text-h2 leading-tight">
            Der vollständige Katalog für die anwaltliche Praxis.
          </h1>
          <p className="text-body-l text-ink-600 leading-relaxed max-w-reading">
            Verfahrens- und Rechtsmittelfristen, Verjährung, Betreibung und Konkurs, Arbeits-
            und Mietrecht – dazu Vertrags- und Eingabe-Vorlagen. Jeder Rechenweg offengelegt,
            jede Norm exakt verlinkt, exportierbar als PDF-Rechenbericht.
          </p>
          {/* Primär: sofort Verfügbares; Katalog/Gebiete sekundär (Phase 5).
              Die Ehrlichkeit «ungeprüft» trägt das orange Badge AUF der Karte. */}
          <p className="num text-body-s text-ink-500 flex flex-wrap items-baseline gap-x-5 gap-y-1">
            <span className="text-brass-700 font-medium">{verfuegbar.length} sofort verfügbar</span>
            <span><span className="font-medium text-ink-900">{alle.length}</span> im Katalog</span>
            <span><span className="font-medium text-ink-900">{gebiete}</span> Rechtsgebiete</span>
          </p>
        </div>
      </section>

      {/* Katalog: Rechtsgebiet-Sektionen; Filter Suche · Rechtsbereich ·
          Output-/Dokument-Typ · Status; Direkteinstieg in der Seitenleiste */}
      <Katalog
        karten={alle}
        filterArt
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
