import { describe, it, expect } from 'vitest';
import { bereinigeBesetzungsFreitext } from '../lib/rechtsprechung/besetzung';

// ─── LM-127 / LM-132 · Satzzeichen-Abstand im Besetzungs-Freitext ─────────────
//
// Datenschritt 5.9.2026. Der BS-Extraktor liest `display:none`-Spans bewusst als
// Text mit (belegte Regel, scripts/rechtsprechung/bs-besetzung.ts); sie tragen fast
// immer Whitespace. Steht ein solcher Span unmittelbar vor dem Trenn-Komma, liefert
// `textContent` «… von Aarburg , Dr. T. Fasnacht». Korpusweite Messung 5.9.2026:
// 324 Stellen in 309 BS-Entscheiden, Bund und alle übrigen Kantone 0.
//
// Die Regel wohnt in `bereinigeBesetzungsFreitext` — der EINEN Stelle, durch die
// sowohl der Live-Import (parseBesetzung) als auch der Writer jeden Besetzungs-
// Freitext schickt (§5). Sie berührt nie Volltext, Regeste oder Erwägungen (§7).
describe('bereinigeBesetzungsFreitext · Satzzeichen-Abstand', () => {
  it('LM-132 (UV.2023.8, am Artefakt belegt): kein Leerzeichen vor dem Komma', () => {
    expect(bereinigeBesetzungsFreitext(
      'Dr. A. Pfleiderer (Vorsitz), Dr. med. R. von Aarburg , Dr. T. Fasnacht und Gerichtsschreiberin MLaw N. Marbot',
    )).toBe('Dr. A. Pfleiderer (Vorsitz), Dr. med. R. von Aarburg, Dr. T. Fasnacht und Gerichtsschreiberin MLaw N. Marbot');
  });

  it('LM-127 (BES.2023.172, am Artefakt belegt): mehrere Stellen in einem Freitext', () => {
    expect(bereinigeBesetzungsFreitext(
      'lic. iur. Liselotte Henz (Vorsitz), lic. iur. Lucienne Renaud , Prof. Dr. Daniela Thurnherr Keller , Dr. Andreas Traub',
    )).toBe('lic. iur. Liselotte Henz (Vorsitz), lic. iur. Lucienne Renaud, Prof. Dr. Daniela Thurnherr Keller, Dr. Andreas Traub');
  });

  it('gilt auch für Semikolon, Doppelpunkt und Punkt', () => {
    expect(bereinigeBesetzungsFreitext('Bovey ; Hurni : Kropf .')).toBe('Bovey; Hurni: Kropf.');
  });

  it('setzt genau ein Leerzeichen nach «,» «;» «:»', () => {
    expect(bereinigeBesetzungsFreitext('Kiss,Hohl;Rüedi')).toBe('Kiss, Hohl; Rüedi');
    expect(bereinigeBesetzungsFreitext('Greffière:Mme Kropf')).toBe('Greffière: Mme Kropf');
  });

  it('ABWEICHUNG (§7, offengelegt): nach «.» wird KEIN Leerzeichen erzwungen — '
    + 'Titel-Abkürzungen dürfen nicht zerrissen werden', () => {
    expect(bereinigeBesetzungsFreitext('Dr. iur. a.o. Gerichtsschreiber MLaw Luc Huber, LL.M.'))
      .toBe('Dr. iur. a.o. Gerichtsschreiber MLaw Luc Huber, LL.M.');
  });

  it('idempotent (§2): ein zweiter Lauf ändert nichts', () => {
    const einmal = bereinigeBesetzungsFreitext('A. Pfleiderer , R. von Aarburg');
    expect(bereinigeBesetzungsFreitext(einmal)).toBe(einmal);
  });

  it('lässt einen bereits sauberen Freitext unverändert', () => {
    const s = 'Dr. Stephan Wullschleger, Dr. Claudius Gelzer und Gerichtsschreiberin MLaw Kim Suter';
    expect(bereinigeBesetzungsFreitext(s)).toBe(s);
  });

  // Bestandsverhalten, unverändert (§6): die Aktenzeichen-Regel läuft VOR der neuen
  // Abstands-Regel und schneidet den Satzpunkt mit (`[.,;\s]*` vor dem Dossier-
  // Muster). Der Test hält das fest, damit die Reihenfolge nicht still kippt.
  it('Bestandsregel bleibt: nachlaufendes Aktenzeichen wird weiterhin geschnitten', () => {
    expect(bereinigeBesetzungsFreitext('Greffière: Mme Kropf. 7B_950/2024et'))
      .toBe('Greffière: Mme Kropf');
  });
});
