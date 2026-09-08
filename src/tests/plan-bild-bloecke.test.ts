// src/tests/plan-bild-bloecke.test.ts — die fünf Klartext-Blöcke der
// Lagebild-Hauptseite (Umbau «Lagebild schlank», Auftrag David 8.9.2026:
// «mach es schlanker und übersichtlicher für mich»).
//
// Alles hier ist REIN. Kein git, kein gh, keine Uhr: `lagebildInhalt` bekommt
// eine fertige `LagebildSicht`, und die Gate-Texte des Wortbudget-Tests kommen
// aus der ECHTEN ROADMAP.md über `parseRoadmap` — der Parser ist eine reine
// Funktion über einem String. Damit misst der Test den Code und nicht die
// Maschine, auf der er läuft (§6.7).
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { parseRoadmap } from '../../scripts/plan/parse';
import { resolve } from '../../scripts/plan/aufloesen';
import { schrittInfoAusRoadmap, davidFragen, davidFragenVerworfen, zielSatz } from '../../scripts/plan/bildDaten';
import {
  gateFeld,
  istDavidGate,
  istZurueckgestellt,
  klartextLabel,
  lageSaetze,
  sichtbareWorte,
} from '../../scripts/plan/bildHtml';
import { lagebildInhalt, type GateSicht, type LagebildSicht } from '../../scripts/plan/bildSeiten';

// ---------------------------------------------------------------------------
// David-Gate-Filter — welcher `@blockers`-Eintrag ist eine ENTSCHEIDUNG?
// ---------------------------------------------------------------------------
describe('istDavidGate — Entscheid oder blosser Ablauf-Vermerk', () => {
  it('erkennt die vier Marker, jeder im Bestand belegt', () => {
    expect(istDavidGate('… (PR #271). ECHTES David-Gate, kein Bau-Blocker.')).toBe(true);
    expect(istDavidGate('… Infrastruktur-Entscheid (Entscheid David 7.8.2026: «B als Schritt»)')).toBe(true);
    expect(istDavidGate('Nur deskriptiv; bewusste Freigabe Davids erforderlich (heikel: Standesrecht)')).toBe(true);
    expect(istDavidGate('Umsetzung wartet auf David')).toBe(true);
  });

  it('die ausdrückliche VERNEINUNG schlägt jeden Marker — Sequenz-Marker zählen nicht', () => {
    // Belegter Fall: `zh-tranche-laeuft` trägt das Wort «David-Gate» nur, um es
    // zu verneinen. Ohne diese Regel zählte die Seite Ablauf-Vermerke als offene
    // Entscheidungen und überzählte den Engpass.
    expect(istDavidGate('ZH-Programm läuft … Kein David-Gate — Sequenz-Marker für die Plan-Buchung.')).toBe(false);
    expect(istDavidGate('keine David-Gate-Frage, nur Reihenfolge')).toBe(false);
  });

  it('ein Sachblocker ohne Marker ist kein Entscheid', () => {
    expect(istDavidGate('Live-Rechtsprechung — CC-BY-SA vs. Art. 5 URG, CORS/Rate-Limits unbestätigt')).toBe(false);
    expect(istDavidGate('Zurückgestellt durch das Zielbild-Dekret — reine Reihenfolge-Entscheidung.')).toBe(false);
  });

  it('deckt die ECHTE ROADMAP ab: genau die Gates, die sich selbst so nennen', () => {
    const { blockers } = parseRoadmap(readFileSync('ROADMAP.md', 'utf8'));
    const namen = Object.entries(blockers).filter(([, txt]) => istDavidGate(txt)).map(([n]) => n);
    // Sequenz-Marker dürfen NIE dabei sein (Überzählungs-Befund 8.9.2026).
    expect(namen).not.toContain('zh-tranche-laeuft');
    expect(namen).not.toContain('zielbild-gesetzesleser');
    expect(namen.length).toBeGreaterThan(0);
  });
});

