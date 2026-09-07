import { describe, expect, it } from 'vitest';
import { migriereOptFelder } from '../pages/gesetz-leser/leserOptionen';

// ─── MIGRATION alter gespeicherter Werte ────────────────────────────────────
//
// S1 (16.8.2026, FAHRPLAN-LESER-V3 Kap. 4f, Entscheide David F1/F2): der Store
// trug bis dahin ein DREIWERTIGES `hist` ('aus' | 'fussnoten' | 'chronologie')
// und einen Schalter `verweise`; danach drei zweiwertige Felder, darunter
// `histansicht: 'an' | 'aus'`. Diese Sätze bleiben stehen, was auch immer
// später gemessen wird (§0 Ziff. 2b) — sie beschreiben den Bestand, aus dem
// heute noch migriert wird.
//
// D35-F3 (Entscheid David 7.9.2026, «A und verlustfrei»): `fussnoten` und
// `histansicht` sind zu EINER dreiwertigen Wahl `vermerke` geworden
// ('fassung' | 'fussnoten' | 'aus'). Damit gibt es ZWEI Migrationsstufen im
// selben Speicher, und die zweite frisst die erste: ein Bestands-Speicher von
// vor S1 muss über `hist` → `histansicht` → `vermerke` durchlaufen.
//
// Warum das ein eigener Test ist und keine Zeile im Store: der Fall, der wehtut,
// ist ein BESTANDS-Speicher — und der ist im Browser nicht mehr nachstellbar,
// sobald er einmal überschrieben wurde. Wer «Chronologie» gewählt hatte, wollte
// die Änderungsvermerke SEHEN; ihn nach dem Update auf «aus» zu setzen, nähme
// ihm amtliche Substanz weg, die er ausdrücklich bestellt hat (§8). Umgekehrt
// darf ein unbekannter Wert NIE durchrutschen: er landete als
// `data-vermerke="…"` am <html>, wo keine Regel greift — die Radiogruppe stünde
// auf einer Stellung, die es nicht gibt.
//
// Rot zu bekommen (§6.7): in `migriereOptFelder` die 'chronologie'-Zeile auf
// 'aus' drehen (Fall «beide Alt-Darstellungen» wird rot), in `ausAltenSchaltern`
// die zwei Zeilen tauschen (die Vier-Felder-Tabelle wird rot), oder
// `VERMERKE_WAHLEN` durch eine `typeof === 'string'`-Prüfung ersetzen (der
// Unfug-Fall wird rot).
//
// DOM-frei und uhr-frei (§2): `migriereOptFelder` ist rein.

describe('D35-F3: zwei Bestands-Schalter → eine Dreier-Wahl', () => {
  // Die Tabelle IST Davids Entscheid vom 7.9.2026 (Notation fussnoten/histansicht).
  const TABELLE = [
    { fussnoten: 'an', histansicht: 'an', erwartet: 'fassung' },
    { fussnoten: 'aus', histansicht: 'an', erwartet: 'fassung' },
    { fussnoten: 'an', histansicht: 'aus', erwartet: 'fussnoten' },
    { fussnoten: 'aus', histansicht: 'aus', erwartet: 'aus' },
  ] as const;

  for (const f of TABELLE) {
    it(`fussnoten=${f.fussnoten} · histansicht=${f.histansicht} ⇒ «${f.erwartet}»`, () => {
      expect(migriereOptFelder({ fussnoten: f.fussnoten, histansicht: f.histansicht }).vermerke)
        .toBe(f.erwartet);
    });
  }

  it('eine schon gesetzte Wahl hat Vorrang vor den Alt-Schaltern', () => {
    // Ein Bestands-Rest kann aus einem anderen Tab oder einem alten Profil
    // stammen. Steht der neue Schlüssel da, ist er die Wahrheit — sonst zöge der
    // Alt-Rest die frische Wahl bei jedem Laden zurück (§8).
    expect(migriereOptFelder({ vermerke: 'aus', fussnoten: 'an', histansicht: 'an' }).vermerke).toBe('aus');
    expect(migriereOptFelder({ vermerke: 'fussnoten', histansicht: 'an' }).vermerke).toBe('fussnoten');
  });

  it('unbekannte Werte fallen auf die Vorgabe «fassung», ohne zu werfen', () => {
    const unfug: unknown[] = [
      undefined, null, 1, 0, true, 'Fassung', 'FUSSNOTEN', 'histansicht', '', {}, [], 'an',
    ];
    for (const wert of unfug) {
      expect(() => migriereOptFelder({ vermerke: wert }), `Wert: ${String(wert)}`).not.toThrow();
      expect(migriereOptFelder({ vermerke: wert }).vermerke, `Wert: ${String(wert)}`).toBe('fassung');
    }
  });

  // §6.3-DEKLARATION (D35-F2, 7.9.2026): der Fall hiess «… Rechtsprechung im
  // Kopf an» und prüfte `leitfaelle: 'an'`. Der Schalter ist ersatzlos
  // gestrichen (Herleitung in `leserOptionen.ts`); an seiner Stelle steht der
  // Grundzustand der Rubriken-Wahl, und die Aussage bleibt dieselbe: ein leerer
  // Speicher ergibt die Vorgabe, nichts Halbes.
  // §6.3-DEKLARATION (D40, 7.9.2026): der Grundzustand hat eine SECHSTE Rubrik
  // bekommen — `f` = Fassung, seit sie in der Funktionszeile am Artikelende
  // steht statt am Artikelkopf (David: «und wieso ist fassung nicht auch unten
  // am artikel?»). Die Aussage des Falls ist unverändert.
  it('leerer Speicher ⇒ Vorgabe: Fassung sichtbar, alle Rubriken am Artikel', () => {
    expect(migriereOptFelder({})).toEqual({ vermerke: 'fassung', fussRubriken: ['f', 'r', 'm', 'g', 'w', 'a'] });
  });

  it('das Ergebnis trägt GENAU die zwei heutigen Schlüssel', () => {
    // Die gestrichenen (`verweise`, `linien`, `zeitraum`, `hist`, `fussnoten`,
    // `histansicht`) dürfen nicht durchrutschen: jeder von ihnen landete sonst
    // als `data-<name>` am <html> und schaltete eine Regel, die es nicht gibt.
    const ergebnis = migriereOptFelder({
      verweise: 'aus', linien: 'auto', zeitraum: '10', hist: 'chronologie',
      fussnoten: 'aus', histansicht: 'aus', leitfaelle: 'aus',
    });
    // §6.3-DEKLARATION (D35-F2, 7.9.2026): `leitfaelle` ist selbst gestrichen
    // (Herleitung in `leserOptionen.ts`) und steht darum jetzt in der Liste der
    // Alt-Schlüssel, die NICHT durchrutschen dürfen; an seine Stelle tritt
    // `fussRubriken`. Die Aussage des Falls ist unverändert: aus dem
    // Bestands-Speicher kommt genau der Feldsatz heraus, den der Store führt.
    expect(Object.keys(ergebnis).sort()).toEqual(['fussRubriken', 'vermerke']);
  });
});

