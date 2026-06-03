// Optionale Seite "Über" (provisorisch).
export function Ueber() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div className="space-y-2">
        <p className="text-xs font-semibold text-ink-400 uppercase tracking-wide">Über</p>
        <h1 className="text-2xl font-bold text-ink-900">Über LegalCalc</h1>
      </div>
      <p className="text-sm text-ink-600 leading-relaxed">
        LegalCalc ist eine Sammlung transparenter Rechner für Schweizer Rechtsfristen und Ansprüche.
        Ziel ist eine nachvollziehbare Orientierung mit exakten Normverweisen — keine Rechtsberatung.
      </p>
    </div>
  );
}
