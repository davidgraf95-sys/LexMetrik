import { Link } from 'react-router-dom';

export function NotFound() {
  return (
    <div className="py-16 text-center space-y-3">
      <p className="text-sm font-semibold text-ink-400 uppercase tracking-wide">404</p>
      <h1 className="text-2xl font-bold text-ink-900">Seite nicht gefunden</h1>
      <Link to="/" className="inline-block text-sm font-medium text-brass-700">← Zur Startseite</Link>
    </div>
  );
}
