// ─── UID (Unternehmens-Identifikationsnummer, CHE-xxx.xxx.xxx) ─────────────
//
// Dossier: bibliothek/recherche/zefix-api.md
//
// Rein und deterministisch (§2): Normalisierung + Prüfziffer nach eCH-0097
// (Mod-11 mit Gewichten 5,4,3,2,7,6,5,4 über die ersten 8 Ziffern; Rest 10
// = ungültige UID, Rest 11 = Prüfziffer 0). Handprobe im Test:
// CHE-105.829.940 → Summe 165, 165 mod 11 = 0 → 11-0 = 11 → Prüfziffer 0 ✓.
// Keine Netz-Zugriffe — der Zefix-Lookup lebt in der Darstellungsschicht
// (components/vorlagen/ZefixSuche.tsx, §3).

const GEWICHTE = [5, 4, 3, 2, 7, 6, 5, 4] as const;

/** Eingabe («CHE-105.829.940», «CHE105829940», «105.829.940», mit
 *  Leerzeichen/Punkten) → kanonisch «CHE-xxx.xxx.xxx», sonst null.
 *  Normalisiert NUR die Form; Prüfziffer separat via uidGueltig. */
export function uidNormalisieren(eingabe: string): string | null {
  const roh = eingabe.replace(/[\s.-]/g, '').toUpperCase();
  const ziffern = roh.startsWith('CHE') ? roh.slice(3) : roh;
  if (!/^\d{9}$/.test(ziffern)) return null;
  return `CHE-${ziffern.slice(0, 3)}.${ziffern.slice(3, 6)}.${ziffern.slice(6, 9)}`;
}

/** true, wenn die Eingabe normalisierbar ist UND die eCH-0097-Prüfziffer
 *  stimmt. Leere Eingabe ist nicht «gültig» (Aufrufer behandelt optional). */
export function uidGueltig(eingabe: string): boolean {
  const norm = uidNormalisieren(eingabe);
  if (!norm) return false;
  const z = norm.replace(/\D/g, '');
  const summe = GEWICHTE.reduce((s, g, i) => s + g * Number(z[i]), 0);
  const rest = 11 - (summe % 11);
  const pruefziffer = rest === 11 ? 0 : rest;
  if (rest === 10) return false; // eCH-0097: keine gültige UID
  return pruefziffer === Number(z[8]);
}
