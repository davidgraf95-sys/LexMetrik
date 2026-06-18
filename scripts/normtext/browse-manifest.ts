/**
 * Browse-Manifest-Generator (Rubrik V «Gesetze»): scannt
 * public/normtext/{bund,kanton}/*.json, joint sie mit dem ERLASS_REGISTER und
 * schreibt das deterministisch sortierte public/normtext/register.json.
 *
 * §5 SSoT: Identität/Taxonomie kommt aus dem Register; ableitbare Felder
 * (Artikelzahl, Stand, quelleUrl, fassungsToken) aus den Snapshots — NIE doppelt
 * gepflegt. §2: kein Date.now() in der Logik (erzeugt-Datum kommt via Argument).
 * §6: schreibt NUR register.json, nie in bund/ oder kanton/ (Golden unberührt).
 *
 * Bund: jeder Snapshot MUSS einen Register-Eintrag haben (sonst Fehler → Tor).
 * Kanton: Kürzel/Titel/SR/Sprache werden aus Snapshot + Dateiname abgeleitet,
 * das Rechtsgebiet aus dem Register (kantonGebiet, Default öffentlich).
 *
 * Aufruf: npx vite-node scripts/normtext/browse-manifest.ts -- --datum=YYYY-MM-DD
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { NormSnapshotDatei } from '../../src/lib/normtext/typen.ts';
import type { BrowseErlass, BrowseManifest } from '../../src/lib/normtext/browse-typen.ts';
import {
  ERLASS_REGISTER, GEBIET_RANG, kantonGebiet,
  type ErlassRegistereintrag, type Sprache,
} from '../../src/lib/normtext/register.ts';

const NORMTEXT_DIR = 'public/normtext';

function jsonDateien(verzeichnis: string): string[] {
  return readdirSync(verzeichnis)
    .filter((f) => f.endsWith('.json') && f !== 'index.json' && f !== 'register.json')
    .sort();
}

function ladeDatei(pfad: string): NormSnapshotDatei | null {
  try {
    const d = JSON.parse(readFileSync(pfad, 'utf8')) as NormSnapshotDatei;
    return Array.isArray(d.eintraege) ? d : null;
  } catch {
    return null;
  }
}

/** Spätestes Stand-Datum der Einträge (ISO-Strings lexikographisch vergleichbar). */
function spaetesterStand(datei: NormSnapshotDatei): string {
  return datei.eintraege.reduce((max, e) => (e.stand > max ? e.stand : max), datei.eintraege[0]?.stand ?? '');
}

/** Sprache aus dem Datei-Stamm-Suffix ('-de'|'-fr'|'-it'), Default 'de'. */
export function spracheAusStamm(stamm: string): Sprache {
  if (stamm.endsWith('-fr')) return 'fr';
  if (stamm.endsWith('-it')) return 'it';
  return 'de';
}

/** Kürzel + Titel + SR aus dem Snapshot-erlass-Feld (z.B. 'Verfahrenskostendekret, VKD (BSG 161.12)'). */
export function identitaetAusErlass(erlass: string): { kuerzel: string; titel: string; sr: string | null } {
  const klammer = erlass.match(/\(([^)]*)\)\s*$/);
  const sr = klammer ? klammer[1].trim() : null;
  const vor = erlass.replace(/\s*\([^)]*\)\s*$/, '').trim();
  if (vor.includes(',')) {
    const idx = vor.lastIndexOf(',');
    const kuerzel = vor.slice(idx + 1).trim();
    const titel = vor.slice(0, idx).trim();
    return { kuerzel: kuerzel || vor, titel: titel || vor, sr };
  }
  // Kein Komma: das Kürzel steht allein vor der Klammer; voller String als Titel
  // (sonst wäre Titel == Kürzel und nichtssagend).
  return { kuerzel: vor, titel: erlass.trim(), sr };
}

function ohneAnker(url: string): string {
  return url.split('#')[0];
}

function bundEintrag(reg: ErlassRegistereintrag, datei: NormSnapshotDatei): BrowseErlass {
  return {
    key: reg.key, ebene: 'bund', kanton: null,
    kuerzel: reg.kuerzel, titel: reg.titel, sr: reg.sr ?? null,
    rechtsgebiet: reg.rechtsgebiet, sprache: reg.sprache, rang: reg.rang, status: 'snapshot',
    datei: `bund/${reg.key}.json`,
    artikelAnzahl: datei.eintraege.length,
    stand: spaetesterStand(datei),
    quelleUrl: ohneAnker(datei.eintraege[0]?.quelleUrl ?? ''),
    fassungsToken: datei.eintraege[0]?.fassungsToken ?? '',
  };
}

