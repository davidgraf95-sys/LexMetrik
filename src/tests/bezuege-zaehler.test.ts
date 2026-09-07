// ── W2·24-R6c · DIE ZÄHL-DATEI SAGT DASSELBE WIE DIE SHARDS ────────────────
//
// Die Bezüge-Zeile am Artikelkopf (D20 (b)) nennt ihre Zahlen aus einer
// buildseitigen Zähl-Datei je Erlass (`scripts/gen-bezuege-zaehler.ts` →
// `public/verzahnung/bezuege-zaehler/<KEY>.json`), damit sie dastehen, bevor
// irgendein Shard geladen ist, und damit die Rubrik «Materialien» überhaupt
// möglich wird (ihr Shard kommt im Leser sonst nicht vor, §8).
//
// DIE EINE FALLE, die dieser Fall bewacht: die drei beteiligten Orte führen den
// Artikel VERSCHIEDEN — Bezugs-Shard `336c`, Materialien-Shard `15_a`, Leser
// `e.artikel` = `336_c`. Läuft eine der drei Normalisierungen auseinander,
// findet der Leser seine Zahl nicht mehr, und die Zeile behauptet still «keine
// Bezüge» an einem Artikel, der 11 Entscheide führt. Kein Tor hätte das
// gemeldet: die Datei wäre korrekt, der Shard auch, nur das Nachschlagen ginge
// ins Leere.
//
// ROT ZU BEKOMMEN (§6.7): in `scripts/gen-bezuege-zaehler.ts` den Aufruf von
// `normArtikelToken` beim Materialien-Zweig entfernen (Fall 2 reisst) oder die
// Entscheid-Zahl aus `proArtikel` statt aus `gesamtProArtikel` ziehen (Fall 1).
import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { normArtikelToken } from '../lib/rechtsprechung/norm-index';

const wurzel = resolve(fileURLToPath(new URL('../..', import.meta.url)));
const zaehlDatei = (key: string) =>
  JSON.parse(readFileSync(resolve(wurzel, `public/verzahnung/bezuege-zaehler/${key}.json`), 'utf8')) as {
    erlass: string; a: Record<string, [number, number]>;
  };

describe('W2·24-R6c · Bezüge-Zähl-Datei', () => {
  it('Fall 1 — die Entscheid-Zahl ist die ungefilterte Bezugsgrösse des Shards', () => {
    const zaehler = zaehlDatei('OR');
    const shard = JSON.parse(
      readFileSync(resolve(wurzel, 'public/rechtsprechung/bezuege/OR.json'), 'utf8'),
    ) as { gesamtProArtikel: Record<string, Record<string, number>> };

    const eintraege = Object.entries(shard.gesamtProArtikel);
    // Leer-Treffer-Schutz: ohne Shard-Einträge wäre der Fall trivial erfüllt.
    expect(eintraege.length, 'der OR-Shard führt keine Artikel mit Bezügen').toBeGreaterThan(100);

    for (const [rohArt, proStatus] of eintraege) {
      const soll = Object.values(proStatus).reduce((s, v) => s + v, 0);
      if (soll <= 0) continue;
      const ist = zaehler.a[normArtikelToken(rohArt)]?.[0];
      expect(ist, `Art. ${rohArt}: Zähl-Datei sagt ${ist}, Shard sagt ${soll}`).toBe(soll);
    }
  });

  it('Fall 2 — der Artikel-Schlüssel des Lesers findet seine Zahl (Unterstrich-Form)', () => {
    // Genau die Form, die `ArtikelLeser` durchreicht (`e.artikel`), nicht die
    // Shard-Form. Die drei belegten Schreibweisen aus dem Bestand.
    const zaehler = zaehlDatei('OR');
    for (const [leserToken, mindestens] of [['336_c', 1], ['727_a', 1], ['1', 1]] as const) {
      const paar = zaehler.a[normArtikelToken(leserToken)];
      expect(paar, `der Leser-Token «${leserToken}» findet keinen Eintrag — Normalisierung auseinandergelaufen`)
        .toBeDefined();
      expect(paar![0], `Art. ${leserToken}: ${paar![0]} Entscheide`).toBeGreaterThanOrEqual(mindestens);
    }
  });

  it('Fall 3 — Materialien werden je DOKUMENT gezählt, nicht je Fundstelle', () => {
    const pfad = resolve(wurzel, 'public/materialien/kanten/ARG.json');
    expect(existsSync(pfad), 'der ARG-Materialien-Shard fehlt — der Fall misst nichts').toBe(true);
    const shard = JSON.parse(readFileSync(pfad, 'utf8')) as {
      kanten: Array<{ dok?: string; artikel?: string }>;
    };
    const zaehler = zaehlDatei('ARG');
    const proArtikel = new Map<string, Set<string>>();
    for (const k of shard.kanten) {
      if (!k.artikel || !k.dok) continue;
      const art = normArtikelToken(k.artikel);
      proArtikel.set(art, (proArtikel.get(art) ?? new Set()).add(k.dok));
    }
    expect(proArtikel.size, 'keine Materialien-Kanten im ARG').toBeGreaterThan(5);
    for (const [art, dok] of proArtikel) {
      expect(zaehler.a[art]?.[1], `ARG Art. ${art}: ${zaehler.a[art]?.[1]} statt ${dok.size} Materialien`)
        .toBe(dok.size);
    }
  });

  it('Fall 4 — kein Eintrag mit lauter Nullen (§8: keine Rubrik ohne Zahl)', () => {
    for (const key of ['OR', 'ZGB', 'ARG']) {
      const zaehler = zaehlDatei(key);
      for (const [art, paar] of Object.entries(zaehler.a)) {
        expect(paar[0] + paar[1], `${key} Art. ${art}: Eintrag ohne jede Zahl`).toBeGreaterThan(0);
      }
    }
  });
});
