import { describe, it, expect } from 'vitest';
import type { BrowseErlass } from '../lib/normtext/browse-typen';
import {
  vergleicheRelevanz, nachRelevanz, kantonKernRang, nachKantonRelevanz,
  intlSachziffer, KANTON_KERN_KATEGORIEN,
} from '../lib/normtext/relevanz';

// Minimaler BrowseErlass-Fabrikant (reine Anzeige-Sortierung, §3).
function e(p: Partial<BrowseErlass> & Pick<BrowseErlass, 'key'>): BrowseErlass {
  return {
    ebene: 'bund', kanton: null, kuerzel: p.key, titel: p.key, sr: null,
    rechtsgebiet: 'privat', sprache: 'de', rang: 0, status: 'snapshot',
    datei: null, artikelAnzahl: 0, stand: '2026-01-01', quelleUrl: '',
    fassungsToken: '', pdfPfad: null, ...p,
  };
}

describe('relevanz — Bund/International (kuratierter Leitgesetz-Rang)', () => {
  it('sortiert nach rang (Leitgesetze zuerst), dann Volltext, dann Kürzel', () => {
    const bv = e({ key: 'BV', rechtsgebiet: 'oeffentlich', rang: 0 });
    const zgb = e({ key: 'ZGB', rang: 1 });
    const stub = e({ key: 'XYZ', rang: 50, status: 'nur-live-link' });
    const sortiert = nachRelevanz([stub, zgb, bv]).map((x) => x.key);
    expect(sortiert).toEqual(['BV', 'ZGB', 'XYZ']);
  });

  it('bei gleichem rang: in-App lesbar vor reinem Live-Link', () => {
    const a = e({ key: 'A', rang: 5, status: 'nur-live-link' });
    const b = e({ key: 'B', rang: 5, status: 'snapshot' });
    expect(vergleicheRelevanz(a, b)).toBeGreaterThan(0); // B (lesbar) vor A
  });

  it('mutiert die Eingabe nicht', () => {
    const eingabe = [e({ key: 'B', rang: 2 }), e({ key: 'A', rang: 1 })];
    const kopie = [...eingabe];
    nachRelevanz(eingabe);
    expect(eingabe.map((x) => x.key)).toEqual(kopie.map((x) => x.key));
  });
});

describe('relevanz — Kanton Kern-Kategorien (A14, dokumentiert-deterministisch)', () => {
  it('erkennt Davids Kern-Erlasse in der genannten Reihenfolge', () => {
    expect(kantonKernRang({ titel: 'Verfassung des Kantons Zürich', kuerzel: 'KV' })).toBe(0);
    expect(kantonKernRang({ titel: 'Kantonsverfassung', kuerzel: 'x' })).toBe(0);
    expect(kantonKernRang({ titel: 'Einführungsgesetz zum ZGB', kuerzel: 'EG ZGB' })).toBe(1);
    expect(kantonKernRang({ titel: 'Gesetz über die Gerichtsorganisation', kuerzel: 'GOG' })).toBe(2);
    expect(kantonKernRang({ titel: 'Steuergesetz', kuerzel: 'StG' })).toBe(3);
    expect(kantonKernRang({ titel: 'Verordnung über die Gebührenverordnung', kuerzel: 'x' })).toBe(3);
  });

  it('vergibt keinen Kern-Rang an gewöhnliche Erlasse (keine geratene Wichtigkeit)', () => {
    const keiner = KANTON_KERN_KATEGORIEN.length;
    expect(kantonKernRang({ titel: 'Gesetz über den Wald', kuerzel: 'WaldG' })).toBe(keiner);
    // Anker-fest: «Verordnung über das Verfassungsgericht» ist KEINE Verfassung.
    expect(kantonKernRang({ titel: 'Verordnung über das Verfassungsgericht', kuerzel: 'x' })).toBe(keiner);
  });

  it('zieht die Kern-Erlasse eines Kantons zuerst, dann den Rest', () => {
    const wald = e({ key: 'ZH-921', ebene: 'kanton', titel: 'Waldgesetz', sr: '921' });
    const kv = e({ key: 'ZH-101', ebene: 'kanton', titel: 'Verfassung des Kantons Zürich', kuerzel: 'KV', sr: '101' });
    const stg = e({ key: 'ZH-631', ebene: 'kanton', titel: 'Steuergesetz', sr: '631' });
    const sortiert = nachKantonRelevanz([wald, stg, kv], undefined).map((x) => x.key);
    expect(sortiert[0]).toBe('ZH-101'); // Verfassung zuerst
    expect(sortiert[1]).toBe('ZH-631'); // Steuergesetz vor Waldgesetz
    expect(sortiert[2]).toBe('ZH-921');
  });
});

