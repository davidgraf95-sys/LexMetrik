import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { LIVE_ENDPOINT } from '../lib/rechtsprechung/livesuche';

// ─── «CSP frisst Feature» dauerhaft gefangen (O-1.1) ─────────────────────────
//
// Ein totes Feature (LiveSuche gegen entscheidsuche.ch) blieb wochenlang
// unbemerkt, weil die Prod-CSP `connect-src` den Ziel-Host nicht erlaubte
// («Refused to connect»). Dieses Offline-Tor koppelt jede externe Netz-Quelle
// der App an den `connect-src`-Allowlist in `vercel.json`: wird ein neuer
// Live-Endpunkt eingeführt (oder ein Host umbenannt), ohne die CSP zu weiten,
// bricht der Build hier — nicht erst still in Prod.
//
// Der entscheidsuche-Host wird aus der EINEN Quelle (`LIVE_ENDPOINT`) abgeleitet
// (§5): ändert sich der Endpunkt, zwingt der Test die CSP-Pflege nach.

function connectSrc(): string[] {
  const vercel = JSON.parse(
    readFileSync(join(process.cwd(), 'vercel.json'), 'utf8'),
  ) as { headers: { source: string; headers: { key: string; value: string }[] }[] };

  const csp = vercel.headers
    .find((h) => h.source === '/(.*)')
    ?.headers.find((x) => x.key === 'Content-Security-Policy')?.value;

  expect(csp, 'globale Content-Security-Policy in vercel.json fehlt').toBeTruthy();

  const directive = csp!
    .split(';')
    .map((d) => d.trim())
    .find((d) => d.startsWith('connect-src'));

  expect(directive, 'connect-src-Direktive in der globalen CSP fehlt').toBeTruthy();
  return directive!.replace(/^connect-src\s+/, '').split(/\s+/);
}

/** Origin (scheme://host) einer absoluten URL — die CSP-Quelle listet Origins. */
function origin(url: string): string {
  const u = new URL(url);
  return `${u.protocol}//${u.host}`;
}

describe('vercel.json connect-src deckt alle externen Netz-Quellen', () => {
  const allow = connectSrc();

  it("erlaubt 'self'", () => {
    expect(allow).toContain("'self'");
  });

  // Jede externe Laufzeit-Quelle der App MUSS in connect-src stehen, sonst
  // frisst die CSP das Feature (O-1.1). Quelle = die im Code verankerten Hosts.
  const quellen: Record<string, string> = {
    'LiveSuche (entscheidsuche.ch)': origin(LIVE_ENDPOINT),
    'Zefix-Firmensuche': 'https://www.zefix.ch',
    'geo.admin.ch-Adresssuche': 'https://api3.geo.admin.ch',
  };

  for (const [name, host] of Object.entries(quellen)) {
    it(`erlaubt ${name} → ${host}`, () => {
      expect(allow).toContain(host);
    });
  }
});
