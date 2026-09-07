// src/tests/plan-selbstopt-zeitreihe.test.ts — Rechenkerne der Bau-Messreihe (QS-SELBSTOPT: Zeitreihen-Schema).
//
// Geprüft wird ausschliesslich `scripts/plan/selbstoptKern.ts`: alles Reine. Kein git,
// kein gh, kein Netz, keine Wanduhr.
import {
  GENERIERT_MARKE,
  letzterSnapshot,
  pruefeZeitreihe,
  quoteText,
  type Snapshot,
  type Zeitreihe,
} from '../../scripts/plan/selbstoptKern';

// ─────────────────────────── Schema-Prüfung (check:plan) ───────────────────────────

function snapshot(p: Partial<Snapshot> = {}): Snapshot {
  return {
    erhobenAm: '2026-08-07T10:00:00.000Z',
    headCommit: 'abcdef1234567890abcdef1234567890abcdef12',
    torRot: { seitLetztem: { gesamt: 0, rot: 0, je: {} }, kumuliert: { gesamt: 0, rot: 0, je: {} } },
    ci: null,
    rework: null,
    flaky: null,
    tokens: null,
    fKlassen: {},
    fremdagenten: { jules: null, gemini: null, claude_token_pro_schritt: null },
    ausfaelle: [],
    ...p,
  };
}

function reihe(snapshots: Snapshot[], kopf: Partial<Zeitreihe> = {}): string {
  return JSON.stringify({ _generiert: GENERIERT_MARKE, schema: 1, snapshots, ...kopf });
}

