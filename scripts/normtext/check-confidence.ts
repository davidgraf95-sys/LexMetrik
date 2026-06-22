/**
 * check-confidence — läuft die Treue-Gates (confidence-logik.ts) über die
 * bestehenden Norm-Snapshots und erzeugt einen Confidence-Report + Quarantäne-
 * Liste. Zweck (FAHRPLAN-GESETZE-IMPORT-3TIER §3): den Korpus-Review-Fan-out
 * (1 Agent pro Gesetz) durch maschinelle Vorfilterung ersetzen — der Mensch sieht
 * nur noch Erlasse mit score < Schwelle.
 *
 * Doppelnutzen: über den HEUTIGEN Korpus gelaufen ist dies der Kalibrierungs-
 * Akzeptanztest — findet das Gate die bekannten Befunde (22.6.: 58/150) wieder?
 *
 * Aufruf:  vite-node scripts/normtext/check-confidence.ts [-- --schwelle=0.95] [--datum=YYYY-MM-DD] [--schreibe]
 * §2: die Bewertung ist rein (confidence-logik); dieser Runner ist nur FS-Hülle.
 */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { pruefeTreue, bewerteConfidence, type SnapArtikel, type TreueFlag } from './confidence-logik.ts';

interface SnapshotEintrag {
  artikel: string;
  artikelLabel: string;
  bloecke: SnapArtikel['bloecke'];
}
interface SnapshotDatei {
  eintraege: SnapshotEintrag[];
}

interface ErlassBefund {
  datei: string;
  ebene: 'bund' | 'kanton';
  key: string;
  artikelTotal: number;
  score: number;
  vetos: number;
  flags: TreueFlag[];
}

function ladeErlasse(basis: string, ebene: 'bund' | 'kanton'): ErlassBefund[] {
  const dir = join(basis, ebene);
  const befunde: ErlassBefund[] = [];
  for (const name of readdirSync(dir).filter((n) => n.endsWith('.json') && n !== 'index.json').sort()) {
    const datei = join(dir, name);
    const inhalt = JSON.parse(readFileSync(datei, 'utf-8')) as SnapshotDatei;
    if (!Array.isArray(inhalt.eintraege)) continue; // Manifest/Nicht-Snapshot überspringen
    const artikel: SnapArtikel[] = inhalt.eintraege.map((e) => ({
      artikel: e.artikel,
      artikelLabel: e.artikelLabel,
      bloecke: e.bloecke,
    }));
    const flags = pruefeTreue(artikel);
    const conf = bewerteConfidence(flags);
    befunde.push({
      datei: `${ebene}/${name}`,
      ebene,
      key: name.replace(/\.json$/, ''),
      artikelTotal: artikel.length,
      score: conf.score,
      vetos: conf.vetos.length,
      flags,
    });
  }
  return befunde;
}

function arg(name: string): string | undefined {
  const p = process.argv.find((a) => a.startsWith(`--${name}=`));
  return p ? p.slice(name.length + 3) : undefined;
}

const basis = join(process.cwd(), 'public', 'normtext');
const schwelle = Number(arg('schwelle') ?? '0.95');
const befunde = [...ladeErlasse(basis, 'bund'), ...ladeErlasse(basis, 'kanton')];

// Aggregation
const klassen: Record<string, number> = {};
let flagsTotal = 0;
for (const b of befunde) {
  for (const f of b.flags) {
    klassen[f.klasse] = (klassen[f.klasse] ?? 0) + 1;
    flagsTotal++;
  }
}
const autoAkzept = befunde.filter((b) => b.score >= schwelle);
const quarantaene = befunde.filter((b) => b.score < schwelle).sort((a, b) => a.score - b.score);

console.log(`\n── Confidence-Report über ${befunde.length} Erlasse (Schwelle ${schwelle}) ──`);
console.log(`Auto-Akzept (score ≥ ${schwelle}): ${autoAkzept.length}  (${((autoAkzept.length / befunde.length) * 100).toFixed(0)} %)`);
console.log(`Quarantäne (Review nötig):        ${quarantaene.length}`);
console.log(`Treue-Flags gesamt: ${flagsTotal}`);
console.log('Flag-Klassen:', JSON.stringify(klassen));
console.log('\nTop-Quarantäne (niedrigster Score zuerst):');
for (const b of quarantaene.slice(0, 15)) {
  const harte = b.flags.filter((f) => f.schwere === 'hart').length;
  console.log(`  ${b.score.toFixed(2)}  ${b.datei}  (${b.flags.length} Flags, ${harte} hart, ${b.artikelTotal} Art.)`);
}

if (process.argv.includes('--schreibe')) {
  const datum = arg('datum');
  const out = {
    ...(datum ? { erzeugt: datum } : {}),
    schwelle,
    zusammenfassung: { erlasse: befunde.length, autoAkzept: autoAkzept.length, quarantaene: quarantaene.length, klassen },
    erlasse: befunde.map((b) => ({
      datei: b.datei, ebene: b.ebene, key: b.key, artikelTotal: b.artikelTotal,
      score: b.score, vetos: b.vetos,
      flags: b.flags.map((f) => ({ artikel: f.artikel, klasse: f.klasse, schwere: f.schwere, detail: f.detail })),
    })),
  };
  const ziel = join(basis, 'confidence.json');
  writeFileSync(ziel, JSON.stringify(out, null, 2) + '\n');
  console.log(`\ngeschrieben: ${ziel}`);
}
