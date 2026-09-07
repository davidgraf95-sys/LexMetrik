/**
 * scripts/normtext/zh-text.ts — gemeinsame Text-Kleinteile der ZH-Extraktion.
 *
 * Herausgezogen 31.8.2026 (§6.6 Datei-Schlankheit): sowohl der §-Parser als
 * auch die Tarif-Geometrie fügen umbrochene Zeilen zusammen. Reine Funktionen,
 * kein Netz, kein FS (§2).
 */

/** Silbentrennung am Zeilenende zusammenfügen: «…wer-» + «den.» → «…werden.».
 *  Nur wenn die Zeile auf «-» endet und die nächste mit Kleinbuchstabe beginnt
 *  (echte Worttrennung; ein «-» vor Grossbuchstabe/Ziffer bleibt erhalten). */
export function fuegeZeilen(roh: string[]): string {
  let out = '';
  for (let i = 0; i < roh.length; i++) {
    const zeile = roh[i];
    const naechste = roh[i + 1] ?? '';
    if (/[a-zäöüé]-$/.test(zeile) && /^[a-zäöüé]/.test(naechste)) {
      // Trennstrich entfernen, nächste Zeile direkt anhängen (ohne Leerzeichen).
      out += zeile.slice(0, -1);
    } else {
      out += zeile + (i < roh.length - 1 ? ' ' : '');
    }
  }
  return out.replace(/\s+/g, ' ').trim();
}

