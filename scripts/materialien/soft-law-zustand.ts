// scripts/materialien/soft-law-zustand.ts
// E6a Stufe 1 (FAHRPLAN-MATERIALIEN-VERZAHNUNG §2.3): Typen + Parser/Validator des
// committeten, append-only Zustands-Trägers `bibliothek/register/soft-law-zustand.jsonl`.
//
// WARUM committet (§0/B2): `daten/*.db` ist gitignored + wegwerfbar — «galt damals» und die
// Append-only-Invariante hätten in CI/frischem Clone sonst keine Baseline. Das JSONL ist der
// deterministische Wiederaufbau-Anker (Zustands-Manifest + Snapshot ⇒ DB, nie Live-Quelle allein).
//
// Format (JSONL trägt keine Kommentare — es lebt hier): zwei Zeilentypen.
//   Kopfzeile je Snapshot-Lauf:  {"typ":"lauf","quelle":…,"abgerufen":ISO,"indexSha":…}
//   Dokumentzeile je Zustandsänderung: {"typ":"dok","id":…,"status":…,"entlistet_am":…,
//     "drift_token":…,"quell_ids":…,"sha":…,"stand":ISO,"stand_quelle":…,"quelle_url":…,"abgerufen":ISO}
// Harte Validierung: unbekannter typ / fehlendes Pflichtfeld / entlistet ohne entlistet_am ⇒ Error.
// Leere Datei ⇒ leeres, gültiges Ergebnis.

import { readFileSync, existsSync } from 'node:fs';

export const ZUSTAND_PFAD = 'bibliothek/register/soft-law-zustand.jsonl';

export type SoftLawQuelle = 'estv-mwst' | 'seco' | 'edoeb' | 'estv-ks';
export type DokStatus = 'gelistet' | 'entlistet';
export type StandQuelle = 'hub-label' | 'pdf-text' | 'pdf-meta' | 'payload' | 'toc';

export interface LaufZeile {
  typ: 'lauf';
  quelle: SoftLawQuelle;
  abgerufen: string;
  indexSha: string;
}

export interface DokZeile {
  typ: 'dok';
  id: string;
  status: DokStatus;
  entlistet_am: string | null;
  drift_token: string;
  quell_ids: Record<string, unknown> | null;
  sha: string;
  stand: string;
  stand_quelle: StandQuelle;
  quelle_url: string;
  abgerufen: string;
}

export type ZustandZeile = LaufZeile | DokZeile;

export interface Zustand {
  /** Alle Kopfzeilen in Datei-Reihenfolge. */
  laeufe: LaufZeile[];
  /** Letzter (jüngster) Zustand je Dokument-id — append-only «last-write-wins». */
  letzterZustand: Map<string, DokZeile>;
  /** Alle Zeilen in Datei-Reihenfolge (für Append-only-/Quoten-Prüfungen im Tor). */
  zeilen: ZustandZeile[];
}

const QUELLEN = new Set<SoftLawQuelle>(['estv-mwst', 'seco', 'edoeb', 'estv-ks']);
const STATUS = new Set<DokStatus>(['gelistet', 'entlistet']);
const STAND_QUELLEN = new Set<StandQuelle>(['hub-label', 'pdf-text', 'pdf-meta', 'payload', 'toc']);
const ISO = /^\d{4}-\d{2}-\d{2}(T[\d:.]+Z?)?$/;

function istString(x: unknown): x is string {
  return typeof x === 'string' && x.length > 0;
}

