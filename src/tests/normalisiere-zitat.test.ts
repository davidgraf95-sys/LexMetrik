// src/tests/normalisiere-zitat.test.ts
// QS-DATA §3.1: DB-freie Unit-Tests der EINEN Match-Key-Kanonisierung (E0+ Baustein b).
import { describe, it, expect } from 'vitest';
import {
  grundreinigung,
  bgeMatchKey,
  ecliMatchKey,
  normalisiereZitat,
} from '../../scripts/datenhaltung/normalisiere-zitat';

describe('grundreinigung', () => {
  it('kleinschreibt, kollabiert Whitespace, trimmt', () => {
    expect(grundreinigung('  BGE   150\tIII  423  ')).toBe('bge 150 iii 423');
  });
  it('normalisiert Unicode (NFC)', () => {
    // 'e' + combining acute (U+0065 U+0301) → 'é' (U+00E9)
    expect(grundreinigung('arrêt').normalize('NFC')).toBe('arrêt');
    expect(grundreinigung('é')).toBe('é');
  });
});

describe('bgeMatchKey — BGE-Referenz → Match-Form', () => {
  it('Standard: BGE 150 III 423 → 150-III-423', () => {
    expect(bgeMatchKey('BGE 150 III 423')).toBe('150-III-423');
  });
  it('sprach-/präfix-neutral (ATF, DTF, ohne Präfix)', () => {
    expect(bgeMatchKey('ATF 150 III 423')).toBe('150-III-423');
    expect(bgeMatchKey('DTF 150 III 423')).toBe('150-III-423');
    expect(bgeMatchKey('150 III 423')).toBe('150-III-423');
  });
  it('Kleinschreibung + Extra-Whitespace', () => {
    expect(bgeMatchKey('  bge   150   iii   423 ')).toBe('150-III-423');
  });
  it('historische Abteilungen Ia / Va werden gross', () => {
    expect(bgeMatchKey('120 Ia 31')).toBe('120-IA-31');
    expect(bgeMatchKey('BGE 100 Va 5')).toBe('100-VA-5');
  });
  it('ignoriert einen Erwägungs-Schwanz', () => {
    expect(bgeMatchKey('BGE 140 III 16 E. 3.2')).toBe('140-III-16');
  });
  it('gibt null bei Nicht-BGE (Docket, Artikel, Leerstring)', () => {
    expect(bgeMatchKey('5A_1100/2025')).toBeNull();
    expect(bgeMatchKey('Art. 335c OR')).toBeNull();
    expect(bgeMatchKey('')).toBeNull();
  });
  it('ist idempotent auf dem eigenen Output nicht anwendbar, aber stabil bei erneuter Eingabe', () => {
    const k = bgeMatchKey('BGE 150 III 423')!;
    // Der Match-Key selbst ('150-III-423') ist keine BGE-Fundstelle mehr → null (bewusst).
    expect(bgeMatchKey(k)).toBeNull();
    // Doppelte Normalisierung derselben Roh-Referenz ist stabil.
    expect(bgeMatchKey('BGE 150 III 423')).toBe(bgeMatchKey('bge 150 iii 423'));
  });
});

describe('ecliMatchKey — ECLI → Match-Form', () => {
  it('kleinschreibt, Whitespace weg, sonst unverändert', () => {
    expect(ecliMatchKey('ECLI:CH:BGER:2025:5A_1100.2025')).toBe('ecli:ch:bger:2025:5a_1100.2025');
  });
  it('ist idempotent', () => {
    const k = ecliMatchKey('ECLI:CH:BGE:2024:150.I.17')!;
    expect(ecliMatchKey(k)).toBe(k);
  });
  it('trimmt umgebenden Whitespace', () => {
    expect(ecliMatchKey('  ECLI:CH:BGE:2024:150.I.17  ')).toBe('ecli:ch:bge:2024:150.i.17');
  });
  it('gibt null bei Nicht-ECLI', () => {
    expect(ecliMatchKey('BGE 150 III 423')).toBeNull();
    expect(ecliMatchKey('')).toBeNull();
  });
});

describe('normalisiereZitat — generischer Norm-/Zitat-Key', () => {
  it('kollabiert Whitespace und schreibt klein', () => {
    expect(normalisiereZitat('Art.  41   OR')).toBe('art. 41 or');
  });
  it('schliesst latinische Ordinal-Suffixe an die Zahl an', () => {
    expect(normalisiereZitat('Art. 52 bis OR')).toBe('art. 52bis or');
    expect(normalisiereZitat('Art. 335 ter ZGB')).toBe('art. 335ter zgb');
  });
  it('lässt bereits angeschlossene Suffixe unverändert', () => {
    expect(normalisiereZitat('Art. 52bis OR')).toBe('art. 52bis or');
  });
  it('entfernt Leerzeichen vor Interpunktion und Rand-Interpunktion', () => {
    expect(normalisiereZitat('Art. 41 OR ;')).toBe('art. 41 or');
    expect(normalisiereZitat('Art. 41 OR.')).toBe('art. 41 or');
  });
  it('ist idempotent', () => {
    const k = normalisiereZitat('Art. 52 bis OR;');
    expect(normalisiereZitat(k)).toBe(k);
  });
  it('lässt Mehrbuchstaben-Wörter (Abkürzungen) unangetastet', () => {
    // 'or' darf nicht als Ordinal-Suffix an eine Zahl gezogen werden.
    expect(normalisiereZitat('5 OR')).toBe('5 or');
  });
});
