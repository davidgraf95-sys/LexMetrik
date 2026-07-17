// scripts/betrieb/prod-smoke.ts — B-11 Prod-Watchdog (Synthetic Smoke)
//
// FAHRPLAN-BASIS-AUSBAU §A5 (B-11): `normen-monitor.yml` überwacht die QUELLEN,
// niemand überwacht die eigene PROD. Dieser Smoke prüft die Kernrouten der
// Live-Site (200 + korrekter Inhalts-Typ), den ehrlichen JSON-503/200 der
// Edge-Suche, die Sitemap, statische Assets und die CSP-Kopfzeile. Läuft als
// GitHub-Cron (`.github/workflows/prod-smoke.yml`) — bei Rot ein sichtbarer
// Issue (Muster wie normen-monitor). Lokal: `npm run smoke:prod`.
//
// Abgrenzung (§14, nicht daneben bauen): `normen-monitor.yml` bleibt der
// QUELLEN-Wächter (Fedlex/LexWork/Materialien). Dieser Job ist der PROD-Wächter.
// Die CSP-Volldeckung (entscheidsuche.ch in connect-src) und das Ende des
// Soft-404 sind in PR #244 (QS-OPT O-1.1/O-1.4) unterwegs, aber noch OPEN —
// darum hier als **WARN** (informativ), nie als falsches Rot: der Watchdog geht
// heute grün und dokumentiert den bekannt-offenen Rest, statt ihn zu verstecken.
//
// Reine Betriebs-Prüfung, kein Rechts-/Rechen-/Norm-Pfad. Kein Import aus src/.

const BASE = (process.env.SMOKE_BASE_URL || 'https://lexmetrik.vercel.app').replace(/\/$/, '');
const TIMEOUT_MS = Number(process.env.SMOKE_TIMEOUT_MS || 20000);

interface Befund {
  ok: boolean;
  warn?: boolean;
  name: string;
  detail: string;
}

const befunde: Befund[] = [];
function hart(ok: boolean, name: string, detail: string) {
  befunde.push({ ok, name, detail });
}
function weich(ok: boolean, name: string, detail: string) {
  befunde.push({ ok, warn: true, name, detail });
}

async function hole(pfad: string, init?: RequestInit): Promise<Response> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    return await fetch(`${BASE}${pfad}`, {
      ...init,
      signal: ctrl.signal,
      headers: { 'user-agent': 'lexmetrik-prod-smoke', ...(init?.headers ?? {}) },
    });
  } finally {
    clearTimeout(t);
  }
}

/** HTML-Kernroute: 200 + text/html + trägt den App-Marker (nicht bloss eine leere Shell). */
async function pruefeHtmlRoute(pfad: string, marker = 'LexMetrik') {
  try {
    const res = await hole(pfad);
    const ct = res.headers.get('content-type') || '';
    if (res.status !== 200) return hart(false, `HTML ${pfad}`, `Status ${res.status} (erwartet 200)`);
    if (!ct.includes('text/html')) return hart(false, `HTML ${pfad}`, `Content-Type «${ct}» (erwartet text/html)`);
    const body = await res.text();
    if (!body.includes(marker)) return hart(false, `HTML ${pfad}`, `Marker «${marker}» fehlt im Body`);
    if (!body.includes('id="root"')) return hart(false, `HTML ${pfad}`, 'App-Root <div id="root"> fehlt');
    hart(true, `HTML ${pfad}`, `200 · ${ct.split(';')[0]} · Marker ok`);
  } catch (e) {
    hart(false, `HTML ${pfad}`, `Netz-/Timeout-Fehler: ${(e as Error).message}`);
  }
}

async function pruefeApiSuche() {
  const pfad = '/api/suche?q=miete';
  try {
    const res = await hole(pfad);
    const ct = res.headers.get('content-type') || '';
    // Vertrag §8: 200 (Turso live) ODER 503 (Env-Vars fehlen) — NIE eine HTML-Soft-404-Shell.
    if (res.status !== 200 && res.status !== 503) {
      return hart(false, `API ${pfad}`, `Status ${res.status} (erwartet 200 oder ehrlicher 503)`);
    }
    if (!ct.includes('application/json')) {
      return hart(false, `API ${pfad}`, `Content-Type «${ct}» — HTML statt JSON = Route verschluckt (Soft-404-Signal)`);
    }
    hart(true, `API ${pfad}`, `${res.status} · application/json`);
  } catch (e) {
    hart(false, `API ${pfad}`, `Netz-/Timeout-Fehler: ${(e as Error).message}`);
  }
}

