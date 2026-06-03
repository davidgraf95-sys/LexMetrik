import { CalcGrid } from '../components/CalcGrid';

// Rechner-Übersicht (/rechner) – nutzt dasselbe Raster wie die Startseite.
export function RechnerUebersicht() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-xs font-semibold text-ink-400 uppercase tracking-wide">Übersicht</p>
        <h1 className="text-2xl font-bold text-ink-900">Rechner</h1>
        <p className="text-sm text-ink-500 max-w-2xl">Alle Rechner auf einen Blick. Nur geprüfte Rechner sind aktiv.</p>
      </div>
      <CalcGrid />
    </div>
  );
}