describe('pruefeZeitreihe', () => {
  it('fehlende Datei ist KEIN Fehler', () => {
    expect(pruefeZeitreihe(null)).toEqual([]);
  });

  it('gültige Reihe passiert', () => {
    expect(pruefeZeitreihe(reihe([snapshot(), snapshot({ erhobenAm: '2026-08-07T11:00:00.000Z' })]))).toEqual([]);
  });

  it('meldet fehlende Generat-Marke', () => {
    const roh = reihe([snapshot()], { _generiert: 'von Hand gepflegt' });
    expect(pruefeZeitreihe(roh).join('\n')).toContain('_generiert');
  });

  it('meldet nicht aufsteigende Snapshots', () => {
    const roh = reihe([snapshot({ erhobenAm: '2026-08-07T11:00:00.000Z' }), snapshot({ erhobenAm: '2026-08-07T10:00:00.000Z' })]);
    expect(pruefeZeitreihe(roh).join('\n')).toContain('chronologisch');
  });

  it('meldet gleiche Zeitstempel (nicht später ist nicht aufsteigend)', () => {
    expect(pruefeZeitreihe(reihe([snapshot(), snapshot()])).join('\n')).toContain('chronologisch');
  });

  it('meldet kaputtes JSON, fehlende Pflichtfelder und falschen SHA', () => {
    expect(pruefeZeitreihe('{kein json').join('\n')).toContain('kein gültiges JSON');
    expect(pruefeZeitreihe(reihe([snapshot({ headCommit: 'ZZZ' })])).join('\n')).toContain('headCommit');
    expect(pruefeZeitreihe(reihe([snapshot({ erhobenAm: 'gestern' })])).join('\n')).toContain('erhobenAm');
    const ohneTorRot = JSON.stringify({
      _generiert: GENERIERT_MARKE,
      schema: 1,
      snapshots: [{ erhobenAm: '2026-08-07T10:00:00.000Z', headCommit: 'abcdef1', ausfaelle: [] }],
    });
    expect(pruefeZeitreihe(ohneTorRot).join('\n')).toContain('torRot');
  });

  it('meldet fehlende snapshots-Liste', () => {
    expect(pruefeZeitreihe(JSON.stringify({ _generiert: GENERIERT_MARKE, schema: 1 })).join('\n')).toContain('snapshots');
  });

  // Gegenprüfung 7.8.2026: Die Prüfung deckte weniger, als ihre Konsumenten
  // voraussetzen. Eine Datei ohne `fKlassen` galt als valide, check:plan blieb
  // grün — und retro:17 starb an `Object.keys(undefined)`.
  it('meldet fehlendes fKlassen — retro:17 iteriert darüber', () => {
    const ohne = { ...snapshot() } as Partial<Snapshot>;
    delete ohne.fKlassen;
    expect(pruefeZeitreihe(reihe([ohne as Snapshot])).join('\n')).toContain('fKlassen');
  });

  it('meldet fKlassen, das kein Zahlen-Register ist', () => {
    const falsch = snapshot({ fKlassen: { F1: 'viele' } as unknown as Record<string, number> });
    expect(pruefeZeitreihe(reihe([falsch])).join('\n')).toContain('fKlassen');
  });

  it('verlangt ci/rework/flaky/tokens ausdrücklich — null ja, fehlend nein', () => {
    for (const feld of ['ci', 'rework', 'flaky', 'tokens'] as const) {
      const ohne = { ...snapshot() } as Partial<Snapshot>;
      delete ohne[feld];
      const befunde = pruefeZeitreihe(reihe([ohne as Snapshot])).join('\n');
      expect(befunde).toContain(`"${feld}" fehlt`);
    }
    // null bleibt zulässig: das IST die Ausfall-Semantik.
    expect(pruefeZeitreihe(reihe([snapshot({ ci: null, rework: null, flaky: null, tokens: null })]))).toEqual([]);
  });

  // QS-FREMDAGENTEN (Schema 3): dasselbe Muster wie bei ci/rework/flaky/tokens
  // oben, nur eine Ebene tiefer — das Block-Objekt selbst ist Pflicht, seine
  // beiden Quellen dürfen `null` sein.
  it('meldet fehlendes "fremdagenten"', () => {
    const ohne = { ...snapshot() } as Partial<Snapshot>;
    delete ohne.fremdagenten;
    expect(pruefeZeitreihe(reihe([ohne as Snapshot])).join('\n')).toContain('"fremdagenten" fehlt');
  });

  it('akzeptiert fremdagenten mit lauter null-Quellen', () => {
    expect(
      pruefeZeitreihe(
        reihe([snapshot({ fremdagenten: { jules: null, gemini: null, claude_token_pro_schritt: null } })]),
      ),
    ).toEqual([]);
  });

  it('akzeptiert eine vollständige Jules-/Gemini-Messung', () => {
    expect(
      pruefeZeitreihe(
        reihe([
          snapshot({
            fremdagenten: {
              jules: {
                prs_gemerged_7d: 3,
                prs_geschlossen_7d: 1,
                proben_7d: 1,
                entwurf_antworten_7d: 1,
                prs_geschlossen_nummern: [662],
                median_dauer_min: 30,
                tickets_24h: 2,
                alarm: false,
              },
              gemini: { diskrepanz_laeufe: 2, diskrepanz_echt: 8, diskrepanz_schein: 1, zweitblick_durchgaenge: 0, kontingent_ereignisse: 0 },
              claude_token_pro_schritt: null,
            },
          }),
        ]),
      ),
    ).toEqual([]);
  });

  // Schema 4: `proben_7d` und `prs_geschlossen_nummern` dürfen `null` sein —
  // das ist die Migrations-Aussage «diese Messung unterschied noch keine
  // Proben», nicht «null Proben gemessen».
  it('akzeptiert eine migrierte Jules-Messung ohne Proben-Unterscheidung', () => {
    expect(
      pruefeZeitreihe(
        reihe([
          snapshot({
            fremdagenten: {
              jules: {
                prs_gemerged_7d: 3,
                prs_geschlossen_7d: 1,
                proben_7d: null,
                entwurf_antworten_7d: null,
                prs_geschlossen_nummern: null,
                median_dauer_min: 30,
                tickets_24h: 2,
                alarm: false,
              },
              gemini: null,
              claude_token_pro_schritt: null,
            },
          }),
        ]),
      ),
    ).toEqual([]);
  });

  // Schema 5 (QS-EFFIZIENZ, 5.9.2026): `entwurf_antworten_7d` darf für sich
  // allein `null` sein, auch wenn `proben_7d` in derselben Messung bereits
  // eine echte Zahl trägt — der realistische Zwischenstand einer Messung, die
  // Proben schon unterschied, Entwurf-Antworten aber noch nicht (Schema
  // 4→5). Alter Snapshot ohne das Feld ⇒ `null`, nie Absturz.
  it('akzeptiert eine migrierte Jules-Messung ohne Entwurf-Antwort-Unterscheidung', () => {
    expect(
      pruefeZeitreihe(
        reihe([
          snapshot({
            fremdagenten: {
              jules: {
                prs_gemerged_7d: 3,
                prs_geschlossen_7d: 1,
                proben_7d: 1,
                entwurf_antworten_7d: null,
                prs_geschlossen_nummern: [662],
                median_dauer_min: 30,
                tickets_24h: 2,
                alarm: false,
              },
              gemini: null,
              claude_token_pro_schritt: null,
            },
          }),
        ]),
      ),
    ).toEqual([]);
  });

  it('meldet eine Jules-Messung, der die Schema-4-Felder ganz fehlen', () => {
    const kaputt = snapshot({
      fremdagenten: {
        jules: {
          prs_gemerged_7d: 3,
          prs_geschlossen_7d: 1,
          median_dauer_min: 30,
          tickets_24h: 2,
          alarm: false,
        } as unknown as Snapshot['fremdagenten']['jules'],
        gemini: null,
        claude_token_pro_schritt: null,
      },
    });
    expect(pruefeZeitreihe(reihe([kaputt])).join('\n')).toContain('fremdagenten.jules');
  });

  it('meldet ein unvollständiges "fremdagenten.jules"', () => {
    const kaputt = snapshot({
      fremdagenten: {
        jules: { prs_gemerged_7d: 1 } as unknown as Snapshot['fremdagenten']['jules'],
        gemini: null,
        claude_token_pro_schritt: null,
      },
    });
    expect(pruefeZeitreihe(reihe([kaputt])).join('\n')).toContain('fremdagenten.jules');
  });

  it('meldet claude_token_pro_schritt ungleich null', () => {
    const kaputt = snapshot({
      fremdagenten: {
        jules: null,
        gemini: null,
        claude_token_pro_schritt: 123 as unknown as null,
      },
    });
    expect(pruefeZeitreihe(reihe([kaputt])).join('\n')).toContain('claude_token_pro_schritt');
  });

  // Gegenprüfung 7.8.2026 (B6): Zonen-Offsets sind verboten, weil die
  // Chronologie lexikografisch entschieden wird. `…T09:00:00Z` ist SPÄTER als
  // `…T10:30:00+02:00`, die Zeichenkette behauptet das Gegenteil.
  it('lehnt Zeitstempel mit Zonen-Offset ab', () => {
    const mitOffset = snapshot({ erhobenAm: '2026-08-07T10:30:00+02:00' });
    expect(pruefeZeitreihe(reihe([mitOffset])).join('\n')).toContain('erhobenAm');
  });

  it('akzeptiert Z-Stempel mit und ohne Millisekunden', () => {
    expect(pruefeZeitreihe(reihe([snapshot({ erhobenAm: '2026-08-07T10:00:00Z' })]))).toEqual([]);
    expect(pruefeZeitreihe(reihe([snapshot({ erhobenAm: '2026-08-07T10:00:00.123Z' })]))).toEqual([]);
  });
});

// ────────────────────────────────── Anzeige ──────────────────────────────────

describe('letzterSnapshot / quoteText', () => {
  it('nimmt den jüngsten Eintrag, sonst null', () => {
    const a = snapshot();
    const b = snapshot({ erhobenAm: '2026-08-08T10:00:00.000Z' });
    expect(letzterSnapshot({ _generiert: GENERIERT_MARKE, schema: 1, snapshots: [a, b] })).toBe(b);
    expect(letzterSnapshot({ _generiert: GENERIERT_MARKE, schema: 1, snapshots: [] })).toBeNull();
    expect(letzterSnapshot(null)).toBeNull();
  });

  it('formatiert Quoten als Prozent und Unbekanntes als Gedankenstrich', () => {
    expect(quoteText(0.4567)).toBe('46 %');
    expect(quoteText(null)).toBe('—');
  });
});
