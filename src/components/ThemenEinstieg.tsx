import { Fragment } from 'react';
import { Link } from 'react-router-dom';

// ─── Themen-Einstieg unter der Werkzeug-Karte (DESIGN-REGLEMENT-RECHNER R10) ─
// Direktlinks vom Rechner zu den passenden Vorlagen (Konsolidierung 7.6.2026
// E3: Einträge ohne eigene Katalog-Karte sind HIER erreichbar). Vorher als
// frei formatierte Absätze in den Seiten dupliziert.
export function ThemenEinstieg({ label, links }: {
  label: string;
  links: { to: string; label: string }[];
}) {
  return (
    <p className="text-body-s text-ink-600">
      <span className="font-medium text-ink-900">{label}</span>{' '}
      {links.map((l, i) => (
        <Fragment key={l.to}>
          {i > 0 && ' · '}
          <Link to={l.to} className="text-brass-700 hover:text-brass-600 no-underline">{l.label} →</Link>
        </Fragment>
      ))}
    </p>
  );
}
