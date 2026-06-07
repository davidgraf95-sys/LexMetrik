import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ALLE_KARTEN, RECHTSGEBIETE, istVerfuegbar, karte } from '../lib/startseiteConfig';
import { Katalog } from '../components/Katalog';
import { haeufigGebrauchtKarten } from '../lib/haeufigGebraucht';
import { ANLIEGEN } from '../lib/anliegen';
import { merkeZuletzt } from '../lib/schnellzugriff';
import { sansAmp } from '../components/typografie';

// EINE Hauptseite (FAHRPLAN-EINE-HAUPTSEITE, 7.6.2026) — Übersichts-Umbau
// gleichentags (FAHRPLAN-STARTSEITE-UEBERSICHT, Auftrag David, Leitidee
// «Kanzlei-Register»): drei Zonen mit je EINEM Zweck statt sechs paralleler
// Einstiegssysteme.
//  Zone 1 Kopf:      Claim + EIN Nutzen-Satz + Kennzahlen (U1; Methodik-
//                    Anker entfallen — sie leben auf /methodik).
//  Zone 2 Einstieg:  EINE Suchleiste (im Katalog, volle Breite) + EINE
//                    vereinte Chip-Zeile «Direkter Einstieg» (U2/D-A:
//                    Anliegen zuerst, dann Werkzeuge; Darstellung vereint,
//                    SSoT bleiben lib/anliegen.ts + lib/haeufigGebraucht.ts).
//  Zone 3 Register:  der Kachel-Katalog in voller Breite (U3/U4).
// Kennzahlen ohne Preisaussage (D-4, bis Monetarisierungs-Entscheid G1).

// Vereinte Einstiegszeile: max. 10 Chips sichtbar, Rest hinter «mehr …»
// (D-A-Default). Werkzeuge, deren Karte bereits Ziel eines Anliegens ist,
// erscheinen nicht doppelt (Dedupe in der Darstellung, §5-schonend).
const SICHTBARE_CHIPS = 10;

function EinstiegsZeile() {
  const [alleAnzeigen, setAlleAnzeigen] = useState(false);
  const anliegen = ANLIEGEN
    .map((a) => ({ label: a.label, k: karte(a.zielId) }))
    .filter((x): x is { label: string; k: NonNullable<ReturnType<typeof karte>> } =>
      !!x.k && istVerfuegbar(x.k) && !!x.k.href);
  const anliegenZiele = new Set(anliegen.map((x) => x.k.id));
  const werkzeuge = haeufigGebrauchtKarten()
    .filter((k) => !anliegenZiele.has(k.id))
    .map((k) => ({ label: k.title, k }));
  const alle = [...anliegen, ...werkzeuge];
  if (alle.length === 0) return null;
  const sichtbar = alleAnzeigen ? alle : alle.slice(0, SICHTBARE_CHIPS);
  const versteckt = alle.length - sichtbar.length;

  return (
    <section aria-label="Direkter Einstieg"
      className="grid grid-cols-1 sm:grid-cols-[9.5rem_minmax(0,1fr)] gap-x-3 gap-y-1 sm:items-start">
      <span className="lc-overline text-ink-500 sm:mt-1">Direkter Einstieg</span>
      <div className="flex flex-wrap gap-1.5">
        {sichtbar.map(({ label, k }) => (
          <Link key={label} to={k.href!} onClick={() => merkeZuletzt(k.id)} title={k.title}
            className="inline-flex items-center gap-1 h-7 px-2.5 rounded-md border border-line text-body-s text-ink-600 no-underline hover:text-brass-700 hover:border-brass-400 transition-colors">
            {sansAmp(label)}
          </Link>
        ))}
        {versteckt > 0 && (
          <button type="button" onClick={() => setAlleAnzeigen(true)}
            className="inline-flex items-center gap-1 h-7 px-2.5 rounded-md border border-dashed border-line text-body-s text-ink-500 hover:text-brass-700 hover:border-brass-400 transition-colors">
            {`mehr (${versteckt}) …`}
          </button>
        )}
      </div>
    </section>
  );
}

export function Startseite() {
  // Ehrliche Kennzahlen (§8), datengetrieben aus der Config (§5).
  const verfuegbar = ALLE_KARTEN.filter(istVerfuegbar);
  const gebiete = RECHTSGEBIETE.filter((g) => ALLE_KARTEN.some((k) => k.rechtsgebiet === g)).length;
  const nEntwurf = verfuegbar.filter((k) => k.status === 'entwurf').length;

  return (
    <div className="space-y-6">
      {/* Zone 1 — Kopf (U1): Claim, EIN Satz, Kennzahlen. */}
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

      {/* Zone 2 — Einstieg (U2): die Suchleiste stellt der Katalog (volle
          Breite, «/»-Fokus); davor die EINE vereinte Chip-Zeile. */}
      <EinstiegsZeile />

      {/* Zone 3 — Register: der vollständige Katalog; die Entwurf-Legende
          sitzt als stille Notiz im Katalog-Kopf bei den Tabs (U4), wo der
          Status auch entsteht. */}
      <Katalog
        karten={ALLE_KARTEN}
        filterArt
        kopfNotiz={nEntwurf > 0 ? (
          <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-ink-500">
            <span className="lc-badge-entwurf">Entwurf</span>
            <span>= erstellt, fachlich noch nicht geprüft</span>
          </span>
        ) : undefined}
      />

      {/* Fuss (U5): Methodik als EINE Zeile mit Link — die Langtexte leben
          auf /methodik (SSoT; vorher 4 Karten-Duplikate). */}
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