describe('S1-Migration: hist (dreiwertig) speist die Wahl weiter', () => {
  it('beide Alt-Darstellungen bedeuten «an» — «chronologie» ist keine Abwesenheit', () => {
    // Der entscheidende Fall. 'fussnoten' und 'chronologie' waren ZWEI
    // Darstellungen DERSELBEN Vermerke, nicht Vorhandensein vs. Abwesenheit.
    // «Vermerke sichtbar» ist seit D35-F3 die Stellung «Fassung».
    expect(migriereOptFelder({ hist: 'fussnoten' }).vermerke).toBe('fassung');
    expect(migriereOptFelder({ hist: 'chronologie' }).vermerke).toBe('fassung');
  });

  it('«aus» bleibt «aus» — eine getroffene Nutzerwahl kippt nicht still (§8)', () => {
    // hist=aus + fussnoten fehlt (⇒ galt als «an») ⇒ die Stellung «Fussnoten».
    expect(migriereOptFelder({ hist: 'aus' }).vermerke).toBe('fussnoten');
    // … und mit ebenfalls abgewähltem Apparat die Stellung «aus».
    expect(migriereOptFelder({ hist: 'aus', fussnoten: 'aus' }).vermerke).toBe('aus');
  });

  it('schon migrierter Speicher hat Vorrang vor dem Alt-Schlüssel', () => {
    expect(migriereOptFelder({ histansicht: 'aus', hist: 'chronologie' }).vermerke).toBe('fussnoten');
    expect(migriereOptFelder({ histansicht: 'an', hist: 'aus' }).vermerke).toBe('fassung');
  });

  it('unbekannte Alt-Werte fallen auf «Vermerke sichtbar», ohne zu werfen', () => {
    const unfug: unknown[] = [
      undefined, null, 1, 0, true, 'chronologisch', 'AUS', 'An', '', {}, [], 'fussnote',
    ];
    for (const wert of unfug) {
      expect(() => migriereOptFelder({ hist: wert }), `Wert: ${String(wert)}`).not.toThrow();
      expect(migriereOptFelder({ hist: wert }).vermerke, `Wert: ${String(wert)}`).toBe('fassung');
      // Auch am S1-Schlüssel darf nichts Unbekanntes durchrutschen.
      expect(migriereOptFelder({ histansicht: wert }).vermerke, `Wert: ${String(wert)}`).toBe('fassung');
    }
  });
});

