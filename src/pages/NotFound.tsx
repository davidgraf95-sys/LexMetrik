import { Link } from 'react-router-dom';

export function NotFound() {
  return (
    <div className="py-16 text-center space-y-3">
      <p className="text-body-s font-semibold text-ink-500 uppercase tracking-wide">404</p>
      <h1 className="text-2xl font-bold text-ink-900">Seite nicht gefunden</h1>
      <Link to="/" className="inline-block text-body-s font-medium text-brass-700">← Zur Startseite</Link>
    </div>
  );
}
