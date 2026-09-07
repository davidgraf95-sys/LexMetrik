/**
 * Geometrie-Tests der ZH-MARGINALIENSPALTE (`sammleZhRandbloecke`) und des
 * Sidecar-Baus (`baueZhSidecar`) — R1, 2.9.2026.
 *
 * Jeder Fall ist an echten Koordinaten aus den amtlichen PDF erhoben; die
 * Zahlen stehen bei den Fixtures mit Erlass, Seite und y-Position.
 */
import { describe, it, expect } from 'vitest';
import { sammleZhRandbloecke } from '../../scripts/normtext/zh-randspalte.ts';
import { baueZhSidecar } from '../../scripts/normtext/zh-sidecar.ts';
import { TITEL_MARKER } from '../../scripts/normtext/adapter-zh-pdf.ts';

type St = { x: number; y: number; h: number; w: number; s: string };
const body = (y: number, x: number, s: string): St => ({ x, y, h: 9.18, w: s.length * 4, s });
const rand = (y: number, x: number, s: string, w = s.length * 3.4): St => ({ x, y, h: 7.5, w, s });

describe('sammleZhRandbloecke — Spalte und Blockbildung', () => {
  it('hebt den Randtitel der RECHTEN Aussenspalte auf der Grundlinie des Kopfes', () => {
    // ZH-131.1 S. 1: bodyMinX = 53.8; «Gegenstand» x = 337.3, y = 361;
    // «§ 1. Dieses Gesetz …» ebenfalls y = 361.
    const bloecke = sammleZhRandbloecke([
      body(361, 68, '§'), body(361, 75, '1.'), body(361, 96, 'Dieses Gesetz regelt'),
      body(351, 53.8, 'den Finanzhaushalt der politischen Gemeinden.'),
      rand(361, 337.3, 'Gegenstand'),
    ]);
    expect(bloecke).toEqual([{ ankerY: 361, text: 'Gegenstand' }]);
  });

  it('hebt den Randtitel der LINKEN Aussenspalte (gerade Seiten)', () => {
    // ZH-131.1 S. 2: bodyMinX = 87.8; «Gemeinde-» x = 28, y = 448.
    const bloecke = sammleZhRandbloecke([
      body(448, 102, '§'), body(448, 109, '5.'), body(448, 130, 'Gemeindeorgane sind:'),
      rand(448, 28, 'Gemeinde-'),
      rand(440, 28, 'organe'),
    ]);
    expect(bloecke).toEqual([{ ankerY: 448, text: 'Gemeindeorgane' }]);
  });

  it('trennt zwei Randtitel am Abstand ihrer Paragraphen, statt sie zu verkleben', () => {
    // ZH-131.1 S. 1: «Autonomie» y = 324, «Gliederung und/Organisation» y = 274/266.
    const bloecke = sammleZhRandbloecke([
      body(324, 68, '§ 2. Die Gemeinden ordnen ihre Angelegenheiten'),
      body(274, 68, '§ 3. Das Kantonsgebiet gliedert sich'),
      rand(324, 337.3, 'Autonomie'),
      rand(274, 337.3, 'Gliederung und'),
      rand(266, 337.3, 'Organisation'),
    ]);
    expect(bloecke).toEqual([
      { ankerY: 324, text: 'Autonomie' },
      { ankerY: 274, text: 'Gliederung und Organisation' },
    ]);
  });
});

describe('sammleZhRandbloecke — die drei Striche am Zeilenende', () => {
  const umbruch = (a: string, b: string): string =>
    sammleZhRandbloecke([
      body(400, 68, '§ 1. Text'),
      rand(400, 337.3, a),
      rand(392, 337.3, b),
    ])[0].text;

  it('TRENNSTRICH faellt weg (Kleinbuchstabe folgt)', () => {
    // ZH-131.1 § 5.
    expect(umbruch('Gemeinde-', 'organe')).toBe('Gemeindeorgane');
  });

  it('BINDESTRICH bleibt, ohne Leerzeichen (Grossbuchstabe folgt)', () => {
    // ZH-170.4: «Datenschutz-Folgenabschaetzung» — vom Tor check:verklebung
    // als «DatenschutzFolgenabschaetzung» gemeldet, bevor die Regel stand.
    expect(umbruch('Datenschutz-', 'Folgenabschätzung')).toBe('Datenschutz-Folgenabschätzung');
    expect(umbruch('Notar-', 'Stellvertreter')).toBe('Notar-Stellvertreter');
  });

  it('ERGAENZUNGSSTRICH bleibt samt Leerzeichen (Konjunktion folgt)', () => {
    expect(umbruch('Sozial-', 'und Gesundheitswesen')).toBe('Sozial- und Gesundheitswesen');
  });

  it('ohne Strich wird mit Leerzeichen gefuegt', () => {
    expect(umbruch('Zustimmung', 'der Gemeinden')).toBe('Zustimmung der Gemeinden');
  });
});