describe('Migration: das unveränderte Feld und der reale Bestand', () => {
  // §6.3-DEKLARATION (D35-F2, 7.9.2026): der Fall hiess «leitfaelle wird
  // wortwörtlich übernommen». Das Feld ist ersatzlos gestrichen; an seiner
  // Stelle steht die Rubriken-Wahl, und für sie gilt dieselbe §8-Regel, die den
  // alten Fall trug — eine getroffene Nutzerwahl kippt nicht still.
  it('fussRubriken: fehlt der Schlüssel, steht alles; ein leeres Array bleibt leer', () => {
    // Jeder Bestands-Speicher vor D35-F2 hat den Schlüssel nicht — Grundzustand.
    expect(migriereOptFelder({}).fussRubriken).toEqual(['f', 'r', 'm', 'g', 'w', 'a']);
    // «Alles ausblenden» ist eine WAHL, kein fehlender Wert (§8) — im Speicher
    // von HEUTE (`stand: 2`) heisst leer auch leer.
    expect(migriereOptFelder({ fussRubriken: [], stand: 2 }).fussRubriken).toEqual([]);
  });

  // ── §6.3-DEKLARATION (D40, 7.9.2026) · DIE SECHSTE RUBRIK IM BESTAND ──────
  // `fussRubriken` trägt die GEWÄHLTEN. Ein neuer Buchstabe fehlt darum in
  // jedem Bestands-Speicher, und «fehlt» hiesse ohne diese Regel «abgewählt» —
  // die Fassungs-Auskunft wäre bei jedem Leser still verschwunden, der die
  // Rubriken je angefasst hat (§8). `stand` ist die einzige Frage dazu:
  // «konnte dieser Speicher `f` überhaupt kennen?»
  it('D40: ein Speicher ohne `stand` bekommt `f` dazu — auch der leere', () => {
    // Bestand mit vier abgewählten Rubriken: die Wahl bleibt, `f` kommt dazu.
    expect(migriereOptFelder({ fussRubriken: ['r', 'a'] }).fussRubriken).toEqual(['f', 'r', 'a']);
    // «Alles ausblenden» von vor D40 hiess «die FÜNF aus» — die Fassung stand
    // danach weiter am Artikelkopf. Getreu ist darum `['f']`, nicht `[]`.
    expect(migriereOptFelder({ fussRubriken: [] }).fussRubriken).toEqual(['f']);
    // Ein falscher Stand ist kein Stand (Whitelist, wie überall im Store).
    for (const unfug of [1, 3, '2', null, undefined] as unknown[]) {
      expect(migriereOptFelder({ fussRubriken: ['r'], stand: unfug }).fussRubriken,
        `stand: ${String(unfug)}`).toEqual(['f', 'r']);
    }
  });

  it('D40: mit `stand: 2` ist die Abwahl von `f` eine echte Abwahl', () => {
    // Sonst wäre die neue Menüzeile ein Schalter ohne Wirkung über den
    // Seitenwechsel hinaus — eine Wahl, die sich still zurückstellt (§8).
    expect(migriereOptFelder({ fussRubriken: ['r', 'm', 'g', 'w', 'a'], stand: 2 }).fussRubriken)
      .toEqual(['r', 'm', 'g', 'w', 'a']);
  });

  it('D40: `stand` selbst rutscht NICHT in den Zustand', () => {
    // Er ist Speicher-Buchführung, kein Options-Feld — als `data-stand` am
    // <html> wäre er eine Leiche ohne Regel (§17-Gegengewicht).
    expect(Object.keys(migriereOptFelder({ fussRubriken: ['r'], stand: 2 })).sort())
      .toEqual(['fussRubriken', 'vermerke']);
  });

  it('fussRubriken: unbekannte Buchstaben rutschen nicht durch, die Ordnung ist kanonisch', () => {
    // Ein unbekannter Buchstabe landete sonst als `data-fuss-aus="…"` am <html>,
    // wo keine Regel ihn kennt — dieselbe Whitelist-Sicherung wie bei `vermerke`.
    expect(migriereOptFelder({ fussRubriken: ['a', 'x', 'r', 42, null], stand: 2 }).fussRubriken)
      .toEqual(['r', 'a']);
    // Kein Array ⇒ Grundzustand, ohne zu werfen.
    for (const unfug of [null, 'frmgwa', 7, {}] as unknown[]) {
      expect(() => migriereOptFelder({ fussRubriken: unfug })).not.toThrow();
      expect(migriereOptFelder({ fussRubriken: unfug }).fussRubriken).toEqual(['f', 'r', 'm', 'g', 'w', 'a']);
    }
  });

  it('ein realer Bestands-Speicher (vor S1) migriert vollständig', () => {
    // Genau der Speicher, den ein Nutzer von vor S1 hat: alle Alt-Schlüssel
    // beisammen, inkl. der schon früher entfallenen `linien`/`zeitraum`.
    // `hist: 'chronologie'` ⇒ Vermerke sichtbar ⇒ «Fassung»; das abgewählte
    // `fussnoten` spielt in diesem Zweig keine Rolle mehr, weil es den
    // Apparat-Schalter nicht mehr gibt (Herleitung am Typ `VermerkeWahl`).
    const bestand = {
      fussnoten: 'aus', verweise: 'aus', leitfaelle: 'an',
      hist: 'chronologie', linien: 'auto', zeitraum: '10', schrift: 'gross',
    };
    // D35-F2: `leitfaelle: 'an'` im Bestand wird nicht mehr übernommen — das
    // Feld gibt es nicht mehr; die Rubriken-Wahl fehlt im Speicher und fällt
    // darum auf ihren Grundzustand.
    expect(migriereOptFelder(bestand)).toEqual({ vermerke: 'fassung', fussRubriken: ['f', 'r', 'm', 'g', 'w', 'a'] });
  });
});
