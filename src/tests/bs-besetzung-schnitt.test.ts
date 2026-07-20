import { describe, it, expect } from 'vitest';
import { parseHTML } from 'linkedom';
import { extrahiereBesetzung } from '../../scripts/rechtsprechung/bs-besetzung';

// ─── Schnitt des BS-Besetzungs-Blocks (RISIKOPFAD: Anonymisierung) ──────────────
//
// Geprüft wird die Absatz-Struktur des amtlichen Deckblatts, so wie sie in den
// Rohdokumenten wirklich vorkommt. Die Fixtures unten sind die realen <p>-Folgen
// (Whitespace normalisiert) der genannten Geschäftsnummern — die Fehlerklassen
// stammen alle aus dem Anomalie-Durchgang über die 3765 Rohdokumente (20.7.2026).

const doc = (absaetze: string[]): Document =>
  parseHTML(`<html><body>${absaetze.map((t) => `<p>${t}</p>`).join('')}</body></html>`)
    .document as unknown as Document;

const schnitt = (absaetze: string[]) => extrahiereBesetzung(doc(absaetze));

describe('Absatzgrenze als Segment-Trenner (ZS.2025.2)', () => {
  it('trennt zwei Namensgruppen aus zwei <p> mit Komma', () => {
    const r = schnitt([
      'Mitwirkende',
      'lic. iur. Marc Oser (Vorsitz)',
      'Dr. iur. Manuel Kreis, Dr. Katharina Zimmermann',
      'und a.o. Gerichtsschreiberin MLaw Lorena Christ',
      'Parteien',
    ]);
    expect(r.quelle).toBe('mitwirkende');
    // Entscheidend: nach «(Vorsitz)» steht ein Trenner, nicht bloss ein Leerzeichen.
    expect(r.text).toBe(
      'lic. iur. Marc Oser (Vorsitz), Dr. iur. Manuel Kreis, Dr. Katharina Zimmermann '
      + 'und a.o. Gerichtsschreiberin MLaw Lorena Christ',
    );
  });
});

describe('offene Naht: der Absatz endet mitten im Namen (ZB.2023.4)', () => {
  it('setzt KEIN Komma nach einem offenen Titel', () => {
    const r = schnitt([
      'Mitwirkende',
      'lic. iur. André Equey (Vorsitz), Prof. Dr. Ramon Mabillard, Ass.-Prof. Dr.',
      'Cordula Lötscher und Gerichtsschreiberin Dr. Noémi Biro',
      'Parteien',
    ]);
    // «Ass.-Prof. Dr.» + «Cordula Lötscher» ist EINE Person — ein Komma an dieser
    // Naht erzeugte den Phantom-Richter «Dr.» und zerriss den Namen.
    expect(r.text).toContain('Ass.-Prof. Dr. Cordula Lötscher');
    expect(r.text).not.toContain('Dr., Cordula');
  });

  it('setzt KEIN Komma nach einer abschliessenden Konjunktion (VD.2021.251)', () => {
    const r = schnitt([
      'Mitwirkende',
      'Dr. Stephan Wullschleger und',
      'Gerichtsschreiberin MLaw Anja Fankhauser',
      'Beteiligte',
    ]);
    expect(r.text).toBe('Dr. Stephan Wullschleger und Gerichtsschreiberin MLaw Anja Fankhauser');
  });
});

describe('Deckblatt-Labels beenden den Block (Anonymisierungs-Grenze)', () => {
  it('bricht bei «Privatklägerschaft» ab (SB.2021.88)', () => {
    const r = schnitt([
      'Mitwirkende',
      'lic. iur. Eva Christ, Dr. Annatina Wirz, lic. iur. Mia Fuchs',
      'und Gerichtsschreiberin lic. iur. Barbara Grange',
      'Privatklägerschaft',
      'A____, vertreten durch B____',
    ]);
    expect(r.text).not.toMatch(/Privatkl/i);
    expect(r.text).not.toMatch(/_/);
  });

  it('bricht bei «Beteiligter» ab (DGS.2022.16)', () => {
    const r = schnitt([
      'Mitwirkende',
      'lic. iur. Christian Hoenen',
      'und a.o. Gerichtsschreiberin BLaw Laura Wigger',
      'Beteiligter',
      'C____',
    ]);
    expect(r.text).toBe('lic. iur. Christian Hoenen und a.o. Gerichtsschreiberin BLaw Laura Wigger');
  });
});

describe('harte Anonymisierungs-Bremse', () => {
  it('nimmt niemals einen ____-Absatz auf, auch ohne Label davor', () => {
    const r = schnitt([
      'Mitwirkende',
      'Dr. Stephan Wullschleger',
      'D____, Beschwerdeführer',
      'Gegenstand',
    ]);
    expect(r.text).toBe('Dr. Stephan Wullschleger');
    expect(r.text).not.toMatch(/_/);
  });

  it('liefert ehrlich null, wenn kein Block existiert (§8)', () => {
    const r = schnitt(['Gegenstand', 'Irgendein Fliesstext ohne Rubrum.']);
    expect(r.text).toBeNull();
    expect(r.quelle).toBe('keine');
  });
});
