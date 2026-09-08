import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

// QS-AUTOMATIK (8.9.2026) — Tor über das Vercel-Aufräumen (Deployment Storage).
//
// ANLASS (belegt, kein Vorsorge-Tor): Vercel-Nutzungsseite des Teams
// `david-legal-projects` am 8.9.2026 — Deployment Storage 261.91 GB gegen die
// Hobby-Grenze von 10 GB, 100 % davon Projekt `lexmetrik`; ein Stand (`dist`)
// wiegt 738 MB bei 18 321 Dateien, bei 10–20 Landungen pro Tag. Die
// Aufbewahrungsfrist «1 day» allein reicht nicht, weil Vercel per Ausnahme
// immer die letzten 20 Produktions-Deployments und die letzten 10 Deployments
// behält (~15 GB).
//
// Das Risiko dieses Aufräumers ist NICHT «zu wenig gelöscht», sondern «zu viel»:
// löscht er den eben ausgelieferten Stand oder den Alias-Träger, ist Prod weg.
// Darum prüft die Fixture jede Schutzregel EINZELN — jeder Eintrag ist so
// gebaut, dass ihn genau eine Regel rettet.
//
// Reine Betriebs-Prüfung, kein Rechts-/Rechen-/Norm-Pfad.

const WURZEL = new URL('../../', import.meta.url).pathname;

interface Deployment {
  uid: string;
  url: string;
  created: number;
  state: string;
  target: string | null;
}

interface Optionen {
  jetzt: number;
  aktuellId?: string;
  aktuellUrl?: string;
  produktionsAliasId?: string;
  behalteProd?: number;
  mindestAlterMs?: number;
}

// Die ECHTE Datei wird importiert, nicht abgetippt. Der Spezifizierer läuft
// bewusst über eine Variable: `scripts/` liegt ausserhalb von
// `tsconfig.app.json` (`include: ["src"]`), ein Literal-Import wäre für
// `tsc -b` unauflösbar.
const modulPfad = new URL('../../scripts/betrieb/vercel-aufraeumen.mjs', import.meta.url).href;

interface HauptlaufErgebnis {
  exitCode: number;
  geloescht: number;
  behalten: number;
  fehler: number;
  uebrig: number;
  zeilen: string[];
}

interface FakeAntwort {
  ok: boolean;
  status: number;
  json: () => Promise<unknown>;
}

interface HauptlaufAbhaengigkeiten {
  fetch: (
    url: string,
    optionen?: { method?: string; headers?: Record<string, string>; signal?: AbortSignal },
  ) => Promise<FakeAntwort>;
  env: Record<string, string | undefined>;
  jetzt: number;
  warten: (ms: number) => Promise<void>;
}

const { waehleZuLoeschen, hauptlauf } = (await import(/* @vite-ignore */ modulPfad)) as {
  waehleZuLoeschen: (deployments: Deployment[], optionen: Optionen) => Deployment[];
  hauptlauf: (abhaengigkeiten?: Partial<HauptlaufAbhaengigkeiten>) => Promise<HauptlaufErgebnis>;
};

const STUNDE = 3_600_000;
const JETZT = 1_757_000_000_000; // fixer Bezugspunkt — §2: kein Date.now() im Test

function d(
  uid: string,
  alterStunden: number,
  target: string | null,
  state: string,
  url = `${uid}.vercel.app`,
): Deployment {
  return { uid, url, created: JETZT - alterStunden * STUNDE, state, target };
}

/**
 * Fixture: jeder BEHALTEN-Eintrag hängt an genau einer Schutzregel.
 * `dpl_alias` ist absichtlich ein ALTER Produktions-Stand (40 h, sechstneuster)
 * — nur die Alias-Regel rettet ihn. `dpl_aktuell` ist absichtlich uralt und
 * kein Produktions-Ziel — nur der Url-Vergleich rettet ihn.
 */
