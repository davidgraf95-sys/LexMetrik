import { Link } from 'react-router-dom';
import { KATALOG_KARTEN, istVerfuegbar } from '../lib/startseiteConfig';
import { Schnellrechner } from '../components/start/Schnellrechner';
import { Zeiterfassung } from '../components/start/Zeiterfassung';

// ─── Startseite V2 — «Rechner-zuerst»-Cockpit (Auftrag David 19.6.2026) ──────
//
// Auf Basis des Prototyps LexMetrik-Startseite-V2-Prototyp.html, umgesetzt im
// gesperrten Designsystem (Geist, Papier/Tinte/Messing; hell+dunkel). Der
// Schnellrechner ruft die ECHTEN Engines (§1/§3). Der frühere Katalog (vier
// Oberkategorien) lebt jetzt unter /recherche und in der Seitenleiste.

// Zeitabhängige Begrüssung — reine Darstellung. Die Startseite wird prerendert;
// die Uhrzeit ist client-spezifisch → suppressHydrationWarning am Element, damit
// die (am Build gebackene) Begrüssung beim Hydrieren ohne Warnung auf die echte
// Tageszeit wechselt.
function begruessung(): string {
  const h = new Date().getHours();
  return h < 11 ? 'Guten Morgen' : h < 18 ? 'Guten Tag' : 'Guten Abend';
}

function Seclabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mt-9 mb-3">
      <span className="lc-overline text-ink-500">{children}</span>
      <span aria-hidden className="flex-1 h-px bg-line" />
    </div>
  );
}

// Favoriten/Schnellzugriff — kuratierte Direktlinks (Klicktiefe 1), aus dem
// Katalog (SSoT) per href aufgelöst, damit Titel/Ziel nicht driften.
const FAVORITEN_HREFS = [
  '/rechner/tagerechner',
  '/rechner/verzugszins',
  '/rechner/teuerung',
  '/vorlagen/testament',
  '/vorlagen/schlichtungsgesuch-bs',
];
const FAVORITEN = FAVORITEN_HREFS
  .map((href) => KATALOG_KARTEN.find((k) => k.href === href && istVerfuegbar(k)))
  .filter((k): k is NonNullable<typeof k> => !!k);

export function Startseite() {
  return (
    <div className="max-w-[58rem]">
      {/* Begrüssung + Ein-Satz-Erklärung + ehrlicher KI-Hinweis */}
      <section className="space-y-3">
        <h1 suppressHydrationWarning className="font-display font-semibold text-ink-900 text-h2 leading-tight">
          {begruessung()}
        </h1>
        <p className="text-body-l text-ink-600 leading-relaxed max-w-reading">
          LexMetrik rechnet Schweizer Rechtsfristen, Kosten und Zuständigkeiten nach festen
          Gesetzesregeln aus – und erstellt Dokumente aus geprüften Bausteinen. Gleiche
          Eingaben ergeben immer dasselbe, nachvollziehbare Ergebnis.
        </p>
        <p className="inline-flex items-center gap-2 text-body-s font-medium text-brass-700 bg-brass-100 border border-brass-200 rounded-full px-3 py-1">
          <span aria-hidden className="w-1.5 h-1.5 rounded-full bg-brass-600" /> Berechnung statt KI
        </p>
      </section>

      <Seclabel>Schnellrechner</Seclabel>
      <Schnellrechner />

      <Seclabel>Zeiterfassung</Seclabel>
      <Zeiterfassung />

      {FAVORITEN.length > 0 && (
        <>
          <Seclabel>Favoriten</Seclabel>
          <div className="flex flex-wrap gap-2.5">
            {FAVORITEN.map((k) => (
              <Link key={k.href} to={k.href!}
                className="inline-flex items-center gap-2 bg-surface border border-line rounded-lg px-3.5 py-2.5 text-body-s text-ink-900 no-underline hover:border-brass-400 transition-colors">
                <span aria-hidden className="w-1.5 h-1.5 rounded-full bg-brass-500 shrink-0" />
                {k.title}
              </Link>
            ))}
          </div>
        </>
      )}

      {/* Rechtlicher Hinweis (Pflicht, §8) */}
      <section className="lc-notice mt-10">
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
