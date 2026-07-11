// ─── check:pdf-quellen — Tor für die amtlichen PDF-Download-URLs (U-PDF/A12) ──
//
// Offline (in `check`/`gate`): pdf-quellen.json ist konsistent zu register.json
// und — für Bund — an die überwachten fedlex-cache.sh-Pins gebunden. Damit ist die
// PDF-URL Teil der Pin-Überwachung: ein Re-Pin (fedlex-cache.sh) ohne Neu-Lauf des
// Generators kippt dieses Tor ROT (check:fedlex-versionen bleibt Currency-Arbiter
// der Pins selbst). §7/§8: massgeblich ist die amtliche Quelle.
//
// Netz (--netz, in check:netz): jede Bund-URL + eine Kanton-Stichprobe liefern
// tatsächlich ein PDF (HTTP 200 + application/pdf) — fängt tote/verschobene Dateien.
//
// Exit 0 grün · 1 Befund.
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { lesePins } from '../fedlex-pins.ts';

const wurzel = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const REGISTER_JSON = resolve(wurzel, 'public/normtext/register.json');
const PDF_QUELLEN_JSON = resolve(wurzel, 'public/normtext/pdf-quellen.json');

type PdfQuelle = { url: string; stand: string; quelle: 'fedlex' | 'lexwork' };
type Erlass = {
  key: string; ebene: string; status: string; quelleUrl: string; stand: string;
  pdfUrl?: string; pdfStand?: string;
};

const FEDLEX_URL_RE =
  /^https:\/\/fedlex\.data\.admin\.ch\/filestore\/fedlex\.data\.admin\.ch\/eli\/(cc\/[^/]+\/[^/]+)\/(\d{8})\/de\/pdf-a\/[^/]+\.pdf$/;

/** «20260701» → «2026-07-01». */
function isoAusToken(t: string): string {
  return `${t.slice(0, 4)}-${t.slice(4, 6)}-${t.slice(6, 8)}`;
}

export type Befund = string;

/** Reine Offline-Prüfung (testbar). */
export function pruefeOffline(
  quellen: Record<string, PdfQuelle>,
  erlasse: Erlass[],
  pins: { eli: string; kons: string }[],
): Befund[] {
  const befunde: Befund[] = [];
  const perKey = new Map(erlasse.map((e) => [e.key, e]));
  const pinProEli = new Map(pins.map((p) => [p.eli, p.kons]));
  let bundZahl = 0;

  for (const [key, q] of Object.entries(quellen)) {
    const e = perKey.get(key);
    if (!e) { befunde.push(`${key}: kein Register-Erlass (verwaister PDF-Quellen-Eintrag).`); continue; }
    if (e.status !== 'snapshot') { befunde.push(`${key}: Status '${e.status}' (nur snapshot trägt pdf-quellen; pdf-embed nutzt pdfPfad).`); continue; }
    // Projektions-Integrität: register.json muss den Sidecar spiegeln (sonst stale).
    if (e.pdfUrl !== q.url) befunde.push(`${key}: register.pdfUrl ≠ pdf-quellen.url → 'npm run normtext:register' nachziehen.`);
    if (e.pdfStand !== q.stand) befunde.push(`${key}: register.pdfStand ≠ pdf-quellen.stand → Projektion nachziehen.`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(q.stand)) befunde.push(`${key}: stand '${q.stand}' ist kein ISO-Datum.`);

    if (q.quelle === 'fedlex') {
      bundZahl++;
      const m = q.url.match(FEDLEX_URL_RE);
      if (!m) { befunde.push(`${key}: URL ist kein Fedlex-Filestore-pdf-a-Pfad: ${q.url}`); continue; }
      const [, eli, kons] = m;
      const konsIso = isoAusToken(kons);
      if (konsIso !== q.stand) befunde.push(`${key}: URL-Konsolidierung ${konsIso} ≠ stand ${q.stand}.`);
      const pinKons = pinProEli.get(eli);
      if (pinKons === undefined) {
        befunde.push(`${key}: kein fedlex-cache.sh-Pin für ELI ${eli} — PDF-URL ausserhalb der Pin-Überwachung.`);
      } else if (pinKons !== konsIso) {
        befunde.push(`${key}: PDF-Konsolidierung ${konsIso} ≠ Pin ${pinKons} (fedlex-cache.sh re-gepinnt? Generator neu laufen).`);
      }
    } else if (q.quelle === 'lexwork') {
      let sidecarHost: string;
      try { sidecarHost = new URL(q.url).host; } catch { befunde.push(`${key}: LexWork-URL unparsbar: ${q.url}`); continue; }
      let regHost = '';
      try { regHost = new URL(e.quelleUrl).host; } catch { /* ignore */ }
      if (regHost && sidecarHost !== regHost) befunde.push(`${key}: PDF-Host ${sidecarHost} ≠ Quelle-Host ${regHost}.`);
      if (q.stand !== e.stand) befunde.push(`${key}: LexWork-stand ${q.stand} ≠ Snapshot-stand ${e.stand} (Drift → Eintrag entfernen).`);
    } else {
      befunde.push(`${key}: unbekannte quelle '${(q as PdfQuelle).quelle}'.`);
    }
  }

  // Coverage-Floor Bund: fängt stilles Ausdünnen (fehlgeschlagener Regen-Lauf).
  const BUND_FLOOR = 200; // Ist 218 Bund-Volltexte; Floor darunter, fängt echte Verluste.
  if (bundZahl < BUND_FLOOR) befunde.push(`Bund-PDF-Coverage ${bundZahl} < Floor ${BUND_FLOOR} (Generator unvollständig?).`);

  return befunde;
}

