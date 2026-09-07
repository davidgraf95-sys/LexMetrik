/**
 * W2·24-DESIGN-IDENTITAET, R3-Nachzug (6.9.2026) — Prüfbefund R3-F4.
 *
 * DEKLARIERTE fachliche Änderung, kein Refactoring (§6.3): die Startseiten-Liste
 * der jüngsten Entscheide zeigt das Entscheiddatum nur noch EINMAL — in ihrer
 * Datumsspalte, nicht zusätzlich im Zitierungs-Suffix.
 *
 * Der Wächter prüft die Grenze in BEIDE Richtungen: das Suffix fällt, und alles
 * andere bleibt. Eine Fundstelle ist das eine, was diese Anwendung nie kürzen
 * darf (§8) — ein zu gieriger Ausdruck wäre hier der eigentliche Schaden.
 */
import { describe, it, expect } from 'vitest';
import { ohneDatumsSuffix } from '../components/start/entscheidZitierung';

describe('ohneDatumsSuffix', () => {
  it('streicht das nachgestellte Entscheiddatum', () => {
    expect(ohneDatumsSuffix('BGer 1C_733/2025 vom 17. Juni 2026')).toBe('BGer 1C_733/2025');
    expect(ohneDatumsSuffix('BGer 7B_651/2026 vom 1. März 2026')).toBe('BGer 7B_651/2026');
    // Zeilenende mit Leerraum dahinter (aus dem Register möglich).
    expect(ohneDatumsSuffix('BGer 12T_3/2025 vom 15. Juni 2026 ')).toBe('BGer 12T_3/2025');
  });

  it('lässt jede Zitierung ohne Datums-Suffix unangetastet', () => {
    for (const z of [
      'BGE 152 V 52',
      'BGE 148 III 115 E. 4.2',
      'Obergericht AG HOR.2024.19',
      // «vom» mitten im Text ist KEIN Suffix — nur das Zeilenende zählt.
      'Verfügung vom 3. Mai 2026 bestätigt',
      // Datum ohne «vom» bleibt ebenfalls stehen.
      'BGer 1C_1/2020, 5. Februar 2020',
    ]) expect(ohneDatumsSuffix(z)).toBe(z);
  });

  it('ROT-BEWEIS: der Vorher-Zustand fällt auf', () => {
    // Wortlaut, wie die Zeile am 6.9.2026 im Preview stand (§2b — Beleg, nie
    // nachgeführt). Ohne den Griff bliebe das Datum doppelt in der Zeile.
    const vorher = 'BGer 1C_733/2025 vom 17. Juni 2026';
    expect(vorher).toContain('17. Juni 2026');
    expect(ohneDatumsSuffix(vorher)).not.toContain('17. Juni 2026');
  });
});
