// scripts/datenhaltung/ingest.ts
// QS-DATA E0+: Reverse-Befüllung der Blob-Tabellen aus den bestehenden committeten JSONs.
// Zwei Ingest-Wege (§5 E0+ 3):
//   - Eintrag-Dateien ({erzeugt, eintraege}-Form): Bund-/Kanton-Normtext + Rechtsprechung.
//     Der `blob` je Eintrag speichert die exakte Struktur → byte-gleiche Rekonstruktion.
//   - Dokument-Manifeste (Nicht-eintraege-Form): register/index/norm-index als reiner
//     Byte-Roundtrip (Pfad → exakter Inhalt), ohne Struktur-Zerlegung.
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { basename, join } from 'node:path';
import type { DatabaseSync } from 'node:sqlite';
import type { NormSnapshot } from '../../src/lib/normtext/typen.ts';
import { schreibeErlass, type ErlasseMeta } from './erlass-rows';

// ── Datei-Klassen (Quell-Pfade) ────────────────────────────────────────────────
export const BUND_DIR = 'public/normtext/bund';
export const KANTON_DIR = 'public/normtext/kanton';
export const RECHTSPRECHUNG_DIRS = ['public/rechtsprechung/bund', 'public/rechtsprechung/kanton'];

// Manifeste je Doktyp-DB (Byte-Roundtrip, §5 E0+ 3). register.json trägt Trailing-Newline —
// der Dokument-Ingest speichert den EXAKTEN Inhalt, bildet sie also automatisch nach.
export const NORMTEXT_MANIFESTE = ['public/normtext/register.json', 'public/normtext/kanton/index.json'];

// Weitere committete Normtext-Nebendateien (E1-Rest Teil 2, Paritäts-Vollabdeckung):
// reiner dokument-Byte-Roundtrip (Pfad → exakter Inhalt). Heterogene Serialisierung
// (Seitendateien 2-Space, Struktur-Sidecars 1-Space) — der Dokument-Ingest speichert
// den EXAKTEN Inhalt, also byte-genau unabhängig von der Formatierung, ohne Struktur-
// Zerlegung. So haben ALLE committeten public/normtext/**/*.json eine Paritäts-Klasse.
export const NORMTEXT_SEITENDATEIEN = [
  'public/normtext/confidence.json',
  'public/normtext/kanton-systematik.json',
  'public/normtext/pdf-index.json',
];
export const NORMTEXT_STRUKTUR_DIR = 'public/normtext/struktur'; // rekursiv: bund/ + kanton/
export const RECHTSPRECHUNG_MANIFESTE = [
  'public/rechtsprechung/register.json',
  'public/rechtsprechung/norm-index.json',
];
// Schaufenster-Shards (Weiche B, §11.2): je Erlass eine committete Projektion des
// norm-index (nur Erlasse mit Artikel-Treffern). Variable Datei-Menge → über den
// Verzeichnis-Sammler, reiner Dokument-Byte-Roundtrip (Pfad → exakter Inhalt).
export const RECHTSPRECHUNG_SHARD_DIR = 'public/rechtsprechung/norm-index';
export const MATERIALIEN_MANIFESTE = ['public/materialien/register.json'];

export interface Eintrag {
  id?: string;
  erlass?: string;
  artikel?: string;
  artikelLabel?: string;
  [k: string]: unknown;
}
export interface EintragDatei {
  erzeugt?: string;
  eintraege: Eintrag[];
}

/** Zähler je Datei-Klasse für die Grün-Meldung des Paritäts-Tors. */
export type Zaehler = Record<string, number>;

// ── Pfad-Sammler ────────────────────────────────────────────────────────────────
function jsonFlach(dir: string, ausschluss = new Set<string>()): string[] {
  return readdirSync(dir)
    .filter((f) => f.endsWith('.json') && !ausschluss.has(f))
    .sort()
    .map((f) => join(dir, f));
}
function jsonRekursiv(dir: string): string[] {
  const treffer: string[] = [];
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) treffer.push(...jsonRekursiv(p));
    else if (e.name.endsWith('.json')) treffer.push(p);
  }
  return treffer.sort();
}

