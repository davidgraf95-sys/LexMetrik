import { Link } from 'react-router-dom';
import { KATALOG_KARTEN } from '../lib/startseiteConfig';
import { Katalog } from '../components/Katalog';
import { SeitenKopf } from '../components/layout/SeitenKopf';

// ─── Recherche-Seite (Build-Plan App-Shell, Phase 4 — minimal) ──────────────
//
// Schlanke Such-Einstiegsseite, die die BESTEHENDE Katalog-Suche wiederverwendet
// (Katalog liest ?q=, HeaderSuche schreibt es auch auf /recherche live, §5) —
// kein zweiter Such-Apparat. Bewusst minimal: Katalog-Treffer; eine Volltext-
// Normen-Suche folgt später (Build-Plan §5, Recherche-Tiefe v1).
export function Recherche() {
  return (
    <div className="space-y-6">
      <SeitenKopf
        overline="Recherche"
        titel="Katalog durchsuchen"
        intro="Rechner und Vorlagen im Volltext durchsuchen — tippen Sie oben im Suchfeld (Kürzel «/»), oder wählen Sie eine Kategorie. Eine Volltext-Suche in den Gesetzen folgt später."
      />
      <Katalog karten={KATALOG_KARTEN} />

      {/* Methodik als EINE Zeile mit Link — die Langtexte leben auf /methodik (SSoT). */}
      <section className="lc-notice flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
        <p className="text-body-s text-ink-600">
          <span className="font-medium text-ink-900">So rechnet LexMetrik:</span>{' '}
          Berechnung statt KI · verifizierte Normverweise · offengelegter Rechenweg.
        </p>
        <Link to="/methodik" className="text-body-s font-medium text-brass-700 hover:text-brass-600 no-underline whitespace-nowrap">
          Zur Methodik →
        </Link>
      </section>

      {/* Rechtlicher Hinweis (Pflicht, §8) */}
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
