// src/tests/plan-selbstopt-parse.test.ts — Rechenkerne der Bau-Messreihe (QS-SELBSTOPT: Parser & Kennzahlen).
//
// Geprüft wird ausschliesslich `scripts/plan/selbstoptKern.ts`: alles Reine. Kein git,
// kein gh, kein Netz, keine Wanduhr.
import { readFileSync } from 'node:fs';
import {
  addiereAggregat,
  aggregiereTore,
  ciKennzahl,
  istHandschrift,
  parseEreignisse,
  parseEreignisseMitRest,
  parseFKlassen,
  parseFremdagentenRegister,
  parseTokenMetriken,
  reworkKennzahl,
  zaehleFlakySpecs,
  type RwCommit,
} from '../../scripts/plan/selbstoptKern';

// ───────────────────────────── Tor-Ereignisse ─────────────────────────────

describe('parseEreignisse', () => {
  it('liest gültige JSONL-Zeilen', () => {
    const jsonl = [
      '{"ts":"2026-08-07T10:00:00.000Z","tor":"check:plan","ok":true}',
      '{"ts":"2026-08-07T10:00:01.000Z","tor":"check:smoke","ok":false}',
    ].join('\n');
    expect(parseEreignisse(jsonl)).toEqual([
      { ts: '2026-08-07T10:00:00.000Z', tor: 'check:plan', ok: true },
      { ts: '2026-08-07T10:00:01.000Z', tor: 'check:smoke', ok: false },
    ]);
  });

  it('überspringt kaputte und unvollständige Zeilen, statt zu werfen', () => {
    // Realfall: der Schreiber wird mitten in der letzten Zeile abgebrochen.
    const jsonl = [
      '{"ts":"2026-08-07T10:00:00.000Z","tor":"check:plan","ok":true}',
      'kein json',
      '{"ts":"2026-08-07T10:00:02.000Z","tor":"ohne-ok"}',
      '',
      '{"ts":"2026-08-07T10:00:03.000Z","tor":"check:zy',
    ].join('\n');
    const { ereignisse, verworfen } = parseEreignisseMitRest(jsonl);
    expect(ereignisse).toHaveLength(1);
    expect(verworfen).toBe(3);
  });
});

describe('aggregiereTore', () => {
  const ereignisse = parseEreignisse(
    [
      '{"ts":"2026-08-01T10:00:00.000Z","tor":"check:plan","ok":true}',
      '{"ts":"2026-08-05T10:00:00.000Z","tor":"check:plan","ok":false}',
      '{"ts":"2026-08-05T10:00:01.000Z","tor":"check:smoke","ok":true}',
      '{"ts":"2026-08-05T10:00:02.000Z","tor":"check:plan","ok":false}',
    ].join('\n'),
  );

  it('zählt je Tor über alles, wenn kein Schnitt gesetzt ist', () => {
    const a = aggregiereTore(ereignisse, null);
    expect(a).toEqual({
      gesamt: 4,
      rot: 2,
      je: { 'check:plan': { gesamt: 3, rot: 2 }, 'check:smoke': { gesamt: 1, rot: 0 } },
    });
  });

  it('schneidet ECHT grösser als der Schnitt-Zeitpunkt', () => {
    // Das Ereignis EXAKT auf dem Schnitt hat der vorige Snapshot bereits
    // gezählt; zählte es hier nochmals, wäre die kumulierte Reihe zu hoch.
    const a = aggregiereTore(ereignisse, '2026-08-05T10:00:00.000Z');
    expect(a.gesamt).toBe(2);
    expect(a.rot).toBe(1);
    expect(a.je['check:plan']).toEqual({ gesamt: 1, rot: 1 });
  });

  it('sortiert die Tor-Namen, damit die JSON-Datei nicht an der Lauf-Reihenfolge hängt', () => {
    const gemischt = parseEreignisse(
      [
        '{"ts":"2026-08-01T10:00:00.000Z","tor":"check:zyklen","ok":true}',
        '{"ts":"2026-08-01T10:00:01.000Z","tor":"check:alpha","ok":true}',
      ].join('\n'),
    );
    expect(Object.keys(aggregiereTore(gemischt, null).je)).toEqual(['check:alpha', 'check:zyklen']);
  });
});

