// Pflicht-Disclaimer (Design-Doc 5.9) – auf jeder Rechnerseite sichtbar, nicht ausblendbar.
// UX-Programm A3 (Entscheid David 5.6.2026, Variante a): EIN neutrales Gefäss
// für alle Rechner; die rechtsgebietsspezifischen WORTLAUTE bleiben unverändert
// und stehen als `kurz`-Zeile zuoberst im Aufklapp-Inhalt (§7: Fachinhalt).
export function PflichtDisclaimer({ text, kurz }: { text?: string; kurz?: string }) {
  return (
    <details className="lc-notice" role="note">
      <summary className="lc-overline cursor-pointer text-ink-500">Rechtlicher Hinweis – keine Rechtsberatung</summary>
      {kurz && <p className="text-body-s text-ink-700 mt-2 font-medium">{kurz}</p>}
      <p className="text-body-s text-ink-600 mt-2">
        {text ??
          'Automatisierte Orientierungsberechnung – keine Rechtsberatung und keine verbindliche Fristberechnung. ' +
          'Massgeblich sind GAV, Vertrag, Versicherungspolice und der konkrete Sachverhalt; abweichende Regelungen gehen vor. ' +
          'Norm- und Rechtsprechungsverweise sind im Einzelfall zu prüfen.'}
      </p>
    </details>
  );
}