async function pruefeSitemap() {
  try {
    const res = await hole('/sitemap.xml');
    const body = res.status === 200 ? await res.text() : '';
    const ok = res.status === 200 && /<sitemapindex|<urlset/.test(body);
    hart(ok, 'Sitemap /sitemap.xml', ok ? '200 · XML-Sitemap-Index' : `Status ${res.status} / kein Sitemap-XML`);
  } catch (e) {
    hart(false, 'Sitemap /sitemap.xml', `Netz-/Timeout-Fehler: ${(e as Error).message}`);
  }
}

async function pruefeAsset(pfad: string, typPrefix: string) {
  try {
    const res = await hole(pfad, { method: 'GET' });
    const ct = res.headers.get('content-type') || '';
    const ok = res.status === 200 && ct.startsWith(typPrefix);
    hart(ok, `Asset ${pfad}`, ok ? `200 · ${ct.split(';')[0]}` : `Status ${res.status} · ${ct || 'kein Content-Type'}`);
  } catch (e) {
    hart(false, `Asset ${pfad}`, `Netz-/Timeout-Fehler: ${(e as Error).message}`);
  }
}

async function pruefeCsp() {
  try {
    const res = await hole('/');
    const csp = res.headers.get('content-security-policy') || '';
    hart(csp.includes("default-src 'self'"), 'CSP-Kopfzeile', csp ? "vorhanden · default-src 'self'" : 'FEHLT');
    // WARN (informativ): connect-src-Volldeckung erst nach PR #244 (O-1.1).
    weich(
      csp.includes('entscheidsuche.ch'),
      'CSP connect-src entscheidsuche.ch',
      csp.includes('entscheidsuche.ch')
        ? 'gedeckt'
        : 'FEHLT noch — LiveSuche-POST wird von der CSP geblockt (PR #244 / QS-OPT O-1.1 offen)',
    );
  } catch (e) {
    hart(false, 'CSP-Kopfzeile', `Netz-/Timeout-Fehler: ${(e as Error).message}`);
  }
}

async function pruefeSoft404() {
  const pfad = `/normtext/existiert-nicht-${Date.now()}.json`;
  try {
    const res = await hole(pfad);
    const ct = res.headers.get('content-type') || '';
    const echt404 = res.status === 404;
    // WARN (informativ): echte 404 für fehlende Datenassets erst nach PR #244 (O-1.4).
    weich(
      echt404,
      'Soft-404-Signal',
      echt404
        ? 'fehlende .json-Assets geben echte 404'
        : `fehlendes Asset gibt Status ${res.status} (${ct.split(';')[0]}) statt 404 — Soft-404 (PR #244 / QS-OPT O-1.4 offen)`,
    );
  } catch (e) {
    weich(false, 'Soft-404-Signal', `Netz-/Timeout-Fehler: ${(e as Error).message}`);
  }
}

async function main() {
  console.log(`Prod-Smoke gegen ${BASE}\n`);
  // Kernrouten (prerendered, öffentlich) — Reihenfolge stabil für lesbare Logs.
  for (const pfad of ['/', '/gesetze', '/rechtsprechung', '/materialien', '/international', '/methodik', '/datenschutz']) {
    await pruefeHtmlRoute(pfad);
  }
  await pruefeApiSuche();
  await pruefeSitemap();
  await pruefeAsset('/og.png', 'image/');
  await pruefeAsset('/robots.txt', 'text/plain');
  await pruefeCsp();
  await pruefeSoft404();

  let rot = 0;
  let gelb = 0;
  for (const b of befunde) {
    const sym = b.ok ? '  ok  ' : b.warn ? ' WARN ' : ' ROT  ';
    if (!b.ok && b.warn) gelb++;
    if (!b.ok && !b.warn) rot++;
    console.log(`${sym} ${b.name} — ${b.detail}`);
  }
  console.log(`\n${befunde.length} Prüfungen · ${rot} rot · ${gelb} warn`);
  if (rot > 0) {
    console.error('\nPROD-SMOKE ROT — Live-Site verletzt einen harten Vertrag.');
    process.exit(1);
  }
  console.log('\nPROD-SMOKE GRÜN (WARN = bekannt-offen, siehe docs/betrieb/).');
  // fetch/undici hält Keep-Alive-Sockets offen → expliziter Exit, sonst hängt
  // der Prozess ~Timeout lang nach dem letzten Log (CI-Job liefe unnötig lange).
  process.exit(0);
}

main().catch((e) => {
  console.error(`PROD-SMOKE ABBRUCH — ${(e as Error).message}`);
  process.exit(1);
});
