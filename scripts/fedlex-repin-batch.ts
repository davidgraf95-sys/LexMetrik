// ─── O-2.1 · Fedlex Batch-Re-Pin (QS-OPT / QS-CURRENCY, Frische-Automatik) ────
//
// Der terminkritische Reparatur-Schritt des Frische-Kreislaufs: hebt ALLE
// überholten Bund-Pins in EINEM Lauf auf die geltende Fedlex-Konsolidierung —
// statt 10 Handarbeits-Sessions pro Quartals-Stichtag (Fedlex konsolidiert
// typisch quartalsweise; z. B. 1.8.2026 = 10 Erlasse, 1.10.2026 = 11 weitere).
//
// «Überholt» = deckungsgleich mit dem check:fedlex-versionen-Arbiter und dem
// gen:fedlex-wiedervorlage-Generator: `erhebe()` liefert je Erlass die geltende
// Konsolidierung (max dateApplicability ≤ Laufdatum); ist sie neuer als der Pin,
// steht der Erlass zum Re-Pin an. Künftige, noch NICHT in Kraft stehende
// Fassungen (dateApplicability > Laufdatum) sind KEIN Re-Pin-Ziel (CLAUDE.md §7
// Regel 3: künftige Fassungen werden nicht verlinkt) — sie bleiben als datierte
// Wiedervorlage im AUTO-Block stehen, bis ihr Stichtag ≤ Laufdatum wird.
//
// Mechanik je Ziel (rein amtlich, KEIN Parser-Eingriff):
//   1. neues Konsolidierungsdatum = geltend (SPARQL dateApplicability ≤ Laufdatum)
//   2. neues kanonisches html-N = isExemplifiedBy der HTML-Manifestation dieses
//      NEUEN Datums (fedlex-manifest.ts — nicht die 1–5-Fallback-Heuristik)
//   3. in scripts/fedlex-cache.sh NUR Feld 3 (kons) + Feld 4 (html-N) dieser
//      einen Datenzeile ersetzen (Anker/SR/eli/Kommentare byte-genau, wie
//      fedlex-repin-kanonik.ts)
//
// Nachlauf (nicht in diesem Skript — vom aufrufenden Job / Agent gefahren, damit
// der Re-Pin und die Regenerierung getrennt prüfbar bleiben): normtext-Snapshot
// + Register + Struktur-Sidecar + gen:fedlex-wiedervorlage der betroffenen
// Erlasse, dann die Normtext-Tore (check:normtext[-netz], check:struktur-
// konsistenz, check:fedlex-versionen, golden byte-gleich). Das Skript druckt die
// exakte Kommandozeile.
//
// Aufruf:
//   npx vite-node scripts/fedlex-repin-batch.ts                 # Dry-Run (Report)
//   npx vite-node scripts/fedlex-repin-batch.ts -- --write      # schreibt cache.sh
//   npx vite-node scripts/fedlex-repin-batch.ts -- --datum=2026-08-01 [--write]
//
// §0b Regel 5: reine Erhebung (deterministisch, injizierbare fetchImpl) getrennt
// vom Schreiben. §2: kein Date.now() in der Erhebung — --datum aus der Shell.
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
// Nur TYPEN aus dem Wiedervorlage-Generator (elidiert, kein Modul-Eval). Die
// WERTE (erhebe, abstraktEli) kommen per dynamischem Import NACH dem Setzen des
// Sentinels — sonst triggerte der statische Import dessen CLI-main() (Schreiben
// von parameter-verfall.md + currency.json). §5: die Logik bleibt dort (SSoT).
import type { ErlassBasis, UeberholtEintrag } from './fedlex-wiedervorlage-generieren.ts';
import { lesePinsVoll, type PinVoll } from './fedlex-pins.ts';
import { loeseHtmlManifeste } from './fedlex-manifest.ts';
import type { FetchImpl } from './fedlex-sparql.ts';

// Muss VOR dem dynamischen Import unten stehen: unterdrückt die main()-Ausführung
// des Wiedervorlage-Generators beim Import (er prüft diese Variable).
process.env.FEDLEX_NUR_IMPORT = '1';

const wurzel = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const REGISTER_JSON = resolve(wurzel, 'public/normtext/register.json');
const CACHE_SH = resolve(wurzel, 'scripts/fedlex-cache.sh');

