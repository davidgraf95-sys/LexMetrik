// scripts/entstehung/deckung-projektion-run.ts — Generator der Deckungs-Sicht
// (`npm run gen:entstehung-deckung`).
//
// Reine Datei-Arbeit (§3): liest die vorhandenen, bereits gegateten Artefakte,
// ruft die Ableitung (`./deckung-projektion.ts`) und schreibt
// `public/materialien/entstehung-deckung.json`. KEIN Netz, keine Uhr — die
// Stände kommen aus den Quellen selbst (§2/§5).
//
//   npm run gen:entstehung-deckung            # schreibt
//   npm run gen:entstehung-deckung -- --check # nur prüfen (Tor-Modus)

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import {
  baueDeckungProjektion, serialisiereDeckungProjektion, DECKUNG_PROJEKTION_PFAD,
  leseDeckungQuellen,
} from './deckung-projektion-quellen.ts';

const pruefe = process.argv.includes('--check');

const eingabe = leseDeckungQuellen();
const soll = serialisiereDeckungProjektion(baueDeckungProjektion(eingabe));

const ist = existsSync(DECKUNG_PROJEKTION_PFAD)
  ? readFileSync(DECKUNG_PROJEKTION_PFAD, 'utf8')
  : null;

const erlasse = Object.keys(eingabe.deckung.erlasse).length;
console.log(
  `Deckungs-Projektion: ${erlasse} Erlasse · ${eingabe.synopse.size} mit Synopse-Fenster · `
  + `${eingabe.entstehung.size} mit Entstehungs-Projektion · ${eingabe.curia.geschaefte} Curia-Geschäfte · `
  + `${(Buffer.byteLength(soll) / 1024).toFixed(1)} KB`,
);

if (ist === soll) {
  if (pruefe) console.log('check: die ausgelieferte Deckungs-Projektion ist byte-gleich zur Neuberechnung.');
  else console.log(`unverändert: ${DECKUNG_PROJEKTION_PFAD}`);
  process.exit(0);
}

if (pruefe) {
  console.error(
    `\ncheck: ${DECKUNG_PROJEKTION_PFAD} deckt sich NICHT mit der Neuberechnung aus den Quellen `
    + `(${ist === null ? 'Datei fehlt' : `${ist.length} → ${soll.length} Zeichen`}).\n`
    + '«npm run gen:entstehung-deckung» ausführen und den Diff prüfen (§2/§5).',
  );
  process.exit(1);
}

writeFileSync(DECKUNG_PROJEKTION_PFAD, soll);
console.log(`geschrieben: ${DECKUNG_PROJEKTION_PFAD}`);
