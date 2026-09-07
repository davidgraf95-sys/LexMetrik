/**
 * Geometrie-Tests zur ZH-Fix-Runde 4 (Befund B1 der VIERTEN adversarialen
 * Gegenprüfung, 31.8.2026): Einheiten-Exponenten («m²») bleiben im Text, statt
 * mit den Fussnoten-Hochzahlen verworfen zu werden — gegen die ECHTEN
 * pdfjs-Stücke der drei belegten Stellen in ZH-700.1 (Koordinaten, Breiten und
 * Höhen unverändert aus dem byte-verifizierten Roh-PDF-Cache gedumpt).
 *
 * BEIDSEITIG (wie Runde 3): die Regel muss die 3 Exponenten BEHALTEN und die
 * geometrisch nächstliegenden Fussnoten-Verweise weiter VERWERFEN — die
 * Erhebung fand 28 direkt angeklebte Hochzahlen 2/3, davon 25 Fussnoten nach
 * Wörtern/Abkürzungen («249 StG²», «139 GOG³»). Ein Test nur der einen
 * Richtung winkte einen Wächter durch, der Fussnoten in den Normtext zieht.
 */
import { describe, it, expect } from 'vitest';
import {
  montiereZhSeite,
  serialisiereZhZeilen,
} from '../../scripts/normtext/adapter-zh-pdf.ts';
import { einheitenExponentenInZeile } from '../../scripts/normtext/zh-zweitlesung.ts';
import { exponentTokens } from '../../scripts/normtext/zh-tor-regeln.ts';

interface St {
  x: number;
  y: number;
  h: number;
  s: string;
  w: number;
}

// ── Echtes Zeilen-Material (pdfjs-Dump, ZH-700.1, 31.8.2026) ─────────────────

/** S. 70, § 303 Abs. 1: «… beträgt 10 | m | ²(hoch) | . | ²⁷(Fussnote)». Der
 *  Exponent steht VOR dem Satzpunkt, die Fussnoten-Hochzahl DANACH — beide in
 *  derselben Zeile (die GP4-Geometrie-Signatur). */
const S70_PARAGRAF_303: St[] = [
  { x: 87.8, y: 460.4, h: 9.18, w: 257.1, s: 'milienhäusern und bei vergleichbaren Wohnungsarten, beträgt 10' },
  { x: 347.2, y: 460.4, h: 9.18, w: 7.6, s: 'm' },
  { x: 354.8, y: 463.2, h: 5.7, w: 2.9, s: '2' },
  { x: 357.7, y: 460.4, h: 9.18, w: 2.3, s: '.' },
  { x: 360.0, y: 463.2, h: 5.7, w: 5.7, s: '27' },
];

/** S. 55, § 239a Abs. 3: Absatz-Hochzahl «3» links UND Exponent «2» rechts in
 *  derselben Hochstellungs-Zeile; der Exponent bei x = 328.9 lag jenseits der
 *  alten Marginalien-Kante (bodyMinX 53.8 + 250) und fiel VOR der Zuordnung weg. */
const S55_PARAGRAF_239A: St[] = [
  { x: 53.8, y: 279.0, h: 9.18, w: 164.6, s: 'schen mit Behinderungen anpassbar sein.' },
  { x: 68.0, y: 269.6, h: 5.7, w: 2.9, s: '3' },
  { x: 73.1, y: 266.8, h: 9.18, w: 255.8, s: 'Gebäude mit mehr als 50 Arbeitsplätzen oder mit mehr als 1000 m' },
  { x: 328.9, y: 269.6, h: 5.7, w: 2.9, s: '2' },
  { x: 53.8, y: 256.6, h: 9.18, w: 274.8, s: 'Geschossfläche, die einer arbeitsplatzintensiven Nutzung dient, müs' },
  { x: 328.6, y: 256.6, h: 9.18, w: 3.1, s: '-' },
];

/** S. 62, § 260 Abs. 4: Exponent MITTEN im Satz («2 m² überlagern») — nach dem
 *  Exponenten muss die Wort-Lücke zum Folgewort erhalten bleiben. */
const S62_PARAGRAF_260: St[] = [
  { x: 102.1, y: 394.2, h: 5.7, w: 2.9, s: '4' },
  { x: 107.2, y: 391.4, h: 9.18, w: 258.5, s: 'Gebäude, deren Gesamthöhe nicht mehr als 1,5 m beträgt und die' },
  { x: 87.8, y: 381.2, h: 9.18, w: 142.9, s: 'eine Bodenfläche von höchstens 2 m' },
  { x: 230.6, y: 384.0, h: 5.7, w: 2.9, s: '2' },
  { x: 235.7, y: 381.2, h: 9.18, w: 130.1, s: 'überlagern, müssen keine Grenz-' },
  { x: 87.8, y: 371.0, h: 9.18, w: 132.0, s: 'und Gebäudeabstände einhalten.' },
];

/** GEGENPROBE — Fussnoten-Verweise, geometrisch identisch angeklebt (Lücke
 *  ≈ 0), aber nach Abkürzung/Wort statt nach Zahl + Einheit. Koordinaten nach
 *  dem Muster der Erhebung (ZH-0594… S. 2 «249 StG²», ZH-2625… S. 6
 *  «139 GOG³»): x(hoch) = Fragmentende + gemessene Lücke. */
