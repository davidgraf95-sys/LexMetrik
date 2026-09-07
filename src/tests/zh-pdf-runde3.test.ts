/**
 * Parser- und Geometrie-Tests zur ZH-Fix-Runde 3 — je ein Test pro Befundklasse
 * der DRITTEN adversarialen Gegenprüfung (31.8.2026), gegen ECHTE pdfjs-Stücke
 * amtlicher ZH-Seiten (Koordinaten und Schriftkennungen unverändert).
 *
 * Der Kern ist die BEIDSEITIGKEIT: der neue Diskriminator (Titel-Schrift) darf
 * die Überschrift verwerfen UND muss die wortgleiche Aufzählungszeile behalten.
 * Ein Test, der nur die eine Richtung prüft, würde einen Wächter durchwinken,
 * der Normtext löscht (§1).
 */
import { describe, it, expect } from 'vitest';
import {
  montiereZhSeite,
  serialisiereZhZeilen,
  extrahiereAlleZhParagraphen,
  bestimmeBodySchrift,
  TITEL_MARKER,
} from '../../scripts/normtext/adapter-zh-pdf.ts';
import {
  ZH_2151_SEITE5,
  ZH_1311_SEITE2,
  ZH_230_SEITE3,
  type ZhStueckFixture,
} from './fixtures/zh-pdf-seiten-stuecke-runde3.ts';

const textbasis = (stuecke: ZhStueckFixture[]): string =>
  serialisiereZhZeilen(montiereZhSeite(stuecke, bestimmeBodySchrift(stuecke)));

describe('GP3a-1 — arabisch nummerierte Gliederungstitel (Titel-Schrift)', () => {
  it('ZH-215.1 S. 5: «1. Organisation»/«2. Aufgaben» tragen den Titel-Marker', () => {
    const zeilen = textbasis(ZH_2151_SEITE5).split('\n');
    expect(zeilen).toContain(`${TITEL_MARKER}1. Organisation`);
    expect(zeilen).toContain(`${TITEL_MARKER}2. Aufgaben`);
  });

  it('ZH-215.1 S. 5: die Titel landen NICHT mehr im Normtext (vorher: § 17/§ 20)', () => {
    const artikel = extrahiereAlleZhParagraphen(textbasis(ZH_2151_SEITE5));
    const alleTexte = Object.values(artikel)
      .flatMap((a) => a.bloecke)
      .flatMap((b) => [b.text, ...(b.items ?? []).map((i) => i.text)]);
    // Vorher stand «… Anwaltes fest. 1. Organisation» im letzten Block von § 17.
    expect(alleTexte.some((t) => /1\. Organisation/.test(t))).toBe(false);
    expect(alleTexte.some((t) => /2\. Aufgaben/.test(t))).toBe(false);
    // …und der Wortlaut davor ist unversehrt geblieben (kein Kollateralschaden).
    expect(
      alleTexte.some((t) =>
        /drei vom Obergericht und zwei von der Anwaltschaft gewählte Mitglieder mit\.$/.test(t),
      ),
    ).toBe(true);
  });

  it('GEGENPROBE ZH-131.1 S. 2: wortgleiche Aufzählungszeilen bleiben Normtext', () => {
    const zeilen = textbasis(ZH_1311_SEITE2).split('\n');
    // Dieselbe Textgestalt «Zahl. Text» — aber Body-Schrift, also KEIN Marker.
    expect(zeilen).toContain('1. der Gemeindevorstand,');
    expect(zeilen.some((z) => z.startsWith(TITEL_MARKER) && /der Gemeindevorstand/.test(z))).toBe(false);

    const artikel = extrahiereAlleZhParagraphen(textbasis(ZH_1311_SEITE2));
    const items = Object.values(artikel)
      .flatMap((a) => a.bloecke)
      .flatMap((b) => b.items ?? []);
    // Sie überleben — als Aufzählungspunkte, nicht als gelöschte Zeilen.
    expect(items.map((i) => i.text)).toContain('der Gemeindevorstand,');
    expect(items.map((i) => i.text)).toContain('die Schulpflege,');
  });

  it('bestimmeBodySchrift wählt die Schrift mit den meisten Body-Zeichen', () => {
    // Die Schriftkennung ist dokument-lokal; in der Fixture (eine Seite je
    // pdfjs-Lauf) heisst die Body-Schrift `g_d0_f1` bzw. `g_d1_f1`, die
    // Titel-Schrift `g_d0_f2`/`g_d2_f2`. Massgeblich ist die Trennung, nicht der Name.
    expect(bestimmeBodySchrift(ZH_2151_SEITE5)).toBe('g_d0_f1');
    expect(bestimmeBodySchrift(ZH_1311_SEITE2)).toBe('g_d1_f1');
    // Ohne Schriftangaben bleibt der Diskriminator AUS (Rückwärtskompatibilität).
    expect(bestimmeBodySchrift([{ x: 1, y: 1, h: 9.18, w: 1, s: 'abc' }])).toBeUndefined();
  });

  it('ohne Body-Schrift verhält sich die Montage wie vor Fix-Runde 3', () => {
    const ohne = serialisiereZhZeilen(montiereZhSeite(ZH_2151_SEITE5)).split('\n');
    // Kein Marker, also auch keine Tilgung — der alte (undichte) Zustand.
    expect(ohne.some((z) => z.startsWith(TITEL_MARKER))).toBe(false);
    expect(ohne).toContain('1. Organisation');
  });
});

