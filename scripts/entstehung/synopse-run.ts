// scripts/entstehung/synopse-run.ts
// CLI-Runner der Synopse-Shards (E5, §11.6). Dünner Netz-/Schreib-Teil; die reine
// Logik (SPARQL-Form, AKN-Parser, Normalisierung, Diff) liegt in `synopse.ts`.
//
// §2: --datum aus der Shell (kein Date.now). Netz-Lauf, ≥0.5 s Abstand je Abruf.
// Aufruf: npm run entstehung:synopse -- --datum=$(date +%F)
//         optional --erlasse=A,B (statt aller Bund-Erlasse)
//         optional --cache=<dir>  (Roh-XML ausserhalb des Repos; für den zweiten,
//                                  byte-gleichen Determinismus-Lauf ohne Netz)
//         optional --parser-neu="<Grund>"  (entsperrt eine gewollte Parser-Änderung)
//
// DETERMINISMUS-WÄCHTER, erste Hälfte (§11.6 (5), Muster Lex/SFHAJJI): ändert sich ein
// Shard, obwohl der Quell-sha JEDER ausgewerteten Manifestation gleich blieb, bricht der
// Lauf ab. Parser-Drift darf nie wie eine Gesetzesänderung aussehen (§7d). Die zweite
// Hälfte — das von Hand geänderte Artefakt — verweigert `check:entstehung`.
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { sparqlBatch } from '../fedlex-sparql.ts';
import {
  baueStaendeQuery, baueStaende, extrahiereArtikel, diffStaende, flachText,
  normalisiere, eliKurzAusUrl, abstractUri, liveUrlFuerStand, tokenAusEId, sha256,
  serialisiereShard, shaShard, type ArtikelFassung,
} from './synopse.ts';
import {
  SYNOPSE_DIR, SYNOPSE_FENSTER_AB, NORM_PROFIL,
  type SynopseShard, type SynopseStand, type SynopseSchritt, type SynopseArtikel,
} from '../../src/lib/entstehung/synopse.ts';
import {
  SYNOPSE_REGISTER_PFAD, serialisiereSynopseRegister, type SynopseRegister,
} from './synopse-register.ts';

const arg = (n: string): string => {
  const a = process.argv.find((x) => x.startsWith(`--${n}=`));
  return a ? a.slice(n.length + 3) : '';
};
const heute = arg('datum');
if (!/^\d{4}-\d{2}-\d{2}$/.test(heute)) { console.error('--datum=YYYY-MM-DD nötig (§2)'); process.exit(1); }
const cacheDir = arg('cache');
const parserGrund = arg('parser-neu').trim();
const nurKeys = arg('erlasse').split(',').map((s) => s.trim()).filter(Boolean);

interface RegEintrag { key: string; ebene: string; quelleUrl: string }
const register = JSON.parse(readFileSync('public/normtext/register.json', 'utf8')) as { erlasse: RegEintrag[] };
const erlasse = register.erlasse
  .filter((e) => e.ebene === 'bund')
  .filter((e) => (nurKeys.length ? nurKeys.includes(e.key) : true))
  .map((e) => ({ key: e.key, eli: eliKurzAusUrl(e.quelleUrl) }))
  .filter((e): e is { key: string; eli: string } => e.eli !== null)
  .sort((a, b) => (a.key < b.key ? -1 : 1));

console.log(`synopse: ${erlasse.length} Bund-Erlasse → SPARQL (Konsolidierungen ab ${SYNOPSE_FENSTER_AB}) …`);
const bindings = await sparqlBatch(
  erlasse.map((e) => `<${abstractUri(e.eli)}>`),
  baueStaendeQuery,
  { batchGroesse: 20 },
);
const staendeJeEli = baueStaende(bindings, SYNOPSE_FENSTER_AB);

// ── Fussnoten-Historie als Gegenprobe (§11.6: jeder Alt-Block gegen sein Ereignis) ──
interface HistorieShard {
  artikel: Record<string, { ereignisse: { datum: string; quellen: { label: string; url: string }[] }[] }>;
}
function leseHistorie(key: string): HistorieShard | null {
  const p = `public/normtext/historie/${key}.json`;
  return existsSync(p) ? (JSON.parse(readFileSync(p, 'utf8')) as HistorieShard) : null;
}

async function abruf(url: string): Promise<string> {
  const res = await fetch(url, { headers: { Accept: 'application/xml' } });
  if (!res.ok) throw new Error(`Filestore antwortet ${res.status} für ${url}`);
  const typ = res.headers.get('content-type');
  // Erfolg wird am Content-Type gemessen, nie am Statuscode: der Filestore beantwortet
  // ein fehlendes Objekt mit HTTP 200 + Angular-Shell (Skill `scraping-swiss-official-sources`).
  if (typ !== null && !/xml/i.test(typ)) throw new Error(`Content-Type «${typ}» statt XML für ${url}`);
  const x = await res.text();
  if (/<title>\s*Casemates\s*<\/title>/i.test(x)) throw new Error(`Casemates-Shell statt Dokument (${url})`);
  return x;
}
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

