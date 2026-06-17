/**
 * Runner: erzeugt die Struktur-Sidecars public/normtext/struktur/bund/<KEY>.json
 * (Gliederung + Marginalien je Artikel) aus den gecachten Fedlex-HTMLs.
 *
 * Voraussetzung: `bash scripts/fedlex-cache.sh` hat /tmp/<key>.html erzeugt
 * (gleiche Quelle wie die Bund-Snapshots). §2: --datum aus der Shell.
 * Reine Präsentations-Anreicherung — Snapshots/Golden bleiben unberührt (§3/§6).
 *
 * Aufruf: npm run normtext:struktur -- --datum=$(date +%F)
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { extrahiereStruktur } from './struktur-extrahiere.ts';
import { ERLASS_REGISTER } from '../../src/lib/normtext/register.ts';

const datumArg = process.argv.find((a) => a.startsWith('--datum='));
const erzeugt = datumArg ? datumArg.slice('--datum='.length) : '';
if (!/^\d{4}-\d{2}-\d{2}$/.test(erzeugt)) {
  console.error('struktur-run: --datum=YYYY-MM-DD erforderlich (§2).');
  process.exit(1);
}

const ZIEL = 'public/normtext/struktur/bund';
mkdirSync(ZIEL, { recursive: true });

const bund = ERLASS_REGISTER.filter((r) => r.ebene === 'bund' && r.status === 'snapshot');
let geschrieben = 0;
const fehlend: string[] = [];

for (const reg of bund) {
  const cache = `/tmp/${reg.key.toLowerCase()}.html`;
  if (!existsSync(cache)) { fehlend.push(reg.key); continue; }
  const html = readFileSync(cache, 'utf8');
  const struktur = extrahiereStruktur(html);
  const anzahl = Object.keys(struktur).length;
  if (anzahl === 0) { fehlend.push(`${reg.key}(0)`); continue; }
  // Deterministisch sortierte Token-Schlüssel für diff-freundliches JSON.
  const sortiert: Record<string, unknown> = {};
  for (const tok of Object.keys(struktur).sort()) sortiert[tok] = struktur[tok];
  writeFileSync(`${ZIEL}/${reg.key}.json`, JSON.stringify({ erzeugt, artikel: sortiert }, null, 1) + '\n', 'utf8');
  geschrieben++;
}

console.log(`Struktur-Sidecars: ${geschrieben}/${bund.length} Bund-Erlasse → ${ZIEL}/`);
if (fehlend.length) console.log(`Ohne Cache/leer (übersprungen): ${fehlend.join(', ')}  — ggf. 'bash scripts/fedlex-cache.sh' laufen lassen`);
