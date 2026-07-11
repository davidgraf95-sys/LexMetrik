// scripts/materialien/vernehmlassungen-generieren-run.ts
// Dünner CLI-Runner des Vernehmlassungs-Generators (Paket 3, W3·11). Getrennt vom reinen
// Modul vernehmlassungen-generieren.ts, damit dieses seiteneffektfrei importierbar bleibt
// (Test + check:vernehmlassungen-netz) — Repo-Muster botschaften-generieren(-run).
//
// §2: --datum aus der Shell (= Abfrage-/Stand-Datum, Status mutabel; kein Date.now). Netz-Lauf.
// Aufruf: npm run materialien:vernehmlassungen -- --datum=$(date +%F)
import { writeFileSync } from 'node:fs';
import {
  grundmenge, holeBindings, baueVernehmlassungen, serialisiere,
} from './vernehmlassungen-generieren.ts';

const datumArg = process.argv.find((a) => a.startsWith('--datum='));
const heute = datumArg ? datumArg.slice('--datum='.length) : '';
if (!/^\d{4}-\d{2}-\d{2}$/.test(heute)) { console.error('--datum=YYYY-MM-DD nötig (§2)'); process.exit(1); }

const meta = grundmenge();
console.log(`vernehmlassungen: Grundmenge ${meta.length} Bund-Volltext-Erlasse → SPARQL-Consultation-Kette …`);
const bindings = await holeBindings(meta, fetch, 'bibliothek/materialien/vernehmlassungen-raw');
const eintraege = baueVernehmlassungen(bindings, meta, heute);

// Konsistenz-Guard (§8): kein 'laufend' mit Fristende < heute (still-falsche «läuft»-Anzeige).
const abgelaufen = eintraege.filter((e) => e.vernehmlassung?.status === 'laufend' && e.vernehmlassung.fristEnde && e.vernehmlassung.fristEnde < heute);
if (abgelaufen.length) {
  console.warn(`vernehmlassungen: WARN ${abgelaufen.length} als 'laufend' geführte Verfahren mit Fristende < ${heute} (amtlich noch nicht umgestellt) — bleiben laufend, Tor prüft die Konsistenz.`);
}

writeFileSync('src/lib/materialien/vernehmlassungen.generated.ts', serialisiere(eintraege), 'utf8');

const laufend = eintraege.filter((e) => e.vernehmlassung?.status === 'laufend').length;
const mantel = eintraege.filter((e) => (e.normKeys?.length ?? 0) > 1).length;
const srMitTreffer = new Set(eintraege.flatMap((e) => e.normKeys ?? [])).size;
console.log(`vernehmlassungen: ${eintraege.length} Verfahren → src/lib/materialien/vernehmlassungen.generated.ts`);
console.log(`  laufend ${laufend} · Mantelvorlage ${mantel} · Erlasse mit ≥1 Verfahren ${srMitTreffer}/${meta.length}`);