const FIXTURE: Deployment[] = [
  d('dpl_prod1', 2, 'production', 'READY'), // (c) neuster Prod-Stand
  d('dpl_prod2', 5, 'production', 'READY'), // (c)
  d('dpl_prod3', 10, 'production', 'READY'), // (c)
  d('dpl_prod4', 20, 'production', 'READY'), // → löschen (4. Prod)
  d('dpl_prod5', 30, 'production', 'READY'), // → löschen (5. Prod)
  d('dpl_alias', 40, 'production', 'READY'), // (b) trägt den Produktions-Alias
  d('dpl_prev1', 8, 'preview', 'READY'), // → löschen
  d('dpl_prev2', 50, null, 'READY'), // → löschen (target null)
  d('dpl_err', 12, null, 'ERROR'), // → löschen
  d('dpl_build', 6, 'production', 'BUILDING'), // (e) nicht final
  d('dpl_jung', 0.5, 'preview', 'READY'), // (d) jünger als 1 h
  d('dpl_aktuell', 80, 'preview', 'READY', 'lexmetrik-aktuell.vercel.app'), // (a)
];

const OPT: Optionen = {
  jetzt: JETZT,
  aktuellUrl: 'https://lexmetrik-aktuell.vercel.app',
  produktionsAliasId: 'dpl_alias',
  behalteProd: 3,
  mindestAlterMs: STUNDE,
};

function ids(liste: Deployment[]): string[] {
  return liste.map((x) => x.uid).sort();
}

describe('waehleZuLoeschen — Auswahl der zu löschenden Vercel-Stände', () => {
  it('löscht genau die fünf entbehrlichen Stände, keinen mehr', () => {
    expect(ids(waehleZuLoeschen(FIXTURE, OPT))).toEqual(
      ['dpl_err', 'dpl_prev1', 'dpl_prev2', 'dpl_prod4', 'dpl_prod5'].sort(),
    );
  });

  it('(a) das eben ausgelieferte Deployment wird nie gelöscht — Url mit https://', () => {
    expect(ids(waehleZuLoeschen(FIXTURE, OPT))).not.toContain('dpl_aktuell');
  });

  it('(a) Url-Toleranz: ohne Protokoll und mit Schrägstrich am Ende gleich wirksam', () => {
    for (const url of [
      'lexmetrik-aktuell.vercel.app',
      'https://lexmetrik-aktuell.vercel.app/',
      'HTTPS://LEXMETRIK-AKTUELL.VERCEL.APP',
    ]) {
      expect(ids(waehleZuLoeschen(FIXTURE, { ...OPT, aktuellUrl: url }))).not.toContain(
        'dpl_aktuell',
      );
    }
  });

  it('(a) auch die Id allein schützt — ohne jede Url', () => {
    const ohneUrl = { ...OPT, aktuellUrl: '', aktuellId: 'dpl_prod4' };
    const geloescht = ids(waehleZuLoeschen(FIXTURE, ohneUrl));
    expect(geloescht).not.toContain('dpl_prod4');
    // Gegenprobe: ohne Schutz WÄRE dpl_prod4 gelöscht worden — der Test kann
    // also scheitern (§6.7).
    expect(ids(waehleZuLoeschen(FIXTURE, { ...OPT, aktuellUrl: '' }))).toContain('dpl_prod4');
  });

  it('(b) der Alias-Träger wird nie gelöscht, auch als alter Stand nicht', () => {
    expect(ids(waehleZuLoeschen(FIXTURE, OPT))).not.toContain('dpl_alias');
    // Gegenprobe: ohne Alias-Angabe fällt derselbe Eintrag (6. Prod-Stand).
    expect(ids(waehleZuLoeschen(FIXTURE, { ...OPT, produktionsAliasId: '' }))).toContain(
      'dpl_alias',
    );
  });

  it('(c) die drei neuesten Produktions-Stände bleiben', () => {
    const geloescht = ids(waehleZuLoeschen(FIXTURE, OPT));
    for (const behalten of ['dpl_prod1', 'dpl_prod2', 'dpl_prod3']) {
      expect(geloescht).not.toContain(behalten);
    }
  });

  it('(d) alles jünger als die Mindestalter-Grenze bleibt', () => {
    expect(ids(waehleZuLoeschen(FIXTURE, OPT))).not.toContain('dpl_jung');
    // Gegenprobe mit Grenze 0: dann ist die Jugend kein Schutz mehr.
    expect(ids(waehleZuLoeschen(FIXTURE, { ...OPT, mindestAlterMs: 0 }))).toContain('dpl_jung');
  });

  it('(e) ein noch bauendes Deployment wird nie angefasst', () => {
    for (const state of ['BUILDING', 'QUEUED', 'INITIALIZING']) {
      const liste = FIXTURE.map((x) => (x.uid === 'dpl_build' ? { ...x, state } : x));
      expect(ids(waehleZuLoeschen(liste, OPT))).not.toContain('dpl_build');
    }
  });

  it('leere Liste ⇒ leeres Ergebnis', () => {
    expect(waehleZuLoeschen([], OPT)).toEqual([]);
  });

  it('weniger als drei Produktions-Stände ⇒ kein Produktions-Stand wird gelöscht', () => {
    const knapp: Deployment[] = [
      d('dpl_a', 100, 'production', 'READY'),
      d('dpl_b', 200, 'production', 'READY'),
      d('dpl_c', 300, 'preview', 'READY'),
    ];
    expect(ids(waehleZuLoeschen(knapp, { jetzt: JETZT, behalteProd: 3, mindestAlterMs: STUNDE })))
      .toEqual(['dpl_c']);
  });

  it('ein BUILDING-Produktionsstand zählt nicht als einer der drei behaltenen', () => {
    // Sonst schützte ein hängender Build einen alten Stand und verdrängte einen
    // funktionierenden aus der Behalte-Liste.
    const geloescht = ids(waehleZuLoeschen(FIXTURE, OPT));
    expect(geloescht).toContain('dpl_prod4');
    expect(geloescht).not.toContain('dpl_prod3');
  });

  it('deterministisch (§2): Ergebnis hängt nicht an der Reihenfolge der API-Antwort', () => {
    const gedreht = [...FIXTURE].reverse();
    expect(ids(waehleZuLoeschen(gedreht, OPT))).toEqual(ids(waehleZuLoeschen(FIXTURE, OPT)));
    expect(ids(waehleZuLoeschen(FIXTURE, OPT))).toEqual(ids(waehleZuLoeschen(FIXTURE, OPT)));
  });

  it('Einträge ohne Id werden nie gelöscht (im Zweifel behalten)', () => {
    const kaputt = [{ url: 'x.vercel.app', created: 0, state: 'READY', target: null }];
    expect(waehleZuLoeschen(kaputt as unknown as Deployment[], OPT)).toEqual([]);
  });
});

