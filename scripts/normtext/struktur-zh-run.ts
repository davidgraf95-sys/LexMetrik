/**
 * Runner: die ZH-Struktur-Sidecars (Gliederung + Randtitel) aus den amtlichen
 * PDF der Zürcher Loseblattsammlung (R1, Auftrag David 2.9.2026).
 *
 * WARUM EIN EIGENER RUNNER neben `struktur-kanton-run.ts`: jener holt sein
 * Material aus der LexWork-JSON-API (`xhtml_tol`) und überspringt jede
 * PDF-Quelle ausdrücklich — die 111 Zürcher Erlasse haben dort kein
 * strukturiertes Dokument. Ihre Gliederung und ihre Randtitel stehen
 * ausschliesslich im Druckbild und müssen über die Geometrie gehoben werden.
 * Beide Runner schreiben in DASSELBE Verzeichnis nach DEMSELBEN Schema
 * (`public/normtext/struktur/kanton/<KEY>.json`) — der Leser (`ladeStruktur`)
 * merkt keinen Unterschied.
 *
 * §2: `--datum` aus der Shell, nie `Date.now()`. Reine Präsentations-
 * Anreicherung (§3) — die Snapshots unter `public/normtext/kanton/` werden
 * NICHT angefasst, ihr Wortlaut bleibt byte-gleich.
 *
 * Aufruf:  npm run normtext:struktur-zh -- --datum=$(date +%F)
 *          npm run normtext:struktur-zh -- --datum=… --nur=281,131.1
 */
import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { sammleZhPdfInventar } from './inventar-kanton.ts';
import { leseCache } from './zh-pdf-cache.ts';
import {
  extrahiereZhTextZeilen,
  serialisiereZhZeilen,
} from './zh-seitenmontage.ts';
import { erkenneZhMarker } from './adapter-zh-pdf.ts';
import { baueZhSidecar } from './zh-sidecar.ts';

const datumArg = process.argv.find((a) => a.startsWith('--datum='));
const erzeugt = datumArg ? datumArg.slice('--datum='.length) : '';
if (!/^\d{4}-\d{2}-\d{2}$/.test(erzeugt)) {
  console.error('struktur-zh-run: --datum=YYYY-MM-DD erforderlich (§2).');
  process.exit(1);
}

const nurArg = process.argv.find((a) => a.startsWith('--nur='));
const nurKeys = nurArg
  ? new Set(nurArg.slice('--nur='.length).split(',').map((s) => s.trim()).filter(Boolean))
  : null;

const messreiheSchreiben = process.argv.includes('--messreihe');

const SNAPSHOTS = 'public/normtext/kanton';
const MESSREIHE = 'scripts/normtext/zh-randtitel-deckung.json';
const ZIEL = 'public/normtext/struktur/kanton';
mkdirSync(ZIEL, { recursive: true });

/** «LS 281» → «281» (der Dateischlüssel ist `ZH-<nr>`). */
const nummer = (erlassNr: string): string => erlassNr.replace(/^LS\s*/, '').trim();

interface SnapshotDatei {
  eintraege: { artikel: string; erlass: string }[];
}

let gesamtParagrafen = 0;
let gesamtMitRandtitel = 0;
let gesamtMitGliederung = 0;
let gesamtVerworfen = 0;
let dateien = 0;
const zeilenBericht: string[] = [];
const messwerte: Record<string, { paragrafen: number; randtitel: number; gliederung: number }> = {};

