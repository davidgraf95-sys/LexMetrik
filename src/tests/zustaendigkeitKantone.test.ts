import { describe, it, expect } from 'vitest';
import {
  ZUSTAENDIGKEIT_KANTONE, kantonErfasst, kantonZustaendigkeit, stelleFuer, gemeindeImKanton,
} from '../data/zustaendigkeitKantone';
import { bestimmeZustaendigkeit, ZPO_SCHWELLEN } from '../lib/zustaendigkeit';
import { SG_SCHWELLEN, sgPrefillKodieren, sgPrefillLesen } from '../lib/vorlagen/schlichtungsgesuchBs';

// Phase 2: Kantonsschicht (BS-Pilot) + SSoT-Konsolidierung der Schwellen
// (ZUSTAENDIGKEIT-AUFTRAG.md §6/§7). Adressen aus behoerden.ts — kein
// Zweitbestand; nicht erfasste Kantone liefern ehrlich null.

describe('Kantonsschicht — BS-Pilot', () => {
  it('BS ist erfasst; kein Handelsgericht; GOG-Schwelle offen (null, nicht geraten)', () => {
    expect(kantonErfasst('BS')).toBe(true);
    const bs = kantonZustaendigkeit('BS')!;
    expect(bs.handelsgericht).toBe(false);
    expect(bs.einzelgerichtBisCHF).toBeNull();
    expect(bs.erstinstanzName).toBe('Zivilgericht Basel-Stadt');
  });

  it('nicht erfasster Kanton → null/false (ehrlich, kein Raten)', () => {
    expect(kantonErfasst('UR')).toBe(false);
    expect(kantonZustaendigkeit('UR')).toBeNull();
    expect(stelleFuer('UR', 'ordentlich')).toBeNull();
    expect(gemeindeImKanton('UR', 'Altdorf')).toBe(false);
  });

  it('Stellen-Auflösung BS: ordentlich → Zivilgericht (Schlichtungsbehörde)', () => {
    const s = stelleFuer('BS', 'ordentlich')!;
    expect(s.name).toBe('Zivilgericht Basel-Stadt');
    expect(s.strasse).toBe('Bäumleingasse 5');
    expect(s.quelle).toContain('staatskalender');
  });

  it('Stellen-Auflösung BS: paritätisch Miete → Staatliche Schlichtungsstelle für Mietstreitigkeiten', () => {
    const s = stelleFuer('BS', 'paritaetisch_miete')!;
    expect(s.name).toContain('Mietstreitigkeiten');
    expect(s.strasse).toBe('Grenzacherstrasse 62');
  });

  it('Stellen-Auflösung BS: paritätisch GlG → Schlichtungsstelle für Diskriminierungsfragen (Art. 200 Abs. 2)', () => {
    const s = stelleFuer('BS', 'paritaetisch_glg')!;
    expect(s.name).toContain('Diskriminierungsfragen');
  });

  it('Gemeinde-Auflösung: Basel/Riehen/Bettingen → BS; Allschwil (BL) nicht; leer nicht', () => {
    expect(gemeindeImKanton('BS', 'Basel')).toBe(true);
    expect(gemeindeImKanton('BS', ' riehen ')).toBe(true); // trim/case-tolerant, deterministisch
    expect(gemeindeImKanton('BS', 'Bettingen')).toBe(true);
    expect(gemeindeImKanton('BS', 'Allschwil')).toBe(false);
    expect(gemeindeImKanton('BS', '')).toBe(false);
  });

  it('End-to-End BS: Miete-Kündigungsschutz → paritätische Behörde → konkrete Adresse', () => {
    const r = bestimmeZustaendigkeit({
      streitsache: 'miete_wohn_geschaeft', vermoegensrechtlich: true,
      streitwertCHF: 8_000, mieteUnterfall: 'kuendigungsschutz',
    });
    expect(r.schlichtung.behoerdeTyp).toBe('paritaetisch_miete');
    const stelle = stelleFuer('BS', r.schlichtung.behoerdeTyp)!;
    expect(stelle.plzOrt).toBe('4005 Basel');
  });

  it('jeder erfasste Kanton trägt stand + quelle (Pflege-Disziplin)', () => {
    for (const k of Object.values(ZUSTAENDIGKEIT_KANTONE)) {
      expect(k!.stand.trim()).not.toBe('');
      expect(k!.quelle.trim()).not.toBe('');
      expect(k!.gemeinden.length).toBeGreaterThan(0);
    }
  });
});

