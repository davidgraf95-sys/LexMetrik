import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { FEDLEX } from '../lib/fedlex';
import { ERLASS_REGISTER, GEBIETE, type Grundart, type Rechtsgebiet } from '../lib/normtext/register';
import { GRUNDART_SEED } from '../lib/normtext/grundart.generated';
import {
  baueBrowseManifest, identitaetAusErlass, istKuerzelFragment, spracheAusStamm,
} from '../../scripts/normtext/browse-manifest';
import type { BrowseManifest } from '../lib/normtext/browse-typen';

// Konsistenz-Tore Erlass-Register ↔ Snapshots ↔ Browse-Manifest (offline, im
// gate). Invariante: Register ⊇ Snapshots ⊇ Manifest — jede Diskrepanz bricht
// hier, nie als stille Lücke in der UI (§5/§8).

const NORMTEXT = 'public/normtext';
const GEBIET_IDS = new Set<Rechtsgebiet>(GEBIETE.map((g) => g.id));

function stems(unterordner: string): string[] {
  return readdirSync(join(NORMTEXT, unterordner))
    .filter((f) => f.endsWith('.json') && f !== 'index.json' && f !== 'register.json')
    .map((f) => f.replace(/\.json$/, ''));
}

const bundStems = stems('bund');
const kantonStems = stems('kanton');
const bundReg = ERLASS_REGISTER.filter((r) => r.ebene === 'bund');

describe('Tor 1 — Register ⊇ Bund-Snapshots (keine Waise, kein Phantom)', () => {
  it('jeder Bund-Snapshot hat genau einen Register-Eintrag', () => {
    const regKeys = new Set(bundReg.map((r) => r.key));
    const fehlend = bundStems.filter((s) => !regKeys.has(s));
    expect(fehlend, `Bund-Snapshots ohne Register-Eintrag: ${fehlend.join(', ')}`).toEqual([]);
  });
  it('jeder Bund-Register-Eintrag (snapshot) hat eine Datei', () => {
    const fehlend = bundReg
      .filter((r) => r.status === 'snapshot')
      .filter((r) => !existsSync(join(NORMTEXT, 'bund', `${r.key}.json`)));
    expect(fehlend.map((r) => r.key)).toEqual([]);
  });
  it('Register-Bund-Schlüssel sind eindeutig', () => {
    const keys = bundReg.map((r) => r.key);
    expect(new Set(keys).size).toBe(keys.length);
  });
});

describe('Tor 2 — Taxonomie vollständig & deklariert', () => {
  it('jeder Eintrag: gültiges Rechtsgebiet, nicht-leerer Titel/Kürzel', () => {
    for (const r of ERLASS_REGISTER) {
      expect(GEBIET_IDS.has(r.rechtsgebiet), `${r.key}: ${r.rechtsgebiet}`).toBe(true);
      expect(r.titel.trim().length, r.key).toBeGreaterThan(0);
      expect(r.kuerzel.trim().length, r.key).toBeGreaterThan(0);
    }
  });
  it('jeder Bund-Eintrag trägt eine SR-Nummer (ausser nicht-Fedlex-EU-Recht)', () => {
    // International/EU-Recht (z.B. DSGVO) liegt NICHT in Fedlex und hat darum keine
    // SR-Nummer — amtliche Quelle ist EUR-Lex (rechtsgebiet 'international',
    // INTERNATIONAL_EXTERN). Fedlex-Staatsverträge SR 0.* tragen weiterhin eine SR.
    const ohneSr = bundReg.filter((r) => !r.sr && r.rechtsgebiet !== 'international');
    expect(ohneSr.map((r) => r.key)).toEqual([]);
  });
});

describe('Tor 3 — fedlex.ts ↔ Register synchron', () => {
  it('Bund-Register deckt GENAU die FEDLEX-Schlüssel ab', () => {
    const fedlexKeys = Object.keys(FEDLEX).sort();
    const regFedlex = bundReg.map((r) => r.fedlexKey).filter(Boolean).sort();
    expect(regFedlex).toEqual(fedlexKeys);
  });
});