describe('istZurueckgestellt — kein falscher Druck bei bewusst liegen Gelassenem', () => {
  it('erkennt die Selbstauskunft des Gates', () => {
    expect(istZurueckgestellt('… «mach ich erst wenn UI noch optimierter wird» — bewusst zurückgestellt, nicht vergessen')).toBe(true);
    expect(istZurueckgestellt('A parken, geparkt bis Dezember')).toBe(true);
  });

  it('ein offener Entscheid bleibt offen', () => {
    expect(istZurueckgestellt('ECHTES David-Gate. Offene Entscheide: Fahrplan §11.9 (Go E1+E2 …)')).toBe(false);
  });
});

describe('gateFeld — Frage/Optionen/Empfehlung aus der Gate-Prosa', () => {
  const txt = 'Sollen die 74 Alt-Artikel in die Leiste? Optionen: ja, nein · Empfehlung: Nein (Alt-Recht bläht die Navigation).';
  it('liest ein vorhandenes Feld bis zum nächsten Trenner', () => {
    expect(gateFeld(txt, 'optionen')).toBe('ja, nein');
    expect(gateFeld(txt, 'empfehlung')).toBe('Nein (Alt-Recht bläht die Navigation).');
  });
  it('fehlendes Feld → null, nichts wird erfunden (§8)', () => {
    expect(gateFeld(txt, 'frage')).toBeNull();
    expect(gateFeld('reine Prosa ohne Felder', 'empfehlung')).toBeNull();
  });
});

describe('zielSatz — Ein-Satz-Ziel ohne den Herkunfts-Vermerk', () => {
  it('kappt die öffnende Klammer, wenn sie mit der Schritt-ID beginnt', () => {
    expect(zielSatz('(W2·13-KANTONE-DATEN, Aufteilung 8.8.2026) Skill korpus-werkstatt greift.', 'W2·13-KANTONE-DATEN')).toBe(
      'Skill korpus-werkstatt greift.',
    );
  });
  it('eine INHALTLICHE Klammer bleibt stehen — nichts wird blind abgeschnitten (§8)', () => {
    expect(zielSatz('(neu ab 2027) Tarife der Kantone nachführen.', 'W3-TARIF')).toBe('(neu ab 2027) Tarife der Kantone nachführen.');
  });
  it('leerer Wortlaut → null, kein leerer Halbsatz', () => {
    expect(zielSatz('', 'X')).toBeNull();
  });

  it('kein Schritt der ECHTEN @queue zeigt sein Kürzel im Ziel-Halbsatz', () => {
    const md = readFileSync('ROADMAP.md', 'utf8');
    const { queue } = parseRoadmap(md);
    const schritte = schrittInfoAusRoadmap(md);
    for (const id of queue.slice(0, 5)) {
      expect(zielSatz(schritte.get(id)?.prosa ?? '', id) ?? '').not.toContain(id);
    }
  });
});

// ---------------------------------------------------------------------------
// Block 1 — die drei Sätze
// ---------------------------------------------------------------------------
describe('lageSaetze — Block 1 in drei Sätzen', () => {
  const basis = { offen: 54, baubar: 34, imBau: 0, entscheide: 4, ampel: null, zuletzt: null };

  it('grüne Ampel, Zahlen und Entscheide — immer genau drei Sätze', () => {
    const s = lageSaetze({ ...basis, ampel: { gruen: true, name: 'CI', wann: '08.09.2026' }, zuletzt: { titel: 'BIBLIOTHEK', wann: '07.09.2026' } });
    expect(s).toHaveLength(3);
    expect(s[0]).toContain('gesund');
    expect(s[1]).toBe('54 Arbeitspakete sind offen — 34 davon könnten sofort starten, keines ist gerade im Bau.');
    expect(s[2]).toBe('4 Entscheidungen warten auf dich (gleich darunter). Zuletzt fertig geworden: «BIBLIOTHEK» (07.09.2026).');
  });

  it('rote Ampel sagt, dass sie allem anderen vorgeht', () => {
    expect(lageSaetze({ ...basis, ampel: { gruen: false, name: 'CI', wann: '08.09.2026' } })[0]).toContain('ROT');
  });

  it('ohne Ampel wird «unbekannt» gesagt, nicht «grün» geraten (§8)', () => {
    expect(lageSaetze(basis)[0]).toContain('lässt sich auf diesem Rechner nicht abfragen');
  });

  it('Einzahl und Null in Worten statt roher Ziffern', () => {
    const s = lageSaetze({ ...basis, offen: 1, baubar: 0, imBau: 1, entscheide: 0 });
    expect(s[1]).toBe('1 Arbeitspaket ist offen — keines davon könnte sofort starten, 1 ist gerade im Bau.');
    expect(s[2]).toBe('Nichts hält gerade auf deine Entscheidung.');
  });
});

