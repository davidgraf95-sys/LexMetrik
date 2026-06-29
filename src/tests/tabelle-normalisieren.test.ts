/**
 * M10 — Tabellen-Normalisierung (kanonisches spalten-Modell T-B1).
 *
 * Fixtures aus ECHTEM Filestore-HTML (verifiziert 30.6.2026): GebV SchKG
 * art_16/19/20/30/37/45/48, AHVV art_21. Jeder Fall ist load-bearing:
 *  - Staffel-Verdichtung 5/1 trotz Kopf-colspan 3/3 (Art. 20, K3-Leitfall)
 *  - Staffel mit Kopf-colspan 4/2 + Trailing-Spacer (Art. 48)
 *  - Staffel mit Text-Wert (Art. 19 „5 Promille …")
 *  - Zwei-Zeilen-Kopf-Merge, der die verlorene Caption „Beitragssatz …" rettet (AHVV 21)
 *  - ehrlicher Fallback: ragged (Art. 37) · lone „bis" (DBG-Stil) · Prosa
 *  - Werttreue: alle amtlichen Token byte-identisch im Output (T-F7)
 */
import { describe, it, expect } from 'vitest';
import { normalisiereTabelle, istStaffelSpanne, type RohTabelle } from '../../scripts/normtext/tabelle-normalisieren.ts';

const NBSP = ' ';
const c = (text: string, colspan = 1) => ({ text, colspan });

// ── Leitfall Art. 20 (Kopf 2×colspan=3, Daten 6 nackte <td>, Spacer col2) ──────
const ART_20: RohTabelle = {
  kopfZeilen: [[c('Forderung/Franken', 3), c('Gebühr/Franken', 3)]],
  datenZeilen: [
    [c(''), c(''), c(''), c('bis'), c('100'), c('10.–')],
    [c('über'), c('100'), c(''), c('bis'), c('500'), c('25.–')],
    [c('über'), c('500'), c(''), c('bis'), c(`1${NBSP}000`), c('45.–')],
    [c('über'), c(`1${NBSP}000`), c(''), c('bis'), c(`10${NBSP}000`), c('65.–')],
    [c('über'), c(`10${NBSP}000`), c(''), c('bis'), c(`100${NBSP}000`), c('90.–')],
    [c('über'), c(`100${NBSP}000`), c(''), c('bis'), c(`1${NBSP}000${NBSP}000`), c('190.–')],
    [c('über'), c(`1${NBSP}000${NBSP}000`), c(''), c(''), c(''), c('400.–')],
  ],
};

describe('normalisiereTabelle — Staffel-Leitfall Art. 20 (K3: Kopf 3/3 → Soll 5/1)', () => {
  const t = normalisiereTabelle(ART_20)!;
  it('verdichtet auf genau 2 rechteckige Spalten', () => {
    expect(t).not.toBeNull();
    expect(t.spalten.map((s) => s.titel)).toEqual(['Forderung/Franken', 'Gebühr/Franken']);
    expect(t.spalten.map((s) => s.typ)).toEqual(['bereich', 'betrag']);
    expect(t.zeilen.every((z) => z.length === 2)).toBe(true);
  });
  it('verdichtet die Spanne wortlauttreu zu EINER bereich-Zelle', () => {
    expect(t.zeilen[0]).toEqual(['bis 100', '10.–']);
    expect(t.zeilen[1]).toEqual(['über 100 bis 500', '25.–']);
    expect(t.zeilen[6]).toEqual([`über 1${NBSP}000${NBSP}000`, '400.–']);
  });
  it('Werttreue: alle amtlichen Beträge/Schwellen byte-identisch vorhanden (T-F7)', () => {
    const flat = t.zeilen.flat().join('|');
    for (const tok of ['100', '500', `1${NBSP}000${NBSP}000`, '10.–', '25.–', '400.–']) {
      expect(flat).toContain(tok);
    }
  });
});

// ── Art. 48: Kopf colspan 4/2, Trailing-Spacer in der Gebühr-Gruppe ────────────
describe('normalisiereTabelle — Art. 48 (Kopf 4/2, Gebühr-Wert vor Trailing-Spacer)', () => {
  const ART_48: RohTabelle = {
    kopfZeilen: [[c('Streitwert/Franken', 4), c('Gebühr/Franken', 2)]],
    datenZeilen: [
      [c(''), c(''), c('bis'), c(`1${NBSP}000`), c('40–150'), c('')],
      [c('über'), c(`1${NBSP}000`), c('bis'), c(`10${NBSP}000`), c('50–300'), c('')],
      [c('über'), c(`10${NBSP}000`), c('bis'), c(`100${NBSP}000`), c('60–500'), c('')],
    ],
  };
  const t = normalisiereTabelle(ART_48)!;
  it('verdichtet auf 2 Spalten, Gebühr-Wert NICHT in die Spanne gezogen', () => {
    expect(t.spalten.map((s) => s.titel)).toEqual(['Streitwert/Franken', 'Gebühr/Franken']);
    expect(t.zeilen[0]).toEqual(['bis 1 000', '40–150']);
    expect(t.zeilen[1]).toEqual([`über 1${NBSP}000 bis 10${NBSP}000`, '50–300']);
  });
});

// ── Art. 19: Staffel mit Text-Wert (kein reiner Betrag) ───────────────────────
describe('normalisiereTabelle — Art. 19 (Text-Wert „5 Promille …")', () => {
  const ART_19: RohTabelle = {
    kopfZeilen: [[c('Summe/Franken', 3), c('Gebühr/Franken')]],
    datenZeilen: [
      [c('bis'), c('1000'), c(''), c('5.–')],
      [c('über'), c('1000'), c(''), c('5 Promille, jedoch höchstens 500.–')],
    ],
  };
  const t = normalisiereTabelle(ART_19)!;
  it('Spanne verdichtet, Text-Wert unverändert', () => {
    expect(t.zeilen[0]).toEqual(['bis 1000', '5.–']);
    expect(t.zeilen[1]).toEqual(['über 1000', '5 Promille, jedoch höchstens 500.–']);
    expect(t.spalten[1].typ).toBe('text'); // gemischte Wertspalte → links
  });
});

