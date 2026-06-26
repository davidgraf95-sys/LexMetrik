/**
 * Runner: schreibt das Browse-Manifest public/materialien/register.json aus dem
 * MATERIAL_REGISTER. Getrennt vom reinen Modul material-manifest.ts, damit dieses
 * ohne Seiteneffekt importierbar bleibt (Tests/Generatoren).
 *
 * §2: --datum kommt aus der Shell (kein Date.now in der Logik).
 * Aufruf: npm run materialien -- --datum=$(date +%F)
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { baueMaterialManifest, REGISTER_PFAD } from './material-manifest.ts';

const datumArg = process.argv.find((a) => a.startsWith('--datum='));
const erzeugt = datumArg ? datumArg.slice('--datum='.length) : '';
if (!/^\d{4}-\d{2}-\d{2}$/.test(erzeugt)) {
  console.error('material-manifest-run: --datum=YYYY-MM-DD erforderlich (§2).');
  process.exit(1);
}

const manifest = baueMaterialManifest(erzeugt);
mkdirSync(dirname(REGISTER_PFAD), { recursive: true });
writeFileSync(REGISTER_PFAD, JSON.stringify(manifest, null, 2) + '\n', 'utf8');
const behoerden = new Set(manifest.materialien.map((m) => m.behoerde)).size;
console.log(`Material-Manifest: ${REGISTER_PFAD} — ${manifest.materialien.length} Materialien (${behoerden} Behörden)`);
