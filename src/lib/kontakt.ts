// ─── Kontakt-Konfiguration ───────────────────────────────────────────────────
//
// Der Versandweg ist der mailto-Weg (David 3.7.2026): «Senden» öffnet das
// Mailprogramm des Nutzers, kein Server, Eingaben verlassen den Browser nur in
// die Mail. Die Empfänger-Adresse kommt aus der Umgebungsvariable
// `VITE_KONTAKT_EMPFAENGER` (in Vercel gesetzt) — so bleibt die Adresse aus der
// öffentlichen Git-Historie und ist ohne Commit änderbar. Ist sie NICHT gesetzt
// (lokal/CI/Prod-ohne-Env), bleibt `null` → das Formular zeigt weiter den ehrlichen
// Hinweis + deaktivierten Versand (§8, kein stilles Ins-Leere-Senden; verhaltensneutral).
// Backend-Weg (später): diese Konstante durch einen API-Aufruf ersetzen — die Seite
// ist darauf vorbereitet (eine Versandfunktion, eine Stelle).

export const KONTAKT_EMPFAENGER: string | null =
  (import.meta.env.VITE_KONTAKT_EMPFAENGER as string | undefined)?.trim() || null;

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