// ---------------------------------------------------------------------------
// Wortbudget-Zähler
// ---------------------------------------------------------------------------
describe('sichtbareWorte — was beim Öffnen der Seite lesbar ist', () => {
  it('zählt Fliesstext, nicht Auszeichnung', () => {
    expect(sichtbareWorte('<p>drei kleine <b>Wörter</b></p>')).toBe(3);
  });
  it('Skript und Stylesheet zählen nicht — sie sind unsichtbar', () => {
    expect(sichtbareWorte('<p>zwei Wörter</p><script>const PROMPTS = {"a":"lange Prompt Prosa hier"};</script><style>body{color:red}</style>')).toBe(2);
  });
  it('von einem <details> zählt nur das <summary> — Eingeklapptes ist Angebot, nicht Last', () => {
    expect(sichtbareWorte('<details><summary>zwei Wörter</summary><p>eins zwei drei vier</p></details>')).toBe(2);
  });
  it('Entities zählen nicht als Wort', () => {
    expect(sichtbareWorte('<p>A &amp; B</p>')).toBe(2);
  });
});

describe('klartextLabel — Kürzel raus aus dem Fliesstext', () => {
  it('zeigt nur den Titel, das Kürzel steckt im Tooltip', () => {
    const h = klartextLabel('Entstehung am Artikel', 'W2·6c-ENTSTEHUNG-DATEN');
    expect(h).toBe('<b title="W2·6c-ENTSTEHUNG-DATEN">Entstehung am Artikel</b>');
    expect(sichtbareWorte(h)).toBe(3);
  });
  it('escapt Titel und Kürzel', () => {
    expect(klartextLabel('<script>', 'A"B', false)).toBe('<span title="A&quot;B">&lt;script&gt;</span>');
  });
});

// ---------------------------------------------------------------------------
// Block-Zusammenstellung
// ---------------------------------------------------------------------------
function gate(p: Partial<GateSicht> = {}): GateSicht {
  return {
    name: 'david-go-entstehung',
    text: 'ECHTES David-Gate. Offene Entscheide: Fahrplan §11.9.',
    pakete: [{ titel: 'Entstehung am Artikel — Daten', id: 'W2·6c-ENTSTEHUNG-DATEN', feld: 'korpus' }],
    zurueck: false,
    tage: 1,
    fahrplanPfad: 'fahrplaene/FAHRPLAN-MATERIALIEN.md',
    fahrplanName: 'Amtliche Materialien',
    par: '11',
    ...p,
  };
}

function sicht(p: Partial<LagebildSicht> = {}): LagebildSicht {
  return {
    zahlen: { offen: 54, baubar: 34, imBau: 0, entscheide: 1, ampel: { gruen: true, name: 'CI', wann: '08.09.2026' }, zuletzt: null },
    gates: [gate()],
    fragen: [],
    fragenVerworfen: 0,
    laeuft: [],
    laeuftRest: 0,
    worktrees: [],
    altBranches: 0,
    unangemeldet: [],
    ghFehlt: false,
    naechste: [],
    queueRest: 0,
    erledigt: [],
    bauLink: 'plan-bild-bau.html',
    methodeLink: 'plan-bild-methode.html',
    stand: '8. Sept. 2026, 01:30',
    watch: null,
    ...p,
  };
}

