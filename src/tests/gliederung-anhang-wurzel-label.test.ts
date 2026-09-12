/**
 * W2·18-FEHLERBUCH (12.9.2026) — Wurzel-Label der synthetischen Anhang-Zeile.
 *
 * Befund der Gegenprüfung zu PR #838: `baueAnhangAst`/`baueGliederungsModell`
 * beschrifteten die Wurzel IMMER «Anhänge», auch dort, wo unter ihr kein
 * einziger echter Anhang hängt, sondern ausschliesslich `scope_*`/`decl_*`
 * (Geltungsbereich, Erklärungen und Vorbehalte der Schweiz — 12 Staatsverträge
 * ohne annex-Container, PR #838). Der Struktur-Sidecar berechnet das korrekte
 * Label längst (`extrahiereAnhangStruktur`/`gruppenLabel`) — `leserSuche.ts`
 * liest es für die Suchfacette, der Baum bisher nicht. Diese Tests bauen die
 * Fixtures HANDGEMACHT (nicht gegen den committeten Korpus), weil der
 * annex-freie scope-Fall am 12.9.2026 nur in PR #838 existiert, nicht auf
 * `main` (dort tragen alle 14 committeten scope/decl-Erlasse zusätzlich einen
 * annex-Container — belegt per Skript gegen `public/normtext/struktur/bund/
 * *.json`, siehe PR-Beschreibung).
 */
import { describe, it, expect } from 'vitest';
import type { StrukturMap } from '../lib/normtext/browse';
import type { NormSnapshot } from '../lib/normtext/typen';
import { baueGliederungsModell, ID_ANHANG } from '../pages/gesetz-leser/gliederungsModell';

function bau(artikel: string, artikelLabel: string): NormSnapshot {
  return {
    id: `bund/TEST/${artikel}`, ebene: 'bund', quelle: 'TEST', erlass: 'TEST',
    artikel, artikelLabel, bloecke: [],
    stand: '2026-01-01', quelleUrl: 'https://example.invalid/', abgerufen: '2026-01-01',
    fassungsToken: '20260101', sha: '0'.repeat(64),
  };
}

describe('W2·18-FEHLERBUCH — Anhang-Wurzel-Label (§5: Sidecar-Label, keine zweite Wahrheit)', () => {
  it('nur scope_* → Wurzel heisst «Geltungsbereich» (Sidecar-Label übernommen)', () => {
    const eintraege = [bau('scope_u1', 'Geltungsbereich')];
    const struktur: StrukturMap = {
      scope_u1: { gliederung: [{ ebene: 1, label: 'Geltungsbereich', eId: 'scope' }], marginalie: [] },
    };
    const m = baueGliederungsModell({ sektionen: [], ohneGliederung: eintraege, eintraege, struktur });
    const wurzel = m.knoten.at(-1)!;
    expect(wurzel.id).toBe(ID_ANHANG);
    expect(wurzel.label).toBe('Geltungsbereich');
  });

  it('scope_* + decl_* → Wurzel heisst «Geltungsbereich und Erklärungen» (Sidecar-Label übernommen)', () => {
    const eintraege = [bau('scope_u1', 'Geltungsbereich'), bau('decl_u2', 'Erklärungen')];
    const struktur: StrukturMap = {
      scope_u1: {
        gliederung: [{ ebene: 1, label: 'Geltungsbereich und Erklärungen', eId: 'scope' }], marginalie: [],
      },
      decl_u2: {
        gliederung: [{ ebene: 1, label: 'Geltungsbereich und Erklärungen', eId: 'scope' }], marginalie: [],
      },
    };
    const m = baueGliederungsModell({ sektionen: [], ohneGliederung: eintraege, eintraege, struktur });
    const wurzel = m.knoten.at(-1)!;
    expect(wurzel.label).toBe('Geltungsbereich und Erklärungen');
  });

  it('nur annex_* (echter Anhang) → Wurzel bleibt «Anhänge»', () => {
    const eintraege = [bau('annex_1', 'Anhang 1')];
    const struktur: StrukturMap = {
      annex_1: { gliederung: [{ ebene: 1, label: 'Anhänge', eId: 'annex' }], marginalie: [] },
    };
    const m = baueGliederungsModell({ sektionen: [], ohneGliederung: eintraege, eintraege, struktur });
    const wurzel = m.knoten.at(-1)!;
    expect(wurzel.label).toBe('Anhänge');
  });

  it('gemischt annex_* + scope_* (LUGUE-Klasse) → Wurzel bleibt «Anhänge», nicht «Geltungsbereich»', () => {
    // Deckt sich mit dem heutigen Sidecar der 14 committeten LUGUE-artigen
    // Staatsverträge: dort tragen scope_/decl_-Einträge dieselbe eId 'annex'
    // wie die echten Anhänge (dokumentierte Unschärfe der Extraktion). Diese
    // Fixture prüft zusätzlich den strengeren Fall, in dem die scope-Einträge
    // bereits (fälschlich-optimistisch) eId 'scope' trügen — auch dann darf
    // die Wurzel nicht «Geltungsbereich» behaupten, solange ein echter Anhang
    // (annex-eId) mit darunterhängt (§8: im Zweifel keine Verschärfung).
    const eintraege = [bau('annex_1', 'Anhang 1'), bau('scope_u1', 'Geltungsbereich')];
    const struktur: StrukturMap = {
      annex_1: { gliederung: [{ ebene: 1, label: 'Anhänge', eId: 'annex' }], marginalie: [] },
      scope_u1: { gliederung: [{ ebene: 1, label: 'Geltungsbereich', eId: 'scope' }], marginalie: [] },
    };
    const m = baueGliederungsModell({ sektionen: [], ohneGliederung: eintraege, eintraege, struktur });
    const wurzel = m.knoten.at(-1)!;
    expect(wurzel.label).toBe('Anhänge');
  });

  it('scope_* ohne Sidecar-Eintrag (kein struktur) → konservativ «Anhänge»', () => {
    const eintraege = [bau('scope_u1', 'Geltungsbereich')];
    const m = baueGliederungsModell({ sektionen: [], ohneGliederung: eintraege, eintraege, struktur: null });
    const wurzel = m.knoten.at(-1)!;
    expect(wurzel.label).toBe('Anhänge');
  });
});
