// Pflicht-Disclaimer (Design-Doc 5.9) – auf jeder Rechnerseite sichtbar, nicht ausblendbar.
export function PflichtDisclaimer({ text }: { text?: string }) {
  return (
    <div className="lc-notice" role="note">
      <p className="lc-overline mb-1">Rechtlicher Hinweis</p>
      <p className="text-body-s text-ink-600">
        {text ??
          'Automatisierte Orientierungsberechnung – keine Rechtsberatung und keine verbindliche Fristberechnung. ' +
          'Massgeblich sind GAV, Vertrag, Versicherungspolice und der konkrete Sachverhalt; abweichende Regelungen gehen vor. ' +
          'Norm- und Rechtsprechungsverweise sind im Einzelfall zu prüfen.'}
      </p>
    </div>
  );
}
