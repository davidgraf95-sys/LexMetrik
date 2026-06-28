// ─── Generator: Bund-Artikel-Volltext-Suchindex (ROADMAP Schritt 5, Task 4.1) ─
//
// Baut aus den gepinnten Bund-Volltext-Snapshots (public/normtext/bund/*.json)
// EINE kompakte Datendatei public/such-index/artikel-bund.json für die globale
// Artikel-Volltextsuche. Der FlexSearch-Index wird daraus CLIENT-seitig lazy
// gebaut (eigener Chunk, §3/§6.4 — nie im Haupt-Bundle).
//
//   npm run gen:suchindex          schreibt die Datei
//   npm run check:suchindex        prüft Drift (Index ≠ Snapshots) → exit 1
//
// Nur Erlasse MIT `bloecke` (echter Volltext); Stubs/PDF/Live-Link tragen keinen
// durchsuchbaren Text und werden ausgelassen (§8: nichts vortäuschen).
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const wurzel = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const BUND = resolve(wurzel, 'public/normtext/bund');
const ZIEL = resolve(wurzel, 'public/such-index/artikel-bund.json');

interface Block { absatz?: string; text?: string; items?: { marke?: string; text?: string }[] }
interface Eintrag { id: string; erlass: string; artikel: string; artikelLabel: string; bloecke?: Block[] }

/** Durchsuchbarer Plaintext eines Artikels (Absätze + Aufzählungen, Whitespace normalisiert). */
function artikelText(bloecke: Block[]): string {
  const teile: string[] = [];
  for (const b of bloecke) {
    if (b.text) teile.push(b.text);
    for (const it of b.items ?? []) if (it.text) teile.push(it.text);
  }
  return teile.join(' ').replace(/\s+/g, ' ').trim();
}

// Kompaktes Schema (kurze Keys → kleinere Datei): k=erlass-key, a=artikel,
// l=label, t=text. ebene ist immer 'bund'.
interface IndexEintrag { k: string; a: string; l: string; t: string }

export function baueBundIndex(): { erzeugt: string; ebene: 'bund'; eintraege: IndexEintrag[] } {
  const eintraege: IndexEintrag[] = [];
  for (const datei of readdirSync(BUND).filter((f) => f.endsWith('.json')).sort()) {
    let snap: { eintraege?: Eintrag[] };
    try { snap = JSON.parse(readFileSync(resolve(BUND, datei), 'utf8')); } catch { continue; }
    for (const e of snap.eintraege ?? []) {
      if (!e.bloecke || e.bloecke.length === 0) continue;
      const t = artikelText(e.bloecke);
      if (!t) continue;
      eintraege.push({ k: e.erlass, a: e.artikel, l: e.artikelLabel, t });
    }
  }
  // Stabile Reihenfolge (erlass, dann Datei-Reihenfolge der Artikel bleibt erhalten).
  return { erzeugt: 'generiert', ebene: 'bund', eintraege };
}

function serialisiere(): string {
  return JSON.stringify(baueBundIndex());
}

const istCheck = process.argv.includes('--check');
const neu = serialisiere();

if (istCheck) {
  let alt = '';
  try { alt = readFileSync(ZIEL, 'utf8'); } catch {
    console.error('check:suchindex: ' + ZIEL + ' fehlt — `npm run gen:suchindex` ausführen.');
    process.exit(1);
  }
  if (alt !== neu) {
    console.error('check:suchindex: public/such-index/artikel-bund.json ist VERALTET gegenüber den Snapshots — `npm run gen:suchindex` ausführen und committen.');
    process.exit(1);
  }
  const n = JSON.parse(neu).eintraege.length;
  console.log(`check:suchindex: Index synchron mit den Snapshots (${n} Artikel).`);
} else {
  mkdirSync(dirname(ZIEL), { recursive: true });
  writeFileSync(ZIEL, neu, 'utf8');
  const n = JSON.parse(neu).eintraege.length;
  console.log(`gen:suchindex: ${n} Bund-Artikel → public/such-index/artikel-bund.json`);
}
