// scripts/entstehung/synopse-entwurf-run.ts
// CLI-Runner der Entwurf↔Beschluss-Shards (E6, §11.7). Dünner Netz-/Schreib-Teil.
//
// Die Paarung kommt OHNE neue Abfrage zustande: die Verfahrensketten aus E1 stehen
// bereits in `botschaften.generated` (§5) — eine Vorlage ist paarbar, wenn ihre Kette
// sowohl `type-projet/2` (Erlassentwurf) als auch `type-projet/300`
// (Schlussabstimmungstext) mit je einer BBl-Fundstelle führt. Neu geholt wird nur, was
// der Graph nicht hergibt: die HTML-Manifestation (`isExemplifiedBy`) und das Dokument.
//
// §2: --datum aus der Shell (kein Date.now). ≥0.5 s Abstand je Dokument.
// Aufruf: npm run entstehung:entwurf -- --datum=$(date +%F)
//         optional --cache=<dir>, --parser-neu="<Grund>"
import { writeFileSync, mkdirSync, existsSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { BOTSCHAFTEN } from '../../src/lib/materialien/botschaften.generated.ts';
import { holeHtmlUrls, holeHtml } from './anker-sidecars.ts';
import { sha256 } from './synopse.ts';
import { NORM_PROFIL } from '../../src/lib/entstehung/synopse.ts';
import {
  CODE_ENTWURF, CODE_BESCHLUSS, extrahiereModBloecke, diffEntwurfBeschluss,
  bblLiveUrl, serialisiereEntwurfShard, shaEntwurfShard,
} from './synopse-entwurf.ts';
import { ENTWURF_DIR, type EntwurfShard } from '../../src/lib/entstehung/synopse-entwurf.ts';
import {
  ENTWURF_REGISTER_PFAD, serialisiereEntwurfRegister, type EntwurfRegister,
} from './synopse-entwurf-register.ts';

const arg = (n: string): string => {
  const a = process.argv.find((x) => x.startsWith(`--${n}=`));
  return a ? a.slice(n.length + 3) : '';
};
const heute = arg('datum');
if (!/^\d{4}-\d{2}-\d{2}$/.test(heute)) { console.error('--datum=YYYY-MM-DD nötig (§2)'); process.exit(1); }
const cacheDir = arg('cache');
const parserGrund = arg('parser-neu').trim();

interface Paar {
  key: string;
  projEli: string;
  erlassKeys: string[];
  entwurf: { fga: string; datum: string | null };
  beschluss: { fga: string; datum: string | null };
}
const paare: Paar[] = [];
for (const b of BOTSCHAFTEN) {
  const ereignisse = b.ereignisse ?? [];
  // Deterministische Wahl bei mehreren Treffern: die lexikographisch kleinste
  // Fundstelle gewinnt (nie «die erste der Query-Reihenfolge»).
  const waehle = (code: number): { fga: string; datum: string | null } | null => {
    const treffer = ereignisse
      .filter((e) => e.code === code && typeof e.res === 'string' && e.res.startsWith('fga/'))
      .map((e) => ({ fga: e.res as string, datum: e.datum ?? null }))
      .sort((x, y) => (x.fga < y.fga ? -1 : 1));
    return treffer[0] ?? null;
  };
  const entwurf = waehle(CODE_ENTWURF);
  const beschluss = waehle(CODE_BESCHLUSS);
  if (!entwurf || !beschluss || !b.projEli) continue;
  paare.push({
    key: b.key,
    projEli: b.projEli,
    erlassKeys: [...(b.normKeys ?? [])].sort(),
    entwurf,
    beschluss,
  });
}
paare.sort((a, b) => (a.key < b.key ? -1 : 1));
console.log(`entwurf: ${paare.length} Vorlagen mit Entwurf (type-projet/${CODE_ENTWURF}) UND Schlussabstimmungstext (type-projet/${CODE_BESCHLUSS}).`);

const uris = [...new Set(paare.flatMap((p) => [p.entwurf.fga, p.beschluss.fga]))]
  .map((f) => `https://fedlex.data.admin.ch/eli/${f}`);
const urls = await holeHtmlUrls(uris);
console.log(`entwurf: ${urls.size}/${uris.length} Dokumente mit HTML-Manifestation → Abruf (≥0.5 s Abstand) …`);

const html = new Map<string, { html: string; sha: string; url: string }>();
async function hole(fga: string): Promise<{ html: string; sha: string; url: string } | null> {
  const vorhanden = html.get(fga);
  if (vorhanden) return vorhanden;
  const url = urls.get(`https://fedlex.data.admin.ch/eli/${fga}`);
  if (!url) return null;
  let roh: string;
  const cachePfad = cacheDir ? join(cacheDir, `${sha256(url).slice(0, 24)}.html`) : '';
  if (cachePfad && existsSync(cachePfad)) {
    roh = readFileSync(cachePfad, 'utf8');
  } else {
    roh = (await holeHtml(url)).html;
    if (cachePfad) { mkdirSync(cacheDir, { recursive: true }); writeFileSync(cachePfad, roh, 'utf8'); }
    await new Promise((r) => setTimeout(r, 500));
  }
  const eintrag = { html: roh, sha: sha256(roh), url };
  html.set(fga, eintrag);
  return eintrag;
}

const altRegister: EntwurfRegister | null = existsSync(ENTWURF_REGISTER_PFAD)
  ? (JSON.parse(readFileSync(ENTWURF_REGISTER_PFAD, 'utf8')) as EntwurfRegister)
  : null;
const neuRegister: EntwurfRegister = { erzeugt: heute, normProfil: NORM_PROFIL, vorlagen: {} };
const zuSchreiben: [string, string][] = [];
const geschrieben = new Set<string>();
const parserDrift: string[] = [];
const ohneMarkup: string[] = [];
let geaendert = 0;
let unveraendert = 0;
let mehrdeutigGesamt = 0;

for (const p of paare) {
  const e = await hole(p.entwurf.fga);
  const b = await hole(p.beschluss.fga);
  if (!e || !b) { ohneMarkup.push(`${p.key} (keine HTML-Manifestation)`); continue; }
  const blE = extrahiereModBloecke(e.html);
  const blB = extrahiereModBloecke(b.html);
  if (blE.length === 0 || blB.length === 0) {
    // Ältere BBl-Erlasstexte tragen die `man-art-mod`-Auszeichnung nicht. Das ist ein
    // gültiger Zustand («für diese Vorlage nicht vergleichbar»), kein Fehler — aber er
    // wird gezählt und ausgewiesen, nie verschwiegen (§8).
    ohneMarkup.push(`${p.key} (${p.entwurf.fga}: ${blE.length} Blöcke, ${p.beschluss.fga}: ${blB.length})`);
    continue;
  }
  const d = diffEntwurfBeschluss(blE, blB);
  const shard: EntwurfShard = {
    botschaft: p.key,
    projEli: p.projEli,
    erlassKeys: p.erlassKeys,
    normProfil: NORM_PROFIL,
    erzeugt: heute,
    abgerufen: heute,
    entwurfDok: {
      fga: p.entwurf.fga, htmlUrl: e.url, liveUrl: bblLiveUrl(p.entwurf.fga),
      sha: e.sha, datum: p.entwurf.datum, bloecke: blE.length,
    },
    beschlussDok: {
      fga: p.beschluss.fga, htmlUrl: b.url, liveUrl: bblLiveUrl(p.beschluss.fga),
      sha: b.sha, datum: p.beschluss.datum, bloecke: blB.length,
    },
    unveraendert: d.unveraendert,
    ...(d.nurBeschluss.length ? { nurBeschluss: d.nurBeschluss } : {}),
    ...(d.ohneWortlaut.length ? { ohneWortlaut: d.ohneWortlaut } : {}),
    artikel: d.artikel,
  };
  const roh = serialisiereEntwurfShard(shard);
  const neuSha = shaEntwurfShard(shard);
  const vor = altRegister?.vorlagen[p.key];
  const quellenGleich = !!vor && vor.entwurfSha === e.sha && vor.beschlussSha === b.sha;
  if (quellenGleich && vor.shardSha !== neuSha) parserDrift.push(`${p.key} (${p.entwurf.fga} → ${p.beschluss.fga})`);
  zuSchreiben.push([join(ENTWURF_DIR, `${p.key}.json`), roh]);
  geschrieben.add(`${p.key}.json`);
  neuRegister.vorlagen[p.key] = {
    projEli: p.projEli,
    entwurfFga: p.entwurf.fga,
    beschlussFga: p.beschluss.fga,
    entwurfSha: e.sha,
    beschlussSha: b.sha,
    shardSha: neuSha,
    bytes: Buffer.byteLength(roh, 'utf8'),
    artikel: d.artikel.length,
    unveraendert: d.unveraendert,
    mehrdeutig: d.mehrdeutig.length,
    abgerufen: heute,
    ...(parserGrund && quellenGleich && vor && vor.shardSha !== neuSha ? { parserAenderung: parserGrund } : {}),
  };
  geaendert += d.artikel.filter((a) => a.art === 'geaendert').length;
  unveraendert += d.unveraendert;
  mehrdeutigGesamt += d.mehrdeutig.length;
  console.log(
    `  ${p.key.padEnd(22)} ${String(blE.length).padStart(3)}→${String(blB.length).padStart(3)} Blöcke, `
    + `${String(d.unveraendert).padStart(3)} unverändert, ${String(d.artikel.filter((a) => a.art === 'geaendert').length).padStart(3)} geändert, `
    + `${String(d.artikel.filter((a) => a.art === 'nur_entwurf').length).padStart(2)} nur-Entwurf, ${String(d.nurBeschluss.length).padStart(2)} nur-Beschluss, `
    + `${(Buffer.byteLength(roh, 'utf8') / 1024).toFixed(1).padStart(6)} KB`,
  );
}

if (parserDrift.length && !parserGrund) {
  console.error(
    `entwurf ROT: ${parserDrift.length} Shard(s) ändern sich, obwohl der Quell-sha BEIDER `
    + 'BBl-Dokumente gleich blieb — Parser-Drift, keine Gesetzesänderung (§7d, §11.6 (5)):',
  );
  for (const d of parserDrift) console.error(`  - ${d}`);
  console.error('Gewollt? Dann mit --parser-neu="<Grund>" erneut laufen lassen (Grund landet im Register).');
  process.exit(1);
}

mkdirSync(ENTWURF_DIR, { recursive: true });
for (const [pfad, inhalt] of zuSchreiben) writeFileSync(pfad, inhalt, 'utf8');
for (const f of readdirSync(ENTWURF_DIR)) {
  if (f.endsWith('.json') && !geschrieben.has(f)) {
    rmSync(join(ENTWURF_DIR, f));
    console.log(`entwurf: verwaisten Shard entfernt — ${f}`);
  }
}
mkdirSync('bibliothek/register', { recursive: true });
writeFileSync(ENTWURF_REGISTER_PFAD, serialisiereEntwurfRegister(neuRegister), 'utf8');

console.log(
  `\nentwurf: ${zuSchreiben.length}/${paare.length} Vorlagen vergleichbar; ${geaendert} im Parlament `
  + `geänderte Artikel, ${unveraendert} unverändert übernommen, ${mehrdeutigGesamt} mehrdeutige Labels `
  + `(nicht gejoint, §1) → ${ENTWURF_DIR}`,
);
if (ohneMarkup.length) {
  console.log(`entwurf: ${ohneMarkup.length} Vorlage(n) ohne vergleichbares Markup (§8, kein Fehler):`);
  for (const o of ohneMarkup) console.log(`  - ${o}`);
}
console.log(`entwurf: Quell-Register ${Object.keys(neuRegister.vorlagen).length} Einträge → ${ENTWURF_REGISTER_PFAD}`);
