// Pflicht-Disclaimer (Design-Doc 5.9) – auf jeder Rechnerseite sichtbar, nicht ausblendbar.
// UX-Programm A3 (Entscheid David 5.6.2026, Variante a): EIN neutrales Gefäss
// für alle Rechner; die rechtsgebietsspezifischen WORTLAUTE bleiben unverändert
// und stehen als `kurz`-Zeile zuoberst im Aufklapp-Inhalt (§7: Fachinhalt).
export function PflichtDisclaimer({ text, kurz }: { text?: string; kurz?: string }) {
  return (
    // ── R-2 (Prüfbefund W2·24-R5, 6.9.2026) · KEINE ROLLE AUF <details> ──────
    //  `role="note"` stand hier auf dem <details>-Element und war auf ALLEN
    //  geprüften Rechner-Tiefenrouten (6/6, vermutlich alle 20) ein axe-Verstoss
    //  `aria-allowed-role`: <details> ist eine Disclosure (implizit `group` mit
    //  einem `button`-Summary), und `note` gehört nicht zu den dort erlaubten
    //  Rollen — der Screenreader verlor damit die Auf-/Zuklapp-Semantik, ohne
    //  dafür etwas zu gewinnen. Die Rolle ist ersatzlos weg: Die Auszeichnung
    //  «rechtlicher Hinweis» trägt die sichtbare Summary-Zeile im Wortlaut.
    //  Die beiden anderen `role="note"`-Fundorte (ArtikelBody-Popover,
    //  ErlassLeserKopf) sitzen auf <span>/<div> und bleiben unberührt.
    <details className="lc-notice">
      <summary className="lc-overline cursor-pointer">Rechtlicher Hinweis – keine Rechtsberatung</summary>
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
