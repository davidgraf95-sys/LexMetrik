// ─── Verfalls-Prüfer: macht das Parameter-Verfallsregister maschinell ───────
//
// Liest bibliothek/register/parameter-verfall.md (SSoT §5 — Termine werden
// NICHT hier dupliziert) und prüft jede Zeile der Register-Tabelle (Spalte
// «Nächste Prüfung») sowie «bis DD.MM.YYYY»-Termine in den Freitext-Blöcken
// gegen das heutige Datum.
//
//   npm run check:verfall            (vite-node scripts/verfall-pruefen.ts)
//
// Exit 1  → mindestens ein Termin ist VERFALLEN (Deploy-Hindernis nach der
//           Register-Konvention Ziff. 3: kein stiller Weiterbetrieb, §8).
// Exit 0  → kein Verfall; bald fällige Termine (≤ VORLAUF_TAGE) als WARNUNG.
//
// Datums-Grammatik der Spalte «Nächste Prüfung» (alles andere gilt als
// manueller Eintrag und wird nur gezählt, nie geprüft):
//   «1.11.2026 (BE!)»        → exakter Tag
//   «Anfang Sept. 2026»      → 1. des Monats
//   «Jan. 2027» / «Juni 2027»→ 1. des Monats
//   «—», «offen …», «bei …», «vor …», «mit …», «nach …» → manuell
//
// Hinweis Determinismus: §2 CLAUDE.md betrifft die RECHENLOGIK der Engines.
// Dieses Skript ist Betriebs-Werkzeug — der Tagesbezug ist hier der Zweck.
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const VORLAUF_TAGE = 45;

const REGISTER = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '../bibliothek/register/parameter-verfall.md',
);

const MONATE: Record<string, number> = {
  jan: 1, feb: 2, maerz: 3, 'märz': 3, mar: 3, apr: 4, mai: 5,
  jun: 6, juni: 6, jul: 7, juli: 7, aug: 8, sep: 9, sept: 9,
  okt: 10, nov: 11, dez: 12,
};

type Termin = { label: string; datum: string; quelle: string };

/** «7.6.2026» → «2026-06-07» (ISO, vergleichbar als String). */
function iso(j: number, m: number, t: number): string {
  return `${j}-${String(m).padStart(2, '0')}-${String(t).padStart(2, '0')}`;
}

/** Extrahiert den FRÜHESTEN parsbaren Termin aus einer Zelle (oder null). */
function parseZelle(zelle: string): string | null {
  const treffer: string[] = [];
  // Form 1: exakter Tag «1.11.2026» (auch fett/mit Zusatz)
  for (const m of zelle.matchAll(/\b(\d{1,2})\.(\d{1,2})\.(\d{4})\b/g)) {
    treffer.push(iso(Number(m[3]), Number(m[2]), Number(m[1])));
  }
  // Form 2: Monatsname + Jahr («Anfang Sept. 2026», «Jan. 2027», «Juni 2027»)
  for (const m of zelle.matchAll(/\b([A-Za-zÄÖÜäöü]{3,9})\.?\s+(\d{4})\b/g)) {
    const monat = MONATE[m[1].toLowerCase()];
    if (monat) treffer.push(iso(Number(m[2]), monat, 1));
  }
  if (treffer.length === 0) return null;
  treffer.sort();
  return treffer[0];
}

function sammleTermine(md: string): { termine: Termin[]; manuell: string[] } {
  const termine: Termin[] = [];
  const manuell: string[] = [];
  const zeilen = md.split('\n');

  for (const zeile of zeilen) {
    // ── Register-Tabelle: | Parameter | Fundstelle | Wert | Rhythmus | Nächste Prüfung |
    if (zeile.startsWith('|') && !zeile.startsWith('|---') && !zeile.includes('Nächste Prüfung')) {
      const spalten = zeile.split('|').map((s) => s.trim()).filter((s, i, a) => !(s === '' && (i === 0 || i === a.length - 1)));
      if (spalten.length < 5) continue;
      const label = spalten[0].replace(/\*\*/g, '');
      const zelle = spalten[spalten.length - 1];
      const datum = parseZelle(zelle);
      if (datum) termine.push({ label, datum, quelle: 'Tabelle' });
      else manuell.push(`${label} («${zelle}»)`);
      continue;
    }
    // ── Freitext-Blöcke: «… BIS 30.6.2026 …» → Prüfung ist ab diesem Tag fällig
    const bis = zeile.match(/\bbis\s+(?:zum\s+)?\*{0,2}(\d{1,2})\.(\d{1,2})\.(\d{4})/i);
    if (bis && !zeile.startsWith('|')) {
      const label = zeile.replace(/^[-*\s]+/, '').replace(/\*\*/g, '').slice(0, 70);
      termine.push({ label, datum: iso(Number(bis[3]), Number(bis[2]), Number(bis[1])), quelle: 'Freitext' });
    }
  }
  return { termine, manuell };
}

// ─── Lauf ────────────────────────────────────────────────────────────────────
const md = readFileSync(REGISTER, 'utf8');
const { termine, manuell } = sammleTermine(md);

const jetzt = new Date();
const heute = iso(jetzt.getFullYear(), jetzt.getMonth() + 1, jetzt.getDate());
const vorlauf = new Date(jetzt.getTime() + VORLAUF_TAGE * 86_400_000);
const warnGrenze = iso(vorlauf.getFullYear(), vorlauf.getMonth() + 1, vorlauf.getDate());

const verfallen = termine.filter((t) => t.datum < heute);
const bald = termine.filter((t) => t.datum >= heute && t.datum <= warnGrenze);

console.log(`Verfallsregister: ${termine.length} terminierte Einträge geprüft, ${manuell.length} manuelle (Stand heute: ${heute})\n`);

for (const t of verfallen) console.log(`VERFALLEN  ${t.datum}  ${t.label}  [${t.quelle}]`);
for (const t of bald) console.log(`FÄLLIG     ${t.datum}  ${t.label}  [${t.quelle}]`);
if (manuell.length > 0) {
  console.log(`\nManuell (ohne festen Termin, nicht geprüft):`);
  for (const m of manuell) console.log(`  – ${m}`);
}

if (verfallen.length > 0) {
  console.log(`\n${verfallen.length} Termin(e) VERFALLEN — Register-Konvention Ziff. 3: verfallene Prüfung = Deploy-Hindernis für die betroffene Vorlage/den Rechner. Prüfen, nachführen, Register aktualisieren.`);
  process.exit(1);
}
if (bald.length > 0) {
  console.log(`\n${bald.length} Termin(e) in den nächsten ${VORLAUF_TAGE} Tagen fällig — einplanen.`);
}
console.log('Kein Verfall.');
