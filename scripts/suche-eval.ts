// ─── Suchgüte-Eval-Harness (advisory, LLM-frei, deterministisch) ─────────────
//
//   npm run eval:suche
//
// Misst die RANKING-GÜTE der ECHTEN Produkt-Suche gegen ein committetes,
// zweifach verifiziertes Gold-Set (scripts/suche-eval-gold.json). KEIN
// Parallel-Index, KEINE zweite Suchlogik (§5): der Harness ruft exakt die
// Produktions-Funktionen auf, die auch der Such-Hook (useUniversalSuche)
// verwendet — Norm-Sprung-Parser (normQuery), BGE-Sprung-Parser (bgeQuery),
// Artikel-Volltextsuche (baueSuchFn = FlexSearch-Recall + artikelRanking) sowie
// die reinen Aggregator-Gruppen (gesetzGruppe/artikelGruppe/entscheidGruppe) —
// und assembliert sie in der GLEICHEN Anzeige-Reihenfolge wie der Hook
// (Sprung → Gesetze → Gesetzestext → Rechtsprechung).
//
// Deterministisch (§2): kein LLM, kein Netz, kein Date.now(). Der Bund-Index wird
// FRISCH aus den gepinnten Snapshots gebaut (baueBundIndex) — nicht aus der
// committeten, potenziell veralteten such-index/artikel-bund.json (die m/n/g-
// Ranking-Felder fehlen dort), exakt wie im Gate-Test rankingTestset.test.ts.
//
// Herkunft/Methodik: LLM-freier Retrieval-Eval (Recall@k / MRR / NDCG@10) nach
// dem Muster gängiger Legal-IR-Benchmarks; Blaupause Omnilex-AI-Starter
// (Apache-2.0) — NUR Methodik übernommen, KEIN Code-Copy. Attribution:
// bibliothek/werkzeuge/omnilex-ai-und-kaggle-legal-ir-2026-07-16.md.
//
// ADVISORY: KEIN Gate, KEIN CI-Einbau — ein internes, read-only Mess-Werkzeug.
// Exit-Code ist immer 0 (auch bei schwachen Zahlen); es blockiert nichts.
//
// GEMESSENER KANAL (bewusst): der Rang eines Ziels wird IM Produkt-Kanal
// gemessen, der seinen Inhaltstyp trägt — Norm-Sprung ⧺ Gesetzestext für
// Artikel, BGE-Sprung ⧺ Rechtsprechung für Entscheide, Norm-Sprung ⧺ Gesetze
// für Erlasse. Die gruppen-ÜBERGREIFENDE Reihenfolge (Gesetzestext vor
// Rechtsprechung usw.) ist eine separate UI-/Relevanz-Frage (A6/§13) und wird
// hier NICHT mit der Ranking-Güte des einzelnen Kanals vermischt. Die späteren
// Gruppen (Materialien/Katalog/Presets/Online-Edge) tragen keine Artikel-/
// Entscheid-/Erlass-Ziele und stehen in der Anzeige HINTER den gemessenen
// Kanälen — sie können den gemessenen Rang folglich nicht verändern und werden
// weggelassen.

import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as flex from 'flexsearch';
import { baueBundIndex } from './such-index-generieren';
import { baueSuchFn } from '../src/lib/suche/artikelVolltext';
import { baueNormIndex, parseNormQuery, type NormErlass } from '../src/lib/suche/normQuery';
import { baueBgeIndex, parseBgeSprung } from '../src/lib/suche/bgeQuery';
import {
  sprungGruppe, bgeSprungGruppe, gesetzGruppe, artikelGruppe, entscheidGruppe,
  type SuchGruppe, type SuchTreffer,
} from '../src/lib/universalSuche';

// FlexSearch in der von der Lib gelieferten Form (kein passender ESM-Typ),
// exakt wie im Gate-Test aufgelöst.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const FlexSearch: any = (flex as unknown as { default?: unknown }).default ?? flex;

const wurzel = resolve(dirname(fileURLToPath(import.meta.url)), '..');

// Grosszügiges Fenster, damit der Kanal innerhalb des @10-Messfensters nie
// künstlich abgeschnitten wird (die /suche-Vollseite S5 zeigt ebenfalls
// grosszügig, nicht das 6er-Dropdown-Limit).
const ARTIKEL_LIMIT = 50;
const KAPPUNG = 50;

