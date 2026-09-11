// scripts/entstehung/synopse-entwurf.ts
// E6 «Entwurf ↔ Beschluss» (FAHRPLAN-MATERIALIEN-VERZAHNUNG §11.4/§11.7): REINER Teil —
// BBl-HTML → `man-art-mod`-Blöcke, Label-Join, Diff, kanonische Serialisierung.
// Kein Fetch, kein Schreiben, kein Date.now (§2); der Netz-Teil liegt in
// `synopse-entwurf-run.ts`.
import { reinerText, normalisiere, sha256 } from './synopse.ts';
import type { EntwurfShard, EntwurfArtikel } from '../../src/lib/entstehung/synopse-entwurf.ts';

/** Verfahrens-Code des bundesrätlichen Erlassentwurfs (`type-projet/2`). */
export const CODE_ENTWURF = 2;
/** Verfahrens-Code des Schlussabstimmungstexts (`type-projet/300`). */
export const CODE_BESCHLUSS = 300;

/** Ein Änderungsblock eines BBl-Erlasstexts. */
export interface ModBlock {
  /** `id` des Blocks («mod_u7») — Fundstelle, NIE Join-Schlüssel (R3: 17 % Fehlzuordnung). */
  id: string;
  /** Amtliches Label aus der Überschrift, verbatim. */
  label: string;
  /** Wortlaut des Blocks ohne Überschrift. */
  text: string;
}

const MOD_RE = /<article\b[^>]*\bclass="[^"]*man-art-mod[^"]*"[^>]*\bid="(mod_u\d+)"[^>]*>([\s\S]*?)<\/article>/g;
const H_RE = /<h[1-6]\b[^>]*>([\s\S]*?)<\/h[1-6]>/;

/**
 * REIN: BBl-HTML → `man-art-mod`-Blöcke in Dokument-Reihenfolge. Blöcke ohne Überschrift
 * (und damit ohne Label) fallen weg: ohne Label gibt es keinen belegbaren Join, und die
 * `id` ist als Schlüssel bewiesenermassen untauglich.
 */
export function extrahiereModBloecke(html: string): ModBlock[] {
  const out: ModBlock[] = [];
  MOD_RE.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = MOD_RE.exec(html)) !== null) {
    const inner = m[2];
    const h = H_RE.exec(inner);
    if (!h) continue;
    const label = reinerText(h[1]);
    if (!label) continue;
    out.push({ id: m[1], label, text: reinerText(inner.replace(H_RE, '')) });
  }
  return out;
}

/**
 * Join-Schlüssel: das vollständige Label, normalisiert und kleingeschrieben.
 * Kleinschreibung ist hier zulässig (und nur hier): sie entscheidet über die ZUORDNUNG,
 * nie über «geändert ja/nein» — dort bleibt die Gross-/Kleinschreibung massgeblich.
 */
export function joinSchluessel(label: string): string {
  return normalisiere(label).toLowerCase();
}

/** Ergebnis des Label-Joins zweier BBl-Erlasstexte. */
export interface EntwurfDiff {
  artikel: EntwurfArtikel[];
  nurBeschluss: string[];
  unveraendert: number;
  /** Labels, die im selben Dokument MEHRFACH vorkommen — nicht eindeutig joinbar (§1). */
  mehrdeutig: string[];
  /** Blöcke ohne eigenen Wortlaut: reine Struktur-Anweisungen des Erlasstexts
   *  («Gliederungstitel nach Art. 10», «Einfügen vor dem 3. Abschnitt»). Sie tragen
   *  nur eine Überschrift; es gibt nichts zu vergleichen — gelistet, nicht gespeichert. */
  ohneWortlaut: string[];
}

/**
 * REIN: Entwurf gegen Beschluss. Mehrdeutige Labels (dasselbe Label zweimal im selben
 * Dokument, Mantel-Anteil) werden NICHT gejoint, sondern gemeldet — ein falscher Treffer
 * behauptete am Artikel «so stand es im Entwurf» über einen fremden Text (§1).
 */
export function diffEntwurfBeschluss(entwurf: ModBlock[], beschluss: ModBlock[]): EntwurfDiff {
  const zaehle = (bl: ModBlock[]): Map<string, number> => {
    const c = new Map<string, number>();
    for (const b of bl) { const k = joinSchluessel(b.label); c.set(k, (c.get(k) ?? 0) + 1); }
    return c;
  };
  const cE = zaehle(entwurf);
  const cB = zaehle(beschluss);
  const mehrdeutig = [...new Set([...cE, ...cB].filter(([, n]) => n > 1).map(([k]) => k))].sort();
  const mehrdeutigSet = new Set(mehrdeutig);
  const nachB = new Map<string, ModBlock>();
  for (const b of beschluss) {
    const k = joinSchluessel(b.label);
    if (!mehrdeutigSet.has(k)) nachB.set(k, b);
  }
  const artikel: EntwurfArtikel[] = [];
  const getroffen = new Set<string>();
  const ohneWortlaut: string[] = [];
  let unveraendert = 0;
  for (const e of entwurf) {
    const k = joinSchluessel(e.label);
    if (mehrdeutigSet.has(k)) continue;
    // Struktur-Anweisung ohne eigenen Wortlaut (gemessen 11.9.2026: 3 von 258 Blöcken).
    if (e.text.trim() === '') { ohneWortlaut.push(e.label); continue; }
    const b = nachB.get(k);
    if (!b) {
      artikel.push(bau(e, k, 'nur_entwurf'));
      continue;
    }
    getroffen.add(k);
    if (normalisiere(e.text) === normalisiere(b.text)) { unveraendert += 1; continue; }
    artikel.push(bau(e, k, 'geaendert'));
  }
  const nurBeschluss = beschluss
    .map((b) => joinSchluessel(b.label))
    .filter((k) => !mehrdeutigSet.has(k) && !getroffen.has(k) && !cE.has(k))
    .sort();
  artikel.sort((a, b) => (a.schluessel < b.schluessel ? -1 : a.schluessel > b.schluessel ? 1 : 0));
  return {
    artikel, nurBeschluss: [...new Set(nurBeschluss)], unveraendert, mehrdeutig,
    ohneWortlaut: ohneWortlaut.sort(),
  };
}

function bau(e: ModBlock, schluessel: string, art: EntwurfArtikel['art']): EntwurfArtikel {
  return {
    schluessel,
    label: e.label,
    id: e.id,
    art,
    entwurf: e.text,
    shaNorm: sha256(normalisiere(e.text)),
  };
}

/** Live-Link auf ein BBl-Dokument (§7c) — für Menschen, nie zum Parsen. */
export function bblLiveUrl(fgaKurz: string): string {
  return `https://www.fedlex.admin.ch/eli/${fgaKurz}/de`;
}

/** Kanonische Serialisierung (kompakt, wie die Synopse-Shards — Begründung dort). */
export function serialisiereEntwurfShard(s: EntwurfShard): string {
  return `${JSON.stringify(s)}\n`;
}

/** sha256 über den serialisierten Shard — Determinismus-Wächter (§11.6 (5)). */
export function shaEntwurfShard(s: EntwurfShard): string {
  return sha256(serialisiereEntwurfShard(s));
}
