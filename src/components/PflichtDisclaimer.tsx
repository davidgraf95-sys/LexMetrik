// Pflicht-Disclaimer (Design-Doc 5.9) – auf jeder Rechnerseite sichtbar, nicht ausblendbar.
export function PflichtDisclaimer({ text }: { text?: string }) {
  return (
    <details className="lc-notice" role="note">
      <summary className="lc-overline cursor-pointer text-ink-500">Rechtlicher Hinweis – keine Rechtsberatung</summary>
      <p className="text-body-s text-ink-600 mt-2">
        {text ??
          'Automatisierte Orientierungsberechnung – keine Rechtsberatung und keine verbindliche Fristberechnung. ' +
          'Massgeblich sind GAV, Vertrag, Versicherungspolice und der konkrete Sachverhalt; abweichende Regelungen gehen vor. ' +
          'Norm- und Rechtsprechungsverweise sind im Einzelfall zu prüfen.'}
      </p>
    </details>
  );
}
