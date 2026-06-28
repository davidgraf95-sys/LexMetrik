// ─── Generator: Verfalls-Register → UI-Datenmodul ─────────────────────────────
//
// Liest die SSoT bibliothek/register/parameter-verfall.md (geteilter Parser,
// §5) und schreibt src/data/verfallTermine.generated.ts — die Datenquelle der
// «Aktualität & Pflege»-Fläche (Methodik-Seite). Niemals von Hand editieren.
//
//   npm run gen:verfall            erzeugt/aktualisiert die JSON
//   npm run check:verfall-ui       prüft Drift (JSON ≠ Register) → exit 1
//
// Der Tagesbezug (verfallen/fällig) entsteht NICHT hier, sondern in der
// Anzeige-Schicht: die JSON enthält nur die statischen, datierten Einträge.
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { sammleTermine, registerStand } from './verfall-parse.ts';

const wurzel = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const REGISTER = resolve(wurzel, 'bibliothek/register/parameter-verfall.md');
const ZIEL = resolve(wurzel, 'src/data/verfallTermine.generated.ts');
const QUELLE_REL = 'bibliothek/register/parameter-verfall.md';

function baue(): string {
  const md = readFileSync(REGISTER, 'utf8');
  const { termine, manuell } = sammleTermine(md);
  // Deterministische Reihenfolge: nach Datum, dann Label (stabil).
  const sortiert = [...termine].sort((a, b) => a.datum.localeCompare(b.datum) || a.label.localeCompare(b.label));
  const termObjekte = sortiert.map((t) => ({
    label: t.label,
    datum: t.datum,
    quelle: t.quelle,
    ...(t.fundstelle ? { fundstelle: t.fundstelle } : {}),
    ...(t.wert ? { wert: t.wert } : {}),
    ...(t.rhythmus ? { rhythmus: t.rhythmus } : {}),
  }));
  // JSON.stringify sichert das korrekte Escaping (Apostrophe «60'500», Backticks, «»).
  const kopf =
    '// ─── GENERIERT aus ' + QUELLE_REL + ' via `npm run gen:verfall` ──────────\n' +
    '// NICHT von Hand editieren. Quelle (SSoT §5) ist das Register; Drift-Tor:\n' +
    '// `npm run check:verfall-ui`. Der Tagesbezug (verfallen/fällig) entsteht\n' +
    '// erst in der Anzeige-Schicht (Methodik-Seite), nicht hier.\n\n';
  return (
    kopf +
    'export type VerfallTermin = {\n' +
    '  label: string;\n' +
    '  datum: string; // ISO YYYY-MM-DD\n' +
    "  quelle: 'Tabelle' | 'Freitext';\n" +
    '  fundstelle?: string;\n' +
    '  wert?: string;\n' +
    '  rhythmus?: string;\n' +
    '};\n\n' +
    'export const VERFALL_STAND = ' + JSON.stringify(registerStand(md)) + ';\n' +
    'export const VERFALL_QUELLE = ' + JSON.stringify(QUELLE_REL) + ';\n' +
    'export const VERFALL_MANUELL_ANZAHL = ' + manuell.length + ';\n\n' +
    'export const VERFALL_TERMINE: VerfallTermin[] = ' + JSON.stringify(termObjekte, null, 2) + ';\n'
  );
}

const istCheck = process.argv.includes('--check');
const neu = baue();

if (istCheck) {
  let alt = '';
  try {
    alt = readFileSync(ZIEL, 'utf8');
  } catch {
    console.error('check:verfall-ui: ' + ZIEL + ' fehlt — `npm run gen:verfall` ausführen.');
    process.exit(1);
  }
  if (alt !== neu) {
    console.error('check:verfall-ui: src/data/verfallTermine.generated.ts ist VERALTET gegenüber dem Register (§5) — `npm run gen:verfall` ausführen und committen.');
    process.exit(1);
  }
  console.log('check:verfall-ui: UI-Datenmodul synchron mit dem Register.');
} else {
  writeFileSync(ZIEL, neu, 'utf8');
  const { termine } = sammleTermine(readFileSync(REGISTER, 'utf8'));
  console.log('gen:verfall: ' + termine.length + ' terminierte Einträge → src/data/verfallTermine.generated.ts');
}