const ELI_PRAEFIX = 'https://fedlex.data.admin.ch/eli/';

/**
 * AS-ELIs («oc») der Fussnoten-Quellen eines Ereignisses — der halbe Ereignis-Schlüssel
 * (`datum + oc-ELI`, §11.6). KURZFORM wie im Repo üblich (`eliKurz` in
 * `verfahrens-ereignisse.ts`): der Host-Präfix ist eine Konstante und hätte über 5000
 * Einträge rund 170 KB gekostet (§5 — dasselbe nicht zweimal).
 */
function ocAus(quellen: readonly { url: string }[]): string[] {
  return [...new Set(
    quellen.map((q) => q.url).filter((u) => u.startsWith(`${ELI_PRAEFIX}oc/`))
      .map((u) => u.slice(ELI_PRAEFIX.length)),
  )].sort();
}

/** Ein Artikel der Alt-Fassung → Shard-Eintrag (Gegenprobe gegen die Fussnoten-Historie). */
function baueArtikel(
  a: ArtikelFassung,
  art: 'geaendert' | 'entfallen',
  hist: HistorieShard | null,
  bis: string,
): SynopseArtikel {
  const token = tokenAusEId(a.eId);
  const ereignisse = (token && hist?.artikel[token]?.ereignisse.filter((e) => e.datum === bis)) || [];
  const oc = [...new Set(ereignisse.flatMap((e) => ocAus(e.quellen)))].sort();
  return {
    eId: a.eId,
    token,
    label: a.label,
    ...(a.ueberschrift ? { ueberschrift: a.ueberschrift } : {}),
    art,
    alt: a.bloecke,
    shaNorm: sha256(normalisiere(flachText(a))),
    zustand: ereignisse.length ? 'belegt' : 'ohne_ereignis',
    ...(oc.length ? { oc } : {}),
  };
}

const altRegister: SynopseRegister | null = existsSync(SYNOPSE_REGISTER_PFAD)
  ? (JSON.parse(readFileSync(SYNOPSE_REGISTER_PFAD, 'utf8')) as SynopseRegister)
  : null;
const neuRegister: SynopseRegister = { erzeugt: heute, normProfil: NORM_PROFIL, erlasse: {} };
const zuSchreiben: [string, string][] = [];
const geschrieben = new Set<string>();
const parserDrift: string[] = [];
let schritteGesamt = 0;
let altBloecke = 0;
let ohneEreignis = 0;
let konflikte = 0;