describe('lagebildInhalt — fünf Blöcke in fester Reihenfolge', () => {
  it('Entscheide stehen VOR allem anderen, dann läuft/nächstes/erledigt', () => {
    const h = lagebildInhalt(sicht());
    const pos = (id: string) => h.indexOf(`<section id="${id}"`);
    expect(pos('david')).toBeGreaterThan(-1);
    expect(pos('david')).toBeLessThan(pos('laeuft'));
    expect(pos('laeuft')).toBeLessThan(pos('queue'));
    expect(pos('queue')).toBeLessThan(pos('erledigt'));
  });

  it('zeigt die VOLLE Gate-Prosa — sie wurde bis 8.9.2026 geparst und weggeworfen', () => {
    const text = 'W2·6c-ENTSTEHUNG-* — David 6.9.2026: «noch keinen Code, nur planen». ECHTES David-Gate.';
    expect(lagebildInhalt(sicht({ gates: [gate({ text })] }))).toContain(
      'W2·6c-ENTSTEHUNG-* — David 6.9.2026: «noch keinen Code, nur planen». ECHTES David-Gate.',
    );
  });

  it('gruppiert nach GATE: drei Pakete an einem Gate sind EINE Entscheidung', () => {
    const h = lagebildInhalt(sicht({
      gates: [gate({ pakete: [
        { titel: 'Daten', id: 'A', feld: null },
        { titel: 'Leser', id: 'B', feld: null },
        { titel: 'Synopse', id: 'C', feld: null },
      ] })],
    }));
    expect(h.match(/<div class="gate">/g)).toHaveLength(1);
    expect(h).toContain('Daran hängen 3 Arbeitspakete:');
  });

  it('bei EINEM Paket entfällt die Wiederholungs-Zeile (Wortbudget)', () => {
    expect(lagebildInhalt(sicht())).not.toContain('Daran hängen');
  });

  it('«wartet seit N Tagen» nur, wenn das Gate nicht selbst zurückgestellt sagt', () => {
    expect(lagebildInhalt(sicht())).toContain('wartet seit 1 Tag ·');
    const ruhend = lagebildInhalt(sicht({ gates: [gate({ zurueck: true, tage: null })] }));
    expect(ruhend).not.toContain('wartet seit');
    expect(ruhend).toContain('1 Entscheid ist bewusst zurückgestellt');
    expect(ruhend).toContain('<details');
  });

  it('meldet unlesbare @david-fragen-Zeilen, statt sie stumm zu schlucken (§8)', () => {
    const h = lagebildInhalt(sicht({ fragenVerworfen: 1 }));
    expect(h).toContain('1 Frage konnte nicht gelesen werden');
    expect(h).toContain('@david-fragen');
  });

  it('ohne Entscheid steht der ehrliche Satz statt einer leeren Fläche', () => {
    expect(lagebildInhalt(sicht({ gates: [] }))).toContain('Nichts — im Moment hält kein Arbeitspaket auf deine Entscheidung.');
  });

  it('Fahrplan-Verweis zeigt relativ aus tmp/ heraus auf die Detail-Spec', () => {
    expect(lagebildInhalt(sicht())).toContain('<a href="../fahrplaene/FAHRPLAN-MATERIALIEN.md">Detail: Amtliche Materialien §11</a>');
  });

  it('«Läuft gerade» zeigt höchstens die übergebenen Zeilen und verweist auf den Rest', () => {
    const h = lagebildInhalt(sicht({
      laeuft: [{ titel: 'Kantone', id: 'W2·13', feld: 'korpus', statuswort: 'läuft · Checks grün', punkt: 'wip', prNummer: 646, prUrl: 'https://github.com/x/y' }],
      laeuftRest: 2,
    }));
    expect(h).toContain('<b title="W2·13">Kantone</b>');
    expect(h).toContain('läuft · Checks grün');
    expect(h).toContain('<a href="https://github.com/x/y/pull/646">Antrag #646</a>');
    expect(h).toContain('… und 2 weitere unter <a href="plan-bild-bau.html">Bau-Details</a>');
  });

  it('Statuswort «Problem» bekommt den roten Punkt', () => {
    const h = lagebildInhalt(sicht({ laeuft: [{ titel: 'PR', id: null, feld: null, statuswort: 'Problem: Prüfungen rot', punkt: 'block', prNummer: 5, prUrl: null }] }));
    expect(h).toContain('<span class="s block"></span>');
    expect(h).toContain('Problem: Prüfungen rot');
  });

  it('«Als Nächstes» trägt das Kürzel NUR im Tooltip, nie im Fliesstext', () => {
    const h = lagebildInhalt(sicht({
      naechste: [{ titel: 'Kantone: ZH-Programm', id: 'W2·13-KANTONE-DATEN', feld: 'korpus', ziel: 'Randtitel R1 landen.', status: 'baubar' }],
      queueRest: 7,
    }));
    expect(h).toContain('<b title="W2·13-KANTONE-DATEN">Kantone: ZH-Programm</b>');
    // Sichtbar (ohne Attribute) darf das Kürzel nicht vorkommen.
    expect(h.replace(/<[^>]+>/g, ' ')).not.toContain('W2·13-KANTONE-DATEN');
    expect(h).toContain('7 weitere warten');
  });

  it('«Erledigt»: null heisst «nicht abfragbar», leere Liste heisst «nichts» (§8)', () => {
    expect(lagebildInhalt(sicht({ erledigt: null }))).toContain('lässt sich auf diesem Rechner gerade nicht abfragen');
    expect(lagebildInhalt(sicht({ erledigt: [] }))).toContain('Noch nichts fertig geworden.');
    expect(lagebildInhalt(sicht({ erledigt: [{ titel: 'BIBLIOTHEK', wann: '07.09.2026', nummer: 738, url: null }] }))).toContain('BIBLIOTHEK');
  });

  it('escapt Fremdtext aus Gate-Prosa und Titeln (HTML-Injektion)', () => {
    const h = lagebildInhalt(sicht({ gates: [gate({ text: '<script>alert(1)</script> & mehr' })] }));
    expect(h).toContain('&lt;script&gt;alert(1)&lt;/script&gt; &amp; mehr');
    expect(h).not.toContain('<script>alert(1)');
  });

  it('bleibt bei gleicher Sicht byte-gleich (Determinismus, §2)', () => {
    const d = sicht({ laeuft: [{ titel: 'A', id: 'X', feld: 'design', statuswort: 'läuft', punkt: 'wip', prNummer: null, prUrl: null }] });
    expect(lagebildInhalt(d)).toBe(lagebildInhalt(d));
  });
});