describe('addiereAggregat', () => {
  it('summiert Gesamt-, Rot- und Je-Tor-Zähler', () => {
    const a = { gesamt: 2, rot: 1, je: { 'check:plan': { gesamt: 2, rot: 1 } } };
    const b = { gesamt: 3, rot: 0, je: { 'check:plan': { gesamt: 1, rot: 0 }, 'check:smoke': { gesamt: 2, rot: 0 } } };
    expect(addiereAggregat(a, b)).toEqual({
      gesamt: 5,
      rot: 1,
      je: { 'check:plan': { gesamt: 3, rot: 1 }, 'check:smoke': { gesamt: 2, rot: 0 } },
    });
  });
});

// ─────────────────────────── Fehlerklassen-Parser ───────────────────────────

describe('parseFKlassen', () => {
  const FIXTURE = [
    '# Kopf',
    '',
    '## Register der belegten Fehlerklassen (Vorfälle 18.–20.7.2026)',
    '',
    '| # | Klasse | Was passierte | Gegenmittel |',
    '|---|---|---|---|',
    '| **F1** | Merge vor Prüfung | PR #309, kein Datum in der Zeile | Hook |',
    '| **F2a** | Selbstvalidierung | Vorfall 3.8.2026, erneut 5.8.2026 | Wächter, Fix 9.8.2026 |',
    '| **F6** | Doppelarbeit | 28.7.2026 und nochmals 28.7.2026 | Sonden |',
    '| **F9** | Nur repariert | keine Datumsangabe im Ereignis | Fix 1.1.2027, PR #999 |',
    '',
    '## Eine neue Lehre ablegen',
    '',
    'Hier steht 9.9.2026 und darf NICHT mitzählen.',
  ].join('\n');

  it('zählt datierte Vorfälle je Klasse', () => {
    expect(parseFKlassen(FIXTURE)).toEqual({ F1: 0, F2a: 2, F6: 1, F9: 0 });
  });

  // Der Befund der Gegenprüfung 7.8.2026: Reparaturdaten sind keine Vorfälle.
  // Zählte man sie mit, schlüge retro:17 nach jedem Fix eine Eskalation vor —
  // der Bau antwortete auf eine Reparatur mit «Gegenmittel greift nicht».
  it('zählt Daten aus der Gegenmittel-Spalte NICHT mit', () => {
    const out = parseFKlassen(FIXTURE);
    expect(out.F9).toBe(0); // «Fix 1.1.2027» steht nur im Gegenmittel
    expect(out.F2a).toBe(2); // 3.8. + 5.8. im Ereignis; «Fix 9.8.» bleibt draussen
  });

  it('zählt dasselbe Datum nur einmal und hört am nächsten Abschnitt auf', () => {
    const out = parseFKlassen(FIXTURE);
    expect(out.F6).toBe(1); // zweimal 28.7.2026 = ein Vorfall
    expect(Object.keys(out)).toEqual(['F1', 'F2a', 'F6', 'F9']); // nichts aus dem Folgeabschnitt
  });

  it('überspringt Zeilen ohne Ereignis-Spalte, statt zu raten', () => {
    const kaputt = ['## Register der belegten Fehlerklassen', '', '| **F1** | nur zwei Spalten |', ''].join('\n');
    expect(parseFKlassen(kaputt)).toEqual({});
  });

  it('liefert leer, wenn es den Registerabschnitt nicht gibt', () => {
    expect(parseFKlassen('# ohne Register')).toEqual({});
  });

  // §5-Bindung an die echte Quelle: der Parser ist eine Projektion des
  // Lehren-Registers. Ändert dort die Tabellenform, liefert er still `{}` und
  // die Messreihe verlöre eine Grösse, ohne dass irgendetwas rot würde.
  it('findet die echten Klassen im Lehren-Register', () => {
    const md = readFileSync('.claude/skills/lehren/SKILL.md', 'utf8');
    const out = parseFKlassen(md);
    for (const k of ['F1', 'F2a', 'F2b', 'F2c', 'F2d', 'F2e', 'F2f', 'F3', 'F4', 'F5', 'F6']) {
      expect(Object.keys(out)).toContain(k);
    }
  });

  // Präsenz der Schlüssel genügt NICHT (Gegenprüfung 7.8.2026): eine Umstellung
  // des Registers auf ISO-Daten würde jeden Zähler still auf 0 setzen, und der
  // Test oben bliebe grün. Es MUSS also mindestens ein datierter Vorfall
  // gefunden werden — heute belegt durch F2e («Anlage 20.7.2026»), F2f
  // («Bauplan-Review 4./5.8.2026») und F6 («2. Vorfall 28.7.2026»).
  it('findet im echten Register mindestens die bekannt datierten Vorfälle', () => {
    const md = readFileSync('.claude/skills/lehren/SKILL.md', 'utf8');
    const out = parseFKlassen(md);
    const summe = Object.values(out).reduce((a, b) => a + b, 0);
    expect(summe).toBeGreaterThanOrEqual(3);
    for (const k of ['F2e', 'F2f', 'F6']) expect(out[k]).toBeGreaterThanOrEqual(1);
  });
});