const GEGENPROBE_FUSSNOTEN: St[] = [
  { x: 87.8, y: 469.0, h: 9.18, w: 200.0, s: 'die Vorschriften von § 249 StG' },
  { x: 287.81, y: 471.8, h: 5.7, w: 2.9, s: '2' },
  { x: 87.8, y: 441.0, h: 9.18, w: 180.0, s: 'gemäss § 139 GOG' },
  { x: 267.77, y: 443.8, h: 5.7, w: 2.9, s: '3' },
];

const zeilenTexte = (stuecke: St[]): string[] =>
  serialisiereZhZeilen(montiereZhSeite(stuecke)).split('\n');

describe('B1 — Einheiten-Exponent bleibt im Text (Adapter, echtes Material)', () => {
  it('§ 303: «beträgt 10 m².» — Exponent vor dem Punkt, Fussnote ²⁷ verworfen', () => {
    const zeilen = zeilenTexte(S70_PARAGRAF_303);
    expect(zeilen).toContain(
      'milienhäusern und bei vergleichbaren Wohnungsarten, beträgt 10 m².',
    );
    // Die Fussnoten-Hochzahl hinter dem Punkt darf NICHT auftauchen.
    expect(zeilen.join('\n')).not.toMatch(/27/);
  });

  it('§ 239a: «1000 m² Geschossfläche» — Exponent jenseits der alten Marginalien-Kante', () => {
    const zeilen = zeilenTexte(S55_PARAGRAF_239A);
    expect(zeilen).toContain(
      'Gebäude mit mehr als 50 Arbeitsplätzen oder mit mehr als 1000 m²',
    );
    // Die Absatz-Hochzahl «3» derselben Hochstellungs-Zeile bleibt als
    // führender Marker erhalten (¶3 auf eigener Marker-Zeile, Runde-2-Recovery).
    expect(zeilen.some((z) => z.startsWith('¶3'))).toBe(true);
  });

  it('§ 260: «2 m² überlagern» — Exponent mitten im Satz, Wort-Lücke danach erhalten', () => {
    const zeilen = zeilenTexte(S62_PARAGRAF_260);
    expect(zeilen).toContain(
      'eine Bodenfläche von höchstens 2 m² überlagern, müssen keine Grenz-',
    );
  });

  it('GEGENPROBE: angeklebte Hochzahlen nach Abkürzungen bleiben Fussnoten (verworfen)', () => {
    const alles = zeilenTexte(GEGENPROBE_FUSSNOTEN).join('\n');
    expect(alles).toContain('die Vorschriften von § 249 StG');
    expect(alles).toContain('gemäss § 139 GOG');
    expect(alles).not.toContain('²');
    expect(alles).not.toContain('³');
    expect(alles).not.toContain('StG2');
    expect(alles).not.toContain('GOG3');
  });
});

describe('B1 — Zweitlesung erhebt den Exponenten unabhängig (Fragment-Ordnung)', () => {
  const xSortiert = (stuecke: St[], yVon: number, yBis: number): St[] =>
    stuecke.filter((s) => s.y >= yVon && s.y <= yBis).sort((a, b) => a.x - b.x);

  it('§ 303 (Standalone-Einheit «m» als eigenes Fragment): m2 erkannt', () => {
    expect(einheitenExponentenInZeile(xSortiert(S70_PARAGRAF_303, 460, 464))).toEqual(['m2']);
  });

  it('§ 239a («… 1000 m» in EINEM Fragment): m2 erkannt', () => {
    expect(einheitenExponentenInZeile(xSortiert(S55_PARAGRAF_239A, 266, 270))).toEqual(['m2']);
  });

  it('§ 260 (Exponent mitten im Satz): m2 erkannt', () => {
    expect(einheitenExponentenInZeile(xSortiert(S62_PARAGRAF_260, 381, 384))).toEqual(['m2']);
  });

  it('GEGENPROBE: Fussnoten nach Abkürzungen liefern KEINEN Exponenten', () => {
    expect(einheitenExponentenInZeile(xSortiert(GEGENPROBE_FUSSNOTEN, 469, 472))).toEqual([]);
    expect(einheitenExponentenInZeile(xSortiert(GEGENPROBE_FUSSNOTEN, 441, 444))).toEqual([]);
  });
});

describe('B1 — Tor-Regel exponentTokens (Snapshot-Seite der Prüfung 9)', () => {
  it('liest m²/m³ aus Blocktext, items und Tabellenzellen als Vergleichs-Token', () => {
    expect(
      exponentTokens([
        { text: 'beträgt 10 m².' },
        { text: 'ohne Exponent 10 m.' },
        { items: [{ marke: 'a', text: 'mindestens 3,0 m³' }] },
        { mehrspaltig: { zeilen: [['550 cm²', 'Fr. 20']] } },
      ]),
    ).toEqual(['m2', 'm3', 'cm2']);
  });

  it('ROT-Fall: dem verstümmelten Snapshot («10 m.») fehlt das Token des PDF', () => {
    // Genau die Mutations-Klasse, die Prüfung 9 fangen muss: PDF-Seite [m2],
    // Snapshot-Seite [] — der Vergleich im Tor wird rot (Beweis am echten
    // Snapshot: 3 Befunde §239a/§260/§303 vor der Regeneration, 31.8.2026).
    expect(exponentTokens([{ text: 'beträgt 10 m.' }])).toEqual([]);
  });
});
