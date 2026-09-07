// ─── Generator: Verzahnungs-Shards → Zähl-Datei je Erlass ────────────────────
//
// W2·24-R6c, Prüfer-Befund R6 «ZÄHL-DATEI». Die Bezüge-Zeile am Artikelkopf
// (D20 (b), `parts/BezuegeKopf.tsx`) zeigt «3 Entscheide · 1 Materialie ·
// Rechner ›». Die Zahl der ENTSCHEIDE stand bis hierher nur zur Verfügung, wenn
// der Leser den vollen Bezugs-Shard geladen hatte (OR: 2.2 MB roh); die Zahl der
// MATERIALIEN gar nicht — die Rubrik fehlte deshalb ganz, statt eine Zusage ohne
// Deckung zu machen (§8, Kommentar in BezuegeKopf.tsx).
//
// Dieses Skript zieht beide Zahlen ZUR BUILDZEIT aus denselben Shards und legt
// sie je Erlass in eine winzige Datei. Der Leser lädt sie im Leerlauf statt des
// Shards; das ÖFFNEN der Zeile lädt weiterhin lazy den vollen Apparat.
//
//   npm run gen:bezuege-zaehler     erzeugt/aktualisiert die Dateien
//   npm run check:bezuege-zaehler   prüft Drift (Datei ≠ Shards) → exit 1
//
// KEINE ZWEITE WAHRHEIT (§5). Gezählt wird NICHT neu, sondern aus den
// vorhandenen Projektionen abgeschrieben:
//   · Entscheide  = `gesamtProArtikel[art]` aus `public/rechtsprechung/bezuege/
//     <KEY>.json` — im Shard ausdrücklich als «Kanten je Status OHNE UI-Filter,
//     die Bezugsgrösse» geführt (bezuegeLaden.ts). Die Summe über die Status ist
//     genau die Zahl, die die Zeile im ungefilterten Zustand nennt.
//   · Materialien = die Zahl der VERSCHIEDENEN Dokumente, die an einem Artikel
//     hängen (`kanten[].dok` aus `public/materialien/kanten/<KEY>.json`, nach
//     `dok` entdoppelt). Nicht die Kantenzahl: zwei Fundstellen desselben
//     Kreisschreibens sind EINE Materialie, und die Zeile sagt «1 Materialie».
//
// ARTIKEL-SCHLÜSSEL — DIE EINE FALLE DIESER DATEI. Die beiden Quellen führen den
// Artikel VERSCHIEDEN: der Bezugs-Shard normalisiert (`336c`, aus dem Zitat-Text
// extrahiert), der Materialien-Shard trägt die eId-nahe Unterstrich-Form
// (`15_a`), und der Leser reicht wiederum `e.artikel` = `336_c` durch. Geschlüsselt
// wird darum durchgehend auf die NORMALISIERTE Form — mit `normArtikelToken`,
// also mit genau der Funktion, die schon heute beide Query-Pfade zusammenführt
// (§5: eine Normalisierung, nicht drei). Der Konsument normalisiert mit
// derselben Funktion; `src/tests/bezuege-zaehler.test.ts` hält beide Seiten
// gegeneinander.
import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync, rmSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { normArtikelToken } from '../src/lib/rechtsprechung/norm-index.ts';

const wurzel = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const BEZUEGE_DIR = resolve(wurzel, 'public/rechtsprechung/bezuege');
const MATERIAL_DIR = resolve(wurzel, 'public/materialien/kanten');
export const ZIEL_DIR = resolve(wurzel, 'public/verzahnung/bezuege-zaehler');

interface BezugsShardRoh {
  erlass?: string;
  gesamtProArtikel?: Record<string, Record<string, number>>;
}
interface MaterialShardRoh {
  erlass?: string;
  kanten?: Array<{ dok?: string; artikel?: string }>;
}

/** Was in einer Zähl-Datei steht. `a` bildet Artikel-Token auf `[Entscheide,
 *  Materialien]` ab — Paar-Form statt Objekt, weil sie in 1'686 Einträgen
 *  je Erlass rund ein Drittel der Bytes spart und die Bedeutung an genau EINER
 *  Stelle steht (hier). Nullen fallen weg: was nicht dasteht, ist 0. */
export interface BezuegeZaehlDatei {
  erzeugt: string;
  erlass: string;
  a: Record<string, [entscheide: number, materialien: number]>;
}

function lies<T>(pfad: string): T {
  return JSON.parse(readFileSync(pfad, 'utf8')) as T;
}

/** Alle Erlass-Schlüssel, für die irgendeine Quelle etwas hergibt. */
function schluessel(): string[] {
  const s = new Set<string>();
  for (const dir of [BEZUEGE_DIR, MATERIAL_DIR]) {
    if (!existsSync(dir)) continue;
    for (const f of readdirSync(dir)) if (f.endsWith('.json')) s.add(f.slice(0, -5));
  }
  return [...s].sort();
}

