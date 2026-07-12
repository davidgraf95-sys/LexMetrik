// Tests des geteilten Verfalls-Register-Parsers (scripts/verfall-parse.ts).
// Sichert die Datums-Grammatik, von der Deploy-Tor (check:verfall) UND
// UI-Generator (gen:verfall) gemeinsam abhängen (§5).
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { parseZelle, sammleTermine, registerStand, iso } from '../../scripts/verfall-parse.ts';

const REGISTER = resolve(__dirname, '../../bibliothek/register/parameter-verfall.md');
const md = readFileSync(REGISTER, 'utf8');
const { termine, manuell } = sammleTermine(md);
const datumVon = (teil: string) => termine.find((t) => t.label.includes(teil))?.datum;

describe('parseZelle — Datums-Grammatik', () => {
  it('liest den exakten Tag (auch fett/mit Zusatz)', () => {
    expect(parseZelle('**1.11.2026 (BE!)**')).toBe('2026-11-01');
  });
  it('liest Monatsname + Jahr als 1. des Monats', () => {
    expect(parseZelle('Anfang Sept. 2026')).toBe('2026-09-01');
    expect(parseZelle('Jan. 2027')).toBe('2027-01-01');
    expect(parseZelle('Juni 2027')).toBe('2027-06-01');
  });
  it('nimmt den FRÜHESTEN Termin, wenn mehrere genannt sind', () => {
    expect(parseZelle('Jan. 2027 (ZH halbjährlich, s. eigene Zeile)')).toBe('2027-01-01');
  });
  it('gibt null für manuelle Zellen', () => {
    for (const z of ['—', 'offen (kantonale Erlasse)', 'bei Nutzerbedarf', 'vor Verdrahtung', 'mit nächstem HRegV-Pin']) {
      expect(parseZelle(z)).toBeNull();
    }
  });
  it('iso normalisiert auf YYYY-MM-DD', () => {
    expect(iso(2026, 6, 7)).toBe('2026-06-07');
  });
});

describe('sammleTermine — gegen das echte Register', () => {
  it('SG-GKV-Nachfolgefassung 1.7.2026 aufgelöst → kein Verfall-Termin mehr (S0-Kern erledigt)', () => {
    // Am 1.7.2026 verifiziert: LexWork current_version 3863 in Vollzug seit
    // 1.7.2026 (Nachtrag 5.12.2025, nGS 2026-001), Art. 10/11 wortgleich → die
    // «bis 30.6.2026»-Freitext-Frist ist aufgelöst und trägt keinen Termin mehr.
    const sg = termine.find((t) => t.label.includes('SG Gerichtskostenverordnung'));
    expect(sg).toBeUndefined();
  });
  it('erfasst die weiteren datierten Verfälle aus «Pflege & Termine»', () => {
    expect(datumVon('Referenzzinssatz')).toBe('2026-09-01'); // Anfang Sept.
    expect(datumVon('Formularpflicht-Kantone')).toBe('2026-11-01'); // BE 1.11.2026
    expect(datumVon('GR Honorarverordnung')).toBe('2026-12-31');
    expect(datumVon('BE EAV')).toBe('2026-12-31');
  });
  it('trägt für Tabellen-Termine Fundstelle/Wert/Rhythmus', () => {
    const ref = termine.find((t) => t.label.includes('Referenzzinssatz'));
    expect(ref?.quelle).toBe('Tabelle');
    expect(ref?.fundstelle).toContain('mietvertrag.ts');
    expect(ref?.rhythmus).toContain('quartalsweise');
  });
  it('legt undatierte Einträge als manuell ab (nie als Termin)', () => {
    expect(manuell.some((m) => m.startsWith('MWST-Normalsatz '))).toBe(true);
    expect(termine.some((t) => t.label === 'MWST-Normalsatz')).toBe(false);
  });
  it('alle Termine tragen ein vergleichbares ISO-Datum', () => {
    expect(termine.length).toBeGreaterThan(0);
    for (const t of termine) expect(t.datum).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe('registerStand', () => {
  it('liest die Stand-Zeile des Registers', () => {
    expect(registerStand(md)).toContain('11.7.2026');
  });
});