describe('ci.yml — der Aufräum-Schritt hängt hinter der Deploy-Nachkontrolle', () => {
  const zeilen = readFileSync(join(WURZEL, '.github/workflows/ci.yml'), 'utf8').split('\n');
  const index = (fragment: string): number => zeilen.findIndex((z) => z.includes(fragment));

  it('der Schritt existiert und ruft das echte Skript', () => {
    expect(index('Vercel — alte Stände aufräumen')).toBeGreaterThan(-1);
    expect(index('node scripts/betrieb/vercel-aufraeumen.mjs')).toBeGreaterThan(-1);
  });

  it('er trägt continue-on-error: true — ein gelungener Deploy bleibt grün', () => {
    // Ohne diese Zeile meldete eine gescheiterte Hausarbeit einen live
    // verifizierten Deploy als Fehlschlag.
    const start = index('Vercel — alte Stände aufräumen');
    const block = zeilen.slice(start, start + 10).join('\n');
    expect(block).toContain('continue-on-error: true');
  });

  it('er trägt timeout-minutes: 8 auf Step-Ebene (Auflage Gegenprüfung)', () => {
    // Der Job hat 20 min gesamt — ein hängender Aufräumer darf den bereits
    // live verifizierten Deploy nicht als Job-Timeout rot machen.
    const start = index('Vercel — alte Stände aufräumen');
    const block = zeilen.slice(start, start + 10).join('\n');
    expect(block).toContain('timeout-minutes: 8');
  });

  it('er steht NACH der Nachkontrolle (sonst löschte er vor dem Live-Beweis)', () => {
    const nachkontrolle = index('Nachkontrolle — live ausgelieferter Build');
    const aufraeumen = index('Vercel — alte Stände aufräumen');
    expect(nachkontrolle).toBeGreaterThan(-1);
    expect(aufraeumen).toBeGreaterThan(nachkontrolle);
  });

  it('er bekommt die URL des eben ausgelieferten Deployments gereicht', () => {
    const start = index('Vercel — alte Stände aufräumen');
    expect(zeilen.slice(start, start + 10).join('\n')).toContain(
      'AKTUELL_URL: ${{ steps.deploy.outputs.url }}',
    );
  });
});

