import { Begruessung } from '../components/start/Begruessung';
import { Schnellrechner } from '../components/start/Schnellrechner';
import { Zeiterfassung } from '../components/start/Zeiterfassung';
import { Favoriten } from '../components/start/Favoriten';

// ─── Startseite V2 — «Rechner-zuerst»-Cockpit (Auftrag David 19.6.2026) ──────
//
// Auf Basis des Prototyps LexMetrik-Startseite-V2-Prototyp.html, umgesetzt im
// gesperrten Designsystem (Geist, Papier/Tinte/Messing; hell+dunkel). Der
// Schnellrechner hostet die ECHTEN Rechner-Formulare (§1/§3). Der frühere
// Katalog (vier Oberkategorien) lebt jetzt unter /recherche und in der
// Seitenleiste (Kategorie-Drilldowns).

function Seclabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mt-9 mb-3">
      <span className="lc-overline text-ink-500">{children}</span>
      <span aria-hidden className="flex-1 h-px bg-line" />
    </div>
  );
}

export function Startseite() {
  return (
    <div className="max-w-[58rem]">
      {/* Begrüssung (zufällig, tageszeitpassend) + Datum/Uhr + KI-Hinweis */}
      <section className="space-y-3">
        <Begruessung />
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

      <Seclabel>Favoriten</Seclabel>
      <Favoriten />

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
