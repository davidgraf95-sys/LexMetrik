import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import {
  MATERIAL_REGISTER, BEHOERDEN, DOKTYPEN, DOKTYP_LABEL, behoerdeVon,
} from '../lib/materialien/register';
import { BOTSCHAFTEN } from '../lib/materialien/botschaften.generated';
import { VERNEHMLASSUNGEN } from '../lib/materialien/vernehmlassungen.generated';
import { baueMaterialManifest } from '../../scripts/materialien/material-manifest';
import { projiziereRegister, dbDokAusZustand } from '../../scripts/materialien/soft-law-projektion';
import { ladeZustand } from '../../scripts/materialien/soft-law-zustand';
import { ERLASS_REGISTER } from '../lib/normtext/register';
import { NAVIGATION } from '../lib/navigation';
import { materialienFuerNorm } from '../lib/normtext/werkzeuge';
import type { MaterialManifest } from '../lib/materialien/typen';

// Konsistenz-Tore Material-Register ↔ Manifest ↔ Navigation (offline, im gate).
// Pendant zu normtext-register.test.ts; eigener Namespace. Jede Diskrepanz bricht
// hier, nie als stille Lücke/toter Link in der UI (§5/§8).

const REGISTER_PFAD = 'public/materialien/register.json';
const KEY_UNSICHER = /[\\/#?\s]/;
const ISO = /^\d{4}-\d{2}-\d{2}$/;
const behoerdeIds = new Set(BEHOERDEN.map((b) => b.id));
const doktypIds = new Set(DOKTYPEN.map((d) => d.id));
const erlassKeys = new Set(ERLASS_REGISTER.map((e) => e.key));

describe('Tor 1 — Register-Integrität', () => {
  it('Schlüssel sind eindeutig und URL-sicher', () => {
    const keys = MATERIAL_REGISTER.map((m) => m.key);
    expect(new Set(keys).size, 'doppelte keys').toBe(keys.length);
    const unsicher = keys.filter((k) => KEY_UNSICHER.test(k));
    expect(unsicher, `pfad-/URL-unsichere keys: ${unsicher.join(', ')}`).toEqual([]);
  });

  it('Behörde + Doktyp sind deklariert (kein Phantom)', () => {
    for (const m of MATERIAL_REGISTER) {
      expect(behoerdeIds.has(m.behoerde), `${m.key}: Behörde ${m.behoerde}`).toBe(true);
      expect(doktypIds.has(m.doktyp), `${m.key}: Doktyp ${m.doktyp}`).toBe(true);
      expect(m.titel.trim().length, m.key).toBeGreaterThan(0);
    }
  });

  it('jeder Eintrag trägt einen amtlichen Live-Link + ISO-Stand (§7c)', () => {
    for (const m of MATERIAL_REGISTER) {
      expect(/^https?:\/\//.test(m.quelleUrl), `${m.key}: quelleUrl ${m.quelleUrl}`).toBe(true);
      expect(ISO.test(m.stand), `${m.key}: stand ${m.stand}`).toBe(true);
    }
  });

  it('normKeys verweisen nur auf existierende Erlasse (kein toter Cross-Link)', () => {
    for (const m of MATERIAL_REGISTER) {
      for (const nk of m.normKeys ?? []) {
        expect(erlassKeys.has(nk), `${m.key}: normKeys → unbekannter Erlass ${nk}`).toBe(true);
      }
    }
  });

  it('P0-Invariante: alle Materialien sind nur-live-link (Abnahme-Zeitsperre)', () => {
    const andere = MATERIAL_REGISTER.filter((m) => m.status !== 'nur-live-link');
    expect(andere.map((m) => m.key), 'pdf-embed/volltext brauchen gehosteten Inhalt + Drift-Tor').toEqual([]);
  });
});

describe('Tor 2 — committetes Manifest == frischer Build (Merge-Modell §2.7, Determinismus §2)', () => {
  it('register.json existiert und entspricht der Projektion (kuratiert + DB aus Zustands-Manifest)', () => {
    expect(existsSync(REGISTER_PFAD), `${REGISTER_PFAD} fehlt`).toBe(true);
    const committet = JSON.parse(readFileSync(REGISTER_PFAD, 'utf8')) as MaterialManifest;
    // Merge-Modell (M2): register.json = kuratiertes MATERIAL_REGISTER + gelistete DB-Dokumente
    // aus dem committeten Zustands-Manifest, deterministisch sortiert (byte-Beweis: check:materialien).
    const dbDocs = dbDokAusZustand(ladeZustand());
    const frisch = projiziereRegister(committet.erzeugt, dbDocs);
    expect(committet.materialien).toEqual(frisch.materialien);
    // register.json ist Superset des kuratierten Registers (kein kuratierter Eintrag geht verloren).
    const kuratiertKeys = new Set(MATERIAL_REGISTER.map((m) => m.key));
    const registerKeys = new Set(committet.materialien.map((m) => m.key));
    for (const k of kuratiertKeys) expect(registerKeys.has(k)).toBe(true);
    // Paket 2 (W2·6) + Paket 3 (W3·11): + generierte Botschaften/Vernehmlassungen (nicht im
    // in-Bundle MATERIAL_REGISTER, §15; gemerged via ALLE_MATERIALIEN). Länge = kuratiert +
    // Botschaften + Vernehmlassungen + DB.
    expect(committet.materialien.length).toBe(MATERIAL_REGISTER.length + BOTSCHAFTEN.length + VERNEHMLASSUNGEN.length + dbDocs.length);
    const botschaften = committet.materialien.filter((m) => m.behoerde === 'BR');
    expect(botschaften.length).toBe(BOTSCHAFTEN.length);
    const vernehmlassungen = committet.materialien.filter((m) => m.behoerde === 'BUND');
    expect(vernehmlassungen.length).toBe(VERNEHMLASSUNGEN.length);
  });

  it('jeder Manifest-Eintrag löst Behörde-/Doktyp-Labels auf', () => {
    const m = baueMaterialManifest('2026-06-27');
    for (const x of m.materialien) {
      expect(x.behoerdeName).toBe(behoerdeVon(x.behoerde).name);
      expect(x.doktypLabel).toBe(DOKTYP_LABEL[x.doktyp]);
      expect(x.sha).toMatch(/^[0-9a-f]{64}$/);
    }
  });
});

describe('Tor 3 — Navigation verlinkt nur existierende Behörden (kein toter Link)', () => {
  it('«Materialien › Nach Behörde» trifft genau die BEHOERDEN-Anker', () => {
    const materialien = NAVIGATION.find((a) => a.titel === 'Materialien');
    expect(materialien, 'Navigations-Abschnitt «Materialien» fehlt').toBeTruthy();
    const gruppe = materialien!.kinder.find((k) => k.art === 'gruppe');
    expect(gruppe, 'Gruppe «Nach Behörde» fehlt').toBeTruthy();
    const ziele = (gruppe!.art === 'gruppe' ? gruppe!.kinder : [])
      .map((k) => (k.art === 'link' ? k.ziel : ''));
    expect(ziele).toEqual(BEHOERDEN.map((b) => `/materialien#b-${b.id}`));
  });
});

describe('Tor 4 — Norm↔Material-Brücke (additiv, kein toter Bezug)', () => {
  it('materialienFuerNorm liefert nur Materialien, die den Erlass führen', () => {
    // Mindestens eine bekannte Verzahnung existiert (DSG → EDÖB-Leitfäden).
    const dsg = materialienFuerNorm('DSG');
    expect(dsg.length).toBeGreaterThan(0);
    for (const ref of dsg) {
      const reg = MATERIAL_REGISTER.find((m) => m.key === ref.key)!;
      expect((reg.normKeys ?? []).includes('DSG')).toBe(true);
    }
    // Ein Erlass ohne Material-Verzahnung liefert leer (kein erfundener Bezug).
    expect(materialienFuerNorm('NICHT_EXISTENT')).toEqual([]);
  });
});
