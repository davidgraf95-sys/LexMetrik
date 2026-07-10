// scripts/materialien/botschaften-generieren-run.ts
// Dünner CLI-Runner des Botschaften-Generators (Paket 2, W2·6). Getrennt vom reinen
// Modul botschaften-generieren.ts, damit dieses seiteneffektfrei importierbar bleibt
// (Test + check:botschaften-netz) — Repo-Muster material-manifest / soft-law-projektion(-run).
//
// §2: --datum aus der Shell (kein Date.now). Netz-Lauf.
// Aufruf: npm run materialien:botschaften -- --datum=$(date +%F)
import { writeFileSync } from 'node:fs';
import {
  grundmenge, holeBindings, baueBotschaften, serialisiere,
} from './botschaften-generieren.ts';

const datumArg = process.argv.find((a) => a.startsWith('--datum='));
const heute = datumArg ? datumArg.slice('--datum='.length) : '';
if (!/^\d{4}-\d{2}-\d{2}$/.test(heute)) { console.error('--datum=YYYY-MM-DD nötig (§2)'); process.exit(1); }

const meta = grundmenge();
console.log(`botschaften: Grundmenge ${meta.length} Bund-Volltext-Erlasse → SPARQL-Reverse-Kette …`);
const bindings = await holeBindings(meta, fetch, 'bibliothek/materialien/botschaften-raw');
const eintraege = baueBotschaften(bindings, meta);

// Zukunfts-Guard (§8-Ehrlichkeit): kein stand > heute.
const zukunft = eintraege.filter((e) => e.stand > heute);
if (zukunft.length) { console.error(`botschaften: ${zukunft.length} Einträge mit stand > ${heute} (Zukunft) — abbrechen.`); process.exit(1); }

writeFileSync('src/lib/materialien/botschaften.generated.ts', serialisiere(eintraege), 'utf8');

const mitCuria = eintraege.filter((e) => e.nummer).length;
const mantel = eintraege.filter((e) => e.normKeys.length > 1).length;
const srMitTreffer = new Set(eintraege.flatMap((e) => e.normKeys)).size;
console.log(`botschaften: ${eintraege.length} Botschaften → src/lib/materialien/botschaften.generated.ts`);
console.log(`  Curia ${mitCuria}/${eintraege.length} · Mantelerlass ${mantel} · Erlasse mit ≥1 Botschaft ${srMitTreffer}/${meta.length}`);