// ── Gold-Set ─────────────────────────────────────────────────────────────────

type ZielTyp = 'artikel' | 'entscheid' | 'erlass';
interface GoldPaar { query: string; sprache: string; zielTyp: ZielTyp; zielId: string; beleg: string }
interface GoldKlasse { klasse: string; beschreibung: string; pairs: GoldPaar[] }
interface GoldSet { klassen: GoldKlasse[] }

function ladeGold(): GoldSet {
  const roh = readFileSync(resolve(wurzel, 'scripts/suche-eval-gold.json'), 'utf8');
  return JSON.parse(roh) as GoldSet;
}

// ── Ziel → kanonischer Treffer-Href (SSoT: exakt die Href-Bildung der Produktion) ──
//
//   artikel  'OR#art_336_c' → /gesetze/bund/OR#art-336_c
//            (artikelVolltext.treffer + normQuery.bauHref bilden beide diese Form)
//   entscheid 'bge_147_III_121' → /rechtsprechung/bge_147_III_121
//   erlass   'OR' → /gesetze/bund/OR
function zielHref(p: GoldPaar): string {
  if (p.zielTyp === 'artikel') {
    const [key, anker] = p.zielId.split('#');
    const token = anker.replace(/^art_/, '');
    return `/gesetze/bund/${encodeURIComponent(key)}#art-${token}`;
  }
  if (p.zielTyp === 'entscheid') {
    return `/rechtsprechung/${encodeURIComponent(p.zielId)}`;
  }
  // erlass — die Gold-Erlasse sind alle Bund (register.json).
  return `/gesetze/bund/${encodeURIComponent(p.zielId)}`;
}

