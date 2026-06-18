/**
 * Runner: schreibt das Browse-Manifest public/normtext/register.json aus
 * Register × Snapshots. Getrennt vom reinen Modul browse-manifest.ts, damit
 * dieses ohne Seiteneffekt importierbar bleibt (normtext-snapshot.ts).
 *
 * §2: --datum kommt aus der Shell (kein Date.now in Logik).
 * Aufruf: npm run normtext:register -- --datum=$(date +%F)
 */
import { writeFileSync } from 'node:fs';
import { baueBrowseManifest, REGISTER_PFAD } from './browse-manifest.ts';

const datumArg = process.argv.find((a) => a.startsWith('--datum='));
const erzeugt = datumArg ? datumArg.slice('--datum='.length) : '';
if (!/^\d{4}-\d{2}-\d{2}$/.test(erzeugt)) {
  console.error('browse-manifest-run: --datum=YYYY-MM-DD erforderlich (§2).');
  process.exit(1);
}

const manifest = baueBrowseManifest(erzeugt);
writeFileSync(REGISTER_PFAD, JSON.stringify(manifest, null, 2) + '\n', 'utf8');
const bund = manifest.erlasse.filter((e) => e.ebene === 'bund').length;
const kanton = manifest.erlasse.filter((e) => e.ebene === 'kanton').length;
console.log(`Browse-Manifest: ${REGISTER_PFAD} — ${manifest.erlasse.length} Erlasse (${bund} Bund, ${kanton} Kanton)`);