function kantonEintrag(stamm: string, datei: NormSnapshotDatei): BrowseErlass {
  const kanton = stamm.split('-')[0];
  const erstes = datei.eintraege[0];
  const { kuerzel, titel, sr } = identitaetAusErlass(erstes?.erlass ?? stamm);
  return {
    key: stamm, ebene: 'kanton', kanton,
    kuerzel, titel, sr,
    rechtsgebiet: kantonGebiet(stamm), sprache: spracheAusStamm(stamm), rang: 0, status: 'snapshot',
    datei: `kanton/${stamm}.json`,
    artikelAnzahl: datei.eintraege.length,
    stand: spaetesterStand(datei),
    quelleUrl: ohneAnker(erstes?.quelleUrl ?? ''),
    fassungsToken: erstes?.fassungsToken ?? '',
  };
}

function liveLinkEintrag(reg: ErlassRegistereintrag): BrowseErlass {
  return {
    key: reg.key, ebene: reg.ebene, kanton: reg.kanton ?? null,
    kuerzel: reg.kuerzel, titel: reg.titel, sr: reg.sr ?? null,
    rechtsgebiet: reg.rechtsgebiet, sprache: reg.sprache, rang: reg.rang, status: 'nur-live-link',
    datei: null, artikelAnzahl: 0,
    stand: reg.stand ?? '', quelleUrl: reg.quelleUrl ?? '', fassungsToken: '',
  };
}

/** Deterministische Sortierung: Bund vor Kanton; Bund nach Gebiet→Rang→Key;
 *  Kanton nach Kanton→Gebiet→Kürzel→Key. */
function vergleiche(a: BrowseErlass, b: BrowseErlass): number {
  if (a.ebene !== b.ebene) return a.ebene === 'bund' ? -1 : 1;
  if (a.ebene === 'bund') {
    return GEBIET_RANG[a.rechtsgebiet] - GEBIET_RANG[b.rechtsgebiet]
      || a.rang - b.rang || a.key.localeCompare(b.key);
  }
  return (a.kanton ?? '').localeCompare(b.kanton ?? '')
    || GEBIET_RANG[a.rechtsgebiet] - GEBIET_RANG[b.rechtsgebiet]
    || a.kuerzel.localeCompare(b.kuerzel) || a.key.localeCompare(b.key);
}

/** Baut das Browse-Manifest aus Register + Snapshot-Dateien (rein, testbar). */
export function baueBrowseManifest(erzeugt: string, basis = NORMTEXT_DIR): BrowseManifest {
  const bundReg = new Map(ERLASS_REGISTER.filter((r) => r.ebene === 'bund').map((r) => [r.key, r]));
  const erlasse: BrowseErlass[] = [];

  // Bund: jeder Snapshot MUSS einen Register-Eintrag haben (Orphan-Tor).
  for (const f of jsonDateien(join(basis, 'bund'))) {
    const stamm = f.replace(/\.json$/, '');
    const datei = ladeDatei(join(basis, 'bund', f));
    if (!datei) continue;
    const reg = bundReg.get(stamm);
    if (!reg) throw new Error(`browse-manifest: Bund-Snapshot ${stamm}.json ohne Register-Eintrag (ERLASS_REGISTER ergänzen).`);
    erlasse.push(bundEintrag(reg, datei));
  }

  // Kanton: Identität aus Snapshot/Dateiname abgeleitet, Gebiet aus Register.
  for (const f of jsonDateien(join(basis, 'kanton'))) {
    const stamm = f.replace(/\.json$/, '');
    const datei = ladeDatei(join(basis, 'kanton', f));
    if (!datei) continue;
    erlasse.push(kantonEintrag(stamm, datei));
  }

  // Register-Einträge ohne Snapshot (status 'nur-live-link') ergänzen.
  for (const reg of ERLASS_REGISTER) {
    if (reg.status === 'nur-live-link') erlasse.push(liveLinkEintrag(reg));
  }

  erlasse.sort(vergleiche);
  return { erzeugt, erlasse };
}

/** Schreibpfad des Browse-Manifests (relativ zur Repo-Wurzel). */
export const REGISTER_PFAD = join(NORMTEXT_DIR, 'register.json');
