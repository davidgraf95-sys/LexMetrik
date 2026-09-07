// scripts/datenhaltung/nachfuehren.test.ts
// QS-BASIS (d) K5 — die Nachführ-Kette. Nachgereicht auf Gegenprüfungs-Befund F4
// (31.8.2026): K5 war ohne jeden Test gelandet.
//
// WAS HIER AUF DEM SPIEL STEHT. Die Kette hat genau zwei tragende Eigenschaften, und
// beide sind unsichtbar, solange alles gutgeht:
//   1. ABBRUCH — ein Fehlschlag schlägt DURCH (Exit-Code) und die Folgeschritte laufen
//      NICHT mehr. Liefe die Kette weiter, ginge ein Sync auf eine halb gebaute DB und
//      stellte einen falschen Index live — genau der Schaden, gegen den K5 gebaut ist.
//   2. ÜBERSPRINGEN — ohne Token bleiben die Turso-Schritte aus, aber LAUT und
//      namentlich, und der Lauf endet trotzdem mit 0 (§8: «nicht gelaufen» wird
//      ausgesprochen, nie als «in Ordnung» verkleidet).
//
// ZWEI EBENEN, mit Absicht:
//   · Die `fuehreKette`-Tests prüfen die Logik hermetisch — kein npm, kein Token, keine
//     Uhr, keine Umgebung. Sie können auf keiner Maschine anders ausfallen.
//   · Der Subprozess-Test prüft die eine Sache, die eine Attrappe nicht beweisen kann:
//     dass der ECHTE `lauf()` den Exit-Code eines wirklich gestarteten Skripts
//     weiterreicht. Dafür liegt ein `npm`-Stub im PATH; der Token spielt keine Rolle,
//     weil schon Schritt 1 (token-frei) scheitert.
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { spawnSync } from 'node:child_process';
import { chmodSync, mkdtempSync, rmSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fuehreKette, KETTE } from './nachfuehren';

const TOKEN_SCHRITTE = KETTE.filter((s) => s.braucht === 'token').map((s) => s.skript);

/** Attrappe: zählt die Aufrufe und lässt `fehlerBei` mit `code` scheitern. */
function attrappe(fehlerBei?: string, code = 7) {
  const aufrufe: string[] = [];
  return {
    aufrufe,
    fuehreAus: (skript: string) => {
      aufrufe.push(skript);
      return skript === fehlerBei ? code : 0;
    },
  };
}

const still = { log: () => {}, melde: () => {} };

describe('K5 Kette — ABBRUCH: ein Fehlschlag schlägt durch und stoppt die Reihenfolge', () => {
  it('Schritt 1 scheitert → Exit-Code durchgereicht, Schritte 2-4 laufen NICHT', () => {
    const a = attrappe('datenhaltung:build', 7);
    const r = fuehreKette({ token: true, nurPruefen: false, fuehreAus: a.fuehreAus, ...still });
    expect(r.code, 'Exit-Code des gescheiterten Schritts muss durchschlagen').toBe(7);
    expect(a.aufrufe).toEqual(['datenhaltung:build']);
    expect(r.gelaufen).toEqual(['datenhaltung:build']);
  });

  it('Schritt 2 scheitert → der Sync (Schritt 3) läuft NICHT auf die halbe DB', () => {
    // Der teuerste Fehlmodus in Worten: Manifest kaputt, Sync läuft trotzdem, falscher
    // Index steht live. Genau diese Reihenfolge wird hier festgenagelt.
    const a = attrappe('datenhaltung:manifest', 2);
    const r = fuehreKette({ token: true, nurPruefen: false, fuehreAus: a.fuehreAus, ...still });
    expect(r.code).toBe(2);
    expect(a.aufrufe).toEqual(['datenhaltung:build', 'datenhaltung:manifest']);
    for (const s of TOKEN_SCHRITTE) expect(a.aufrufe).not.toContain(s);
  });

  it('scheitert der Sync, läuft der Frische-Wächter nicht mehr (kein Grün auf einer Ruine)', () => {
    const a = attrappe('datenhaltung:turso-sync', 1);
    const r = fuehreKette({ token: true, nurPruefen: false, fuehreAus: a.fuehreAus, ...still });
    expect(r.code).toBe(1);
    expect(a.aufrufe).not.toContain('check:turso-frische');
  });

  it('läuft alles durch, ist der Code 0 und ALLE vier Schritte sind gefahren', () => {
    const a = attrappe();
    const r = fuehreKette({ token: true, nurPruefen: false, fuehreAus: a.fuehreAus, ...still });
    expect(r.code).toBe(0);
    expect(a.aufrufe).toEqual(KETTE.map((s) => s.skript));
    expect(r.uebersprungen).toEqual([]);
  });
});

