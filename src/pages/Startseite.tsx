import { Link } from 'react-router-dom';
import { ALLE_KARTEN, RECHTSGEBIETE, istVerfuegbar } from '../lib/startseiteConfig';
import { Katalog } from '../components/Katalog';

// EINE Hauptseite (FAHRPLAN-EINE-HAUPTSEITE, 7.6.2026) — Radikal-
// Verschlankung gleichentags (Auftrag David «mache das alles weg und die
// suchfunktion in den header»): zwischen Hero und Register steht NICHTS
// mehr. Die Chip-Einstiege (Anliegen/Häufig gebraucht), Tabs, Typ-Filter,
// Entwurf-Notiz und «Zuletzt verwendet» sind entfernt; die Suche lebt im
// Header (HeaderSuche → ?q=). Das Register IST die Seite.
// Kennzahlen ohne Preisaussage (D-4, bis Monetarisierungs-Entscheid G1).

export function Startseite() {
  // Ehrliche Kennzahlen (§8), datengetrieben aus der Config (§5).
  const verfuegbar = ALLE_KARTEN.filter(istVerfuegbar);
  const gebiete = RECHTSGEBIETE.filter((g) => ALLE_KARTEN.some((k) => k.rechtsgebiet === g)).length;

  return (
    <div className="space-y-6">
      {/* Kopf: Claim, EIN Satz, Kennzahlen. */}
      <section className="pt-6 pb-7 sm:pt-8 border-b border-line">
        <div className="max-w-3xl space-y-4">
          <p className="lc-overline">Schweizer Recht, berechenbar</p>
          {/* Signature-Element (Designsystem §4): Haarlinie mit
              auslaufendem Messing-Akzent unter der Overline. */}
          <div className="scale-rule max-w-[280px] !mt-2.5" aria-hidden />
          <h1 className="font-display font-semibold text-ink-900 text-h2 leading-tight">
            Fristen berechnen. Beträge beziffern. Rechtsdokumente aufsetzen.
          </h1>
          <p className="text-body-l text-ink-600 leading-relaxed max-w-reading">
            Fristen, Beträge und Dokumente nach festen Regeln – ohne Sprachmodell,
            jede Norm direkt mit dem Gesetzestext verlinkt.
          </p>
          <p className="num text-body-s text-ink-500 flex flex-wrap items-baseline gap-x-5 gap-y-1">
            <span className="text-brass-700 font-medium">{verfuegbar.length} sofort verfügbar</span>
            <span><span className="font-medium text-ink-900">{ALLE_KARTEN.length}</span> im Katalog</span>
            <span><span className="font-medium text-ink-900">{gebiete}</span> Rechtsgebiete</span>
          </p>
        </div>
      </section>

      {/* Register: der vollständige Katalog — Suche im Header (?q=),
          Gebiets-Panels (?gebiet=). */}
      <Katalog karten={ALLE_KARTEN} />

      {/* Fuss: Methodik als EINE Zeile mit Link — die Langtexte leben
          auf /methodik (SSoT). */}
      <section className="lc-notice flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
        <p className="text-body-s text-ink-600">
          <span className="font-medium text-ink-900">So rechnet LexMetrik:</span>{' '}
          Berechnung statt KI · verifizierte Normverweise · offengelegter Rechenweg.
        </p>
        <Link to="/methodik" className="text-body-s font-medium text-brass-700 hover:text-brass-600 no-underline whitespace-nowrap">
          Zur Methodik →
        </Link>
      </section>

      {/* Rechtlicher Hinweis (Pflicht, §8 — unverändert) */}
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
