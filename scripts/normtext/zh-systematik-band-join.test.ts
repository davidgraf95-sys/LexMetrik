/**
 * Wächter-Test W2·13-KANTONE-DATEN (Nachtrag 1.9.2026): der ZH-Baum
 * schlüsselt über Ordner-BÄNDER (101–176 …, zh-systematik.ts), der N0b-Join
 * (`sachgebietKantonFuer`, browse-manifest.ts) ursprünglich nur über
 * Nummern-PRÄFIXE — der Band-Zweig (2c) schliesst die Lücke.
 *
 * Befund vor dem Fix (gemessen 1.9.2026): 0/24 ZH-Erlasse trugen
 * `sachgebietKanton`. Dieser Test hält beides deterministisch fest:
 *  (a) den Band-Join selbst (synthetischer Baum — unabhängig davon, wie
 *      viele ZH-Erlasse gerade im Register stehen), BEIDE Bandgrenzen
 *      (`von` UND `bis`) je Ordner — nicht nur die untere;
 *  (b) die Deckung am committeten Register — GENERISCH per Band, nicht per
 *      Liste, und als WERT-Assertion: der frisch aus dem aktuellen
 *      Band-Code berechnete Treffer muss dem committeten `sachgebietKanton`
 *      exakt entsprechen (nicht bloss «ein Feld ist da»). Damit fällt der
 *      Test auch bei einer stillen Band-Verschiebung, die zwar weiterhin
 *      IRGENDein Feld liefert, aber das falsche.
 *
 * Gegenprüfung 1.9.2026 (Auflage B1, mittel — bestanden): die ursprüngliche
 * Fassung dieses Tests prüfte je Ordner nur `von` (nicht `bis`) und im
 * Register nur Anwesenheit (nicht den Wert) — eine Bandverletzung
 * (`bis: 176 → 150` in zh-systematik.ts) blieb dadurch grün. Rot-Beweis der
 * verschärften Fassung: dieselbe Mutation gefahren, beide betroffenen Tests
 * (Band-Schleife UND Register-Wert-Assertion) wurden rot, siehe Commit-Body.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { sachgebietKantonFuer } from './browse-manifest';
import { baueZhSystematik, ZH_ORDNER } from './zh-systematik';

const ZH_BAUM = baueZhSystematik();

describe('sachgebietKantonFuer — ZH-Band-Zweig (2c)', () => {
  it('ordnet die UNTERE UND OBERE Bandgrenze aus jedem der 14 Ordner-Bänder korrekt zu', () => {
    // Je Ordner beide Bandgrenzen prüfen — deckt alle 14 Bänder VOLLSTÄNDIG
    // ab, ohne eine Erlass-Liste zu pflegen (die Regel gilt generisch per
    // Band). Nur `von` zu prüfen liesse eine verkürzte Obergrenze (z.B. ein
    // vertauschtes `<`/`<=` in baueZhSystematik(), oder eine falsch
    // eingetragene Bandgrenze) unentdeckt durch — `bis` schliesst das.
    for (const ordner of ZH_ORDNER) {
      for (const grenze of [ordner.von, ordner.bis] as const) {
        const stamm = `ZH-${grenze}.1`;
        const treffer = sachgebietKantonFuer(ZH_BAUM, 'ZH', stamm);
        const beschreibung = `Ordner ${ordner.nummer} (Band ${ordner.von}–${ordner.bis}), Grenze ${grenze}`;
        expect(treffer?.wurzel.nummer, beschreibung).toBe(ordner.nummer);
        expect(treffer?.wurzel.name, beschreibung).toBe(ordner.name);
      }
    }
  });

  it('ordnet eine Nummer ohne Nachkommastelle (ganze Hauptnummer) zu', () => {
    // '230' steht wörtlich im Snapshot-Bestand (ZH-230.json, Ordner 3).
    expect(sachgebietKantonFuer(ZH_BAUM, 'ZH', 'ZH-230')?.wurzel.nummer).toBe('3');
  });

  it('liefert kein Feld für eine Hauptnummer ausserhalb aller Bänder (§8)', () => {
    // Zwischen Band 5 (410–412) und Band 6 (413) ist keine Lücke, aber
    // z.B. '999' liegt hinter dem letzten Band (861–954) — kein stilles Raten.
    expect(sachgebietKantonFuer(ZH_BAUM, 'ZH', 'ZH-999.1')).toBeUndefined();
  });

  it('bleibt für andere Kantone unberührt (rein additiver Zweig, kanton-scoped)', () => {
    // Derselbe numerische Aufbau, aber kanton='AG' statt 'ZH' darf den
    // ZH-Namensraum ('LS#…') nie greifen — der Zweig ist per Parameter
    // kanton-gescoped, nicht global auf jeden Baum mit 'LS#'-Schlüsseln.
    expect(sachgebietKantonFuer(ZH_BAUM, 'AG', 'AG-131.1')).toBeUndefined();
  });

  it('Register: sachgebietKanton je ZH-Erlass stimmt mit dem frisch berechneten Band-Treffer überein (Wert-Assertion)', () => {
    // WERT-Assertion, nicht nur Anwesenheit (Gegenprüfung B1): für jeden
    // ZH-Eintrag wird der Treffer aus dem AKTUELLEN Band-Code (ZH_BAUM,
    // s.o.) neu berechnet und gegen den COMMITTETEN `sachgebietKanton`-Wert
    // aus register.json verglichen. Eine Band-Verschiebung nach der
    // Register-Generierung — selbst eine, die weiterhin IRGENDein Feld
    // liefert — zeigt sich hier als Wert-Abweichung, nicht als Lücke.
    // Generisch per Band: keine feste ID-Liste, greift daher auch für
    // Erlasse, die eine parallel laufende Tranche noch hinzufügt.
    const reg = JSON.parse(readFileSync('public/normtext/register.json', 'utf8')) as {
      erlasse: { key: string; ebene: string; kanton: string | null; sachgebietKanton?: unknown }[];
    };
    const zh = reg.erlasse.filter((e) => e.ebene === 'kanton' && e.kanton === 'ZH');
    expect(zh.length, 'ZH-Erlasse im Register').toBeGreaterThan(0);
    for (const e of zh) {
      const frisch = sachgebietKantonFuer(ZH_BAUM, 'ZH', e.key);
      expect(frisch, e.key).toEqual(e.sachgebietKanton);
    }
  });
});