async function pruefeNetz(quellen: Record<string, PdfQuelle>): Promise<Befund[]> {
  const befunde: Befund[] = [];
  const fedlex = Object.entries(quellen).filter(([, q]) => q.quelle === 'fedlex');
  const lexwork = Object.entries(quellen).filter(([, q]) => q.quelle === 'lexwork');
  // Alle Bund + Kanton-Stichprobe (jede Nte, gedeckelt bei 30) — höflich.
  const schritt = Math.max(1, Math.ceil(lexwork.length / 30));
  const stichprobe = lexwork.filter((_, i) => i % schritt === 0).slice(0, 30);
  const ziel = [...fedlex, ...stichprobe];

  let i = 0;
  async function arbeiter() {
    while (i < ziel.length) {
      const [key, q] = ziel[i++];
      try {
        const res = await fetch(q.url, { method: 'HEAD' });
        const ct = res.headers.get('content-type') ?? '';
        if (!res.ok) befunde.push(`${key}: HTTP ${res.status} auf ${q.url}`);
        else if (!/pdf/i.test(ct)) befunde.push(`${key}: Content-Type '${ct}' (kein PDF) auf ${q.url}`);
      } catch (err) {
        befunde.push(`${key}: Netz-Fehler ${err instanceof Error ? err.message : err}`);
      }
    }
  }
  await Promise.all(Array.from({ length: Math.min(8, ziel.length || 1) }, arbeiter));
  return befunde;
}

async function main() {
  const netz = process.argv.includes('--netz');
  let quellen: Record<string, PdfQuelle>;
  try {
    quellen = JSON.parse(readFileSync(PDF_QUELLEN_JSON, 'utf8')) as Record<string, PdfQuelle>;
  } catch {
    console.error('check:pdf-quellen: public/normtext/pdf-quellen.json fehlt/unlesbar (npm run gen:pdf-quellen).');
    process.exit(1);
    return;
  }
  const erlasse = (JSON.parse(readFileSync(REGISTER_JSON, 'utf8')) as { erlasse: Erlass[] }).erlasse;

  const befunde = pruefeOffline(quellen, erlasse, lesePins());
  if (netz) befunde.push(...await pruefeNetz(quellen));

  if (befunde.length) {
    console.error(`check:pdf-quellen ROT — ${befunde.length} Befund(e):`);
    for (const b of befunde.slice(0, 40)) console.error(`  · ${b}`);
    if (befunde.length > 40) console.error(`  … und ${befunde.length - 40} weitere.`);
    process.exit(1);
  }
  const bund = Object.values(quellen).filter((q) => q.quelle === 'fedlex').length;
  const kanton = Object.values(quellen).filter((q) => q.quelle === 'lexwork').length;
  console.log(`check:pdf-quellen grün${netz ? ' (inkl. Netz)' : ''}: ${bund} Bund + ${kanton} Kanton amtliche PDF-URLs, Bund an Pins gebunden.`);
}

if (!process.env.VITEST) void main();
