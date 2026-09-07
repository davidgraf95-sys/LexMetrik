// ─── D5 (W2·24-DESIGN-IDENTITAET) · «Prüfen & Download» prüft ────────────────
//
// BEFUND (Funktions-Inventar W2·24, D5, 6./7.9.2026): Der letzte Wizard-Schritt
// heisst «Prüfen & Download», prüfte aber nichts — er kannte nur die Fehler des
// GERADE sichtbaren Schritts (`fehler`-Prop). Was in den Eingabe-Schritten
// offen geblieben war, sagte dort niemand, und ein Feld trug im ganzen
// Vorlagen-Wizard nie `aria-invalid`.
//
// NACHGEMESSEN am 7.9.2026 (Reproduktion VOR dem Bau, `.scratch/d5-probe.mjs`
// gegen die Basis 32ac046e5, dev-Server @4415): auf
// `/vorlagen/schlichtungsgesuch-bs` im Schritt «Prüfen & Download» mit leerem
// Formular `{alerts: 1, invalid: 0, befund: 0, pdfDeaktiviert: true}` — die eine
// Meldung war die HANDGESCHRIEBENE Mängelliste genau dieser einen Seite. Der
// Teil des Inventar-Befunds, der «0 × role=alert» und ein trotzdem erzeugtes PDF
// nennt, hat sich dort NICHT reproduziert; `abnahme/design-identitaet/
// D5-VORLAGEN.md` hält beide Messungen nebeneinander (ein Beleg wird ergänzt,
// nie nachgeführt). Reproduziert hat sich der Rest — und der ist der Bau-Anlass:
// die Sammel-Auskunft existierte genau EINMAL, als Kopie auf einer von 30
// Flächen; die übrigen 29 hatten sie nicht (§10).
//
// Rot-Probe der Wächter: `abnahme/design-identitaet/D5-VORLAGEN.md`.
import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { LocaleProvider } from '../components/locale';
import { VorlagenWizardRahmen } from '../components/vorlagen/wizard';
import { Field } from '../components/vorlagen/ui';
import { sammleBefunde, befundZahl } from '../components/vorlagen/seiteHelfer';
import { alleTsx, liesOhneKommentare, rel } from './appDateien';

const SCHRITTE = [
  { id: 'a', label: 'Parteien' },
  { id: 'b', label: 'Forderung' },
  { id: 'pruefen', label: 'Prüfen & Download' },
] as const;

const LUECKEN: Record<number, string[]> = {
  0: ['Eigenen Namen angeben.', 'Eigene Adresse angeben.'],
  1: ['Forderungsbetrag in CHF angeben.'],
};

const rahmen = (schritt: number, fehlerJeSchritt?: (i: number) => string[]) =>
  renderToString(
    <MemoryRouter>
      <LocaleProvider>
        <VorlagenWizardRahmen
          overline="Test · Vorlage" titel="Testvorlage" intro="Intro" norms={[]} badge="Zu unterzeichnen"
          schritte={SCHRITTE} schritt={schritt} setSchritt={() => {}}
          fehlerJeSchritt={fehlerJeSchritt}
          inhalt={<p>Inhalt</p>} vorschau={<p>Vorschau</p>} />
      </LocaleProvider>
    </MemoryRouter>,
  );

