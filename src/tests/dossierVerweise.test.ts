import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join } from 'node:path';

// ─── G4.1: Code ↔ Bibliothek bidirektional (FAHRPLAN-GRUNDLAGEN) ─────────────
// Jedes fachtragende src/lib-Modul nennt sein(e) Bibliotheks-Dossier(s) im
// Kopf (`// Dossier: …`); diese Tests sichern beide Richtungen:
//  (1) jeder Dossier-Verweis zeigt auf eine EXISTIERENDE Datei (kein toter
//      Rückweg nach einer Umbenennung),
//  (2) die fachtragenden Kern-Module TRAGEN den Kopf (neue Engines fallen
//      auf, wenn sie ohne Bibliotheks-Anker gebaut werden, §11).

const libDateien = (dir: string): string[] =>
  readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    if (statSync(p).isDirectory()) return libDateien(p);
    return /\.tsx?$/.test(n) ? [p] : [];
  });

describe('Dossier-Kopfkommentare (Code ↔ Bibliothek)', () => {
  it('jeder // Dossier:-Verweis in src/lib zeigt auf existierende Dateien', () => {
    const tote: string[] = [];
    for (const datei of libDateien('src/lib')) {
      const kopf = readFileSync(datei, 'utf-8').split('\n').slice(0, 5).join('\n');
      const m = kopf.match(/^\/\/ Dossier: (.+)$/m);
      if (!m) continue;
      for (const ziel of m[1].split(' · ')) {
        if (!existsSync(ziel.trim())) tote.push(`${datei} → ${ziel.trim()}`);
      }
    }
    expect(tote, 'tote Dossier-Verweise — Pfad in der Kopfzeile nachführen').toEqual([]);
  });

  it('fachtragende Kern-Module tragen den Dossier-Kopf', () => {
    const pflicht = [
      'src/lib/zpoFristen.ts', 'src/lib/schkgFristen.ts', 'src/lib/erbFristen.ts',
      'src/lib/zustaendigkeit.ts', 'src/lib/schkgZustaendigkeit.ts',
      'src/lib/strafZustaendigkeit.ts', 'src/lib/strafRechtsmittel.ts',
      'src/lib/erbteilung.ts', 'src/lib/streitwert.ts', 'src/lib/gebvKosten.ts',
      'src/lib/mietrecht.ts', 'src/lib/sperrfristen.ts', 'src/lib/kuendigungsfrist.ts',
      'src/lib/lohnfortzahlung.ts', 'src/lib/gruendungsunterlagen.ts',
      'src/lib/notariate.ts', 'src/lib/vorlagen/arbeitsvertrag.ts',
      'src/lib/vorlagen/mietvertrag.ts', 'src/lib/vorlagen/gruendungGmbhDokumente.ts',
      'src/lib/vorlagen/gruendungAgDokumente.ts', 'src/lib/vorlagen/kapitalerhoehung.ts',
    ];
    const ohne = pflicht.filter((p) => !/^\/\/ Dossier: /m.test(readFileSync(p, 'utf-8').split('\n').slice(0, 5).join('\n')));
    expect(ohne, 'Kern-Module ohne Dossier-Kopf (G4.1/§11)').toEqual([]);
  });
});