describe('SSoT-Konsolidierung (Auftrag §7): SG_SCHWELLEN importiert aus ZPO_SCHWELLEN', () => {
  it('die drei Zuständigkeits-Schwellen sind identisch (eine Quelle)', () => {
    expect(SG_SCHWELLEN.ENTSCHEID_AUF_ANTRAG).toBe(ZPO_SCHWELLEN.ENTSCHEID_AUF_ANTRAG);
    expect(SG_SCHWELLEN.ENTSCHEIDVORSCHLAG).toBe(ZPO_SCHWELLEN.ENTSCHEIDVORSCHLAG);
    expect(SG_SCHWELLEN.VERZICHT_GEMEINSAM).toBe(ZPO_SCHWELLEN.VERZICHT_GEMEINSAM);
  });
  it('Werte unverändert (Verhaltensneutralität der Konsolidierung)', () => {
    expect(SG_SCHWELLEN.ENTSCHEID_AUF_ANTRAG).toBe(2000);
    expect(SG_SCHWELLEN.ENTSCHEIDVORSCHLAG).toBe(10000);
    expect(SG_SCHWELLEN.VERZICHT_GEMEINSAM).toBe(100000);
    expect(SG_SCHWELLEN.ARBEITSRECHT_KOSTENLOS).toBe(30000); // bleibt lokal (Art. 113/114, andere Norm)
  });
});

describe('Prefill-Weiterleitung Zuständigkeit → Schlichtungsgesuch (Phase 4, Auftrag §8)', () => {
  it('Roundtrip Geldforderung: Typ, Betrag (→ geld.betrag) und Kanton kommen an', () => {
    const q = sgPrefillKodieren({ typ: 'geldforderung', betragCHF: 12000, kanton: 'BS' });
    const aus = sgPrefillLesen('?' + q)!;
    expect(aus.streitgegenstandTyp).toBe('geldforderung');
    expect(aus.geld?.betrag).toBe('12000');
    expect(aus.gerichtsKanton).toBe('BS');
  });

  it('Arbeitsrecht: Betrag landet im manuellen Streitwert-Feld, nicht in geld', () => {
    const aus = sgPrefillLesen('?' + sgPrefillKodieren({ typ: 'arbeitsrecht', betragCHF: 8500.5 }))!;
    expect(aus.streitgegenstandTyp).toBe('arbeitsrecht');
    expect(aus.streitwert).toBe('8500.5');
    expect(aus.geld).toBeUndefined();
  });

  it('verwirft Müll deterministisch: unbekannter Typ → null; unplausibler Betrag/Kanton ignoriert', () => {
    expect(sgPrefillLesen('?typ=quatsch&betrag=100')).toBeNull();
    expect(sgPrefillLesen('')).toBeNull();
    const aus = sgPrefillLesen('?typ=geldforderung&betrag=12%2700&kanton=xx')!; // Apostroph-Betrag, klein-kanton
    expect(aus.geld).toBeUndefined();        // Betrag mit Apostroph entspricht nicht dem Schema → verworfen
    expect(aus.gerichtsKanton).toBeUndefined(); // 'xx' ist kein Kanton-Code-Format
    expect(aus.streitgegenstandTyp).toBe('geldforderung');
  });

  it('kein Betrag ohne Wert; Kodieren lässt negative/NaN-Beträge weg', () => {
    expect(sgPrefillKodieren({ typ: 'geldforderung', betragCHF: -5 })).toBe('typ=geldforderung');
    expect(sgPrefillKodieren({ typ: 'geldforderung', betragCHF: null })).toBe('typ=geldforderung');
  });
});