describe('D5 — der Prüfen-Schritt prüft', () => {
  it('sammelt die Lücken ALLER Schritte, nicht nur des sichtbaren', () => {
    const b = sammleBefunde(SCHRITTE, (i) => LUECKEN[i] ?? []);
    expect(b.map((x) => x.index)).toEqual([0, 1]);
    expect(b[0].label).toBe('Parteien');
    expect(befundZahl(b)).toBe(3);
  });

  it('leere Pflichtangaben ⇒ role=alert mit Zahl und Sprung je Schritt', () => {
    const out = rahmen(2, (i) => LUECKEN[i] ?? []);
    expect(out).toContain('data-pruefbefund="offen"');
    expect(out).toContain('role="alert"');
    expect(out).toContain('lc-notice-danger');
    // Die ZAHL wird genannt, nicht nur «es fehlt etwas».
    expect(out).toMatch(/Es fehlen[\s\S]{0,120}>3</);
    // Sprungliste: jeder unvollständige Schritt mit Nummer UND Beschriftung.
    expect(out).toContain('Parteien');
    expect(out).toContain('Forderung');
    expect(out).toContain('Eigenen Namen angeben.');
    // §8: der Ausweg wird benannt statt verschwiegen (kein Blockieren).
    expect(out).toContain('________');
  });

  it('alles ausgefüllt ⇒ positive Quittung, KEIN Alarm', () => {
    const out = rahmen(2, () => []);
    expect(out).toContain('data-pruefbefund="vollstaendig"');
    expect(out).toContain('Alle Pflichtangaben');
    expect(out).not.toContain('data-pruefbefund="offen"');
    expect(out).not.toContain('role="alert"');
  });

  it('in einem EINGABE-Schritt schweigt der Befund (Grundsatz David 14.6.2026)', () => {
    expect(rahmen(0, (i) => LUECKEN[i] ?? [])).not.toContain('data-pruefbefund');
  });

  it('ohne fehlerJeSchritt bleibt der Rahmen wie vor D5 (§6)', () => {
    expect(rahmen(2)).not.toContain('data-pruefbefund');
  });
});

describe('D5 — Feld-Rückmeldung', () => {
  it('Field mit `fehlt` setzt aria-invalid am nativen Control und beschreibt es', () => {
    const out = renderToString(<Field label="Ort" fehlt="Ort angeben."><input /></Field>);
    expect(out).toContain('aria-invalid="true"');
    const treffer = out.match(/aria-describedby="([^"]+)"/);
    expect(treffer, 'aria-describedby fehlt').toBeTruthy();
    expect(out).toContain(`id="${treffer![1]}"`);
    expect(out).toContain('Ort angeben.');
  });

  it('ohne `fehlt` ist das Feld unverändert (kein aria-invalid auf Vorrat)', () => {
    expect(renderToString(<Field label="Ort"><input /></Field>)).not.toContain('aria-invalid');
  });
});

// ─── Struktur-Wächter (§6.7): der Rahmen darf nicht still leer laufen ────────
//
// `fehlerJeSchritt` ist optional — genau das ist die Falle: eine neue
// Vorlagen-Fläche könnte sie weglassen, und ihr «Prüfen»-Schritt fiele
// stillschweigend in den Vor-D5-Zustand zurück (dieselbe Fehlerklasse wie die
// Liste, die wachsen DARF — R3-α-WURZEL, 31.8.2026). Darum: WER den Rahmen
// rendert, führt die Prop — mit genau einer begründeten Ausnahme.
const AUSNAHMEN = new Map<string, string>([
  // Die AG-Gründung ist kein Brief-Wizard: ihr letzter Schritt heisst
  // «Checkliste & Dokumente» und zeigt die HRegV-Checkliste samt Gates einer
  // ganzen Dokumentmappe. Dort gibt es keine schrittweisen Pflichtfelder, die
  // ein Sammel-Befund bündeln könnte.
  ['pages/VorlageAgGruendung.tsx', 'Dokumentmappe statt Prüfen-Schritt'],
]);

describe('D5 — jede Wizard-Fläche führt fehlerJeSchritt', () => {
  it('keine Fläche rendert VorlagenWizardRahmen ohne die Prop', () => {
    const ohne: string[] = [];
    for (const datei of alleTsx()) {
      const pfad = rel(datei);
      const quelle = liesOhneKommentare(datei);
      if (!quelle.includes('<VorlagenWizardRahmen')) continue;
      if (quelle.includes('fehlerJeSchritt=')) continue;
      if (AUSNAHMEN.has(pfad)) continue;
      ohne.push(pfad);
    }
    expect(ohne, `Ohne \`fehlerJeSchritt\` — der Prüfen-Schritt prüft dort nichts:\n${ohne.join('\n')}`).toEqual([]);
  });

  it('jede Ausnahme ist noch eine (sonst: Eintrag streichen)', () => {
    for (const pfad of AUSNAHMEN.keys()) {
      const treffer = alleTsx().find((d) => rel(d) === pfad);
      expect(treffer, `Ausnahme zeigt ins Leere: ${pfad}`).toBeTruthy();
      expect(liesOhneKommentare(treffer!)).toContain('<VorlagenWizardRahmen');
    }
  });
});
