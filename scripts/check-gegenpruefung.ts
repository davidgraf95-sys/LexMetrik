// scripts/check-gegenpruefung.ts
//
// Baustein a — Tor `check:gegenpruefung` (QS-GP). Eingehängt in die
// `npm run check`-Composite, die NUR `npm run gate` (Modus voll) lokal fährt —
// CI ruft die Checks namentlich auf und lässt diesen aus (ci.yml unverändert).
//
// Ablauf (Spec Z. 34-50):
//  1./2./3. Working-Tree-Diff ∩ Risiko-Globs ∖ Auto-Ausnahme → gemeinsame
//           Kernfunktion risikoDiffHash() (scripts/gegenpruefung/kern.ts).
//  4. Risiko-Menge leer → grün («nichts zu beweisen»).
//  5. sonst sha256 gegen bibliothek/.gegenpruefung-pending:
//        fehlt / Hash-Mismatch / verdikt ≠ bestanden → ROT (klare Meldung + Skill-Verweis).
//  6. CI-Selbstschutz / kein Git / kein HEAD → grün no-op (im Kern gekapselt).
//  7. WARN (blockiert nie): Register-Quelle-Pins, die laut fedlex-cache.sh überholt sind.

import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { risikoDiffHash, type DiffErgebnis } from './gegenpruefung/kern';
import { lesePins } from './fedlex-pins';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const PENDING = resolve(ROOT, 'bibliothek/.gegenpruefung-pending');
const REGISTER = resolve(ROOT, 'bibliothek/register/gegenpruefung-register.md');

export type Pending = {
  hash: string;
  verdikt: string;
  quellePin?: string;
  datum?: string;
  dateien?: string[];
};

function rotText(grund: string, dateien: string[]): string {
  return [
    `check:gegenpruefung ROT — ${grund}`,
    '  Betroffene Risiko-Dateien (Rechnen/Extraktion/Norm-Tarif):',
    ...dateien.map((d) => `    - ${d}`),
    '  → Adversariale Gegenprüfung fahren: Skill »gegenpruefung« (unabhängiger Opus-Agent,',
    '    frischer Kontext, Output gegen die amtliche Quelle WIDERLEGEN). Bei Verdikt',
    '    »bestanden« quittiert der Skill mit  npm run gegenpruefung:ok  — das bindet den',
    '    Nachweis an genau diesen Diff (bibliothek/.gegenpruefung-pending).',
  ].join('\n');
}

/** Reine Entscheidung (testbar): aus Diff-Ergebnis + Pending → grün/rot + Meldung. */
export function bewerte(
  r: DiffErgebnis,
  pending: Pending | null,
): { gruen: boolean; meldung: string } {
  if (!r.kontext) {
    return { gruen: true, meldung: 'check:gegenpruefung grün — no-op (CI oder kein Git/HEAD).' };
  }
  if (r.hash === null) {
    return {
      gruen: true,
      meldung: 'check:gegenpruefung grün — keine Risiko-Datei (Rechnen/Extraktion/Norm-Tarif) im Working-Tree geändert.',
    };
  }
  if (!pending) {
    return {
      gruen: false,
      meldung: rotText('kein Gegenprüfungs-Nachweis (bibliothek/.gegenpruefung-pending fehlt).', r.dateien),
    };
  }
  if (pending.hash !== r.hash) {
    return {
      gruen: false,
      meldung: rotText(
        'der Nachweis passt nicht zum aktuellen Diff (Hash-Mismatch — Dateien nach der Quittung geändert?).',
        r.dateien,
      ),
    };
  }
  if (pending.verdikt !== 'bestanden') {
    return {
      gruen: false,
      meldung: rotText(`Nachweis-Verdikt ist «${pending.verdikt}», nicht «bestanden».`, r.dateien),
    };
  }
  return {
    gruen: true,
    meldung: `check:gegenpruefung grün — Gegenprüfung bestanden, an Diff-Hash gebunden (${r.hash.slice(0, 12)}…).`,
  };
}

/**
 * WARN (best-effort, OFFLINE, blockiert NIE): Register-Einträge, deren Quelle-Pin
 * älter ist als der aktuell in scripts/fedlex-cache.sh gepinnte Stand → «neu fällig».
 * Kein Netz-Call (check:fedlex-versionen bleibt der Netz-Arbiter in check:netz).
 */
export function warnUeberholtePins(): void {
  try {
    if (!existsSync(REGISTER)) return;
    const pinDatum = new Map<string, string>(); // name → YYYYMMDD
    for (const p of lesePins()) pinDatum.set(p.name, p.kons.replace(/-/g, ''));
    const md = readFileSync(REGISTER, 'utf8');
    for (const zeile of md.split('\n')) {
      if (!zeile.trimStart().startsWith('|')) continue;
      const zellen = zeile.split('|').map((s) => s.trim());
      // Spalten: |Datum|Snapshot/Engine|Diff-Hash|Verdikt|Quelle-Pin|Beleg| → Quelle-Pin = Index 5
      const quellePin = zellen[5];
      if (!quellePin) continue;
      const m = /^fedlex\s+([a-z_]+)\s+(\d{8})$/i.exec(quellePin);
      if (!m) continue;
      const cacheDatum = pinDatum.get(m[1].toLowerCase());
      if (cacheDatum && cacheDatum > m[2]) {
        console.error(
          `WARN check:gegenpruefung: Quelle-Pin «${quellePin}» überholt — fedlex-cache.sh pinnt ${m[1].toLowerCase()} auf ${cacheDatum} → Gegenprüfung neu fällig (Burn-down).`,
        );
      }
    }
  } catch {
    // WARN darf das Gate niemals blockieren.
  }
}

function lesePending(): Pending | null {
  if (!existsSync(PENDING)) return null;
  try {
    return JSON.parse(readFileSync(PENDING, 'utf8')) as Pending;
  } catch {
    return null; // korruptes Pending = kein gültiger Nachweis → rot
  }
}

// ─── CLI ────────────────────────────────────────────────────────────────────
if (!process.env.VITEST) {
  const r = risikoDiffHash();
  const { gruen, meldung } = bewerte(r, lesePending());
  warnUeberholtePins(); // best-effort, blockiert nie
  if (gruen) {
    console.log(meldung);
    process.exit(0);
  }
  console.error(meldung);
  process.exit(1);
}
