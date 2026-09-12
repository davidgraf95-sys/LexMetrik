/**
 * §6.7-Ast (Gegenprüfung #808 B4, 12.9.2026): `check-struktur-konsistenz.ts` verglich
 * bisher NUR die Artikel-Keys zwischen Snapshot und Struktur-Sidecar. Das übersieht
 * einen Drift, bei dem der Generator einen NEUEN `fassungsToken`/`stand` auf einem
 * unveränderten Artikel-Bestand stempelt (Beleg DBG #695) — die Keys stimmen exakt
 * überein, der Sidecar stammt aber aus der alten Fassung.
 *
 * ROT-BEWEIS: vor `standDriftBefund` gab es diesen Ast schlicht nicht — ein Snapshot
 * mit neuer Version und ein Sidecar mit alter Version (gleiche Artikel-Keys) hätte das
 * Tor unbemerkt grün passiert. Test 2 unten reproduziert genau dieses Szenario.
 *
 * KEIN NETZ, KEIN ECHTES public/-Verzeichnis. Der Import löst KEINEN CLI-Lauf aus
 * (istCliLauf-Guard in check-struktur-konsistenz.ts prüft `!process.env.VITEST` —
 * Vitest setzt die Variable in jedem Testprozess zuverlässig; ein Guard über
 * `process.argv[1]` wurde verworfen, weil er unter vite-node auf das Binary zeigt,
 * nicht auf diese Datei — Gegenprüfung #822 B4).
 */
import { describe, it, expect } from 'vitest';
import { standDriftBefund } from '../../scripts/normtext/check-struktur-konsistenz';

describe('standDriftBefund', () => {
  it('gleiche Version auf beiden Seiten ⇒ kein Befund', () => {
    expect(
      standDriftBefund({ stand: '2026-01-01', fassungsToken: '20260101' }, { stand: '2026-01-01', fassungsToken: '20260101' }),
    ).toBeNull();
  });

  it('ROT-BEWEIS: Snapshot trägt neue Version, Sidecar die alte (gleiche Artikel-Keys wären für sich allein grün) ⇒ Befund', () => {
    const befund = standDriftBefund(
      { stand: '2026-09-01', fassungsToken: '20260901' },
      { stand: '2023-01-23', fassungsToken: '20230123' },
    );
    expect(befund).not.toBeNull();
    expect(befund).toContain('2026-09-01');
    expect(befund).toContain('2023-01-23');
  });

  it('nur fassungsToken weicht ab (stand gleich) ⇒ Befund', () => {
    expect(
      standDriftBefund({ stand: '2026-01-01', fassungsToken: '20260101' }, { stand: '2026-01-01', fassungsToken: '20250101' }),
    ).not.toBeNull();
  });

  it('Sidecar ohne Versions-Feld (additiver Rollout, ältere Datei) ⇒ kein Befund, kein rückwirkendes Rot', () => {
    expect(standDriftBefund({ stand: '2026-01-01', fassungsToken: '20260101' }, null)).toBeNull();
  });

  it('Snapshot ohne Versions-Feld (defensiv, sollte nicht vorkommen) ⇒ kein Befund', () => {
    expect(standDriftBefund(null, { stand: '2026-01-01', fassungsToken: '20260101' })).toBeNull();
  });

  it('beide ohne Versions-Feld ⇒ kein Befund', () => {
    expect(standDriftBefund(null, null)).toBeNull();
  });
});