describe('sammleZhRandbloecke — was NICHT in den Randtitel gehoert', () => {
  it('verwirft den Fussnoten-Verweis IM Randtitel', () => {
    // ZH-175.2 S. 1: «Grundsatz» + hochgestellte «52» in Apparat-Groesse.
    const bloecke = sammleZhRandbloecke([
      body(442, 68, '§ 1. Text'),
      rand(442, 337.3, 'Grundsatz'),
      { x: 372, y: 445, h: 4.6, w: 4, s: '52' },
    ]);
    expect(bloecke).toEqual([{ ankerY: 442, text: 'Grundsatz' }]);
  });

  it('haengt den hochgestellten lat. Suffix an seine Traegerzeile', () => {
    // ZH-232.35 § 7: «Art. 449 a und | 314 a^bis ZGB» — der Suffix steht auf
    // eigener, HOEHERER Grundlinie (y 118 gegen 115) und stand darum vor
    // seiner Zahl («... und bis 314 a ZGB»).
    const bloecke = sammleZhRandbloecke([
      body(147, 102, '§ 7. Die Entschädigung'),
      rand(147, 28, 'Beiständinnen'),
      rand(139, 28, 'und Beistände'),
      rand(131, 28, 'gemäss'),
      rand(123, 28, 'Art. 449 a und'),
      { x: 44, y: 118, h: 4.6, w: 5, s: 'bis' },
      rand(115, 28, '314 a', 16.1),
      rand(115, 52, 'ZGB', 17.1),
    ]);
    expect(bloecke[0].text).toContain('314 abis ZGB');
    expect(bloecke[0].text).not.toContain('und bis 314');
  });

  it('laesst die Body-Hochstellung am rechten Zeilenende in Ruhe (Einheiten-Exponent)', () => {
    // ZH-700.1 § 239a: «1000 m²», die «2» steht bei x = 328.9 (h = 5.70) bei
    // bodyMinX = 53.8 — im Rand-x-Fenster, aber KEINE Marginalie.
    const bloecke = sammleZhRandbloecke([
      body(300, 53.8, 'Grundstücke von mehr als 1000 m'),
      { x: 328.9, y: 302, h: 5.7, w: 3, s: '2' },
    ]);
    expect(bloecke).toEqual([]);
  });
});

describe('baueZhSidecar — Zuordnung und Gliederungsstapel', () => {
  const T = (s: string): string => `${TITEL_MARKER}${s}`;

  it('haengt den Randtitel an den §, auf dessen Zeile er steht', () => {
    const text = ['§ 1. Erster Text', 'Fortsetzung', '§ 2. Zweiter Text'].join('\n');
    const b = baueZhSidecar(
      text,
      [{ zeilenIndex: 0, text: 'Gegenstand' }, { zeilenIndex: 2, text: 'Autonomie' }],
      'paragraf',
    );
    expect(b.artikel['1'].marginalie).toEqual(['Gegenstand']);
    expect(b.artikel['2'].marginalie).toEqual(['Autonomie']);
    expect(b.randnotenOhneKopf).toBe(0);
  });

  it('VERWIRFT einen Randtitel, der auf keiner Kopfzeile sitzt — und zaehlt ihn', () => {
    const text = ['A. Ein Abschnitt', '§ 1. Text'].join('\n');
    const b = baueZhSidecar(text, [{ zeilenIndex: 0, text: 'Verirrt' }], 'paragraf');
    expect(b.artikel['1'].marginalie).toEqual([]);
    expect(b.randnotenOhneKopf).toBe(1);
  });

  it('baut den Gliederungspfad als 1..n und schliesst gleichrangige Stufen', () => {
    const text = [
      '1. Teil: Allgemeine Bestimmungen',
      'A. Betreibungskreise',
      '§ 1. Text',
      'B. Der Notar',
      '§ 2. Text',
      '2. Teil: Besonderes',
      '§ 3. Text',
    ].join('\n');
    const b = baueZhSidecar(text, [], 'paragraf');
    expect(b.artikel['1'].gliederung).toEqual([
      { ebene: 1, label: '1. Teil: Allgemeine Bestimmungen' },
      { ebene: 2, label: 'A. Betreibungskreise' },
    ]);
    // «B.» schliesst «A.», bleibt aber unter dem Teil.
    expect(b.artikel['2'].gliederung).toEqual([
      { ebene: 1, label: '1. Teil: Allgemeine Bestimmungen' },
      { ebene: 2, label: 'B. Der Notar' },
    ]);
    // Ein neuer Teil schliesst die Buchstaben-Stufe.
    expect(b.artikel['3'].gliederung).toEqual([{ ebene: 1, label: '2. Teil: Besonderes' }]);
  });

  it('nimmt die arabische Ueberschrift NUR mit Titelschrift-Marker als Gliederung', () => {
    const mit = baueZhSidecar([T('2. Aufgaben'), '§ 1. Text'].join('\n'), [], 'paragraf');
    expect(mit.artikel['1'].gliederung).toEqual([{ ebene: 1, label: '2. Aufgaben' }]);
    // Wortgleiche Aufzaehlungszeile OHNE Marker ist keine Ueberschrift (§1).
    const ohne = baueZhSidecar(['2. die Schulpflege,', '§ 1. Text'].join('\n'), [], 'paragraf');
    expect(ohne.artikel['1'].gliederung).toEqual([]);
  });

  it('der ERSTE Kopf eines Tokens gewinnt (Nachdruck im Schlussapparat)', () => {
    // ZH-700.1: 33 §§ stehen im Anhang ein zweites Mal, dort MIT Randtitel.
    const text = ['§ 58. Geltender Text', '§ 58. Alte Fassung'].join('\n');
    const b = baueZhSidecar(
      text,
      [{ zeilenIndex: 1, text: '3. Gebäudehöhe' }],
      'paragraf',
    );
    expect(b.artikel['58'].marginalie).toEqual([]);
    expect(b.randnotenDoppelt).toBe(1);
  });

  it('folgt der Zaehlweise des Erlasses (Art. statt §)', () => {
    const b = baueZhSidecar('Art. 1 Der Kanton Zürich', [{ zeilenIndex: 0, text: 'Zweck' }], 'artikel');
    expect(b.artikel['1'].marginalie).toEqual(['Zweck']);
  });
});
