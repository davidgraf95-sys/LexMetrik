/**
 * check:struktur-konsistenz — Tor: Struktur-Sidecar ↔ Snapshot je Bund-Gesetz.
 *
 * Snapshot und Struktur-Sidecar werden von ZWEI getrennten Generatoren erzeugt
 * (`npm run normtext` vs. `normtext:struktur`). Wird nur einer neu gebaut, driften
 * sie STILL: Artikel rendern ohne Gliederung/Randtitel, Struktur-Schlüssel zeigen
 * ins Leere. Dieser Defekt lag am 30.6.2026 unbemerkt in Produktion (OR). Das Tor
 * verhindert, dass solcher Drift je wieder still verschifft wird (§7/§8).
 *
 * Offline (kein Netz, kein /tmp-Cache): liest nur die committeten Artefakte.
 * Aufruf: vite-node scripts/normtext/check-struktur-konsistenz.ts
 */

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { pruefeStrukturKonsistenz } from './vollstaendigkeit-logik.ts';

const SNAP_DIR = 'public/normtext/bund';
const STRUKTUR_DIR = 'public/normtext/struktur/bund';

function tokensVonSnapshot(pfad: string): string[] {
  const datei = JSON.parse(readFileSync(pfad, 'utf8')) as { eintraege?: Array<{ artikel: string }> };
  return (datei.eintraege ?? []).map((e) => e.artikel);
}

function keysVonStruktur(pfad: string): string[] {
  const doc = JSON.parse(readFileSync(pfad, 'utf8')) as { artikel?: Record<string, unknown> };
  return Object.keys(doc.artikel ?? {});
}

function main(): void {
  console.log('\n── Tor: Struktur-Konsistenz (Sidecar ↔ Snapshot, Bund) ───────────────────');
  let exitCode = 0;
  let geprueft = 0;
  let doppelIdHinweise = 0;

  for (const f of readdirSync(SNAP_DIR).filter((f) => f.endsWith('.json'))) {
    const gesetz = f.replace(/\.json$/, '');
    const snapPfad = join(SNAP_DIR, f);
    const struPfad = join(STRUKTUR_DIR, f);

    // Ein Bund-Snapshot OHNE Struktur-Sidecar ist selbst ein Drift-Befund
    // (der Reader erwartet das Sidecar für die Gliederung).
    if (!existsSync(struPfad)) {
      console.error(`  FEHLER ${gesetz}: Snapshot vorhanden, aber Struktur-Sidecar fehlt (${struPfad}).`);
      exitCode = 1;
      continue;
    }

    const r = pruefeStrukturKonsistenz(tokensVonSnapshot(snapPfad), keysVonStruktur(struPfad));
    geprueft++;

    if (r.verwaist.length > 0) {
      console.error(
        `  FEHLER ${gesetz}: ${r.verwaist.length} VERWAISTE Struktur-Schlüssel ` +
          `(veraltete Struktur — Sidecar nicht mit Snapshot neu gebaut): ${r.verwaist.slice(0, 10).join(', ')}`,
      );
      exitCode = 1;
    }
    if (r.fehlend.length > 0) {
      console.error(
        `  FEHLER ${gesetz}: ${r.fehlend.length} Snapshot-Artikel OHNE Struktur ` +
          `(rendern ohne Gliederung/Randtitel): ${r.fehlend.slice(0, 10).join(', ')}`,
      );
      exitCode = 1;
    }
    if (r.fehlendDoppelId.length > 0) {
      // Dokumentierte Doppelartikel-Grenze (2. Vorkommen einer art_id) — kein Fehler.
      doppelIdHinweise += r.fehlendDoppelId.length;
    }
  }

  if (exitCode === 0) {
    console.log(
      `  ok: ${geprueft} Bund-Gesetze — Struktur ↔ Snapshot konsistent` +
        (doppelIdHinweise > 0 ? ` (${doppelIdHinweise} dokumentierte Doppelartikel-__N ohne Struktur, bekannt)` : ''),
    );
  } else {
    console.error('\n  Struktur-Drift gefunden → `npm run normtext:struktur -- --datum=<F>` neu bauen.');
  }
  process.exit(exitCode);
}

main();
