import { pruefe } from '../../scripts/plan/check';
import { idTrifft, sammleVerweise, SPEC_BINDUNG_AUSNAHMEN } from '../../scripts/plan/specBindung';

// ─── aus src/tests/plan-spec-bindung.test.ts ───────────────────────────────────

// ---------------------------------------------------------------------------
// Regel 11 — SPEC-BINDUNG (Bauplan-Review 4.8.2026, Befund B1).
//
// Regel 9 prüft, dass der `fahrplan:`-PFAD existiert — die Existenz des
// Containers. Der Zeiger auf die Bau-Spec steht aber in der ROADMAP-Prosa
// («**Detail:** [FAHRPLAN-X.md](fahrplaene/FAHRPLAN-X.md) §Y»), und den sah bis
// heute keine Regel an. Drei von 66 Verweisen zeigten am 4.8.2026 ins Leere oder
// auf einen fremden Abschnitt, ohne dass ein Tor rot wurde — die Bau-Session
// landet dann in einer fremden Spec und baut das Falsche.
//
// GEBURTSBEWEIS (§6.7) auf dem Stand `d316f5884`, `npm run check:plan`:
//   - W2·5k-LINIEN-KONZEPT: Spec-Anker §L-3/A28 (Z.401) löst in
//     "fahrplaene/FAHRPLAN-GESETZESDARSTELLUNG-V2.md" nicht auf …
//   - QS-KORPUS-BMV: Spec-§ "fahrplaene/FAHRPLAN-FEDLEX-PORTFOLIO.md §17"
//     (Z.210) nennt "QS-KORPUS-BMV" nicht …
//   - QS-UI-HIGHLIGHT: Spec-§ "fahrplaene/FAHRPLAN-UI-NAVIGATION.md §S" (Z.214)
//     nennt "QS-UI-HIGHLIGHT" nicht …
// Die Fälle hier sind synthetisch und dateisystemfrei (injizierter Leser), damit
// der Test deterministisch bleibt und nicht mit jeder Doku-Korrektur kippt.
// ---------------------------------------------------------------------------

/**
 * Ziel-Fahrplan. Die Form ist dem Bestand nachgebaut, einschliesslich der
 * Nachzug-Überschrift in §3, die ihren Quell-§ IM TITEL mitführt — genau das
 * Muster, an dem ein blosser Substring-Match die Regel blind machen würde.
 */
const ZIEL = [
  '# FAHRPLAN-ZIEL',
  '',
  '## §1 · Sammel-Abschnitt (nennt keine Schritt-ID)',
  'Prosa ohne jede Schritt-ID.',
  '',
  '## §2 · ROADMAP-Spec `W9·1-ALPHA` (wörtlich verschoben)',
  'Die Bau-Spec im Wortlaut.',
  '',
  '### §2.1 Unterabschnitt — gehört noch zu §2',
  'Hier steht `W9·3-GAMMA`.',
  '',
  '## §3 · ROADMAP-Spec-Nachzug `W9·2-BETA` *(→ Bau-Spec: §1 dieser Datei)*',
  'Nachzug-Spec.',
  '',
  '## §4 · Teilschritte',
  'Behandelt nur `W9·1-ALPHA-K1`.',
  '',
].join('\n');

const ZIEL_PFAD = 'fahrplaene/FAHRPLAN-ZIEL.md';
const leser = (p: string): string | null => (p === ZIEL_PFAD ? ZIEL : null);

const META = (id: string) =>
  `<!-- @meta id: ${id} · status: ready · blocker: null · dep: [] · feld: betrieb -->`;

/** ROADMAP-Fixture: eine Einheit, deren Prosa den Verweis trägt. */
const plan = (verweis: string, id = 'W9·1-ALPHA') =>
  [
    '## Die geordnete Abarbeitung',
    '<!-- @blockers',
    'b1: grund',
    '-->',
    `- [ ] **1 · Alpha** — **Detail:** ${verweis}`,
    `  ${META(id)}`,
    '',
    'Siehe FAHRPLAN-PLAN-STEUERUNG.md.',
    '',
  ].join('\n');

// Der frühere zweite Parameter (Inventar-IDs) ist mit der Steuerungs-Diät vom
// 29.8.2026 entfallen — check.ts Regel 1 prüft keine Inventar-Abdeckung mehr.
const lauf = (md: string) => pruefe(md, ['FAHRPLAN-PLAN-STEUERUNG.md'], () => true, leser);