/** Validiert + normalisiert eine Roh-Zeile; wirft mit Zeilennummer bei Verstoss. */
function parseZeile(roh: unknown, nr: number): ZustandZeile {
  if (typeof roh !== 'object' || roh === null || Array.isArray(roh)) {
    throw new Error(`soft-law-zustand Z.${nr}: kein JSON-Objekt.`);
  }
  const o = roh as Record<string, unknown>;
  if (o.typ === 'lauf') {
    if (!QUELLEN.has(o.quelle as SoftLawQuelle)) throw new Error(`soft-law-zustand Z.${nr}: unbekannte quelle ${JSON.stringify(o.quelle)}.`);
    if (!istString(o.abgerufen)) throw new Error(`soft-law-zustand Z.${nr}: lauf ohne abgerufen.`);
    if (!istString(o.indexSha)) throw new Error(`soft-law-zustand Z.${nr}: lauf ohne indexSha.`);
    return { typ: 'lauf', quelle: o.quelle as SoftLawQuelle, abgerufen: o.abgerufen, indexSha: o.indexSha };
  }
  if (o.typ === 'dok') {
    if (!istString(o.id)) throw new Error(`soft-law-zustand Z.${nr}: dok ohne id.`);
    if (!STATUS.has(o.status as DokStatus)) throw new Error(`soft-law-zustand Z.${nr}: dok ${o.id} ungültiger status ${JSON.stringify(o.status)}.`);
    if (!istString(o.drift_token)) throw new Error(`soft-law-zustand Z.${nr}: dok ${o.id} ohne drift_token (§0/A8).`);
    if (!istString(o.sha)) throw new Error(`soft-law-zustand Z.${nr}: dok ${o.id} ohne sha.`);
    if (!istString(o.stand) || !ISO.test(o.stand)) throw new Error(`soft-law-zustand Z.${nr}: dok ${o.id} stand kein ISO-Datum.`);
    if (!STAND_QUELLEN.has(o.stand_quelle as StandQuelle)) throw new Error(`soft-law-zustand Z.${nr}: dok ${o.id} ungültige stand_quelle ${JSON.stringify(o.stand_quelle)}.`);
    if (!istString(o.quelle_url)) throw new Error(`soft-law-zustand Z.${nr}: dok ${o.id} ohne quelle_url.`);
    if (!istString(o.abgerufen)) throw new Error(`soft-law-zustand Z.${nr}: dok ${o.id} ohne abgerufen.`);
    const status = o.status as DokStatus;
    const entlistetAm = o.entlistet_am ?? null;
    // entlistet ⇒ entlistet_am Pflicht; gelistet ⇒ entlistet_am null (keine Geister-Daten).
    if (status === 'entlistet') {
      if (!istString(entlistetAm)) throw new Error(`soft-law-zustand Z.${nr}: dok ${o.id} entlistet ohne entlistet_am.`);
    } else if (entlistetAm !== null) {
      throw new Error(`soft-law-zustand Z.${nr}: dok ${o.id} gelistet, aber entlistet_am gesetzt.`);
    }
    const quellIds = o.quell_ids ?? null;
    if (quellIds !== null && (typeof quellIds !== 'object' || Array.isArray(quellIds))) {
      throw new Error(`soft-law-zustand Z.${nr}: dok ${o.id} quell_ids ist weder null noch Objekt.`);
    }
    return {
      typ: 'dok',
      id: o.id,
      status,
      entlistet_am: entlistetAm as string | null,
      drift_token: o.drift_token,
      quell_ids: quellIds as Record<string, unknown> | null,
      sha: o.sha,
      stand: o.stand,
      stand_quelle: o.stand_quelle as StandQuelle,
      quelle_url: o.quelle_url,
      abgerufen: o.abgerufen,
    };
  }
  throw new Error(`soft-law-zustand Z.${nr}: unbekannter typ ${JSON.stringify(o.typ)}.`);
}

/** Liest + validiert das Zustands-Manifest. Fehlende/leere Datei ⇒ leeres, gültiges Ergebnis. */
export function ladeZustand(pfad = ZUSTAND_PFAD): Zustand {
  const laeufe: LaufZeile[] = [];
  const letzterZustand = new Map<string, DokZeile>();
  const zeilen: ZustandZeile[] = [];
  if (!existsSync(pfad)) return { laeufe, letzterZustand, zeilen };
  const roh = readFileSync(pfad, 'utf8');
  const linien = roh.split('\n');
  linien.forEach((linie, i) => {
    const t = linie.trim();
    if (t === '') return; // Leerzeilen (inkl. abschliessender) überspringen
    let obj: unknown;
    try {
      obj = JSON.parse(t);
    } catch {
      throw new Error(`soft-law-zustand Z.${i + 1}: kein gültiges JSON.`);
    }
    const zeile = parseZeile(obj, i + 1);
    zeilen.push(zeile);
    if (zeile.typ === 'lauf') laeufe.push(zeile);
    else letzterZustand.set(zeile.id, zeile);
  });
  return { laeufe, letzterZustand, zeilen };
}
