import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import {
  kontextSync, normenFuer, materialienFuer,
} from '../lib/kontext';
import { ERLASS_REGISTER } from '../lib/normtext/register';

// Konsistenz-Tore für das einheitliche Kontext-Panel (B3). Reine Verknüpfungs-
// Projektion über vorhandene normKeys (§3) — diese Tests sichern, dass die
// Projektion deterministisch, deduppt, ohne tote Links UND bidirektional
// konsistent ist (von der Norm erreichte Entscheide nennen die Norm zurück).

const erlassKeys = new Set(ERLASS_REGISTER.map((e) => e.key));

interface IdxRef { key: string }
interface NormIndex { proNorm: Record<string, IdxRef[]> }
interface ManifestE { key: string; normKeys: string[] }

const normIndex = JSON.parse(readFileSync('public/rechtsprechung/norm-index.json', 'utf8')) as NormIndex;
const manifest = JSON.parse(readFileSync('public/rechtsprechung/register.json', 'utf8')) as { entscheide: ManifestE[] };
const normKeysVonEntscheid = new Map(manifest.entscheide.map((e) => [e.key, new Set(e.normKeys)]));

describe('Tor 1 — Selbst-Korpus wird ausgelassen', () => {
  it('Norm-Reader zeigt keine Normen-Gruppe (Selbstverweis)', () => {
    expect(kontextSync('norm', ['OR']).normen).toEqual([]);
  });
  it('Material-Reader zeigt keine Materialien-Gruppe', () => {
    expect(kontextSync('material', ['OR']).materialien).toEqual([]);
  });
  it('Werkzeuge sind für alle drei Korpora fremd → immer projiziert', () => {
    expect(kontextSync('norm', ['OR']).werkzeuge.length).toBeGreaterThan(0);
    expect(kontextSync('entscheid', ['OR']).werkzeuge.length).toBeGreaterThan(0);
    expect(kontextSync('material', ['OR']).werkzeuge.length).toBeGreaterThan(0);
  });
});

describe('Tor 2 — normenFuer: keine toten Links, deduppt', () => {
  it('nur registrierte Keys, korrekter Detailpfad', () => {
    const out = normenFuer(['OR', 'ZGB', 'GIBTSNICHT_XYZ']);
    expect(out.map((n) => n.key)).toEqual(['OR', 'ZGB']);
    for (const n of out) {
      expect(erlassKeys.has(n.key)).toBe(true);
      expect(n.pfad).toBe(`/gesetze/${n.ebene}/${encodeURIComponent(n.key)}`);
    }
  });
  it('dedupliziert wiederholte Keys', () => {
    expect(normenFuer(['OR', 'OR', 'OR']).length).toBe(1);
  });
});

describe('Tor 3 — materialienFuer: deduppt, deterministisch sortiert', () => {
  it('Vereinigung über mehrere normKeys ohne Doppel', () => {
    const out = materialienFuer(['OR', 'ZGB']);
    const keys = out.map((m) => m.key);
    expect(new Set(keys).size).toBe(keys.length);
    // stabil sortiert (Behörde → key)
    const sortiert = [...out].sort((a, b) => a.behoerdeKuerzel.localeCompare(b.behoerdeKuerzel) || a.key.localeCompare(b.key));
    expect(out.map((m) => m.key)).toEqual(sortiert.map((m) => m.key));
  });
});

describe('Tor 4 — Bidirektionalität Norm ↔ Entscheid', () => {
  it('jeder über proNorm[K] erreichte Entscheid nennt K in seinen normKeys zurück', () => {
    const verstoesse: string[] = [];
    for (const [normKey, refs] of Object.entries(normIndex.proNorm)) {
      for (const r of refs) {
        const nk = normKeysVonEntscheid.get(r.key);
        // Entscheid muss im Manifest existieren UND die Norm zurücknennen.
        if (!nk) { verstoesse.push(`${normKey} → ${r.key}: nicht im Manifest`); continue; }
        if (!nk.has(normKey)) verstoesse.push(`${normKey} → ${r.key}: nennt ${normKey} nicht zurück`);
      }
    }
    expect(verstoesse).toEqual([]);
  });

  it('jeder proNorm-Schlüssel ist ein registrierter Erlass (kein toter Norm-Link)', () => {
    const unbekannt = Object.keys(normIndex.proNorm).filter((k) => !erlassKeys.has(k));
    expect(unbekannt).toEqual([]);
  });
});
