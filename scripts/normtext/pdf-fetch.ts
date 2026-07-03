/**
 * pdf-fetch: lädt das amtliche Fedlex-PDF/A der 'pdf-embed'-Erlasse nach
 * public/normtext/pdf/<KEY>.pdf (same-origin, da Fedlex X-Frame-Options: DENY
 * setzt → Hotlink/iframe unmöglich) und schreibt eine Provenienz-/Drift-Index-
 * Datei public/normtext/pdf-index.json (sha256 + Bytes + Stand je Erlass).
 *
 * EINZIGE Quelle: src/lib/normtext/pdf-embed.ts (PDF_EMBED_QUELLEN) → wartungsarm.
 * Validierung (kein kaputter Embed): Magic-Bytes '%PDF' + Mindestgrösse.
 *
 * Aufruf: npm run normtext:pdf -- --datum=$(date +%F)
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { PDF_EMBED_QUELLEN, pdfaUrl } from '../../src/lib/normtext/pdf-embed.ts';

const datum = process.argv.find((a) => a.startsWith('--datum='))?.split('=')[1];
if (!datum) { console.error('--datum=YYYY-MM-DD nötig (§2)'); process.exit(1); }

const MIN_BYTES = 20_000; // unter ~20 kB ist es eine SPA-/Fehler-Shell, kein echtes PDF
const OUT_DIR = join(process.cwd(), 'public', 'normtext', 'pdf');
mkdirSync(OUT_DIR, { recursive: true });

interface IndexEintrag { sha: string; bytes: number; stand: string; eli: string; kons: string; quelleUrl: string; abgerufen: string; }
const index: Record<string, IndexEintrag> = {};
const fehler: string[] = [];

for (const q of PDF_EMBED_QUELLEN) {
  const url = pdfaUrl(q.eli, q.kons, q.pdfN);
  try {
    const res = await fetch(url);
    if (!res.ok) { fehler.push(`${q.key}: HTTP ${res.status} (${url})`); continue; }
    const buf = Buffer.from(await res.arrayBuffer());
    const magic = buf.subarray(0, 5).toString('latin1');
    if (!magic.startsWith('%PDF')) { fehler.push(`${q.key}: kein PDF (magic=${JSON.stringify(magic)})`); continue; }
    if (buf.length < MIN_BYTES) { fehler.push(`${q.key}: zu klein (${buf.length} B < ${MIN_BYTES}) — vermutlich Shell`); continue; }
    const sha = createHash('sha256').update(buf).digest('hex');
    writeFileSync(join(OUT_DIR, `${q.key}.pdf`), buf);
    index[q.key] = {
      sha, bytes: buf.length, stand: `${q.kons.slice(0, 4)}-${q.kons.slice(4, 6)}-${q.kons.slice(6, 8)}`,
      eli: q.eli, kons: q.kons, quelleUrl: `https://www.fedlex.admin.ch/eli/${q.eli}/de`, abgerufen: datum,
    };
    console.log(`  ok ${q.key.padEnd(8)} ${buf.length} B  sha ${sha.slice(0, 12)}…  (${q.eli}/${q.kons})`);
  } catch (e) {
    fehler.push(`${q.key}: ${e instanceof Error ? e.message : String(e)}`);
  }
}

if (fehler.length) {
  console.error(`\nBLOCKED: ${fehler.length} PDF(s) nicht ladbar/valide:\n  ${fehler.join('\n  ')}`);
  process.exit(1);
}

// Index deterministisch (sortierte Keys) — diff-stabil.
const sortiert: Record<string, IndexEintrag> = {};
for (const k of Object.keys(index).sort()) sortiert[k] = index[k];
writeFileSync(join(process.cwd(), 'public', 'normtext', 'pdf-index.json'),
  JSON.stringify({ erzeugt: datum, pdfs: sortiert }, null, 2) + '\n', 'utf8');
console.log(`\npdf-fetch: ${Object.keys(index).length} PDF(s) → public/normtext/pdf/ + pdf-index.json`);
