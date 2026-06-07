import { Link } from 'react-router-dom';
import { ALLE_KARTEN, RECHTSGEBIETE, istVerfuegbar } from '../lib/startseiteConfig';
import { Katalog, SectionHead } from '../components/Katalog';
import { haeufigGebrauchtKarten } from '../lib/haeufigGebraucht';
import { merkeZuletzt } from '../lib/schnellzugriff';

// EINE Hauptseite (FAHRPLAN-EINE-HAUPTSEITE, Auftrag David 7.6.2026): Die
// Free/Pro-Zweiteilung ist aufgehoben — «/» trägt den vollständigen Katalog
// (vorher /pro) hinter einem kompakten Hero. Entscheide:
//  D-1 Free-Nutzen-Headline in Pro-Kompakthöhe (h2-Grösse — der Katalog
//      bleibt ohne Scrollen erreichbar, Entscheid 5.6.2026 gilt weiter),
//  D-2 «Häufig gebraucht» = kuratierter Rest der Free-Kachelwand
//      (lib/haeufigGebraucht.ts), gleiche Anatomie wie die Anliegen-Zeile,
//  D-4 Kennzahlen OHNE Preisaussage, bis die Monetarisierungsfrage (G1,
//      STRATEGIE-PLATTFORM.md) entschieden ist.

export function Startseite() {
  // Ehrliche Kennzahlen (§8), datengetrieben aus der Config (§5).
  const verfuegbar = ALLE_KARTEN.filter(istVerfuegbar);
  const gebiete = RECHTSGEBIETE.filter((g) => ALLE_KARTEN.some((k) => k.rechtsgebiet === g)).length;
  const haeufig = haeufigGebrauchtKarten();
  // Status-Legende: EINE Zeile erklärt das orange Entwurf-Badge zentral,
  // statt dass jedes einzelne Badge schreien muss (§8 bleibt erfüllt).
  const nEntwurf = verfuegbar.filter((k) => k.status === 'entwurf').length;

  return (
    <div className="space-y-6">
      {/* Hero «nüchtern & juristisch»: Nutzen-Headline, vereinigter
          Untertitel beider früherer Heros, Kennzahlen-Messzeile,
          Methodik-Anker. Keine Bilder, keine Verläufe. */}
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
            Verfahrens-, Verjährungs-, Arbeits- und Mietfristen berechnen; Zuständigkeit und
            Rechtsmittel über drei Rechtswege klären; Verzugszins, Teuerung und Kosten beziffern;
            Testament, Verträge, Kündigungen und Eingaben aufsetzen. LexMetrik arbeitet nach
            festen Regeln, ohne Sprachmodell – jeder Rechenschritt offengelegt, jede Norm
            direkt mit dem Gesetzestext verlinkt.
          </p>
          <p className="num text-body-s text-ink-500 flex flex-wrap items-baseline gap-x-5 gap-y-1">
            <span className="text-brass-700 font-medium">{verfuegbar.length} sofort verfügbar</span>
            <span><span className="font-medium text-ink-900">{ALLE_KARTEN.length}</span> im Katalog</span>
            <span><span className="font-medium text-ink-900">{gebiete}</span> Rechtsgebiete</span>
          </p>
          {/* Methodik-Anker mit Messing-Tick (Design-Review 6.6.2026) */}
          <ul className="flex flex-wrap gap-x-6 gap-y-2 pt-1 text-body-s text-ink-600">
            {[
              'Deterministisch – gleiche Eingabe, gleiches Ergebnis',
              'Normen auf Fedlex verlinkt',
              'Rechenweg vollständig offengelegt',
            ].map((c) => (
              <li key={c} className="pl-2.5 leading-snug border-l-2 border-brass-500">{c}</li>
            ))}
          </ul>
        </div>
      </section>

      {/* Kuratierter Schnelleinstieg (D-2): dieselbe Zeilen-Anatomie wie
          «Einstieg nach Anliegen» im Katalog — Klick zählt für «Zuletzt
          verwendet» wie jeder Katalog-Einstieg. */}
      {haeufig.length > 0 && (
        <section aria-label="Häufig gebraucht"
          className="grid grid-cols-1 sm:grid-cols-[9.5rem_minmax(0,1fr)] gap-x-3 gap-y-1 sm:items-start">
          <span className="lc-overline text-ink-500 sm:mt-1">Häufig gebraucht</span>
          <div className="flex flex-wrap gap-1.5">
            {haeufig.map((k) => (
              <Link key={k.id} to={k.href!} onClick={() => merkeZuletzt(k.id)} title={k.title}
                className="inline-flex items-center gap-1 h-7 px-2.5 rounded-md border border-line text-body-s text-ink-600 no-underline hover:text-brass-700 hover:border-brass-400 transition-colors">
                {k.title}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Status-Legende (einmal, datengetrieben §5) */}
      {nEntwurf > 0 && (
        <p className="flex flex-wrap items-center gap-2 text-body-s text-ink-500">
          <span className="lc-badge-entwurf">Entwurf</span>
          <span>
            erstellt, fachlich noch nicht geprüft —{' '}
            {nEntwurf === verfuegbar.length
              ? 'gilt derzeit für alle verfügbaren Einträge'
              : <>gilt für <span className="num">{nEntwurf}</span> von <span className="num">{verfuegbar.length}</span> verfügbaren Einträgen</>}
          </span>
        </p>
      )}

      {/* Vollständiger Katalog (vorher /pro): Gebiets-Kacheln, Suche ?q=,
          Panel ?gebiet=, Anliegen-Zeile, «Zuletzt verwendet» — unverändert. */}
      <Katalog karten={ALLE_KARTEN} filterArt />

      {/* Methodik / Vertrauens-Kacheln */}
      <section className="space-y-6 pt-6">
        <SectionHead>So rechnet LexMetrik</SectionHead>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { t: 'Berechnung statt KI', b: 'LexMetrik nutzt kein Sprachmodell und keine Wahrscheinlichkeiten, sondern festgelegte Rechenregeln. Gleiche Eingaben ergeben immer dasselbe Ergebnis. Jeder Schritt wird offengelegt und jede angewandte Norm direkt mit dem Gesetzestext verlinkt – so ist jedes Ergebnis überprüfbar statt geschätzt.' },
            { t: 'Verifizierte Normverweise', b: 'Nur explizit genannte, geprüfte Gesetzesartikel werden fest verdrahtet. Rechtsprechung trägt einen Verifikations-Vorbehalt.' },
            { t: 'Nachvollziehbarer Rechenweg', b: 'Jeder Schritt zeigt Eingangsgrössen, angewandte Norm und Zwischenergebnis – vollständig im PDF-Bericht.' },
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
