import { Begruessung } from '../components/start/Begruessung';
import { NewsHeader } from '../components/start/NewsHeader';
import { UniversalSuche } from '../components/start/UniversalSuche';
import { Schnellrechner } from '../components/start/Schnellrechner';
import { GesetzeRubrik } from '../components/start/GesetzeRubrik';

// ─── Startseite — «Suche-zuerst»-Cockpit (Überarbeitung, Auftrag David) ──────
//
// Reihenfolge (Auftrag David, #5): Kopf (Gruss/Datum) · Universal-Suche (zuoberst
// schnell suchen) · Schnellrechner (schnell rechnen) · Gesetze-Rubrik (#6: Suchfeld
// + Top-Erlasse) · News aus dem Bundesgericht · Rechtlicher Hinweis (§8). Reine
// Darstellung (§3); jede Sektion ist eine eigene, schlanke Komponente (§6.6). Der
// «Weiter wo du warst»-Verlauf entfällt (#10) — die In-App-Tableiste deckt das ab.
//
// Startseite V3 · Bausequenz-Schritt 2 (Plumbing): Favoriten gestrichen (Anweisung
// David 5.6.), Zeiterfassung auf die /rechner-Übersicht verschoben → die
// «Werkzeuge»-Sektion entfällt; Container auf `max-w-content`-Token. Die
// vollständige Neukomposition (Hero/Kacheln/Chips/Zuletzt) folgt in Schritt 4.

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
    <div className="max-w-content">
      {/* Kopf: Gruss (zufällig, tageszeitpassend) + Datum/Uhr */}
      <section className="space-y-3">
        <Begruessung />
        <p className="text-body-l text-ink-600 leading-relaxed max-w-reading">
          Schweizer Recht berechnen und erstellen – nach festen Gesetzesregeln, jeder Schritt nachvollziehbar.
        </p>
      </section>

      {/* Universal-Suche — zuoberst (Auftrag David #5) */}
      <Seclabel>Wonach suchen Sie?</Seclabel>
      <UniversalSuche />

      <Seclabel>Schnell rechnen</Seclabel>
      <Schnellrechner />

      {/* Gesetze-Rubrik (#6): Suchfeld + Top-Erlasse */}
      <Seclabel>Gesetze</Seclabel>
      <GesetzeRubrik />

      {/* News aus dem Bundesgericht — weiter unten (rendert nichts in SSR/bei
          leerem Register; bringt eigenen Kopf «Neues vom Bundesgericht» mit) */}
      <div className="mt-9">
        <NewsHeader />
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
