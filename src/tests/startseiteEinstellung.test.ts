import { describe, it, expect, beforeEach } from 'vitest';
import {
  __zustandVergessen, abonniere, auswerten, istWerkseinstellung, mische, schalte,
  schnappschuss, setzeZurueck, speichere, STARTSEITE_KEY, verschiebe, werkseinstellung,
  type StartModulVorgabe,
} from '../lib/startseiteEinstellung';
import { START_MODULE } from '../lib/startseiteModule';

// ─── Der Nutzer-Zustand der Startseite (W2·24-R10) ──────────────────────────
//
// NEUER WÄCHTER (§6.3-Deklaration: neue Prüfung zu einem neuen Verhalten, kein
// angepasster Alt-Test). Geprüft wird die REINE Mischung — Registry-Vorgaben +
// Speicherstand → Anordnung — und die drei Regeln, die sie deterministisch
// machen (Dateikopf `lib/startseiteEinstellung.ts`). Sie sind der Grund, warum
// ein alter, fremder oder halb geschriebener Speichereintrag die Startseite nie
// verstümmeln kann.
//
// ROT-PROBE (§6.7, ausgeführt 6.9.2026, jeder Fall einzeln):
//   · Regel 1 aufgehoben (`if (!bekannt.has(id) …)` → `if (gesehen.has(id))`):
//     «unbekanntes Kürzel fällt weg» rot — die Geisterzeile «alt-modul» stand
//     in der Anordnung.
//   · Umlauf statt Anschlag in `verschiebe` (`if (j < 0) j = posten.length - 1`):
//     «am Rand passiert nichts» rot.
//   · Ersatzspeicher entfernt (`speichere` bricht bei Wurf ab): «wirkt auch,
//     wenn localStorage sperrt» rot.
// Ohne diese drei Ausdrücke kann der Wächter also scheitern — er ist kein Tor,
// das immer grün ist.

const VORGABEN: StartModulVorgabe[] = [
  { id: 'a', standard: true },
  { id: 'b', standard: false },
  { id: 'c', standard: true },
];

/** Speicher-Attrappe; `werfen` simuliert privaten Modus / volles Kontingent. */
function speicherAttrappe(werfen = false) {
  const daten = new Map<string, string>();
  globalThis.localStorage = {
    getItem: (k: string) => daten.get(k) ?? null,
    setItem: (k: string, v: string) => {
      if (werfen) throw new Error('QuotaExceededError');
      daten.set(k, v);
    },
    removeItem: (k: string) => void daten.delete(k),
    clear: () => daten.clear(),
    key: () => null,
    length: 0,
  } as unknown as Storage;
  return daten;
}

beforeEach(() => {
  __zustandVergessen();
  speicherAttrappe();
  // `melde()` braucht ein window; in der Node-Umgebung reicht eine Attrappe.
  if (typeof globalThis.window === 'undefined') {
    (globalThis as { window?: unknown }).window = {
      dispatchEvent: () => true,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
    };
  }
});

describe('mische — deterministische Anordnung aus Vorgaben + Speicherstand', () => {
  it('ohne Speicherstand gilt die Werkseinstellung (Registry-Ordnung, `standard`)', () => {
    expect(mische(VORGABEN, null)).toEqual(werkseinstellung(VORGABEN));
    expect(werkseinstellung(VORGABEN)).toEqual([
      { id: 'a', an: true }, { id: 'b', an: false }, { id: 'c', an: true },
    ]);
  });

  it('Regel 1 — ein unbekanntes Kürzel im Speicher fällt weg (keine Geisterzeile)', () => {
    const anordnung = mische(VORGABEN, { reihenfolge: ['c', 'alt-modul', 'a', 'b'], an: ['c', 'alt-modul'] });
    expect(anordnung.map((p) => p.id)).toEqual(['c', 'a', 'b']);
  });

  it('Regel 2 — ein doppeltes Kürzel zählt einmal, das erste Vorkommen bestimmt den Platz', () => {
    const anordnung = mische(VORGABEN, { reihenfolge: ['b', 'a', 'b', 'c'], an: ['b'] });
    expect(anordnung.map((p) => p.id)).toEqual(['b', 'a', 'c']);
  });

  it('Regel 3 — ein NEUES Modul hängt hinten an und trägt seine Werkseinstellung', () => {
    const anordnung = mische(VORGABEN, { reihenfolge: ['c', 'a'], an: ['a'] });
    expect(anordnung).toEqual([
      { id: 'c', an: false }, { id: 'a', an: true }, { id: 'b', an: false },
    ]);
  });

  it('die Sichtbarkeit kommt AUS dem Speicherstand, nicht aus `standard`', () => {
    const anordnung = mische(VORGABEN, { reihenfolge: ['a', 'b', 'c'], an: ['b'] });
    expect(anordnung).toEqual([
      { id: 'a', an: false }, { id: 'b', an: true }, { id: 'c', an: false },
    ]);
  });

  it('gleiche Eingabe → gleiche Ausgabe (§2)', () => {
    const roh = { reihenfolge: ['c', 'b', 'a'], an: ['c'] };
    expect(mische(VORGABEN, roh)).toEqual(mische(VORGABEN, roh));
  });
});

