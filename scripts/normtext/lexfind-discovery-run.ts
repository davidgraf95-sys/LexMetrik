/**
 * lexfind-discovery-run — CLI über die LexFind-Discovery: enumeriert Kantone und
 * gibt eine Tier-Inventur aus (wie viele Erlasse pro Kanton sind strukturiert =
 * Tier A erschliessbar). Read-only auf LexFind (Entdeckung, §7-Komfortschicht).
 *
 * Aufruf:
 *   vite-node scripts/normtext/lexfind-discovery-run.ts -- --kantone=AR,GR,SG
 *   vite-node scripts/normtext/lexfind-discovery-run.ts -- --alle [--schreibe --datum=YYYY-MM-DD]
 *
 * §2: Enumeration/Klassifikation in lexfind-discovery.ts; dies ist nur CLI-Hülle.
 */
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  enumeriereKanton,
  tierVerteilung,
  LEXFIND_ENTITY,
  type EntdeckterErlass,
  type Tier,
} from './lexfind-discovery.ts';

function arg(name: string): string | undefined {
  const p = process.argv.find((a) => a.startsWith(`--${name}=`));
  return p ? p.slice(name.length + 3) : undefined;
}

// Kantone (ohne Bund=CH, der läuft über Fedlex). FR/VS/GE/NE/JU/TI sind primär
// frankophon/italophon → Sprachpfad entsprechend.
const KANTON_LANG: Record<string, 'de' | 'fr' | 'it'> = {
  FR: 'fr', VS: 'fr', GE: 'fr', NE: 'fr', JU: 'fr', VD: 'fr', TI: 'it',
};

const alle = Object.keys(LEXFIND_ENTITY).filter((k) => k !== 'CH');
const kantone = process.argv.includes('--alle')
  ? alle
  : (arg('kantone') ?? 'AR').split(',').map((k) => k.trim().toUpperCase());

const zeilen: Array<{ kanton: string; total: number; v: Record<Tier, number> }> = [];
const details: Record<string, EntdeckterErlass[]> = {};

for (const kanton of kantone) {
  if (LEXFIND_ENTITY[kanton] == null) {
    console.error(`  übersprungen (unbekannt): ${kanton}`);
    continue;
  }
  try {
    const lang = KANTON_LANG[kanton] ?? 'de';
    const erlasse = await enumeriereKanton(kanton, { lang, nurInKraft: true });
    const v = tierVerteilung(erlasse);
    zeilen.push({ kanton, total: erlasse.length, v });
    details[kanton] = erlasse;
    const a = ((v['A-struktur'] / Math.max(1, erlasse.length)) * 100).toFixed(0);
    console.log(`  ${kanton.padEnd(3)} ${String(erlasse.length).padStart(4)} Erlasse  · Tier A ${String(v['A-struktur']).padStart(4)} (${a}%) · C ${v['C-pdf-embed']} · ?${v.unbekannt}`);
  } catch (e) {
    console.error(`  ${kanton}: FEHLER ${(e as Error).message}`);
  }
}

const sum = (sel: (z: typeof zeilen[number]) => number) => zeilen.reduce((s, z) => s + sel(z), 0);
console.log('\n── Summe ──');
console.log(`Kantone: ${zeilen.length} · Erlasse total: ${sum((z) => z.total)} · Tier A: ${sum((z) => z.v['A-struktur'])} · Tier C: ${sum((z) => z.v['C-pdf-embed'])} · unbekannt: ${sum((z) => z.v.unbekannt)}`);

if (process.argv.includes('--schreibe')) {
  const datum = arg('datum');
  const out = {
    ...(datum ? { erzeugt: datum } : {}),
    kantone: zeilen,
    erlasse: details,
  };
  const ziel = join(process.cwd(), 'bibliothek', 'recherche', 'lexfind-discovery-inventar.json');
  writeFileSync(ziel, JSON.stringify(out, null, 2) + '\n');
  console.log(`geschrieben: ${ziel}`);
}