// ─── F5/K-1f · DIE KERN-KATEGORIEN SPRECHEN AUCH FRANZÖSISCH UND ITALIENISCH ─
//
// Die A14-Muster waren rein deutschsprachig. GEMESSEN 31.8.2026 an
// `public/normtext/register.json`: 39 der 1231 kantonalen Erlasse stammen aus
// den lateinischen Kantonen (FR GE JU NE TI VD VS) und trugen darum PAUSCHAL
// «keine Kern-Kategorie» — ein Genfer Gerichtskostentarif rutschte hinter jede
// beliebige Zürcher Verordnung, obwohl er in der Deutschschweiz zuoberst stünde.
// Dazu kamen die vier Aargauer Erlasse, deren Erlassform «Dekret» heisst
// («Gebührendekret», «Dekret über den Notariatstarif») und die deshalb an
// `gebührenverordnung|gebührengesetz|…` vorbeiliefen.
//
// Die Titel unten sind WÖRTLICH aus dem committeten Manifest (§7: keine
// erfundenen Fälle) — MIT EINER MARKIERTEN AUSNAHME: «Legge tributaria» ist
// ein synthetischer Vorrats-Fall (0 Bestandstreffer am 31.8.2026, erwartete
// Form für den Vollkorpus-Ausbau K-G5; Gegenprüfung 31.8., Befund 4). Die Kategorie-Zuordnung folgt der Sache, nicht der Sprache:
// «émolument», «tariffa», «tarif des frais» und der Anwalts-/Notariatstarif sind
// Gebühren- bzw. Kostenrecht.
describe('relevanz — Kanton Kern-Kategorien fr/it + Aargauer Dekrete (F5/K-1f)', () => {
  const GEBUEHREN = 3; // Index von 'steuern-gebuehren' in KANTON_KERN_KATEGORIEN
  const ORGANISATION = 2;

  it.each([
    ['FR', 'Tarif des émoluments des notaires (RSF 261.16)', 'Tarif des émoluments des notaires'],
    ['FR', 'Tarif des émoluments fixes du registre foncier (RSF 214.5.16)', 'x'],
    ['GE', 'Règlement fixant le tarif des frais en matière civile (RTFMC) (rsGE E 1 05.10)', 'x'],
    ['GE', 'Règlement émoluments registre foncier (REmORFDIT) (RSG E 1 50.06)', 'x'],
    ['JU', 'Décret fixant les émoluments judiciaires (RSJU 176.511)', 'x'],
    ['JU', "Ordonnance fixant le tarif des honoraires d'avocat (RSJU 188.61)", 'x'],
    ['NE', 'Loi fixant le tarif des frais (LTFrais) (RSN 164.1)', 'LTFrais'],
    ['NE', 'Loi sur l’émolument du registre foncier (LERF) (RSN 215.411.6)', 'x'],
    ['TI', 'Legge sulla tariffa giudiziaria (LTG) (RL 178.200)', 'x'],
    ['TI', 'Tariffa dell’Ordine degli avvocati (onorari) (RL 178.310)', 'x'],
    ['TI', 'Legge sulle tasse e gli emolumenti del registro fondiario (LTORF) (RL 216.200)', 'x'],
    ['TI', 'Legge tributaria', 'LT'], // synthetischer Vorrats-Fall, s. Kopfkommentar
    ['VD', 'Tarif des dépens en matière civile (TDC) (BLV 270.11.6)', 'x'],
    ['VD', 'Tarif des notaires (TNo) (BLV 178.11.2)', 'x'],
    ['VS', 'Loi fixant le tarif des frais et dépens devant les autorités judiciaires ou administratives', 'LTar'],
    ['VS', 'Gesetz betreffend den Tarif der Kosten und Entschädigungen vor Gerichts- oder Verwaltungsbehörden', 'GTar'],
    ['AG', 'Dekret über die Entschädigung der Anwälte', 'Anwaltstarif'],
    ['AG', 'Gebührendekret', 'GebührD'],
    ['AG', 'Dekret über den Notariatstarif (SAR 295.250)', 'Dekret über den Notariatstarif'],
    ['AG', 'Gesetz über die Grundbuchabgaben', 'GBAG'],
  ])('%s · «%s» ist Gebühren-/Tarifrecht', (_kt, titel, kuerzel) => {
    expect(kantonKernRang({ titel, kuerzel })).toBe(GEBUEHREN);
  });

  it.each([
    ['FR', 'Règlement sur la justice', 'RJ'],
    ['FR', 'Justizreglement', 'JR'],
  ])('%s · «%s» ist Gerichts-/Behördenorganisation', (_kt, titel, kuerzel) => {
    expect(kantonKernRang({ titel, kuerzel })).toBe(ORGANISATION);
  });

  it('vergibt auch fr/it KEINEN Kern-Rang an gewöhnliche Erlasse', () => {
    const keiner = KANTON_KERN_KATEGORIEN.length;
    // Grundbuchrecht ist im Deutschen keine Kern-Kategorie — im Französischen
    // darf es dann auch keine sein (gleiche Sache, gleiche Behandlung, §8).
    expect(kantonKernRang({ titel: 'Loi sur le registre foncier (LRF)', kuerzel: 'LRF' })).toBe(keiner);
    expect(kantonKernRang({ titel: 'Ordonnance cantonale sur le registre foncier', kuerzel: 'OcRF' })).toBe(keiner);
    expect(kantonKernRang({ titel: 'Legge sulla protezione dei dati', kuerzel: 'x' })).toBe(keiner);
    expect(kantonKernRang({ titel: 'Loi sur les droits de mutation (LMSD)', kuerzel: 'LMSD' })).toBe(keiner);
    // Die deutschen Bestandsfälle bleiben unberührt.
    expect(kantonKernRang({ titel: 'Gesetz über den Wald', kuerzel: 'WaldG' })).toBe(keiner);
    expect(kantonKernRang({ titel: 'Dekret über die Fischerei', kuerzel: 'FischD' })).toBe(keiner);
  });
});

describe('relevanz — International SR-0.*-Sachziffer (A15 Rechtsgebiet)', () => {
  it('liest die erste SR-0.*-Ziffer, EU-Recht (ohne SR) → null', () => {
    expect(intlSachziffer('0.101')).toBe('1');       // EMRK
    expect(intlSachziffer('0.275.12')).toBe('2');    // LugÜ
    expect(intlSachziffer('0.748.0')).toBe('7');     // ICAO
    expect(intlSachziffer(null)).toBeNull();         // EU-Verordnung
    expect(intlSachziffer('220')).toBeNull();        // kein Völkerrecht
  });
});
