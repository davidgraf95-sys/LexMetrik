// scripts/fedlex-pins.ts
//
// SSoT §5: die Liste der gepinnten Fedlex-Gesetze/Stände lebt EINMAL in
// scripts/fedlex-cache.sh (Format `name|eli|YYYYMMDD|html-N|anker|sr`). Diese
// winzige Parse-Logik wird von check:fedlex-versionen UND vom Gegenprüfungs-Tor
// (WARN «Quelle-Pin überholt») geteilt, damit die Pins nirgends dupliziert werden.

import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const CACHE_SH = resolve(dirname(fileURLToPath(import.meta.url)), 'fedlex-cache.sh');

export type Pin = { name: string; eli: string; kons: string }; // kons als ISO «YYYY-MM-DD»

export function lesePins(shText?: string): Pin[] {
  const sh = shText ?? readFileSync(CACHE_SH, 'utf8');
  const pins: Pin[] = [];
  // Namensgruppe MIT Ziffern ([a-z0-9_]+): Pins wie asylv1/argv2/bvv3/co2_gesetz
  // waren mit ([a-z_]+) parser-blind = unüberwachtes Currency-Loch (Befund
  // fedlex-gap-report-2026-07-02.md §4; Fix Paket 1 QS-CURRENCY 3.7.2026).
  // Selbsttest: src/tests/fedlex-pins.test.ts (geparste Pins == cache.sh-Zeilen).
  for (const m of sh.matchAll(/^\s*"([a-z0-9_]+)\|([a-z0-9/_]+)\|(\d{8})\|/gm)) {
    pins.push({
      name: m[1],
      eli: m[2],
      kons: `${m[3].slice(0, 4)}-${m[3].slice(4, 6)}-${m[3].slice(6, 8)}`,
    });
  }
  return pins;
}