/** Markdown-Link auf den Ziel-Fahrplan mit dem gegebenen Anker. */
const verweis = (anker: string) => `[FAHRPLAN-ZIEL.md](${ZIEL_PFAD}) ${anker}.`;

describe('Regel 11 — Stufe (a): Anker-Auflösung', () => {
  it('NEGATIV: toter §-Anker → Problem (der W2·5k-LINIEN-KONZEPT-Fall §L-3/A28)', () => {
    const p = lauf(plan(verweis('§9')));
    expect(p.map((x) => x.meldung)).toContain(
      `Spec-Anker §9 (Z.5) löst in "${ZIEL_PFAD}" nicht auf — keine Überschrift trägt ihn`,
    );
  });

  it('NEGATIV: Anker mit Schrägstrich bleibt EIN Anker (§L-3/A28 wird nicht zerlegt)', () => {
    const p = lauf(plan(verweis('§L-3/A28')));
    expect(p.some((x) => /Spec-Anker §L-3\/A28 .* nicht auf/.test(x.meldung))).toBe(true);
  });

  it('NEGATIV: Verbund-Anker «§9/§2» — der tote Teil wird einzeln benannt', () => {
    const p = lauf(plan(verweis('§9/§2')));
    expect(p.map((x) => x.meldung)).toContain(
      `Spec-Anker §9 (aus "§9/§2") (Z.5) löst in "${ZIEL_PFAD}" nicht auf — keine Überschrift trägt ihn`,
    );
  });

  it('NEGATIV: Ziel-Datei nicht lesbar → Problem', () => {
    const md = plan('[FAHRPLAN-WEG.md](fahrplaene/FAHRPLAN-WEG.md) §1.');
    expect(lauf(md).some((x) => /Datei nicht lesbar/.test(x.meldung))).toBe(true);
  });

  it('GEGENPROBE: Verbund-Anker «§1/§2» — beide lösen auf, §2 bindet die ID → kein Problem', () => {
    expect(lauf(plan(verweis('§1/§2')))).toEqual([]);
  });
});

describe('Regel 11 — Stufe (b): ID-Bindung', () => {
  it('POSITIV: Anker löst auf und der § nennt die Schritt-ID → kein Problem', () => {
    expect(lauf(plan(verweis('§2')))).toEqual([]);
  });

  it('NEGATIV: Anker löst auf, der § nennt die ID aber nicht (Sammel-§) → Problem', () => {
    const p = lauf(plan(verweis('§1')));
    expect(p.map((x) => x.meldung)).toContain(
      `Spec-§ "${ZIEL_PFAD} §1" (Z.5) nennt "W9·1-ALPHA" nicht — der Anker löst auf, trifft aber die falsche Spec`,
    );
  });

  // Der QS-KORPUS-BMV-Fall in Reinform: die Nachzug-Überschrift §3 führt «§1» in
  // ihrem eigenen Titel mit UND nennt W9·2-BETA. Ein Substring-Match über
  // Überschriftszeilen liesse den Anker «§1» dort auflösen, fände die ID und
  // meldete GRÜN — die Regel wäre für genau die Fehlerklasse blind, für die sie
  // gebaut ist. Darum muss der Anker am ANFANG des Überschriftstexts stehen.
  it('NEGATIV: § im Titel einer Nachzug-Überschrift bindet nicht (der QS-KORPUS-BMV-Fall)', () => {
    const p = lauf(plan(verweis('§1'), 'W9·2-BETA'));
    expect(p.some((x) => x.id === 'W9·2-BETA' && /nennt "W9·2-BETA" nicht/.test(x.meldung))).toBe(true);
  });

  it('NEGATIV: § nennt nur die Teilschritt-ID `…-K1` → Wortgrenze hält, Problem bleibt', () => {
    const p = lauf(plan(verweis('§4')));
    expect(p.some((x) => /nennt "W9·1-ALPHA" nicht/.test(x.meldung))).toBe(true);
  });

  it('GEGENPROBE: die ID steht in einem UNTERabschnitt des §, der § bindet trotzdem', () => {
    expect(lauf(plan(verweis('§2'), 'W9·3-GAMMA'))).toEqual([]);
  });
});

