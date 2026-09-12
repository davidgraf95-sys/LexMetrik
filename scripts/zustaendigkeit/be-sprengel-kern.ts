// scripts/zustaendigkeit/be-sprengel-kern.ts — Bezug + Zuordnung der BE-Sprengel.
//
// Geteilt von `be-sprengel-generieren.ts` (schreibt das Artefakt) und
// `check-be-sprengel-netz.ts` (rechnet gegen die Live-Quelle nach). Eine
// Quelle für beide Wege — sonst prüft das Netz-Tor eine zweite Wahrheit (§5).
//
// QUELLEN (Amt für Geoinformation des Kantons Bern; Lizenz «Freie Nutzung.
// Quellenangabe ist Pflicht.», agi-dv-nutzungsbedingungen-de.pdf):
//   ADMRG   Regionalgerichte              — Flächen je Gericht/Standort, Zivil/Straf getrennt
//   ADMRSA  Regionale Staatsanwaltschaften — Flächen je Staatsanwaltschaft
//   GRENZ5  Politische Grenzen             — Gemeindeflächen mit BFS-Nummer
// Belege, Normbasis (Art. 80/81/92 GSOG, BSG 161.1) und Messprotokoll:
// bibliothek/behoerden/be-sprengel-geodaten-2026-09-12.md
//
// KEINE Laufzeit-Geodaten: alles hier ist Build-Zeit, das Ergebnis ist die
// kompakte Projektion src/data/zustaendigkeit/beSprengel.json (§5).

import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { imGebiet, innenPunkt, leseGeometrie, leseTabelle, type Gebiet } from './gpkg';

export const CACHE = '/tmp/lexmetrik-be-geo';
const NETZ_KOPF = { 'User-Agent': 'LexMetrik/1.0 (+https://lexmetrik.ch; Build-Zeit-Bezug amtlicher Geodaten)' };

export const DATENSAETZE = [
  { code: 'ADMRG', titel: 'Regionalgerichte', datei: 'ADMRG.gpkg', tabelle: 'geodb.admrg_rg_vw' },
  { code: 'ADMRSA', titel: 'Regionale Staatsanwaltschaften', datei: 'ADMRSA.gpkg', tabelle: 'geodb.admrsa_rsa_vw' },
  { code: 'GRENZ5', titel: 'Politische Grenzen', datei: 'GRENZ5.gpkg', tabelle: 'geodb.grenz5_g5_vw' },
] as const;

export const bezugsUrl = (code: string): string =>
  `https://geofiles.be.ch/geoportal/pub/download/${code}/${code.toLowerCase()}.gpkg.zip`;
export const detailUrl = (code: string): string =>
  `https://www.agi.dij.be.ch/de/start/geoportal/geodaten/detail.html?type=geoproduct&code=${code}`;
export const stacUrl = (code: string): string =>
  `https://geofiles.be.ch/geoportal/pub/stac/de/${code}/collection.json`;

/** Die vier Gerichtsregionen in der Reihenfolge von Art. 80 Abs. 1 GSOG. */
export const REGIONEN = ['Berner Jura-Seeland', 'Emmental-Oberaargau', 'Bern-Mittelland', 'Oberland'] as const;
export type Region = (typeof REGIONEN)[number];

/** Amtliche Bezeichnungen der Quelle → Region. Fixe Abbildung, kein Fuzzy-
 *  Matching: die Quelle führt Berner Jura-Seeland teils französisch
 *  («Tribunal régional Jura bernois-Seeland»). Trifft ein Name keine Zeile,
 *  bricht der Lauf ab — eine neue/umbenannte Region ist ein Rechtsereignis
 *  und darf nicht still in einen bestehenden Sprengel fallen (§7/§8). */
