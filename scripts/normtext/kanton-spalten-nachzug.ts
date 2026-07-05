// Kanton-Nachzug aufs kanonische `spalten`-Modell (G3b Schritt 1, Klasse A+D,
// 5.7.2026). Re-projiziert die bereits extrahierten ·/—-Tabellen der committeten
// Kanton-Snapshots vom Legacy-`{kopf,zeilen}` auf das typisierte `{spalten,zeilen}`
// (T-B1/T-B4) — OHNE Netz-Refetch, damit KEIN Fremd-Drift entsteht (§1/§7): die
// Zellwerte bleiben BYTE-GLEICH, es kommt nur die Spalten-Typisierung hinzu. Genau
// die deterministische Projektion, die ein Voll-Generatorlauf mit derselben
// LexWork-Eingabe erzeugte (typisiereSpalten ist in reichereMehrspaltig verdrahtet).
//
// Pro geänderten Eintrag wird der §7-Drift-`sha` mit der geteilten Funktion
// sha256Bloecke neu berechnet und der Golden-Merge-Basis-Index
// golden/normtext-snapshot.json nachgezogen. Idempotent (Blöcke mit `spalten`
// werden übersprungen).
//
//   vite-node scripts/normtext/kanton-spalten-nachzug.ts -- NW-265.51 BS-154.810 …
// Ohne Argumente: die G3b-Schritt-1-Liste (Klasse A: NW/BS/SO/VS).
import { readFileSync, writeFileSync } from 'node:fs';
import { typisiereSpalten } from './mehrspaltige-tabelle.ts';
import { sha256Bloecke } from './sha-bloecke.ts';
import type { NormSnapshotDatei } from '../../src/lib/normtext/typen.ts';

const KANTON_DIR = 'public/normtext/kanton';
const GOLDEN_MAP = 'golden/normtext-snapshot.json';

const STANDARD_LISTE = [
  'NW-265.51',
  'BS-154.810',
  'BS-291.400',
  'SO-614.11',
  'VS-173.8-de',
  'VS-173.8-fr',
];

interface Block {
  absatz: string | null;
  text: string;
  mehrspaltig?: {
    kopf?: string[];
    spalten?: Array<{ typ: string; titel: string }>;
    zeilen: string[][];
  };
  [k: string]: unknown;
}

function main(): void {
  const args = process.argv.slice(2).filter((a) => a !== '--');
  const liste = args.length > 0 ? args : STANDARD_LISTE;

  const goldenText = readFileSync(GOLDEN_MAP, 'utf8');
  const golden = JSON.parse(goldenText) as Record<string, string>;
  let goldenGeaendert = 0;

  let dateienGeaendert = 0;
  let bloeckeGeaendert = 0;
  let eintraegeGeaendert = 0;

  for (const name of liste) {
    const pfad = `${KANTON_DIR}/${name}.json`;
    const original = readFileSync(pfad, 'utf8');
    const trailingNl = original.endsWith('\n');
    const datei = JSON.parse(original) as NormSnapshotDatei;

    let dateiTouched = false;
    for (const eintrag of datei.eintraege ?? []) {
      let eintragTouched = false;
      for (const block of (eintrag.bloecke ?? []) as Block[]) {
        const m = block.mehrspaltig;
        if (!m || !m.kopf || (m.spalten && m.spalten.length > 0)) continue;
        // Legacy → kanonisch. Werte (zeilen) unverändert; nur Typ-Metadaten neu.
        block.mehrspaltig = {
          spalten: typisiereSpalten(m.kopf, m.zeilen),
          zeilen: m.zeilen,
        };
        eintragTouched = true;
        bloeckeGeaendert++;
      }
      if (eintragTouched) {
        const neuerSha = sha256Bloecke(
          eintrag.bloecke as Parameters<typeof sha256Bloecke>[0],
        );
        (eintrag as { sha: string }).sha = neuerSha;
        // Golden-Merge-Basis (key === eintrag.id) nachziehen.
        if (golden[eintrag.id] !== undefined && golden[eintrag.id] !== neuerSha) {
          golden[eintrag.id] = neuerSha;
          goldenGeaendert++;
        }
        eintraegeGeaendert++;
        dateiTouched = true;
      }
    }

    if (dateiTouched) {
      writeFileSync(pfad, JSON.stringify(datei, null, 2) + (trailingNl ? '\n' : ''), 'utf8');
      dateienGeaendert++;
      console.log(`  ✓ ${name}.json`);
    } else {
      console.log(`  · ${name}.json — keine Legacy-Tabelle (übersprungen)`);
    }
  }

  if (goldenGeaendert > 0) {
    const goldenTrailingNl = goldenText.endsWith('\n');
    writeFileSync(GOLDEN_MAP, JSON.stringify(golden, null, 2) + (goldenTrailingNl ? '\n' : ''), 'utf8');
  }

  console.log(
    `\n[kanton-spalten-nachzug] ${dateienGeaendert} Datei(en), ${eintraegeGeaendert} Eintrag/Einträge, ` +
      `${bloeckeGeaendert} Tabellen-Block/Blöcke → kanonisch. Golden-sha: ${goldenGeaendert} aktualisiert.`,
  );
}

main();
