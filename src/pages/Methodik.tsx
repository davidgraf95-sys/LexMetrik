// Optionale Seite "Wie Lexmetrik rechnet" (provisorisch).
export function Methodik() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div className="space-y-2">
        <p className="text-xs font-semibold text-ink-400 uppercase tracking-wide">Methodik</p>
        <h1 className="text-2xl font-bold text-ink-900">Wie Lexmetrik rechnet</h1>
      </div>
      <div className="space-y-4 text-sm text-ink-600 leading-relaxed">
        <p>
          Lexmetrik bildet die einschlägigen Normen als reine, getestete Berechnungsfunktionen ab.
          Jede Rechenregel ist mit ihrem Gesetzesartikel kommentiert; jeder Schritt erscheint mit
          Eingangsgrössen, angewandter Norm und Zwischenergebnis im Rechenweg.
        </p>
        <p>
          Rechtsprechung und kantonale Skalen tragen einen sichtbaren Verifikations-Vorbehalt
          («zu verifizieren»). Es werden keine Artikelnummern oder Aktenzeichen erfunden.
          Alle Berechnungen laufen clientseitig im Browser, ohne Datenübertragung, deterministisch.
        </p>
        <p className="rounded-lg border border-line bg-warn-bg p-4 text-warn-700">
          Die Ergebnisse sind eine rechnerische Orientierung und keine Rechtsberatung.
        </p>
      </div>
    </div>
  );
}