describe('parseFremdagentenRegister', () => {
  const FIXTURE = [
    '## §5 · Werkzeugstand',
    '',
    '**Diskrepanz-Finder-Läufe (Phase 2)** — Werte aus §2 Phase 2 übernommen:',
    '',
    '| Datum | Erlass | Artikel mit Diff | an Gemini | echt | Schein | Tokens |',
    '|---|---|---|---|---|---|---|',
    '| 4.9.2026 | AMBV | 5 | 12 | 8 | 0 | 59 528 |',
    '| 4.9.2026 | DBG Art. 1–60 | 1 | 3 | 0 | 1 | 54 836 |',
    '',
    '**Phase 3 — Zweitblick-Durchgänge** (leer, entsteht im Alltag):',
    '',
    '| Datum | Erlass/Norm | Prüfer | echt | Schein | verpasst | Tokens |',
    '|---|---|---|---|---|---|---|',
    '',
    '**Kontingent-Ereignisse** (leer, Skript …):',
    '',
    '| Datum | Dienst | Signal | Dauer | Folge |',
    '|---|---|---|---|---|',
    '| 5.9.2026 | Jules | ALARM Issue #1 ohne Annahme | 12 min | keine neuen Tickets |',
    '',
    '## §6 · Entscheide',
  ].join('\n');

  it('zählt Datenzeilen und summiert echt/Schein je Register', () => {
    const out = parseFremdagentenRegister(FIXTURE);
    expect(out.ausfaelle).toEqual([]);
    expect(out.mess).toEqual({
      diskrepanz_laeufe: 2,
      diskrepanz_echt: 8,
      diskrepanz_schein: 1,
      zweitblick_durchgaenge: 0,
      kontingent_ereignisse: 1,
    });
  });

  // ROT-BEWEIS der Nachbesserung 4.9.2026: vorher lieferte ein fehlendes oder
  // umbenanntes Register still lauter Nullen — eine Zahl, die «gemessen und
  // nichts gefunden» behauptet, wo nichts gemessen wurde (§8). Jetzt: `null`
  // plus ein benannter Ausfall je Register.
  it('meldet Ausfall statt Nullen, wenn keines der Register vorkommt', () => {
    const out = parseFremdagentenRegister('# ohne Register');
    expect(out.mess).toBeNull();
    expect(out.ausfaelle).toHaveLength(3);
    expect(out.ausfaelle.join(' ')).toContain('Diskrepanz-Finder-Läufe');
  });

  it('meldet Ausfall bei abweichender Kopfzeile, statt die Spalten zu raten', () => {
    const verdreht = FIXTURE.replace(
      '| Datum | Erlass | Artikel mit Diff | an Gemini | echt | Schein | Tokens |',
      '| Datum | Erlass | Artikel mit Diff | an Gemini | Schein | echt | Tokens |',
    );
    const out = parseFremdagentenRegister(verdreht);
    expect(out.mess).toBeNull();
    expect(out.ausfaelle.join(' ')).toContain('Kopfzeile');
  });

  it('meldet Ausfall, wenn die Marke da ist, aber gar keine Tabelle folgt', () => {
    const ohneTabelle = [
      '**Diskrepanz-Finder-Läufe (Phase 2)** — noch nichts erhoben.',
      '',
      '**Phase 3 — Zweitblick-Durchgänge**',
      '',
      '| Datum | Erlass/Norm | Prüfer | echt | Schein | verpasst | Tokens |',
      '|---|---|---|---|---|---|---|',
      '',
      '**Kontingent-Ereignisse**',
      '',
      '| Datum | Dienst | Signal | Dauer | Folge |',
      '|---|---|---|---|---|',
    ].join('\n');
    const out = parseFremdagentenRegister(ohneTabelle);
    expect(out.mess).toBeNull();
    expect(out.ausfaelle).toHaveLength(1);
  });

  // GRÜN-Fall der Nachbesserung: eine Leerzeile MITTEN in der Tabelle (im
  // Markdown ein Formatierungsversehen, kein Tabellenende) darf das Zählen
  // nicht abbrechen — vorher fielen alle Zeilen danach unter den Tisch.
  it('überspringt eine Leerzeile INNERHALB der Tabelle und zählt danach weiter', () => {
    const mitLuecke = FIXTURE.replace(
      '| 4.9.2026 | AMBV | 5 | 12 | 8 | 0 | 59 528 |',
      '| 4.9.2026 | AMBV | 5 | 12 | 8 | 0 | 59 528 |\n',
    );
    const out = parseFremdagentenRegister(mitLuecke);
    expect(out.mess?.diskrepanz_laeufe).toBe(2);
    expect(out.mess?.diskrepanz_echt).toBe(8);
  });

  it('hört bei der nächsten Nicht-Tabellenzeile auf (zählt keine Folgeabschnitte mit)', () => {
    const nurEinRegister = FIXTURE.split('\n').slice(0, 8).join('\n'); // ohne Zweitblick/Kontingent
    const out = parseFremdagentenRegister(nurEinRegister);
    expect(out.mess).toBeNull(); // Zweitblick/Kontingent fehlen ganz
    expect(out.ausfaelle).toHaveLength(2);
  });

  // §5-Bindung an die echte Quelle (Muster wie bei `parseFKlassen`): ändert
  // sich dort die Überschrift, soll der Parser sichtbar auf 0 fallen, nicht
  // raten. Die drei Marken müssen also im echten Fahrplan vorkommen.
  it('findet die drei Register-Überschriften im echten Fahrplan', () => {
    const md = readFileSync('fahrplaene/FAHRPLAN-FREMDAGENTEN.md', 'utf8');
    expect(md).toContain('**Diskrepanz-Finder-Läufe (Phase 2)**');
    expect(md).toContain('**Phase 3 — Zweitblick-Durchgänge**');
    expect(md).toContain('**Kontingent-Ereignisse**');
    const out = parseFremdagentenRegister(md);
    expect(out.ausfaelle).toEqual([]);
    // Stand 4.9.2026: zwei Diskrepanz-Läufe (AMBV, DBG), 8 echt / 1 Schein.
    expect(out.mess?.diskrepanz_laeufe).toBeGreaterThanOrEqual(2);
    expect(out.mess?.diskrepanz_echt).toBeGreaterThanOrEqual(8);
  });
});

