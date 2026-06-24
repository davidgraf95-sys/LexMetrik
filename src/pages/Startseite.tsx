import { Begruessung } from '../components/start/Begruessung';
import { NewsHeader } from '../components/start/NewsHeader';
import { Verlauf } from '../components/start/Verlauf';
import { UniversalSuche } from '../components/start/UniversalSuche';
import { Schnellrechner } from '../components/start/Schnellrechner';
import { Zeiterfassung } from '../components/start/Zeiterfassung';
import { Favoriten } from '../components/start/Favoriten';

// ─── Startseite — «Suche-zuerst»-Cockpit (Überarbeitung, Auftrag David) ──────
//
// Komposition (oben → unten): Kopf (Gruss/Datum) · Verlauf-Schiene «Weiter wo
// du warst» · Universal-Suche (Held: ein Feld über Rechner/Vorlagen, Fristen-
// Vorlagen, Gesetze und Rechtsprechung) · Schnellrechner (bleibt sichtbar, der
// Star — rechnet ohne Seitenwechsel) · Werkzeuge (Favoriten + Zeiterfassung
// zweispaltig) · Rechtlicher Hinweis (§8). Reine Darstellung (§3); jede Sektion
// ist eine eigene, schlanke Komponente (§6.6). Vorher: Schnellrechner/
// Zeiterfassung/Favoriten als drei gestapelte Blöcke ohne Suche/Verlauf.

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
      {/* Kopf: Gruss (zufällig, tageszeitpassend) + Datum/Uhr + «Berechnung statt KI» */}
      <section className="space-y-3">
        <Begruessung />
        <p className="text-body-l text-ink-600 leading-relaxed max-w-reading">
          Schweizer Recht berechnen und erstellen – nach festen Gesetzesregeln, jeder Schritt nachvollziehbar.
        </p>
        <p className="inline-flex items-center gap-2 text-body-s font-medium text-brass-700 bg-brass-100 border border-brass-200 rounded-full px-3 py-1">
          <span aria-hidden className="w-1.5 h-1.5 rounded-full bg-brass-600" /> Berechnung statt KI
        </p>
      </section>

      {/* News-Header: neueste Bundesgerichtsentscheide (rendert nichts in SSR/
          bei leerem Register; erweiterbar auf weitere amtliche Quellen) */}
      <div className="mt-8">
        <NewsHeader />
      </div>

      {/* Weiter wo du warst (rendert nichts bei leerem Verlauf) */}
      <div className="mt-8">
        <Verlauf />
      </div>

      {/* Universal-Suche — der Held */}
      <Seclabel>Wonach suchen Sie?</Seclabel>
      <UniversalSuche />

      <Seclabel>Schnell rechnen</Seclabel>
      <Schnellrechner />

      <Seclabel>Werkzeuge</Seclabel>
      <div className="grid grid-cols-1 gap-x-4 gap-y-5 md:grid-cols-2 md:items-start">
        <div className="space-y-2.5">
          <span className="lc-overline text-ink-500">Favoriten</span>
          <div className="lc-card p-4"><Favoriten /></div>
        </div>
        <div className="space-y-2.5">
          <span className="lc-overline text-ink-500">Zeiterfassung</span>
          <Zeiterfassung />
        </div>
      </div>

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