// ── Ingest-Bausteine ─────────────────────────────────────────────────────────────
function ingestEintragDateien(
  db: DatabaseSync,
  pfade: string[],
  typ: string,
  trailingNl: boolean,
): void {
  const dateiStmt = db.prepare('INSERT INTO datei (pfad, typ, erzeugt, trailing_nl) VALUES (?, ?, ?, ?)');
  const eintragStmt = db.prepare(
    'INSERT INTO eintrag (pfad, idx, id, erlass, artikel, artikel_label, blob) VALUES (?, ?, ?, ?, ?, ?, ?)',
  );
  for (const pfad of pfade) {
    const obj = JSON.parse(readFileSync(pfad, 'utf8')) as EintragDatei;
    dateiStmt.run(pfad, typ, obj.erzeugt ?? null, trailingNl ? 1 : 0);
    obj.eintraege.forEach((e, i) => {
      eintragStmt.run(
        pfad,
        i,
        e.id ?? null,
        e.erlass ?? null,
        e.artikel ?? null,
        e.artikelLabel ?? null,
        JSON.stringify(e),
      );
    });
  }
}

function ingestDokumente(db: DatabaseSync, pfade: string[], typ: string): void {
  const stmt = db.prepare('INSERT INTO dokument (pfad, typ, inhalt) VALUES (?, ?, ?)');
  for (const pfad of pfade) stmt.run(pfad, typ, readFileSync(pfad, 'utf8'));
}

// ── Doktyp-Ingest (→ die drei partitionierten DBs) ──────────────────────────────
/** Normtext-DB: Bund + Kanton (beide {erzeugt, eintraege}, KEIN Trailing-Newline) + Manifeste. */
export function ingestNormtext(db: DatabaseSync): Zaehler {
  const bund = jsonFlach(BUND_DIR);
  const kanton = jsonFlach(KANTON_DIR, new Set(['index.json']));
  const struktur = jsonRekursiv(NORMTEXT_STRUKTUR_DIR);
  ingestEintragDateien(db, bund, 'normtext-bund', false);
  ingestEintragDateien(db, kanton, 'normtext-kanton', false);
  ingestDokumente(db, NORMTEXT_MANIFESTE, 'normtext-manifest');
  ingestDokumente(db, NORMTEXT_SEITENDATEIEN, 'normtext-seitendatei');
  ingestDokumente(db, struktur, 'normtext-struktur');
  return {
    'Bund-Normtext': bund.length,
    'Kanton-Normtext': kanton.length,
    'Normtext-Manifeste': NORMTEXT_MANIFESTE.length,
    'Normtext-Seitendateien': NORMTEXT_SEITENDATEIEN.length,
    'Normtext-Struktur': struktur.length,
  };
}

// ── (2) Ziel-Tabellen (E1-Flip, Spalten-Weg) ────────────────────────────────────
// Reverse-Befüllung der ECHTEN Ziel-Tabellen (erlasse/erlass_fassungen/artikel) aus
// den committeten Bund- UND Kanton-Snapshots — derselbe Schreibpfad (erlass-rows.ts),
// den der Generator-Flip nutzt. Erlass-Identität (titel/rechtsgebiet/sr/status) kommt
// aus dem committeten Browse-Register (SSoT §5); die byte-tragende `abkuerzung` =
// NormSnapshot.erlass. Register-Key: Bund == gesetzKey ('OR') == NormSnapshot.quelle;
// Kanton == Dateiname-Stamm ('AG-291.150', mit Bindestrich) ≠ quelle 'AG' (E1-Rest B).
interface RegisterErlass {
  key: string;
  ebene: 'bund' | 'kanton';
  kanton: string | null;
  sr: string | null;
  titel: string;
  rechtsgebiet: string;
  status: string;
}

function ladeRegister(): Map<string, RegisterErlass> {
  const reg = JSON.parse(readFileSync('public/normtext/register.json', 'utf8')) as {
    erlasse: RegisterErlass[];
  };
  const m = new Map<string, RegisterErlass>();
  for (const e of reg.erlasse) m.set(e.key, e);
  return m;
}

/**
 * Ziel-Zeilen ALLER committeten Erlasse (E1 Bund + E1-Rest B Kanton). Byte-Parität
 * separat über den datenhaltung:doppellauf. Bund-Key = NormSnapshot.quelle (gesetzKey),
 * Kanton-Key = Dateiname-Stamm (== Register-PK); die byte-tragende quelle ('AG') leitet
 * erlass-rows aus meta.kanton ab (id-2.-Segment), nicht aus dem Schlüssel.
 */