for (const gruppe of sammleZhPdfInventar()) {
  const nr = nummer(gruppe.erlassNr || '');
  if (!nr) continue;
  if (nurKeys && !nurKeys.has(nr)) continue;
  const key = `ZH-${nr}`;
  const snapPfad = join(SNAPSHOTS, `${key}.json`);
  if (!existsSync(snapPfad)) continue; // Erlass nicht im Bestand → kein Sidecar

  const cache = leseCache(gruppe.quelleUrl);
  if (!cache) {
    console.error(`  LEER  ${key} — Roh-PDF-Cache leer, 'npm run zh:cache' füllt ihn`);
    process.exitCode = 1;
    continue;
  }
  const { zeilen, randnoten } = await extrahiereZhTextZeilen(cache.bytes.slice());
  const textbasis = serialisiereZhZeilen(zeilen);
  const marker = erkenneZhMarker(textbasis);
  const befund = baueZhSidecar(textbasis, randnoten, marker);

  // NUR §§, die der Snapshot wirklich führt (§5: der Snapshot ist die Quelle
  // des Bestands). So kann das Sidecar keinen § erfinden, den der Normtext
  // nicht kennt — und der Schlussapparat, den der Parser abschneidet, kommt
  // auch hier nicht in die Gliederung.
  const snap = JSON.parse(readFileSync(snapPfad, 'utf8')) as SnapshotDatei;
  const bestand = new Set(snap.eintraege.map((e) => e.artikel));

  // JEDER Snapshot-§ bekommt einen Eintrag — auch der ohne Randtitel und ohne
  // eigene Überschrift. Grund ist kein Formalismus, sondern die Anzeige: der
  // Leser hängt einen Artikel OHNE Sidecar-Eintrag vor den Sektionsbaum, wo er
  // im Inhaltsverzeichnis unerreichbar ist (Tor `check:struktur-konsistenz`,
  // das genau diese Klasse am Bund-Korpus bewacht). Ein halbes Sidecar ist für
  // die Navigation schlechter als gar keines.
  //
  // ERBEN, NICHT ERFINDEN: §§, die der Parser nie als Kopf sieht — die aus
  // einem Sammel-Aufhebungskopf («§§ 66–69.») expandierten und die vor der
  // ersten Überschrift stehenden — bekommen den Gliederungspfad ihres
  // VORGÄNGERS in Dokumentreihenfolge. Das ist die Sektion, in der die
  // Sammelkopf-Zeile im Druckbild tatsächlich steht; ein Randtitel wird dabei
  // NIE geerbt (§8: die Sektion ist ablesbar, der Randtitel nicht).
  //
  // ANHANG-ZIFFERN («1.1», «1.1.2.1», ZH-243/ZH-211.17) erben NICHT: sie
  // stehen hinter dem letzten §, im Anhang, und würden sonst unter dessen
  // Abschnitt einsortiert — eine Aussage, die das PDF nicht trägt.
  const ANHANG_TOKEN = /\./;
  const artikel: Record<string, { gliederung: { ebene: number; label: string }[]; marginalie: string[] }> = {};
  let mitRand = 0;
  let mitGl = 0;
  let geerbt = 0;
  let letzteGliederung: { ebene: number; label: string }[] = [];
  for (const e of snap.eintraege) {
    const token = e.artikel;
    if (token in artikel) continue;
    const a = befund.artikel[token];
    if (a) {
      artikel[token] = a;
      if (a.gliederung.length > 0) letzteGliederung = a.gliederung;
    } else {
      const erbe = ANHANG_TOKEN.test(token) ? [] : letzteGliederung;
      artikel[token] = { gliederung: erbe, marginalie: [] };
      if (erbe.length > 0) geerbt++;
    }
    if (artikel[token].marginalie.length > 0) mitRand++;
    if (artikel[token].gliederung.length > 0) mitGl++;
  }

  gesamtParagrafen += bestand.size;
  gesamtMitRandtitel += mitRand;
  gesamtMitGliederung += mitGl;
  gesamtVerworfen += befund.randnotenOhneKopf + befund.randnotenDoppelt;

  const quote = bestand.size === 0 ? 0 : (mitRand / bestand.size) * 100;
  zeilenBericht.push(
    `  ${key.padEnd(12)} §§ ${String(bestand.size).padStart(4)} · Randtitel ${String(mitRand).padStart(4)}` +
      ` (${quote.toFixed(0).padStart(3)} %) · Gliederung ${String(mitGl).padStart(4)}` +
      ` · geerbt ${String(geerbt).padStart(3)} · verworfen ${String(befund.randnotenOhneKopf + befund.randnotenDoppelt).padStart(3)}`,
  );

  if (Object.keys(artikel).length === 0) continue;
  messwerte[key] = { paragrafen: bestand.size, randtitel: mitRand, gliederung: mitGl };
  const inhalt = { erzeugt, kopf: { titel: snap.eintraege[0]?.erlass ?? key }, artikel };
  writeFileSync(join(ZIEL, `${key}.json`), `${JSON.stringify(inhalt, null, 2)}\n`, 'utf8');
  dateien++;
}

// Die MESSREIHE ist der Wächter-Anker (check:zh-randtitel Prüfung 5): sie
// friert die Deckung je Erlass ein, damit eine Regression sichtbar wird, die
// keine Formprüfung sieht. Nur auf ausdrückliches --messreihe, und nur bei
// einem VOLLLAUF — ein Teillauf (--nur=…) schriebe die übrigen Erlasse weg.
if (messreiheSchreiben) {
  if (nurKeys) {
    console.error('struktur-zh: --messreihe verlangt einen Volllauf (kein --nur=).');
    process.exit(1);
  }
  const sortiert: typeof messwerte = {};
  for (const k of Object.keys(messwerte).sort()) sortiert[k] = messwerte[k];
  writeFileSync(MESSREIHE, `${JSON.stringify(sortiert, null, 2)}\n`, 'utf8');
  console.log(`Messreihe geschrieben: ${MESSREIHE} (${Object.keys(sortiert).length} Erlasse)`);
}

for (const z of zeilenBericht) console.log(z);
console.log(
  `\nstruktur-zh: ${dateien} Sidecar(s) · ${gesamtMitRandtitel}/${gesamtParagrafen} §§ mit Randtitel ` +
    `(${gesamtParagrafen ? ((gesamtMitRandtitel / gesamtParagrafen) * 100).toFixed(1) : '0'} %) · ` +
    `${gesamtMitGliederung} §§ mit Gliederung · ${gesamtVerworfen} Randnoten verworfen`,
);
