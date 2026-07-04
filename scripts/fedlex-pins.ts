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
  // P1-b (QS-CURRENCY): Namensgruppe MUSS Ziffern zulassen (`[a-z0-9_]+`) —
  // die alte Gruppe `[a-z_]+` matchte die 11 Ziffern-Namen-Pins (asylv1/2/3,
  // argv1..5, bvv_2, bvv3, co2_gesetz) NICHT: sie sahen überwacht aus, waren es
  // aber nicht (parser-blindes Monitoring-Loch, schlimmer als ungepinnt). Der
  // Parser-Selbsttest (src/tests/fedlex-pins.test.ts) verankert, dass die Zahl
  // geparster Pins == Zahl der Datenzeilen in cache.sh bleibt.
  for (const m of sh.matchAll(/^\s*"([a-z0-9_]+)\|([a-z0-9/_]+)\|(\d{8})\|/gm)) {
    pins.push({
      name: m[1],
      eli: m[2],
      kons: `${m[3].slice(0, 4)}-${m[3].slice(4, 6)}-${m[3].slice(6, 8)}`,
    });
  }
  return pins;
}