// ---------------------------------------------------------------------------
// Das Wortbudget — der eigentliche Zweck des Umbaus
//
// Gemessen wird die ECHTE Textlast: Gate-Prosa, Schritt-Titel und Ein-Satz-Ziele
// stammen aus ROADMAP.md (rein geparst), die git-/gh-Anteile werden mit einer
// VOLLEN Belegung gestellt — fünf laufende Zeilen, fünf erledigte, jede
// Warteschlangen-Zeile mit Ziel. Der Test misst damit den ungünstigsten
// realistischen Fall, nicht den zufällig gerade leeren Bau-Stand.
//
// Ausgangslage 8.9.2026: 1714 sichtbare Wörter. Ziel des Auftrags: ~500.
// ---------------------------------------------------------------------------
const WORTBUDGET = 600;

function sichtAusEchterRoadmap(): LagebildSicht {
  const md = readFileSync('ROADMAP.md', 'utf8');
  const { einheiten, blockers, queue } = parseRoadmap(md);
  const b = resolve(einheiten, queue);
  const schritte = schrittInfoAusRoadmap(md);
  const titel = (id: string) => schritte.get(id)?.titel ?? id;
  const byId = new Map(einheiten.map((e) => [e.id, e]));
  const haengtAn = new Map<string, string[]>();
  for (const x of b.blockiert) haengtAn.set(x.blocker, [...(haengtAn.get(x.blocker) ?? []), x.id]);

  const gates: GateSicht[] = Object.entries(blockers)
    .filter(([, txt]) => istDavidGate(txt))
    .map(([name, text]) => {
      const ids = haengtAn.get(name) ?? [];
      const fp = ids.length ? (byId.get(ids[0])?.etikett.fahrplan ?? null) : null;
      return {
        name,
        text,
        pakete: ids.map((id) => ({ titel: titel(id), id, feld: byId.get(id)?.etikett.feld ?? null })),
        zurueck: istZurueckgestellt(text),
        tage: istZurueckgestellt(text) ? null : 49,
        fahrplanPfad: fp,
        fahrplanName: fp ? 'Detailplan' : null,
        par: '11',
      };
    });

  const naechste = queue.slice(0, 5).map((id) => ({
    titel: titel(id),
    id,
    feld: byId.get(id)?.etikett.feld ?? null,
    ziel: (schritte.get(id)?.prosa ?? '').slice(0, 95) || null,
    status: 'baubar' as const,
  }));

  return {
    zahlen: { offen: einheiten.length, baubar: b.readyNow.length, imBau: 3, entscheide: gates.length, ampel: { gruen: true, name: 'CI · Tore + Build', wann: '08.09.2026, 01:20' }, zuletzt: { titel: 'BIBLIOTHEK: Legilux-Sichtung', wann: '07.09.2026' } },
    gates,
    fragen: davidFragen(md),
    fragenVerworfen: davidFragenVerworfen(md),
    laeuft: Array.from({ length: 5 }, (_, i) => ({
      titel: 'Kantonale Erlasse — ZH-Programm, Tranche B',
      id: `W2·13-KANTONE-${i}`,
      feld: 'korpus',
      statuswort: 'läuft · Checks laufen',
      punkt: 'wip' as const,
      prNummer: 600 + i,
      prUrl: 'https://github.com/x/y',
    })),
    laeuftRest: 2,
    worktrees: ['lagebild-schlank', 'agent-abc'],
    altBranches: 4,
    unangemeldet: [],
    ghFehlt: false,
    naechste,
    queueRest: Math.max(0, queue.length - naechste.length),
    erledigt: Array.from({ length: 5 }, (_, i) => ({ titel: 'BIBLIOTHEK: private Luxemburger Plattformen vertieft', wann: '07.09.2026', nummer: 730 + i, url: 'https://github.com/x/y' })),
    bauLink: 'plan-bild-bau.html',
    methodeLink: 'plan-bild-methode.html',
    stand: '8. Sept. 2026, 01:30',
    watch: null,
  };
}

describe(`Wortbudget der Hauptseite — höchstens ${WORTBUDGET} sichtbare Wörter`, () => {
  it('die echte ROADMAP-Last bleibt im Budget', () => {
    const worte = sichtbareWorte(lagebildInhalt(sichtAusEchterRoadmap()));
    expect(
      worte,
      `Die Hauptseite trägt ${worte} sichtbare Wörter (Budget ${WORTBUDGET}). Sie war am 8.9.2026 auf ~550 geschrumpft; ` +
        'wächst sie zurück, gehört der neue Inhalt auf «Bau-Details» oder hinter ein <details> — nicht auf die Einstiegsseite.',
    ).toBeLessThanOrEqual(WORTBUDGET);
  });

  it('das Budget KANN reissen — ein Tor, das nicht scheitern kann, wäre keines (§6.7)', () => {
    const aufgeblaeht = sichtAusEchterRoadmap();
    aufgeblaeht.gates = [...aufgeblaeht.gates, ...aufgeblaeht.gates];
    expect(sichtbareWorte(lagebildInhalt(aufgeblaeht))).toBeGreaterThan(WORTBUDGET);
  });
});