const REGION_MUSTER: [RegExp, Region][] = [
  [/Jura bernois-Seeland|Berner Jura-Seeland/, 'Berner Jura-Seeland'],
  [/Emmental-Oberaargau/, 'Emmental-Oberaargau'],
  [/Bern-Mittelland/, 'Bern-Mittelland'],
  [/Oberland/, 'Oberland'],
];
function regionVon(name: string, herkunft: string): Region {
  for (const [muster, region] of REGION_MUSTER) if (muster.test(name)) return region;
  throw new Error(`be-sprengel: «${name}» (${herkunft}) passt auf keine der vier Gerichtsregionen nach Art. 80 Abs. 1 GSOG — Quelle geändert, Lauf abgebrochen.`);
}

export interface Anschrift { adresse: string; plzOrt: string }
export interface GerichtsStandort {
  region: Region;
  name: string;
  /** Französische amtliche Bezeichnung, wo die Quelle sie führt. */
  nameFr: string | null;
  /** Bezeichnung der Aussenstelle (Art. 81 Abs. 1 GSOG), sonst null. */
  aussenstelle: string | null;
  zivil: Anschrift;
  straf: Anschrift;
  url: string | null;
}
export interface Staatsanwaltschaft { region: Region; name: string; adresse: string; plzOrt: string }
export interface Zuordnung {
  gerichte: GerichtsStandort[];
  staatsanwaltschaften: Staatsanwaltschaft[];
  /** BFS-Gemeindenummer → [Index in gerichte, Index in staatsanwaltschaften]. */
  gemeinden: Record<string, [number, number]>;
  /** Amtlicher Gemeindename (Schreibweise GRENZ5/swisstopo) → BFS-Nummer. */
  namen: Record<string, number>;
  /** Anzahl Gemeinden je Verwaltungskreis-Nummer → Gerichtsindex (Gegenprobe). */
  kreise: Record<string, number>;
}

/** Amtliche Detailseite je Regionalgericht (zsg.justice.be.ch, erreichbar
 *  geprüft 12.9.2026). Die Geodaten führen keine URL; der Live-Link ist
 *  §7-Pflichtmerkmal, darum hier als verifizierte, feste Abbildung. */
const GERICHTS_URL: Record<Region, string> = {
  'Berner Jura-Seeland': 'https://www.zsg.justice.be.ch/de/start/ueber-uns/regionalgerichte/berner-jura-seeland.html',
  'Emmental-Oberaargau': 'https://www.zsg.justice.be.ch/de/start/ueber-uns/regionalgerichte/emmental-oberaargau.html',
  'Bern-Mittelland': 'https://www.zsg.justice.be.ch/de/start/ueber-uns/regionalgerichte/bern-mittelland.html',
  Oberland: 'https://www.zsg.justice.be.ch/de/start/ueber-uns/regionalgerichte/oberland.html',
};

// ── Bezug ───────────────────────────────────────────────────────────────────

/** GeoPackages beziehen und entpacken (idempotent; vorhandener Cache wird
 *  wiederverwendet, `--frisch` erzwingt den Neubezug). */
export async function beziehe(frisch = false): Promise<void> {
  mkdirSync(CACHE, { recursive: true });
  for (const d of DATENSAETZE) {
    const gpkg = join(CACHE, d.datei);
    if (!frisch && existsSync(gpkg)) continue;
    const zip = join(CACHE, `${d.code}.gpkg.zip`);
    const antwort = await fetch(bezugsUrl(d.code), { headers: NETZ_KOPF });
    if (!antwort.ok) throw new Error(`be-sprengel: ${d.code} → HTTP ${antwort.status} von ${bezugsUrl(d.code)}`);
    const bytes = Buffer.from(await antwort.arrayBuffer());
    // Ein 200 mit HTML statt ZIP ist der klassische stille Fehlschlag.
    if (bytes.length < 1024 || bytes[0] !== 0x50 || bytes[1] !== 0x4b) {
      throw new Error(`be-sprengel: ${d.code} lieferte ${bytes.length} Bytes ohne ZIP-Signatur (vermutlich eine Fehlerseite mit Status 200).`);
    }
    writeFileSync(zip, bytes);
    execFileSync('unzip', ['-o', '-q', zip, '-d', CACHE], { stdio: 'inherit' });
    if (!existsSync(gpkg)) throw new Error(`be-sprengel: ${d.datei} fehlt nach dem Entpacken von ${zip}.`);
  }
}

