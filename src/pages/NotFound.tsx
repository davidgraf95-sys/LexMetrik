import { Link } from 'react-router-dom';

// 404 in der Familie der statischen Seiten (FAHRPLAN-DESIGN 5.4):
// Overline + Ablesekante + Display-Titel statt der früheren Fallback-Optik.
export function NotFound() {
  return (
    <div className="py-16 max-w-reading space-y-3">
      <p className="lc-overline">404 · Nicht gefunden</p>
      <div className="scale-rule max-w-[280px]" aria-hidden />
      <h1 className="text-h1 font-display font-semibold text-ink-900">Diese Seite gibt es nicht.</h1>
      <p className="text-body-s text-ink-600 max-w-reading">
        Die Adresse ist veraltet oder vertippt. Alle Rechner und Vorlagen finden Sie im Katalog.
      </p>
      <Link to="/" className="inline-block text-body-s font-medium text-brass-700 hover:text-brass-600 no-underline pt-2">
        ← Zur Startseite
      </Link>
    </div>
  );
}