// ────────────────────────────── Rework-Heuristik ──────────────────────────────

describe('reworkKennzahl', () => {
  const H: RwCommit[] = [
    { sha: 'c1', ts: '2026-08-01T10:00:00Z', autor: 'a@x', dateien: ['src/a.ts'] },
    { sha: 'c2', ts: '2026-08-01T20:00:00Z', autor: 'a@x', dateien: ['src/a.ts'] }, // 10 h später
    { sha: 'c3', ts: '2026-08-05T10:00:00Z', autor: 'a@x', dateien: ['src/a.ts'] }, // 86 h später
    { sha: 'c4', ts: '2026-08-05T11:00:00Z', autor: 'b@x', dateien: ['src/a.ts'] }, // fremder Autor
  ];
  const JETZT = Date.parse('2026-08-06T00:00:00Z');

  it('zählt nur eigene Vorgänger binnen Frist', () => {
    const k = reworkKennzahl(H, JETZT);
    expect(k.commits).toBe(4);
    expect(k.reworkCommits).toBe(1); // nur c2
    expect(k.anteil).toBe(0.25);
  });

  it('lange Frist macht auch den späten Folge-Commit zur Nacharbeit', () => {
    const k = reworkKennzahl(H, JETZT, 14, 100);
    expect(k.reworkCommits).toBe(2); // c2 (10 h) und c3 (86 h)
  });

  it('nutzt Commits VOR dem Fenster als Vorgänger, ohne sie mitzuzählen', () => {
    // Fenster 6 h bis jetzt2: c1 (10:00) liegt davor, c2 (20:00) darin, c3/c4
    // liegen dahinter. Beurteilt wird also nur c2 — und c2 gilt als Nacharbeit
    // ausschliesslich deshalb, weil c1 als Vorgänger sichtbar bleibt.
    const jetzt2 = Date.parse('2026-08-02T00:00:00Z');
    const k = reworkKennzahl(H, jetzt2, 6 / 24, 48);
    expect(k.commits).toBe(1);
    expect(k.reworkCommits).toBe(1);
    expect(k.anteil).toBe(1);
  });

  it('zählt Commits NACH dem Bezugszeitpunkt nicht mit (Uhr-Versatz)', () => {
    const zukunft: RwCommit[] = [
      ...H,
      { sha: 'z1', ts: '2030-01-01T00:00:00Z', autor: 'a@x', dateien: ['src/a.ts'] },
    ];
    expect(reworkKennzahl(zukunft, JETZT).commits).toBe(4);
  });

  it('leeres Fenster ergibt 0 und keine Division durch null', () => {
    const k = reworkKennzahl([], JETZT);
    expect(k).toMatchObject({ commits: 0, reworkCommits: 0, anteil: 0 });
  });

  it('mit Datei-Filter fallen Commits ohne gemessene Datei aus dem Nenner', () => {
    const gemischt: RwCommit[] = [
      ...H,
      { sha: 'k1', ts: '2026-08-05T12:00:00Z', autor: 'a@x', dateien: ['public/normtext/x.json'] },
      { sha: 'k2', ts: '2026-08-05T13:00:00Z', autor: 'a@x', dateien: ['public/normtext/x.json'] },
    ];
    expect(reworkKennzahl(gemischt, JETZT).commits).toBe(6);
    expect(reworkKennzahl(gemischt, JETZT, 14, 48, istHandschrift).commits).toBe(4);
  });
});