export type RepinZiel = {
  name: string; // cache.sh-Pin-Name (= Register-key, AUTO-Block-Konvention)
  eli: string;
  altKons: string; // ISO, gepinnt
  neuKons: string; // ISO, geltend (≤ Laufdatum)
  altN: number;
  neuN: number | null; // null = keine kanonische html-Manifestation für das neue Datum
};

export type RepinBefund = {
  ziele: RepinZiel[]; // re-pinnbar (neuN !== null)
  ungeloest: RepinZiel[]; // überholt, aber html-Manifestation des neuen Datums nicht auflösbar → Handschritt
  kuenftigNichtFaellig: number; // künftige Fassungen (§7: nicht re-pinnen)
};

/**
 * Reine Erhebung: welche Pins sind zum Re-Pin fällig (überholt) und auf welches
 * kanonische html-N des neuen Datums? Mutiert nichts.
 */
export async function erhebeRepin(
  erlasse: ErlassBasis[], pins: PinVoll[], datum: string, fetchImpl: FetchImpl,
): Promise<RepinBefund> {
  // Dynamischer Import (nach FEDLEX_NUR_IMPORT-Sentinel) — kein main()-Nebeneffekt.
  const { erhebe, abstraktEli } = await import('./fedlex-wiedervorlage-generieren.ts');
  const { ueberholt, wiedervorlage } = await erhebe(erlasse, datum, fetchImpl);

  // Register-key (z. B. «ASYLV2») und cache.sh-Pin-Name (z. B. «asylv2») driften
  // in der Gross-/Kleinschreibung — die verlässliche Brücke ist die ELI (Feld 2
  // des Pins == abstraktEli(register.quelleUrl)). Darum je überholtem Erlass über
  // die ELI den Pin finden, NICHT über den Namen.
  const erlassProKey = new Map(erlasse.map((e) => [e.key, e]));
  const pinProEli = new Map(pins.map((p) => [p.eli, p]));
  const pinFuer = (u: UeberholtEintrag): PinVoll | undefined => {
    const e = erlassProKey.get(u.key);
    if (!e) return undefined;
    const eli = abstraktEli(e.quelleUrl);
    return eli ? pinProEli.get(eli) : undefined;
  };

  // html-N je Ziel für das NEUE (geltende) Datum auflösen — synthetischer Pin mit
  // konsKompakt = neues Datum. loeseHtmlManifeste indexiert eli|YYYYMMDD, Rückgabe
  // per `name`; wir nutzen den echten (lowercase) Pin-Namen als Identität.
  const synth = ueberholt
    .map((u: UeberholtEintrag) => {
      const p = pinFuer(u);
      return p ? { name: p.name, eli: p.eli, konsKompakt: u.geltend.replace(/-/g, '') } : null;
    })
    .filter((x): x is { name: string; eli: string; konsKompakt: string } => x !== null);

  const manifeste = synth.length ? await loeseHtmlManifeste(synth, fetchImpl) : new Map();

  const ziele: RepinZiel[] = [];
  const ungeloest: RepinZiel[] = [];
  for (const u of ueberholt) {
    const p = pinFuer(u);
    if (!p) continue; // Register-key ohne cache.sh-Pin (z. B. pdf-embed) → hier nicht behandelt
    const befund = manifeste.get(p.name);
    const z: RepinZiel = {
      name: p.name, eli: p.eli, altKons: u.gepinnt, neuKons: u.geltend,
      altN: p.n, neuN: befund ? befund.n : null,
    };
    (z.neuN === null ? ungeloest : ziele).push(z);
  }
  return { ziele, ungeloest, kuenftigNichtFaellig: wiedervorlage.length };
}

/** Ersetzt in cache.sh Feld 3 (kons) + Feld 4 (html-N) einer Datenzeile. Byte-präzise. */
export function reSchreibeCacheZeile(sh: string, z: RepinZiel): string {
  const altKompakt = z.altKons.replace(/-/g, '');
  const neuKompakt = z.neuKons.replace(/-/g, '');
  // Anker (Feld 5) kann Kommas enthalten → über name|eli|altKons|altN| ankern.
  const re = new RegExp(
    `("${z.name}\\|${z.eli.replace(/[/]/g, '/')}\\|)${altKompakt}(\\|)${z.altN}(\\|)`,
  );
  const vorher = sh;
  const nachher = sh.replace(re, `$1${neuKompakt}$2${z.neuN}$3`);
  if (nachher === vorher) {
    throw new Error(`Re-Pin FEHLGESCHLAGEN für ${z.name} (Zeile ${z.altKons}/${z.altN} nicht gematcht)`);
  }
  return nachher;
}