// Kandidaten-Prädikat je Inhaltstyp: welche Treffer-Hrefs bilden den Kanal, in
// dem der Rang gemessen wird (Artikel-Deep-Links ≠ Erlass-Links ≠ Entscheide).
function istKandidat(typ: ZielTyp, href: string): boolean {
  if (typ === 'artikel') return /^\/gesetze\/(?:bund|kanton)\/[^#]+#art-/.test(href);
  if (typ === 'entscheid') return href.startsWith('/rechtsprechung/');
  return /^\/gesetze\/(?:bund|kanton)\/[^#?]+$/.test(href); // erlass = ohne #-Anker
}

// ── Produkt-Suche assemblieren (identische Reihenfolge wie useUniversalSuche) ──

interface SuchKontext {
  artikelSuche: (q: string, limit?: number) => SuchTreffer[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  erlasse: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  entscheide: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  normIndex: any;
  bgeIndex: Map<string, string>;
}

/** Baut die zusammengeführte Treffer-Liste in Anzeige-Reihenfolge:
 *  Sprung (Norm ODER BGE) → Gesetze → Gesetzestext → Rechtsprechung.
 *  Nur die produktiven Funktionen (§5), keine Neu-Implementierung. */
function assembliere(q: string, k: SuchKontext): SuchTreffer[] {
  const direkt = parseNormQuery(q, k.normIndex);
  const bge = parseBgeSprung(q, k.bgeIndex);
  const sprung = sprungGruppe(direkt) ?? bgeSprungGruppe(bge);
  const gruppen: SuchGruppe[] = [
    ...(sprung ? [sprung] : []),
    gesetzGruppe(k.erlasse, q, KAPPUNG),
    artikelGruppe(k.artikelSuche(q, ARTIKEL_LIMIT), KAPPUNG, q),
    entscheidGruppe(k.entscheide, q, KAPPUNG),
  ];
  return gruppen.flatMap((g) => g.treffer);
}

/** 0-basierter Rang des Ziels im zugehörigen Kanal (dedupliziert, erste
 *  Fundstelle zählt = der beste Rang, den der Nutzer beim Scannen sieht),
 *  oder -1, wenn der Kanal das Ziel nicht enthält. */
function messeRang(p: GoldPaar, k: SuchKontext): number {
  const treffer = assembliere(p.query, k);
  const ziel = zielHref(p);
  const gesehen = new Set<string>();
  const kanal: string[] = [];
  for (const t of treffer) {
    if (!istKandidat(p.zielTyp, t.href)) continue;
    if (gesehen.has(t.href)) continue;
    gesehen.add(t.href);
    kanal.push(t.href);
  }
  return kanal.indexOf(ziel);
}

// ── Metriken (deterministisch) ───────────────────────────────────────────────

interface Metrik { n: number; r1: number; r5: number; r10: number; mrr: number; ndcg10: number }

function metriken(raenge: number[]): Metrik {
  const n = raenge.length || 1;
  const recall = (kk: number) => raenge.filter((r) => r >= 0 && r < kk).length / n;
  const mrr = raenge.reduce((s, r) => s + (r >= 0 ? 1 / (r + 1) : 0), 0) / n;
  const ndcg10 = raenge.reduce((s, r) => s + (r >= 0 && r < 10 ? 1 / Math.log2(r + 2) : 0), 0) / n;
  return { n: raenge.length, r1: recall(1), r5: recall(5), r10: recall(10), mrr, ndcg10 };
}

function f(x: number): string { return x.toFixed(3); }

// ── Lauf ─────────────────────────────────────────────────────────────────────

function main(): void {
  const t0 = Date.now();
  const gold = ladeGold();

  // Produktions-Pipeline instanziieren (FRISCHER Index wie im Gate-Test).
  const eintraege = baueBundIndex().eintraege;
  const artikelSuche = baueSuchFn(eintraege as never, FlexSearch);
  const erlasse = JSON.parse(readFileSync(resolve(wurzel, 'public/normtext/register.json'), 'utf8')).erlasse as unknown[];
  const entscheide = JSON.parse(readFileSync(resolve(wurzel, 'public/rechtsprechung/register.json'), 'utf8')).entscheide as unknown[];
  const normIndex = baueNormIndex(erlasse as NormErlass[]);
  const bgeIndex = baueBgeIndex(entscheide as { bgeReferenz: string | null; key: string }[]);
  const kontext: SuchKontext = { artikelSuche, erlasse, entscheide, normIndex, bgeIndex };

  const kopf = new Date(t0).toISOString().slice(0, 10);
  const zeilen: string[] = [];
  zeilen.push(`# Suchgüte-Eval — Baseline ${kopf}`);
  zeilen.push('');
  zeilen.push(`Korpus: ${eintraege.length} Bund-Artikel · ${erlasse.length} Erlasse · ${entscheide.length} Entscheide.`);
  zeilen.push(`Fenster: Artikel-Limit ${ARTIKEL_LIMIT}, Kappung ${KAPPUNG} je Gruppe. Advisory (kein Gate).`);
  zeilen.push('');
  zeilen.push('| Klasse | n | Recall@1 | Recall@5 | Recall@10 | MRR | NDCG@10 |');
  zeilen.push('| --- | --: | --: | --: | --: | --: | --: |');

  const alle: number[] = [];
  const schwaechen: string[] = [];

  for (const klasse of gold.klassen) {
    const raenge = klasse.pairs.map((p) => {
      const r = messeRang(p, kontext);
      alle.push(r);
      // Auffällige Schwäche: nicht in Top-5 (Rang ≥ 5 oder gar nicht gefunden).
      if (r < 0 || r >= 5) {
        schwaechen.push(`- [${klasse.klasse}] «${p.query}» → ${p.zielId}: ${r < 0 ? 'nicht gefunden' : `Rang ${r + 1}`}`);
      }
      return r;
    });
    const m = metriken(raenge);
    zeilen.push(`| ${klasse.klasse} | ${m.n} | ${f(m.r1)} | ${f(m.r5)} | ${f(m.r10)} | ${f(m.mrr)} | ${f(m.ndcg10)} |`);
  }

  const g = metriken(alle);
  zeilen.push(`| **gesamt** | ${g.n} | ${f(g.r1)} | ${f(g.r5)} | ${f(g.r10)} | ${f(g.mrr)} | ${f(g.ndcg10)} |`);
  zeilen.push('');
  zeilen.push(`## Auffällige Schwächen (Rang ≥ 5 oder nicht gefunden) — ${schwaechen.length}`);
  zeilen.push('');
  zeilen.push(schwaechen.length ? schwaechen.join('\n') : '- keine (alle Ziele in den Top-5).');
  zeilen.push('');
  zeilen.push(`_Laufzeit ${(Date.now() - t0) / 1000} s · deterministisch, LLM-frei, read-only._`);

  // Kompletter Markdown-Block nach stdout (Quelle der Baseline-Notiz).
  console.log(zeilen.join('\n'));
}

main();