// Ein Schritt trägt genau EINEN Bau-Spec-Zeiger; weitere §-Verweise seiner Prosa
// sind Kontext (Vorgeschichte, Referenz-§, Herkunftsbeleg). Im Bestand belegt an
// `W2·5k-LINIEN-KONZEPT`: «**Detail:** … V2 §2 … ; Vorgeschichte A28:
// FAHRPLAN-GESETZES-UX.md §10.9». Ein historischer Abschnitt muss die heutige
// Schritt-ID nicht kennen — Stufe (b) auf ihn anzuwenden, triebe nur die
// Allowlist auf. Stufe (a) gilt auch dort: ein toter Zeiger ist immer falsch.
describe('Regel 11 — Bau-Spec-Zeiger vs. Kontext-Verweis', () => {
  const zweiVerweise = (zweiter: string) =>
    [
      '## Die geordnete Abarbeitung',
      '<!-- @blockers',
      'b1: grund',
      '-->',
      `- [ ] **1 · Alpha** — **Detail:** ${verweis('§2')}`,
      `  Vorgeschichte: [FAHRPLAN-ZIEL.md](${ZIEL_PFAD}) ${zweiter}.`,
      `  ${META('W9·1-ALPHA')}`,
      '',
      'Siehe FAHRPLAN-PLAN-STEUERUNG.md.',
      '',
    ].join('\n');

  it('Kontext-Verweis auf einen § ohne die Schritt-ID → kein Problem (Stufe b greift nicht)', () => {
    expect(lauf(zweiVerweise('§1'))).toEqual([]);
  });

  it('NEGATIV: toter Kontext-Verweis → Problem (Stufe a gilt uneingeschränkt)', () => {
    const p = lauf(zweiVerweise('§9'));
    expect(p.some((x) => /Spec-Anker §9 .* nicht auf/.test(x.meldung))).toBe(true);
  });

  it('NEGATIV: der ERSTE Verweis bleibt ID-pflichtig, auch wenn ein zweiter folgt', () => {
    const md = zweiVerweise('§2').replace(`**Detail:** ${verweis('§2')}`, `**Detail:** ${verweis('§1')}`);
    expect(lauf(md).some((x) => /nennt "W9·1-ALPHA" nicht/.test(x.meldung))).toBe(true);
  });
});

describe('Regel 11 — Allowlist', () => {
  // Der einzige Bestands-Eintrag: W3-AUSBAU (bis zur Etiketten-Konsolidierung
  // 15.8.2026 `W3·10`) zeigt in einen ARCHIVIERTEN Fahrplan aus der Zeit vor der
  // §-Überschriften-Konvention (`## P3` ohne §-Sigel, Schritt-ID dort unbekannt).
  // Die Auflösung ist laut ROADMAP der erste Arbeitsschritt des Schritts selbst.
  const ARCHIV = '# Alt\n\n## P3 — Fachliche Spitze\nOhne §-Sigel und ohne Schritt-ID.\n';
  const archivLeser = (p: string) => (p === 'archiv/FAHRPLAN-ALT.md' ? ARCHIV : null);
  const mitArchiv = (anker: string, id: string) =>
    plan(`\`archiv/FAHRPLAN-ALT.md\` ${anker}`, id);

  it('der Eintrag trägt eine Begründung (leere Begründung wäre keine)', () => {
    expect(SPEC_BINDUNG_AUSNAHMEN.get('W3-AUSBAU §P3')).toMatch(/Archiv-Fahrplan/);
  });

  it('allowlisteter Verweis → kein Problem', () => {
    const p = pruefe(mitArchiv('§P3', 'W3-AUSBAU'), ['FAHRPLAN-PLAN-STEUERUNG.md'], () => true, archivLeser);
    expect(p).toEqual([]);
  });

  // Der Schlüssel ist `«<id> <anker>»`, nicht bloss die ID: verschiebt jemand den
  // Anker, verliert die Ausnahme ihre Wirkung und die Regel greift wieder. Eine
  // Ausnahme, die jeden künftigen Anker desselben Schritts mit deckt, wäre ein
  // Tor, das an dieser Stelle nicht mehr scheitern kann (§6.7).
  it('NEGATIV: derselbe Schritt mit ANDEREM Anker fällt aus der Ausnahme (fail-closed)', () => {
    const p = pruefe(mitArchiv('§P9', 'W3-AUSBAU'), ['FAHRPLAN-PLAN-STEUERUNG.md'], () => true, archivLeser);
    expect(p.some((x) => x.id === 'W3-AUSBAU' && /§P9 .* nicht auf/.test(x.meldung))).toBe(true);
  });

  it('NEGATIV: ein anderer Schritt erbt die Ausnahme nicht', () => {
    const p = pruefe(mitArchiv('§P3', 'W9·1-ALPHA'), ['FAHRPLAN-PLAN-STEUERUNG.md'], () => true, archivLeser);
    expect(p.some((x) => x.id === 'W9·1-ALPHA' && /§P3 .* nicht auf/.test(x.meldung))).toBe(true);
  });
});