describe('istHandschrift', () => {
  it('nimmt Quelltext, verwirft Projektionen und Generate', () => {
    expect(istHandschrift('src/lib/x.ts')).toBe(true);
    expect(istHandschrift('scripts/plan/lage.ts')).toBe(true);
    expect(istHandschrift('e2e/leser.spec.ts')).toBe(true);
    expect(istHandschrift('public/normtext/OR.json')).toBe(false);
    expect(istHandschrift('ROADMAP.md')).toBe(false);
    expect(istHandschrift('src/lib/normtext/grundart.generated.ts')).toBe(false);
  });
});

// ─────────────────────────────── CI-Kennzahlen ───────────────────────────────

describe('ciKennzahl', () => {
  // Gegenprüfung 7.8.2026: `cancelled` ist KEIN Ausfall — nachgemessen lagen
  // 11 der 15 abgebrochenen Läufe auf `main` (Concurrency-Verdrängung).
  it('nimmt abgebrochene Läufe aus Zähler UND Nenner der Ausfallquote', () => {
    const k = ciKennzahl([
      { attempt: 1, conclusion: 'success', status: 'completed' },
      { attempt: 2, conclusion: 'failure', status: 'completed' },
      { attempt: 1, conclusion: 'cancelled', status: 'completed' },
      { attempt: 1, conclusion: 'skipped', status: 'completed' },
      { attempt: 1, conclusion: null, status: 'in_progress' }, // zählt nicht mit
    ]);
    expect(k.laeufe).toBe(4);
    expect(k.verdikte).toBe(2); // success + failure
    expect(k.failureRate).toBe(0.5); // 1 von 2 Verdikten — nicht 3 von 4
    expect(k.cancelledRate).toBe(0.5); // 2 von 4 abgeschlossenen
    expect(k.rerunRate).toBe(0.25); // 1 von 4
    expect(k.je).toEqual({ cancelled: 1, failure: 1, skipped: 1, success: 1 });
  });

  it('zählt timed_out weiterhin als Ausfall — der Lauf hatte seine Gelegenheit', () => {
    const k = ciKennzahl([
      { attempt: 1, conclusion: 'success', status: 'completed' },
      { attempt: 1, conclusion: 'timed_out', status: 'completed' },
    ]);
    expect(k.verdikte).toBe(2);
    expect(k.failureRate).toBe(0.5);
    expect(k.cancelledRate).toBe(0);
  });

  it('nur abgebrochene Läufe ⇒ Ausfallquote 0, nicht 1 (kein Verdikt heisst kein Ausfall)', () => {
    const k = ciKennzahl([{ attempt: 1, conclusion: 'cancelled', status: 'completed' }]);
    expect(k.verdikte).toBe(0);
    expect(k.failureRate).toBe(0);
    expect(k.cancelledRate).toBe(1);
  });

  it('ohne abgeschlossene Läufe keine Division durch null', () => {
    expect(ciKennzahl([])).toMatchObject({ laeufe: 0, verdikte: 0, failureRate: 0, cancelledRate: 0, rerunRate: 0 });
  });
});

