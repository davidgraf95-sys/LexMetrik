import { describe, it, expect } from 'vitest';
import { pruefeBeSprengel } from '../../scripts/zustaendigkeit/be-sprengel-pruefung';
import {
  beRegionalgerichte, beSprengelFuerBfsNr, beSprengelFuerGemeinde, beSprengelHerkunft, beStaatsanwaltschaften,
} from '../lib/zustaendigkeit/beSprengel';

// ─── BE-Sprengel (K-15) ─────────────────────────────────────────────────────
// Quelle der Tabelle: amtliche Geodaten ADMRG/ADMRSA/GRENZ5 des Amts für
// Geoinformation BE (Stand 1.1.2026); Normbasis Art. 80/81/92 GSOG (BSG 161.1,
// Fassung in Kraft seit 1.5.2026). Herleitung und Messprotokoll:
// bibliothek/behoerden/be-sprengel-geodaten-2026-09-12.md
//
// Dieser Test IST das merge-blockierende Tor (§6.7): `pruefeBeSprengel` trägt
// dieselben Invarianten wie das lokale `npm run check:be-sprengel`.

describe('BE-Sprengel — Invarianten der generierten Tabelle', () => {
  const befund = pruefeBeSprengel();

  it('Form, Schlüssel, Deckung, Einklang und Deckel sind in Ordnung', () => {
    expect(befund.fehler, befund.fehler.join('\n')).toEqual([]);
  });

  it('deckt alle BE-Gemeinden des amtlichen PLZ-Verzeichnisses ab', () => {
    expect(befund.gemeinden).toBe(befund.deckungPlz);
    expect(befund.gemeinden).toBeGreaterThan(300);
  });

  it('vier Gerichtsregionen (Art. 80 Abs. 1 GSOG) und vier Staatsanwaltschaften (Art. 92 Abs. 1 GSOG)', () => {
    expect(befund.regionen).toBe(4);
    expect(befund.staatsanwaltschaften).toBe(4);
  });

  it('jeder Verwaltungskreis liegt ganz in einem Sprengel (Art. 80 Abs. 2 GSOG)', () => {
    expect(befund.kreise).toBe(10);
  });
});

describe('BE-Sprengel — Stichprobe gegen die amtliche Zuordnung', () => {
  // Je Gemeinde: BFS-Nummer, amtlicher Verwaltungskreis (GRENZ5, Stand
  // 1.1.2026) und die daraus nach Art. 80 Abs. 2 GSOG folgende Gerichtsregion.
  // Berner Jura-Seeland trägt zusätzlich die Standort-Erwartung: der
  // Verwaltungskreis Jura bernois wird von der Aussenstelle bedient
  // (Art. 81 Abs. 1 GSOG), die übrigen vom Sitz in Biel.
  const proben: [number, string, string, string, string | null][] = [
    [351, 'Bern', 'Bern-Mittelland', 'Bern-Mittelland', null],
    [355, 'Köniz', 'Bern-Mittelland', 'Bern-Mittelland', null],
    [363, 'Ostermundigen', 'Bern-Mittelland', 'Bern-Mittelland', null],
    [404, 'Burgdorf', 'Emmental', 'Emmental-Oberaargau', null],
    [902, 'Langnau im Emmental', 'Emmental', 'Emmental-Oberaargau', null],
    [329, 'Langenthal', 'Oberaargau', 'Emmental-Oberaargau', null],
    [942, 'Thun', 'Thun', 'Oberland', null],
    [581, 'Interlaken', 'Interlaken-Oberhasli', 'Oberland', null],
    [843, 'Saanen', 'Obersimmental-Saanen', 'Oberland', null],
    [563, 'Frutigen', 'Frutigen-Niedersimmental', 'Oberland', null],
    [371, 'Biel/Bienne', 'Biel/Bienne', 'Berner Jura-Seeland', null],
    [743, 'Nidau', 'Biel/Bienne', 'Berner Jura-Seeland', null],
    [306, 'Lyss', 'Seeland', 'Berner Jura-Seeland', null],
    [443, 'Saint-Imier', 'Jura bernois', 'Berner Jura-Seeland', 'Agence du Jura bernois'],
    [446, 'Tramelan', 'Jura bernois', 'Berner Jura-Seeland', 'Agence du Jura bernois'],
    [690, 'Court', 'Jura bernois', 'Berner Jura-Seeland', 'Agence du Jura bernois'],
    [723, 'La Neuveville', 'Jura bernois', 'Berner Jura-Seeland', 'Agence du Jura bernois'],
  ];

  for (const [bfs, name, kreis, region, aussenstelle] of proben) {
    it(`${name} (BFS ${bfs}, Verwaltungskreis ${kreis}) → Regionalgericht ${region}`, async () => {
      const ueberNummer = await beSprengelFuerBfsNr(bfs);
      expect(ueberNummer, name).not.toBeNull();
      expect(ueberNummer!.gemeinde).toBe(name);
      expect(ueberNummer!.gericht.region).toBe(region);
      expect(ueberNummer!.gericht.aussenstelle).toBe(aussenstelle);
      expect(ueberNummer!.staatsanwaltschaft.region).toBe(region);
      // Der Name muss auf dasselbe Ergebnis führen wie die BFS-Nummer.
      const ueberName = await beSprengelFuerGemeinde(name);
      expect(ueberName).toEqual(ueberNummer);
    });
  }

  it('Moutier ist seit dem Kantonswechsel (1.1.2026) nicht mehr enthalten', async () => {
    expect(await beSprengelFuerGemeinde('Moutier')).toBeNull();
  });
});

describe('BE-Sprengel — Auflösung und Offenlegung', () => {
  it('Zivil- und Strafabteilung Bern-Mittelland tragen verschiedene Adressen (amtlich getrennt)', async () => {
    const bern = await beSprengelFuerBfsNr(351);
    expect(bern!.gericht.zivil.adresse).toBe('Effingerstrasse 34');
    expect(bern!.gericht.zivil.plzOrt).toBe('3008 Bern');
    expect(bern!.gericht.straf.adresse).toContain('Hodlerstrasse 7');
    expect(bern!.gericht.zivil.adresse).not.toBe(bern!.gericht.straf.adresse);
  });

  it('Schreibweisen-Varianten lösen auf, Unbekanntes bleibt null (kein Fuzzy-Matching)', async () => {
    expect(await beSprengelFuerGemeinde('  bern  ')).not.toBeNull();
    expect(await beSprengelFuerGemeinde('Lyss (BE)')).not.toBeNull();
    expect(await beSprengelFuerGemeinde('Zürich')).toBeNull();
    expect(await beSprengelFuerGemeinde('')).toBeNull();
    expect(await beSprengelFuerBfsNr(1)).toBeNull();
  });

  it('legt Stand, Abrufdatum, Lizenz und Live-Links offen (§7)', async () => {
    const h = await beSprengelHerkunft();
    expect(h.stand).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(h.abgerufen).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(h.lizenz).toBe('Freie Nutzung. Quellenangabe ist Pflicht.');
    expect(h.normUrl).toMatch(/^https:\/\//);
    expect(h.datensaetze.map((d) => d.code)).toEqual(['ADMRG', 'ADMRSA', 'GRENZ5']);
  });

  it('führt fünf Gerichtsstandorte (vier Sitze + Aussenstelle Berner Jura) und vier Staatsanwaltschaften', async () => {
    const g = await beRegionalgerichte();
    expect(g).toHaveLength(5);
    expect(g.filter((x) => x.aussenstelle !== null)).toHaveLength(1);
    expect(await beStaatsanwaltschaften()).toHaveLength(4);
  });
});
