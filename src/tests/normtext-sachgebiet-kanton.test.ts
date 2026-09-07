/**
 * N0b — Join Snapshot-key → amtlicher kantonaler Systematik-Baum.
 *
 * Die Eigenschaft, die hier hängt, ist PRÄFIX-TREUE: die zurückgegebene
 * Gliederungsstufe muss ein echter Präfix der Systematik-Nummer sein. Ein Join,
 * der irgendeinen plausiblen Knoten liefert, ist schlimmer als keiner — er sieht
 * im UI genauso amtlich aus (§7/§8).
 *
 * Die Fälle unten sind keine erfundenen Fixtures: sie stehen so im committeten
 * Korpus (public/normtext/kanton-systematik.json) und wurden am 31.8.2026 gegen
 * ihn belegt.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { sachgebietKantonFuer } from '../../scripts/normtext/browse-manifest';

const BAEUME = JSON.parse(
  readFileSync('public/normtext/kanton-systematik.json', 'utf8'),
) as Record<string, Parameters<typeof sachgebietKantonFuer>[0] & object>;

describe('sachgebietKantonFuer — kantonale Systematik-Einordnung', () => {
  it('trifft die zweistellige Unterstufe über den längsten Präfix', () => {
    // '291.150' steht nicht im Index, '29' schon → Advokatur/Notariat.
    expect(sachgebietKantonFuer(BAEUME.AG, 'AG', 'AG-291.150')).toEqual({
      wurzel: { nummer: '2', name: 'Zivilrecht – Strafrecht – Rechtspflege' },
      unter: { nummer: '29', name: 'Advokatur – Notariat' },
    });
  });

  it('kürzt eine Nummer mit Nachkommastelle auf die Ganzzahl-Hierarchie', () => {
    // AR-146.1: weder '146.1' noch '1461' stehen im Index; '146' → ['1','14'].
    const t = sachgebietKantonFuer(BAEUME.AR, 'AR', 'AR-146.1');
    expect(t?.wurzel.nummer).toBe('1');
    expect(t?.unter?.nummer).toBe('14');
  });

  it('löst das Sprach-Suffix zweisprachiger Keys ab', () => {
    const de = sachgebietKantonFuer(BAEUME.FR, 'FR', 'FR-130.11-de');
    const fr = sachgebietKantonFuer(BAEUME.FR, 'FR', 'FR-130.11-fr');
    expect(de?.unter?.nummer).toBe('13');
    expect(fr).toEqual(de);          // dieselbe Sache, zwei Sprachfassungen
  });

  it('ordnet Gemeinde-Teilsammlungen unter ihre eigene Wurzel, nicht unter die kantonale', () => {
    // DER FEHLGRIFF, DEN DIESER TEST VERHINDERT: '786.100' würde über den
    // Ziffern-Pfad die KANTONALE Wurzel 7 ziehen. Der Erlass gehört aber der
    // Einwohnergemeinde Bettingen — 'BeE' ist eine eigene Wurzel.
    const t = sachgebietKantonFuer(BAEUME.BS, 'BS', 'BS-BeE 786.100');
    expect(t?.wurzel.nummer).toBe('BeE');
    expect(t?.unter?.nummer).toBe('BeE 7');
  });

  it('gibt kein Feld zurück, wo die Systematik nicht ziffernhierarchisch ist', () => {
    // Glarus ordnet römisch. Ein Ziffern-Filter ergäbe '1' bzw. '71' und damit
    // eine falsche Wurzel — lieber keine Angabe (§8).
    expect(sachgebietKantonFuer(BAEUME.GL, 'GL', 'GL-III-C.1')).toBeUndefined();
    expect(sachgebietKantonFuer(BAEUME.GL, 'GL', 'GL-III%20B%2F7%2F1')).toBeUndefined();
  });

  it('gibt kein Feld zurück, wo für den Kanton kein Baum erhoben ist', () => {
    // Beispiel-Kanton ohne erhobenen Baum. Fachliche Aenderung 1.9.2026
    // (deklariert, §6.3): urspruenglich stand hier ZH — die ZH-Kern-Tranche
    // liefert den ZH-Baum (zh-systematik.ts), womit die Test-Praemisse
    // falsifiziert war. GE hat weiterhin keinen Baum (K-13 offen); die
    // Aussage des Tests («kein Baum ⇒ kein Feld») bleibt unveraendert.
    expect(BAEUME.GE).toBeUndefined();
    expect(sachgebietKantonFuer(BAEUME.GE, 'GE', 'GE-rsg_e1_05p10')).toBeUndefined();
  });

  it('weist Luzern ab, dessen Index Ordinalzahlen statt Systematik-Nummern führt', () => {
    // Der Fehlgriff, den (2b) verhindert: 'LU-258' kürzt auf '2', und LU.index['2']
    // ist ['Band 1','E'] — ein Pfad, der mit 258 nichts zu tun hat.
    expect(BAEUME.LU.index['2']).toEqual(['Band 1', 'E']);
    expect(sachgebietKantonFuer(BAEUME.LU, 'LU', 'LU-258')).toBeUndefined();
    expect(sachgebietKantonFuer(BAEUME.LU, 'LU', 'LU-645')).toBeUndefined();
  });

  it('übernimmt den gekürzten Treffer, wo der Pfad zum Schlüssel passt', () => {
    // Gegenstück zum LU-Fall: 'FR-8428' kürzt auf '842' → ['8','84']; beide
    // Stufen sind Präfixe von '842', die Zuordnung ist also stimmig.
    expect(BAEUME.FR.index['842']).toEqual(['8', '84']);
    expect(sachgebietKantonFuer(BAEUME.FR, 'FR', 'FR-8428')?.unter?.nummer).toBe('84');
  });

  it('jede Stufe im ganzen Korpus ist zum Schlüssel konsistent', () => {
    const reg = JSON.parse(readFileSync('public/normtext/register.json', 'utf8')) as {
      erlasse: { key: string; ebene: string; kanton: string | null;
        sachgebietKanton?: { wurzel: { nummer: string }; unter?: { nummer: string } } }[];
    };
    const verstoss: string[] = [];
    for (const e of reg.erlasse) {
      if (e.ebene !== 'kanton' || !e.sachgebietKanton) continue;
      const kt = e.kanton ?? '';
      const nummer = decodeURIComponent(e.key.slice(kt.length + 1))
        .replace(/-(?:de|fr|it|rm)$/, '').trim();
      const { wurzel, unter } = e.sachgebietKanton;
      const baum = BAEUME[kt] as unknown as {
        roots: { nummer: string; name: string; kinder?: { nummer: string; name: string }[] }[];
      };
      // Die Stufe muss im Baum des Kantons EXISTIEREN und dort so heissen.
      const root = baum.roots.find((r) => r.nummer === wurzel.nummer);
      if (!root) { verstoss.push(`${e.key}: Wurzel ${wurzel.nummer} nicht im Baum`); continue; }
      if (unter && !root.kinder?.some((k) => k.nummer === unter.nummer)) {
        verstoss.push(`${e.key}: Unter ${unter.nummer} nicht unter ${wurzel.nummer}`);
      }
      // Und die Einordnung muss in der Nummer VERANKERT sein: mindestens eine
      // der beiden Stufen steht vorne darin.
      //
      // Warum nicht beide — die Bänder-Kantone. Appenzell I.Rh. nummeriert seine
      // Wurzeln in Hunderterbändern ('100 Staat - Volk - Behörden') und hängt
      // '177' darunter: die Wurzel ist dann kein Präfix, die Unterstufe schon.
      // Uri führt umgekehrt '1' mit Unterstufe '1.1' zur Nummer '11'. Beide sind
      // amtliche Direkt-Treffer aus dem Index; eine Regel, die sie als Verstoss
      // führte, hätte nur diesen Test falsch gemacht, nicht die Daten.
      // Was hier trotzdem hängen bleibt, ist der Fall ohne JEDEN Bezug — LU.
      const gemeinde = /^[A-Za-z]/.test(wurzel.nummer);
      // Fachliche Aenderung 1.9.2026 (deklariert, §6.3): Band-Kanton-Ausnahme.
      // ZH ordnet nicht ueber Ziffern-PRAEFIXE, sondern ueber 14 Ordner-BAENDER
      // (Nummernband '101'-'176' -> Ordner '1', s. zh-systematik.ts) — die
      // Ordner-Nummer ('1'..'14') ist eine amtliche ORDINALZAHL, kein Praefix
      // der LS-Hauptnummer ('211.1' beginnt nicht mit '3'). Die Praefix-Treue,
      // die dieser Test sonst durchsetzt, ist fuer Band-Kantone kein Fehlgriff-
      // Indikator (anders als bei LU, dessen Index echte Ordinalzahlen OHNE
      // jeden Bezug zur Nummer fuehrt — das bleibt oben ueber (2b) unbesetzt,
      // s. 'weist Luzern ab …'). Fuer ZH ist die Zuordnung amtlich belegt
      // (24/24, kanton-systematik.json aus der server-gerenderten Ordner-
      // Tabelle) — die Konsistenz wird stattdessen von den ZH-eigenen
      // Wächter-Tests (scripts/normtext/zh-systematik-band-join.test.ts)
      // gehalten, die den Band-Index direkt pruefen. Bewusst NUR fuer 'ZH':
      // fuer jeden anderen Praefix-Kanton (BS, AR, FR, …) bleibt die Praefix-
      // Pruefung unveraendert scharf.
      const zhBand = kt === 'ZH';
      const verankert = gemeinde || zhBand
        || nummer.startsWith(wurzel.nummer)
        || (!!unter && nummer.startsWith(unter.nummer));
      if (!verankert) {
        verstoss.push(`${e.key}: weder ${wurzel.nummer} noch ${unter?.nummer ?? '—'} in ${nummer}`);
      }
    }
    expect(verstoss).toEqual([]);
  });
});