/** Stand der Datensätze aus den STAC-Collections (amtlich, nie Date.now). */
export async function leseStand(): Promise<string> {
  const staende = new Set<string>();
  for (const d of DATENSAETZE) {
    const antwort = await fetch(stacUrl(d.code), { headers: NETZ_KOPF });
    if (!antwort.ok) throw new Error(`be-sprengel: STAC ${d.code} → HTTP ${antwort.status}`);
    const stac = (await antwort.json()) as { extent?: { temporal?: { interval?: (string | null)[][] } } };
    const von = stac.extent?.temporal?.interval?.[0]?.[0];
    if (typeof von !== 'string') throw new Error(`be-sprengel: STAC ${d.code} ohne temporal.interval[0][0].`);
    staende.add(von.slice(0, 10));
  }
  if (staende.size !== 1) {
    throw new Error(`be-sprengel: die drei Datensätze tragen verschiedene Stände (${[...staende].sort().join(', ')}) — Zuordnung über Stände hinweg wäre eine stille Mischung (§7).`);
  }
  return [...staende][0];
}

// ── Zuordnung ───────────────────────────────────────────────────────────────

const str = (w: unknown, feld: string): string => {
  if (typeof w !== 'string') throw new Error(`be-sprengel: Feld «${feld}» ist kein Text.`);
  return w.trim();
};
const zahl = (w: unknown, feld: string): number => {
  if (typeof w !== 'number' || !Number.isInteger(w)) throw new Error(`be-sprengel: Feld «${feld}» ist keine ganze Zahl.`);
  return w;
};