describe('GP3b — Ziffern-Aufzählung wird zu items', () => {
  const artikel = extrahiereAlleZhParagraphen(textbasis(ZH_230_SEITE3));

  it('ZH-230 § 34 Abs. 1: acht Ziffern als items statt als Prosa', () => {
    const abs1 = artikel['34']?.bloecke[0];
    expect(abs1).toBeDefined();
    expect(abs1!.text).toBe('Der Gemeindevorstand ist die zuständige Behörde:');
    expect(abs1!.items?.map((i) => i.marke)).toEqual(['1', '2', '3', '4', '5', '6', '7', '8']);
  });

  it('aufgehobene Ziffern werden Platzhalter, nicht «1. 2. 3. 4.»-Prosa', () => {
    const abs1 = artikel['34']!.bloecke[0];
    expect(abs1.items!.slice(0, 4).map((i) => i.text)).toEqual([
      'Aufgehoben',
      'Aufgehoben',
      'Aufgehoben',
      'Aufgehoben',
    ]);
    expect(abs1.items![7].text).toBe('Aufgehoben');
    expect(abs1.text).not.toMatch(/1\. 2\. 3\./);
  });

  it('Ziffern mit Wortlaut behalten ihn vollständig', () => {
    const abs1 = artikel['34']!.bloecke[0];
    expect(abs1.items![5].text).toBe(
      'für Begehren von Amtes wegen um Verschollenerklärung (Art. 550 ZGB),',
    );
  });

  it('GEGENPROBE: eine Datums-Zeile am Zeilenanfang wird KEIN item', () => {
    // «23. Juni 1831 werden aufgehoben.» ist eine umbrochene Fliesstext-Zeile
    // (ZH-175.2 S. 26), keine Aufzählungsmarke. Zwei Wächter greifen: die Folge
    // (23 ≠ 1) und der Monatsname.
    const kunst = ['§ 9. Die Gesetze vom', '23. Juni 1831 werden aufgehoben.'].join('\n');
    const a = extrahiereAlleZhParagraphen(kunst);
    expect(a['9'].bloecke[0].items).toBeUndefined();
    expect(a['9'].bloecke[0].text).toBe('Die Gesetze vom 23. Juni 1831 werden aufgehoben.');
  });

  it('GEGENPROBE: «1. Januar 2020» eröffnet keine Aufzählung (Datums-Wächter)', () => {
    const kunst = ['§ 9. In Kraft seit dem', '1. Januar 2020 in der Fassung von 2019.'].join('\n');
    const a = extrahiereAlleZhParagraphen(kunst);
    expect(a['9'].bloecke[0].items).toBeUndefined();
  });
});
