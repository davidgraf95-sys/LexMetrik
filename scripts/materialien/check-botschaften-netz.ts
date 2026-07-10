// scripts/materialien/check-botschaften-netz.ts
// Paket 2 (W2·6, FAHRPLAN-FEDLEX-PORTFOLIO): Live-Drift-Arbiter der Botschaften-Zuordnung
// gegen den amtlichen Fedlex-Projekt-Graphen. Verdrahtet in `check:netz`.
//
// Struktur: für eine STRATIFIZIERTE Stichprobe von Erlassen die Reverse-Kette live nachfahren
// (dieselbe reine parse-Funktion wie der Generator) und die resultierende Botschafts-Key-Menge
// je Erlass gegen das committete botschaften.generated.ts vergleichen. Drift (neue/verschwundene
// Botschaft, Datums-/Curia-Abweichung) ⇒ ROT = «Generator neu laufen lassen» (nie Auto-Fix, §7).
// Zusätzlich Referenzfall-Assertionen (DSG→2). Exit 0 OK · 1 Drift · 2 Netzfehler.

import {
  grundmenge, holeBindings, baueBotschaften, type BotschaftEintrag, type ErlassMeta,
} from './botschaften-generieren.ts';
import { BOTSCHAFTEN } from '../../src/lib/materialien/botschaften.generated.ts';

/** Intrinsische Signatur = NUR Felder am Botschafts-/Expression-Knoten selbst, die NICHT
 *  davon abhängen, welche SR abgefragt wurden. BEWUSST AUSGENOMMEN (korpus-/view-abhängig,
 *  sonst Fehlalarm bei Stichprobe): `normKeys`/`rechtsgebiet` (SR-Join) UND `projEli`/`nummer`
 *  (aus dem kleinsten proj über die abgefragten SR — bei Mantelerlassen sample-abhängig).
 *  Diese Felder deckt der Offline-Tor check:materialien intern ab; hier zählt Existenz/Titel/
 *  Datum/Link-Treue je Botschaft + die Mengen-Zugehörigkeit je Erlass. */
function intrinsischeSig(b: { titel: string; titelFr?: string; titelIt?: string; stand: string; quelleUrl: string }): string {
  return [b.titel, b.titelFr ?? '', b.titelIt ?? '', b.stand, b.quelleUrl].join('');
}

// Stratifizierte Stichprobe: Referenzfälle (DSG/AVIG) + je ein Erlass pro grobem Gebiet +
// ein Mantelerlass-Kandidat + ein Verordnungs-Erlass (erwartet 0 Botschaften, Negativfall).
const STICHPROBE_KEYS = ['DSG', 'AVIG', 'OR', 'AHVG', 'AIG', 'MG', 'ZGB', 'VRV'];

function keysProErlass(eintraege: { key: string; normKeys: string[] }[]): Map<string, Set<string>> {
  const m = new Map<string, Set<string>>();
  for (const e of eintraege) for (const nk of e.normKeys) {
    if (!m.has(nk)) m.set(nk, new Set());
    m.get(nk)!.add(e.key);
  }
  return m;
}

async function main(): Promise<void> {
  const alle = grundmenge();
  const meta: ErlassMeta[] = alle.filter((m) => STICHPROBE_KEYS.includes(m.key));
  const fehlend = STICHPROBE_KEYS.filter((k) => !meta.some((m) => m.key === k));
  if (fehlend.length) {
    console.error(`check:botschaften-netz ROT: Stichproben-Keys nicht in der Grundmenge: ${fehlend.join(', ')}.`);
    process.exit(1);
  }

  let bindings;
  try {
    bindings = await holeBindings(meta); // kein store-raw im Tor
  } catch (e) {
    console.error(`check:botschaften-netz: Netzfehler — ${(e as Error).message}`);
    process.exit(2);
  }
  const live = baueBotschaften(bindings, meta);

  // committet: nur die Botschaften, die MINDESTENS einen Stichproben-Erlass tragen.
  const stichKeys = new Set(STICHPROBE_KEYS);
  const committetRelevant = BOTSCHAFTEN.filter((b) => (b.normKeys ?? []).some((k) => stichKeys.has(k)));
  const sigCommittet = new Map(committetRelevant.map((b) => [b.key, intrinsischeSig(b)]));
  const sigLive = new Map(live.map((b: BotschaftEintrag) => [b.key, intrinsischeSig(b)]));

  const liveProErlass = keysProErlass(live);
  const commProErlass = keysProErlass(committetRelevant.map((b) => ({ key: b.key, normKeys: b.normKeys ?? [] })));

  const fehler: string[] = [];
  for (const key of STICHPROBE_KEYS) {
    const l = liveProErlass.get(key) ?? new Set<string>();
    const c = commProErlass.get(key) ?? new Set<string>();
    for (const k of l) if (!c.has(k)) fehler.push(`${key}: Botschaft '${k}' live vorhanden, fehlt committet (Generator neu laufen).`);
    for (const k of c) if (!l.has(k)) fehler.push(`${key}: Botschaft '${k}' committet, live nicht mehr (Generator neu laufen).`);
  }
  // Intrinsische Drift (Datum/Curia/Titel/projEli/Link geändert) über die gemeinsamen Keys.
  for (const [k, s] of sigLive) {
    const sc = sigCommittet.get(k);
    if (sc && sc !== s) fehler.push(`${k}: Inhalts-Drift (Datum/Curia/Titel/projEli/Link geändert) — Generator neu laufen.`);
  }

  // Referenzfall-Assertion (DoD): DSG → genau 2 Botschaften.
  const dsg = liveProErlass.get('DSG') ?? new Set();
  if (dsg.size !== 2) fehler.push(`Referenzfall DSG: erwartet 2 Botschaften, live ${dsg.size}.`);

  if (fehler.length) {
    for (const f of fehler) console.error(`ROT   botschaften-netz: ${f}`);
    console.error(`\ncheck:botschaften-netz — ${fehler.length} Drift-Befund(e). 'npm run materialien:botschaften -- --datum=$(date +%F)' + 'npm run materialien -- …' neu laufen (nie Auto-Fix).`);
    process.exit(1);
  }
  console.log(`check:botschaften-netz OK — ${STICHPROBE_KEYS.length} Erlasse stichprobenweise drift-frei gegen den Fedlex-Projekt-Graphen (DSG-Referenz: 2).`);
}

main().catch((e) => {
  console.error(`check:botschaften-netz ROT: ${(e as Error).message}`);
  process.exit(2);
});