/** Die Zähl-Datei EINES Erlasses — rein aus den Shards, ohne Zwischenspeicher. */
export function baueZaehler(key: string, erzeugt: string): BezuegeZaehlDatei | null {
  const a: Record<string, [number, number]> = {};

  const bezPfad = resolve(BEZUEGE_DIR, `${key}.json`);
  if (existsSync(bezPfad)) {
    const shard = lies<BezugsShardRoh>(bezPfad);
    for (const [rohArt, proStatus] of Object.entries(shard.gesamtProArtikel ?? {})) {
      const n = Object.values(proStatus).reduce((s, v) => s + (typeof v === 'number' ? v : 0), 0);
      if (n <= 0) continue;
      const art = normArtikelToken(rohArt);
      const paar = a[art] ?? [0, 0];
      // Zwei Roh-Schreibweisen desselben Artikels fallen beim Normalisieren
      // zusammen — dann ist die Zahl die SUMME, nicht die letzte.
      paar[0] += n;
      a[art] = paar;
    }
  }

  const matPfad = resolve(MATERIAL_DIR, `${key}.json`);
  if (existsSync(matPfad)) {
    const shard = lies<MaterialShardRoh>(matPfad);
    // Entdoppeln nach Dokument: zwei Fundstellen desselben Kreisschreibens sind
    // EINE Materialie (s. Kopfkommentar).
    const proArtikel = new Map<string, Set<string>>();
    for (const k of shard.kanten ?? []) {
      if (!k.artikel || !k.dok) continue;
      const art = normArtikelToken(k.artikel);
      const menge = proArtikel.get(art) ?? new Set<string>();
      menge.add(k.dok);
      proArtikel.set(art, menge);
    }
    for (const [art, dok] of proArtikel) {
      const paar = a[art] ?? [0, 0];
      paar[1] = dok.size;
      a[art] = paar;
    }
  }

  if (Object.keys(a).length === 0) return null; // kein Eintrag ⇒ keine Datei (§8)
  // Schlüssel sortiert schreiben, damit die Datei byte-stabil ist (Drift-Tor).
  const sortiert: Record<string, [number, number]> = {};
  for (const art of Object.keys(a).sort()) sortiert[art] = a[art];
  return { erzeugt, erlass: key, a: sortiert };
}

function serialisiere(d: BezuegeZaehlDatei): string {
  return `${JSON.stringify(d)}\n`;
}

function main(): void {
  const pruefen = process.argv.includes('--check');
  // Das Erzeugungsdatum darf die Drift-Prüfung nicht auslösen (sonst wäre das
  // Tor jeden Tag rot, ohne dass sich eine Zahl geändert hätte). Im Prüflauf
  // wird darum das Datum der VORHANDENEN Datei übernommen und nur der Inhalt
  // verglichen — §6.7: das Tor soll die Zahlen bewachen, nicht den Kalender.
  const heute = new Date().toISOString().slice(0, 10);
  const keys = schluessel();
  if (!pruefen) {
    if (existsSync(ZIEL_DIR)) rmSync(ZIEL_DIR, { recursive: true });
    mkdirSync(ZIEL_DIR, { recursive: true });
  }

  const abweichungen: string[] = [];
  let geschrieben = 0;
  let bytes = 0;
  for (const key of keys) {
    const ziel = resolve(ZIEL_DIR, `${key}.json`);
    const vorhanden = existsSync(ziel) ? lies<BezuegeZaehlDatei>(ziel) : null;
    const neu = baueZaehler(key, vorhanden?.erzeugt ?? heute);
    if (!neu) {
      if (pruefen && vorhanden) abweichungen.push(`${key}: Datei da, aber keine Kanten mehr in den Shards`);
      continue;
    }
    if (pruefen) {
      if (!vorhanden) { abweichungen.push(`${key}: Zähl-Datei fehlt`); continue; }
      if (serialisiere(vorhanden) !== serialisiere(neu)) {
        const alt = Object.keys(vorhanden.a).length; const jetzt = Object.keys(neu.a).length;
        abweichungen.push(`${key}: Zahlen abgewichen (${alt} → ${jetzt} Artikel mit Bezügen)`);
      }
      continue;
    }
    const text = serialisiere({ ...neu, erzeugt: heute });
    writeFileSync(ziel, text);
    geschrieben++; bytes += Buffer.byteLength(text);
  }

  if (pruefen) {
    // Dateien, die keine Quelle mehr haben, sind ebenfalls Drift.
    if (existsSync(ZIEL_DIR)) {
      const bekannt = new Set(keys);
      for (const f of readdirSync(ZIEL_DIR)) {
        if (f.endsWith('.json') && !bekannt.has(f.slice(0, -5))) abweichungen.push(`${f}: verwaiste Zähl-Datei`);
      }
    }
    if (abweichungen.length > 0) {
      console.error(`✗ Bezüge-Zähler ROT — ${abweichungen.length} Abweichung(en):`);
      for (const z of abweichungen.slice(0, 20)) console.error(`   ${z}`);
      process.exit(1);
    }
    console.log(`✓ Bezüge-Zähler grün — ${keys.length} Erlasse geprüft, keine Drift.`);
    return;
  }
  console.log(`✓ ${geschrieben} Zähl-Dateien geschrieben (${(bytes / 1024).toFixed(1)} KB gesamt, ø ${(bytes / geschrieben).toFixed(0)} B).`);
}

main();
