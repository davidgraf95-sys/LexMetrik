import { describe, it, expect } from 'vitest';
import { berechneBetreibungskosten, gebuehrPfaendung, gebuehrVerwertungRoh, gebuehrEinzahlung, rahmenEntscheidSummarsache } from '../lib/gebvKosten';

// ─── Betreibungskosten (GebV SchKG) — Goldwerte aus dem verifizierten Tarif ─
// Dossier: bibliothek/recherche/gebv-schkg-kostenrechner.md (Stand 1.1.2026).

describe('GebV-Staffeln: Goldwerte je Band (amtlich verifiziert)', () => {
  it('Art. 20 Pfändung: 10/25/45/65/90/190/400 mit Bandgrenzen einschliesslich', () => {
    expect(gebuehrPfaendung(100)).toBe(10);
    expect(gebuehrPfaendung(100.01)).toBe(25);
    expect(gebuehrPfaendung(500)).toBe(25);
    expect(gebuehrPfaendung(1_000)).toBe(45);
    expect(gebuehrPfaendung(10_000)).toBe(65);
    expect(gebuehrPfaendung(100_000)).toBe(90);
    expect(gebuehrPfaendung(1_000_000)).toBe(190);
    expect(gebuehrPfaendung(1_000_001)).toBe(400);
  });

  it('Art. 30 Verwertung: Staffel + 2 ‰ über 100 000', () => {
    expect(gebuehrVerwertungRoh(500)).toBe(10);
    expect(gebuehrVerwertungRoh(1_000)).toBe(50);
    expect(gebuehrVerwertungRoh(10_000)).toBe(100);
    expect(gebuehrVerwertungRoh(100_000)).toBe(200);
    expect(gebuehrVerwertungRoh(150_000)).toBe(300); // 2 ‰
    expect(gebuehrVerwertungRoh(1_000_000)).toBe(2_000);
  });

  it('Art. 19 Einzahlung: 5 bis 1 000; darüber 5 ‰ max. 500', () => {
    expect(gebuehrEinzahlung(1_000)).toBe(5);
    expect(gebuehrEinzahlung(10_000)).toBe(50);
    expect(gebuehrEinzahlung(200_000)).toBe(500); // Kappung
  });

  it('Art. 48 Rahmen: fünf Bänder exakt', () => {
    expect(rahmenEntscheidSummarsache(1_000)).toEqual({ vonCHF: 40, bisCHF: 150 });
    expect(rahmenEntscheidSummarsache(10_000)).toEqual({ vonCHF: 50, bisCHF: 300 });
    expect(rahmenEntscheidSummarsache(100_000)).toEqual({ vonCHF: 60, bisCHF: 500 });
    expect(rahmenEntscheidSummarsache(1_000_000)).toEqual({ vonCHF: 70, bisCHF: 2_000 });
    expect(rahmenEntscheidSummarsache(1_000_001)).toEqual({ vonCHF: 500, bisCHF: 4_000 });
  });
});

describe('berechneBetreibungskosten: Posten-Summen + §2-Schnitt', () => {
  it('ZB 5 000 + 2 Zustellversuche + 1 weitere Ausfertigung: 60 + 14 + 30 = 104', () => {
    const e = berechneBetreibungskosten({
      forderungCHF: 5_000,
      zahlungsbefehl: { zustellversuche: 2, weitereAusfertigungen: 1 },
    });
    expect(e.totalPunktwerteCHF).toBe(104);
    expect(e.ergebnis).toContain('104');
  });

  it('fruchtlose Pfändung: halbe Gebühr min. 10 (Forderung 50: 10÷2=5 → min. 10)', () => {
    expect(berechneBetreibungskosten({ forderungCHF: 50, pfaendung: { ausgang: 'fruchtlos' } }).totalPunktwerteCHF).toBe(10);
    expect(berechneBetreibungskosten({ forderungCHF: 5_000, pfaendung: { ausgang: 'fruchtlos' } }).totalPunktwerteCHF).toBe(32.5);
    expect(berechneBetreibungskosten({ forderungCHF: 5_000, pfaendung: { ausgang: 'erfolglos' } }).totalPunktwerteCHF).toBe(10);
  });

  it('Verwertung: Erlös-Kappung (Art. 30 Abs. 3) und kein-Erwerber-Minderung (Abs. 4)', () => {
    // Erlös 600 → Staffelwert 50, aber nie über … nein: 50 < 600, keine Kappung; Grenzfall Erlös 8 → Staffel 10 → gekappt auf 8
    expect(berechneBetreibungskosten({ forderungCHF: 1, verwertung: { betragCHF: 8 } }).totalPunktwerteCHF).toBe(8);
    // kein Erwerber, Schätzwert 2 Mio.: 2 ‰ = 4 000 → ÷2 = 2 000 → max. 1 000
    expect(berechneBetreibungskosten({ forderungCHF: 1, verwertung: { betragCHF: 2_000_000, keinErwerber: true } }).totalPunktwerteCHF).toBe(1_000);
  });

  it('Art. 48 erscheint NUR als Bandbreite, nie im Punktwert-Total (§2)', () => {
    const e = berechneBetreibungskosten({ forderungCHF: 20_000, zahlungsbefehl: {}, entscheidSummarsache: { streitwertCHF: 20_000 } });
    expect(e.totalPunktwerteCHF).toBe(90); // nur ZB
    expect(e.bandbreite).toEqual({ vonCHF: 60, bisCHF: 500 });
    expect(e.ergebnis).toContain('Rahmen');
  });

  it('Hinweise: Auslagen (13), Rechtsvorschlag gebührenfrei (18), Überwälzung (68); Determinismus', () => {
    const input = { forderungCHF: 5_000, zahlungsbefehl: {} } as const;
    const e = berechneBetreibungskosten(input);
    const w = e.warnungen.join(' ');
    expect(w).toContain('Art. 13');
    expect(w).toContain('GEBÜHRENFREI');
    expect(e.ergebnis).toContain('Art. 68 SchKG');
    expect(berechneBetreibungskosten(input)).toEqual(e);
  });

  it('wirft ohne Verfahrensschritt und bei ungültiger Forderung', () => {
    expect(() => berechneBetreibungskosten({ forderungCHF: 5_000 })).toThrow();
    expect(() => berechneBetreibungskosten({ forderungCHF: -1, zahlungsbefehl: {} })).toThrow();
  });

  // Deploy-Bug-Check 7.6.2026 (MITTEL): Promille-Bänder erzeugten >2
  // Dezimalstellen (z. B. 123 456.78 × 2 ‰ = 246.91356). Hauskonvention
  // round2; ob amtlich 0.05 gälte, liegt als Grundsatzfrage bei David
  // (HANDLUNGSPLAN A.4).
  it('Promille-Bänder rappengenau gerundet (round2), auch nach Abs.-4-Halbierung', () => {
    expect(gebuehrVerwertungRoh(123_456.78)).toBe(246.91);
    expect(gebuehrEinzahlung(1_234.56)).toBe(6.17);
    const e = berechneBetreibungskosten({
      forderungCHF: 200_000,
      verwertung: { betragCHF: 123_456.78, keinErwerber: true },
    });
    expect(Math.round(e.totalPunktwerteCHF * 100) / 100).toBe(e.totalPunktwerteCHF); // max. 2 Dezimalstellen
    expect(e.totalPunktwerteCHF).toBe(123.46); // 246.91 ÷ 2 = 123.455 → round2
  });
});