for (const e of erlasse) {
  const alleStaende = staendeJeEli.get(abstractUri(e.eli)) ?? [];
  // Künftige Konsolidierungen (dateApplicability > heute) werden NICHT verglichen: der
  // «Alt»-Text eines künftigen Schritts ist der GELTENDE Text, und den hält der Korpus
  // bereits (§5). Sie gehören in die Zeitleiste («tritt in Kraft am …», §11.5 B5), nicht
  // in die Synopse — gemessen 11.9.2026: 61 solche Schritte, 517 KB, reine Verdopplung.
  const liste = alleStaende.filter((s) => s.datum <= heute);
  const kuenftigeStaende = alleStaende.filter((s) => s.datum > heute).map((s) => s.datum);
  if (liste.length < 2) continue;
  const hist = leseHistorie(e.key);
  const staende: SynopseStand[] = [];
  const schritte: SynopseSchritt[] = [];

  let vorher: Map<string, ArtikelFassung> | null = null;
  for (let i = 0; i < liste.length; i += 1) {
    const xml = await holeXml(liste[i].xmlUrl);
    const artikel = extrahiereArtikel(xml);
    staende.push({
      datum: liste[i].datum,
      xmlUrl: liste[i].xmlUrl,
      liveUrl: liveUrlFuerStand(e.eli, liste[i].datum),
      sha: sha256(xml),
      bytes: Buffer.byteLength(xml, 'utf8'),
      abgerufen: heute,
      artikelZahl: artikel.size,
    });
    if (artikel.size === 0) {
      // Ein Stand ohne einen einzigen `<article eId=…>` ist kein leerer Erlass, sondern
      // eine fehlgeschlagene Extraktion — nie stillschweigend als «nichts geändert» buchen.
      throw new Error(`${e.key} Stand ${liste[i].datum}: 0 Artikel aus ${liste[i].xmlUrl} — Extraktion gescheitert.`);
    }
    if (vorher) {
      const von = liste[i - 1].datum;
      const bis = liste[i].datum;
      const d = diffStaende(vorher, artikel);
      const eintraege: SynopseArtikel[] = [
        ...d.geaendert.map((id) => baueArtikel(vorher!.get(id)!, 'geaendert', hist, bis)),
        ...d.nurAlt.map((id) => baueArtikel(vorher!.get(id)!, 'entfallen', hist, bis)),
      ].sort((a, b) => (a.eId < b.eId ? -1 : a.eId > b.eId ? 1 : 0));
      // Gegenprobe in der anderen Richtung: Fussnoten-Ereignisse am Ziel-Stand, zu denen
      // KEINE Textänderung beobachtet wurde. Der Widerspruch wird gelistet, nie aufgelöst.
      const geaendertTokens = new Set(eintraege.map((x) => x.token).filter(Boolean));
      const ereignisOhneAenderung = hist
        ? Object.entries(hist.artikel)
          .filter(([token, a]) => a.ereignisse.some((x) => x.datum === bis) && !geaendertTokens.has(token))
          .map(([token]) => token)
          .sort()
        : [];
      // Leere Diagnose-Listen werden WEGGELASSEN, nicht als `[]` geschrieben — 2393 von
      // 3018 Listen sind leer, und der Shard steht unter einem 8-MB-Deckel (§11.6).
      schritte.push({
        von,
        bis,
        ...(d.nurNeu.length ? { neuEIds: d.nurNeu } : {}),
        ...(d.ohneAltText.length ? { ohneAltText: d.ohneAltText } : {}),
        ...(ereignisOhneAenderung.length ? { ereignisOhneAenderung } : {}),
        artikel: eintraege,
      });
      schritteGesamt += 1;
      altBloecke += eintraege.length;
      ohneEreignis += eintraege.filter((x) => x.zustand === 'ohne_ereignis').length;
      konflikte += ereignisOhneAenderung.length;
    }
    vorher = artikel;
  }

  const shard: SynopseShard = {
    erlass: e.key,
    eli: e.eli,
    normProfil: NORM_PROFIL,
    erzeugt: heute,
    fensterAb: staende[0].datum,
    kuenftigeStaende,
    staende,
    schritte,
  };
  const roh = serialisiereShard(shard);
  const neuSha = shaShard(shard);
  const vor = altRegister?.erlasse[e.key];
  const quellenGleich = !!vor
    && vor.staende.length === staende.length
    && vor.staende.every((s, i) => s.datum === staende[i].datum && s.sha === staende[i].sha);
  if (quellenGleich && vor.shardSha !== neuSha) parserDrift.push(`${e.key} (${e.eli})`);

  zuSchreiben.push([join(SYNOPSE_DIR, `${e.key}.json`), roh]);
  geschrieben.add(`${e.key}.json`);
  neuRegister.erlasse[e.key] = {
    eli: e.eli,
    abgerufen: heute,
    shardSha: neuSha,
    bytes: Buffer.byteLength(roh, 'utf8'),
    schritte: schritte.length,
    altBloecke: schritte.reduce((n, s) => n + s.artikel.length, 0),
    staende: staende.map((s) => ({ datum: s.datum, sha: s.sha, xmlUrl: s.xmlUrl })),
    ...(parserGrund && quellenGleich && vor && vor.shardSha !== neuSha ? { parserAenderung: parserGrund } : {}),
  };
  console.log(`  ${e.key.padEnd(12)} ${String(staende.length).padStart(3)} Stände, ${String(schritte.length).padStart(3)} Schritte, ${String(shard.schritte.reduce((n, s) => n + s.artikel.length, 0)).padStart(4)} Alt-Blöcke, ${(Buffer.byteLength(roh, 'utf8') / 1024).toFixed(1).padStart(7)} KB`);
}

if (parserDrift.length && !parserGrund) {
  console.error(
    `synopse ROT: ${parserDrift.length} Shard(s) ändern sich, obwohl der Quell-sha JEDER `
    + 'ausgewerteten Konsolidierung gleich blieb — das ist Parser-Drift, keine '
    + 'Gesetzesänderung (§7d, §11.6 (5)):',
  );
  for (const d of parserDrift) console.error(`  - ${d}`);
  console.error(
    'Entweder war die Änderung unbeabsichtigt (dann rückgängig machen), oder sie ist gewollt: '
    + 'dann mit --parser-neu="<Grund>" erneut laufen lassen — der Grund landet im Register. '
    + 'Ändert die Änderung die NORMALISIERUNG, ist ein neues Profil (entstehung-norm/2) fällig, '
    + 'kein Überschreiben von /1.',
  );
  process.exit(1);
}

mkdirSync(SYNOPSE_DIR, { recursive: true });
for (const [pfad, inhalt] of zuSchreiben) writeFileSync(pfad, inhalt, 'utf8');
for (const f of readdirSync(SYNOPSE_DIR)) {
  if (f.endsWith('.json') && !geschrieben.has(f)) {
    rmSync(join(SYNOPSE_DIR, f));
    console.log(`synopse: verwaisten Shard entfernt — ${f}`);
  }
}
mkdirSync('bibliothek/register', { recursive: true });
writeFileSync(SYNOPSE_REGISTER_PFAD, serialisiereSynopseRegister(neuRegister), 'utf8');

console.log(
  `\nsynopse: ${zuSchreiben.length} Shard(s), ${schritteGesamt} Konsolidierungs-Schritte, `
  + `${altBloecke} Alt-Blöcke (davon ${ohneEreignis} ohne Fussnoten-Ereignis), `
  + `${konflikte} Fussnoten-Ereignisse ohne beobachtete Textänderung → ${SYNOPSE_DIR}`,
);
console.log(`synopse: Quell-Register ${Object.keys(neuRegister.erlasse).length} Einträge → ${SYNOPSE_REGISTER_PFAD}`);