export function ingestNormtextZiel(db: DatabaseSync): Zaehler {
  const register = ladeRegister();
  let bundErlasse = 0;
  let bundArtikel = 0;
  let kantonErlasse = 0;
  let kantonArtikel = 0;

  for (const pfad of jsonFlach(BUND_DIR)) {
    const datei = JSON.parse(readFileSync(pfad, 'utf8')) as { eintraege: NormSnapshot[] };
    if (datei.eintraege.length === 0) continue;
    const key = datei.eintraege[0].quelle; // Bund: quelle == key == gesetzKey
    const reg = register.get(key);
    if (!reg || reg.ebene !== 'bund') throw new Error(`ingestNormtextZiel: Bund-Erlass '${key}' fehlt im Register`);
    schreibeErlass(db, {
      key,
      ebene: 'bund',
      kanton: null,
      sr: reg.sr,
      abkuerzung: datei.eintraege[0].erlass, // byte-tragend (= NormSnapshot.erlass)
      titel: reg.titel,
      rechtsgebiet: reg.rechtsgebiet,
      status: reg.status,
    } satisfies ErlasseMeta, datei.eintraege);
    bundErlasse += 1;
    bundArtikel += datei.eintraege.length;
  }

  // Kanton (E1-Rest B): Schlüssel = Dateiname-Stamm ('AG-291.150' == Register-PK),
  // kanton = reg.kanton ('AG' == NormSnapshot.quelle, byte-tragend für die id-Zerlegung).
  for (const pfad of jsonFlach(KANTON_DIR, new Set(['index.json']))) {
    const datei = JSON.parse(readFileSync(pfad, 'utf8')) as { eintraege: NormSnapshot[] };
    if (datei.eintraege.length === 0) continue;
    const key = basename(pfad, '.json'); // 'AG-291.150'
    const reg = register.get(key);
    if (!reg || reg.ebene !== 'kanton') throw new Error(`ingestNormtextZiel: Kanton-Erlass '${key}' fehlt im Register`);
    schreibeErlass(db, {
      key,
      ebene: 'kanton',
      kanton: reg.kanton, // 'AG' == quelle
      sr: reg.sr,
      abkuerzung: datei.eintraege[0].erlass, // byte-tragend (= NormSnapshot.erlass)
      titel: reg.titel,
      rechtsgebiet: reg.rechtsgebiet,
      status: reg.status,
    } satisfies ErlasseMeta, datei.eintraege);
    kantonErlasse += 1;
    kantonArtikel += datei.eintraege.length;
  }

  return {
    'Ziel-Erlasse (Bund)': bundErlasse,
    'Ziel-Artikel (Bund)': bundArtikel,
    'Ziel-Erlasse (Kanton)': kantonErlasse,
    'Ziel-Artikel (Kanton)': kantonArtikel,
  };
}

/** Rechtsprechungs-DB: Bund + Kanton ({erzeugt, eintraege} MIT Trailing-Newline) + Manifeste. */
export function ingestRechtsprechung(db: DatabaseSync): Zaehler {
  const dateien = RECHTSPRECHUNG_DIRS.flatMap(jsonRekursiv).sort();
  const shards = existsSync(RECHTSPRECHUNG_SHARD_DIR) ? jsonFlach(RECHTSPRECHUNG_SHARD_DIR) : [];
  ingestEintragDateien(db, dateien, 'rechtsprechung', true);
  ingestDokumente(db, RECHTSPRECHUNG_MANIFESTE, 'rechtsprechung-manifest');
  ingestDokumente(db, shards, 'rechtsprechung-shard');
  return {
    Rechtsprechung: dateien.length,
    'Rechtsprechung-Manifeste': RECHTSPRECHUNG_MANIFESTE.length,
    'Leitfall-Shards': shards.length,
  };
}

/** Soft-Law-DB: Materialien-Manifest (Byte-Roundtrip). */
export function ingestSoftLaw(db: DatabaseSync): Zaehler {
  ingestDokumente(db, MATERIALIEN_MANIFESTE, 'materialien-manifest');
  return { Materialien: MATERIALIEN_MANIFESTE.length };
}
