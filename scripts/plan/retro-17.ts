// scripts/plan/retro-17.ts — `npm run retro:17`, Stufe 2 des Schritts QS-SELBSTOPT
// («dann deuten, manuell»; Fahrplan-§ «Selbstoptimierender Bau»).
//
// Diese Datei ist NUR die Kommandozeile: Datei wählen, lesen, Schema prüfen,
// Bericht drucken. Die gesamte Deutung — Schwellen, Regeln, Formulierung —
// liegt rein in `./retro17Kern.ts` und ist dort testbar (Begründung des
// Schnitts im Kopf jener Datei).
//
// Was das Werkzeug NICHT tut, bleibt sein wichtigstes Merkmal: es schreibt
// keine Datei, committet nicht und öffnet keinen PR. Die Ausgabe ist ein als
// ENTWURF markierter Vorschlagsblock auf stdout, über dessen Übernahme die
// lesende Session entscheidet.
//
// Aufruf:  npm run retro:17
//          npm run retro:17 -- --datei <pfad>   (andere Zeitreihe, für Proben)
//
// Drittes Datum für Regel (h) (Ergänzung QS-FREMDAGENTEN 4.9.2026): diese CLI
// liest zusätzlich `bibliothek/register/antigravity-stand.json` (falls
// vorhanden) und reicht dessen `letzte_sichtung` an `bericht()` durch —
// `retro17Kern.ts` selbst öffnet weiterhin nur Zeitreihe + Chronik (s. dort).
import { existsSync, readFileSync } from 'node:fs';
import { ZEITREIHE_DATEI, pruefeZeitreihe, type Zeitreihe } from './selbstoptKern';
import { CHRONIK_DATEI, bericht } from './retro17Kern';

/** Steuer-Register, identisch mit `scripts/analyse/fremdagenten-messung.ts`. */
const ANTIGRAVITY_REGISTER = 'bibliothek/register/antigravity-stand.json';

if (!process.env.VITEST) {
  const i = process.argv.indexOf('--datei');
  const pfad = i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : ZEITREIHE_DATEI;

  if (!existsSync(pfad)) {
    console.log(`retro:17 — noch keine Messreihe unter ${pfad}.`);
    console.log('Stufe 1 zuerst: `npm run selbstopt:erheben` (mehrfach, über mehrere Bau-Tage).');
    process.exit(0);
  }
  const roh = readFileSync(pfad, 'utf8');
  const beanstandet = pruefeZeitreihe(roh);
  if (beanstandet.length) {
    // Eine defekte Messreihe zu deuten hiesse, aus kaputten Zahlen Plan-Vorschläge
    // zu bauen — schlimmer als kein Vorschlag.
    console.error(`retro:17 ROT — Messreihe nicht schema-valide (dieselben Befunde meldet \`npm run check:plan\`):\n  - ${beanstandet.join('\n  - ')}`);
    process.exit(1);
  }
  const chronik = existsSync(CHRONIK_DATEI) ? readFileSync(CHRONIK_DATEI, 'utf8') : '';
  let letzteSichtungAntigravity: string | null = null;
  if (existsSync(ANTIGRAVITY_REGISTER)) {
    try {
      const reg = JSON.parse(readFileSync(ANTIGRAVITY_REGISTER, 'utf8')) as { letzte_sichtung?: string };
      letzteSichtungAntigravity = reg.letzte_sichtung ?? null;
    } catch {
      // Register kaputt/unlesbar ⇒ Regel (h) schweigt (§8: degradieren, nicht abstürzen).
    }
  }
  for (const zeile of bericht(JSON.parse(roh) as Zeitreihe, chronik, letzteSichtungAntigravity)) console.log(zeile);
}