describe('Tor 4 — Schlüssel ↔ Ebene ↔ Dateiname', () => {
  it('Bund-Schlüssel ohne Kantons-Präfix; Kanton-Schlüssel <KT>-… mit passendem Kanton', () => {
    const m = baueBrowseManifest('2026-06-17');
    for (const e of m.erlasse) {
      if (e.ebene === 'bund') {
        expect(/^[A-Z0-9_]+$/.test(e.key), `Bund-Key ${e.key}`).toBe(true);
        expect(e.kanton).toBeNull();
      } else {
        expect(/^[A-Z]{2}-/.test(e.key), `Kanton-Key ${e.key}`).toBe(true);
        expect(e.key.startsWith(`${e.kanton}-`), `${e.key} ↔ ${e.kanton}`).toBe(true);
      }
    }
  });
});

describe('Tor 5 — Manifest deterministisch', () => {
  it('zweimal gebaut → identisches JSON', () => {
    const a = JSON.stringify(baueBrowseManifest('2026-06-17'));
    const b = JSON.stringify(baueBrowseManifest('2026-06-17'));
    expect(a).toBe(b);
  });
});

describe('Tor 6 — Manifest ⊇ alle Snapshots, kein Phantom', () => {
  const m = baueBrowseManifest('2026-06-17');
  const manifestKeys = new Set(m.erlasse.filter((e) => e.status === 'snapshot').map((e) => e.key));
  const alleStems = new Set([...bundStems, ...kantonStems]);

  it('jeder Snapshot (Bund+Kanton) erscheint im Manifest', () => {
    const fehlend = [...alleStems].filter((s) => !manifestKeys.has(s));
    expect(fehlend, `Snapshots ohne Manifest-Eintrag: ${fehlend.slice(0, 10).join(', ')}`).toEqual([]);
  });
  it('kein Manifest-Snapshot-Eintrag ohne Datei', () => {
    const phantom = [...manifestKeys].filter((k) => !alleStems.has(k));
    expect(phantom).toEqual([]);
  });
  it('nur-live-link-Einträge tragen quelleUrl + stand, keine Datei', () => {
    for (const e of m.erlasse.filter((x) => x.status === 'nur-live-link')) {
      expect(e.datei).toBeNull();
      expect(e.quelleUrl.length, e.key).toBeGreaterThan(0);
      expect(e.stand.length, e.key).toBeGreaterThan(0);
    }
  });
  // pdf-embed: render-kritische Provenienz muss vollständig sein — ohne pdfPfad
  // fällt der Reader still in den «nicht verfügbar»-Zweig, ohne stand/quelleUrl
  // fehlt die §7-Provenienz. (Datei-Integrität prüft zusätzlich check:pdf.)
  it('pdf-embed-Einträge tragen pdfPfad + quelleUrl + stand, keine Snapshot-Datei', () => {
    for (const e of m.erlasse.filter((x) => x.status === 'pdf-embed')) {
      expect(e.datei, e.key).toBeNull();
      expect(e.pdfPfad ?? '', e.key).toMatch(/^pdf\/.+\.pdf$/);
      expect(e.quelleUrl.length, e.key).toBeGreaterThan(0);
      expect(e.stand.length, e.key).toBeGreaterThan(0);
    }
  });
});

describe('Tor 7 — committetes register.json ist aktuell (kein stiller Drift)', () => {
  it('public/normtext/register.json == frisch gebaut (ohne erzeugt-Datum)', () => {
    const committed = JSON.parse(readFileSync(join(NORMTEXT, 'register.json'), 'utf8')) as BrowseManifest;
    const frisch = baueBrowseManifest(committed.erzeugt);
    expect(JSON.stringify(committed.erlasse)).toBe(JSON.stringify(frisch.erlasse));
  });
});

