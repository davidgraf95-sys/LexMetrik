/**
 * scripts/normtext/zh-cache-fuellen.ts — den Roh-PDF-Cache der ZH-Quellen
 * füllen bzw. auffrischen (O1).
 *
 *   npm run zh:cache                    # fehlende Einträge holen (Modus auto)
 *   npm run zh:cache -- --modus=netz    # alle neu holen (Frische)
 *   npm run zh:cache -- --status        # nur berichten, kein Netz
 *   npm run zh:cache -- 175.2 700.1     # nur diese LS-Nummern
 *
 * Netz-Disziplin (Dossier §5 / Skill): die Kette läuft durch `holeZhPdf`, also
 * über dieselbe prozessweite ~1-req/s-Drossel und denselben UA wie der Import.
 * Ein Voll-Lauf sind 24 × 3 = 72 Requests ≈ 75 s.
 *
 * §2: kein Rechen-, sondern ein Beschaffungswerkzeug; es schreibt AUSSCHLIESSLICH
 * nach `daten/pdf-cache-zh/` (gitignored) und rührt kein Artefakt an.
 */

import { sammleZhPdfInventar } from './inventar-kanton.ts';
import { holeZhPdf } from './adapter-zh-pdf.ts';
import { leseCache, type CacheModus } from './zh-pdf-cache.ts';

const argumente = process.argv.slice(2);
const nurStatus = argumente.includes('--status');
const modusArg = argumente.find((a) => a.startsWith('--modus='))?.slice(8);
const modus: CacheModus =
  modusArg === 'netz' || modusArg === 'offline' || modusArg === 'auto' ? modusArg : 'auto';
const nurNummern = argumente.filter((a) => !a.startsWith('--'));

// Massgeblich ist DIESELBE Inventar-Funktion wie für Generator und Drift-Check
// (§5, eine Quelle): die Vereinigung aus Tarif-Ableitung und `ZH_QUELLEN`. Die
// reine `ZH_QUELLEN`-Liste kennt die drei Tarif-Erlasse (211.11/215.3/243)
// nicht — ein Cache aus ihr wäre systematisch um drei Erlasse zu klein.
const quellen = sammleZhPdfInventar()
  .map((g) => ({ nr: g.erlassNr || g.quelleUrl, registryUrl: g.quelleUrl }))
  .filter((q) => nurNummern.length === 0 || nurNummern.includes(q.nr))
  .sort((a, b) => a.nr.localeCompare(b.nr, 'de'));

if (quellen.length === 0) {
  console.error('zh:cache: keine passende Quelle in ZH_QUELLEN.');
  process.exit(1);
}

let treffer = 0;
let geholt = 0;
let fehler = 0;

console.log(`zh:cache — ${quellen.length} Erlass(e), Modus ${nurStatus ? 'status' : modus}`);

for (const q of quellen) {
  const vorher = leseCache(q.registryUrl);
  if (nurStatus) {
    if (vorher) {
      treffer++;
      console.log(
        `  ok    ZH-${q.nr.padEnd(9)} ${(vorher.sidecar.bytes / 1024).toFixed(0).padStart(5)} KB · ` +
          `sha ${vorher.sidecar.bytesSha256.slice(0, 12)}… · abgerufen ${vorher.sidecar.abgerufen.slice(0, 10)}`,
      );
    } else {
      fehler++;
      console.error(`  LEER  ZH-${q.nr}`);
    }
    continue;
  }
  try {
    // holeZhPdf zieht die Bytes durch den Cache und parst sie gleich mit — der
    // Parse-Durchlauf ist die billigste Probe, dass die abgelegten Bytes ein
    // lesbares PDF sind (Content-Sonde des Skills, zweite Stufe).
    const erg = await holeZhPdf(q.registryUrl, modus);
    const nachher = leseCache(q.registryUrl)!;
    if (vorher && vorher.sidecar.bytesSha256 === nachher.sidecar.bytesSha256) treffer++;
    else geholt++;
    console.log(
      `  ok    ZH-${q.nr.padEnd(9)} ${Object.keys(erg.artikel).length
        .toString()
        .padStart(4)} Einträge · ${(nachher.sidecar.bytes / 1024).toFixed(0)} KB · ` +
        `quelleHash ${erg.meta.quelleHash.slice(0, 12)}… · extrakt ${erg.meta.extraktHash.slice(0, 8)}…`,
    );
  } catch (e) {
    fehler++;
    console.error(`  FEHLER ZH-${q.nr}: ${e instanceof Error ? e.message : String(e)}`);
  }
}

console.log(
  `\nzh:cache: ${quellen.length} Quelle(n) — ${treffer} unverändert, ${geholt} neu/geändert, ${fehler} Fehler.`,
);
if (fehler > 0) process.exit(1);
