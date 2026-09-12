// scripts/entstehung/deckel.ts — Mess-Werkzeug der Deckel-Klassen von
// `check:entstehung` (§11.6): Grössenmessung, Formatierung und die Klasse
// «Verfahrens-Ereignisse». Eigene Datei, weil das Tor sonst über die §6.6-Schwelle
// wächst — reiner Auszug, keine Verhaltensänderung (die Tor-Ausgabe ist Zeile für
// Zeile dieselbe). Die DECKEL-TABELLE bleibt im Tor: dort gehören die Zahlen hin,
// die ein Prüfer zuerst sucht.
//
// BLINDFLECK GESCHLOSSEN (12.9.2026, §17-Wurzel): bis dahin mass diese Klasse
// Roh-Bytes in `src/lib/materialien/botschaften.generated.ts` — EINE Quelldatei, also
// nur den Bund. Die 117 BS-Ketten aus #799 (52,7 KB roh = 40 % des Bestandes) waren
// unsichtbar, ein ZH-Generator mit eigener `*.generated.ts` wäre es ebenso gewesen.
// Gemessen wird jetzt die Projektion, in der ALLE Herkünfte zusammenlaufen; Einheit
// gzip wie die Datei-Deckel daneben (deklariert). Ist 12.9.2026: 16,0 KB über 521
// Ketten (Bund 407 + BS 114), ZH-Prognose ~28,8 KB = 48 % von 60 KB.
// Herleitung: bibliothek/materialien/2026-09-12-register-deckel-messung.md.
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';

/** Grösse einer Datei ODER eines Verzeichnisses (rekursiv); `null` = existiert nicht.
 *  `gzip` misst die ausgelieferte Grösse, nicht die auf der Platte. */
export function groesse(pfad: string, gzip: boolean): number | null {
  if (!existsSync(pfad)) return null;
  const s = statSync(pfad);
  if (s.isFile()) return gzip ? gzipSync(readFileSync(pfad)).length : s.size;
  let summe = 0;
  for (const f of readdirSync(pfad)) {
    const t = join(pfad, f);
    const st = statSync(t);
    summe += st.isDirectory() ? (groesse(t, gzip) ?? 0) : (gzip ? gzipSync(readFileSync(t)).length : st.size);
  }
  return summe;
}

export const kb = (n: number): string => `${(n / 1024).toFixed(1)} KB`;

export const EREIGNIS_QUELLE = 'public/materialien/register-provenienz.json';
export const EREIGNIS_DECKEL = 60 * 1024;

/** Ausgabezeile + Fehler der Klasse (rein bis auf das Lesen der Projektion). */
export function pruefeVerfahrensEreignisse(
  quelle: string = EREIGNIS_QUELLE,
  max: number = EREIGNIS_DECKEL,
): { zeile: string | null; fehler: string[] } {
  if (!existsSync(quelle)) {
    return {
      zeile: null,
      fehler: [`${quelle} fehlt — Verfahrensketten nicht messbar ('npm run materialien -- --datum=$(date +%F)').`],
    };
  }
  const prov = JSON.parse(readFileSync(quelle, 'utf8')) as {
    eintraege: Record<string, { ereignisse?: unknown[] }>;
  };
  const ketten: Record<string, unknown[]> = {};
  for (const [key, e] of Object.entries(prov.eintraege)) {
    if (e.ereignisse?.length) ketten[key] = e.ereignisse;
  }
  const anzahl = Object.keys(ketten).length;
  const bytes = gzipSync(Buffer.from(JSON.stringify(ketten), 'utf8')).length;
  const fehler: string[] = [];
  if (bytes > max) fehler.push(`Deckel gerissen: Verfahrens-Ereignisse ${kb(bytes)} > ${kb(max)} in ${quelle}.`);
  if (anzahl === 0) fehler.push(`${quelle} trägt keine Verfahrensketten mehr — E1 rückgebaut? (Generator neu laufen.)`);
  return {
    zeile: `  Verfahrens-Ereignisse  ${kb(bytes).padStart(10)} / ${kb(max).padStart(10)}  (${((bytes / max) * 100).toFixed(0)} %, ${anzahl} Ketten) gzip`,
    fehler,
  };
}