// ─────────────────── hauptlauf() — mit injizierten Abhängigkeiten ───────────────────
//
// Kein echtes Netz, kein echtes `sleep`: `fetch` und `warten` sind Fakes.
// Belegt Auflagen 1, 3 und 4 der Gegenprüfung (PR #774) end-to-end.

const BASIS_ENV: Record<string, string> = {
  VERCEL_TOKEN: 'tok_geheim',
  VERCEL_PROJECT_ID: 'prj_x',
  VERCEL_ORG_ID: 'team_x',
};

function okJson(daten: unknown): FakeAntwort {
  return { ok: true, status: 200, json: async () => daten };
}

function fehlerStatus(status: number): FakeAntwort {
  return { ok: false, status, json: async () => ({}) };
}

function deleteId(url: string): string {
  const treffer = /deployments\/([^?]+)/.exec(url);
  return treffer ? decodeURIComponent(treffer[1]) : '';
}

const KEINE_WARTEZEIT = async () => {};

describe('hauptlauf — mit Fake-fetch, kein echtes Netz, kein echtes sleep', () => {
  it('(a) zwei Seiten Pagination mit Duplikat: jede Id nur einmal, until korrekt weitergereicht', async () => {
    const aufrufe: string[] = [];
    const fetchImpl: HauptlaufAbhaengigkeiten['fetch'] = async (url) => {
      aufrufe.push(url);
      if (url.includes('/v9/projects/')) {
        return okJson({ targets: { production: { id: '' } } });
      }
      if (url.includes('/v6/deployments')) {
        if (!url.includes('until=')) {
          return okJson({
            deployments: [d('dpl_a', 100, 'preview', 'READY'), d('dpl_b', 200, 'preview', 'READY')],
            pagination: { next: 'c1' },
          });
        }
        if (url.includes('until=c1')) {
          // dpl_b überlappt mit Seite 1 (Duplikat); `next` wiederholt den
          // soeben verwendeten Cursor → Abbruch, keine dritte Seite.
          return okJson({
            deployments: [d('dpl_b', 200, 'preview', 'READY'), d('dpl_c', 300, 'preview', 'READY')],
            pagination: { next: 'c1' },
          });
        }
        throw new Error(`unerwartete dritte Seite: ${url}`);
      }
      throw new Error(`unerwarteter Aufruf: ${url}`);
    };

    const ergebnis = await hauptlauf({
      fetch: fetchImpl,
      env: { ...BASIS_ENV, AUFRAEUMEN_TROCKEN: '1' },
      jetzt: JETZT,
      warten: KEINE_WARTEZEIT,
    });

    const seitenAufrufe = aufrufe.filter((u) => u.includes('/v6/deployments'));
    expect(seitenAufrufe.length).toBe(2); // Cursor-Wiederholung stoppt vor Seite 3
    expect(seitenAufrufe[1]).toContain('until=c1');
    const bTreffer = ergebnis.zeilen.filter((z) => z.includes('dpl_b')).length;
    expect(bTreffer).toBe(1); // Dedupe: dpl_b erscheint nur einmal in der Ausgabe
    expect(ergebnis.exitCode).toBe(0);
  });

  it('(b) Trockenlauf löscht nichts — keine DELETE-Aufrufe', async () => {
    const aufrufe: { url: string; methode: string }[] = [];
    const fetchImpl: HauptlaufAbhaengigkeiten['fetch'] = async (url, optionen = {}) => {
      aufrufe.push({ url, methode: optionen.method ?? 'GET' });
      if (url.includes('/v9/projects/')) return okJson({ targets: { production: { id: '' } } });
      if (url.includes('/v6/deployments')) {
        return okJson({ deployments: [d('dpl_x', 100, 'preview', 'READY')], pagination: {} });
      }
      throw new Error(`unerwarteter Aufruf: ${url}`);
    };

    const ergebnis = await hauptlauf({
      fetch: fetchImpl,
      env: { ...BASIS_ENV, AUFRAEUMEN_TROCKEN: '1' },
      jetzt: JETZT,
      warten: KEINE_WARTEZEIT,
    });

    expect(aufrufe.some((a) => a.methode === 'DELETE')).toBe(false);
    expect(ergebnis.geloescht).toBe(0);
    expect(ergebnis.exitCode).toBe(0);
  });

  it('(c) Normallauf: DELETE genau für die berechneten Ids, nie für Alias-/Aktuell-Id', async () => {
    const deployments = [
      d('dpl_prod1', 2, 'production', 'READY'),
      d('dpl_prod2', 5, 'production', 'READY'),
      d('dpl_prod3', 10, 'production', 'READY'),
      d('dpl_prod4', 20, 'production', 'READY'), // → löschen (4. Prod-Stand)
      d('dpl_alias', 40, 'production', 'READY'), // Alias-Träger → behalten
      d('dpl_prev', 8, 'preview', 'READY'), // → löschen
      d('dpl_aktuell', 80, 'preview', 'READY', 'lexmetrik-aktuell.vercel.app'), // (a) behalten
    ];
    const deleteAufrufe: string[] = [];
    const fetchImpl: HauptlaufAbhaengigkeiten['fetch'] = async (url, optionen = {}) => {
      if (url.includes('/v9/projects/')) {
        return okJson({ targets: { production: { id: 'dpl_alias' } } });
      }
      if (optionen.method === 'DELETE') {
        deleteAufrufe.push(deleteId(url));
        return okJson({});
      }
      if (url.includes('/v6/deployments')) return okJson({ deployments, pagination: {} });
      throw new Error(`unerwarteter Aufruf: ${url}`);
    };

    const ergebnis = await hauptlauf({
      fetch: fetchImpl,
      env: { ...BASIS_ENV, AKTUELL_URL: 'https://lexmetrik-aktuell.vercel.app' },
      jetzt: JETZT,
      warten: KEINE_WARTEZEIT,
    });

    expect([...deleteAufrufe].sort()).toEqual(['dpl_prev', 'dpl_prod4'].sort());
    expect(ergebnis.geloescht).toBe(2);
    expect(ergebnis.exitCode).toBe(0);
  });

  it('(d) 429 beim DELETE wird einmal wiederholt und gelingt dann', async () => {
    const deployments = [d('dpl_x', 100, 'preview', 'READY')];
    let versuche = 0;
    const gewartetMs: number[] = [];
    const fetchImpl: HauptlaufAbhaengigkeiten['fetch'] = async (url, optionen = {}) => {
      if (url.includes('/v9/projects/')) return okJson({ targets: { production: { id: '' } } });
      if (optionen.method === 'DELETE') {
        versuche += 1;
        return versuche === 1 ? fehlerStatus(429) : okJson({});
      }
      if (url.includes('/v6/deployments')) return okJson({ deployments, pagination: {} });
      throw new Error(`unerwarteter Aufruf: ${url}`);
    };

    const ergebnis = await hauptlauf({
      fetch: fetchImpl,
      env: BASIS_ENV,
      jetzt: JETZT,
      warten: async (ms) => {
        gewartetMs.push(ms);
      },
    });

    expect(versuche).toBe(2);
    expect(gewartetMs).toContain(5_000);
    expect(ergebnis.geloescht).toBe(1);
    expect(ergebnis.fehler).toBe(0);
    expect(ergebnis.exitCode).toBe(0);
  });

  it('(e) 500 beim DELETE zählt als Fehler, übrige Löschungen laufen weiter', async () => {
    const deployments = [
      d('dpl_bad', 100, 'preview', 'READY'),
      d('dpl_good', 110, 'preview', 'READY'),
    ];
    const deleteAufrufe: string[] = [];
    const fetchImpl: HauptlaufAbhaengigkeiten['fetch'] = async (url, optionen = {}) => {
      if (url.includes('/v9/projects/')) return okJson({ targets: { production: { id: '' } } });
      if (optionen.method === 'DELETE') {
        const id = deleteId(url);
        deleteAufrufe.push(id);
        return id === 'dpl_bad' ? fehlerStatus(500) : okJson({});
      }
      if (url.includes('/v6/deployments')) return okJson({ deployments, pagination: {} });
      throw new Error(`unerwarteter Aufruf: ${url}`);
    };

    const ergebnis = await hauptlauf({
      fetch: fetchImpl,
      env: BASIS_ENV,
      jetzt: JETZT,
      warten: KEINE_WARTEZEIT,
    });

    expect([...deleteAufrufe].sort()).toEqual(['dpl_bad', 'dpl_good'].sort());
    expect(ergebnis.fehler).toBe(1);
    expect(ergebnis.geloescht).toBe(1);
    expect(ergebnis.exitCode).not.toBe(0);
  });

  it('(f) ein Listen-Fehler bricht ab, ohne je DELETE aufzurufen', async () => {
    const deleteAufrufe: string[] = [];
    const fetchImpl: HauptlaufAbhaengigkeiten['fetch'] = async (url, optionen = {}) => {
      if (url.includes('/v9/projects/')) return okJson({ targets: { production: { id: '' } } });
      if (optionen.method === 'DELETE') {
        deleteAufrufe.push(url);
        return okJson({});
      }
      if (url.includes('/v6/deployments')) return fehlerStatus(500);
      throw new Error(`unerwarteter Aufruf: ${url}`);
    };

    const ergebnis = await hauptlauf({
      fetch: fetchImpl,
      env: BASIS_ENV,
      jetzt: JETZT,
      warten: KEINE_WARTEZEIT,
    });

    expect(deleteAufrufe.length).toBe(0);
    expect(ergebnis.exitCode).not.toBe(0);
    expect(ergebnis.zeilen.some((z) => z.startsWith('::warning::'))).toBe(true);
  });

  it('(Auflage 1) ein Timeout beim Listen wird wie jeder andere Listenfehler behandelt', async () => {
    const deleteAufrufe: string[] = [];
    const fetchImpl: HauptlaufAbhaengigkeiten['fetch'] = async (url, optionen = {}) => {
      if (url.includes('/v9/projects/')) return okJson({ targets: { production: { id: '' } } });
      if (optionen.method === 'DELETE') {
        deleteAufrufe.push(url);
        return okJson({});
      }
      if (url.includes('/v6/deployments')) {
        throw new DOMException('The operation timed out.', 'TimeoutError');
      }
      throw new Error(`unerwarteter Aufruf: ${url}`);
    };

    const ergebnis = await hauptlauf({
      fetch: fetchImpl,
      env: BASIS_ENV,
      jetzt: JETZT,
      warten: KEINE_WARTEZEIT,
    });

    expect(deleteAufrufe.length).toBe(0);
    expect(ergebnis.exitCode).not.toBe(0);
    expect(ergebnis.zeilen.some((z) => z.startsWith('::warning::'))).toBe(true);
  });

  it('(g) MAX-Deckel: bei mehr Kandidaten als MAX genau MAX DELETEs, Summenzeile mit «übrig»', async () => {
    const deployments = [
      d('dpl_1', 100, 'preview', 'READY'),
      d('dpl_2', 101, 'preview', 'READY'),
      d('dpl_3', 102, 'preview', 'READY'),
    ];
    const deleteAufrufe: string[] = [];
    const fetchImpl: HauptlaufAbhaengigkeiten['fetch'] = async (url, optionen = {}) => {
      if (url.includes('/v9/projects/')) return okJson({ targets: { production: { id: '' } } });
      if (optionen.method === 'DELETE') {
        deleteAufrufe.push(url);
        return okJson({});
      }
      if (url.includes('/v6/deployments')) return okJson({ deployments, pagination: {} });
      throw new Error(`unerwarteter Aufruf: ${url}`);
    };

    const ergebnis = await hauptlauf({
      fetch: fetchImpl,
      env: { ...BASIS_ENV, AUFRAEUMEN_MAX: '2' },
      jetzt: JETZT,
      warten: KEINE_WARTEZEIT,
    });

    expect(deleteAufrufe.length).toBe(2);
    expect(ergebnis.uebrig).toBe(1);
    expect(ergebnis.zeilen.some((z) => z.includes('übrig'))).toBe(true);
    expect(ergebnis.exitCode).toBe(0);
  });

  it('das Token erscheint nie in der Log-Ausgabe (Fake-Token «tok_geheim»)', async () => {
    const deployments = [d('dpl_x', 100, 'preview', 'READY')];
    const fetchImpl: HauptlaufAbhaengigkeiten['fetch'] = async (url, optionen = {}) => {
      if (url.includes('/v9/projects/')) return okJson({ targets: { production: { id: '' } } });
      if (optionen.method === 'DELETE') return okJson({});
      if (url.includes('/v6/deployments')) return okJson({ deployments, pagination: {} });
      throw new Error(`unerwarteter Aufruf: ${url}`);
    };

    const ergebnis = await hauptlauf({
      fetch: fetchImpl,
      env: BASIS_ENV,
      jetzt: JETZT,
      warten: KEINE_WARTEZEIT,
    });

    expect(ergebnis.zeilen.some((z) => z.includes('tok_'))).toBe(false);
  });
});