describe('K5 Kette — ÜBERSPRINGEN: ohne Token laut, namentlich und trotzdem grün', () => {
  it('ohne Token laufen nur die token-freien Schritte', () => {
    const a = attrappe();
    const r = fuehreKette({ token: false, nurPruefen: false, fuehreAus: a.fuehreAus, ...still });
    expect(r.code, 'CI und jede Maschine ohne Token sollen die Kette fahren können').toBe(0);
    expect(a.aufrufe).toEqual(KETTE.filter((s) => s.braucht !== 'token').map((s) => s.skript));
  });

  it('das Übersprungene wird NAMENTLICH benannt, nicht bloss gezählt', () => {
    // Der Kern von §8: eine Kette, die stillschweigend die Hälfte auslässt, ist
    // schlimmer als gar keine — sie erzeugt das Gefühl, fertig zu sein.
    const zeilen: string[] = [];
    const r = fuehreKette({
      token: false,
      nurPruefen: false,
      fuehreAus: () => 0,
      log: (z) => zeilen.push(z),
      melde: () => {},
    });
    expect(r.uebersprungen.length).toBe(TOKEN_SCHRITTE.length);
    for (const s of TOKEN_SCHRITTE) {
      expect(r.uebersprungen.some((u) => u.startsWith(`${s} (`)), `«${s}» fehlt in der Restliste`).toBe(true);
      expect(zeilen.join('\n')).toContain(s);
    }
    const ausgabe = zeilen.join('\n');
    expect(ausgabe).toContain('Turso-Token FEHLT');
    expect(ausgabe).toContain('Kette TEILWEISE gelaufen');
    // Und der Weg zurück steht dabei, nicht nur die Klage.
    expect(ausgabe).toContain('TURSO_AUTH_TOKEN');
    expect(ausgabe).toContain('workflow_dispatch');
    // KEIN «grün: Kette vollständig durchlaufen» — das wäre die Lüge, um die es geht.
    expect(ausgabe).not.toContain('vollständig durchlaufen');
  });

  it('--pruefen lässt die SCHREIBENDEN Schritte aus und benennt sie als solche', () => {
    const a = attrappe();
    const r = fuehreKette({ token: true, nurPruefen: true, fuehreAus: a.fuehreAus, ...still });
    expect(r.code).toBe(0);
    expect(a.aufrufe).toEqual(KETTE.filter((s) => !s.schreibt).map((s) => s.skript));
    expect(r.uebersprungen.every((u) => u.includes('schreibend'))).toBe(true);
  });

  it('ohne Token UND --pruefen bleibt kein Schritt übrig — auch das wird gemeldet', () => {
    const a = attrappe();
    const r = fuehreKette({ token: false, nurPruefen: true, fuehreAus: a.fuehreAus, ...still });
    expect(a.aufrufe).toEqual([]);
    expect(r.code).toBe(0);
    expect(r.uebersprungen.length).toBe(KETTE.length);
  });
});

// ─── Subprozess: der ECHTE lauf() gegen einen npm-Stub ───────────────────────────────
describe('K5 Kette — der echte Aufrufweg reicht den Exit-Code eines Skripts durch', () => {
  let stubDir = '';
  let logDatei = '';

  beforeAll(() => {
    stubDir = mkdtempSync(join(tmpdir(), 'lexmetrik-nachfuehren-'));
    logDatei = join(stubDir, 'aufrufe.log');
    // `npm`-Stub: protokolliert `npm run <skript>` und lässt datenhaltung:build mit 7
    // scheitern. Der Token ist irrelevant — Schritt 1 braucht keinen und bricht ab,
    // bevor irgendein Turso-Schritt an die Reihe käme. Damit hängt dieser Test an
    // KEINER Eigenschaft der Maschine, auf der er läuft.
    const stub = join(stubDir, 'npm');
    writeFileSync(
      stub,
      '#!/bin/sh\n' +
        `echo "$@" >> "${logDatei}"\n` +
        'if [ "$2" = "datenhaltung:build" ]; then exit 7; fi\n' +
        'exit 0\n',
    );
    chmodSync(stub, 0o755);
  });

  afterAll(() => {
    if (stubDir) rmSync(stubDir, { recursive: true, force: true });
  });

  it('scheitert das gestartete Skript, endet nachfuehren mit DESSEN Code — und nur mit einem Aufruf', () => {
    const r = spawnSync('npx', ['vite-node', 'scripts/datenhaltung/nachfuehren.ts'], {
      encoding: 'utf8',
      env: { ...process.env, PATH: `${stubDir}:${process.env.PATH ?? ''}`, VITEST: '' },
    });
    expect(r.status, `stdout:\n${r.stdout}\nstderr:\n${r.stderr}`).toBe(7);
    expect(r.stdout + r.stderr).toContain('Kette abgebrochen');
    // Der Stub wurde GENAU EINMAL gerufen: Schritt 1. Ohne diese Zeile bliebe offen,
    // ob der Abbruch wirkte oder ob nur zufällig alles danach ebenfalls 7 lieferte.
    const aufrufe = existsSync(logDatei)
      ? readFileSync(logDatei, 'utf8').trim().split('\n').filter(Boolean)
      : [];
    expect(aufrufe).toEqual(['run datenhaltung:build']);
  }, 60_000);
});