// ── Tor 8 — check:grundart (W2·5d/G0): Präsenz + Konsistenz der Grundart-
//    Klassifikation im Register. Prüft NICHT die inhaltliche Richtigkeit des
//    kantonalen bestimmungsEtiketts (K6/§8) — das bleibt entwurf bis Kanton-
//    Verifikation. Reine Prüflogik (§5.2), golden byte-gleich. ────────────────
describe('Tor 8 — Grundart (check:grundart): Präsenz + Konsistenz', () => {
  const GRUNDARTEN = new Set<Grundart>([
    'KODIFIKATION', 'STANDARD_ERLASS', 'ERLASS_MIT_ANHANG', 'FLACHER_KURZERLASS',
    'STAATSVERTRAG', 'KANTON', 'PDF_EMBED', 'LIVE_VERWEIS',
  ]);
  // status → grundart-Werte, die dieser Status AUSSCHLIESST (Konsistenz-Arbiter).
  const AUSGESCHLOSSEN: Record<string, ReadonlySet<Grundart>> = {
    'snapshot': new Set(['LIVE_VERWEIS', 'PDF_EMBED']),
    'pdf-embed': new Set(['KODIFIKATION', 'STANDARD_ERLASS', 'ERLASS_MIT_ANHANG',
      'FLACHER_KURZERLASS', 'STAATSVERTRAG', 'KANTON', 'LIVE_VERWEIS']),
    'nur-live-link': new Set(['KODIFIKATION', 'STANDARD_ERLASS', 'ERLASS_MIT_ANHANG',
      'FLACHER_KURZERLASS', 'STAATSVERTRAG', 'KANTON', 'PDF_EMBED']),
  };

  it('Präsenz: jeder Register-Eintrag trägt eine grundart', () => {
    const ohne = ERLASS_REGISTER.filter((r) => !r.grundart);
    expect(ohne.map((r) => `${r.key} (${r.status})`)).toEqual([]);
  });

  it('Präsenz: jeder snapshot/pdf-embed-Eintrag ist im GRUNDART_SEED (Match per key)', () => {
    const fehlend = ERLASS_REGISTER
      .filter((r) => r.status === 'snapshot' || r.status === 'pdf-embed')
      .filter((r) => !GRUNDART_SEED[r.key]);
    expect(fehlend.map((r) => r.key)).toEqual([]);
  });

  it('grundart ist ein gültiger Wert', () => {
    const ungueltig = ERLASS_REGISTER.filter((r) => r.grundart && !GRUNDARTEN.has(r.grundart));
    expect(ungueltig.map((r) => `${r.key}: ${r.grundart}`)).toEqual([]);
  });

  it('Konsistenz: grundart passt zum status (kein LIVE_VERWEIS mit Snapshot etc.)', () => {
    const inkonsistent = ERLASS_REGISTER.filter(
      (r) => r.grundart && AUSGESCHLOSSEN[r.status]?.has(r.grundart),
    );
    expect(inkonsistent.map((r) => `${r.key}: ${r.status} ↔ ${r.grundart}`)).toEqual([]);
  });

  it('erlassTyp konsistent: STAATSVERTRAG-Grundart trägt keinen Gesetz/Verordnung-Typ', () => {
    const bad = ERLASS_REGISTER.filter(
      (r) => r.grundart === 'STAATSVERTRAG' && r.erlassTyp && r.erlassTyp !== 'staatsvertrag',
    );
    expect(bad.map((r) => `${r.key}: ${r.erlassTyp}`)).toEqual([]);
  });

  it('bestimmungsEtikett nur an KANTON, immer entwurf (K6/§8)', () => {
    // Register führt keine Kanton-Einträge; das Etikett lebt im Seed für G3a. Wir
    // prüfen die Seed-Konsistenz: bestimmungsEtikett ⇒ grundart KANTON + entwurf.
    const seedBad = Object.entries(GRUNDART_SEED).filter(
      ([, s]) => s.bestimmungsEtikett &&
        (s.grundart !== 'KANTON' || s.bestimmungsEtikettStatus !== 'entwurf'),
    );
    expect(seedBad.map(([k, s]) => `${k}: ${s.grundart}/${s.bestimmungsEtikettStatus}`)).toEqual([]);
    // …und jeder KANTON-Seed trägt ein Etikett (art|paragraf).
    const kantonOhneEtikett = Object.entries(GRUNDART_SEED).filter(
      ([, s]) => s.grundart === 'KANTON' &&
        s.bestimmungsEtikett !== 'art' && s.bestimmungsEtikett !== 'paragraf',
    );
    expect(kantonOhneEtikett.map(([k]) => k)).toEqual([]);
  });

  // Gegenprüfungs-Befund 4.7.2026 (ZH-243): das Audit-Signal paragrafZaehlung
  // verzählte sich an «Anhang Ziff.»-Einträgen. Arbiter ist die GESPEICHERTE
  // amtliche Fassung: die Mehrheit der Dispositiv-artikelLabel («§ N» vs
  // «Art. N») je Kanton-Snapshot muss zum Seed-Etikett passen. (Konsistenz
  // gegen unsere Snapshots — die inhaltliche Kanton-Verifikation gegen die
  // amtliche Quelle bleibt entwurf/K6 und ist NICHT Gegenstand dieses Tors.)
  it('bestimmungsEtikett stimmt mit der Label-Mehrheit des Kanton-Snapshots überein', () => {
    const falsch: string[] = [];
    for (const stamm of kantonStems) {
      const seed = GRUNDART_SEED[stamm];
      if (!seed?.bestimmungsEtikett) continue;
      const daten = JSON.parse(readFileSync(join(NORMTEXT, 'kanton', `${stamm}.json`), 'utf8')) as {
        eintraege?: Array<{ artikelLabel?: string }>;
      };
      let par = 0; let art = 0;
      for (const e of daten.eintraege ?? []) {
        const label = typeof e.artikelLabel === 'string' ? e.artikelLabel : '';
        if (/^§/.test(label)) par += 1;
        else if (/^Art\.?\s/i.test(label) || /^Art\.?$/i.test(label)) art += 1;
      }
      if (par === 0 && art === 0) continue; // kein Dispositiv-Label → keine Aussage
      const erwartet = par > art ? 'paragraf' : 'art';
      if (seed.bestimmungsEtikett !== erwartet) {
        falsch.push(`${stamm}: seed=${seed.bestimmungsEtikett}, Snapshot §${par}/Art.${art} → ${erwartet}`);
      }
    }
    expect(falsch).toEqual([]);
  });
});

