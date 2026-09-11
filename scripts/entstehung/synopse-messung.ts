// scripts/entstehung/synopse-messung.ts
// E5.0 — VOR-MESSUNG der Synopse (FAHRPLAN-MATERIALIEN-VERZAHNUNG §11.7).
//
// Zweck: vor dem Bau von E5 an weiteren Erlassen messen, was R2 (6.9.2026) an OR und ZPO
// gemessen hat — Volumen, Falschtrefferquote vor/nach Normalisierung, und die zwei zur
// Wahl stehenden SPEICHERFORMEN. q = 10,9 % ruht in R2 auf 12 Schritten in 2 Erlassen;
// eine Deckel-Festlegung darauf wäre eine Einzelwert-Zuschreibung (§0/3).
//
// Diese Datei SCHREIBT NICHTS ins Repo ausser der Messtabelle auf stdout; der Bericht
// wird von Hand nach `bibliothek/materialien/entstehung-2026-09-06/` übernommen (§11).
//
// Aufruf:
//   npm run entstehung:synopse-messung -- --datum=$(date +%F) --erlasse=ZGB,StGB,…
//   optional --cache=<dir>  (Roh-XML zwischenspeichern; ausserhalb des Repos)
import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { sparqlBatch } from '../fedlex-sparql.ts';
import {
  baueStaendeQuery, baueStaende, extrahiereArtikel, diffStaende, wortlaut,
  normalisiere, flachText, eliKurzAusUrl, abstractUri, sha256,
} from './synopse.ts';
import { SYNOPSE_FENSTER_AB } from '../../src/lib/entstehung/synopse.ts';

const arg = (n: string): string => {
  const a = process.argv.find((x) => x.startsWith(`--${n}=`));
  return a ? a.slice(n.length + 3) : '';
};
const heute = arg('datum');
if (!/^\d{4}-\d{2}-\d{2}$/.test(heute)) { console.error('--datum=YYYY-MM-DD nötig (§2)'); process.exit(1); }
const cacheDir = arg('cache');
const keys = arg('erlasse').split(',').map((s) => s.trim()).filter(Boolean);
if (!keys.length) { console.error('--erlasse=A,B,C nötig'); process.exit(1); }

interface RegEintrag { key: string; quelleUrl: string; artikelAnzahl: number; titel: string; }
const register = JSON.parse(readFileSync('public/normtext/register.json', 'utf8')) as { erlasse: RegEintrag[] };
const gewaehlt = keys.map((k) => {
  const e = register.erlasse.find((x) => x.key === k);
  if (!e) { console.error(`Erlass ${k} steht nicht im Register.`); process.exit(1); }
  const eli = eliKurzAusUrl(e.quelleUrl);
  if (!eli) { console.error(`Erlass ${k}: ELI aus ${e.quelleUrl} nicht ableitbar.`); process.exit(1); }
  return { ...e, eli };
});

console.log(`E5.0: ${gewaehlt.length} Erlasse → SPARQL (Konsolidierungen + AKN-XML-Manifestation) …`);
const bindings = await sparqlBatch(
  gewaehlt.map((g) => `<${abstractUri(g.eli)}>`),
  baueStaendeQuery,
  { batchGroesse: 8 },
);
const staende = baueStaende(bindings, SYNOPSE_FENSTER_AB);

async function holeXml(url: string): Promise<string> {
  if (cacheDir) {
    mkdirSync(cacheDir, { recursive: true });
    const p = join(cacheDir, `${sha256(url).slice(0, 24)}.xml`);
    if (existsSync(p)) return readFileSync(p, 'utf8');
    const x = await abruf(url);
    writeFileSync(p, x, 'utf8');
    await new Promise((r) => setTimeout(r, 500));
    return x;
  }
  const x = await abruf(url);
  await new Promise((r) => setTimeout(r, 500));
  return x;
}

/** Erfolg wird am Content-Type gemessen, nie am Statuscode (Filestore: 200 + Angular-Shell). */
async function abruf(url: string): Promise<string> {
  const res = await fetch(url, { headers: { Accept: 'application/xml' } });
  if (!res.ok) throw new Error(`Filestore antwortet ${res.status} für ${url}`);
  const typ = res.headers.get('content-type');
  if (typ !== null && !/xml/i.test(typ)) throw new Error(`Content-Type «${typ}» statt XML für ${url}`);
  const x = await res.text();
  if (/<title>\s*Casemates\s*<\/title>/i.test(x)) throw new Error(`Casemates-Shell statt Dokument (${url})`);
  return x;
}

const zeilen: string[] = [];
let gesamtFormA = 0;
let gesamtFormB = 0;
let gesamtRoh = 0;
let gesamtNorm = 0;
let gesamtStabil = 0;
let gesamtText = 0;
let gesamtSchritte = 0;