describe('Regel 11 — Zuordnung Verweis → Schritt', () => {
  it('der Verweis eines UNTERschritts fällt dem Unterschritt zu, nicht der Dach-Bullet', () => {
    const md = [
      '## Die geordnete Abarbeitung',
      '<!-- @blockers',
      'b1: grund',
      '-->',
      `- [ ] **1 · Alpha** — **Detail:** ${verweis('§2')}`,
      `  ${META('W9·1-ALPHA')}`,
      `  - [ ] **1a · Beta** — **Detail:** ${verweis('§3')}`,
      `    ${META('W9·2-BETA')}`,
      '',
      'Siehe FAHRPLAN-PLAN-STEUERUNG.md.',
      '',
    ].join('\n');
    const v = sammleVerweise(md);
    expect(v.map((x) => `${x.id} ${x.anker}`)).toEqual(['W9·1-ALPHA §2', 'W9·2-BETA §3']);
    expect(lauf(md)).toEqual([]);
  });

  // Ehrliche Grenze (§8): ein freistehender §-Verweis nennt keine Datei. Welche
  // gemeint ist, wäre geraten — und eine Regel, die rät, meldet Falsches (§2).
  it('GRENZE: §-Nennung ohne Datei-Verweis wird nicht erfasst', () => {
    const md = plan('siehe §STRANG B (B-3) im Fahrplan');
    expect(sammleVerweise(md)).toEqual([]);
    expect(lauf(md)).toEqual([]);
  });

  it('GRENZE: Datei-Verweis ohne §-Anker wird nicht erfasst', () => {
    const md = plan(`[FAHRPLAN-ZIEL.md](${ZIEL_PFAD}) — massgeblich.`);
    expect(sammleVerweise(md)).toEqual([]);
  });

  // Anhang-Prosa der ROADMAP (Herkunfts- und Verortungs-Abschnitte) steht unter
  // eigenen Überschriften und gehört keinem Schritt. Eine Überschrift beendet den
  // Prosa-Block der Bullet — genau wie in Regel 10 und in `bindeCheckbox`.
  it('Verweis unter einer eigenen Überschrift gehört keinem Schritt mehr', () => {
    const md = plan(verweis('§2')) + `\n## Herkunft\n\nAnhang: [FAHRPLAN-ZIEL.md](${ZIEL_PFAD}) §9.\n`;
    expect(sammleVerweise(md).map((x) => x.id)).toEqual(['W9·1-ALPHA']);
    expect(lauf(md)).toEqual([]);
  });

  // Ehrliche Grenze (§8): ohne Überschrift, gleichrangige Bullet oder doppelte
  // Leerzeile endet der Prosa-Block NICHT — nachlaufende Zeilen fallen dann noch
  // dem letzten Schritt zu. Das ist dieselbe Blockgrenze wie in Regel 10; hier
  // festgehalten, damit niemand mehr Trennschärfe annimmt, als es gibt.
  it('GRENZE: lose Zeile ohne Trenner fällt noch dem letzten Schritt zu', () => {
    const md = plan(verweis('§2')) + `Anhang: [FAHRPLAN-ZIEL.md](${ZIEL_PFAD}) §9.\n`;
    expect(sammleVerweise(md).map((x) => x.id)).toEqual(['W9·1-ALPHA', 'W9·1-ALPHA']);
  });
});

describe('idTrifft — Wortgrenze statt Substring-Präsenz (CLAUDE.md §7)', () => {
  it('trifft die ID mit Wortgrenze', () => {
    expect(idTrifft('Spec zu `W9·1-ALPHA` im Wortlaut', 'W9·1-ALPHA')).toBe(true);
  });
  it('trifft NICHT als Präfix einer längeren ID', () => {
    expect(idTrifft('nur `W9·1-ALPHA-K1` behandelt', 'W9·1-ALPHA')).toBe(false);
  });
  it('trifft NICHT als Suffix einer längeren ID', () => {
    expect(idTrifft('nur `QS-CODE-TURSO` behandelt', 'CODE-TURSO')).toBe(false);
  });
});
