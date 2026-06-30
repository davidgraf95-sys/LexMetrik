// scripts/plan/set.ts
import { readFileSync, writeFileSync } from 'node:fs';
import { parseEtikett, serializeEtikett } from './etikett';

const FELDER = new Set(['id', 'status', 'of', 'blocker', 'dep', 'kollision', 'worktree', '26x', 'fahrplan']);
const CHECKBOX_FUER: Record<string, string> = { done: '[x]', wip: '[~]' };

export function setField(md: string, id: string, feld: string, wert: string): string {
  if (!FELDER.has(feld)) throw new Error(`Unbekanntes Feld "${feld}"`);
  const zeilen = md.split('\n');
  const idx = zeilen.findIndex((z) => z.includes('<!-- @meta') && parseEtikett(z).id === id);
  if (idx < 0) throw new Error(`Schritt-id "${id}" nicht gefunden`);

  // Zeile normalisieren (kanonische Feld-Reihenfolge), dann das eine Feld ersetzen.
  const indent = zeilen[idx].match(/^(\s*)/)![1];
  const normalisiert = serializeEtikett(parseEtikett(zeilen[idx]), indent);
  const ersetzt = normalisiert.replace(new RegExp(`(\\b${feld}): .*?(?= ·| -->)`), `$1: ${wert}`);
  const neu = parseEtikett(ersetzt); // validiert den neuen Wert (wirft bei ungültig)
  zeilen[idx] = serializeEtikett(neu, indent);

  if (feld === 'status') {
    const cb = CHECKBOX_FUER[neu.status] ?? '[ ]';
    for (let j = idx - 1; j >= 0; j--) {
      if (zeilen[j].trim() === '') continue;
      if (/^\s*-\s*\[[ x~]\]/.test(zeilen[j])) zeilen[j] = zeilen[j].replace(/(-\s*)\[[ x~]\]/, `$1${cb}`);
      break;
    }
  }
  return zeilen.join('\n');
}

// CLI: vite-node scripts/plan/set.ts -- <id> <feld>=<wert>
if (!process.env.VITEST) {
  const arg = process.argv.slice(2);
  const id = arg[0];
  const [feld, wert] = (arg[1] ?? '').split('=');
  if (!id || !feld || wert === undefined) {
    console.error('Aufruf: npm run plan:set -- <id> <feld>=<wert>');
    process.exit(2);
  }
  const out = setField(readFileSync('ROADMAP.md', 'utf8'), id, feld, wert);
  writeFileSync('ROADMAP.md', out);
  console.log(`gesetzt: ${id} ${feld}=${wert}`);
}