for (const g of gewaehlt) {
  const liste = staende.get(abstractUri(g.eli)) ?? [];
  if (liste.length < 2) {
    zeilen.push(`| ${g.key} | ${liste.length} | — | — | — | — | — | — | nur ein Stand ab ${SYNOPSE_FENSTER_AB} |`);
    continue;
  }
  // Textmasse des Erlasses (Σ bloecke[].text im committeten Snapshot) als Bezugsgrösse für q.
  const snap = JSON.parse(readFileSync(`public/normtext/bund/${g.key}.json`, 'utf8')) as {
    eintraege: { artikelLabel?: string; bloecke: { text: string }[] }[];
  };
  const textMasse = snap.eintraege.reduce(
    (n, e) => n + Buffer.byteLength(e.artikelLabel ?? '', 'utf8')
      + e.bloecke.reduce((m, b) => m + Buffer.byteLength(b.text, 'utf8'), 0),
    0,
  );

  let vorher = extrahiereArtikel(await holeXml(liste[0].xmlUrl));
  let formA = 0;
  let rohZahl = 0;
  let normZahl = 0;
  let stabilZahl = 0;
  const zustaende = new Map<string, Set<string>>(); // eId → distinkte normalisierte Textzustände
  const zustandBytes = new Map<string, number>();   // eId+sha → Bytes dieses Zustands
  for (const [eId, a] of vorher) {
    const h = sha256(normalisiere(flachText(a)));
    zustaende.set(eId, new Set([h]));
    zustandBytes.set(`${eId}|${h}`, Buffer.byteLength(wortlaut(a.bloecke), 'utf8'));
  }

  for (let i = 1; i < liste.length; i += 1) {
    const neu = extrahiereArtikel(await holeXml(liste[i].xmlUrl));
    const d = diffStaende(vorher, neu);
    stabilZahl += d.stabil.length;
    rohZahl += d.geaendertRoh.length;
    normZahl += d.geaendert.length;
    for (const eId of [...d.geaendert, ...d.nurAlt]) {
      formA += Buffer.byteLength(wortlaut(vorher.get(eId)!.bloecke), 'utf8');
    }
    for (const [eId, a] of neu) {
      const h = sha256(normalisiere(flachText(a)));
      if (!zustaende.has(eId)) zustaende.set(eId, new Set());
      zustaende.get(eId)!.add(h);
      zustandBytes.set(`${eId}|${h}`, Buffer.byteLength(wortlaut(a.bloecke), 'utf8'));
    }
    console.log(
      `  ${g.key} ${liste[i - 1].datum} → ${liste[i].datum}: stabil ${d.stabil.length}, `
      + `nur-alt ${d.nurAlt.length}, nur-neu ${d.nurNeu.length}, `
      + `roh-geändert ${d.geaendertRoh.length}, normalisiert-geändert ${d.geaendert.length}`,
    );
    vorher = neu;
    gesamtSchritte += 1;
  }

  // Form B: alle distinkten Zustände je eId, aber NUR für eIds mit mehr als einem Zustand
  // (unveränderte Artikel stehen im geltenden Snapshot, §5 — sie doppelt zu halten wäre
  // eine zweite Wahrheit).
  let formB = 0;
  for (const [eId, s] of zustaende) {
    if (s.size < 2) continue;
    for (const h of s) formB += zustandBytes.get(`${eId}|${h}`) ?? 0;
  }

  const q = textMasse ? (formA / textMasse) * 100 : 0;
  zeilen.push(
    `| ${g.key} | ${liste.length} | ${liste.length - 1} | ${(textMasse / 1024).toFixed(0)} KB | `
    + `${rohZahl} | ${normZahl} | ${stabilZahl ? ((1 - normZahl / rohZahl) * 100).toFixed(1) : '—'} % | `
    + `${(formA / 1024).toFixed(1)} KB | ${(formB / 1024).toFixed(1)} KB | ${q.toFixed(1)} % |`,
  );
  gesamtFormA += formA;
  gesamtFormB += formB;
  gesamtRoh += rohZahl;
  gesamtNorm += normZahl;
  gesamtStabil += stabilZahl;
  gesamtText += textMasse;
}

console.log('\n| Erlass | Stände ab 2021 | Schritte | Textmasse | roh «geändert» | normalisiert «geändert» | Rauschanteil | Form A (Alt je Schritt) | Form B (Zustände je eId) | q = A/Text |');
console.log('|---|---|---|---|---|---|---|---|---|---|');
for (const z of zeilen) console.log(z);
console.log(
  `\nSumme: ${gesamtSchritte} Schritte, ${gesamtStabil} stabile eId-Vergleiche, `
  + `roh ${gesamtRoh} «geändert» → normalisiert ${gesamtNorm} `
  + `(Rauschanteil ${gesamtRoh ? ((1 - gesamtNorm / gesamtRoh) * 100).toFixed(1) : '—'} %, `
  + `Falschtrefferquote roh ${gesamtStabil ? ((gesamtRoh / gesamtStabil) * 100).toFixed(1) : '—'} % `
  + `→ normalisiert ${gesamtStabil ? ((gesamtNorm / gesamtStabil) * 100).toFixed(1) : '—'} %).`,
);
console.log(
  `Form A ${(gesamtFormA / 1024).toFixed(1)} KB · Form B ${(gesamtFormB / 1024).toFixed(1)} KB `
  + `(B/A = ${gesamtFormA ? (gesamtFormB / gesamtFormA).toFixed(2) : '—'}) · `
  + `q = ${gesamtText ? ((gesamtFormA / gesamtText) * 100).toFixed(1) : '—'} % der Textmasse.`,
);
console.log(`Abruf ${heute}; Fenster ab ${SYNOPSE_FENSTER_AB}.`);