function heute(): string {
  const j = new Date();
  return `${j.getFullYear()}-${String(j.getMonth() + 1).padStart(2, '0')}-${String(j.getDate()).padStart(2, '0')}`;
}

async function main() {
  const arg = process.argv.find((a) => a.startsWith('--datum='));
  const datum = arg ? arg.slice('--datum='.length) : heute();
  const schreiben = process.argv.includes('--write');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(datum)) {
    console.error(`FEHLER: --datum=${datum} ist kein ISO-Datum (YYYY-MM-DD).`);
    process.exit(2);
  }

  const erlasse = (JSON.parse(readFileSync(REGISTER_JSON, 'utf8')) as { erlasse: ErlassBasis[] }).erlasse;
  const pins = lesePinsVoll();

  let befund: RepinBefund;
  try {
    befund = await erhebeRepin(erlasse, pins, datum, fetch);
  } catch (e) {
    console.error(`FEHLER: Fedlex-SPARQL nicht erreichbar (${e instanceof Error ? e.message : e}).`);
    process.exit(2);
    return;
  }

  const { ziele, ungeloest, kuenftigNichtFaellig } = befund;
  console.log(`fedlex-repin-batch (Laufdatum ${datum}):`);
  console.log(`  ${ziele.length} Pin(s) fällig zum Re-Pin (überholt + kanonisches html-N auflösbar)`);
  console.log(`  ${ungeloest.length} überholt, aber html-N nicht auflösbar → Handschritt`);
  console.log(`  ${kuenftigNichtFaellig} künftige Fassung(en) — §7: NICHT re-pinnen (noch nicht in Kraft)`);

  for (const z of ziele) {
    console.log(`  ✎ ${z.name}: ${z.altKons}/N${z.altN} → ${z.neuKons}/N${z.neuN}`);
  }
  for (const z of ungeloest) {
    console.log(`  ⚠ ${z.name}: überholt (${z.altKons} → ${z.neuKons}), aber KEINE kanonische html-Manifestation — manuell prüfen (Anker-Sonde in cache.sh)`);
  }

  if (ziele.length === 0) {
    console.log('\nKein Re-Pin nötig (kein Bund-Pin überholt). §7-konform: künftige Fassungen bleiben Wiedervorlage.');
    return;
  }

  if (schreiben) {
    let sh = readFileSync(CACHE_SH, 'utf8');
    for (const z of ziele) sh = reSchreibeCacheZeile(sh, z);
    writeFileSync(CACHE_SH, sh);
    const keys = ziele.map((z) => z.name).join(',');
    console.log(`\n✓ cache.sh geschrieben (${ziele.length} Pins re-gepinnt: ${keys}).`);
    console.log('\nNachlauf (Regenerierung + Tore) — genau diese Reihenfolge (Generatoren');
    console.log('regenerieren idempotent den ganzen Bestand; nur inhaltlich geänderte');
    console.log('Snapshots ändern Bytes, reine Datum-Churn wird zurückgesetzt):');
    console.log(`  npm run normtext -- --datum=${datum}`);
    console.log(`  npm run normtext:register -- --datum=${datum}`);
    console.log(`  npm run normtext:struktur -- --datum=${datum}`);
    console.log(`  npm run gen:fedlex-wiedervorlage -- --datum=${datum}`);
    console.log(`  npm run gen:verfall && npm run datenhaltung:manifest`);
    console.log(`  npm run check:normtext && npm run check:struktur-konsistenz && npm run check:fedlex-versionen && npm run golden:vergleich`);
  } else {
    console.log('\n(Dry-Run — mit --write anwenden.)');
  }
}

// Als CLI ausführen; beim Import aus dem Unit-Test (VITEST gesetzt) NICHT laufen.
// (fileURLToPath oben nur für `wurzel`; keine Entry-Prüfung — vite-node entfernt
// den Skriptpfad aus process.argv, ein argv-basierter Entry-Check schlüge fehl.)
if (!process.env.VITEST) void main();