describe('auswerten — kaputte Speicherstände werden zur Werkseinstellung', () => {
  it.each([
    ['kein Eintrag', null],
    ['kein JSON', '{nicht json'],
    ['falsche Gestalt', '{"foo":1}'],
    ['Skalar', '"text"'],
    ['Listen fehlen', '{"reihenfolge":"a","an":[]}'],
  ])('%s → null', (_name, roh) => {
    expect(auswerten(roh as string | null)).toBeNull();
  });

  it('Fremdtypen in den Listen werden ausgesiebt, der Rest bleibt', () => {
    expect(auswerten('{"reihenfolge":["a",7,null,"b"],"an":["a",{}]}'))
      .toEqual({ reihenfolge: ['a', 'b'], an: ['a'] });
  });
});

describe('schalte / verschiebe — reine Bearbeitungsschritte', () => {
  const start = werkseinstellung(VORGABEN);

  it('schalte kippt genau ein Modul und lässt die Ordnung stehen', () => {
    const neu = schalte(start, 'a');
    expect(neu.map((p) => p.id)).toEqual(['a', 'b', 'c']);
    expect(neu.find((p) => p.id === 'a')?.an).toBe(false);
    expect(neu.find((p) => p.id === 'c')?.an).toBe(true);
  });

  it('schalte mit unbekanntem Kürzel ändert nichts', () => {
    expect(schalte(start, 'gibtsnicht')).toEqual(start);
  });

  it('verschiebe tauscht mit dem Nachbarn', () => {
    expect(verschiebe(start, 'b', -1).map((p) => p.id)).toEqual(['b', 'a', 'c']);
    expect(verschiebe(start, 'b', 1).map((p) => p.id)).toEqual(['a', 'c', 'b']);
  });

  it('am Rand passiert nichts — KEIN Umlauf (ein Pfeilklick meint einen Platz)', () => {
    expect(verschiebe(start, 'a', -1).map((p) => p.id)).toEqual(['a', 'b', 'c']);
    expect(verschiebe(start, 'c', 1).map((p) => p.id)).toEqual(['a', 'b', 'c']);
  });

  it('istWerkseinstellung erkennt Ordnungs- UND Sichtbarkeits-Abweichung', () => {
    expect(istWerkseinstellung(VORGABEN, start)).toBe(true);
    expect(istWerkseinstellung(VORGABEN, schalte(start, 'a'))).toBe(false);
    expect(istWerkseinstellung(VORGABEN, verschiebe(start, 'a', 1))).toBe(false);
  });
});

describe('Speicher — schreiben, lesen, zurücksetzen', () => {
  it('speichere → schnappschuss liest denselben Stand zurück', () => {
    const daten = speicherAttrappe();
    speichere(schalte(werkseinstellung(VORGABEN), 'b'));
    expect(daten.get(STARTSEITE_KEY)).toBe('{"reihenfolge":["a","b","c"],"an":["a","b","c"]}');
    expect(schnappschuss(VORGABEN).find((p) => p.id === 'b')?.an).toBe(true);
  });

  it('gespeichert werden NUR Kürzel — nie Inhalte (Berufsgeheimnis)', () => {
    const daten = speicherAttrappe();
    speichere(werkseinstellung(VORGABEN));
    const roh = daten.get(STARTSEITE_KEY)!;
    expect(Object.keys(JSON.parse(roh))).toEqual(['reihenfolge', 'an']);
  });

  it('setzeZurueck löscht den Eintrag (statt die Vorgabe hineinzuschreiben)', () => {
    const daten = speicherAttrappe();
    speichere(verschiebe(werkseinstellung(VORGABEN), 'a', 1));
    setzeZurueck();
    expect(daten.has(STARTSEITE_KEY)).toBe(false);
    expect(schnappschuss(VORGABEN)).toEqual(werkseinstellung(VORGABEN));
  });

  it('der Schalter wirkt auch, wenn localStorage sperrt (privater Modus, §6.7)', () => {
    speicherAttrappe(true); // jeder setItem wirft
    __zustandVergessen();
    speichere(schalte(werkseinstellung(VORGABEN), 'a'));
    expect(schnappschuss(VORGABEN).find((p) => p.id === 'a')?.an).toBe(false);
  });

  it('schnappschuss liefert bei unverändertem Speicher DIESELBE Referenz (useSyncExternalStore)', () => {
    speicherAttrappe();
    expect(schnappschuss(VORGABEN)).toBe(schnappschuss(VORGABEN));
  });

  it('abonniere hängt sich ein und wieder aus', () => {
    const gehoert: string[] = [];
    (globalThis as { window?: unknown }).window = {
      dispatchEvent: () => true,
      addEventListener: (n: string) => gehoert.push(`+${n}`),
      removeEventListener: (n: string) => gehoert.push(`-${n}`),
    };
    abonniere(() => undefined)();
    expect(gehoert).toEqual(['+lm:startseite', '+storage', '-lm:startseite', '-storage']);
  });
});

describe('Registry — die Werkseinstellung des Pults (Vorgabe David 6.9.2026)', () => {
  it('offen: Systematik, Frist, Entscheide — zu, aber verfügbar: Kantone, Behörden', () => {
    const werk = Object.fromEntries(START_MODULE.map((m) => [m.id, m.standard]));
    expect(werk).toEqual({
      systematik: true, kantone: false, frist: true, entscheide: true, behoerden: false,
    });
  });

  it('jedes Modul trägt Titel und Register genau einmal (§5)', () => {
    for (const m of START_MODULE) {
      expect(m.titel.length, `${m.id}: Titel`).toBeGreaterThan(0);
      expect(['g', 'r', 'm', 'w'], `${m.id}: Register`).toContain(m.reg);
    }
    expect(new Set(START_MODULE.map((m) => m.id)).size).toBe(START_MODULE.length);
  });
});
