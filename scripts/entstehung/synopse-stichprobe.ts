// scripts/entstehung/synopse-stichprobe.ts
// Stichprobe auf den `ohne_ereignis`-Alt-Blöcken (§11.6/§8): zieht deterministisch n
// Fälle aus den ausgelieferten Shards und stellt jedem den ECHTEN Unterschied zwischen
// den beiden amtlichen Konsolidierungen gegenüber — die Grundlage der Hand-Prüfung
// «echte Abweichung im amtlichen Wortlaut oder Artefakt-Rauschen?».
//
// WARUM GERADE DIESE MENGE: ein Alt-Block MIT Fussnoten-Ereignis ist doppelt belegt
// (Textänderung + amtliche Fussnote). Die Falschtreffer sitzen strukturbedingt in der
// anderen Klasse — deshalb prüft diese Stichprobe nur sie (Gegenprüfung zu PR #794).
//
// §2: kein Date.now, keine Zufälligkeit — die Auswahl ist eine feste Schrittweite über
// die byte-sortierte Grundgesamtheit, je Erlass höchstens ein Fall (Streuung statt
// Klumpen). `--ohne=A,B` schliesst bereits geprüfte Erlasse aus, damit eine zweite
// Stichprobe DISJUNKT zur ersten ist.
//
// Aufruf: npm run entstehung:synopse-stichprobe -- --n=13 --cache=<dir> --ohne=ZGB,STPO
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { sparqlBatch } from '../fedlex-sparql.ts';
import {
  baueStaendeQuery, baueStaende, extrahiereArtikel, flachText, normalisiere,
  eliKurzAusUrl, abstractUri, liveUrlFuerStand, sha256,
} from './synopse.ts';
import { SYNOPSE_DIR, type SynopseShard } from '../../src/lib/entstehung/synopse.ts';

const arg = (n: string): string => {
  const a = process.argv.find((x) => x.startsWith(`--${n}=`));
  return a ? a.slice(n.length + 3) : '';
};
const n = Number(arg('n') || 13);
const cacheDir = arg('cache');
const ohne = new Set(arg('ohne').split(',').map((s) => s.trim()).filter(Boolean));

interface Fall { erlass: string; eli: string; eId: string; von: string; bis: string; label: string }
const alle: Fall[] = [];
for (const f of readdirSync(SYNOPSE_DIR).filter((x) => x.endsWith('.json')).sort()) {
  const erlass = f.slice(0, -'.json'.length);
  if (ohne.has(erlass)) continue;
  const shard = JSON.parse(readFileSync(join(SYNOPSE_DIR, f), 'utf8')) as SynopseShard;
  for (const s of shard.schritte) {
    for (const a of s.artikel) {
      if (a.zustand !== 'ohne_ereignis') continue;
      alle.push({ erlass, eli: shard.eli, eId: a.eId, von: s.von, bis: s.bis, label: a.label });
    }
  }
}
console.log(`Grundgesamtheit «ohne_ereignis» (ohne ${[...ohne].join(',') || '—'}): ${alle.length} Alt-Blöcke.`);

// Feste Schrittweite, je Erlass hoechstens ein Fall.
const probe: Fall[] = [];
const gesehen = new Set<string>();
const schritt = Math.max(1, Math.floor(alle.length / n));
for (let i = 0; probe.length < n && i < alle.length; i += 1) {
  const k = (i * schritt) % alle.length;
  const f = alle[k];
  if (gesehen.has(f.erlass)) continue;
  gesehen.add(f.erlass);
  probe.push(f);
}

const reg = JSON.parse(readFileSync('public/normtext/register.json', 'utf8')) as {
  erlasse: { key: string; quelleUrl: string }[];
};
const elis = new Map(probe.map((p) => [p.erlass, eliKurzAusUrl(reg.erlasse.find((x) => x.key === p.erlass)!.quelleUrl)!]));
const bindings = await sparqlBatch([...new Set(elis.values())].map((e) => `<${abstractUri(e)}>`), baueStaendeQuery, { batchGroesse: 12 });
const staende = baueStaende(bindings);

async function holeXml(url: string): Promise<string> {
  if (cacheDir) {
    const p = join(cacheDir, `${sha256(url).slice(0, 24)}.xml`);
    if (existsSync(p)) return readFileSync(p, 'utf8');
  }
  const res = await fetch(url, { headers: { Accept: 'application/xml' } });
  const typ = res.headers.get('content-type');
  if (!res.ok || (typ !== null && !/xml/i.test(typ))) throw new Error(`Abruf gescheitert (${res.status}, ${typ}) ${url}`);
  await new Promise((r) => setTimeout(r, 500));
  return res.text();
}

const zeig = (s: string): string => JSON.stringify(s).slice(1, -1);
for (const p of probe) {
  const eli = elis.get(p.erlass)!;
  const liste = staende.get(abstractUri(eli))!;
  const a = extrahiereArtikel(await holeXml(liste.find((s) => s.datum === p.von)!.xmlUrl)).get(p.eId);
  const b = extrahiereArtikel(await holeXml(liste.find((s) => s.datum === p.bis)!.xmlUrl)).get(p.eId);
  const wa = a ? normalisiere(flachText(a)) : '';
  const wb = b ? normalisiere(flachText(b)) : '';
  let i = 0; while (i < wa.length && i < wb.length && wa[i] === wb[i]) i += 1;
  let j = 0; while (j < wa.length - i && j < wb.length - i && wa[wa.length - 1 - j] === wb[wb.length - 1 - j]) j += 1;
  const kurz = (s: string): string => (s.length > 200 ? `${s.slice(0, 110)} …[${s.length}]… ${s.slice(-70)}` : s);
  console.log(`\n════ ${p.erlass} ${p.eId} (${p.label}) ${p.von} → ${p.bis}`);
  console.log(`     ${liveUrlFuerStand(eli, p.von)}  →  ${liveUrlFuerStand(eli, p.bis)}`);
  console.log(`     kontext …${zeig(wa.slice(Math.max(0, i - 70), i))}‖`);
  console.log(`     ALT-Δ «${zeig(kurz(wa.slice(i, wa.length - j)))}»`);
  console.log(`     NEU-Δ «${zeig(kurz(wb.slice(i, wb.length - j)))}»`);
}
console.log(`\nStichprobe n=${probe.length} über ${gesehen.size} verschiedene Erlasse.`);