/** Rechnet die Gemeinde→Sprengel-Zuordnung aus dem Cache. Rein, ohne Netz. */
export function ordneZu(): Zuordnung {
  // ── Gerichte: Flächen je Standort, Zivil/Straf als eigene Zeilen ──────────
  const rgRoh = leseTabelle(join(CACHE, 'ADMRG.gpkg'), 'geodb.admrg_rg_vw',
    ['fid', 'rgname', 'asname', 'rgtyp', 'adresse', 'plz_ort', 'geometry']);
  interface RgZeile { region: Region; nameRoh: string; aussenstelle: string | null; typ: string; adresse: string; plzOrt: string; g: Gebiet }
  const rg: RgZeile[] = rgRoh.map((r) => {
    const nameRoh = str(r.rgname, 'rgname');
    const as = str(r.asname, 'asname');
    return {
      region: regionVon(nameRoh, 'ADMRG.rgname'),
      nameRoh,
      aussenstelle: as === '-' || as === '' ? null : as,
      typ: str(r.rgtyp, 'rgtyp'),
      adresse: str(r.adresse, 'adresse'),
      plzOrt: str(r.plz_ort, 'plz_ort'),
      g: leseGeometrie(r.geometry as Uint8Array),
    };
  });
  // Standort = Region + Aussenstelle. Je Standort erwarten wir entweder eine
  // Zeile ohne Typ-Trennung oder genau je eine für Zivil- und Strafsachen.
  const standortSchluessel = (z: RgZeile): string => `${z.region}|${z.aussenstelle ?? ''}`;
  const proStandort = new Map<string, RgZeile[]>();
  for (const z of rg) {
    const k = standortSchluessel(z);
    proStandort.set(k, [...(proStandort.get(k) ?? []), z]);
  }
  const gerichte: GerichtsStandort[] = [];
  const gerichtsGebiete: Gebiet[] = [];
  const reihenfolge = [...proStandort.keys()].sort((a, b) => {
    const [ra, aa] = a.split('|');
    const [rb, ab] = b.split('|');
    const d = REGIONEN.indexOf(ra as Region) - REGIONEN.indexOf(rb as Region);
    return d !== 0 ? d : aa.localeCompare(ab, 'de');
  });
  for (const k of reihenfolge) {
    const zeilen = proStandort.get(k)!;
    const zivilZ = zeilen.find((z) => /Zivilsachen/.test(z.typ)) ?? zeilen.find((z) => z.typ === '-' || z.typ === '');
    const strafZ = zeilen.find((z) => /Strafsachen/.test(z.typ)) ?? zeilen.find((z) => z.typ === '-' || z.typ === '');
    if (!zivilZ || !strafZ) {
      throw new Error(`be-sprengel: Standort «${k}» hat keine vollständige Zivil-/Straf-Anschrift (Typen: ${zeilen.map((z) => z.typ).join(', ')}).`);
    }
    const deutsch = zeilen.find((z) => /^Regionalgericht/.test(z.nameRoh));
    const franzoesisch = zeilen.find((z) => /^Tribunal/.test(z.nameRoh));
    gerichte.push({
      region: zivilZ.region,
      name: deutsch?.nameRoh ?? `Regionalgericht ${zivilZ.region}`,
      nameFr: franzoesisch?.nameRoh ?? null,
      aussenstelle: zivilZ.aussenstelle,
      zivil: { adresse: zivilZ.adresse, plzOrt: zivilZ.plzOrt },
      straf: { adresse: strafZ.adresse, plzOrt: strafZ.plzOrt },
      url: GERICHTS_URL[zivilZ.region],
    });
    gerichtsGebiete.push(...zeilen.map((z) => z.g));
  }
  // Index je Fläche → Index im Gerichte-Array (eine Fläche kann zu mehreren
  // Zeilen desselben Standorts gehören).
  const flaecheZuGericht: number[] = [];
  {
    let i = 0;
    for (const k of reihenfolge) {
      const n = proStandort.get(k)!.length;
      for (let j = 0; j < n; j++) flaecheZuGericht[i + j] = reihenfolge.indexOf(k);
      i += n;
    }
  }

  // ── Staatsanwaltschaften ─────────────────────────────────────────────────
  const saRoh = leseTabelle(join(CACHE, 'ADMRSA.gpkg'), 'geodb.admrsa_rsa_vw',
    ['fid', 'rsaname', 'adresse', 'plz_ort', 'geometry']);
  const saZeilen = saRoh.map((r) => ({
    region: regionVon(str(r.rsaname, 'rsaname'), 'ADMRSA.rsaname'),
    name: str(r.rsaname, 'rsaname'),
    adresse: str(r.adresse, 'adresse'),
    plzOrt: str(r.plz_ort, 'plz_ort'),
    g: leseGeometrie(r.geometry as Uint8Array),
  })).sort((a, b) => REGIONEN.indexOf(a.region) - REGIONEN.indexOf(b.region));
  if (saZeilen.length !== REGIONEN.length) {
    throw new Error(`be-sprengel: ${saZeilen.length} regionale Staatsanwaltschaften gefunden, Art. 92 Abs. 1 GSOG nennt ${REGIONEN.length}.`);
  }
  const staatsanwaltschaften: Staatsanwaltschaft[] = saZeilen.map((z) => ({ region: z.region, name: z.name, adresse: z.adresse, plzOrt: z.plzOrt }));

  // ── Gemeinden ────────────────────────────────────────────────────────────
  // kt = 2 (Bern), see = 0 (Seeflächen tragen keine Gemeinde).
  const gemRoh = leseTabelle(join(CACHE, 'GRENZ5.gpkg'), 'geodb.grenz5_g5_vw',
    ['fid', 'kt', 'see', 'bfsnr', 'gemname', 'vkreisnr', 'geometry']);
  const gemeinden: Record<string, [number, number]> = {};
  const namen: Record<string, number> = {};
  const kreise: Record<string, number> = {};
  const kreisKonflikte: string[] = [];
  const bfsListe: number[] = [];
  for (const r of gemRoh) {
    if (zahl(r.kt, 'kt') !== 2 || zahl(r.see, 'see') !== 0) continue;
    const bfs = zahl(r.bfsnr, 'bfsnr');
    const name = str(r.gemname, 'gemname');
    const kreis = zahl(r.vkreisnr, 'vkreisnr');
    const flaeche = leseGeometrie(r.geometry as Uint8Array);
    const punkt = innenPunkt(flaeche);
    if (!imGebiet(flaeche, punkt[0], punkt[1])) {
      throw new Error(`be-sprengel: Innenpunkt von ${name} (BFS ${bfs}) liegt nicht in der eigenen Gemeindefläche.`);
    }
    const treffer = new Set<number>();
    gerichtsGebiete.forEach((g, i) => { if (imGebiet(g, punkt[0], punkt[1])) treffer.add(flaecheZuGericht[i]); });
    if (treffer.size !== 1) {
      throw new Error(`be-sprengel: ${name} (BFS ${bfs}) trifft ${treffer.size} Gerichtssprengel (erwartet genau einen).`);
    }
    const saTreffer = saZeilen.map((z, i) => (imGebiet(z.g, punkt[0], punkt[1]) ? i : -1)).filter((i) => i >= 0);
    if (saTreffer.length !== 1) {
      throw new Error(`be-sprengel: ${name} (BFS ${bfs}) trifft ${saTreffer.length} Staatsanwaltschafts-Sprengel (erwartet genau einen).`);
    }
    const gIdx = [...treffer][0];
    if (gemeinden[String(bfs)] !== undefined) throw new Error(`be-sprengel: BFS-Nummer ${bfs} doppelt in GRENZ5.`);
    if (namen[name] !== undefined) throw new Error(`be-sprengel: Gemeindename «${name}» doppelt in GRENZ5.`);
    gemeinden[String(bfs)] = [gIdx, saTreffer[0]];
    namen[name] = bfs;
    bfsListe.push(bfs);
    const k = String(kreis);
    if (kreise[k] === undefined) kreise[k] = gIdx;
    else if (kreise[k] !== gIdx) kreisKonflikte.push(`${k} (${name})`);
  }
  // Gegenprobe zu Art. 80 Abs. 2 GSOG: die Gerichtsregionen sind Vereinigungen
  // von Verwaltungsregionen — kein Verwaltungskreis darf zwei Sprengel treffen.
  if (kreisKonflikte.length > 0) {
    throw new Error(`be-sprengel: Verwaltungskreise über zwei Gerichtssprengel verteilt: ${kreisKonflikte.join(', ')} — widerspricht Art. 80 Abs. 2 GSOG.`);
  }
  if (bfsListe.length === 0) throw new Error('be-sprengel: keine BE-Gemeinde in GRENZ5 gefunden.');

  // Sortierte Ausgabe (Determinismus der Serialisierung).
  const sortiert = (o: Record<string, unknown>): Record<string, never> =>
    Object.fromEntries(Object.keys(o).sort((a, b) => a.localeCompare(b, 'de')).map((k) => [k, o[k]])) as Record<string, never>;
  return {
    gerichte,
    staatsanwaltschaften,
    gemeinden: Object.fromEntries([...bfsListe].sort((a, b) => a - b).map((b) => [String(b), gemeinden[String(b)]])),
    namen: sortiert(namen) as unknown as Record<string, number>,
    kreise: sortiert(kreise) as unknown as Record<string, number>,
  };
}

/** Das committete Artefakt lesen (ohne Netz). */
export const ARTEFAKT = 'src/data/zustaendigkeit/beSprengel.json';
export const leseArtefakt = (): Record<string, unknown> =>
  JSON.parse(readFileSync(ARTEFAKT, 'utf8')) as Record<string, unknown>;
