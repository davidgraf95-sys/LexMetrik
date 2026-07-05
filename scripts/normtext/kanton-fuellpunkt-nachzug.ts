// Kanton-Nachzug der Füllpunkt-Tarifzeilen (G3b Schritt 3, Klasse C, 5.7.2026).
// Re-projiziert die committeten SG-Snapshots über den ERWEITERTEN Füllpunkt-Parser
// (`extrahiereTarifTabelle` → jetzt mit `nachtext`, verdrahtet in `reichereTabellen`)
// — OHNE PDF-Refetch, damit KEIN Fremd-Drift entsteht (§1/§7).
//
// Warum das deterministisch identisch zu einem frischen Generatorlauf ist: die 159
// betroffenen SG-Blöcke gingen im alten Parser durch DEFECT-1 als `null` zurück →
// `reichereTabellen` liess ihren `text` UNVERÄNDERT. Der committete `text` IST also
// die rohe Extraktionsausgabe vor der Tableisierung. Dieselbe `reichereTabellen` neu
// auf die committeten Blöcke anzuwenden, produziert exakt, was ein frischer PDF-Lauf
// (extrahiere → baueBloecke → reichereTabellen) erzeugte: die sauberen Leader-Zeilen
// werden tableisiert, die trailing-Prosa wird als Geschwister-Text-Block bewahrt.
// Bereits tableisierte Blöcke (text==='') werden übersprungen (idempotent).
//
// Pro geänderten Eintrag wird der §7-Drift-`sha` mit der geteilten `sha256Bloecke`
// neu berechnet und der Golden-Merge-Basis-Index golden/normtext-snapshot.json
// nachgezogen.
//
//   vite-node scripts/normtext/kanton-fuellpunkt-nachzug.ts -- SG-3849 SG-2935 SG-2808
// Ohne Argumente: die G3b-Schritt-3-Liste (SG-Füllpunkt-Rest).
import { readFileSync, writeFileSync } from 'node:fs';
import { reichereTabellen, type PdfBlock } from './adapter-pdf.ts';
import { sha256Bloecke } from './sha-bloecke.ts';
import type { NormSnapshotDatei } from '../../src/lib/normtext/typen.ts';

const KANTON_DIR = 'public/normtext/kanton';
const GOLDEN_MAP = 'golden/normtext-snapshot.json';

const STANDARD_LISTE = ['SG-3849', 'SG-2935', 'SG-2808'];

function main(): void {
  const args = process.argv.slice(2).filter((a) => a !== '--');
  const liste = args.length > 0 ? args : STANDARD_LISTE;

  const goldenText = readFileSync(GOLDEN_MAP, 'utf8');
  const golden = JSON.parse(goldenText) as Record<string, string>;
  let goldenGeaendert = 0;

  let dateienGeaendert = 0;
  let eintraegeGeaendert = 0;
  let neueTabellen = 0;
  let neueTextBloecke = 0;

  for (const name of liste) {
    const pfad = `${KANTON_DIR}/${name}.json`;
    const original = readFileSync(pfad, 'utf8');
    const trailingNl = original.endsWith('\n');
    const datei = JSON.parse(original) as NormSnapshotDatei;

    let dateiTouched = false;
    for (const eintrag of datei.eintraege ?? []) {
      const bloecke = (eintrag.bloecke ?? []) as unknown as PdfBlock[];
      const vorher = JSON.stringify(bloecke);
      const tabVorher = bloecke.filter((b) => b.tabelle && b.tabelle.length > 0).length;
      const anzahlVorher = bloecke.length;

      // EXAKT die produktive Generator-Logik (kein Re-Implement) → §7-Identität.
      reichereTabellen(bloecke);

      if (JSON.stringify(bloecke) === vorher) continue;

      const neuerSha = sha256Bloecke(
        bloecke as Parameters<typeof sha256Bloecke>[0],
      );
      (eintrag as { sha: string }).sha = neuerSha;
      if (golden[eintrag.id] !== undefined && golden[eintrag.id] !== neuerSha) {
        golden[eintrag.id] = neuerSha;
        goldenGeaendert++;
      }
      neueTabellen += bloecke.filter((b) => b.tabelle && b.tabelle.length > 0).length - tabVorher;
      neueTextBloecke += bloecke.length - anzahlVorher;
      eintraegeGeaendert++;
      dateiTouched = true;
    }

    if (dateiTouched) {
      writeFileSync(pfad, JSON.stringify(datei, null, 2) + (trailingNl ? '\n' : ''), 'utf8');
      dateienGeaendert++;
      console.log(`  ✓ ${name}.json`);
    } else {
      console.log(`  · ${name}.json — keine Legacy-Füllpunkt-Blöcke (übersprungen)`);
    }
  }

  if (goldenGeaendert > 0) {
    const goldenTrailingNl = goldenText.endsWith('\n');
    writeFileSync(GOLDEN_MAP, JSON.stringify(golden, null, 2) + (goldenTrailingNl ? '\n' : ''), 'utf8');
  }

  console.log(
    `\n[kanton-fuellpunkt-nachzug] ${dateienGeaendert} Datei(en), ${eintraegeGeaendert} Eintrag/Einträge, ` +
      `+${neueTabellen} Tarif-Tabelle(n), +${neueTextBloecke} Nachtext-Block/Blöcke. ` +
      `Golden-sha: ${goldenGeaendert} aktualisiert.`,
  );
}

main();