// ─────────────────────────── Token-/Kosten-Messung ───────────────────────────

describe('parseTokenMetriken', () => {
  // ACHTUNG, ausdrücklich (§7): Diese Fixture ist nach der
  // Prometheus-TEXTFORMAT-SPEZIFIKATION gebaut, NICHT von einem laufenden
  // Endpunkt abgeschrieben — beim Bau war der OTel-Export nicht aktiviert (die
  // Env-Variable wartet auf David). Metrik- und Labelnamen sind damit eine
  // begründete Annahme, keine Beobachtung. Sie sind beim ERSTEN REALEN LAUF
  // gegen die echte Ausgabe von localhost:9464/metrics zu verifizieren; das
  // Snapshot-Feld `metriken` führt die tatsächlich gefundenen Namen mit, damit
  // das ohne Zusatzaufwand möglich ist. Weicht die Wirklichkeit ab, wird DIESE
  // Fixture korrigiert — nicht der Parser aufgeweicht, bis er zufällig passt.
  const FIXTURE = [
    '# HELP claude_code_token_usage_tokens_total Number of tokens used',
    '# TYPE claude_code_token_usage_tokens_total counter',
    'claude_code_token_usage_tokens_total{type="input",model="claude-opus-5"} 1200',
    'claude_code_token_usage_tokens_total{type="output",model="claude-opus-5"} 340',
    'claude_code_token_usage_tokens_total{type="cacheRead",model="claude-opus-5"} 98000',
    'claude_code_token_usage_tokens_total{type="cacheCreation",model="claude-opus-5"} 5000',
    '# HELP claude_code_cost_usage_USD_total Cost in USD',
    '# TYPE claude_code_cost_usage_USD_total counter',
    'claude_code_cost_usage_USD_total{model="claude-opus-5"} 0.4231',
    '# fremde Metriken desselben Endpunkts',
    'process_cpu_seconds_total 1234.5',
    'go_goroutines 42',
  ].join('\n');

  it('summiert die Token-Zähler und schlüsselt nach Typ auf', () => {
    const k = parseTokenMetriken(FIXTURE)!;
    expect(k.gesamt).toBe(1200 + 340 + 98000 + 5000);
    expect(k.jeTyp).toEqual({ cacheCreation: 5000, cacheRead: 98000, input: 1200, output: 340 });
  });

  it('liest die Kosten und ignoriert fremde Metriken', () => {
    const k = parseTokenMetriken(FIXTURE)!;
    expect(k.kostenUsd).toBe(0.4231);
    expect(k.metriken).toEqual(['claude_code_cost_usage_USD_total', 'claude_code_token_usage_tokens_total']);
  });

  it('kommt mit abweichenden Metrik- und Label-Namen zurecht', () => {
    // Der Exporter hängt je nach Version andere Suffixe an, und der Typ kann
    // unter `token_type` stehen. Beides darf den Parser nicht auf 0 werfen —
    // genau dieses stille 0 wäre der teuerste Ausgang.
    const k = parseTokenMetriken(
      ['claude_code_token_usage{token_type="input"} 10', 'claude_code_token_usage{token_type="output"} 20'].join('\n'),
    )!;
    expect(k.gesamt).toBe(30);
    expect(k.jeTyp).toEqual({ input: 10, output: 20 });
  });

  it('macht ein fehlendes Typ-Label sichtbar, statt es zu verschweigen', () => {
    const k = parseTokenMetriken('claude_code_token_usage_total 77')!;
    expect(k.jeTyp).toEqual({ ohne_typ: 77 });
    expect(k.gesamt).toBe(77);
  });

  it('null heisst «keine claude_code-Metrik», nicht «null Token»', () => {
    expect(parseTokenMetriken('process_cpu_seconds_total 1')).toBeNull();
    expect(parseTokenMetriken('')).toBeNull();
    expect(parseTokenMetriken('# nur Kommentare\n')).toBeNull();
  });

  it('überspringt unbrauchbare Werte und kaputte Zeilen', () => {
    const k = parseTokenMetriken(
      ['claude_code_token_usage{type="input"} NaN', 'claude_code_token_usage{type="output"} 5', 'völliger Unsinn'].join('\n'),
    )!;
    expect(k.gesamt).toBe(5);
    expect(k.jeTyp).toEqual({ output: 5 });
  });

  it('kommt mit Zeitstempel-Spalte und escapten Labelwerten zurecht', () => {
    const k = parseTokenMetriken('claude_code_token_usage{type="in\\"put"} 3 1700000000000')!;
    expect(k.jeTyp).toEqual({ 'in"put': 3 });
  });

  it('kostenUsd bleibt null, wenn es keine Kosten-Metrik gibt', () => {
    expect(parseTokenMetriken('claude_code_token_usage{type="input"} 1')!.kostenUsd).toBeNull();
  });
});

// ──────────────────────────────── Flaky-Zähler ────────────────────────────────

describe('zaehleFlakySpecs', () => {
  it('findet wiederholte Specs auch in verschachtelten Suiten', () => {
    const report = {
      suites: [
        {
          specs: [{ tests: [{ results: [{ retry: 0 }, { retry: 1 }] }] }],
          suites: [
            { specs: [{ tests: [{ results: [{ retry: 0 }] }] }, { tests: [{ results: [{ retry: 2 }] }] }] },
          ],
        },
      ],
    };
    expect(zaehleFlakySpecs(report)).toBe(2);
  });

  it('kommt mit leerem oder fremdem Inhalt klar', () => {
    expect(zaehleFlakySpecs({})).toBe(0);
    expect(zaehleFlakySpecs(null)).toBe(0);
  });
});
