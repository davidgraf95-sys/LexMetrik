import { describe, it, expect } from 'vitest';
import { teileSachverhalt, entrauscheSachverhalt } from '../lib/rechtsprechung/sachverhalt';

const W = (s: string) => s.replace(/\s+/g, ' ').trim();
const rekon = (bl: { marke: string | null; text: string }[]) =>
  W(bl.map((b) => (b.marke ? `${b.marke} ` : '') + b.text).join(' '));

describe('entrauscheSachverhalt', () => {
  it('entfernt Kolumnentitel „BGE … S. NN" und „ab Seite NN"', () => {
    expect(entrauscheSachverhalt('ab Seite 93 BGE 152 III 92 S. 93 A.a Text BGE 152 III 92 S. 94 weiter'))
      .toBe('A.a Text weiter');
  });
});

describe('teileSachverhalt — sicheres Sub-Marker-Splitting', () => {
  it('teilt an A.a/A.b/B.a (+ Top-Köpfe A./B.) und behält den Top-Buchstaben im Label', () => {
    const t = 'A. A.a Am 10. März 2023 stellte die A. mbH ein Gesuch. A.b In Prosequierung setzte sie. B. B.a Am 31. Juli 2024 verlangte sie Fortsetzung.';
    const bl = teileSachverhalt(t);
    expect(bl.filter((b) => b.tiefe === 2).map((b) => b.marke)).toEqual(['A.a', 'A.b', 'B.a']);
    expect(bl.filter((b) => b.tiefe === 1).map((b) => b.marke)).toEqual(['A.', 'B.']); // Top-Köpfe (wortinvariant)
    expect(bl.find((b) => b.marke === 'A.a')!.text).toMatch(/^Am 10\. März/);
  });

  it('ist wortinvariant (Marker+Text rekonstruieren den entrauschten Text)', () => {
    const t = 'BGE 150 III 1 S. 2 A. A.a Erstens geschah dies. A.b Zweitens jenes. B. B.a Drittens das.';
    const bl = teileSachverhalt(t);
    expect(rekon(bl)).toBe(W(entrauscheSachverhalt(t)));
  });

  it('splittet NICHT an Firmen-/Parteinamen (A. mbH, B. Pte Ltd, B.A.)', () => {
    // Nur EIN echter Sub-Marker (A.a) → unter der Schwelle → Fallback EIN Block, kein Fehl-Split an „B. Pte Ltd".
    const t = 'A. A.a Die A. mbH und die B. Pte Ltd sowie B.A. sind Parteien.';
    const bl = teileSachverhalt(t);
    expect(bl).toHaveLength(1);
    expect(bl[0].marke).toBeNull();
  });

  it('Sequenz-Gate: Sub muss bei a beginnen und lückenlos sein', () => {
    // „C.c" ohne C.a/C.b wird nicht als Marker akzeptiert.
    const t = 'A.a Erstes. A.b Zweites. C.c Spielt keine Rolle hier weiter.';
    const bl = teileSachverhalt(t);
    expect(bl.filter((b) => b.marke).map((b) => b.marke)).toEqual(['A.a', 'A.b']);
  });

  it('Fallback: ohne ≥2 valide Sub-Marker EIN markenloser Block', () => {
    const bl = teileSachverhalt('Ein durchgehender Sachverhalt ohne Buchstaben-Gliederung.');
    expect(bl).toHaveLength(1);
    expect(bl[0].marke).toBeNull();
  });

  it('leerer Text → leere Block-Liste', () => {
    expect(teileSachverhalt('')).toEqual([]);
  });

  // Top-Marker-Fallback (E): reine A./B./C.-Gliederung ohne Sub-Marker.
  it('gliedert reine Top-Marker A./B./C. (satz-initial, sequenzvalidiert)', () => {
    const t = 'A. Frau A. arbeitete beim Spital B. und stürzte. B. Sie erhob Beschwerde. C. Das Gericht entschied.';
    const bl = teileSachverhalt(t);
    expect(bl.map((b) => b.marke)).toEqual(['A.', 'B.', 'C.']);
    // Namens-Kollision: „Spital B." mitten im Satz darf NICHT trennen.
    expect(bl[0].text).toBe('Frau A. arbeitete beim Spital B. und stürzte.');
    expect(rekon(bl)).toBe(W(t));
  });
  it('Top-Marker: Abkürzung/Initiale („Dr. B.") wird NICHT als Abschnitts-Marker gelesen (Bug-Check 24.6.)', () => {
    // Reale Fehlklasse (151_II_625): „… Dr. B. B. Dagegen …" — die Anwalts-Initiale
    // „Dr. B." darf nicht den Abschnitts-Marker B kapern.
    const t = 'A. Die Klägerin klagte, vertreten durch Rechtsanwältin Dr. B. B. Dagegen wehrte sich die Gegenseite. C. Das Gericht entschied.';
    const bl = teileSachverhalt(t);
    // Kein Block trägt die Namens-Initiale „B." als Marker; lieber unstrukturiert als falsch (§1).
    expect(bl.some((b) => b.marke === 'B.')).toBe(false);
    expect(rekon(bl)).toBe(W(t));
  });
  it('Top-Marker: kein Split bei nur einem Abschnitt (Namen wie „A. mbH"/„Spital B.")', () => {
    const t = 'A. Die A. mbH und die Spital B. AG schlossen einen Vertrag. Es gab keine weiteren Abschnitte.';
    const bl = teileSachverhalt(t);
    expect(bl).toHaveLength(1);
    expect(bl[0].marke).toBeNull();
  });

  // Regression (Bug-Check MAJOR 24.6.): ein satz-schliessender Name am Blockende
  // (z.B. „… im E.") darf NICHT als nachlaufender Top-Marker getilgt werden — nur
  // wenn der Buchstabe dem Top des FOLGENDEN Abschnitts entspricht.
  it('behält einen Schluss-Namen, der nicht zum nächsten Top-Marker passt', () => {
    const t = 'A.a Er war bis 2019 tätig im E. A.b Danach geschah Weiteres. B.a Schliesslich endete es.';
    const bl = teileSachverhalt(t);
    expect(bl.find((b) => b.marke === 'A.a')!.text).toBe('Er war bis 2019 tätig im E.');
  });
  it('trennt einen nachlaufenden Top-Marker nur ab, wenn er zum nächsten Abschnitt passt', () => {
    const t = 'A.a Erstes geschah. B. B.a Zweites geschah danach.';
    const bl = teileSachverhalt(t);
    expect(bl.find((b) => b.marke === 'A.a')!.text).toBe('Erstes geschah.'); // „B." abgetrennt
    expect(bl.some((b) => b.tiefe === 1 && b.marke === 'B.')).toBe(true);    // als Top-Kopf erfasst
    // wortinvariant: „B." bleibt als marke erhalten
    expect(rekon(bl)).toBe(W('A.a Erstes geschah. B. B.a Zweites geschah danach.'));
  });
});
