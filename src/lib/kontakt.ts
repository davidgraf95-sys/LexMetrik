// ─── Kontakt-Konfiguration ───────────────────────────────────────────────────
//
// Der Versandweg des Kontaktformulars ist noch NICHT definiert (David,
// 5.6.2026). Solange `KONTAKT_EMPFAENGER` null ist, zeigt die Kontakt-Seite
// das Formular mit ehrlichem Hinweis und deaktiviertem Versand (§8 – kein
// stilles Ins-Leere-Senden). Sobald die Adresse bzw. der Weg feststeht:
//   - E-Mail-Weg: Adresse hier eintragen → «Senden» öffnet das Mailprogramm
//     (mailto, kein Server, Eingaben verlassen den Browser nur in die Mail).
//   - Backend-Weg (später): diese Konstante durch einen API-Aufruf ersetzen;
//     die Seite ist darauf vorbereitet (eine Versandfunktion, eine Stelle).

export const KONTAKT_EMPFAENGER: string | null = null;

export type KontaktEingaben = {
  name: string;
  email: string;
  betreff: string;
  nachricht: string;
};

/** mailto-Link deterministisch aus den Eingaben (reine Funktion, testbar). */
export function kontaktMailto(empfaenger: string, e: KontaktEingaben): string {
  const betreff = encodeURIComponent(`[LexMetrik] ${e.betreff.trim() || 'Kontaktanfrage'}`);
  const body = encodeURIComponent(
    `${e.nachricht.trim()}\n\n—\nName: ${e.name.trim() || '–'}\nAntwort an: ${e.email.trim() || '–'}`,
  );
  return `mailto:${empfaenger}?subject=${betreff}&body=${body}`;
}