describe('Hilfsfunktionen — Identität aus Snapshot ableiten', () => {
  it('identitaetAusErlass: Komma trennt Titel/Kürzel, Klammer ist SR', () => {
    expect(identitaetAusErlass('Verfahrenskostendekret, VKD (BSG 161.12)'))
      .toEqual({ kuerzel: 'VKD', titel: 'Verfahrenskostendekret', sr: 'BSG 161.12' });
  });
  it('identitaetAusErlass: ohne Komma → Kürzel allein, voller String als Titel', () => {
    expect(identitaetAusErlass('RJ (RSF 130.11)'))
      .toEqual({ kuerzel: 'RJ', titel: 'RJ (RSF 130.11)', sr: 'RSF 130.11' });
  });

  // T2/S2 (BS-Audit 23.6.2026) — Last-Comma-Split darf keinen Satzfragment-Titel
  // erzeugen. Fixtures sind echte BS-erlass-Strings (register.json, 23.6.2026).
  describe('identitaetAusErlass: Satzfragment-Tail nicht als Kürzel (T2/S2)', () => {
    // ── Fragment-Fälle: kuerzel == titel == voller (klammerloser) String ──────
    it('«b) den Betrieb der Hafenbahn …» → voller String (BS-954.420)', () => {
      const erl =
        'Staatsvertrag zwischen der Schweiz und dem Deutschen Reich über den Bau und Betrieb der Hafenbahn, b) den Betrieb der Hafenbahn durch die Schweizerischen Bundesbahnen zwischen dem baselstädtischen Rheinhafen Kleinhüningen und dem Basel Badischen Verschubbahnhof (954.420)';
      const r = identitaetAusErlass(erl);
      expect(r.kuerzel).toBe(r.titel);
      expect(r.kuerzel).not.toMatch(/^b\)/); // kein «b) …»-Fragment
      expect(r.titel.startsWith('Staatsvertrag')).toBe(true);
    });

    it('klein-beginnendes «über die …» → voller String (BS-119.100)', () => {
      const erl =
        'Übereinkommen …, über die grenzüberschreitende Zusammenarbeit zwischen Gebietskörperschaften und örtlichen öffentlichen Stellen (119.100)';
      const r = identitaetAusErlass(erl);
      expect(r.kuerzel).toBe(r.titel);
      expect(r.titel).toBe(
        'Übereinkommen …, über die grenzüberschreitende Zusammenarbeit zwischen Gebietskörperschaften und örtlichen öffentlichen Stellen',
      );
    });

    it('GROSSGESCHRIEBENES Fragment «Basel-Landschaft und Aargau in …» → voller String (BS-955.700)', () => {
      const erl =
        'Vereinbarung zwischen den Kantonen Basel-Stadt, Basel-Landschaft und Aargau in Rheinschiffahrts- und Hafenangelegenheiten (955.700)';
      const r = identitaetAusErlass(erl);
      expect(r.kuerzel).toBe(r.titel);
      expect(r.titel.startsWith('Vereinbarung')).toBe(true);
    });

    it('GROSSGESCHRIEBENES Fragment mit Akronym «… über die Fachhochschule … (FHNW)» → voller String (BS-952.820/428.100-Klasse)', () => {
      const erl =
        'Staatsvertrag zwischen den Kantonen Basel-Stadt und Solothurn über die Fachhochschule Nordwestschweiz (FHNW) (428.100)';
      // letztes Klammerpaar ist SR «428.100»; der Tail nach dem Komma fehlt hier
      // (kein Komma) — daher prüfen wir den realen Komma-Fall aus 952.820:
      const erl2 =
        'Vereinbarung zwischen den Kantonen Basel-Stadt, Basel-Landschaft und Aargau über die Durchführung der amtlichen Nachkontrollen von Fahrzeugen (952.820)';
      const r2 = identitaetAusErlass(erl2);
      expect(r2.kuerzel).toBe(r2.titel);
      expect(r2.titel.startsWith('Vereinbarung')).toBe(true);
      // erl wird hier nur als Sanity verwendet (kein Komma → unverändert).
      expect(identitaetAusErlass(erl).sr).toBe('428.100');
    });

    it('kurzes Listen-Fragment «Basel-Landschaft und Aargau» → voller String (BS-365.520)', () => {
      const erl =
        'Vereinbarung über eine gemeinsame Tierversuchskommission der Kantone Basel-Stadt, Basel-Landschaft und Aargau (365.520)';
      const r = identitaetAusErlass(erl);
      expect(r.kuerzel).toBe(r.titel);
    });

    // ── Gegenproben: echte Kürzel BLEIBEN gesplittet (kein Regress) ───────────
    it('echtes Akronym-Kürzel «StG» bleibt gesplittet (BS-640.100)', () => {
      const erl = 'Gesetz über die direkten Steuern, Steuergesetz, StG (640.100)';
      expect(identitaetAusErlass(erl)).toEqual({
        kuerzel: 'StG',
        titel: 'Gesetz über die direkten Steuern, Steuergesetz',
        sr: '640.100',
      });
    });

    it('lowercase-Latein-Kürzel mit Erlassform «ad personam-Verordnung» bleibt gesplittet (BS-164.170)', () => {
      const erl =
        'Verordnung betreffend ad personam-Einreihung und ad personam-Einstufung, ad personam-Verordnung (164.170)';
      const r = identitaetAusErlass(erl);
      expect(r.kuerzel).toBe('ad personam-Verordnung');
      expect(r.titel).toBe('Verordnung betreffend ad personam-Einreihung und ad personam-Einstufung');
    });

    it('Mehrwort-Kürzel mit Akronym «Abfallvereinbarung BS - BL» bleibt gesplittet (BS-786.300)', () => {
      const erl =
        'Vereinbarung … über die Zusammenarbeit im Abfallbereich, Abfallvereinbarung BS - BL (786.300)';
      const r = identitaetAusErlass(erl);
      expect(r.kuerzel).toBe('Abfallvereinbarung BS - BL');
    });

    it('istKuerzelFragment: positive und negative Fälle', () => {
      expect(istKuerzelFragment('b) den Betrieb der Hafenbahn …')).toBe(true);
      expect(istKuerzelFragment('betreffend Sonderabfallverbrennung')).toBe(true);
      expect(istKuerzelFragment('nachstehend TBA genannt')).toBe(true);
      expect(istKuerzelFragment('Basel-Landschaft und Aargau')).toBe(true);
      // Gegenproben
      expect(istKuerzelFragment('StG')).toBe(false);
      expect(istKuerzelFragment('VKD')).toBe(false);
      expect(istKuerzelFragment('EG StPO')).toBe(false);
      expect(istKuerzelFragment('VO EG BGS')).toBe(false);
      expect(istKuerzelFragment('ad personam-Verordnung')).toBe(false);
      expect(istKuerzelFragment('Abfallvereinbarung BS - BL')).toBe(false);
    });
  });
  it('spracheAusStamm: Suffix entscheidet, Default de', () => {
    expect(spracheAusStamm('FR-130.11-fr')).toBe('fr');
    expect(spracheAusStamm('TI-ti-125101')).toBe('de');
    expect(spracheAusStamm('BE-161.12')).toBe('de');
  });
});