// ── AHVV Art. 21: Zwei-Zeilen-Kopf-Merge rettet verlorene Caption ─────────────
describe('normalisiereTabelle — AHVV 21 (Zwei-Kopfzeilen, T-A5 rettet „Beitragssatz …")', () => {
  const AHVV_21: RohTabelle = {
    kopfZeilen: [
      [c('Jährliches Erwerbseinkommen in Franken', 2), c(''), c('Beitragssatz in Prozent des Erwerbseinkommens')],
      [c('von mindestens'), c('aber weniger als', 2), c('')],
    ],
    datenZeilen: [
      [c(`10${NBSP}100`), c(`17${NBSP}600`, 2), c('4,35')],
      [c(`17${NBSP}600`), c(`23${NBSP}000`, 2), c('4,45')],
    ],
  };
  const t = normalisiereTabelle(AHVV_21)!;
  it('mergt beide Kopfzeilen, streicht Spacer, behält 3 Spalten', () => {
    expect(t.spalten.map((s) => s.titel)).toEqual([
      'Jährliches Erwerbseinkommen in Franken von mindestens',
      'aber weniger als',
      'Beitragssatz in Prozent des Erwerbseinkommens', // war im Alt-Snapshot verloren!
    ]);
    expect(t.zeilen[0]).toEqual([`10${NBSP}100`, `17${NBSP}600`, '4,35']);
    expect(t.spalten.every((s) => s.typ === 'zahl')).toBe(true);
  });
});

// ── Headerless 2-Spalten (Beschreibung | Betrag) → titel:'' ───────────────────
describe('normalisiereTabelle — headerless 2-Spalten (T-D6, titel:\'\')', () => {
  const t = normalisiereTabelle({
    kopfZeilen: [],
    datenZeilen: [
      [c('Frühstück'), c('3.50')],
      [c('Mittagessen'), c('10.–')],
    ],
  })!;
  it('behält 2 Spalten ohne Titel, Werte byte-treu', () => {
    expect(t.spalten.map((s) => s.titel)).toEqual(['', '']);
    expect(t.spalten[0].typ).toBe('text');
    expect(t.zeilen).toEqual([['Frühstück', '3.50'], ['Mittagessen', '10.–']]);
  });
});

// ── BVG-Stil: Kopf + Daten gleiche colspan → unverändert rechteckig (T-F5 iii) ─
describe('normalisiereTabelle — Kopf+Daten gleiche colspan bleiben byte-gleich', () => {
  const t = normalisiereTabelle({
    kopfZeilen: [[c('Männer'), c('Frauen'), c('Beitrag')]],
    datenZeilen: [
      [c('25–34'), c('25–31'), c('7')],
      [c('35–44'), c('32–41'), c('10')],
    ],
  })!;
  it('keine Verdichtung, Werte unverändert', () => {
    expect(t.spalten.map((s) => s.titel)).toEqual(['Männer', 'Frauen', 'Beitrag']);
    expect(t.zeilen[0]).toEqual(['25–34', '25–31', '7']);
  });
});

// ── FALLBACKS (T-E4): ragged · lone „bis" · Prosa ─────────────────────────────
describe('normalisiereTabelle — ehrlicher Fallback (null)', () => {
  it('ragged (uneinheitliche Zeilenbreite, Art.-37-Stil) → null', () => {
    const t = normalisiereTabelle({
      kopfZeilen: [[c(''), c('Restschuld/Franken', 6), c('Gebühr/Franken')]],
      datenZeilen: [
        [c('a.'), c('für die Eintragung des Eigentumsvorbehaltes:'), c(''), c(''), c(''), c(''), c('')],
        [c(''), c(''), c(''), c(''), c('bis'), c(`1${NBSP}000`), c(''), c('25.–')],
      ],
    });
    expect(t).toBeNull();
  });
  it('lone „bis"/„für" im Rechteck (DBG-Stil Prosa) → null', () => {
    const t = normalisiereTabelle({
      kopfZeilen: [[c(''), c(''), c('Franken')]],
      datenZeilen: [
        [c('bis'), c('15 200 Franken Einkommen'), c('0.00')],
        [c('für'), c('33 200 Franken Einkommen'), c('138.60')],
      ],
    });
    expect(t).toBeNull();
  });
  it('leere Tabelle → null', () => {
    expect(normalisiereTabelle({ kopfZeilen: [], datenZeilen: [] })).toBeNull();
  });
});

// ── Staffel-Grammatik (Unit) ──────────────────────────────────────────────────
describe('istStaffelSpanne — abgeschlossene Signaturen (T-A6)', () => {
  it('Treffer', () => {
    expect(istStaffelSpanne('bis 100')).toBe(true);
    expect(istStaffelSpanne('über 100 bis 500')).toBe(true);
    expect(istStaffelSpanne(`über 1${NBSP}000${NBSP}000`)).toBe(true);
    expect(istStaffelSpanne('ab 600 000')).toBe(true);
  });
  it('Nicht-Treffer (kein Raten)', () => {
    expect(istStaffelSpanne('15 200 Franken Einkommen')).toBe(false);
    expect(istStaffelSpanne('')).toBe(false);
    expect(istStaffelSpanne('Frühstück')).toBe(false);
  });
});
