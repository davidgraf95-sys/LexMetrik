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
const { waehleZuLoeschen } = (await import(/* @vite-ignore */ modulPfad)) as {
  waehleZuLoeschen: (deployments: Deployment[], optionen: Optionen) => Deployment[];
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
    const block = zeilen.slice(start, start + 6).join('\n');
    expect(block).toContain('continue-on-error: true');
  });

  it('er steht NACH der Nachkontrolle (sonst löschte er vor dem Live-Beweis)', () => {
    const nachkontrolle = index('Nachkontrolle — live ausgelieferter Build');
    const aufraeumen = index('Vercel — alte Stände aufräumen');
    expect(nachkontrolle).toBeGreaterThan(-1);
    expect(aufraeumen).toBeGreaterThan(nachkontrolle);
  });

  it('er bekommt die URL des eben ausgelieferten Deployments gereicht', () => {
    const start = index('Vercel — alte Stände aufräumen');
    expect(zeilen.slice(start, start + 6).join('\n')).toContain(
      'AKTUELL_URL: ${{ steps.deploy.outputs.url }}',
    );
  });
});
